import type Database from 'better-sqlite3'
import type { Migration } from '../types'

export const migration: Migration = {
  id: '0002_seed_variable_defaults',
  name: 'Seed default system variables',

  up(db: Database.Database) {
    const now = new Date().toISOString()

    const systemVariables = [
      { key: 'system.version', value: '"1.0.0"' },
      { key: 'system.startup_count', value: '0' },
      { key: 'system.last_startup', value: `"${now}"` },
      { key: 'automation.enabled', value: 'true' },
      { key: 'automation.total_executions', value: '0' },
    ]

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO variables (scope, owner_id, key, value, created_at, updated_at)
      VALUES ('global', NULL, ?, ?, ?, ?)
    `)

    for (const variable of systemVariables) {
      stmt.run(variable.key, variable.value, now, now)
    }
  },

  down(db: Database.Database) {
    db.prepare(`
      DELETE FROM variables
      WHERE scope = 'global'
        AND owner_id IS NULL
        AND key IN (
          'system.version',
          'system.startup_count',
          'system.last_startup',
          'automation.enabled',
          'automation.total_executions'
        )
    `).run()
  },
}