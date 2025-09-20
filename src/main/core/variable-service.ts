import type { EventBus } from './event-bus'
import type { VariableRepository } from './storage'
import { createLogger, Logger } from './logger'
import type {
  VariableKey,
  VariableMutation,
  VariableRecord,
  VariableScope,
  VariableSnapshot,
} from '../../shared/variables/types'

export interface VariableServiceOptions {
  logger?: Logger
}

export class VariableService {
  private readonly repository: VariableRepository
  private readonly eventBus: EventBus
  private readonly logger: Logger

  constructor(repository: VariableRepository, eventBus: EventBus, options?: VariableServiceOptions) {
    this.repository = repository
    this.eventBus = eventBus
    this.logger = options?.logger ?? createLogger('VariableService')
  }

  getSnapshot(ruleId: string, pluginId: string): VariableSnapshot {
    return this.repository.getSnapshot(ruleId, pluginId)
  }

  list(scope: VariableScope, ownerId?: string): VariableRecord[] {
    return this.repository.list(scope, ownerId)
  }

  getValue(key: VariableKey): unknown {
    return this.repository.getValue(key)?.value
  }

  setValue(key: VariableKey, value: unknown, source?: VariableMutation['source']): VariableRecord {
    const previous = this.repository.getValue(key)?.value
    const record = this.repository.setValue(key, value)
    this.publishMutation(record, previous, source)
    return record
  }

  incrementValue(key: VariableKey, amount: number, source?: VariableMutation['source']): VariableRecord {
    const previous = this.repository.getValue(key)?.value
    let numericPrevious = typeof previous === 'number' ? previous : undefined
    if (previous === undefined) {
      numericPrevious = 0
    }
    const record = this.repository.incrementValue(key, amount)
    this.publishMutation(record, numericPrevious, source)
    return record
  }

  deleteValue(key: VariableKey, source?: VariableMutation['source']): boolean {
    const existing = this.repository.getValue(key)
    if (!existing) {
      return false
    }
    const deleted = this.repository.deleteValue(key)
    if (deleted) {
      this.publishMutation(
        { ...existing, value: undefined },
        existing.value,
        source,
      )
    }
    return deleted
  }

  createScopedAccessor(ruleId: string, pluginId: string) {
    const buildKey = (scope: VariableScope, key: string, ownerId?: string): VariableKey => {
      if (!key) {
        throw new Error('Variable key is required')
      }
      return {
        scope,
        key,
        ownerId: ownerId ?? inferOwner(scope, ruleId, pluginId),
      }
    }

    const buildApi = (scope: VariableScope, ownerId?: string) => ({
      get: (key: string) => this.getValue(buildKey(scope, key, ownerId)),
      set: (key: string, value: unknown) =>
        this.setValue(buildKey(scope, key, ownerId), value, { type: 'rule', id: ruleId }),
      increment: (key: string, amount = 1) =>
        this.incrementValue(buildKey(scope, key, ownerId), amount, { type: 'rule', id: ruleId }),
      reset: (key: string) => this.deleteValue(buildKey(scope, key, ownerId), { type: 'rule', id: ruleId }),
    })

    return {
      global: buildApi('global'),
      plugin: buildApi('plugin'),
      rule: buildApi('rule'),
    }
  }

  private publishMutation(record: VariableRecord, previousValue: unknown, source?: VariableMutation['source']) {
    const mutation: VariableMutation = {
      key: {
        scope: record.scope,
        key: record.key,
        ownerId: record.ownerId,
      },
      value: record.value,
      previousValue,
      mutatedAt: Date.now(),
      source,
    }

    this.logger.debug('Variable mutated', {
      scope: record.scope,
      key: record.key,
      ownerId: record.ownerId,
      source,
    })

    this.eventBus.emitVariableMutation(mutation)
  }
}

const inferOwner = (scope: VariableScope, ruleId: string, pluginId: string) => {
  switch (scope) {
    case 'global':
      return undefined
    case 'plugin':
      return pluginId
    case 'rule':
      return ruleId
    default:
      return undefined
  }
}
