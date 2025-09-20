import { existsSync, mkdirSync } from 'node:fs'
import { readFile, writeFile, readdir, unlink } from 'node:fs/promises'
import { join, basename } from 'node:path'
import { gzipSync, gunzipSync } from 'node:zlib'
import type { RuleRepository } from './storage'
import type { VariableService } from './variable-service'
import type { DataStores } from './storage'
import type { EventBus } from './event-bus'
import type { Logger } from './logger'
import { createLogger } from './logger'
import type { RuleDefinition } from '../../shared/rules/types'
import type { VariableRecord, VariableKey } from '../../shared/variables/types'
import type { PluginConfigSnapshot } from '../../shared/plugins/types'

export interface BackupOptions {
  compress?: boolean
  includeRules?: boolean
  includeVariables?: boolean
  includePluginConfigs?: boolean
  includeSettings?: boolean
}

export interface RestoreOptions {
  overwrite?: boolean
  skipConflicts?: boolean
  dryRun?: boolean
}

export interface BackupMetadata {
  version: string
  createdAt: string
  applicationVersion?: string
  description?: string
  contents: {
    rules?: number
    variables?: number
    pluginConfigs?: number
    settings?: boolean
  }
}

export interface BackupData {
  metadata: BackupMetadata
  rules?: RuleDefinition[]
  variables?: VariableRecord[]
  pluginConfigs?: Record<string, PluginConfigSnapshot>
  settings?: Record<string, unknown>
}

export interface BackupResult {
  success: boolean
  filePath?: string
  size?: number
  error?: string
}

export interface RestoreResult {
  success: boolean
  restored: {
    rules: number
    variables: number
    pluginConfigs: number
    settings: boolean
  }
  conflicts: number
  errors: string[]
}

export interface BackupSchedule {
  enabled: boolean
  interval: 'hourly' | 'daily' | 'weekly'
  maxBackups: number
  nextBackup?: number
}

export class BackupManager {
  private readonly backupDir: string
  private readonly repository: RuleRepository
  private readonly variables: VariableService
  private readonly stores: DataStores
  private readonly eventBus?: EventBus
  private readonly logger: Logger
  private readonly backupVersion = '1.0.0'
  private scheduleTimer?: NodeJS.Timeout
  private schedule?: BackupSchedule

  constructor(
    backupDir: string,
    repository: RuleRepository,
    variables: VariableService,
    stores: DataStores,
    eventBus?: EventBus,
  ) {
    this.backupDir = backupDir
    this.repository = repository
    this.variables = variables
    this.stores = stores
    this.eventBus = eventBus
    this.logger = createLogger('BackupManager')

    // Ensure backup directory exists
    this.ensureBackupDirectory()
  }

  private ensureBackupDirectory(): void {
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true })
      this.logger.info(`Created backup directory: ${this.backupDir}`)
    }
  }

  async createBackup(options: BackupOptions = {}): Promise<BackupResult> {
    const {
      compress = true,
      includeRules = true,
      includeVariables = true,
      includePluginConfigs = true,
      includeSettings = true,
    } = options

    try {
      // Collect backup data
      const backupData: BackupData = {
        metadata: {
          version: this.backupVersion,
          createdAt: new Date().toISOString(),
          applicationVersion: process.env.npm_package_version,
          contents: {},
        },
      }

      // Backup rules
      if (includeRules) {
        const rules = this.repository.listRules()
        backupData.rules = rules
        backupData.metadata.contents.rules = rules.length
        this.logger.debug(`Backing up ${rules.length} rules`)
      }

      // Backup variables
      if (includeVariables) {
        const variables = this.variables.getAllVariables()
        backupData.variables = variables
        backupData.metadata.contents.variables = variables.length
        this.logger.debug(`Backing up ${variables.length} variables`)
      }

      // Backup plugin configs
      if (includePluginConfigs) {
        const configs = this.stores.getAllPluginConfigs()
        backupData.pluginConfigs = configs
        backupData.metadata.contents.pluginConfigs = Object.keys(configs).length
        this.logger.debug(`Backing up ${Object.keys(configs).length} plugin configs`)
      }

      // Backup settings
      if (includeSettings) {
        const settings = this.stores.settings.store
        backupData.settings = settings
        backupData.metadata.contents.settings = true
        this.logger.debug('Backing up settings')
      }

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const extension = compress ? '.backup.gz' : '.backup.json'
      const filename = `aidle-backup-${timestamp}${extension}`
      const filePath = join(this.backupDir, filename)

      // Serialize and optionally compress
      let content = JSON.stringify(backupData, null, 2)
      if (compress) {
        content = gzipSync(content).toString('base64')
      }

      // Write backup file
      await writeFile(filePath, content, 'utf-8')

      const stats = { size: content.length }

      this.logger.info(`Backup created: ${filename} (${this.formatSize(stats.size)})`)

      this.emitBackupEvent('backup.created', {
        filePath,
        size: stats.size,
        compressed: compress,
        contents: backupData.metadata.contents,
      })

      // Clean old backups if scheduled
      if (this.schedule?.maxBackups) {
        await this.cleanOldBackups(this.schedule.maxBackups)
      }

      return {
        success: true,
        filePath,
        size: stats.size,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error(`Backup failed: ${errorMessage}`)

      this.emitBackupEvent('backup.failed', { error: errorMessage })

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  async restoreBackup(filePath: string, options: RestoreOptions = {}): Promise<RestoreResult> {
    const { overwrite = false, skipConflicts = true, dryRun = false } = options

    const result: RestoreResult = {
      success: false,
      restored: {
        rules: 0,
        variables: 0,
        pluginConfigs: 0,
        settings: false,
      },
      conflicts: 0,
      errors: [],
    }

    try {
      // Read backup file
      if (!existsSync(filePath)) {
        throw new Error(`Backup file not found: ${filePath}`)
      }

      let content = await readFile(filePath, 'utf-8')

      // Decompress if needed
      if (filePath.endsWith('.gz')) {
        const buffer = Buffer.from(content, 'base64')
        content = gunzipSync(buffer).toString('utf-8')
      }

      // Parse backup data
      const backupData: BackupData = JSON.parse(content)

      // Validate backup version
      this.validateBackupVersion(backupData)

      this.logger.info(`Restoring backup from ${basename(filePath)}${dryRun ? ' (dry run)' : ''}`)

      // Restore rules
      if (backupData.rules && backupData.rules.length > 0) {
        for (const rule of backupData.rules) {
          try {
            const existing = this.repository.getRule(rule.id)

            if (existing && !overwrite) {
              if (skipConflicts) {
                result.conflicts++
                continue
              } else {
                throw new Error(`Rule ${rule.id} already exists`)
              }
            }

            if (!dryRun) {
              this.repository.save(rule)
            }
            result.restored.rules++
          } catch (error) {
            result.errors.push(`Rule ${rule.id}: ${error instanceof Error ? error.message : String(error)}`)
          }
        }
      }

      // Restore variables
      if (backupData.variables && backupData.variables.length > 0) {
        for (const variable of backupData.variables) {
          try {
            if (!dryRun) {
              const key: VariableKey = {
                scope: variable.scope,
                key: variable.key,
                ownerId: variable.ownerId
              }
              this.variables.set(key, variable.value)
            }
            result.restored.variables++
          } catch (error) {
            result.errors.push(`Variable ${variable.key}: ${error instanceof Error ? error.message : String(error)}`)
          }
        }
      }

      // Restore plugin configs
      if (backupData.pluginConfigs) {
        for (const [pluginId, config] of Object.entries(backupData.pluginConfigs)) {
          try {
            if (!dryRun) {
              this.stores.setPluginConfigSnapshot(pluginId, config)
            }
            result.restored.pluginConfigs++
          } catch (error) {
            result.errors.push(`Plugin config ${pluginId}: ${error instanceof Error ? error.message : String(error)}`)
          }
        }
      }

      // Restore settings
      if (backupData.settings && overwrite) {
        try {
          if (!dryRun) {
            for (const [key, value] of Object.entries(backupData.settings)) {
              this.stores.settings.set(key, value)
            }
          }
          result.restored.settings = true
        } catch (error) {
          result.errors.push(`Settings: ${error instanceof Error ? error.message : String(error)}`)
        }
      }

      result.success = result.errors.length === 0

      const message = dryRun
        ? `Dry run complete: would restore ${this.summarizeRestore(result)}`
        : `Restore complete: ${this.summarizeRestore(result)}`

      this.logger.info(message)

      this.emitBackupEvent('backup.restored', {
        filePath,
        restored: result.restored,
        conflicts: result.conflicts,
        dryRun,
      })

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error(`Restore failed: ${errorMessage}`)

      this.emitBackupEvent('backup.restore_failed', { error: errorMessage })

      return {
        ...result,
        success: false,
        errors: [errorMessage],
      }
    }
  }

  async listBackups(): Promise<Array<{ filename: string; path: string; size: number; created: Date }>> {
    try {
      const files = await readdir(this.backupDir)
      const backups = []

      for (const file of files) {
        if (file.includes('backup') && (file.endsWith('.json') || file.endsWith('.gz'))) {
          const filePath = join(this.backupDir, file)
          const content = await readFile(filePath, 'utf-8')

          // Extract date from filename
          const dateMatch = file.match(/(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
          const created = dateMatch
            ? new Date(dateMatch[1].replace(/-/g, (match, offset) => offset > 10 ? ':' : match))
            : new Date()

          backups.push({
            filename: file,
            path: filePath,
            size: content.length,
            created,
          })
        }
      }

      return backups.sort((a, b) => b.created.getTime() - a.created.getTime())
    } catch (error) {
      this.logger.error('Failed to list backups', error)
      return []
    }
  }

  async cleanOldBackups(maxBackups: number): Promise<number> {
    try {
      const backups = await this.listBackups()

      if (backups.length <= maxBackups) {
        return 0
      }

      const toDelete = backups.slice(maxBackups)
      let deleted = 0

      for (const backup of toDelete) {
        try {
          await unlink(backup.path)
          deleted++
          this.logger.debug(`Deleted old backup: ${backup.filename}`)
        } catch (error) {
          this.logger.warn(`Failed to delete backup ${backup.filename}`, error)
        }
      }

      if (deleted > 0) {
        this.logger.info(`Cleaned up ${deleted} old backups`)
      }

      return deleted
    } catch (error) {
      this.logger.error('Failed to clean old backups', error)
      return 0
    }
  }

  startScheduledBackups(schedule: BackupSchedule): void {
    this.schedule = schedule

    if (!schedule.enabled) {
      this.stopScheduledBackups()
      return
    }

    const intervals = {
      hourly: 60 * 60 * 1000,
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
    }

    const interval = intervals[schedule.interval]

    this.scheduleTimer = setInterval(async () => {
      this.logger.info(`Running scheduled ${schedule.interval} backup`)
      await this.createBackup()
    }, interval)

    // Don't keep process alive
    this.scheduleTimer.unref()

    this.schedule.nextBackup = Date.now() + interval
    this.logger.info(`Scheduled ${schedule.interval} backups enabled (max ${schedule.maxBackups} backups)`)
  }

  stopScheduledBackups(): void {
    if (this.scheduleTimer) {
      clearInterval(this.scheduleTimer)
      this.scheduleTimer = undefined
      this.schedule = undefined
      this.logger.info('Scheduled backups disabled')
    }
  }

  private validateBackupVersion(data: BackupData): void {
    if (!data.metadata?.version) {
      throw new Error('Invalid backup: missing version')
    }

    const majorVersion = data.metadata.version.split('.')[0]
    const currentMajor = this.backupVersion.split('.')[0]

    if (majorVersion !== currentMajor) {
      throw new Error(`Incompatible backup version: ${data.metadata.version} (expected ${this.backupVersion})`)
    }
  }

  private summarizeRestore(result: RestoreResult): string {
    const parts = []

    if (result.restored.rules > 0) {
      parts.push(`${result.restored.rules} rules`)
    }
    if (result.restored.variables > 0) {
      parts.push(`${result.restored.variables} variables`)
    }
    if (result.restored.pluginConfigs > 0) {
      parts.push(`${result.restored.pluginConfigs} plugin configs`)
    }
    if (result.restored.settings) {
      parts.push('settings')
    }

    if (result.conflicts > 0) {
      parts.push(`${result.conflicts} conflicts`)
    }

    return parts.join(', ') || 'nothing'
  }

  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  private emitBackupEvent(type: string, payload: unknown): void {
    if (!this.eventBus) return

    this.eventBus.emit({
      type: 'system.backup' as const,
      payload: {
        type: type as any,
        ...payload as any
      },
    })
  }
}