interface RuleRow {
  id: string
  name: string
  description: string | null
  trigger_plugin_id: string
  trigger_id: string
  conditions: string | null
  actions: string
  enabled: number
  priority: number
  tags: string | null
  created_at: string
  updated_at: string
}

interface VariableRow {
  scope: string
  owner_id: string | null
  key: string
  value: string
  created_at: string
  updated_at: string
}

class InMemoryRuleStore {
  private rows = new Map<string, RuleRow>()

  upsert(row: RuleRow) {
    this.rows.set(row.id, row)
  }

  delete(id: string) {
    this.rows.delete(id)
  }

  get(id: string) {
    return this.rows.get(id)
  }

  listAll() {
    return Array.from(this.rows.values()).sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority
      }
      return b.updated_at.localeCompare(a.updated_at)
    })
  }

  listByTrigger(pluginId: string, triggerId: string) {
    return this.listAll().filter(
      (row) => row.trigger_plugin_id === pluginId && row.trigger_id === triggerId && row.enabled === 1,
    )
  }
}

class VariableStore {
  private rows = new Map<string, VariableRow>()

  private key(scope: string, ownerId: string | null, key: string) {
    return `${scope}::${ownerId ?? 'null'}::${key}`
  }

  upsert(row: VariableRow) {
    this.rows.set(this.key(row.scope, row.owner_id, row.key), row)
  }

  delete(scope: string, ownerId: string | null, key: string) {
    this.rows.delete(this.key(scope, ownerId, key))
  }

  get(scope: string, ownerId: string | null, key: string) {
    return this.rows.get(this.key(scope, ownerId, key))
  }

  list(scope: string, ownerId: string | null) {
    return Array.from(this.rows.values())
      .filter((row) => row.scope === scope && (row.owner_id ?? null) === ownerId)
      .sort((a, b) => a.key.localeCompare(b.key))
  }

  snapshot(pluginId: string, ruleId: string) {
    return Array.from(this.rows.values()).filter((row) => {
      if (row.scope === 'global') return true
      if (row.scope === 'plugin') return row.owner_id === pluginId
      if (row.scope === 'rule') return row.owner_id === ruleId
      return false
    })
  }
}

const requireObject = (params: unknown, sql: string) => {
  if (!params || typeof params !== 'object') {
    throw new Error(`Expected parameter object for SQL: ${sql}`)
  }
  return params as Record<string, unknown>
}

const requireString = (value: unknown, field: string) => {
  if (typeof value !== 'string') {
    throw new Error(`Expected string for ${field}`)
  }
  return value
}

class Statement {
  constructor(private readonly db: MockDatabase, private readonly sql: string) {}

  run(params?: unknown) {
    const normalized = this.sql.trim().toLowerCase()

    if (normalized.startsWith('create table')) {
      return this
    }

    if (normalized.startsWith('insert into rule_definitions')) {
      const data = requireObject(params, this.sql)
      const row: RuleRow = {
        id: requireString(data.id, 'id'),
        name: requireString(data.name, 'name'),
        description: data.description == null ? null : String(data.description),
        trigger_plugin_id: requireString(data.trigger_plugin_id, 'trigger_plugin_id'),
        trigger_id: requireString(data.trigger_id, 'trigger_id'),
        conditions: data.conditions == null ? null : String(data.conditions),
        actions: requireString(data.actions, 'actions'),
        enabled: typeof data.enabled === 'number' ? data.enabled : data.enabled ? 1 : 0,
        priority: typeof data.priority === 'number' ? data.priority : 0,
        tags: data.tags == null ? null : String(data.tags),
        created_at: requireString(data.created_at, 'created_at'),
        updated_at: requireString(data.updated_at, 'updated_at'),
      }
      this.db.store.upsert(row)
      return this
    }

    if (normalized.startsWith('delete from rule_definitions')) {
      const id = Array.isArray(params) ? params[0] : params
      if (typeof id === 'string') {
        this.db.store.delete(id)
      }
      return this
    }

    if (normalized.startsWith('insert into variables')) {
      const data = requireObject(params, this.sql)
      const row: VariableRow = {
        scope: requireString(data.scope, 'scope'),
        owner_id: data.ownerId == null ? null : String(data.ownerId),
        key: requireString(data.key, 'key'),
        value: requireString(data.value, 'value'),
        created_at: requireString(data.createdAt, 'createdAt'),
        updated_at: requireString(data.updatedAt, 'updatedAt'),
      }
      this.db.variables.upsert(row)
      return this
    }

    if (normalized.startsWith('delete from variables')) {
      const data = requireObject(params, this.sql)
      const scope = requireString(data.scope, 'scope')
      const ownerId = data.ownerId == null ? null : String(data.ownerId)
      const key = requireString(data.key, 'key')
      this.db.variables.delete(scope, ownerId, key)
      return this
    }

    throw new Error(`Unsupported run operation for SQL: ${this.sql}`)
  }

  get(param?: unknown) {
    const normalized = this.sql.trim().toLowerCase()
    if (normalized.startsWith('select * from rule_definitions where id')) {
      const id = Array.isArray(param) ? param[0] : param
      if (typeof id !== 'string') return undefined
      return this.db.store.get(id) ?? undefined
    }

    if (normalized.startsWith('select * from variables') && normalized.includes('key = @key')) {
      const bound = requireObject(param ?? {}, this.sql)
      const scope = requireString(bound.scope, 'scope')
      const ownerId = bound.ownerId == null ? null : String(bound.ownerId)
      const key = requireString(bound.key, 'key')
      return this.db.variables.get(scope, ownerId, key) ?? undefined
    }

    throw new Error(`Unsupported get operation for SQL: ${this.sql}`)
  }

  all(params?: unknown) {
    const normalized = this.sql.trim().toLowerCase()
    if (normalized.includes('where trigger_plugin_id')) {
      const bound = requireObject(params ?? {}, this.sql)
      const pluginId = requireString(bound.pluginId, 'pluginId')
      const triggerId = requireString(bound.triggerId, 'triggerId')
      return this.db.store.listByTrigger(pluginId, triggerId)
    }

    if (normalized.startsWith('select * from rule_definitions')) {
      return this.db.store.listAll()
    }

    if (normalized.startsWith('select * from variables') && normalized.includes("scope = 'global'")) {
      const bound = requireObject(params ?? {}, this.sql)
      const pluginId = requireString(bound.pluginId, 'pluginId')
      const ruleId = requireString(bound.ruleId, 'ruleId')
      return this.db.variables.snapshot(pluginId, ruleId)
    }

    if (normalized.startsWith('select * from variables') && normalized.includes('where scope = @scope')) {
      const bound = requireObject(params ?? {}, this.sql)
      const scope = requireString(bound.scope, 'scope')
      const ownerId = bound.ownerId == null ? null : String(bound.ownerId)
      return this.db.variables.list(scope, ownerId)
    }

    throw new Error(`Unsupported all operation for SQL: ${this.sql}`)
  }
}

class MockDatabase {
  readonly store = new InMemoryRuleStore()
  readonly variables = new VariableStore()

  prepare(sql: string) {
    return new Statement(this, sql)
  }

  transaction<T extends (...args: unknown[]) => unknown>(fn: T): T {
    return ((...args: Parameters<T>) => fn(...args)) as T
  }
}

export default MockDatabase
