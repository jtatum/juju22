import type Database from 'better-sqlite3'
import type { EventBus } from '../event-bus'
import type { Migration, MigrationRecord, MigrationRunnerOptions, MigrationEvent } from './types'
import { createLogger, type Logger } from '../logger'

export interface MigrationRunnerConfig {
  logger?: Logger
}

export class MigrationRunner {
  private readonly db: Database.Database
  private readonly eventBus: EventBus
  private readonly logger: Logger
  private migrations: Migration[] = []

  constructor(db: Database.Database, eventBus: EventBus, config?: MigrationRunnerConfig) {
    this.db = db
    this.eventBus = eventBus
    this.logger = config?.logger ?? createLogger('migration-runner')
    this.ensureMigrationTable()
  }

  private ensureMigrationTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      )
    `)
  }

  registerMigration(migration: Migration) {
    if (this.migrations.find(m => m.id === migration.id)) {
      throw new Error(`Migration ${migration.id} is already registered`)
    }
    this.migrations.push(migration)
    this.migrations.sort((a, b) => a.id.localeCompare(b.id))
  }

  registerMigrations(migrations: Migration[]) {
    migrations.forEach(m => this.registerMigration(m))
  }

  getAppliedMigrations(): MigrationRecord[] {
    return this.db
      .prepare('SELECT * FROM schema_migrations ORDER BY id ASC')
      .all() as MigrationRecord[]
  }

  getPendingMigrations(): Migration[] {
    const applied = new Set(this.getAppliedMigrations().map(m => m.id))
    return this.migrations.filter(m => !applied.has(m.id))
  }

  async runPendingMigrations(options: MigrationRunnerOptions = {}): Promise<void> {
    const pending = this.getPendingMigrations()

    if (pending.length === 0) {
      this.logger.info('No pending migrations')
      return
    }

    const applied = this.getAppliedMigrations().length

    this.emitEvent({
      type: 'migration.status',
      pendingCount: pending.length,
      appliedCount: applied,
    })

    this.logger.info(`Found ${pending.length} pending migration(s)`)

    for (const migration of pending) {
      if (options.dryRun) {
        this.logger.info(`[DRY RUN] Would run migration: ${migration.id} - ${migration.name}`)
        continue
      }

      try {
        await this.runMigration(migration, options)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        this.logger.error(`Migration ${migration.id} failed: ${errorMessage}`)

        this.emitEvent({
          type: 'migration.failed',
          migrationId: migration.id,
          migrationName: migration.name,
          error: errorMessage,
        })

        throw new Error(`Migration ${migration.id} failed: ${errorMessage}`)
      }
    }

    this.logger.info('All migrations completed successfully')
  }

  private async runMigration(migration: Migration, options: MigrationRunnerOptions = {}): Promise<void> {
    this.logger.info(`Running migration: ${migration.id} - ${migration.name}`)

    this.emitEvent({
      type: 'migration.started',
      migrationId: migration.id,
      migrationName: migration.name,
    })

    const transaction = this.db.transaction(() => {
      migration.up(this.db)

      this.db
        .prepare('INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)')
        .run(migration.id, migration.name, new Date().toISOString())
    })

    try {
      transaction()

      if (options.verbose) {
        this.logger.info(`Migration ${migration.id} completed successfully`)
      }

      this.emitEvent({
        type: 'migration.completed',
        migrationId: migration.id,
        migrationName: migration.name,
      })
    } catch (error) {
      this.logger.error(`Failed to apply migration ${migration.id}: ${error}`)
      throw error
    }
  }

  async rollbackLastMigration(): Promise<void> {
    const applied = this.getAppliedMigrations()
    if (applied.length === 0) {
      this.logger.info('No migrations to rollback')
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

    this.logger.info(`Rolling back migration: ${migration.id} - ${migration.name}`)

    const transaction = this.db.transaction(() => {
      migration.down!(this.db)
      this.db.prepare('DELETE FROM schema_migrations WHERE id = ?').run(migration.id)
    })

    try {
      transaction()
      this.logger.info(`Rollback of ${migration.id} completed successfully`)
    } catch (error) {
      this.logger.error(`Failed to rollback migration ${migration.id}: ${error}`)
      throw error
    }
  }

  private emitEvent(event: MigrationEvent) {
    this.eventBus.emit({ type: 'system.migration', payload: event })
  }

  getMigrationStatus() {
    const applied = this.getAppliedMigrations()
    const pending = this.getPendingMigrations()

    return {
      applied: applied.map(m => ({
        id: m.id,
        name: m.name,
        appliedAt: m.applied_at,
      })),
      pending: pending.map(m => ({
        id: m.id,
        name: m.name,
      })),
      total: this.migrations.length,
    }
  }
}