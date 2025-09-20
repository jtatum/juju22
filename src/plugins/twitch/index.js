const manifest = require('./manifest.json')

let tmi
try {
  tmi = require('tmi.js')
} catch {
  tmi = null
}

const DEFAULT_CONFIG = Object.freeze({
  mode: 'mock',
  channel: '',
  username: '',
  clientId: '',
  pollIntervalMs: 60000,
})

class TwitchMockRuntime {
  constructor(context) {
    this.context = context
    this.interval = null
  }

  start() {
    this.context.logger.info('Twitch plugin running in mock mode')
    if (this.interval) return
    const viewers = ['alli', 'bri', 'casey', 'devon']
    this.interval = setInterval(() => {
      const user = viewers[Math.floor(Math.random() * viewers.length)]
      this.context.emitTrigger('chat.message', {
        user,
        message: `Mock hype from ${user}!`,
        badges: ['subscriber'],
        sentAt: Date.now(),
      })
    }, 20000)
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  async executeAction(actionId, params = {}) {
    switch (actionId) {
      case 'chat.send': {
        const { message } = params
        if (!message) {
          throw new Error('chat.send requires message')
        }
        this.context.logger.info('Sending chat message (mock)', { message })
        break
      }
      case 'channel.shoutout': {
        const { channel } = params
        if (!channel) {
          throw new Error('channel.shoutout requires channel')
        }
        this.context.logger.info('Sending shoutout (mock)', { channel })
        break
      }
      case 'channel.update':
      case 'clip.create':
      case 'connection.configure':
        this.context.logger.info(`Action '${actionId}' ignored in mock mode`)
        break
      default:
        throw new Error(`Unknown Twitch mock action '${actionId}'`)
    }
  }
}

class TwitchLiveRuntime {
  constructor(context) {
    this.context = context
    this.client = null
    this.config = { ...DEFAULT_CONFIG, mode: 'live' }
    this.secrets = {
      accessToken: null,
      refreshToken: null,
      clientSecret: null,
      chatToken: null,
      tokenExpiresAt: null,
    }
    this.pollHandle = null
    this.lastFollowerTimestamp = null
    this.broadcasterId = null
  }

  async start(config, secrets) {
    if (!tmi) {
      throw new Error('tmi.js dependency is not available')
    }

    this.config = { ...config, mode: 'live' }
    this.secrets = {
      accessToken: secrets.accessToken ?? null,
      refreshToken: secrets.refreshToken ?? null,
      clientSecret: secrets.clientSecret ?? null,
      chatToken: secrets.chatToken ?? secrets.accessToken ?? null,
      tokenExpiresAt: secrets.tokenExpiresAt ?? null,
    }

    if (!this.config.channel || !this.config.username || !this.config.clientId) {
      throw new Error('Twitch connection requires channel, username, and clientId')
    }

    if (!this.secrets.accessToken) {
      throw new Error('Twitch connection requires an accessToken')
    }

    await this.ensureClient()
    await this.ensureBroadcasterId()
    this.startFollowerPoll()
    this.context.emitStatus({ state: 'connected', message: 'Connected to Twitch' })
  }

  async ensureClient() {
    if (this.client) {
      return
    }

    this.client = new tmi.Client({
      options: { skipUpdatingEmotesets: true },
      connection: { reconnect: true, secure: true },
      identity: {
        username: this.config.username,
        password: `oauth:${this.secrets.chatToken}`,
      },
      channels: [this.config.channel],
    })

    this.client.on('message', (channel, tags, message, self) => {
      if (self) return
      this.context.emitTrigger('chat.message', {
        user: tags['display-name'] || tags.username,
        message,
        badges: parseBadges(tags.badges),
        sentAt: Date.now(),
      })
    })

    this.client.on('subscription', (_channel, username, _methods, message, userstate) => {
      this.context.emitTrigger('channel.subscription', {
        user: username,
        message: message ?? null,
        months: Number(userstate['msg-param-cumulative-months'] || 0),
        tier: userstate['msg-param-sub-plan'] ?? null,
        sentAt: Date.now(),
      })
    })

    this.client.on('resub', (_channel, username, months, message, userstate) => {
      this.context.emitTrigger('channel.subscription', {
        user: username,
        message: message ?? null,
        months,
        tier: userstate['msg-param-sub-plan'] ?? null,
        sentAt: Date.now(),
      })
    })

    this.client.on('raided', (_channel, username, viewers) => {
      this.context.emitTrigger('channel.raid', {
        user: username,
        viewers,
        receivedAt: Date.now(),
      })
    })

    this.client.on('connected', () => {
      this.context.emitStatus({ state: 'connected', message: 'Twitch chat connected' })
    })

    this.client.on('disconnected', (reason) => {
      this.context.emitStatus({ state: 'disconnected', message: `Twitch chat disconnected: ${reason}` })
    })

    this.client.on('reconnect', () => {
      this.context.emitStatus({ state: 'reconnecting', message: 'Twitch chat reconnecting' })
    })

    await this.client.connect()
  }

  async ensureBroadcasterId() {
    if (this.broadcasterId) {
      return this.broadcasterId
    }

    const response = await this.twitchApiFetch('users', {
      query: { login: this.config.channel.replace(/^#/, '') },
    })

    const user = response?.data?.[0]
    if (!user) {
      throw new Error('Unable to resolve broadcaster ID from Twitch API')
    }

    this.broadcasterId = user.id
    this.lastFollowerTimestamp = Date.parse(user.created_at) || null
    return this.broadcasterId
  }

  startFollowerPoll() {
    this.stopFollowerPoll()
    const interval = Math.max(15000, Number(this.config.pollIntervalMs) || DEFAULT_CONFIG.pollIntervalMs)
    this.pollHandle = setInterval(() => {
      this.pollFollowers().catch((error) => {
        this.context.logger.error('Twitch follower poll failed', { error })
      })
    }, interval)
  }

  stopFollowerPoll() {
    if (this.pollHandle) {
      clearInterval(this.pollHandle)
      this.pollHandle = null
    }
  }

  async pollFollowers() {
    const broadcasterId = await this.ensureBroadcasterId()
    const response = await this.twitchApiFetch('channels/followers', {
      query: { broadcaster_id: broadcasterId, first: 20 },
    })

    const followers = response?.data ?? []
    const newFollowers = []
    for (const follower of followers) {
      const followedAt = Date.parse(follower.followed_at)
      if (!Number.isFinite(followedAt)) continue
      if (!this.lastFollowerTimestamp || followedAt > this.lastFollowerTimestamp) {
        newFollowers.push(follower)
      }
    }

    if (followers.length > 0) {
      const newest = Date.parse(followers[0].followed_at)
      if (Number.isFinite(newest)) {
        this.lastFollowerTimestamp = newest
      }
    }

    for (const follower of newFollowers.reverse()) {
      this.context.emitTrigger('channel.follow', {
        user: follower.user_name,
        userId: follower.user_id,
        followedAt: follower.followed_at,
      })
    }
  }

  async executeAction(actionId, params = {}) {
    switch (actionId) {
      case 'chat.send': {
        const { message } = params
        if (!message) {
          throw new Error('chat.send requires message')
        }
        await this.client.say(this.config.channel, message)
        break
      }
      case 'channel.shoutout': {
        const { channel } = params
        if (!channel) {
          throw new Error('channel.shoutout requires channel')
        }
        const broadcasterId = await this.ensureBroadcasterId()
        await this.twitchApiFetch('chat/shoutouts', {
          method: 'POST',
          body: {
            from_broadcaster_id: broadcasterId,
            to_broadcaster_id: await this.resolveUserId(channel),
            moderator_id: broadcasterId,
          },
        })
        break
      }
      case 'channel.update': {
        const { title, categoryId } = params
        const broadcasterId = await this.ensureBroadcasterId()
        await this.twitchApiFetch('channels', {
          method: 'PATCH',
          query: { broadcaster_id: broadcasterId },
          body: {
            title: title ?? undefined,
            game_id: categoryId ?? undefined,
          },
        })
        break
      }
      case 'clip.create': {
        const broadcasterId = await this.ensureBroadcasterId()
        const response = await this.twitchApiFetch('clips', {
          method: 'POST',
          query: { broadcaster_id: broadcasterId },
        })
        this.context.logger.info('Clip created', { data: response?.data?.[0] })
        break
      }
      default:
        throw new Error(`Unknown Twitch action '${actionId}'`)
    }
  }

  async twitchApiFetch(path, options = {}) {
    await this.ensureTokenFreshness()
    const url = new URL(`https://api.twitch.tv/helix/${path}`)
    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value === undefined || value === null) continue
        url.searchParams.set(key, value)
      }
    }

    const headers = {
      'Client-ID': this.config.clientId,
      Authorization: `Bearer ${this.secrets.accessToken}`,
    }

    const init = {
      method: options.method ?? 'GET',
      headers,
    }

    if (options.body) {
      headers['Content-Type'] = 'application/json'
      init.body = JSON.stringify(options.body)
    }

    const response = await fetch(url, init)
    if (response.status === 401 && this.secrets.refreshToken) {
      await this.refreshAccessToken()
      headers.Authorization = `Bearer ${this.secrets.accessToken}`
      const retryResponse = await fetch(url, init)
      if (!retryResponse.ok) {
        const text = await retryResponse.text()
        throw new Error(`Twitch API request failed: ${retryResponse.status} ${text}`)
      }
      return retryResponse.json()
    }

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Twitch API request failed: ${response.status} ${text}`)
    }

    const data = await response.json()
    return data
  }

  async ensureTokenFreshness() {
    if (!this.secrets.tokenExpiresAt) return
    const expiresAt = Number(this.secrets.tokenExpiresAt)
    if (!Number.isFinite(expiresAt)) return
    const now = Date.now()
    if (now < expiresAt - 60000) {
      return
    }

    if (this.secrets.refreshToken) {
      await this.refreshAccessToken()
    }
  }

  async refreshAccessToken() {
    if (!this.secrets.refreshToken || !this.secrets.clientSecret) {
      this.context.logger.warn('Cannot refresh Twitch token without refreshToken and clientSecret')
      return
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.secrets.refreshToken,
      client_id: this.config.clientId,
      client_secret: this.secrets.clientSecret,
    })

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Failed to refresh Twitch token: ${response.status} ${text}`)
    }

    const payload = await response.json()
    this.secrets.accessToken = payload.access_token
    if (payload.refresh_token) {
      this.secrets.refreshToken = payload.refresh_token
    }
    if (payload.expires_in) {
      this.secrets.tokenExpiresAt = Date.now() + payload.expires_in * 1000
    }

    await persistSecrets(this.context, this.secrets)
  }

  async resolveUserId(login) {
    const response = await this.twitchApiFetch('users', { query: { login: login.replace(/^#/, '') } })
    const user = response?.data?.[0]
    if (!user) {
      throw new Error(`Unable to resolve Twitch user '${login}'`)
    }
    return user.id
  }

  async stop() {
    this.stopFollowerPoll()
    if (this.client) {
      try {
        await this.client.disconnect()
      } catch (error) {
        this.context.logger.warn('Error while disconnecting Twitch chat', { error })
      }
      this.client.removeAllListeners()
      this.client = null
    }
    this.context.emitStatus({ state: 'disconnected', message: 'Twitch runtime stopped' })
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

const loadSecrets = () => ({
  accessToken: pluginContext.storage.secrets.get('accessToken') ?? null,
  refreshToken: pluginContext.storage.secrets.get('refreshToken') ?? null,
  clientSecret: pluginContext.storage.secrets.get('clientSecret') ?? null,
  chatToken: pluginContext.storage.secrets.get('chatToken') ?? null,
  tokenExpiresAt: pluginContext.storage.secrets.get('tokenExpiresAt') ?? null,
})

const persistSecrets = async (context, secrets) => {
  if (secrets.accessToken) context.storage.secrets.set('accessToken', secrets.accessToken)
  if (secrets.refreshToken) context.storage.secrets.set('refreshToken', secrets.refreshToken)
  if (secrets.clientSecret) context.storage.secrets.set('clientSecret', secrets.clientSecret)
  if (secrets.chatToken) context.storage.secrets.set('chatToken', secrets.chatToken)
  if (secrets.tokenExpiresAt) context.storage.secrets.set('tokenExpiresAt', secrets.tokenExpiresAt)
}

const clearSecrets = (context) => {
  for (const key of ['accessToken', 'refreshToken', 'clientSecret', 'chatToken', 'tokenExpiresAt']) {
    context.storage.secrets.delete(key)
  }
}

const startRuntime = async () => {
  const config = loadConfig()
  const secrets = loadSecrets()

  if (config.mode === 'live' && !tmi) {
    pluginContext.logger.warn('tmi.js dependency missing, falling back to mock mode')
    config.mode = 'mock'
  }

  if (activeRuntime) {
    await activeRuntime.stop?.()
  }

  if (config.mode === 'live') {
    activeRuntime = liveRuntime
    try {
      await liveRuntime.start(config, secrets)
    } catch (error) {
      pluginContext.logger.error('Failed to start Twitch live runtime, falling back to mock', { error })
      config.mode = 'mock'
      saveConfig(config)
      await startRuntime()
    }
  } else {
    activeRuntime = mockRuntime
    mockRuntime.start()
    pluginContext.emitStatus({ state: 'connected', message: 'Running in mock mode' })
  }
}

const parseBadges = (badges) => {
  if (!badges) return []
  if (typeof badges === 'string') {
    return badges.split(',').filter(Boolean)
  }
  if (typeof badges === 'object') {
    return Object.keys(badges)
  }
  return []
}

module.exports = {
  manifest,

  async initialize(context) {
    pluginContext = context
    mockRuntime = new TwitchMockRuntime(context)
    liveRuntime = new TwitchLiveRuntime(context)
    pluginContext.emitStatus({ state: 'idle', message: 'Twitch plugin initialized' })
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
      await activeRuntime.stop?.()
      activeRuntime = null
    }
    mockRuntime.stop()
    pluginContext.emitStatus({ state: 'disconnected', message: 'Twitch plugin stopped' })
  },

  async executeAction(actionId, params = {}) {
    switch (actionId) {
      case 'connection.configure': {
        const current = loadConfig()
        const next = {
          ...current,
          mode: params.mode ?? current.mode,
          channel: params.channel ?? current.channel,
          username: params.username ?? current.username,
          clientId: params.clientId ?? current.clientId,
          pollIntervalMs: typeof params.pollIntervalMs === 'number' ? params.pollIntervalMs : current.pollIntervalMs,
        }
        saveConfig(next)

        const secrets = loadSecrets()
        if (typeof params.accessToken === 'string') secrets.accessToken = params.accessToken
        if (typeof params.refreshToken === 'string') secrets.refreshToken = params.refreshToken
        if (typeof params.clientSecret === 'string') secrets.clientSecret = params.clientSecret
        if (typeof params.chatToken === 'string') secrets.chatToken = params.chatToken
        if (params.resetSecrets === true) {
          clearSecrets(pluginContext)
        } else {
          await persistSecrets(pluginContext, secrets)
        }

        await startRuntime()
        break
      }
      default: {
        if (!activeRuntime) {
          throw new Error('Twitch runtime is not started')
        }
        await activeRuntime.executeAction(actionId, params)
      }
    }
  },

  async destroy() {
    if (activeRuntime) {
      await activeRuntime.stop?.()
      activeRuntime = null
    }
    mockRuntime.stop()
    pluginContext.emitStatus({ state: 'disconnected', message: 'Twitch plugin destroyed' })
  },
}
