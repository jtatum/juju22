import type { RuleEngine } from './rule-engine'

const DEMO_RULE_ID = 'demo.timer-notification'

export const ensureDemoRules = (ruleEngine: RuleEngine) => {
  const existing = ruleEngine.getRule(DEMO_RULE_ID)
  if (existing) return existing

  return ruleEngine.saveRule({
    id: DEMO_RULE_ID,
    name: 'Demo: Timer Completed Notification',
    description: 'Sends a notification through the System plugin whenever the demo timer finishes.',
    trigger: {
      pluginId: 'system',
      triggerId: 'timer.completed',
    },
    conditions: [
      {
        type: 'includes',
        path: 'timerId',
        value: 'demo',
      },
    ],
    actions: [
      {
        pluginId: 'system',
        actionId: 'notification.send',
        params: {
          title: 'Demo Timer',
          message: 'The demo timer has completed.',
        },
      },
    ],
    enabled: true,
    priority: 0,
  })
}
