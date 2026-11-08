import { EventEmitter } from 'node:events'
import { createRequire } from 'node:module'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PluginSandbox } from '@main/core/plugin-sandbox'

const pluginPath = path.resolve(__dirname, '../../src/plugins/obs/index.js')
const pluginRequire = createRequire(pluginPath)
const obsModuleId = pluginRequire.resolve('obs-websocket-js')

// Mirrors the obs-websocket-js v5 behaviour that matters here: a failed
// connect() emits ConnectionClosed *and* rejects, and connecting over an open
// socket closes it first.
class FakeOBSWebSocket extends EventEmitter {
  static instances: FakeOBSWebSocket[] = []
  static reachable = false
  static connectCalls = 0
  connected = false

  constructor() {
    super()
    FakeOBSWebSocket.instances.push(this)
  }

  async connect() {
    FakeOBSWebSocket.connectCalls++
    if (this.connected) {
      this.connected = false
      this.emit('ConnectionClosed', new Error('replaced'))
    }
    if (!FakeOBSWebSocket.reachable) {
      this.emit('ConnectionClosed', new Error('closed'))
      throw new Error('connect ECONNREFUSED 127.0.0.1:4455')
    }
    this.connected = true
    return {}
  }

  async disconnect() {
    if (this.connected) {
      this.connected = false
      this.emit('ConnectionClosed', new Error('disconnected'))
    }
  }

  async call() {
    return {}
  }
}

type ObsPlugin = {
  initialize: (context: unknown) => Promise<void>
  startListening: () => Promise<void>
  stopListening: () => Promise<void>
  onConfigUpdate: (config: Record<string, unknown>) => Promise<void>
  executeAction: (actionId: string, params?: unknown) => Promise<void>
}

const createStore = (initial: Record<string, unknown> = {}) => {
  const values = new Map(Object.entries(initial))
  return {
    get: (key: string) => values.get(key),
    set: (key: string, value: unknown) => void values.set(key, value),
    delete: (key: string) => void values.delete(key),
  }
}

// Loaded through the same sandbox the PluginManager uses, so the plugin sees
// the sandbox's timers (faked when a test installs fake timers first).
const loadPlugin = async () => {
  const sandbox = new PluginSandbox(pluginPath, { allowedPackages: ['obs-websocket-js'] })
  const plugin = (await sandbox.load('obs')) as unknown as ObsPlugin
  const emitStatus = vi.fn()
  await plugin.initialize({
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    emitStatus,
    emitTrigger: vi.fn(),
    emitError: vi.fn(),
    storage: {
      config: createStore({ mode: 'live', autoReconnect: true }),
      secrets: createStore(),
    },
  })
  return { plugin, emitStatus }
}

const retriesScheduled = (emitStatus: ReturnType<typeof vi.fn>) =>
  emitStatus.mock.calls.filter(([status]) => String(status?.message).startsWith('Retrying')).length

const flush = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve()
}

describe('OBS plugin live reconnect', () => {
  beforeEach(() => {
    FakeOBSWebSocket.instances = []
    FakeOBSWebSocket.reachable = false
    FakeOBSWebSocket.connectCalls = 0
    pluginRequire.cache[obsModuleId] = {
      id: obsModuleId,
      filename: obsModuleId,
      loaded: true,
      exports: { default: FakeOBSWebSocket },
    } as unknown as NodeModule
  })

  afterEach(() => {
    vi.useRealTimers()
    delete pluginRequire.cache[obsModuleId]
  })

  it('startListening returns while OBS is unreachable instead of blocking plugin load', async () => {
    const { plugin } = await loadPlugin()
    const outcome = await Promise.race([
      plugin.startListening().then(() => 'resolved'),
      new Promise((resolve) => setTimeout(() => resolve('still pending'), 200)),
    ])
    await plugin.stopListening()
    expect(outcome).toBe('resolved')
  })

  it('a failed connect schedules exactly one retry', async () => {
    const { plugin, emitStatus } = await loadPlugin()
    void plugin.startListening()
    await flush()
    expect(FakeOBSWebSocket.connectCalls).toBe(1)
    // ConnectionClosed and the rejected connect() must not each start a loop
    expect(retriesScheduled(emitStatus)).toBe(1)
    await plugin.stopListening()
  })

  it('retries one attempt at a time with backoff until OBS comes up', async () => {
    vi.useFakeTimers()
    const { plugin, emitStatus } = await loadPlugin()
    await plugin.startListening()
    expect(FakeOBSWebSocket.connectCalls).toBe(1)

    await vi.advanceTimersByTimeAsync(2000)
    expect(FakeOBSWebSocket.connectCalls).toBe(2)
    await vi.advanceTimersByTimeAsync(3999)
    expect(FakeOBSWebSocket.connectCalls).toBe(2)

    FakeOBSWebSocket.reachable = true
    await vi.advanceTimersByTimeAsync(1)
    expect(FakeOBSWebSocket.connectCalls).toBe(3)
    expect(emitStatus).toHaveBeenLastCalledWith({ state: 'connected', message: 'Connected to OBS' })

    await vi.advanceTimersByTimeAsync(120_000)
    expect(FakeOBSWebSocket.connectCalls).toBe(3)
    await plugin.stopListening()
  })

  it('a dropped connection reconnects once, and a manual refresh does not queue a stray retry', async () => {
    vi.useFakeTimers()
    FakeOBSWebSocket.reachable = true
    const { plugin, emitStatus } = await loadPlugin()
    await plugin.startListening()
    const client = FakeOBSWebSocket.instances[0]

    await plugin.executeAction('connection.refresh')
    expect(FakeOBSWebSocket.connectCalls).toBe(2)
    expect(retriesScheduled(emitStatus)).toBe(0)

    await client.disconnect()
    expect(retriesScheduled(emitStatus)).toBe(1)
    await vi.advanceTimersByTimeAsync(2000)
    expect(FakeOBSWebSocket.connectCalls).toBe(3)
    expect(client.connected).toBe(true)
    await plugin.stopListening()
  })

  it('stopping or restarting the plugin cancels a pending retry', async () => {
    vi.useFakeTimers()
    const { plugin } = await loadPlugin()
    await plugin.startListening()
    await plugin.onConfigUpdate({ mode: 'live', autoReconnect: true })
    expect(FakeOBSWebSocket.connectCalls).toBe(2)

    await plugin.stopListening()
    await vi.advanceTimersByTimeAsync(120_000)
    expect(FakeOBSWebSocket.connectCalls).toBe(2)
  })
})
