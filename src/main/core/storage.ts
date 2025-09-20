import Database from 'better-sqlite3'
import Store from 'electron-store'
import * as electron from 'electron'
import { existsSync, mkdirSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { join } from 'node:path'
import type { RuleDefinition } from '../../shared/rules/types'
import type { PluginConfigSnapshot } from '../../shared/plugins/types'
import type { VariableKey, VariableRecord, VariableSnapshot, VariableScope } from '../../shared/variables/types'

const DATABASE_FILENAME = 'aidle.db'

type RuleRow = {
  id: string
  name: string
  description?: string | null
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

type VariableRow = {
  scope: VariableScope
  owner_id?: string | null
  key: string
  value: string
  created_at: string
  updated_at: string
}

const { app } = electron

type DatabaseInstance = InstanceType<typeof Database>

const SETTINGS_SCHEMA = {
  theme: {
    type: 'string',
    enum: ['light', 'dark', 'system'],
    default: 'system',
  },
  telemetry: {
    type: 'boolean',
    default: true,
  },
  pluginSecretsKey: {
    type: 'string',
    default: '',
  },
} as const

export type SettingsSchema = {
  [K in keyof typeof SETTINGS_SCHEMA]: (typeof SETTINGS_SCHEMA)[K]['type'] extends 'boolean'
    ? boolean
    : (typeof SETTINGS_SCHEMA)[K]['type'] extends 'string'
      ? string
      : unknown
}

export class SettingsStore extends Store<SettingsSchema> {
  constructor() {
    super({
      name: 'settings',
      cwd: getDataDirectory(),
      schema: SETTINGS_SCHEMA,
      fileExtension: 'json',
    })
  }
}

class PluginConfigStore extends Store<Record<string, unknown>> {
  constructor(pluginId: string) {
    super({
      name: `plugin-${pluginId}-config`,
      cwd: getDataDirectory(),
      fileExtension: 'json',
    })
  }
}

class PluginSecretStore extends Store<Record<string, unknown>> {
  constructor(pluginId: string, encryptionKey: string) {
    super({
      name: `plugin-${pluginId}-secrets`,
      cwd: getDataDirectory(),
      fileExtension: 'json',
      encryptionKey,
    })
  }
}

export class RuleRepository {
  private readonly db: DatabaseInstance

  constructor(db: DatabaseInstance) {
    this.db = db
    this.initialize()
  }

  private initialize() {
    this.db
      .prepare(`
        CREATE TABLE IF NOT EXISTS rule_definitions (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          trigger_plugin_id TEXT NOT NULL,
          trigger_id TEXT NOT NULL,
          conditions TEXT,
          actions TEXT NOT NULL,
          enabled INTEGER NOT NULL DEFAULT 1,
          priority INTEGER NOT NULL DEFAULT 0,
          tags TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `)
      .run()
  }

  save(rule: RuleDefinition) {
    const existing = this.getRule(rule.id)
    const now = new Date().toISOString()
    const createdAt = existing?.createdAt ?? rule.createdAt ?? now
    const updatedAt = now
    const stmt = this.db.prepare(`
      INSERT INTO rule_definitions (
        id,
        name,
        description,
        trigger_plugin_id,
        trigger_id,
        conditions,
        actions,
        enabled,
        priority,
        tags,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @name,
        @description,
        @trigger_plugin_id,
        @trigger_id,
        @conditions,
        @actions,
        @enabled,
        @priority,
        @tags,
        @created_at,
        @updated_at
      )
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        trigger_plugin_id = excluded.trigger_plugin_id,
        trigger_id = excluded.trigger_id,
        conditions = excluded.conditions,
        actions = excluded.actions,
        enabled = excluded.enabled,
        priority = excluded.priority,
        tags = excluded.tags,
        updated_at = excluded.updated_at;
    `)

    stmt.run({
      ...rule,
      trigger_plugin_id: rule.trigger.pluginId,
      trigger_id: rule.trigger.triggerId,
      conditions: rule.conditions ? JSON.stringify(rule.conditions) : null,
      actions: JSON.stringify(rule.actions),
      enabled: rule.enabled ? 1 : 0,
      priority: rule.priority,
      tags: rule.tags ? JSON.stringify(rule.tags) : null,
      created_at: createdAt,
      updated_at: updatedAt,
    })
  }

  deleteRule(id: string) {
    this.db.prepare('DELETE FROM rule_definitions WHERE id = ?').run(id)
  }

  getRule(id: string): RuleDefinition | undefined {
    const result = this.db
      .prepare('SELECT * FROM rule_definitions WHERE id = ?')
      .get(id) as RuleRow | undefined
    if (!result) return undefined
    return this.mapRow(result)
  }

  listRules(): RuleDefinition[] {
    const results = this.db
      .prepare('SELECT * FROM rule_definitions ORDER BY priority DESC, updated_at DESC')
      .all() as RuleRow[]
    return results.map((row) => this.mapRow(row))
  }

  listByTrigger(trigger: { pluginId: string; triggerId: string }): RuleDefinition[] {
    const results = this.db
      .prepare(
        `SELECT * FROM rule_definitions
         WHERE trigger_plugin_id = @pluginId AND trigger_id = @triggerId AND enabled = 1
         ORDER BY priority DESC, updated_at DESC`,
      )
      .all({ pluginId: trigger.pluginId, triggerId: trigger.triggerId }) as RuleRow[]
    return results.map((row) => this.mapRow(row))
  }

  private mapRow(row: RuleRow): RuleDefinition {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      trigger: {
        pluginId: row.trigger_plugin_id,
        triggerId: row.trigger_id,
      },
      conditions: row.conditions ? (JSON.parse(row.conditions) as RuleDefinition['conditions']) : undefined,
      actions: JSON.parse(row.actions) as RuleDefinition['actions'],
      enabled: row.enabled === 1,
      priority: row.priority,
      tags: row.tags ? (JSON.parse(row.tags) as string[]) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}

export class VariableRepository {
  private readonly db: DatabaseInstance

  constructor(db: DatabaseInstance) {
    this.db = db
    this.initialize()
  }

  private initialize() {
    this.db
      .prepare(`
        CREATE TABLE IF NOT EXISTS variables (
          scope TEXT NOT NULL,
          owner_id TEXT,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (scope, owner_id, key)
        );
      `)
      .run()
  }

  getSnapshot(ruleId: string, pluginId: string): VariableSnapshot {
    const rows = this.db
      .prepare(
        `SELECT * FROM variables
         WHERE scope = 'global'
            OR (scope = 'plugin' AND owner_id = @pluginId)
            OR (scope = 'rule' AND owner_id = @ruleId)`,
      )
      .all({ pluginId, ruleId }) as VariableRow[]

    const snapshot: VariableSnapshot = {
      global: {},
      plugin: {},
      rule: {},
    }

    for (const row of rows) {
      const target = snapshot[row.scope]
      target[row.key] = this.deserializeValue(row.value)
    }

    return snapshot
  }

  list(scope: VariableScope, ownerId?: string): VariableRecord[] {
    const rows = this.db
      .prepare(
        `SELECT * FROM variables
         WHERE scope = @scope
           AND (@ownerId IS NULL OR owner_id = @ownerId)
           AND (scope != 'global' OR owner_id IS NULL)
         ORDER BY key ASC`,
      )
      .all({ scope, ownerId: this.resolveOwnerId(scope, ownerId) }) as VariableRow[]
    return rows.map((row) => this.mapRow(row))
  }

  getValue(key: VariableKey): VariableRecord | undefined {
    const row = this.findRow(key)
    return row ? this.mapRow(row) : undefined
  }

  setValue(key: VariableKey, value: unknown): VariableRecord {
    const ownerId = this.resolveOwnerId(key.scope, key.ownerId)
    const now = new Date().toISOString()
    const existing = this.findRow(key)
    const createdAt = existing?.created_at ?? now

    this.db
      .prepare(
        `INSERT INTO variables (scope, owner_id, key, value, created_at, updated_at)
         VALUES (@scope, @ownerId, @key, @value, @createdAt, @updatedAt)
         ON CONFLICT(scope, owner_id, key) DO UPDATE SET
           value = excluded.value,
           created_at = excluded.created_at,
           updated_at = excluded.updated_at`,
      )
      .run({
        scope: key.scope,
        ownerId,
        key: key.key,
        value: this.serializeValue(value),
        createdAt,
        updatedAt: now,
      })

    const updated = this.findRow(key)
    if (!updated) {
      throw new Error(`Failed to persist variable ${key.scope}:${ownerId ?? 'global'}:${key.key}`)
    }
    return this.mapRow(updated)
  }

  incrementValue(key: VariableKey, delta = 1): VariableRecord {
    const operation = this.db.transaction((amount: number) => {
      const existing = this.findRow(key)
      const currentValue = existing ? this.deserializeValue(existing.value) : 0
      if (typeof currentValue !== 'number') {
        throw new Error(`Cannot increment non-numeric variable ${key.key}`)
      }
      const nextValue = currentValue + amount
      return this.setValue(key, nextValue)
    })

    return operation(delta)
  }

  deleteValue(key: VariableKey): boolean {
    const ownerId = this.resolveOwnerId(key.scope, key.ownerId)
    const result = this.db
      .prepare(
        `DELETE FROM variables
         WHERE scope = @scope
           AND ((@ownerId IS NULL AND owner_id IS NULL) OR owner_id = @ownerId)
           AND key = @key`,
      )
      .run({ scope: key.scope, ownerId, key: key.key })
    return result.changes > 0
  }

  private findRow(key: VariableKey): VariableRow | undefined {
    const ownerId = this.resolveOwnerId(key.scope, key.ownerId)
    return this.db
      .prepare(
        `SELECT * FROM variables
         WHERE scope = @scope
           AND ((@ownerId IS NULL AND owner_id IS NULL) OR owner_id = @ownerId)
           AND key = @key`,
      )
      .get({ scope: key.scope, ownerId, key: key.key }) as VariableRow | undefined
  }

  private mapRow(row: VariableRow): VariableRecord {
    return {
      scope: row.scope,
      ownerId: row.owner_id ?? undefined,
      key: row.key,
      value: this.deserializeValue(row.value),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  private resolveOwnerId(scope: VariableScope, ownerId?: string) {
    if (scope === 'global') {
      return null
    }
    if (!ownerId) {
      throw new Error(`Variable scope '${scope}' requires an ownerId`)
    }
    return ownerId
  }

  private serializeValue(value: unknown) {
    return JSON.stringify(value ?? null)
  }

  private deserializeValue(value: string) {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }
}

export class DataStores {
  readonly settings = new SettingsStore()
  readonly db: DatabaseInstance
  readonly rules: RuleRepository
  readonly variables: VariableRepository
  private readonly pluginConfigs = new Map<string, PluginConfigStore>()
  private readonly pluginSecrets = new Map<string, PluginSecretStore>()
  private readonly secretsKey: string

  constructor() {
    this.db = createDatabaseConnection()
    this.rules = new RuleRepository(this.db)
    this.variables = new VariableRepository(this.db)
    const existingKey = this.settings.get('pluginSecretsKey')
    if (!existingKey) {
      const key = randomBytes(32).toString('hex')
      this.settings.set('pluginSecretsKey', key)
      this.secretsKey = key
    } else {
      this.secretsKey = existingKey
    }
  }

  getPluginConfig(pluginId: string) {
    let store = this.pluginConfigs.get(pluginId)
    if (!store) {
      store = new PluginConfigStore(pluginId)
      this.pluginConfigs.set(pluginId, store)
    }
    return store
  }

  getPluginConfigSnapshot(pluginId: string): PluginConfigSnapshot {
    const store = this.getPluginConfig(pluginId)
    return { ...store.store }
  }

  setPluginConfigSnapshot(pluginId: string, snapshot: PluginConfigSnapshot) {
    const store = this.getPluginConfig(pluginId)
    store.store = { ...snapshot }
  }

  getPluginSecrets(pluginId: string) {
    let store = this.pluginSecrets.get(pluginId)
    if (!store) {
      store = new PluginSecretStore(pluginId, this.secretsKey)
      this.pluginSecrets.set(pluginId, store)
    }
    return store
  }
}

const createDatabaseConnection = () => {
  const dbPath = join(getDataDirectory(), DATABASE_FILENAME)
  return new Database(dbPath)
}

export const getDataDirectory = () => {
  const dir = join(app.getPath('userData'), 'data')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}
