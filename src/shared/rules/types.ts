import type { VariableScope, VariableSnapshot } from '../variables/types'

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

export interface PluginActionInvocation {
  kind?: 'plugin'
  pluginId: string
  actionId: string
  params?: Record<string, unknown> | undefined
}

export interface BranchActionClause {
  id?: string
  label?: string
  when?: RuleCondition[]
  actions: RuleActionInvocation[]
}

export interface BranchActionInvocation {
  kind: 'branch'
  branches: BranchActionClause[]
  otherwise?: RuleActionInvocation[]
}

export interface LoopActionInvocation {
  kind: 'loop'
  actions: RuleActionInvocation[]
  maxIterations?: number
  forEach?: {
    path: string
    as?: string
  }
  delayMs?: number
}

export interface RandomActionInvocation {
  kind: 'random'
  from: RuleActionInvocation[]
  pick?: number
  unique?: boolean
}

export interface ScriptActionInvocation {
  kind: 'script'
  code: string
  timeoutMs?: number
  permissions?: string[]
  arguments?: Record<string, unknown>
}

export interface VariableActionInvocation {
  kind: 'variable'
  scope: VariableScope
  operation: 'set' | 'increment' | 'reset'
  key: string
  value?: unknown
  amount?: number | string
}

export type RuleActionInvocation =
  | PluginActionInvocation
  | BranchActionInvocation
  | LoopActionInvocation
  | RandomActionInvocation
  | ScriptActionInvocation
  | VariableActionInvocation

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
  payload: unknown
  variables: VariableSnapshot
  locals?: Record<string, unknown>
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
