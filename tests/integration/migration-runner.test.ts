import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { join } from 'path'
import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import Database from 'better-sqlite3'
import { MigrationRunner } from '../../src/main/core/migrations/migration-runner'
import { allMigrations } from '../../src/main/core/migrations/migrations'
import { EventBus } from '../../src/main/core/event-bus'
import type { Logger } from '../../src/main/core/logger'

const createMockLogger = (): Logger =>
  ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as Logger)

describe('MigrationRunner Integration', () => {
  let tempDir: string
  let db: Database.Database
  let eventBus: EventBus
  let runner: MigrationRunner
  let mockLogger: Logger

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'aidle-test-'))
    const dbPath = join(tempDir, 'test.db')
    db = new Database(dbPath)
    eventBus = new EventBus()
    mockLogger = createMockLogger()
    runner = new MigrationRunner(db, eventBus, { logger: mockLogger })
  })

  afterEach(() => {
    db.close()
    rmSync(tempDir, { recursive: true, force: true })
  })

  describe('fresh install', () => {
    it('should apply all migrations on fresh install', async () => {
      runner.registerMigrations(allMigrations)

      const pendingBefore = runner.getPendingMigrations()
      expect(pendingBefore).toHaveLength(allMigrations.length)

      await runner.runPendingMigrations()

      const pendingAfter = runner.getPendingMigrations()
      const applied = runner.getAppliedMigrations()

      expect(pendingAfter).toHaveLength(0)
      expect(applied).toHaveLength(allMigrations.length)
    })

    it('should create all required tables', async () => {
      runner.registerMigrations(allMigrations)
      await runner.runPendingMigrations()

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table'")
        .all() as Array<{ name: string }>

      const tableNames = tables.map(t => t.name)

      expect(tableNames).toContain('rule_definitions')
      expect(tableNames).toContain('variables')
      expect(tableNames).toContain('schema_migrations')
    })

    it('should create indexes', async () => {
      runner.registerMigrations(allMigrations)
      await runner.runPendingMigrations()

      const indexes = db
        .prepare("SELECT name FROM sqlite_master WHERE type='index'")
        .all() as Array<{ name: string }>

      const indexNames = indexes.map(i => i.name)

      expect(indexNames).toContain('idx_rules_trigger')
      expect(indexNames).toContain('idx_rules_priority')
      expect(indexNames).toContain('idx_variables_scope')
    })

    it('should seed default variables', async () => {
      runner.registerMigrations(allMigrations)
      await runner.runPendingMigrations()

      const variables = db
        .prepare('SELECT * FROM variables WHERE scope = ? AND owner_id IS NULL')
        .all('global') as Array<{ key: string; value: string }>

      const variableKeys = variables.map(v => v.key)

      expect(variableKeys).toContain('system.version')
      expect(variableKeys).toContain('system.startup_count')
      expect(variableKeys).toContain('system.last_startup')
      expect(variableKeys).toContain('automation.enabled')
      expect(variableKeys).toContain('automation.total_executions')
    })
  })

  describe('upgrade scenario', () => {
    it('should only run new migrations on upgrade', async () => {
      const firstMigration = allMigrations[0]
      runner.registerMigration(firstMigration)
      await runner.runPendingMigrations()

      expect(runner.getAppliedMigrations()).toHaveLength(1)

      const newRunner = new MigrationRunner(db, eventBus, { logger: createMockLogger() })
      newRunner.registerMigrations(allMigrations)

      const pending = newRunner.getPendingMigrations()
      expect(pending).toHaveLength(allMigrations.length - 1)

      await newRunner.runPendingMigrations()

      expect(newRunner.getAppliedMigrations()).toHaveLength(allMigrations.length)
    })
  })

  describe('schema validation', () => {
    it('should validate rule_definitions table schema', async () => {
      runner.registerMigrations(allMigrations)
      await runner.runPendingMigrations()

      const columns = db
        .prepare('PRAGMA table_info(rule_definitions)')
        .all() as Array<{ name: string; type: string; notnull: number }>

      const columnMap = Object.fromEntries(
        columns.map(c => [c.name, { type: c.type, required: c.notnull === 1 }])
      )

      expect(columnMap.id).toEqual({ type: 'TEXT', required: false })
      expect(columnMap.name).toEqual({ type: 'TEXT', required: true })
      expect(columnMap.description).toEqual({ type: 'TEXT', required: false })
      expect(columnMap.trigger_plugin_id).toEqual({ type: 'TEXT', required: true })
      expect(columnMap.trigger_id).toEqual({ type: 'TEXT', required: true })
      expect(columnMap.conditions).toEqual({ type: 'TEXT', required: false })
      expect(columnMap.actions).toEqual({ type: 'TEXT', required: true })
      expect(columnMap.enabled).toEqual({ type: 'INTEGER', required: true })
      expect(columnMap.priority).toEqual({ type: 'INTEGER', required: true })
      expect(columnMap.tags).toEqual({ type: 'TEXT', required: false })
      expect(columnMap.created_at).toEqual({ type: 'TEXT', required: true })
      expect(columnMap.updated_at).toEqual({ type: 'TEXT', required: true })
    })

    it('should validate variables table schema', async () => {
      runner.registerMigrations(allMigrations)
      await runner.runPendingMigrations()

      const columns = db
        .prepare('PRAGMA table_info(variables)')
        .all() as Array<{ name: string; type: string; notnull: number }>

      const columnMap = Object.fromEntries(
        columns.map(c => [c.name, { type: c.type, required: c.notnull === 1 }])
      )

      expect(columnMap.scope).toEqual({ type: 'TEXT', required: true })
      expect(columnMap.owner_id).toEqual({ type: 'TEXT', required: false })
      expect(columnMap.key).toEqual({ type: 'TEXT', required: true })
      expect(columnMap.value).toEqual({ type: 'TEXT', required: true })
      expect(columnMap.created_at).toEqual({ type: 'TEXT', required: true })
      expect(columnMap.updated_at).toEqual({ type: 'TEXT', required: true })
    })
  })

  describe('rollback', () => {
    it('should rollback migrations in reverse order', async () => {
      runner.registerMigrations(allMigrations)
      await runner.runPendingMigrations()

      const appliedCount = runner.getAppliedMigrations().length

      for (let i = 0; i < appliedCount; i++) {
        await runner.rollbackLastMigration()
      }

      const tablesAfterRollback = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name != 'schema_migrations'")
        .all() as Array<{ name: string }>

      expect(tablesAfterRollback).toHaveLength(0)
    })
  })
})