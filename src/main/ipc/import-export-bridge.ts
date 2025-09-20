import { dialog, ipcMain, app } from 'electron'
import { join } from 'path'
import { ImportExportManager } from '../core/import-export-manager'
import { BackupManager } from '../core/backup-manager'
import type { DataStores, RuleRepository } from '../core/storage'
import type { VariableService } from '../core/variable-service'
import type { EventBus } from '../core/event-bus'
import type { Logger } from '../core/logger'
import { createLogger } from '../core/logger'

export class ImportExportBridge {
  private readonly importExportManager: ImportExportManager
  private readonly backupManager: BackupManager
  private readonly logger: Logger

  constructor(
    repository: RuleRepository,
    variableService: VariableService,
    stores: DataStores,
    eventBus?: EventBus,
    logger?: Logger
  ) {
    this.logger = logger ?? createLogger('ImportExportBridge')
    this.importExportManager = new ImportExportManager(repository, eventBus)

    const backupDir = join(app.getPath('userData'), 'backups')
    this.backupManager = new BackupManager(backupDir, repository, variableService, stores, eventBus)
    this.setupHandlers()
  }

  private setupHandlers() {
    // Export rules
    ipcMain.handle('import-export:exportRules', async (_event, ruleIds?: string[]) => {
      try {
        // Show save dialog first
        const result = await dialog.showSaveDialog({
          title: 'Export Rules',
          defaultPath: `juju22-rules-${Date.now()}.json`,
          filters: [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        })

        if (!result.canceled && result.filePath) {
          const exportResult = await this.importExportManager.exportRules(result.filePath, {
            ruleIds,
            format: result.filePath.endsWith('.yaml') ? 'yaml' : 'json'
          })

          if (exportResult.success) {
            return { success: true, path: result.filePath, count: exportResult.ruleCount }
          } else {
            throw new Error(exportResult.error || 'Export failed')
          }
        }

        return { success: false, canceled: true }
      } catch (error) {
        this.logger.error('Failed to export rules', error)
        throw error
      }
    })

    // Import rules
    ipcMain.handle('import-export:importRules', async () => {
      try {
        // Show open dialog
        const result = await dialog.showOpenDialog({
          title: 'Import Rules',
          filters: [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'YAML Files', extensions: ['yaml', 'yml'] },
            { name: 'All Files', extensions: ['*'] }
          ],
          properties: ['openFile']
        })

        if (!result.canceled && result.filePaths[0]) {
          const importResult = await this.importExportManager.importRules(result.filePaths[0], {
            skipExisting: true
          })
          return {
            success: importResult.success,
            imported: importResult.imported,
            skipped: importResult.skipped,
            errors: importResult.errors
          }
        }

        return { success: false, canceled: true }
      } catch (error) {
        this.logger.error('Failed to import rules', error)
        throw error
      }
    })


    // Create backup
    ipcMain.handle('backup:create', async () => {
      try {
        const result = await this.backupManager.createBackup({
          compress: true,
          includeRules: true,
          includeVariables: true,
          includePluginConfigs: true,
          includeSettings: true
        })

        if (result.success && result.filePath) {
          return {
            success: true,
            backup: {
              path: result.filePath,
              size: result.size || 0
            }
          }
        }

        throw new Error(result.error || 'Backup failed')
      } catch (error) {
        this.logger.error('Failed to create backup', error)
        throw error
      }
    })

    // Restore backup
    ipcMain.handle('backup:restore', async (_event, filePath: string) => {
      try {
        const result = await this.backupManager.restoreBackup(filePath, {
          overwrite: true
        })
        return {
          success: result.success,
          restored: result.restored
        }
      } catch (error) {
        this.logger.error('Failed to restore backup', error)
        throw error
      }
    })

    // List backups
    ipcMain.handle('backup:list', async () => {
      try {
        const backups = await this.backupManager.listBackups()
        return backups.map(b => ({
          id: b,
          timestamp: Date.now(),
          path: b,
          size: 0
        }))
      } catch (error) {
        this.logger.error('Failed to list backups', error)
        throw error
      }
    })

    // Simple settings (not implemented in BackupManager)
    ipcMain.handle('backup:getSettings', async () => {
      return {
        enabled: false,
        interval: 86400000,
        maxBackups: 10
      }
    })

    ipcMain.handle('backup:updateSettings', async () => {
      return { success: true }
    })
  }

  async cleanup() {
    // Cleanup any temporary files if needed
  }
}