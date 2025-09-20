#!/usr/bin/env node

import Database from 'better-sqlite3'
import { join } from 'path'
import { homedir } from 'os'
import { existsSync, mkdirSync } from 'fs'

class StandaloneMigrationRunner {
  constructor(dbPath) {
    this.db = new Database(dbPath)
    this.migrations = []
    this.ensureMigrationTable()
  }

  ensureMigrationTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      )
    `)
  }

  async loadMigrations() {
    const { migration: migration0001 } = await import('../src/main/core/migrations/migrations/0001_initial_schema.ts')
    const { migration: migration0002 } = await import('../src/main/core/migrations/migrations/0002_seed_variable_defaults.ts')

    this.migrations = [migration0001, migration0002]
    this.migrations.sort((a, b) => a.id.localeCompare(b.id))
  }

  getAppliedMigrations() {
    return this.db
      .prepare('SELECT * FROM schema_migrations ORDER BY id ASC')
      .all()
  }

  getPendingMigrations() {
    const applied = new Set(this.getAppliedMigrations().map(m => m.id))
    return this.migrations.filter(m => !applied.has(m.id))
  }

  async runMigration(migration) {
    console.log(`Running migration: ${migration.id} - ${migration.name}`)

    const transaction = this.db.transaction(() => {
      migration.up(this.db)
      this.db
        .prepare('INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)')
        .run(migration.id, migration.name, new Date().toISOString())
    })

    try {
      transaction()
      console.log(`✓ Migration ${migration.id} completed successfully`)
    } catch (error) {
      console.error(`✗ Failed to apply migration ${migration.id}:`, error.message)
      throw error
    }
  }

  async rollbackLastMigration() {
    const applied = this.getAppliedMigrations()
    if (applied.length === 0) {
      console.log('No migrations to rollback')
      return
    }

    const last = applied[applied.length - 1]
    const migration = this.migrations.find(m => m.id === last.id)

    if (!migration) {
      throw new Error(`Migration ${last.id} not found in registered migrations`)
    }

    if (!migration.down) {
      throw new Error(`Migration ${last.id} does not support rollback`)
    }

    console.log(`Rolling back migration: ${migration.id} - ${migration.name}`)

    const transaction = this.db.transaction(() => {
      migration.down(this.db)
      this.db.prepare('DELETE FROM schema_migrations WHERE id = ?').run(migration.id)
    })

    try {
      transaction()
      console.log(`✓ Rollback of ${migration.id} completed successfully`)
    } catch (error) {
      console.error(`✗ Failed to rollback migration ${migration.id}:`, error.message)
      throw error
    }
  }

  async plan() {
    const applied = this.getAppliedMigrations()
    const pending = this.getPendingMigrations()

    console.log('\nMigration Status:')
    console.log('=================')

    if (applied.length > 0) {
      console.log('\nApplied migrations:')
      applied.forEach(m => {
        const date = new Date(m.applied_at).toLocaleString()
        console.log(`  ✓ ${m.id} - ${m.name} (applied: ${date})`)
      })
    } else {
      console.log('\nNo migrations have been applied yet.')
    }

    if (pending.length > 0) {
      console.log('\nPending migrations:')
      pending.forEach(m => {
        console.log(`  ○ ${m.id} - ${m.name}`)
      })
    } else {
      console.log('\nNo pending migrations.')
    }

    console.log(`\nTotal: ${this.migrations.length} migrations (${applied.length} applied, ${pending.length} pending)`)
  }

  async apply() {
    const pending = this.getPendingMigrations()

    if (pending.length === 0) {
      console.log('No pending migrations to apply')
      return
    }

    console.log(`Found ${pending.length} pending migration(s)\n`)

    for (const migration of pending) {
      await this.runMigration(migration)
    }

    console.log('\n✓ All migrations completed successfully')
  }

  close() {
    this.db.close()
  }
}

function getDataDirectory() {
  const appName = 'juju22'
  let dataDir

  switch (process.platform) {
    case 'darwin':
      dataDir = join(homedir(), 'Library', 'Application Support', appName, 'data')
      break
    case 'win32':
      dataDir = join(process.env.APPDATA || homedir(), appName, 'data')
      break
    default:
      dataDir = join(homedir(), '.config', appName, 'data')
  }

  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }

  return dataDir
}

async function main() {
  const command = process.argv[2]
  const validCommands = ['plan', 'apply', 'rollback']

  if (!command || !validCommands.includes(command)) {
    console.log('Usage: npm run migrate:[command]')
    console.log('\nAvailable commands:')
    console.log('  plan     - Show pending and applied migrations')
    console.log('  apply    - Apply all pending migrations')
    console.log('  rollback - Rollback the last applied migration (dev only)')
    process.exit(1)
  }

  const dbPath = join(getDataDirectory(), 'juju22.db')
  console.log(`Using database: ${dbPath}\n`)

  const runner = new StandaloneMigrationRunner(dbPath)

  try {
    await runner.loadMigrations()

    switch (command) {
      case 'plan':
        await runner.plan()
        break
      case 'apply':
        await runner.apply()
        break
      case 'rollback':
        if (process.env.NODE_ENV === 'production') {
          console.error('Rollback is not allowed in production')
          process.exit(1)
        }
        await runner.rollbackLastMigration()
        break
    }
  } catch (error) {
    console.error('\nMigration failed:', error.message)
    process.exit(1)
  } finally {
    runner.close()
  }
}

main().catch(error => {
  console.error('Unexpected error:', error)
  process.exit(1)
})