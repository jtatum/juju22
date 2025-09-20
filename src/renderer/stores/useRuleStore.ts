import { create } from 'zustand'
import type { RuleDefinition, RuleEvaluationResult } from '@shared/rules/types'

type RuleState = {
  rules: RuleDefinition[]
  loading: boolean
  selectedRule: RuleDefinition | null
  error: string | null
  fetchRules: () => Promise<void>
  getRule: (id: string) => Promise<RuleDefinition | null>
  saveRule: (rule: RuleDefinition) => Promise<RuleDefinition>
  deleteRule: (id: string) => Promise<void>
  testRule: (rule: RuleDefinition, sample: unknown) => Promise<RuleEvaluationResult>
  setSelected: (rule: RuleDefinition | null) => void
}

export const useRuleStore = create<RuleState>((set) => ({
  rules: [],
  loading: false,
  selectedRule: null,
  error: null,
  async fetchRules() {
    set({ loading: true, error: null })
    try {
      const rules = await window.juju22.rules.list()
      set({ rules })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) })
    } finally {
      set({ loading: false })
    }
  },
  async getRule(id) {
    const rule = await window.juju22.rules.get(id)
    set({ selectedRule: rule })
    return rule
  },
  async saveRule(rule) {
    const saved = await window.juju22.rules.save(rule)
    set((state) => {
      const existingIndex = state.rules.findIndex((entry) => entry.id === saved.id)
      const next = [...state.rules]
      if (existingIndex >= 0) {
        next.splice(existingIndex, 1, saved)
      } else {
        next.unshift(saved)
      }
      return { rules: next, selectedRule: saved }
    })
    return saved
  },
  async deleteRule(id) {
    await window.juju22.rules.delete(id)
    set((state) => ({
      rules: state.rules.filter((rule) => rule.id !== id),
      selectedRule: state.selectedRule?.id === id ? null : state.selectedRule,
    }))
  },
  async testRule(rule, sample) {
    const result = await window.juju22.rules.test(rule, sample)
    return result
  },
  setSelected(rule) {
    set({ selectedRule: rule })
  },
}))
