import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Database from 'better-sqlite3'
import { MigrationRunner } from '../../src/main/core/migrations/migration-runner'
import { EventBus } from '../../src/main/core/event-bus'
import type { Migration } from '../../src/main/core/migrations/types'
import type { Logger } from '../../src/main/core/logger'

const createMockLogger = (): Logger =>
  ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as Logger)

describe('MigrationRunner', () => {
  let db: Database.Database
  let eventBus: EventBus
  let runner: MigrationRunner
  let mockLogger: Logger

  beforeEach(() => {
    db = new Database(':memory:')
    eventBus = new EventBus()
    mockLogger = createMockLogger()
    runner = new MigrationRunner(db, eventBus, { logger: mockLogger })
  })

  afterEach(() => {
    db.close()
  })

  describe('migration registration', () => {
    it('should register a single migration', () => {
      const migration: Migration = {
        id: '0001_test',
        name: 'Test migration',
        up: vi.fn(),
      }

      runner.registerMigration(migration)
      const pending = runner.getPendingMigrations()

      expect(pending).toHaveLength(1)
      expect(pending[0]).toBe(migration)
    })

    it('should register multiple migrations in order', () => {
      const migrations: Migration[] = [
        { id: '0003_third', name: 'Third', up: vi.fn() },
        { id: '0001_first', name: 'First', up: vi.fn() },
        { id: '0002_second', name: 'Second', up: vi.fn() },
      ]

      runner.registerMigrations(migrations)
      const pending = runner.getPendingMigrations()

      expect(pending).toHaveLength(3)
      expect(pending[0].id).toBe('0001_first')
      expect(pending[1].id).toBe('0002_second')
      expect(pending[2].id).toBe('0003_third')
    })

    it('should throw error when registering duplicate migration', () => {
      const migration: Migration = {
        id: '0001_test',
        name: 'Test migration',
        up: vi.fn(),
      }

      runner.registerMigration(migration)

      expect(() => runner.registerMigration(migration)).toThrow(
        'Migration 0001_test is already registered'
      )
    })
  })

  describe('migration execution', () => {
    it('should execute pending migrations', async () => {
      const upFn = vi.fn()
      const migration: Migration = {
        id: '0001_test',
        name: 'Test migration',
        up: upFn,
      }

      runner.registerMigration(migration)
      await runner.runPendingMigrations()

      expect(upFn).toHaveBeenCalledWith(db)
      expect(runner.getPendingMigrations()).toHaveLength(0)
      expect(runner.getAppliedMigrations()).toHaveLength(1)
    })

    it('should execute migrations in order', async () => {
      const order: string[] = []
      const migrations: Migration[] = [
        {
          id: '0002_second',
          name: 'Second',
          up: () => order.push('second'),
        },
        {
          id: '0001_first',
          name: 'First',
          up: () => order.push('first'),
        },
        {
          id: '0003_third',
          name: 'Third',
          up: () => order.push('third'),
        },
      ]

      runner.registerMigrations(migrations)
      await runner.runPendingMigrations()

      expect(order).toEqual(['first', 'second', 'third'])
    })

    it('should not re-run applied migrations', async () => {
      const upFn = vi.fn()
      const migration: Migration = {
        id: '0001_test',
        name: 'Test migration',
        up: upFn,
      }

      runner.registerMigration(migration)
      await runner.runPendingMigrations()
      await runner.runPendingMigrations()

      expect(upFn).toHaveBeenCalledTimes(1)
    })

    it('should handle migration errors', async () => {
      const migration: Migration = {
        id: '0001_test',
        name: 'Test migration',
        up: () => {
          throw new Error('Migration failed')
        },
      }

      runner.registerMigration(migration)

      await expect(runner.runPendingMigrations()).rejects.toThrow(
        'Migration 0001_test failed: Migration failed'
      )

      expect(runner.getAppliedMigrations()).toHaveLength(0)
      expect(runner.getPendingMigrations()).toHaveLength(1)
    })

    it('should emit events during migration', async () => {
      const events: unknown[] = []
      eventBus.on('system.migration', (event) => events.push(event))

      const migration: Migration = {
        id: '0001_test',
        name: 'Test migration',
        up: vi.fn(),
      }

      runner.registerMigration(migration)
      await runner.runPendingMigrations()

      expect(events).toContainEqual(
        expect.objectContaining({
          type: 'migration.started',
          migrationId: '0001_test',
          migrationName: 'Test migration',
        })
      )

      expect(events).toContainEqual(
        expect.objectContaining({
          type: 'migration.completed',
          migrationId: '0001_test',
          migrationName: 'Test migration',
        })
      )
    })
  })

  describe('rollback', () => {
    it('should rollback last migration', async () => {
      const downFn = vi.fn()
      const migration: Migration = {
        id: '0001_test',
        name: 'Test migration',
        up: vi.fn(),
        down: downFn,
      }

      runner.registerMigration(migration)
      await runner.runPendingMigrations()
      await runner.rollbackLastMigration()

      expect(downFn).toHaveBeenCalledWith(db)
      expect(runner.getAppliedMigrations()).toHaveLength(0)
      expect(runner.getPendingMigrations()).toHaveLength(1)
    })

    it('should throw error if migration does not support rollback', async () => {
      const migration: Migration = {
        id: '0001_test',
        name: 'Test migration',
        up: vi.fn(),
      }

      runner.registerMigration(migration)
      await runner.runPendingMigrations()

      await expect(runner.rollbackLastMigration()).rejects.toThrow(
        'Migration 0001_test does not support rollback'
      )
    })

    it('should handle no migrations to rollback', async () => {
      await expect(runner.rollbackLastMigration()).resolves.not.toThrow()
    })
  })

  describe('migration status', () => {
    it('should return correct migration status', async () => {
      const migrations: Migration[] = [
        { id: '0001_first', name: 'First', up: vi.fn() },
        { id: '0002_second', name: 'Second', up: vi.fn() },
        { id: '0003_third', name: 'Third', up: vi.fn() },
      ]

      // Register only the first migration
      runner.registerMigration(migrations[0])
      await runner.runPendingMigrations()

      // Now register the remaining migrations
      runner.registerMigrations([migrations[1], migrations[2]])

      const status = runner.getMigrationStatus()

      expect(status.total).toBe(3)
      expect(status.applied).toHaveLength(1)
      expect(status.pending).toHaveLength(2)
      expect(status.applied[0].id).toBe('0001_first')
      expect(status.pending[0].id).toBe('0002_second')
      expect(status.pending[1].id).toBe('0003_third')
    })
  })

  describe('dry run', () => {
    it('should not apply migrations in dry run mode', async () => {
      const upFn = vi.fn()
      const migration: Migration = {
        id: '0001_test',
        name: 'Test migration',
        up: upFn,
      }

      runner.registerMigration(migration)
      await runner.runPendingMigrations({ dryRun: true })

      expect(upFn).not.toHaveBeenCalled()
      expect(runner.getPendingMigrations()).toHaveLength(1)
      expect(runner.getAppliedMigrations()).toHaveLength(0)
    })
  })

  describe('idempotency', () => {
    it('should be idempotent when migration table already exists', () => {
      db.exec(`
        CREATE TABLE schema_migrations (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          applied_at TEXT NOT NULL
        )
      `)

      expect(() => new MigrationRunner(db, eventBus, { logger: createMockLogger() })).not.toThrow()
    })

    it('should handle existing migrations in database', async () => {
      const firstRunner = new MigrationRunner(db, eventBus, { logger: createMockLogger() })
      const migration: Migration = {
        id: '0001_test',
        name: 'Test migration',
        up: vi.fn(),
      }

      firstRunner.registerMigration(migration)
      await firstRunner.runPendingMigrations()

      const secondRunner = new MigrationRunner(db, eventBus, { logger: createMockLogger() })
      secondRunner.registerMigration(migration)

      expect(secondRunner.getPendingMigrations()).toHaveLength(0)
      expect(secondRunner.getAppliedMigrations()).toHaveLength(1)
    })
  })
})