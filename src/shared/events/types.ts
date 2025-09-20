import type { PluginEventPayload, PluginStatusPayload } from '../plugins/types'
import type {
  RuleActionDispatchEvent,
  RuleEvaluationContext,
  RuleEvaluationResult,
} from '../rules/types'
import type { VariableMutation } from '../variables/types'
import type { MigrationEvent } from '../../main/core/migrations/types'
import type { SystemEvent } from './system-events'

export interface RuleEvaluationEvent {
  ruleId: string
  context: RuleEvaluationContext
  result: RuleEvaluationResult
}

export interface RuleErrorEvent {
  ruleId?: string
  error: string
  details?: unknown
  occurredAt: number
}

export type AidleEvent =
  | { type: 'plugin.trigger'; payload: PluginEventPayload }
  | { type: 'plugin.status'; payload: PluginStatusPayload }
  | { type: 'rule.evaluation'; payload: RuleEvaluationEvent }
  | { type: 'rule.action'; payload: RuleActionDispatchEvent }
  | { type: 'rule.error'; payload: RuleErrorEvent }
  | { type: 'variables.mutated'; payload: VariableMutation }
  | { type: 'system.migration'; payload: MigrationEvent }
  | SystemEvent

export interface EventLogEntry {
  type: AidleEvent['type']
  payload: AidleEvent['payload']
  timestamp: number
}
