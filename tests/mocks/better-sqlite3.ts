interface RuleRow {
  id: string
  definition: string
  enabled: number
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

  list() {
    return Array.from(this.rows.values()).sort((a, b) => b.updated_at.localeCompare(a.updated_at))
  }
}

class Statement {
  constructor(private readonly db: MockDatabase, private readonly sql: string) {}

  run(params?: unknown) {
    const normalized = this.sql.trim().toLowerCase()

    if (normalized.startsWith('create table')) {
      return this
    }

    if (normalized.startsWith('insert into rules')) {
      if (!params || typeof params !== 'object') {
        throw new Error('Expected parameter object for rule upsert')
      }
      const { id, definition, enabled, updated_at } = params as Record<string, unknown>
      if (typeof id !== 'string' || typeof definition !== 'string' || typeof updated_at !== 'string') {
        throw new Error('Invalid parameters for rule upsert')
      }
      const numericEnabled = typeof enabled === 'number' ? enabled : enabled ? 1 : 0
      this.db.store.upsert({
        id,
        definition,
        enabled: numericEnabled,
        updated_at,
      })
      return this
    }

    if (normalized.startsWith('delete from rules')) {
      const id = Array.isArray(params) ? params[0] : params
      if (typeof id === 'string') {
        this.db.store.delete(id)
      }
      return this
    }

    throw new Error(`Unsupported run operation for SQL: ${this.sql}`)
  }

  get(param?: unknown) {
    const normalized = this.sql.trim().toLowerCase()
    if (!normalized.startsWith('select * from rules where id')) {
      throw new Error(`Unsupported get operation for SQL: ${this.sql}`)
    }
    const id = Array.isArray(param) ? param[0] : param
    if (typeof id !== 'string') return undefined
    return this.db.store.get(id)
  }

  all() {
    const normalized = this.sql.trim().toLowerCase()
    if (!normalized.startsWith('select * from rules order by')) {
      throw new Error(`Unsupported all operation for SQL: ${this.sql}`)
    }
    return this.db.store.list()
  }
}

class MockDatabase {
  readonly store = new InMemoryRuleStore()

  constructor() {}

  prepare(sql: string) {
    return new Statement(this, sql)
  }
}

export default MockDatabase
