import { EventEmitter } from 'node:events'
import type { AidleEvent, EventLogEntry } from '../../shared/events/types'
import type { PluginEventPayload } from '../../shared/plugins/types'
import { createLogger, Logger } from './logger'

type EventPayloadByType = {
  [K in AidleEvent['type']]: Extract<AidleEvent, { type: K }>['payload']
}

const DEFAULT_MAX_LOG_ENTRIES = 200

export interface EventBusOptions {
  maxLogEntries?: number
  logger?: Logger
}

export class EventBus {
  private readonly emitter = new EventEmitter()
  private readonly logger: Logger
  private readonly maxLogEntries: number
  private readonly logBuffer: EventLogEntry[] = []

  constructor(options?: EventBusOptions) {
    this.logger = options?.logger ?? createLogger('EventBus')
    this.maxLogEntries = options?.maxLogEntries ?? DEFAULT_MAX_LOG_ENTRIES
  }

  emit<T extends AidleEvent['type']>(event: Extract<AidleEvent, { type: T }>) {
    this.logger.debug('Event emitted', { type: event.type, payload: event.payload })

    this.emitter.emit(event.type, event.payload)

    const entry: EventLogEntry = {
      type: event.type,
      payload: event.payload,
      timestamp: Date.now(),
    }
    this.emitter.emit('log', entry)
    this.logBuffer.unshift(entry)
    if (this.logBuffer.length > this.maxLogEntries) {
      this.logBuffer.length = this.maxLogEntries
    }
  }

  emitPluginTrigger(payload: PluginEventPayload) {
    this.emit({ type: 'plugin.trigger', payload })
  }

  on<T extends AidleEvent['type']>(type: T, handler: (payload: EventPayloadByType[T]) => void) {
    this.emitter.on(type, handler)
    return () => this.emitter.off(type, handler)
  }

  onPluginTrigger(handler: (payload: PluginEventPayload) => void) {
    return this.on('plugin.trigger', handler)
  }

  onLog(handler: (entry: EventLogEntry) => void) {
    this.emitter.on('log', handler)
    return () => this.emitter.off('log', handler)
  }

  getRecentLogEntries(limit = this.maxLogEntries): EventLogEntry[] {
    return this.logBuffer.slice(0, limit)
  }
}
