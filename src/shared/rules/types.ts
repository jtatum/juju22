export interface RuleTriggerRef {
  pluginId: string
  triggerId: string
}

export type RuleCondition =
  | {
      type: 'equals'
      path: string
      value: unknown
    }
  | {
      type: 'notEquals'
      path: string
      value: unknown
    }
  | {
      type: 'includes'
      path: string
      value: unknown
    }

export interface RuleActionInvocation {
  pluginId: string
  actionId: string
  params?: Record<string, unknown> | undefined
}

export interface RuleDefinition {
  id: string
  name: string
  description?: string
  trigger: RuleTriggerRef
  conditions?: RuleCondition[]
  actions: RuleActionInvocation[]
  enabled: boolean
  priority: number
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface RuleEvaluationContext {
  trigger: RuleTriggerRef
  eventTimestamp: number
}

export interface RuleEvaluationResult {
  ruleId: string
  matched: boolean
  reason?: string
}

export interface RuleActionDispatchEvent {
  ruleId: string
  action: RuleActionInvocation
  dispatchedAt: number
}
