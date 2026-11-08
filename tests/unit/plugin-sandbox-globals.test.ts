import { EventEmitter } from 'node:events'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path, { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PluginSandbox } from '@main/core/plugin-sandbox'

describe('PluginSandbox web globals', () => {
  it('exposes URL, URLSearchParams, fetch and AbortController to plugin code', async () => {
    const root = mkdtempSync(join(tmpdir(), 'juju22-sandbox-globals-'))
    try {
      const entry = join(root, 'index.js')
      writeFileSync(
        entry,
        `module.exports = {
  probe() {
    const url = new URL('https://api.example.test/helix/users')
    url.searchParams.set('login', 'juju')
    const body = new URLSearchParams({ grant_type: 'refresh_token' }).toString()
    return { url: url.toString(), body, fetch: typeof fetch, abort: typeof new AbortController().abort }
  },
}
`,
      )
      const plugin = (await new PluginSandbox(entry).load('globals')) as unknown as {
        probe: () => Record<string, string>
      }
      expect(plugin.probe()).toEqual({
        url: 'https://api.example.test/helix/users?login=juju',
        body: 'grant_type=refresh_token',
        fetch: 'function',
        abort: 'function',
      })
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})

describe('Twitch plugin live mode inside the sandbox', () => {
  const pluginPath = path.resolve(__dirname, '../../src/plugins/twitch/index.js')
  const pluginRequire = createRequire(pluginPath)
  const tmiId = pluginRequire.resolve('tmi.js')

  class FakeTmiClient extends EventEmitter {
    async connect() {}
    async disconnect() {}
    async say() {}
  }

  afterEach(() => {
    vi.unstubAllGlobals()
    delete pluginRequire.cache[tmiId]
  })

  it('resolves the broadcaster over Helix and stays live instead of falling back to mock', async () => {
    pluginRequire.cache[tmiId] = {
      id: tmiId,
      filename: tmiId,
      loaded: true,
      exports: { Client: FakeTmiClient },
    } as unknown as NodeModule

    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ data: [{ id: '4242', created_at: '2020-01-01T00:00:00Z' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const config = new Map<string, unknown>([
      ['connection', { mode: 'live', channel: 'jujutest', username: 'jujubot', clientId: 'client-id' }],
    ])
    const secrets = new Map<string, unknown>([['accessToken', 'token']])
    const accessor = (store: Map<string, unknown>) => ({
      get: (key: string) => store.get(key),
      set: (key: string, value: unknown) => void store.set(key, value),
      delete: (key: string) => void store.delete(key),
    })
    const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    const emitStatus = vi.fn()

    const sandbox = new PluginSandbox(pluginPath, { allowedPackages: ['tmi.js'], allowedModules: ['tmi.js'] })
    const plugin = (await sandbox.load('twitch')) as unknown as {
      initialize: (context: unknown) => Promise<void>
      startListening: () => Promise<void>
      stopListening: () => Promise<void>
    }
    await plugin.initialize({
      logger,
      emitStatus,
      emitTrigger: vi.fn(),
      emitError: vi.fn(),
      storage: { config: accessor(config), secrets: accessor(secrets) },
    })

    try {
      await plugin.startListening()

      expect(logger.error).not.toHaveBeenCalled()
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(String((fetchMock.mock.calls[0] as unknown[])[0])).toBe(
        'https://api.twitch.tv/helix/users?login=jujutest',
      )
      expect(emitStatus).toHaveBeenLastCalledWith({ state: 'connected', message: 'Connected to Twitch' })
      expect((config.get('connection') as { mode: string }).mode).toBe('live')
    } finally {
      await plugin.stopListening()
    }
  })
})
