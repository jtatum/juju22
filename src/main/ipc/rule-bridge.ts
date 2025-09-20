import * as electron from 'electron'
import type { RuleEngine } from '../core/rule-engine'
import type { RuleDefinition } from '../../shared/rules/types'

export const registerRuleBridge = (ruleEngine: RuleEngine) => {
  const { ipcMain } = electron

  ipcMain.handle('rules:list', () => ruleEngine.listRules())

  ipcMain.handle('rules:get', (_event, ruleId: string) => ruleEngine.getRule(ruleId) ?? null)

  ipcMain.handle('rules:save', (_event, rule: RuleDefinition) => ruleEngine.saveRule(rule))

  ipcMain.handle('rules:delete', (_event, ruleId: string) => {
    ruleEngine.deleteRule(ruleId)
    return { status: 'ok' }
  })

  ipcMain.handle('rules:test', (_event, payload: { rule: RuleDefinition; data: unknown }) => {
    const { rule, data } = payload
    return ruleEngine.testRule(rule, data)
  })
}
