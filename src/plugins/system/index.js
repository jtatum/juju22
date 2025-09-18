const manifest = require('./manifest.json')

class TimerStore {
  constructor() {
    this.timers = new Map()
  }

  start(id, durationMs, onComplete) {
    this.clear(id)
    const timeout = setTimeout(() => {
      onComplete()
      this.timers.delete(id)
    }, durationMs)
    this.timers.set(id, timeout)
  }

  clear(id) {
    const existing = this.timers.get(id)
    if (existing) {
      clearTimeout(existing)
      this.timers.delete(id)
    }
  }

  clearAll() {
    for (const timeout of this.timers.values()) {
      clearTimeout(timeout)
    }
    this.timers.clear()
  }
}

const timers = new TimerStore()
let pluginContext

module.exports = {
  manifest,

  async initialize(context) {
    pluginContext = context
    context.logger.info('System plugin initialized')
  },

  registerTriggers() {
    return manifest.triggers ?? []
  },

  registerActions() {
    return manifest.actions ?? []
  },

  async startListening() {
    pluginContext.logger.info('System plugin listening for timers')
  },

  async stopListening() {
    timers.clearAll()
  },

  async executeAction(actionId, params) {
    switch (actionId) {
      case 'notification.send': {
        const { title = 'Aidle', message } = params || {}
        pluginContext.logger.info('Notification requested', { title, message })
        // Placeholder: integrate with OS notifications in later phases
        break
      }
      case 'timer.start': {
        const { timerId, durationMs } = params || {}
        if (!timerId || typeof durationMs !== 'number') {
          throw new Error('timer.start requires timerId and durationMs')
        }
        timers.start(timerId, durationMs, () => {
          pluginContext.emitTrigger('timer.completed', { timerId })
        })
        break
      }
      default:
        throw new Error(`Unknown action '${actionId}'`)
    }
  },

  async destroy() {
    timers.clearAll()
    pluginContext.logger.info('System plugin destroyed')
  },
}
