import { existsSync, readdirSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import Ajv from 'ajv'
import type { ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'
import YAML from 'yaml'
import type { EventBus } from './event-bus'
import type { DataStores } from './storage'
import { createLogger, Logger } from './logger'
import { PluginSandbox, resolvePluginEntry } from './plugin-sandbox'
import { CircuitBreakerManager } from './circuit-breaker'
import { RetryManager, RetryProfiles } from './retry-manager'
import { ErrorReporter, ErrorCategory } from './error-reporter'
import { pluginManifestSchema } from '../../shared/plugins/manifest-schema'
import type {
  LoadedPlugin,
  PluginManifest,
  PluginModule,
  PluginStatusUpdate,
  PluginConfigSnapshot,
} from '../../shared/plugins/types'

export interface PluginManagerOptions {
  builtInDirectory: string
  externalDirectory: string
}

export class PluginManager {
  private readonly options: PluginManagerOptions
  private readonly eventBus: EventBus
  private readonly stores: DataStores
  private readonly logger: Logger
  private readonly ajv = new Ajv({ allErrors: true, allowUnionTypes: true })
  private readonly validator: ValidateFunction<PluginManifest>
  private readonly plugins = new Map<string, LoadedPlugin>()
  private readonly statuses = new Map<string, PluginStatusUpdate>()
  private readonly circuitBreakerManager: CircuitBreakerManager
  private readonly retryManager: RetryManager
  private readonly errorReporter: ErrorReporter

  constructor(options: PluginManagerOptions, eventBus: EventBus, stores: DataStores, logger = createLogger('PluginManager')) {
    this.options = options
    this.eventBus = eventBus
    this.stores = stores
    this.logger = logger

    addFormats(this.ajv)
    this.validator = this.ajv.compile(pluginManifestSchema)

    // Initialize reliability components
    this.circuitBreakerManager = new CircuitBreakerManager(logger, eventBus)
    this.retryManager = new RetryManager(eventBus, logger)
    this.errorReporter = new ErrorReporter(eventBus, logger)
  }

  listLoaded(): LoadedPlugin[] {
    return Array.from(this.plugins.values())
  }

  getPlugin(pluginId: string) {
    return this.plugins.get(pluginId)
  }

  listStatuses(): Array<{ pluginId: string; status: PluginStatusUpdate }> {
    return Array.from(this.statuses.entries()).map(([pluginId, status]) => ({ pluginId, status }))
  }

  getStatus(pluginId: string) {
    return this.statuses.get(pluginId)
  }

  getConfig(pluginId: string): PluginConfigSnapshot {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not loaded`)
    }
    return this.stores.getPluginConfigSnapshot(pluginId)
  }

  updateConfig(pluginId: string, update: PluginConfigSnapshot) {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not loaded`)
    }

    if (plugin.instance.validateConfig) {
      const validation = plugin.instance.validateConfig(update)
      if (!validation.valid) {
        throw new Error(`Invalid configuration for plugin ${pluginId}: ${(validation.errors ?? []).join(', ')}`)
      }
    }

    this.stores.setPluginConfigSnapshot(pluginId, update)
    this.logger.info(`Updated configuration for plugin ${pluginId}`)

    // Call plugin's onConfigUpdate if it exists
    if (plugin.instance.onConfigUpdate) {
      const result = plugin.instance.onConfigUpdate(update)
      if (result && typeof result.catch === 'function') {
        result.catch((error: unknown) => {
          this.logger.error(`Plugin ${pluginId} failed to handle config update`, error)
        })
      }
    }

    return this.getConfig(pluginId)
  }

  async executeAction(pluginId: string, actionId: string, params: unknown) {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not loaded`)
    }

    // Use circuit breaker and retry logic for plugin actions
    const breaker = this.circuitBreakerManager.getBreaker(`plugin:${pluginId}:${actionId}`, {
      failureThreshold: 3,
      resetTimeout: 30000,
      timeout: 10000,
    })

    try {
      await breaker.execute(async () => {
        return this.retryManager.executeWithRetry(
          `plugin:${pluginId}:${actionId}`,
          async () => plugin.instance.executeAction(actionId, params),
          RetryProfiles.PLUGIN,
        )
      })
    } catch (error) {
      // Report error with recovery suggestions
      this.errorReporter.report(error, {
        category: ErrorCategory.PLUGIN,
        pluginId,
        operation: `executeAction:${actionId}`,
        metadata: { actionId, params },
      })

      // Re-throw for upstream handling
      throw error
    }
  }

  async loadPlugins() {
    const directories = this.collectPluginDirectories()
    const failures: Error[] = []
    for (const dir of directories) {
      try {
        const manifest = await this.readManifest(dir)
        if (!manifest) continue
        await this.loadPlugin(dir, manifest)
      } catch (error) {
        this.logger.error(`Failed to load plugin at ${dir}`, { error })
        failures.push(error instanceof Error ? error : new Error(String(error)))
      }
    }

    if (failures.length > 0) {
      const message = failures.map((failure) => failure.message).join('; ')
      throw new Error(`PluginManager encountered errors while loading plugins: ${message}`)
    }
  }

  async unloadAll() {
    for (const [pluginId, runtime] of this.plugins) {
      try {
        await runtime.instance.stopListening?.()
        await runtime.instance.destroy?.()
        this.eventBus.emitPluginStatus({
          pluginId,
          status: {
            state: 'disconnected',
            message: 'Plugin unloaded',
            at: Date.now(),
          },
        })
      } catch (error) {
        this.logger.error(`Error while unloading plugin ${pluginId}`, { error })
      }
      this.statuses.delete(pluginId)
    }
    this.plugins.clear()
  }

  private collectPluginDirectories() {
    const { builtInDirectory, externalDirectory } = this.options
    const directories: string[] = []

    for (const dir of [builtInDirectory, externalDirectory]) {
      if (!dir || !existsSync(dir)) continue
      const entries = readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isDirectory()) {
          directories.push(join(dir, entry.name))
        }
      }
    }

    return directories
  }

  private async readManifest(directory: string): Promise<PluginManifest | undefined> {
    const manifestPath = this.findManifestFile(directory)
    if (!manifestPath) {
      this.logger.warn(`No manifest found for plugin at ${directory}`)
      return undefined
    }

    const contents = await readFile(manifestPath, 'utf-8')
    const manifest = this.parseManifestContents(contents, extname(manifestPath))

    if (!this.validator(manifest)) {
      const errors = this.validator.errors?.map((err) => `${err.instancePath} ${err.message}`).join(', ')
      throw new Error(`Invalid manifest for plugin ${directory}: ${errors}`)
    }

    return manifest
  }

  private findManifestFile(directory: string) {
    const candidates = ['manifest.json', 'manifest.yaml', 'manifest.yml']
    for (const candidate of candidates) {
      const candidatePath = join(directory, candidate)
      if (existsSync(candidatePath)) {
        return candidatePath
      }
    }
    return undefined
  }

  private parseManifestContents(contents: string, extension: string): PluginManifest {
    if (extension === '.yaml' || extension === '.yml') {
      return YAML.parse(contents) as PluginManifest
    }
    return JSON.parse(contents) as PluginManifest
  }

  private async loadPlugin(directory: string, manifest: PluginManifest) {
    const existing = this.plugins.get(manifest.id)
    if (existing) {
      this.logger.warn(`Plugin ${manifest.id} already loaded. Skipping duplicate at ${directory}`)
      return
    }

    const entryPath = resolvePluginEntry(directory, manifest.main)
    const sandbox = new PluginSandbox(entryPath, this.buildSandboxOptions(manifest))
    const module = await sandbox.load(manifest.id)
    this.validatePluginModule(module, manifest)

    const runtimeLogger = createLogger(`plugin:${manifest.id}`)
    const captureEmit = (triggerId: string, data: unknown) => {
      this.eventBus.emitPluginTrigger({
        pluginId: manifest.id,
        triggerId,
        data,
        timestamp: Date.now(),
      })
    }

    const captureStatus = (status: PluginStatusUpdate) => {
      const normalized: PluginStatusUpdate = {
        ...status,
        at: status.at ?? Date.now(),
      }

      this.statuses.set(manifest.id, normalized)
      this.eventBus.emitPluginStatus({
        pluginId: manifest.id,
        status: normalized,
      })
    }

    const captureError = (error: Error | unknown, customMessage?: string) => {
      this.errorReporter.report(error, {
        category: ErrorCategory.PLUGIN,
        pluginId: manifest.id,
        metadata: customMessage ? { customMessage } : undefined,
      })
    }

    const configStore = this.stores.getPluginConfig(manifest.id)
    const secretStore = this.stores.getPluginSecrets(manifest.id)

    const createAccessor = (store: { get: (key: string) => unknown; set: (key: string, value: unknown) => void; delete: (key: string) => void; clear: () => void }) => ({
      get: <T = unknown>(key: string): T | undefined => store.get(key) as T | undefined,
      set: <T = unknown>(key: string, value: T) => {
        store.set(key, value as unknown)
      },
      delete: (key: string) => {
        store.delete(key)
      },
      clear: () => {
        store.clear()
      },
    })

    const context = {
      logger: runtimeLogger,
      eventBus: this.eventBus,
      settings: this.stores.settings,
      emitTrigger: captureEmit,
      emitStatus: captureStatus,
      emitError: captureError,
      storage: {
        config: createAccessor(configStore),
        secrets: createAccessor(secretStore),
      },
    }

    await module.initialize?.(context)
    const triggers = module.registerTriggers?.() ?? []
    const actions = module.registerActions?.() ?? []
    const configSchema = module.getConfigSchema?.()

    this.plugins.set(manifest.id, {
      manifest,
      instance: module,
      context,
      triggers,
      actions,
      configSchema,
    })

    await module.startListening?.()
    this.logger.info(`Loaded plugin ${manifest.id}@${manifest.version} from ${basename(directory)}`)

    if (!this.statuses.has(manifest.id)) {
      captureStatus({ state: 'idle', message: 'Plugin loaded' })
    }
  }

  private validatePluginModule(module: PluginModule, manifest: PluginManifest) {
    const requiredMethods: Array<keyof PluginModule> = [
      'initialize',
      'registerTriggers',
      'registerActions',
      'startListening',
      'stopListening',
      'executeAction',
      'destroy',
    ]

    for (const method of requiredMethods) {
      if (typeof module[method] !== 'function') {
        throw new Error(`Plugin ${manifest.id} is missing required function '${String(method)}'`)
      }
    }
  }

  private buildSandboxOptions(manifest: PluginManifest) {
    const allowedPackages = new Set<string>()
    const allowedModules = new Set<string>()

    if (manifest.dependencies) {
      for (const dependency of Object.keys(manifest.dependencies)) {
        allowedPackages.add(dependency)
      }
    }

    if (manifest.permissions) {
      for (const permission of manifest.permissions) {
        const [prefix, value] = permission.split(':')
        if (prefix === 'module' && value) {
          allowedModules.add(value)
        }
      }
    }

    return {
      allowedPackages: Array.from(allowedPackages),
      allowedModules: Array.from(allowedModules),
    }
  }
}

export const resolveBuiltInPluginDirectory = () => join(process.env.APP_ROOT ?? process.cwd(), 'src', 'plugins')
export const resolveExternalPluginDirectory = () => join(process.cwd(), 'plugins-external')
