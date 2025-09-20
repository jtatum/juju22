import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import YAML from 'yaml'
import type { RuleDefinition } from '../../shared/rules/types'
import type { RuleRepository } from './storage'
import type { EventBus } from './event-bus'
import type { Logger } from './logger'
import { createLogger } from './logger'

export interface ExportOptions {
  format?: 'json' | 'yaml'
  includeDisabled?: boolean
  ruleIds?: string[]
}

export interface ImportOptions {
  mode?: 'merge' | 'replace'
  validateOnly?: boolean
  skipExisting?: boolean
}

export interface ExportResult {
  success: boolean
  filePath?: string
  ruleCount: number
  error?: string
}

export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  failed: number
  errors: Array<{ ruleId: string; error: string }>
}

export interface RuleExport {
  version: string
  exportDate: string
  rules: RuleDefinition[]
  metadata?: Record<string, unknown>
}

export class ImportExportManager {
  private readonly repository: RuleRepository
  private readonly eventBus?: EventBus
  private readonly logger: Logger
  private readonly exportVersion = '1.0.0'

  constructor(repository: RuleRepository, eventBus?: EventBus) {
    this.repository = repository
    this.eventBus = eventBus
    this.logger = createLogger('ImportExportManager')
  }

  async exportRules(filePath: string, options: ExportOptions = {}): Promise<ExportResult> {
    const { format = 'json', includeDisabled = true, ruleIds } = options

    try {
      // Get rules to export
      let rules = this.repository.listRules()

      // Filter by rule IDs if specified
      if (ruleIds && ruleIds.length > 0) {
        rules = rules.filter(rule => ruleIds.includes(rule.id))
      }

      // Filter out disabled rules if requested
      if (!includeDisabled) {
        rules = rules.filter(rule => rule.enabled !== false)
      }

      // Create export object
      const exportData: RuleExport = {
        version: this.exportVersion,
        exportDate: new Date().toISOString(),
        rules,
        metadata: {
          ruleCount: rules.length,
          exportedBy: 'Juju22',
        },
      }

      // Serialize based on format
      const content = format === 'yaml'
        ? YAML.stringify(exportData, { indent: 2 })
        : JSON.stringify(exportData, null, 2)

      // Write to file
      await writeFile(filePath, content, 'utf-8')

      this.logger.info(`Exported ${rules.length} rules to ${filePath}`)

      this.emitExportEvent('export.success', {
        filePath,
        ruleCount: rules.length,
        format,
      })

      return {
        success: true,
        filePath,
        ruleCount: rules.length,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error(`Failed to export rules: ${errorMessage}`)

      this.emitExportEvent('export.failed', {
        error: errorMessage,
      })

      return {
        success: false,
        ruleCount: 0,
        error: errorMessage,
      }
    }
  }

  async importRules(filePath: string, options: ImportOptions = {}): Promise<ImportResult> {
    const { mode = 'merge', validateOnly = false, skipExisting = false } = options

    const result: ImportResult = {
      success: false,
      imported: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    }

    try {
      // Check if file exists
      if (!existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`)
      }

      // Read and parse file
      const content = await readFile(filePath, 'utf-8')
      const exportData = this.parseExportFile(content, filePath)

      // Validate export format
      this.validateExportData(exportData)

      // Handle replace mode
      if (mode === 'replace' && !validateOnly) {
        this.logger.info('Clearing existing rules for replace mode')
        const existingRules = this.repository.listRules()
        for (const rule of existingRules) {
          this.repository.deleteRule(rule.id)
        }
      }

      // Process each rule
      for (const rule of exportData.rules) {
        try {
          // Validate rule structure
          this.validateRule(rule)

          // Check if rule exists
          const existing = this.repository.getRule(rule.id)
          if (existing && skipExisting) {
            result.skipped++
            this.logger.debug(`Skipping existing rule: ${rule.id}`)
            continue
          }

          // Import rule if not in validate-only mode
          if (!validateOnly) {
            this.repository.save(rule)
            result.imported++
            this.logger.debug(`Imported rule: ${rule.id}`)
          } else {
            // In validate mode, count as would-be imported
            result.imported++
          }
        } catch (error) {
          result.failed++
          const errorMessage = error instanceof Error ? error.message : String(error)
          result.errors.push({
            ruleId: rule.id,
            error: errorMessage,
          })
          this.logger.warn(`Failed to import rule ${rule.id}: ${errorMessage}`)
        }
      }

      result.success = result.failed === 0

      const message = validateOnly
        ? `Validated ${exportData.rules.length} rules`
        : `Imported ${result.imported} rules, skipped ${result.skipped}, failed ${result.failed}`

      this.logger.info(message)

      this.emitExportEvent('import.complete', {
        filePath,
        imported: result.imported,
        skipped: result.skipped,
        failed: result.failed,
        mode,
        validateOnly,
      })

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error(`Import failed: ${errorMessage}`)

      this.emitExportEvent('import.failed', {
        error: errorMessage,
      })

      return {
        ...result,
        success: false,
        errors: [{ ruleId: 'unknown', error: errorMessage }],
      }
    }
  }

  private parseExportFile(content: string, filePath: string): RuleExport {
    const ext = filePath.toLowerCase()

    try {
      if (ext.endsWith('.yaml') || ext.endsWith('.yml')) {
        return YAML.parse(content) as RuleExport
      } else if (ext.endsWith('.json')) {
        return JSON.parse(content) as RuleExport
      } else {
        // Try to auto-detect format
        try {
          return JSON.parse(content) as RuleExport
        } catch {
          return YAML.parse(content) as RuleExport
        }
      }
    } catch (error) {
      throw new Error(`Failed to parse export file: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private validateExportData(data: unknown): asserts data is RuleExport {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid export data: not an object')
    }

    const exportData = data as Record<string, unknown>

    if (!exportData.version) {
      throw new Error('Invalid export data: missing version')
    }

    if (!Array.isArray(exportData.rules)) {
      throw new Error('Invalid export data: rules must be an array')
    }

    // Check version compatibility (for future versions)
    const versionStr = String(exportData.version)
    const majorVersion = versionStr.split('.')[0]
    const currentMajor = this.exportVersion.split('.')[0]
    if (majorVersion !== currentMajor) {
      throw new Error(`Incompatible export version: ${exportData.version} (expected ${this.exportVersion})`)
    }
  }

  private validateRule(rule: unknown): asserts rule is RuleDefinition {
    if (!rule || typeof rule !== 'object') {
      throw new Error('Invalid rule: not an object')
    }

    const r = rule as Record<string, unknown>

    if (!r.id || typeof r.id !== 'string') {
      throw new Error('Invalid rule: missing or invalid id')
    }

    if (!r.name || typeof r.name !== 'string') {
      throw new Error(`Invalid rule ${r.id}: missing or invalid name`)
    }

    if (!r.trigger || typeof r.trigger !== 'object') {
      throw new Error(`Invalid rule ${r.id}: missing or invalid trigger`)
    }

    const trigger = r.trigger as Record<string, unknown>
    if (!trigger.pluginId || !trigger.triggerId) {
      throw new Error(`Invalid rule ${r.id}: trigger must have pluginId and triggerId`)
    }

    if (!Array.isArray(r.actions)) {
      throw new Error(`Invalid rule ${r.id}: actions must be an array`)
    }

    if (r.actions.length === 0) {
      throw new Error(`Invalid rule ${r.id}: must have at least one action`)
    }

    // Validate each action has required fields
    for (const action of r.actions) {
      if (!action || typeof action !== 'object') {
        throw new Error(`Invalid rule ${r.id}: invalid action`)
      }

      if (!action.type) {
        throw new Error(`Invalid rule ${r.id}: action missing type`)
      }

      // Type-specific validation
      switch (action.type) {
        case 'plugin':
          if (!action.pluginId || !action.actionId) {
            throw new Error(`Invalid rule ${r.id}: plugin action must have pluginId and actionId`)
          }
          break
        case 'branch':
          if (!Array.isArray(action.branches)) {
            throw new Error(`Invalid rule ${r.id}: branch action must have branches array`)
          }
          break
        case 'loop':
          if (!action.loopType || !Array.isArray(action.actions)) {
            throw new Error(`Invalid rule ${r.id}: loop action must have loopType and actions`)
          }
          break
      }
    }
  }

  async createTemplate(name: string, rules: RuleDefinition[]): Promise<string> {
    const template: RuleExport = {
      version: this.exportVersion,
      exportDate: new Date().toISOString(),
      rules,
      metadata: {
        templateName: name,
        description: `Template containing ${rules.length} rules`,
        isTemplate: true,
      },
    }

    const filePath = `templates/${name}.yaml`
    const content = YAML.stringify(template, { indent: 2 })

    await writeFile(filePath, content, 'utf-8')

    this.logger.info(`Created template ${name} with ${rules.length} rules`)

    return filePath
  }

  private emitExportEvent(eventSubtype: string, data: unknown): void {
    if (!this.eventBus) return

    const eventType = eventSubtype.startsWith('export') ? 'system.export' : 'system.import'

    this.eventBus.emit({
      type: eventType as 'system.export' | 'system.import',
      payload: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: eventSubtype as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...data as any
      },
    })
  }
}