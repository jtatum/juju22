const manifest = require('./manifest.json')

const DEMO_SCENES = ['Intro', 'Gameplay', 'Be Right Back', 'Ending']

class ObsMockRuntime {
  constructor(context) {
    this.context = context
    this.currentScene = DEMO_SCENES[0]
    this.isStreaming = false
    this.interval = null
  }

  start() {
    this.context.logger.info('OBS plugin running in mock mode')
    if (this.interval) return
    this.interval = setInterval(() => {
      const nextScene = DEMO_SCENES[Math.floor(Math.random() * DEMO_SCENES.length)]
      if (nextScene !== this.currentScene) {
        this.currentScene = nextScene
        this.context.emitTrigger('scene.changed', {
          sceneName: this.currentScene,
          source: 'mock-schedule',
        })
      }
    }, 15000)
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }
}

let runtime
let context

module.exports = {
  manifest,

  async initialize(pluginContext) {
    context = pluginContext
    runtime = new ObsMockRuntime(pluginContext)
    pluginContext.logger.info('OBS plugin initialized')
  },

  registerTriggers() {
    return manifest.triggers ?? []
  },

  registerActions() {
    return manifest.actions ?? []
  },

  async startListening() {
    runtime.start()
  },

  async stopListening() {
    runtime.stop()
  },

  async executeAction(actionId, params = {}) {
    switch (actionId) {
      case 'scene.switch': {
        const { sceneName } = params
        if (!sceneName) {
          throw new Error('scene.switch requires sceneName')
        }
        runtime.currentScene = sceneName
        context.emitTrigger('scene.changed', {
          sceneName,
          source: 'action',
        })
        context.logger.info('OBS scene switched', { sceneName })
        break
      }
      case 'stream.start': {
        if (runtime.isStreaming) {
          context.logger.warn('OBS stream already running')
          return
        }
        runtime.isStreaming = true
        context.emitTrigger('stream.started', { at: Date.now() })
        context.logger.info('OBS stream start requested')
        break
      }
      case 'stream.stop': {
        if (!runtime.isStreaming) {
          context.logger.warn('OBS stream already stopped')
          return
        }
        runtime.isStreaming = false
        context.emitTrigger('stream.stopped', { at: Date.now() })
        context.logger.info('OBS stream stop requested')
        break
      }
      default:
        throw new Error(`Unknown OBS action '${actionId}'`)
    }
  },

  async destroy() {
    runtime.stop()
    context = null
  },
}
