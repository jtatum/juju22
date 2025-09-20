import { EventEmitter } from 'node:events'
import type { Juju22Event, EventLogEntry } from '../../shared/events/types'
import type { VariableMutation } from '../../shared/variables/types'
import type { PluginEventPayload, PluginStatusPayload } from '../../shared/plugins/types'
import { createLogger, Logger } from './logger'

type EventPayloadByType = {
  [K in Juju22Event['type']]: Extract<Juju22Event, { type: K }>['payload']
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
  private readonly wildcardHandlers = new Set<(event: Juju22Event) => void>()

  constructor(options?: EventBusOptions) {
    this.logger = options?.logger ?? createLogger('EventBus')
    this.maxLogEntries = options?.maxLogEntries ?? DEFAULT_MAX_LOG_ENTRIES
  }

  emit<T extends Juju22Event['type']>(event: Extract<Juju22Event, { type: T }>) {
    this.logger.debug('Event emitted', { type: event.type, payload: event.payload })

    // Emit to specific type handlers
    this.emitter.emit(event.type, event.payload)

    // Emit to wildcard handlers
    for (const handler of this.wildcardHandlers) {
      handler(event)
    }

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

  emitPluginStatus(payload: PluginStatusPayload) {
    this.emit({ type: 'plugin.status', payload })
  }

  emitVariableMutation(payload: VariableMutation) {
    this.emit({ type: 'variables.mutated', payload })
  }

  on<T extends Juju22Event['type']>(type: T, handler: (payload: EventPayloadByType[T]) => void) {
    this.emitter.on(type, handler)
    return () => this.emitter.off(type, handler)
  }

  // Listen to all events
  onAll(handler: (event: Juju22Event) => void) {
    this.wildcardHandlers.add(handler)
    return () => this.wildcardHandlers.delete(handler)
  }

  onPluginTrigger(handler: (payload: PluginEventPayload) => void) {
    return this.on('plugin.trigger', handler)
  }

  onPluginStatus(handler: (payload: PluginStatusPayload) => void) {
    return this.on('plugin.status', handler)
  }

  onVariableMutation(handler: (payload: VariableMutation) => void) {
    return this.on('variables.mutated', handler)
  }

  onLog(handler: (entry: EventLogEntry) => void) {
    this.emitter.on('log', handler)
    return () => this.emitter.off('log', handler)
  }

  getRecentLogEntries(limit = this.maxLogEntries): EventLogEntry[] {
    return this.logBuffer.slice(0, limit)
  }
}
