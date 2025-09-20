import type Database from 'better-sqlite3'
import type { Migration } from '../types'

export const migration: Migration = {
  id: '0001_initial_schema',
  name: 'Create initial schema for rules and variables',

  up(db: Database.Database) {
    db.exec(`
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
      )
    `)

    db.exec(`
      CREATE TABLE IF NOT EXISTS variables (
        scope TEXT NOT NULL,
        owner_id TEXT,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (scope, owner_id, key)
      )
    `)

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rules_trigger
      ON rule_definitions(trigger_plugin_id, trigger_id, enabled)
    `)

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rules_priority
      ON rule_definitions(priority DESC, updated_at DESC)
    `)

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_variables_scope
      ON variables(scope, owner_id)
    `)
  },

  down(db: Database.Database) {
    db.exec('DROP INDEX IF EXISTS idx_variables_scope')
    db.exec('DROP INDEX IF EXISTS idx_rules_priority')
    db.exec('DROP INDEX IF EXISTS idx_rules_trigger')
    db.exec('DROP TABLE IF EXISTS variables')
    db.exec('DROP TABLE IF EXISTS rule_definitions')
  },
}