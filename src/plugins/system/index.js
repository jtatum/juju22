const manifest = require('./manifest.json')
const { app, globalShortcut } = require('electron')
const { CronJob } = require('cron')
const chokidar = require('chokidar')
const http = require('node:http')
const { randomUUID } = require('node:crypto')

const DEFAULT_WEBHOOK_PORT = 4789
const DEFAULT_CONFIG = Object.freeze({
  hotkeys: [],
  schedules: [],
  watchers: [],
  webhook: {
    enabled: false,
    port: DEFAULT_WEBHOOK_PORT,
  },
})

class TimerStore {
  constructor() {
    this.timers = new Map()
  }

  start(id, durationMs, onComplete) {
    this.clear(id)
    const timeout = setTimeout(() => {
      try {
        onComplete()
      } finally {
        this.timers.delete(id)
      }
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

class HotkeyRegistry {
  constructor(context) {
    this.context = context
    this.registry = new Map()
    this.appReady = app.isReady() ? Promise.resolve() : app.whenReady()
  }

  async register({ hotkeyId, accelerator, payload }) {
    if (!hotkeyId || !accelerator) {
      throw new Error('hotkey.register requires hotkeyId and accelerator')
    }

    await this.appReady
    this.unregister(hotkeyId)

    const success = globalShortcut.register(accelerator, () => {
      this.context.emitTrigger('hotkey.pressed', {
        hotkeyId,
        accelerator,
        payload: payload ?? null,
        triggeredAt: Date.now(),
      })
    })

    if (!success) {
      throw new Error(`Failed to register hotkey ${accelerator}`)
    }

    this.registry.set(hotkeyId, { accelerator })
  }

  unregister(hotkeyId) {
    const existing = this.registry.get(hotkeyId)
    if (!existing) return
    globalShortcut.unregister(existing.accelerator)
    this.registry.delete(hotkeyId)
  }

  clearAll() {
    for (const { accelerator } of this.registry.values()) {
      globalShortcut.unregister(accelerator)
    }
    this.registry.clear()
  }
}

class ScheduleRegistry {
  constructor(context) {
    this.context = context
    this.registry = new Map()
  }

  register({ scheduleId, expression, timezone, payload }) {
    if (!scheduleId || !expression) {
      throw new Error('schedule.register requires scheduleId and expression')
    }

    this.unregister(scheduleId)

    const job = new CronJob(
      expression,
      () => {
        this.context.emitTrigger('schedule.fired', {
          scheduleId,
          expression,
          timezone: timezone ?? null,
          payload: payload ?? null,
          runAt: Date.now(),
        })
      },
      null,
      true,
      timezone,
    )

    this.registry.set(scheduleId, job)
  }

  unregister(scheduleId) {
    const job = this.registry.get(scheduleId)
    if (!job) return
    job.stop()
    this.registry.delete(scheduleId)
  }

  clearAll() {
    for (const job of this.registry.values()) {
      job.stop()
    }
    this.registry.clear()
  }
}

class FileWatcherRegistry {
  constructor(context) {
    this.context = context
    this.registry = new Map()
  }

  watch({ watcherId, targetPath, events, ignoreInitial, debounceMs = 0 }) {
    if (!watcherId || !targetPath) {
      throw new Error('file.watch requires watcherId and targetPath')
    }

    this.unwatch(watcherId)

    const eventSet = new Set(Array.isArray(events) && events.length > 0 ? events : ['add', 'change', 'unlink'])
    const watcher = chokidar.watch(targetPath, {
      ignoreInitial: ignoreInitial ?? true,
    })

    let debounceHandle = null
    const emitEvent = (event, path) => {
      const payload = {
        watcherId,
        event,
        path,
        triggeredAt: Date.now(),
      }

      if (debounceMs > 0) {
        if (debounceHandle) {
          clearTimeout(debounceHandle)
        }
        debounceHandle = setTimeout(() => {
          this.context.emitTrigger('file.changed', payload)
        }, debounceMs)
        return
      }

      this.context.emitTrigger('file.changed', payload)
    }

    for (const event of eventSet) {
      watcher.on(event, (path) => emitEvent(event, path))
    }

    watcher.on('error', (error) => {
      this.context.logger.error('File watcher error', { watcherId, error })
    })

    this.registry.set(watcherId, { watcher, debounceHandle })
  }

  unwatch(watcherId) {
    const entry = this.registry.get(watcherId)
    if (!entry) return
    if (entry.debounceHandle) {
      clearTimeout(entry.debounceHandle)
    }
    entry.watcher.close()
    this.registry.delete(watcherId)
  }

  clearAll() {
    for (const watcherId of [...this.registry.keys()]) {
      this.unwatch(watcherId)
    }
  }
}

class WebhookServer {
  constructor(context) {
    this.context = context
    this.server = null
    this.config = { ...DEFAULT_CONFIG.webhook }
    this.secret = null
  }

  async configure({ enabled, port, secret }) {
    const nextConfig = {
      enabled: enabled ?? this.config.enabled,
      port: typeof port === 'number' ? port : this.config.port,
    }

    if (typeof secret === 'string' && secret.length > 0) {
      this.secret = secret
    }

    const shouldRestart =
      this.server && (nextConfig.port !== this.config.port || (nextConfig.enabled && !this.config.enabled))

    this.config = nextConfig

    if (!this.config.enabled) {
      await this.stop()
      return
    }

    if (shouldRestart || !this.server) {
      await this.restart()
    }
  }

  async restart() {
    await this.stop()
    await this.start()
  }

  async start() {
    if (this.server) return
    if (!this.config.enabled) return

    this.server = http.createServer(async (req, res) => {
      if (req.method !== 'POST') {
        res.writeHead(405).end()
        return
      }

      const chunks = []
      req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))

      await new Promise((resolve) => req.on('end', resolve))

      const bodyBuffer = Buffer.concat(chunks)
      const bodyString = bodyBuffer.toString('utf-8')

      if (this.secret) {
        const provided = req.headers['x-juju22-signature'] || req.headers['x-juju22-token']
        if (!provided || provided !== this.secret) {
          res.writeHead(401).end('Unauthorized')
          return
        }
      }

      let payload = null
      try {
        payload = bodyString.length > 0 ? JSON.parse(bodyString) : null
      } catch (error) {
        this.context.logger.warn('Webhook received invalid JSON payload', { error })
        res.writeHead(400).end('Invalid JSON payload')
        return
      }

      this.context.emitTrigger('webhook.received', {
        id: randomUUID(),
        headers: req.headers,
        payload,
        receivedAt: Date.now(),
      })

      res.writeHead(200).end('OK')
    })

    await new Promise((resolve, reject) => {
      this.server.once('listening', resolve)
      this.server.once('error', reject)
      this.server.listen(this.config.port)
    })

    this.context.logger.info('System webhook server listening', { port: this.config.port })
  }

  async stop() {
    if (!this.server) return
    await new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) reject(err)
        else resolve()
      })
    })
    this.server = null
  }

  async destroy() {
    await this.stop()
  }
}

const timers = new TimerStore()
let hotkeys
let schedules
let watchers
let webhook
let pluginContext

const loadConfig = () => {
  const stored = pluginContext.storage.config.get('config')
  if (!stored) {
    return { ...DEFAULT_CONFIG }
  }

  return {
    hotkeys: Array.isArray(stored.hotkeys) ? stored.hotkeys : [],
    schedules: Array.isArray(stored.schedules) ? stored.schedules : [],
    watchers: Array.isArray(stored.watchers) ? stored.watchers : [],
    webhook: {
      enabled: stored?.webhook?.enabled ?? false,
      port: stored?.webhook?.port ?? DEFAULT_WEBHOOK_PORT,
    },
  }
}

const saveConfig = (nextConfig) => {
  pluginContext.storage.config.set('config', nextConfig)
}

const saveWebhookSecret = (secret) => {
  if (typeof secret === 'string' && secret.length > 0) {
    pluginContext.storage.secrets.set('webhook.secret', secret)
  } else {
    pluginContext.storage.secrets.delete('webhook.secret')
  }
}

const getWebhookSecret = () => pluginContext.storage.secrets.get('webhook.secret')

const bootstrapFromConfig = async () => {
  const config = loadConfig()

  for (const hotkey of config.hotkeys) {
    try {
      await hotkeys.register(hotkey)
    } catch (error) {
      pluginContext.logger.error('Failed to restore hotkey', { hotkeyId: hotkey.hotkeyId, error })
    }
  }

  for (const schedule of config.schedules) {
    try {
      schedules.register(schedule)
    } catch (error) {
      pluginContext.logger.error('Failed to restore schedule', { scheduleId: schedule.scheduleId, error })
    }
  }

  for (const watcher of config.watchers) {
    try {
      watchers.watch(watcher)
    } catch (error) {
      pluginContext.logger.error('Failed to restore watcher', { watcherId: watcher.watcherId, error })
    }
  }

  const webhookSecret = getWebhookSecret()
  await webhook.configure({ ...config.webhook, secret: webhookSecret })
}

module.exports = {
  manifest,

  async initialize(context) {
    pluginContext = context
    hotkeys = new HotkeyRegistry(context)
    schedules = new ScheduleRegistry(context)
    watchers = new FileWatcherRegistry(context)
    webhook = new WebhookServer(context)

    pluginContext.logger.info('System plugin initialized')
    pluginContext.emitStatus({ state: 'idle', message: 'Initialized' })
  },

  registerTriggers() {
    return manifest.triggers ?? []
  },

  registerActions() {
    return manifest.actions ?? []
  },

  async startListening() {
    pluginContext.emitStatus({ state: 'connecting', message: 'Starting system services' })
    await bootstrapFromConfig()
    pluginContext.emitStatus({ state: 'connected', message: 'System services running' })
  },

  async stopListening() {
    timers.clearAll()
    hotkeys.clearAll()
    schedules.clearAll()
    watchers.clearAll()
    await webhook.stop()
    pluginContext.emitStatus({ state: 'disconnected', message: 'System services stopped' })
  },

  async executeAction(actionId, params = {}) {
    switch (actionId) {
      case 'notification.send': {
        const { title = 'Juju22', message, level = 'info' } = params
        pluginContext.logger.info('Notification requested', { title, message, level })
        break
      }
      case 'timer.start': {
        const { timerId, durationMs } = params
        if (!timerId || typeof durationMs !== 'number') {
          throw new Error('timer.start requires timerId and durationMs')
        }
        timers.start(timerId, durationMs, () => {
          pluginContext.emitTrigger('timer.completed', { timerId, completedAt: Date.now() })
        })
        break
      }
      case 'hotkey.register': {
        const config = loadConfig()
        await hotkeys.register(params)
        const filtered = config.hotkeys.filter((entry) => entry.hotkeyId !== params.hotkeyId)
        config.hotkeys = [...filtered, params]
        saveConfig(config)
        break
      }
      case 'hotkey.unregister': {
        const { hotkeyId } = params
        if (!hotkeyId) {
          throw new Error('hotkey.unregister requires hotkeyId')
        }
        hotkeys.unregister(hotkeyId)
        const config = loadConfig()
        config.hotkeys = config.hotkeys.filter((entry) => entry.hotkeyId !== hotkeyId)
        saveConfig(config)
        break
      }
      case 'schedule.register': {
        schedules.register(params)
        const config = loadConfig()
        const next = config.schedules.filter((entry) => entry.scheduleId !== params.scheduleId)
        config.schedules = [...next, params]
        saveConfig(config)
        break
      }
      case 'schedule.unregister': {
        const { scheduleId } = params
        if (!scheduleId) {
          throw new Error('schedule.unregister requires scheduleId')
        }
        schedules.unregister(scheduleId)
        const config = loadConfig()
        config.schedules = config.schedules.filter((entry) => entry.scheduleId !== scheduleId)
        saveConfig(config)
        break
      }
      case 'file.watch': {
        watchers.watch(params)
        const config = loadConfig()
        const next = config.watchers.filter((entry) => entry.watcherId !== params.watcherId)
        config.watchers = [...next, params]
        saveConfig(config)
        break
      }
      case 'file.unwatch': {
        const { watcherId } = params
        if (!watcherId) {
          throw new Error('file.unwatch requires watcherId')
        }
        watchers.unwatch(watcherId)
        const config = loadConfig()
        config.watchers = config.watchers.filter((entry) => entry.watcherId !== watcherId)
        saveConfig(config)
        break
      }
      case 'webhook.configure': {
        const { enabled, port, secret } = params
        const config = loadConfig()
        config.webhook.enabled = typeof enabled === 'boolean' ? enabled : config.webhook.enabled
        if (typeof port === 'number') {
          config.webhook.port = port
        }
        saveConfig(config)
        if (typeof secret === 'string') {
          saveWebhookSecret(secret)
        }
        await webhook.configure({ ...config.webhook, secret: secret ?? getWebhookSecret() })
        break
      }
      default:
        throw new Error(`Unknown action '${actionId}'`)
    }
  },

  async destroy() {
    timers.clearAll()
    hotkeys.clearAll()
    schedules.clearAll()
    watchers.clearAll()
    await webhook.destroy()
    pluginContext.emitStatus({ state: 'disconnected', message: 'System plugin destroyed' })
  },
}
