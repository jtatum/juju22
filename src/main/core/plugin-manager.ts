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
import { pluginManifestSchema } from '../../shared/plugins/manifest-schema'
import type {
  LoadedPlugin,
  PluginManifest,
  PluginModule,
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

  constructor(options: PluginManagerOptions, eventBus: EventBus, stores: DataStores, logger = createLogger('PluginManager')) {
    this.options = options
    this.eventBus = eventBus
    this.stores = stores
    this.logger = logger

    addFormats(this.ajv)
    this.validator = this.ajv.compile(pluginManifestSchema)
  }

  listLoaded(): LoadedPlugin[] {
    return Array.from(this.plugins.values())
  }

  getPlugin(pluginId: string) {
    return this.plugins.get(pluginId)
  }

  async executeAction(pluginId: string, actionId: string, params: unknown) {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not loaded`)
    }

    await plugin.instance.executeAction(actionId, params)
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
      } catch (error) {
        this.logger.error(`Error while unloading plugin ${pluginId}`, { error })
      }
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
    const sandbox = new PluginSandbox(entryPath)
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

    const context = {
      logger: runtimeLogger,
      eventBus: this.eventBus,
      settings: this.stores.settings,
      emitTrigger: captureEmit,
    }

    await module.initialize?.(context)
    const triggers = module.registerTriggers?.() ?? []
    const actions = module.registerActions?.() ?? []

    this.plugins.set(manifest.id, {
      manifest,
      instance: module,
      context,
      triggers,
      actions,
    })

    await module.startListening?.()
    this.logger.info(`Loaded plugin ${manifest.id}@${manifest.version} from ${basename(directory)}`)
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
}

export const resolveBuiltInPluginDirectory = () => join(process.env.APP_ROOT ?? process.cwd(), 'src', 'plugins')
export const resolveExternalPluginDirectory = () => join(process.cwd(), 'plugins-external')
