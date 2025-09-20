import Database from 'better-sqlite3'
import Store from 'electron-store'
import * as electron from 'electron'
import { existsSync, mkdirSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { join } from 'node:path'
import type { RuleDefinition } from '../../shared/rules/types'
import type { PluginConfigSnapshot } from '../../shared/plugins/types'

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

  constructor() {
    const dbPath = join(getDataDirectory(), 'rules.db')
    this.db = new Database(dbPath)
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

export class DataStores {
  readonly settings = new SettingsStore()
  readonly rules = new RuleRepository()
  private readonly pluginConfigs = new Map<string, PluginConfigStore>()
  private readonly pluginSecrets = new Map<string, PluginSecretStore>()
  private readonly secretsKey: string

  constructor() {
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

export const getDataDirectory = () => {
  const dir = join(app.getPath('userData'), 'data')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}
