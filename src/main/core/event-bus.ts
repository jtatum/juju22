import { EventEmitter } from 'node:events'
import type { PluginEventPayload } from '../../shared/plugins/types'

export type EventBusEvent = {
  type: 'plugin-trigger'
  payload: PluginEventPayload
}

export class EventBus {
  private readonly emitter = new EventEmitter()

  emit(event: EventBusEvent) {
    this.emitter.emit(event.type, event.payload)
  }

  onPluginTrigger(handler: (payload: PluginEventPayload) => void) {
    this.emitter.on('plugin-trigger', handler)
    return () => this.emitter.off('plugin-trigger', handler)
  }
}
