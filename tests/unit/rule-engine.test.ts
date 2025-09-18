import { describe, expect, it, vi } from 'vitest'
import { EventBus } from '@main/core/event-bus'
import { RuleEngine } from '@main/core/rule-engine'
import { DataStores } from '@main/core/storage'
import type { Logger } from '@main/core/logger'
import type { RuleDefinition } from '@shared/rules/types'

const createMockLogger = (): Logger =>
  ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as Logger)

const createRule = (overrides: Partial<RuleDefinition> = {}): RuleDefinition => {
  const now = new Date().toISOString()
  return {
    id: overrides.id ?? 'rule-1',
    name: overrides.name ?? 'Demo Rule',
    trigger: overrides.trigger ?? { pluginId: 'system', triggerId: 'timer.completed' },
    conditions: overrides.conditions,
    actions:
      overrides.actions ??
      ([
        {
          pluginId: 'system',
          actionId: 'notification.send',
          params: { message: 'Timer fired' },
        },
      ] satisfies RuleDefinition['actions']),
    enabled: overrides.enabled ?? true,
    priority: overrides.priority ?? 0,
    tags: overrides.tags,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  }
}

describe('RuleEngine', () => {
  it('dispatches actions when a rule matches an event', async () => {
    const eventBus = new EventBus({ logger: createMockLogger() })
    const stores = new DataStores()
    const pluginManager = {
      executeAction: vi.fn().mockResolvedValue(undefined),
    }

    const ruleEngine = new RuleEngine(eventBus, stores.rules, pluginManager as never, { logger: createMockLogger() })
    ruleEngine.start()

    stores.rules.save(createRule())

    const evaluations: unknown[] = []
    const actions: unknown[] = []
    eventBus.on('rule.evaluation', (payload) => evaluations.push(payload))
    eventBus.on('rule.action', (payload) => actions.push(payload))

    eventBus.emitPluginTrigger({
      pluginId: 'system',
      triggerId: 'timer.completed',
      data: { timerId: 'demo' },
      timestamp: Date.now(),
    })

    await vi.waitFor(() => {
      expect(pluginManager.executeAction).toHaveBeenCalled()
    })

    expect(evaluations).toHaveLength(1)
    expect(actions).toHaveLength(1)

    ruleEngine.stop()
  })

  it('logs evaluation failures without dispatching actions', async () => {
    const eventBus = new EventBus({ logger: createMockLogger() })
    const stores = new DataStores()
    const pluginManager = {
      executeAction: vi.fn().mockResolvedValue(undefined),
    }
    const ruleEngine = new RuleEngine(eventBus, stores.rules, pluginManager as never, { logger: createMockLogger() })
    ruleEngine.start()

    stores.rules.save(
      createRule({
        id: 'rule-conditional',
        conditions: [
          {
            type: 'equals',
            path: 'timerId',
            value: 'expected',
          },
        ],
      }),
    )

    const evaluations: Array<{ result: { matched: boolean; reason?: string } }> = []
    eventBus.on('rule.evaluation', (payload) => evaluations.push(payload as never))

    eventBus.emitPluginTrigger({
      pluginId: 'system',
      triggerId: 'timer.completed',
      data: { timerId: 'other' },
      timestamp: Date.now(),
    })

    await vi.waitFor(() => {
      expect(evaluations).toHaveLength(1)
    })

    expect(evaluations[0].result.matched).toBe(false)
    expect(evaluations[0].result.reason).toContain('Expected timerId to equal "expected"')
    expect(pluginManager.executeAction).not.toHaveBeenCalled()

    ruleEngine.stop()
  })

  it('emits rule errors when action execution fails', async () => {
    const eventBus = new EventBus({ logger: createMockLogger() })
    const stores = new DataStores()
    const pluginManager = {
      executeAction: vi.fn().mockRejectedValue(new Error('Action failed')),
    }
    const ruleEngine = new RuleEngine(eventBus, stores.rules, pluginManager as never, { logger: createMockLogger() })
    ruleEngine.start()

    stores.rules.save(createRule())

    const errors: unknown[] = []
    eventBus.on('rule.error', (payload) => errors.push(payload))

    eventBus.emitPluginTrigger({
      pluginId: 'system',
      triggerId: 'timer.completed',
      data: {},
      timestamp: Date.now(),
    })

    await vi.waitFor(() => {
      expect(errors).toHaveLength(1)
    })

    expect((errors[0] as { error: string }).error).toBe('Action failed')
    expect(pluginManager.executeAction).toHaveBeenCalled()

    ruleEngine.stop()
  })
})
