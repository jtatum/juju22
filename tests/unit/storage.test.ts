import { describe, expect, it } from 'vitest'
import { DataStores } from '@main/core/storage'

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
    stores.rules.upsertRule('rule-1', { test: true })

    const stored = stores.rules.getRule('rule-1')
    expect(stored).toBeDefined()
    expect(stored?.definition).toEqual({ test: true })
    expect(stores.rules.listRules()).toHaveLength(1)

    stores.rules.deleteRule('rule-1')
    expect(stores.rules.getRule('rule-1')).toBeUndefined()
  })
})
