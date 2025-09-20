import type Database from 'better-sqlite3'

export interface Migration {
  id: string
  name: string
  up(db: Database.Database): void
  down?(db: Database.Database): void
}

export interface MigrationRecord {
  id: string
  name: string
  applied_at: string
}

export type MigrationStatus = 'pending' | 'applying' | 'applied' | 'failed'

export interface MigrationEvent {
  type: 'migration.started' | 'migration.completed' | 'migration.failed' | 'migration.status'
  migrationId?: string
  migrationName?: string
  error?: string
  pendingCount?: number
  appliedCount?: number
}

export interface MigrationRunnerOptions {
  verbose?: boolean
  dryRun?: boolean
}