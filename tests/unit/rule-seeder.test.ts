import { describe, expect, it, vi } from 'vitest'
import { ensureDemoRules } from '@main/core/rule-seeder'

const createRuleEngineMock = () => ({
  getRule: vi.fn(() => null),
  saveRule: vi.fn((rule) => rule),
})

describe('ensureDemoRules', () => {
  it('creates the demo rule when missing', () => {
    const ruleEngine = createRuleEngineMock()
    const rule = ensureDemoRules(ruleEngine as never)

    expect(ruleEngine.saveRule).toHaveBeenCalled()
    expect(rule?.id).toBe('demo.timer-notification')
  })

  it('skips creation when rule already exists', () => {
    const ruleEngine = createRuleEngineMock()
    const existingRule = { id: 'demo.timer-notification' }
    ruleEngine.getRule.mockReturnValue(existingRule)

    const result = ensureDemoRules(ruleEngine as never)
    expect(ruleEngine.saveRule).not.toHaveBeenCalled()
    expect(result).toBe(existingRule)
  })
})
