const manifest = require('./manifest.json')
const { setTimeout: sleep } = require('node:timers/promises')

let OBSWebSocket
try {
  // Defer requiring obs-websocket-js so the plugin can still run in mock mode when the dependency is missing
  OBSWebSocket = require('obs-websocket-js').default ?? require('obs-websocket-js')
} catch {
  OBSWebSocket = null
}

const DEFAULT_CONFIG = Object.freeze({
  mode: 'mock',
  host: '127.0.0.1',
  port: 4455,
  useSsl: false,
  autoReconnect: true,
})

class ObsMockRuntime {
  constructor(context) {
    this.context = context
    this.currentScene = 'Intro'
    this.isStreaming = false
    this.interval = null
  }

  async start() {
    this.context.logger.info('OBS plugin running in mock mode')
    if (this.interval) return
    this.interval = setInterval(() => {
      const scenes = ['Intro', 'Gameplay', 'Be Right Back', 'Ending']
      const nextScene = scenes[Math.floor(Math.random() * scenes.length)]
      if (nextScene !== this.currentScene) {
        this.currentScene = nextScene
        this.context.emitTrigger('scene.changed', {
          sceneName: this.currentScene,
          source: 'mock-schedule',
        })
      }
    }, 15000)
  }

  async stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  async executeAction(actionId, params = {}) {
    switch (actionId) {
      case 'scene.switch': {
        const { sceneName } = params
        if (!sceneName) {
          throw new Error('scene.switch requires sceneName')
        }
        this.currentScene = sceneName
        this.context.emitTrigger('scene.changed', {
          sceneName,
          source: 'action',
        })
        this.context.logger.info('OBS (mock) scene switched', { sceneName })
        break
      }
      case 'stream.start': {
        if (this.isStreaming) {
          this.context.logger.warn('OBS (mock) stream already running')
          return
        }
        this.isStreaming = true
        this.context.emitTrigger('stream.started', { at: Date.now(), source: 'mock' })
        break
      }
      case 'stream.stop': {
        if (!this.isStreaming) {
          this.context.logger.warn('OBS (mock) stream already stopped')
          return
        }
        this.isStreaming = false
        this.context.emitTrigger('stream.stopped', { at: Date.now(), source: 'mock' })
        break
      }
      default:
        throw new Error(`Unknown OBS mock action '${actionId}'`)
    }
  }
}

class ObsLiveRuntime {
  constructor(context) {
    this.context = context
    this.client = null
    this.config = { ...DEFAULT_CONFIG, mode: 'live' }
    this.password = null
    this.reconnectAttempt = 0
    this.shouldReconnect = true
  }

  async start(config, password) {
    if (!OBSWebSocket) {
      throw new Error('obs-websocket-js dependency is not available')
    }

    this.config = { ...config, mode: 'live' }
    this.password = password ?? null
    this.shouldReconnect = !!config.autoReconnect

    if (!this.client) {
      this.client = new OBSWebSocket()
      this.attachListeners()
    }

    await this.connect()
  }

  async stop() {
    this.shouldReconnect = false
    if (!this.client) return
    try {
      await this.client.disconnect?.()
    } catch (error) {
      this.context.logger.warn('Error while disconnecting from OBS', { error })
    }
    this.client.removeAllListeners?.()
    this.client = null
  }

  async executeAction(actionId, params = {}) {
    if (!this.client) {
      throw new Error('OBS client is not connected')
    }

    switch (actionId) {
      case 'scene.switch': {
        const { sceneName } = params
        if (!sceneName) {
          throw new Error('scene.switch requires sceneName')
        }
        await this.client.call('SetCurrentProgramScene', { sceneName })
        break
      }
      case 'stream.start': {
        await this.client.call('StartStream')
        break
      }
      case 'stream.stop': {
        await this.client.call('StopStream')
        break
      }
      case 'connection.refresh': {
        await this.reconnect(true)
        break
      }
      default:
        throw new Error(`Unknown OBS live action '${actionId}'`)
    }
  }

  attachListeners() {
    if (!this.client) return
    this.client.on('CurrentProgramSceneChanged', (data) => {
      this.context.emitTrigger('scene.changed', {
        sceneName: data.sceneName,
        source: 'obs',
      })
    })

    this.client.on('StreamStateChanged', (data) => {
      if (data.outputActive) {
        this.context.emitTrigger('stream.started', { at: Date.now(), source: 'obs' })
      } else {
        this.context.emitTrigger('stream.stopped', { at: Date.now(), source: 'obs' })
      }
    })

    this.client.on('ConnectionClosed', async () => {
      this.context.logger.warn('OBS connection closed')
      this.context.emitStatus({ state: 'disconnected', message: 'Connection closed' })
      if (this.shouldReconnect) {
        await this.reconnect()
      }
    })

    this.client.on('error', async (error) => {
      this.context.logger.error('OBS connection error', { error })
      this.context.emitStatus({ state: 'error', message: error.message })

      // Report error to show toast notification
      this.context.emitError(error, 'OBS WebSocket connection error')

      if (this.shouldReconnect) {
        await this.reconnect()
      }
    })
  }

  async connect() {
    const protocol = this.config.useSsl ? 'wss' : 'ws'
    const address = `${protocol}://${this.config.host}:${this.config.port}`

    this.context.emitStatus({ state: this.reconnectAttempt > 0 ? 'reconnecting' : 'connecting', message: `Connecting to ${address}` })

    try {
      await this.client.connect(address, this.password ?? undefined)
      this.reconnectAttempt = 0
      this.context.emitStatus({ state: 'connected', message: 'Connected to OBS' })
    } catch (error) {
      this.context.logger.error('Failed to connect to OBS', { error })
      this.context.emitStatus({ state: 'error', message: error.message })

      // Report error to show toast notification
      this.context.emitError(error, 'Failed to connect to OBS WebSocket')

      if (this.shouldReconnect) {
        await this.reconnect()
      } else {
        throw error
      }
    }
  }

  async reconnect(force = false) {
    if (!this.shouldReconnect && !force) return
    this.reconnectAttempt += 1
    const delay = Math.min(30000, 1000 * 2 ** Math.min(this.reconnectAttempt, 5))
    this.context.emitStatus({ state: 'reconnecting', message: `Retrying OBS connection in ${Math.round(delay / 1000)}s` })
    await sleep(delay)
    if (this.client) {
      try {
        await this.connect()
      } catch (error) {
        if (force) {
          throw error
        }
        // connect already handles scheduling next retry
      }
    }
  }
}

let pluginContext
let mockRuntime
let liveRuntime
let activeRuntime

const loadConfig = () => {
  const stored = pluginContext.storage.config.get('connection')
  if (!stored) {
    return { ...DEFAULT_CONFIG }
  }
  return { ...DEFAULT_CONFIG, ...stored }
}

const saveConfig = (config) => {
  pluginContext.storage.config.set('connection', config)
}

const getPassword = () => pluginContext.storage.secrets.get('connection.password')
const savePassword = (password) => {
  if (typeof password === 'string' && password.length > 0) {
    pluginContext.storage.secrets.set('connection.password', password)
  } else {
    pluginContext.storage.secrets.delete('connection.password')
  }
}

const startRuntime = async () => {
  const config = loadConfig()
  const password = getPassword()

  if (config.mode === 'live') {
    if (!OBSWebSocket) {
      pluginContext.logger.warn('obs-websocket-js dependency missing, falling back to mock mode')
      config.mode = 'mock'
    }
  }

  if (activeRuntime) {
    await activeRuntime.stop()
  }

  if (config.mode === 'live') {
    activeRuntime = liveRuntime
    await liveRuntime.start(config, password)
  } else {
    activeRuntime = mockRuntime
    await mockRuntime.start()
    pluginContext.emitStatus({ state: 'connected', message: 'Running in mock mode' })
  }
}

module.exports = {
  manifest,

  async initialize(context) {
    pluginContext = context
    mockRuntime = new ObsMockRuntime(context)
    liveRuntime = new ObsLiveRuntime(context)
    pluginContext.emitStatus({ state: 'idle', message: 'OBS plugin initialized' })
  },

  registerTriggers() {
    return manifest.triggers ?? []
  },

  registerActions() {
    return manifest.actions ?? []
  },

  async startListening() {
    await startRuntime()
  },

  async stopListening() {
    if (activeRuntime) {
      await activeRuntime.stop()
    }
    pluginContext.emitStatus({ state: 'disconnected', message: 'OBS plugin stopped' })
  },

  async executeAction(actionId, params = {}) {
    switch (actionId) {
      case 'connection.configure': {
        const current = loadConfig()
        const next = {
          ...current,
          mode: params.mode ?? current.mode,
          host: params.host ?? current.host,
          port: typeof params.port === 'number' ? params.port : current.port,
          useSsl: typeof params.useSsl === 'boolean' ? params.useSsl : current.useSsl,
          autoReconnect: typeof params.autoReconnect === 'boolean' ? params.autoReconnect : current.autoReconnect,
        }
        saveConfig(next)
        if (typeof params.password === 'string') {
          savePassword(params.password)
        }
        await startRuntime()
        break
      }
      case 'connection.refresh': {
        if (activeRuntime === liveRuntime) {
          await liveRuntime.reconnect(true)
        } else {
          await startRuntime()
        }
        break
      }
      default: {
        if (!activeRuntime) {
          throw new Error('OBS runtime is not started')
        }
        await activeRuntime.executeAction(actionId, params)
      }
    }
  },

  async destroy() {
    if (activeRuntime) {
      await activeRuntime.stop()
      activeRuntime = null
    }
    pluginContext.emitStatus({ state: 'disconnected', message: 'OBS plugin destroyed' })
  },
}
