import { describe, expect, it } from 'vitest'
import { DataStores } from '@main/core/storage'
import type { RuleDefinition } from '@shared/rules/types'

const createStores = () => new DataStores()

describe('DataStores', () => {
  it('persists and reads settings', () => {
    const stores = createStores()
    expect(stores.settings.get('theme')).toBe('system')

    stores.settings.set('theme', 'dark')
    expect(stores.settings.get('theme')).toBe('dark')
  })

  it('performs rule CRUD operations', () => {
    const stores = createStores()
    const rule: RuleDefinition = {
      id: 'rule-1',
      name: 'Timer to Notification',
      trigger: { pluginId: 'system', triggerId: 'timer.completed' },
      conditions: [
        {
          type: 'equals',
          path: 'timerId',
          value: 'demo',
        },
      ],
      actions: [
        {
          pluginId: 'system',
          actionId: 'notification.send',
          params: { message: 'Timer fired' },
        },
      ],
      enabled: true,
      priority: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    stores.rules.save(rule)

    const stored = stores.rules.getRule('rule-1')
    expect(stored).toBeDefined()
    expect(stored?.actions).toHaveLength(1)
    expect(stored?.trigger.pluginId).toBe('system')
    expect(stores.rules.listRules()).toHaveLength(1)

    stores.rules.deleteRule('rule-1')
    expect(stores.rules.getRule('rule-1')).toBeUndefined()
  })
})
