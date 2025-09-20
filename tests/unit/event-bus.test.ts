import { describe, expect, it, vi } from 'vitest'
import { EventBus } from '@main/core/event-bus'
import type { Logger } from '@main/core/logger'

const createMockLogger = (): Logger =>
  ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as Logger)

describe('EventBus', () => {
  it('emits plugin triggers and records log entries', () => {
    const eventBus = new EventBus({ logger: createMockLogger(), maxLogEntries: 5 })
    const triggers: unknown[] = []
    const logs: unknown[] = []

    eventBus.onPluginTrigger((payload) => triggers.push(payload))
    eventBus.onLog((entry) => logs.push(entry))

    eventBus.emitPluginTrigger({
      pluginId: 'system',
      triggerId: 'timer.completed',
      data: { timerId: 'demo' },
      timestamp: Date.now(),
    })

    expect(triggers).toHaveLength(1)
    expect(logs).toHaveLength(1)
    expect(eventBus.getRecentLogEntries()).toHaveLength(1)
  })

  it('emits plugin status updates', () => {
    const eventBus = new EventBus({ logger: createMockLogger(), maxLogEntries: 5 })
    const statuses: unknown[] = []
    eventBus.onPluginStatus((payload) => statuses.push(payload))

    eventBus.emitPluginStatus({
      pluginId: 'system',
      status: {
        state: 'connected',
        message: 'Ready',
        at: Date.now(),
      },
    })

    expect(statuses).toHaveLength(1)
  })
})
