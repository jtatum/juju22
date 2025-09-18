const manifest = require('./manifest.json')

const MOCK_VIEWERS = ['alli', 'bri', 'casey', 'devon']

class TwitchMockRuntime {
  constructor(context) {
    this.context = context
    this.interval = null
  }

  start() {
    this.context.logger.info('Twitch plugin running in mock mode')
    if (this.interval) return
    this.interval = setInterval(() => {
      const user = MOCK_VIEWERS[Math.floor(Math.random() * MOCK_VIEWERS.length)]
      this.context.emitTrigger('chat.message', {
        user,
        message: `Mock hype from ${user}!`,
        badges: ['subscriber'],
      })
    }, 20000)
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
    runtime = new TwitchMockRuntime(pluginContext)
    pluginContext.logger.info('Twitch plugin initialized')
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
      case 'chat.send': {
        const { message } = params
        if (!message) {
          throw new Error('chat.send requires message')
        }
        context.logger.info('Sending chat message (mock)', { message })
        break
      }
      case 'channel.shoutout': {
        const { channel } = params
        if (!channel) {
          throw new Error('channel.shoutout requires channel')
        }
        context.logger.info('Sending shoutout (mock)', { channel })
        break
      }
      default:
        throw new Error(`Unknown Twitch action '${actionId}'`)
    }
  },

  async destroy() {
    runtime.stop()
    context = null
  },
}
