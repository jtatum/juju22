import Database from 'better-sqlite3'
import Store from 'electron-store'
import * as electron from 'electron'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

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

export interface RuleRecord {
  id: string
  definition: unknown
  enabled: number
  updated_at: string
}

export class RuleRepository {
  private readonly db: DatabaseInstance

  private static readonly mapRow = (row: Omit<RuleRecord, 'definition'> & { definition: string }): RuleRecord => ({
    ...row,
    definition: JSON.parse(row.definition),
  })

  constructor() {
    const dbPath = join(getDataDirectory(), 'rules.db')
    this.db = new Database(dbPath)
    this.initialize()
  }

  private initialize() {
    this.db
      .prepare(`
        CREATE TABLE IF NOT EXISTS rules (
          id TEXT PRIMARY KEY,
          definition TEXT NOT NULL,
          enabled INTEGER NOT NULL DEFAULT 1,
          updated_at TEXT NOT NULL
        );
      `)
      .run()
  }

  upsertRule(id: string, definition: unknown, enabled = true) {
    const stmt = this.db.prepare(`
      INSERT INTO rules (id, definition, enabled, updated_at)
      VALUES (@id, @definition, @enabled, @updated_at)
      ON CONFLICT(id) DO UPDATE SET
        definition = excluded.definition,
        enabled = excluded.enabled,
        updated_at = excluded.updated_at;
    `)
    stmt.run({
      id,
      definition: JSON.stringify(definition),
      enabled: enabled ? 1 : 0,
      updated_at: new Date().toISOString(),
    })
  }

  deleteRule(id: string) {
    this.db.prepare('DELETE FROM rules WHERE id = ?').run(id)
  }

  getRule(id: string): RuleRecord | undefined {
    const result = this.db
      .prepare('SELECT * FROM rules WHERE id = ?')
      .get(id) as (Omit<RuleRecord, 'definition'> & { definition: string }) | undefined
    if (!result) return undefined
    return RuleRepository.mapRow(result)
  }

  listRules(): RuleRecord[] {
    const results = this.db
      .prepare('SELECT * FROM rules ORDER BY updated_at DESC')
      .all() as Array<Omit<RuleRecord, 'definition'> & { definition: string }>
    return results.map(RuleRepository.mapRow)
  }
}

export class DataStores {
  readonly settings = new SettingsStore()
  readonly rules = new RuleRepository()
}

export const getDataDirectory = () => {
  const dir = join(app.getPath('userData'), 'data')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}
