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

    if (normalized.includes('insert') && normalized.includes('into variables')) {
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
      return { changes: 1 }
    }

    if (normalized.startsWith('delete from variables') || normalized.includes('delete from variables')) {
      // Handle DELETE with WHERE ... AND key IN (...) - used by migration rollback
      if (normalized.includes('key in')) {
        // This is a bulk delete from migration rollback, just clear all global variables
        // that match the pattern
        const globalVars = this.db.variables.list('global', null)
        for (const v of globalVars) {
          if (v.key.startsWith('system.') || v.key.startsWith('automation.')) {
            this.db.variables.delete('global', null, v.key)
          }
        }
        return { changes: globalVars.filter(v => v.key.startsWith('system.') || v.key.startsWith('automation.')).length }
      }

      // Handle normal DELETE with params
      if (!params) {
        return { changes: 0 }
      }
      const data = requireObject(params, this.sql)
      const scope = requireString(data.scope, 'scope')
      const ownerId = data.ownerId == null ? null : String(data.ownerId)
      const key = requireString(data.key, 'key')
      this.db.variables.delete(scope, ownerId, key)
      return { changes: 1 }
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

    // Handle SELECT * FROM variables WHERE scope = ? AND owner_id IS NULL
    if (normalized.includes('select * from variables') && normalized.includes('scope =') && normalized.includes('owner_id is null')) {
      const scope = Array.isArray(params) ? params[0] : params
      if (typeof scope === 'string') {
        return this.db.variables.list(scope, null)
      }
    }

    throw new Error(`Unsupported all operation for SQL: ${this.sql}`)
  }
}

class MockDatabase {
  readonly store = new InMemoryRuleStore()
  readonly variables = new VariableStore()
  private migrations = new Map<string, { id: string; name: string; applied_at: string }>()
  private tables = new Set<string>()
  private indexes = new Set<string>()

  prepare(sql: string) {
    const normalized = sql.trim().toLowerCase()

    // Handle INSERT OR IGNORE INTO variables for migrations
    if (normalized.includes('insert or ignore into variables')) {
      return {
        run: (...params: unknown[]) => {
          // Handle both array and spread parameters
          const [key, value, createdAt, updatedAt] = params.length === 1 && Array.isArray(params[0])
            ? params[0]
            : params
          if (key && value && createdAt && updatedAt) {
            const row: VariableRow = {
              scope: 'global',
              owner_id: null,
              key: String(key),
              value: String(value),
              created_at: String(createdAt),
              updated_at: String(updatedAt),
            }
            this.variables.upsert(row)
          }
          return { changes: 1 }
        }
      }
    }

    // Handle PRAGMA table_info
    if (normalized.includes('pragma table_info')) {
      const tableName = normalized.match(/table_info\((\w+)\)/)?.[1]
      if (tableName === 'rule_definitions') {
        return {
          all: () => [
            { name: 'id', type: 'TEXT', notnull: 0 },
            { name: 'name', type: 'TEXT', notnull: 1 },
            { name: 'description', type: 'TEXT', notnull: 0 },
            { name: 'trigger_plugin_id', type: 'TEXT', notnull: 1 },
            { name: 'trigger_id', type: 'TEXT', notnull: 1 },
            { name: 'conditions', type: 'TEXT', notnull: 0 },
            { name: 'actions', type: 'TEXT', notnull: 1 },
            { name: 'enabled', type: 'INTEGER', notnull: 1 },
            { name: 'priority', type: 'INTEGER', notnull: 1 },
            { name: 'tags', type: 'TEXT', notnull: 0 },
            { name: 'created_at', type: 'TEXT', notnull: 1 },
            { name: 'updated_at', type: 'TEXT', notnull: 1 },
          ]
        }
      }
      if (tableName === 'variables') {
        return {
          all: () => [
            { name: 'scope', type: 'TEXT', notnull: 1 },
            { name: 'owner_id', type: 'TEXT', notnull: 0 },
            { name: 'key', type: 'TEXT', notnull: 1 },
            { name: 'value', type: 'TEXT', notnull: 1 },
            { name: 'created_at', type: 'TEXT', notnull: 1 },
            { name: 'updated_at', type: 'TEXT', notnull: 1 },
          ]
        }
      }
      return { all: () => [] }
    }

    // Handle SELECT FROM sqlite_master
    if (normalized.includes('sqlite_master')) {
      return {
        all: () => {
          const results: Array<{ name: string; type?: string }> = []
          if (normalized.includes("type='table'")) {
            this.tables.forEach(name => {
              if (!normalized.includes('!=') || name !== 'schema_migrations') {
                results.push({ name })
              }
            })
          }
          if (normalized.includes("type='index'")) {
            this.indexes.forEach(name => results.push({ name }))
          }
          return results
        }
      }
    }

    // Handle SELECT * FROM variables for global scope
    if (normalized.includes('select * from variables') && normalized.includes("scope = 'global'")) {
      return {
        all: () => {
          return this.variables.list('global', null)
        }
      }
    }

    if (normalized.includes('schema_migrations')) {
      return {
        run: (...params: unknown[]) => {
          if (normalized.includes('insert into schema_migrations')) {
            // Handle both array and spread parameters
            const [id, name, appliedAt] = params.length === 1 && Array.isArray(params[0])
              ? params[0]
              : params
            if (typeof id === 'string' && typeof name === 'string' && typeof appliedAt === 'string') {
              this.migrations.set(id, { id, name, applied_at: appliedAt })
            }
            return { changes: 1 }
          }
          if (normalized.includes('delete from schema_migrations')) {
            const id = params.length === 1 && Array.isArray(params[0]) ? params[0][0] : params[0]
            if (typeof id === 'string') {
              this.migrations.delete(id)
            }
            return { changes: 1 }
          }
          return { changes: 0 }
        },
        get: (param?: unknown) => {
          const id = Array.isArray(param) ? param[0] : param
          if (typeof id === 'string') {
            return this.migrations.get(id) ?? undefined
          }
          return undefined
        },
        all: () => {
          return Array.from(this.migrations.values()).sort((a, b) => a.id.localeCompare(b.id))
        },
      }
    }

    return new Statement(this, sql)
  }

  transaction<T extends (...args: unknown[]) => unknown>(fn: T): T {
    return ((...args: Parameters<T>) => fn(...args)) as T
  }

  exec(sql: string) {
    const normalized = sql.trim().toLowerCase()

    // Track created tables
    if (normalized.includes('create table')) {
      const tableMatch = normalized.match(/create table (?:if not exists )?(\w+)/)
      if (tableMatch) {
        this.tables.add(tableMatch[1])
      }
    }

    // Track created indexes
    if (normalized.includes('create index')) {
      const indexMatch = normalized.match(/create index (?:if not exists )?(\w+)/)
      if (indexMatch) {
        this.indexes.add(indexMatch[1])
      }
    }

    // Handle DROP TABLE
    if (normalized.includes('drop table')) {
      const tableMatch = normalized.match(/drop table (?:if exists )?(\w+)/)
      if (tableMatch) {
        this.tables.delete(tableMatch[1])
      }
    }

    // Handle DROP INDEX
    if (normalized.includes('drop index')) {
      const indexMatch = normalized.match(/drop index (?:if exists )?(\w+)/)
      if (indexMatch) {
        this.indexes.delete(indexMatch[1])
      }
    }

    return
  }

  close() {
    return
  }}

export default MockDatabase
