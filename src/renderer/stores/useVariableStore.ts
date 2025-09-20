import { create } from 'zustand'
import type { VariableMutation, VariableRecord, VariableScope, VariableSnapshot } from '@shared/variables/types'

type VariableQuery = {
  scope: VariableScope
  ownerId?: string
}

type VariableState = {
  items: VariableRecord[]
  loading: boolean
  error: string | null
  lastQuery: VariableQuery | null
  fetch: (scope: VariableScope, ownerId?: string) => Promise<void>
  setValue: (scope: VariableScope, key: string, value: unknown, ownerId?: string) => Promise<VariableRecord>
  increment: (scope: VariableScope, key: string, amount?: number, ownerId?: string) => Promise<VariableRecord>
  reset: (scope: VariableScope, key: string, ownerId?: string) => Promise<void>
  snapshot: (ruleId: string, pluginId: string) => Promise<VariableSnapshot>
  applyMutation: (mutation: VariableMutation) => void
}

export const useVariableStore = create<VariableState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  lastQuery: null,
  async fetch(scope, ownerId) {
    set({ loading: true, error: null })
    try {
      const items = await window.aidle.variables.list(scope, ownerId)
      set({ items, lastQuery: { scope, ownerId } })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) })
    } finally {
      set({ loading: false })
    }
  },
  async setValue(scope, key, value, ownerId) {
    const record = await window.aidle.variables.set(scope, key, value, ownerId)
    const { lastQuery } = get()
    if (lastQuery && lastQuery.scope === scope && lastQuery.ownerId === ownerId) {
      set((state) => ({
        items: upsertRecord(state.items, record),
      }))
    }
    return record
  },
  async increment(scope, key, amount = 1, ownerId) {
    const record = await window.aidle.variables.increment(scope, key, amount, ownerId)
    const { lastQuery } = get()
    if (lastQuery && lastQuery.scope === scope && lastQuery.ownerId === ownerId) {
      set((state) => ({
        items: upsertRecord(state.items, record),
      }))
    }
    return record
  },
  async reset(scope, key, ownerId) {
    await window.aidle.variables.reset(scope, key, ownerId)
    const { lastQuery } = get()
    if (lastQuery && lastQuery.scope === scope && lastQuery.ownerId === ownerId) {
      set((state) => ({
        items: state.items.filter((record) => !(record.scope === scope && record.ownerId === ownerId && record.key === key)),
      }))
    }
  },
  snapshot: (ruleId, pluginId) => window.aidle.variables.snapshot(ruleId, pluginId),
  applyMutation(mutation) {
    const { lastQuery } = get()
    if (!lastQuery || lastQuery.scope !== mutation.key.scope || lastQuery.ownerId !== mutation.key.ownerId) {
      return
    }

    set((state) => {
      if (mutation.value === undefined) {
        return {
          items: state.items.filter(
            (record) =>
              !(
                record.scope === mutation.key.scope &&
                record.key === mutation.key.key &&
                record.ownerId === mutation.key.ownerId
              ),
          ),
        }
      }

      const existing = state.items.find(
        (record) =>
          record.scope === mutation.key.scope &&
          record.key === mutation.key.key &&
          record.ownerId === mutation.key.ownerId,
      )

      const nextRecord: VariableRecord = {
        scope: mutation.key.scope,
        key: mutation.key.key,
        ownerId: mutation.key.ownerId,
        value: mutation.value,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date(mutation.mutatedAt).toISOString(),
      }

      return {
        items: upsertRecord(state.items, nextRecord),
      }
    })
  },
}))

const upsertRecord = (records: VariableRecord[], record: VariableRecord) => {
  const index = records.findIndex(
    (existing) =>
      existing.scope === record.scope && existing.key === record.key && existing.ownerId === record.ownerId,
  )
  if (index >= 0) {
    const next = [...records]
    next.splice(index, 1, record)
    return next
  }
  return [record, ...records]
}
