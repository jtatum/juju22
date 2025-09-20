import type { EventBus } from './event-bus'
import type { PluginManager } from './plugin-manager'
import type { RuleRepository } from './storage'
import type { PluginEventPayload } from '../../shared/plugins/types'
import type {
  RuleActionDispatchEvent,
  RuleCondition,
  RuleDefinition,
  RuleEvaluationContext,
  RuleEvaluationResult,
} from '../../shared/rules/types'
import type { RuleErrorEvent } from '../../shared/events/types'
import { createLogger, Logger } from './logger'

export interface RuleEngineOptions {
  logger?: Logger
}

export class RuleEngine {
  private readonly eventBus: EventBus
  private readonly repository: RuleRepository
  private readonly pluginManager: PluginManager
  private readonly logger: Logger
  private unsubscribe: (() => void) | null = null

  constructor(eventBus: EventBus, repository: RuleRepository, pluginManager: PluginManager, options?: RuleEngineOptions) {
    this.eventBus = eventBus
    this.repository = repository
    this.pluginManager = pluginManager
    this.logger = options?.logger ?? createLogger('RuleEngine')
  }

  start() {
    if (this.unsubscribe) return
    this.logger.info('Rule engine started')
    this.unsubscribe = this.eventBus.onPluginTrigger((payload) => {
      void this.handleTrigger(payload)
    })
  }

  stop() {
    if (!this.unsubscribe) return
    this.logger.info('Rule engine stopped')
    this.unsubscribe()
    this.unsubscribe = null
  }

  listRules() {
    return this.repository.listRules()
  }

  getRule(id: string) {
    return this.repository.getRule(id)
  }

  saveRule(rule: RuleDefinition) {
    const timestamps = ensureTimestamps(rule)
    this.repository.save(timestamps)
    return timestamps
  }

  deleteRule(id: string) {
    this.repository.deleteRule(id)
  }

  testRule(rule: RuleDefinition, data: unknown): RuleEvaluationResult {
    return evaluateRule(rule, data)
  }

  private async handleTrigger(payload: PluginEventPayload) {
    const rules = this.repository.listByTrigger({ pluginId: payload.pluginId, triggerId: payload.triggerId })
    if (rules.length === 0) {
      return
    }

    const context: RuleEvaluationContext = {
      trigger: { pluginId: payload.pluginId, triggerId: payload.triggerId },
      eventTimestamp: payload.timestamp,
    }

    const matchedSummaries: PluginEventPayload['matchedRules'] = []

    for (const rule of rules) {
      try {
        const evaluation = evaluateRule(rule, payload.data)
        matchedSummaries.push({ ruleId: rule.id, matched: evaluation.matched, reason: evaluation.reason })
        this.eventBus.emit({
          type: 'rule.evaluation',
          payload: {
            ruleId: rule.id,
            context,
            result: evaluation,
          },
        })

        if (!evaluation.matched) {
          continue
        }

        await this.dispatchActions(rule, payload)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        this.logger.error(`Error while processing rule ${rule.id}`, { error })
        const ruleError: RuleErrorEvent = {
          ruleId: rule.id,
          error: message,
          details: error instanceof Error ? { stack: error.stack } : undefined,
          occurredAt: Date.now(),
        }
        this.eventBus.emit({ type: 'rule.error', payload: ruleError })
      }
    }

    if (matchedSummaries.length > 0) {
      payload.matchedRules = matchedSummaries
    }
  }

  private async dispatchActions(rule: RuleDefinition, payload: PluginEventPayload) {
    for (const action of rule.actions) {
      const dispatchEvent: RuleActionDispatchEvent = {
        ruleId: rule.id,
        action,
        dispatchedAt: Date.now(),
      }

      try {
        await this.pluginManager.executeAction(action.pluginId, action.actionId, {
          ...(action.params ?? {}),
          __sourceRule: rule.id,
          __sourceEvent: {
            pluginId: payload.pluginId,
            triggerId: payload.triggerId,
            timestamp: payload.timestamp,
          },
        })
        this.eventBus.emit({ type: 'rule.action', payload: dispatchEvent })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        this.logger.error(`Failed to dispatch action ${action.actionId} for rule ${rule.id}`, { error })
        const ruleError: RuleErrorEvent = {
          ruleId: rule.id,
          error: message,
          details: {
            action: dispatchEvent,
            error: error instanceof Error ? { stack: error.stack } : undefined,
          },
          occurredAt: Date.now(),
        }
        this.eventBus.emit({ type: 'rule.error', payload: ruleError })
      }
    }
  }
}

const ensureTimestamps = (rule: RuleDefinition): RuleDefinition => {
  const now = new Date().toISOString()
  return {
    ...rule,
    createdAt: rule.createdAt ?? now,
    updatedAt: now,
  }
}

const evaluateRule = (rule: RuleDefinition, data: unknown): RuleEvaluationResult => {
  if (!rule.conditions || rule.conditions.length === 0) {
    return { ruleId: rule.id, matched: true }
  }

  for (const condition of rule.conditions) {
    const satisfied = evaluateCondition(condition, data)
    if (!satisfied) {
      return {
        ruleId: rule.id,
        matched: false,
        reason: describeConditionFailure(condition),
      }
    }
  }

  return { ruleId: rule.id, matched: true }
}

const evaluateCondition = (condition: RuleCondition, data: unknown): boolean => {
  const value = extractValue(data, condition.path)
  switch (condition.type) {
    case 'equals':
      return deepEqual(value, condition.value)
    case 'notEquals':
      return !deepEqual(value, condition.value)
    case 'includes':
      if (Array.isArray(value)) {
        return value.some((entry) => deepEqual(entry, condition.value))
      }
      if (typeof value === 'string') {
        return typeof condition.value === 'string' ? value.includes(condition.value) : false
      }
      return false
    default: {
      const exhaustive: never = condition
      void exhaustive
      throw new Error(`Unsupported condition type ${(condition as { type: string }).type}`)
    }
  }
}

const describeConditionFailure = (condition: RuleCondition) => {
  switch (condition.type) {
    case 'equals':
      return `Expected ${condition.path} to equal ${JSON.stringify(condition.value)}`
    case 'notEquals':
      return `Expected ${condition.path} to differ from ${JSON.stringify(condition.value)}`
    case 'includes':
      return `Expected ${condition.path} to include ${JSON.stringify(condition.value)}`
    default: {
      const exhaustive: never = condition
      void exhaustive
      throw new Error(`Unsupported condition type ${(condition as { type: string }).type}`)
    }
  }
}

const extractValue = (data: unknown, path: string) => {
  if (!path) return undefined
  if (data == null) return undefined

  const segments = path.split('.')
  let current: unknown = data
  for (const segment of segments) {
    if (typeof current !== 'object' || current === null) {
      return undefined
    }
    if (Array.isArray(current)) {
      const index = Number(segment)
      if (Number.isNaN(index)) {
        return undefined
      }
      current = current[index]
    } else {
      current = (current as Record<string, unknown>)[segment]
    }
  }
  return current
}

const deepEqual = (a: unknown, b: unknown) => {
  if (a === b) return true
  if (typeof a !== typeof b) return false
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((value, index) => deepEqual(value, b[index]))
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a as Record<string, unknown>)
    const keysB = Object.keys(b as Record<string, unknown>)
    if (keysA.length !== keysB.length) return false
    return keysA.every((key) => deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
  }
  return false
}
