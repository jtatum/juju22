import vm from 'node:vm'
import type { EventBus } from './event-bus'
import type { PluginManager } from './plugin-manager'
import type { RuleRepository } from './storage'
import type { VariableService } from './variable-service'
import type { PluginEventPayload } from '../../shared/plugins/types'
import type {
  BranchActionInvocation,
  LoopActionInvocation,
  PluginActionInvocation,
  RandomActionInvocation,
  RuleActionDispatchEvent,
  RuleActionInvocation,
  RuleCondition,
  RuleDefinition,
  RuleEvaluationContext,
  RuleEvaluationResult,
  ScriptActionInvocation,
  VariableActionInvocation,
} from '../../shared/rules/types'
import type { RuleErrorEvent } from '../../shared/events/types'
import type { VariableKey, VariableScope } from '../../shared/variables/types'
import { createLogger, Logger } from './logger'
import { resolveExpressions } from './expression-resolver'

export interface RuleEngineOptions {
  logger?: Logger
}

export class RuleEngine {
  private static readonly MAX_ACTION_DEPTH = 8
  private static readonly MAX_LOOP_ITERATIONS = 100
  private static readonly SCRIPT_TIMEOUT_MS = 3000
  private readonly eventBus: EventBus
  private readonly repository: RuleRepository
  private readonly variables: VariableService
  private readonly pluginManager: PluginManager
  private readonly logger: Logger
  private unsubscribe: (() => void) | null = null

  constructor(
    eventBus: EventBus,
    repository: RuleRepository,
    pluginManager: PluginManager,
    variables: VariableService,
    options?: RuleEngineOptions,
  ) {
    this.eventBus = eventBus
    this.repository = repository
    this.pluginManager = pluginManager
    this.variables = variables
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
    const context: RuleEvaluationContext = {
      trigger: rule.trigger,
      eventTimestamp: Date.now(),
      payload: data,
      variables: this.variables.getSnapshot(rule.id, rule.trigger.pluginId),
      locals: {},
    }
    return evaluateRule(rule, data, context)
  }

  private async handleTrigger(payload: PluginEventPayload) {
    const rules = this.repository.listByTrigger({ pluginId: payload.pluginId, triggerId: payload.triggerId })
    if (rules.length === 0) {
      return
    }

    const matchedSummaries: PluginEventPayload['matchedRules'] = []

    for (const rule of rules) {
      try {
        const context: RuleEvaluationContext = {
          trigger: { pluginId: payload.pluginId, triggerId: payload.triggerId },
          eventTimestamp: payload.timestamp,
          payload: payload.data,
          variables: this.variables.getSnapshot(rule.id, payload.pluginId),
          locals: {},
        }
        const evaluation = evaluateRule(rule, payload.data, context)
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

        await this.dispatchActions(rule, payload, context)
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

  private async dispatchActions(rule: RuleDefinition, payload: PluginEventPayload, context: RuleEvaluationContext) {
    await this.executeActionSequence(rule, rule.actions, payload, context, 0)
  }

  private async executeActionSequence(
    rule: RuleDefinition,
    actions: RuleActionInvocation[],
    payload: PluginEventPayload,
    context: RuleEvaluationContext,
    depth: number,
  ) {
    if (!actions || actions.length === 0) {
      return
    }

    if (depth > RuleEngine.MAX_ACTION_DEPTH) {
      throw new Error(`Maximum action depth exceeded for rule ${rule.id}`)
    }

    for (const action of actions) {
      await this.executeActionNode(rule, action, payload, context, depth)
    }
  }

  private async executeActionNode(
    rule: RuleDefinition,
    action: RuleActionInvocation,
    payload: PluginEventPayload,
    context: RuleEvaluationContext,
    depth: number,
  ) {
    switch (action.kind ?? 'plugin') {
      case 'plugin':
        await this.executePluginAction(rule, action as PluginActionInvocation, payload, context)
        return
      case 'branch':
        await this.executeBranchAction(rule, action as BranchActionInvocation, payload, context, depth + 1)
        return
      case 'loop':
        await this.executeLoopAction(rule, action as LoopActionInvocation, payload, context, depth + 1)
        return
      case 'random':
        await this.executeRandomAction(rule, action as RandomActionInvocation, payload, context, depth + 1)
        return
      case 'script':
        await this.executeScriptAction(rule, action as ScriptActionInvocation, payload, context)
        return
      case 'variable':
        await this.executeVariableAction(rule, action as VariableActionInvocation, payload, context)
        return
      default:
        this.logger.warn(`Encountered unsupported action kind ${(action as { kind?: string }).kind ?? 'plugin'} in rule ${rule.id}`)
    }
  }

  private async executePluginAction(
    rule: RuleDefinition,
    action: PluginActionInvocation,
    payload: PluginEventPayload,
    context: RuleEvaluationContext,
  ) {
    const dispatchEvent: RuleActionDispatchEvent = {
      ruleId: rule.id,
      action,
      dispatchedAt: Date.now(),
    }

    try {
      const resolvedParams = action.params ? resolveExpressions(action.params, { context }) : undefined

      await this.pluginManager.executeAction(action.pluginId, action.actionId, {
        ...(resolvedParams ?? {}),
        __sourceRule: rule.id,
        __sourceEvent: {
          pluginId: payload.pluginId,
          triggerId: payload.triggerId,
          timestamp: payload.timestamp,
        },
        __context: context,
      })

      this.eventBus.emit({ type: 'rule.action', payload: dispatchEvent })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error(`Failed to dispatch plugin action ${action.actionId} for rule ${rule.id}`, { error })
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

  private async executeBranchAction(
    rule: RuleDefinition,
    action: BranchActionInvocation,
    payload: PluginEventPayload,
    context: RuleEvaluationContext,
    depth: number,
  ) {
    for (const clause of action.branches) {
      const matches = !clause.when || clause.when.length === 0 || clause.when.every((condition) => evaluateCondition(condition, payload.data, context))
      if (matches) {
        await this.executeActionSequence(rule, clause.actions, payload, context, depth)
        return
      }
    }

    if (action.otherwise && action.otherwise.length > 0) {
      await this.executeActionSequence(rule, action.otherwise, payload, context, depth)
    }
  }

  private async executeLoopAction(
    rule: RuleDefinition,
    action: LoopActionInvocation,
    payload: PluginEventPayload,
    context: RuleEvaluationContext,
    depth: number,
  ) {
    const configuredLimit = action.maxIterations ?? (action.forEach ? Number.MAX_SAFE_INTEGER : 1)
    const limit = Math.min(Math.max(configuredLimit, 0), RuleEngine.MAX_LOOP_ITERATIONS)
    if (limit <= 0) {
      return
    }

    const delayMs = Math.max(action.delayMs ?? 0, 0)

    if (action.forEach) {
      const collection = extractValue(payload.data, action.forEach.path, context)
      if (!Array.isArray(collection)) {
        this.logger.warn(`Loop forEach path '${action.forEach.path}' did not resolve to an array in rule ${rule.id}`)
        return
      }

      const alias = action.forEach.as ?? 'item'
      const iterations = Math.min(limit, collection.length)
      for (let index = 0; index < iterations; index += 1) {
        const scopedContext = this.withLocals(context, {
          [alias]: collection[index],
          $index: index,
          $value: collection[index],
        })
        await this.executeActionSequence(rule, action.actions, payload, scopedContext, depth)
        if (delayMs > 0) {
          await delay(delayMs)
        }
      }
      return
    }

    for (let index = 0; index < limit; index += 1) {
      const scopedContext = this.withLocals(context, { $index: index })
      await this.executeActionSequence(rule, action.actions, payload, scopedContext, depth)
      if (delayMs > 0) {
        await delay(delayMs)
      }
    }
  }

  private async executeRandomAction(
    rule: RuleDefinition,
    action: RandomActionInvocation,
    payload: PluginEventPayload,
    context: RuleEvaluationContext,
    depth: number,
  ) {
    if (!action.from || action.from.length === 0) {
      return
    }

    const pool = [...action.from]
    const pick = Math.max(
      1,
      Math.min(action.pick ?? 1, action.unique === false ? RuleEngine.MAX_LOOP_ITERATIONS : pool.length),
    )

    if (action.unique === false) {
      for (let index = 0; index < pick; index += 1) {
        const chosen = pool[Math.floor(Math.random() * pool.length)]
        await this.executeActionNode(rule, chosen, payload, context, depth)
      }
      return
    }

    shuffle(pool)
    const selection = pool.slice(0, Math.min(pick, pool.length))
    for (const chosen of selection) {
      await this.executeActionNode(rule, chosen, payload, context, depth)
    }
  }

  private async executeScriptAction(
    rule: RuleDefinition,
    action: ScriptActionInvocation,
    payload: PluginEventPayload,
    context: RuleEvaluationContext,
  ) {
    try {
      const timeout = Math.min(Math.max(action.timeoutMs ?? RuleEngine.SCRIPT_TIMEOUT_MS, 1), 10_000)
      const sandbox = vm.createContext({
        console: this.createScriptConsole(rule.id),
        context,
        variables: this.variables.createScopedAccessor(rule.id, payload.pluginId),
        args: action.arguments ?? {},
        helpers: {
          setLocal: (key: string, value: unknown) => {
            context.locals = {
              ...(context.locals ?? {}),
              [key]: value,
            }
          },
        },
      })

      const script = new vm.Script(action.code, {
        filename: `rule-${rule.id}-script.js`,
      })

      script.runInContext(sandbox, { timeout })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error(`Script action failed for rule ${rule.id}`, { error })
      const ruleError: RuleErrorEvent = {
        ruleId: rule.id,
        error: message,
        details: {
          action,
          error: error instanceof Error ? { stack: error.stack } : undefined,
        },
        occurredAt: Date.now(),
      }
      this.eventBus.emit({ type: 'rule.error', payload: ruleError })
    }
  }

  private async executeVariableAction(
    rule: RuleDefinition,
    action: VariableActionInvocation,
    payload: PluginEventPayload,
    context: RuleEvaluationContext,
  ) {
    if (!action.key) {
      this.logger.warn(`Variable action missing key in rule ${rule.id}`)
      return
    }

    const variableKey = this.buildVariableKey(action.scope, action.key, rule, payload)
    const source = { type: 'rule' as const, id: rule.id }

    try {
      switch (action.operation) {
        case 'set': {
          const resolvedValue = action.value !== undefined ? resolveExpressions(action.value, { context }) : null
          this.variables.setValue(variableKey, resolvedValue, source)
          break
        }
        case 'increment': {
          const rawAmount = action.amount ?? 1
          const resolvedAmount = resolveExpressions(rawAmount, { context })
          const numericAmount = typeof resolvedAmount === 'number' ? resolvedAmount : Number(resolvedAmount)
          if (Number.isNaN(numericAmount)) {
            throw new Error(`Increment amount for variable '${action.key}' must be numeric`)
          }
          this.variables.incrementValue(variableKey, numericAmount, source)
          break
        }
        case 'reset': {
          this.variables.deleteValue(variableKey, source)
          break
        }
        default:
          this.logger.warn(`Unsupported variable operation ${(action as { operation?: string }).operation} in rule ${rule.id}`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error(`Variable action failed for rule ${rule.id}`, { error })
      const ruleError: RuleErrorEvent = {
        ruleId: rule.id,
        error: message,
        details: {
          action,
          error: error instanceof Error ? { stack: error.stack } : undefined,
        },
        occurredAt: Date.now(),
      }
      this.eventBus.emit({ type: 'rule.error', payload: ruleError })
    }
  }

  private withLocals(context: RuleEvaluationContext, updates: Record<string, unknown>) {
    return {
      ...context,
      locals: {
        ...(context.locals ?? {}),
        ...updates,
      },
    }
  }

  private buildVariableKey(
    scope: VariableScope,
    key: string,
    rule: RuleDefinition,
    payload: PluginEventPayload,
  ): VariableKey {
    if (!key) {
      throw new Error('Variable key is required')
    }

    switch (scope) {
      case 'global':
        return { scope, key }
      case 'plugin':
        return { scope, key, ownerId: payload.pluginId }
      case 'rule':
        return { scope, key, ownerId: rule.id }
      default: {
        const exhaustive: never = scope
        void exhaustive
        throw new Error(`Unsupported variable scope ${(scope as string) ?? 'unknown'}`)
      }
    }
  }

  private createScriptConsole(ruleId: string) {
    return {
      log: (...args: unknown[]) => this.logger.info(`Rule ${ruleId} script log`, { args }),
      warn: (...args: unknown[]) => this.logger.warn(`Rule ${ruleId} script warn`, { args }),
      error: (...args: unknown[]) => this.logger.error(`Rule ${ruleId} script error`, { args }),
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

const evaluateRule = (
  rule: RuleDefinition,
  data: unknown,
  context?: RuleEvaluationContext,
): RuleEvaluationResult => {
  if (!rule.conditions || rule.conditions.length === 0) {
    return { ruleId: rule.id, matched: true }
  }

  for (const condition of rule.conditions) {
    const satisfied = evaluateCondition(condition, data, context)
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

const evaluateCondition = (
  condition: RuleCondition,
  data: unknown,
  context?: RuleEvaluationContext,
): boolean => {
  const value = extractValue(data, condition.path, context)
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

const extractValue = (data: unknown, path: string, context?: RuleEvaluationContext) => {
  if (!path) return undefined

  const segments = path.split('.').filter(Boolean)
  if (segments.length === 0) {
    return undefined
  }

  const [root, ...rest] = segments

  if (root === 'variables' && context) {
    const [scopeSegment, ...variablePath] = rest
    if (!isVariableScope(scopeSegment)) {
      return undefined
    }
    return dig(context.variables[scopeSegment], variablePath)
  }

  if (root === 'context' && context) {
    const [contextRoot, ...contextPath] = rest
    if (contextRoot === 'payload') {
      return dig(context.payload, contextPath)
    }
    if (contextRoot === 'trigger') {
      return dig(context.trigger, contextPath)
    }
    if (contextRoot === 'locals') {
      return dig(context.locals ?? {}, contextPath)
    }
    if (contextRoot === 'variables') {
      const [scopeSegment, ...variablePath] = contextPath
      if (!isVariableScope(scopeSegment)) {
        return undefined
      }
      return dig(context.variables[scopeSegment], variablePath)
    }
    return undefined
  }

  if (root === 'payload') {
    return dig(context?.payload ?? data, rest)
  }

  if (root === 'locals') {
    return dig(context?.locals ?? {}, rest)
  }

  // Default to event payload for backward compatibility
  return dig(data, segments)
}

const dig = (input: unknown, pathSegments: string[]): unknown => {
  if (pathSegments.length === 0) {
    return input
  }

  let current: unknown = input
  for (const segment of pathSegments) {
    if (current == null) {
      return undefined
    }
    if (Array.isArray(current)) {
      const index = Number(segment)
      if (Number.isNaN(index)) {
        return undefined
      }
      current = current[index]
      continue
    }
    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[segment]
      continue
    }
    return undefined
  }
  return current
}

const isVariableScope = (value: string | undefined): value is VariableScope =>
  value === 'global' || value === 'plugin' || value === 'rule'

const shuffle = <T>(input: T[]) => {
  for (let index = input.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[input[index], input[swapIndex]] = [input[swapIndex], input[index]]
  }
  return input
}

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms)
  })

const deepEqual = (a: unknown, b: unknown): boolean => {
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
