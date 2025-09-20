import { ipcMain } from 'electron'
import type { MigrationRunner } from '../core/migrations/migration-runner'

export function registerMigrationBridge(migrationRunner: MigrationRunner) {
  ipcMain.handle('migrations:getStatus', () => {
    return migrationRunner.getMigrationStatus()
  })

  ipcMain.handle('migrations:runPending', async () => {
    try {
      await migrationRunner.runPendingMigrations()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })

  ipcMain.handle('migrations:getPending', () => {
    const pending = migrationRunner.getPendingMigrations()
    return pending.map(m => ({
      id: m.id,
      name: m.name,
    }))
  })

  ipcMain.handle('migrations:getApplied', () => {
    const applied = migrationRunner.getAppliedMigrations()
    return applied.map(m => ({
      id: m.id,
      name: m.name,
      appliedAt: m.applied_at,
    }))
  })
}