import { EventEmitter } from 'node:events'
import { createRequire } from 'node:module'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PluginSandbox } from '@main/core/plugin-sandbox'

const pluginPath = path.resolve(__dirname, '../../src/plugins/twitch/index.js')
const pluginRequire = createRequire(pluginPath)
const tmiId = pluginRequire.resolve('tmi.js')

class FakeTmiClient extends EventEmitter {
  async connect() {}
  async disconnect() {}
  async say() {}
}

type TwitchPlugin = {
  initialize: (context: unknown) => Promise<void>
  startListening: () => Promise<void>
  stopListening: () => Promise<void>
  executeAction: (actionId: string, params?: unknown) => Promise<void>
}

const START = Date.parse('2026-03-01T12:00:00Z')
const POLL_MS = 60_000

const json = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })

describe('Twitch plugin follower polling', () => {
  let followers: Array<{ user_id: string; user_name: string; followed_at: string }>
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(START)
    pluginRequire.cache[tmiId] = {
      id: tmiId,
      filename: tmiId,
      loaded: true,
      exports: { Client: FakeTmiClient },
    } as unknown as NodeModule

    // Followers who followed long before the app started, newest first.
    followers = [
      { user_id: '2', user_name: 'old_fan_2', followed_at: '2025-12-24T10:00:00Z' },
      { user_id: '1', user_name: 'old_fan_1', followed_at: '2024-06-01T10:00:00Z' },
    ]
    fetchMock = vi.fn(async (input: unknown) => {
      const url = new URL(String(input))
      if (url.pathname === '/helix/users') {
        const login = url.searchParams.get('login')
        return json({ data: [{ id: `id-${login}`, login, created_at: '2019-01-01T00:00:00Z' }] })
      }
      if (url.pathname === '/helix/channels/followers') {
        return json({ data: followers })
      }
      throw new Error(`unexpected request ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    delete pluginRequire.cache[tmiId]
  })

  const startPlugin = async () => {
    const config = new Map<string, unknown>([
      ['connection', { mode: 'live', channel: 'jujutest', username: 'jujubot', clientId: 'cid', pollIntervalMs: POLL_MS }],
    ])
    const secrets = new Map<string, unknown>([['accessToken', 'token']])
    const accessor = (store: Map<string, unknown>) => ({
      get: (key: string) => store.get(key),
      set: (key: string, value: unknown) => void store.set(key, value),
      delete: (key: string) => void store.delete(key),
    })
    const emitTrigger = vi.fn()
    const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    const sandbox = new PluginSandbox(pluginPath, { allowedPackages: ['tmi.js'] })
    const plugin = (await sandbox.load('twitch')) as unknown as TwitchPlugin
    await plugin.initialize({
      logger,
      emitStatus: vi.fn(),
      emitTrigger,
      emitError: vi.fn(),
      storage: { config: accessor(config), secrets: accessor(secrets) },
    })
    await plugin.startListening()
    expect(logger.error).not.toHaveBeenCalled()
    const follows = () =>
      emitTrigger.mock.calls.filter(([trigger]) => trigger === 'channel.follow').map(([, data]) => data.user)
    return { plugin, follows }
  }

  it('does not replay existing followers as new follows when it starts', async () => {
    const { plugin, follows } = await startPlugin()

    await vi.advanceTimersByTimeAsync(POLL_MS)
    expect(fetchMock.mock.calls.some(([u]) => String(u).includes('/channels/followers'))).toBe(true)
    expect(follows()).toEqual([])

    await plugin.stopListening()
  })

  it('announces each follow that happens after start exactly once', async () => {
    const { plugin, follows } = await startPlugin()
    await vi.advanceTimersByTimeAsync(POLL_MS)

    followers.unshift({ user_id: '3', user_name: 'new_fan', followed_at: new Date(Date.now() - 1000).toISOString() })
    await vi.advanceTimersByTimeAsync(POLL_MS)
    await vi.advanceTimersByTimeAsync(POLL_MS)
    expect(follows()).toEqual(['new_fan'])

    await plugin.stopListening()
  })

  it('resolves the broadcaster again when reconfigured to another channel', async () => {
    const { plugin } = await startPlugin()
    await plugin.executeAction('connection.configure', { channel: 'otherchannel' })
    fetchMock.mockClear()

    await vi.advanceTimersByTimeAsync(POLL_MS)
    const followerCall = fetchMock.mock.calls.map(([u]) => new URL(String(u))).find((u) => u.pathname === '/helix/channels/followers')
    expect(followerCall?.searchParams.get('broadcaster_id')).toBe('id-otherchannel')

    await plugin.stopListening()
  })
})
