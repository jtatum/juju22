import type { RuleEvaluationContext } from '../../shared/rules/types'
import type { VariableScope } from '../../shared/variables/types'

const TOKEN_PATTERN = /{{\s*([^{}]+)\s*}}/g
const MAX_DEPTH = 6
const MAX_STRING_LENGTH = 10_000

export interface ExpressionEnvironment {
  context: RuleEvaluationContext
}

export const resolveExpressions = <T>(input: T, env: ExpressionEnvironment): T => {
  return resolveValue(input, env, 0) as T
}

const resolveValue = (value: unknown, env: ExpressionEnvironment, depth: number): unknown => {
  if (depth > MAX_DEPTH) {
    throw new Error('Exceeded maximum expression resolution depth')
  }

  if (typeof value === 'string') {
    return resolveString(value, env)
  }

  if (Array.isArray(value)) {
    return value.map((entry) => resolveValue(entry, env, depth + 1))
  }

  if (value && typeof value === 'object') {
    const next: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value)) {
      next[key] = resolveValue(entry, env, depth + 1)
    }
    return next
  }

  return value
}

const resolveString = (value: string, env: ExpressionEnvironment) => {
  if (!value.includes('{{')) {
    return value
  }

  const trimmed = value.trim()
  const isPureExpression = trimmed.startsWith('{{') && trimmed.endsWith('}}') && trimmed.match(TOKEN_PATTERN)?.length === 1

  if (isPureExpression) {
    const expression = trimmed.slice(2, -2)
    return evaluateExpression(expression, env)
  }

  const replaced = value.replace(TOKEN_PATTERN, (_, expression: string) => {
    const result = evaluateExpression(expression, env)
    if (result == null) {
      return ''
    }
    if (typeof result === 'object') {
      return JSON.stringify(result)
    }
    return String(result)
  })

  if (replaced.length > MAX_STRING_LENGTH) {
    return replaced.slice(0, MAX_STRING_LENGTH)
  }

  return replaced
}

const evaluateExpression = (rawExpression: string, env: ExpressionEnvironment): unknown => {
  const [pathPart, ...filters] = rawExpression.split('|').map((segment) => segment.trim()).filter(Boolean)
  if (!pathPart) {
    return undefined
  }

  let value = resolvePath(pathPart, env)

  for (const filter of filters) {
    value = applyFilter(filter, value)
  }

  return value
}

const applyFilter = (filter: string, value: unknown): unknown => {
  switch (filter) {
    case 'upper':
      return typeof value === 'string' ? value.toUpperCase() : value
    case 'lower':
      return typeof value === 'string' ? value.toLowerCase() : value
    case 'json':
      return JSON.stringify(value)
    case 'number':
      if (typeof value === 'number') {
        return value
      }
      if (typeof value === 'string') {
        const parsed = Number(value)
        return Number.isNaN(parsed) ? value : parsed
      }
      return value
    default:
      return value
  }
}

const resolvePath = (path: string, env: ExpressionEnvironment): unknown => {
  const segments = path.split('.').map((segment) => segment.trim()).filter(Boolean)
  if (segments.length === 0) {
    return undefined
  }

  const [root, ...rest] = segments

  switch (root) {
    case 'variables': {
      const [scopeSegment, ...scopePath] = rest
      if (!isVariableScope(scopeSegment)) {
        return undefined
      }
      const scopeValues = env.context.variables[scopeSegment]
      return getPathValue(scopeValues, scopePath)
    }
    case 'payload':
      return getPathValue(env.context.payload, rest)
    case 'context': {
      const [contextRoot, ...contextRest] = rest
      if (contextRoot === 'payload') {
        return getPathValue(env.context.payload, contextRest)
      }
      if (contextRoot === 'trigger') {
        return getPathValue(env.context.trigger, contextRest)
      }
      if (contextRoot === 'locals') {
        return getPathValue(env.context.locals ?? {}, contextRest)
      }
      if (contextRoot === 'variables') {
        const [scopeSegment, ...scopePath] = contextRest
        if (!isVariableScope(scopeSegment)) {
          return undefined
        }
        return getPathValue(env.context.variables[scopeSegment], scopePath)
      }
      return undefined
    }
    case 'trigger':
      return getPathValue(env.context.trigger, rest)
    case 'locals':
      return getPathValue(env.context.locals ?? {}, rest)
    default:
      return undefined
  }
}

const getPathValue = (input: unknown, segments: string[]): unknown => {
  let current: unknown = input
  for (const segment of segments) {
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

const isVariableScope = (value: string | undefined): value is VariableScope => {
  return value === 'global' || value === 'plugin' || value === 'rule'
}
