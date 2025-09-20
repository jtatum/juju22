import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EventBus } from '@main/core/event-bus'
import type { Logger } from '@main/core/logger'

const createMockLogger = (): Logger =>
  ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as Logger)

describe('EventBus wildcard listener', () => {
  let eventBus: EventBus
  let mockLogger: Logger

  beforeEach(() => {
    mockLogger = createMockLogger()
    eventBus = new EventBus({ logger: mockLogger })
  })

  describe('onAll', () => {
    it('should receive all events through wildcard listener', () => {
      const handler = vi.fn()
      eventBus.onAll(handler)

      // Emit different types of events
      eventBus.emitPluginTrigger({
        pluginId: 'test-plugin',
        triggerId: 'test-trigger',
        data: { test: true },
        timestamp: Date.now(),
      })

      eventBus.emitVariableMutation({
        type: 'set',
        scope: 'user',
        key: 'testVar',
        value: 'testValue',
        oldValue: undefined,
        timestamp: Date.now(),
      })

      expect(handler).toHaveBeenCalledTimes(2)
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'plugin.trigger',
          payload: expect.objectContaining({
            pluginId: 'test-plugin',
          })
        })
      )
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'variables.mutated',
          payload: expect.objectContaining({
            key: 'testVar',
          })
        })
      )
    })

    it('should support multiple wildcard listeners', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      eventBus.onAll(handler1)
      eventBus.onAll(handler2)

      eventBus.emitPluginStatus({
        pluginId: 'test-plugin',
        status: {
          state: 'idle',
          message: 'Ready',
        },
      })

      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('should allow unsubscribing from wildcard listener', () => {
      const handler = vi.fn()
      const unsubscribe = eventBus.onAll(handler)

      eventBus.emitPluginTrigger({
        pluginId: 'test',
        triggerId: 'trigger1',
        data: {},
        timestamp: Date.now(),
      })

      expect(handler).toHaveBeenCalledTimes(1)

      // Unsubscribe
      unsubscribe()

      eventBus.emitPluginTrigger({
        pluginId: 'test',
        triggerId: 'trigger2',
        data: {},
        timestamp: Date.now(),
      })

      // Should still be 1 since we unsubscribed
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should work alongside specific event listeners', () => {
      const wildcardHandler = vi.fn()
      const specificHandler = vi.fn()

      eventBus.onAll(wildcardHandler)
      eventBus.onPluginTrigger(specificHandler)

      eventBus.emitPluginTrigger({
        pluginId: 'test',
        triggerId: 'trigger',
        data: { test: true },
        timestamp: Date.now(),
      })

      expect(wildcardHandler).toHaveBeenCalledTimes(1)
      expect(specificHandler).toHaveBeenCalledTimes(1)
      expect(specificHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          pluginId: 'test',
        })
      )
    })
  })
})