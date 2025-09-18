import type { JSONSchemaType } from 'ajv'
import type { Logger } from '../../main/core/logger'
import type { EventBus } from '../../main/core/event-bus'
import type { SettingsStore } from '../../main/core/storage'

export interface PluginManifest {
  id: string
  name: string
  version: string
  author: string
  description?: string
  homepage?: string
  license?: string
  main: string
  triggers?: TriggerDefinition[]
  actions?: ActionDefinition[]
  configSchema?: Record<string, unknown>
  permissions?: string[]
  dependencies?: Record<string, string>
}

export interface TriggerDefinition {
  id: string
  name: string
  description?: string
  schema?: Record<string, unknown>
}

export interface ActionDefinition {
  id: string
  name: string
  description?: string
  schema?: Record<string, unknown>
}

export interface ValidationResult {
  valid: boolean
  errors?: string[]
}

export interface PluginContext {
  logger: Logger
  eventBus: EventBus
  settings: SettingsStore
  emitTrigger: (triggerId: string, data: unknown) => void
}

export interface PluginEventPayload {
  pluginId: string
  triggerId: string
  data: unknown
  timestamp: number
}

export interface PluginModule {
  manifest: PluginManifest
  initialize(context: PluginContext): Promise<void> | void
  destroy(): Promise<void> | void
  registerTriggers(): TriggerDefinition[]
  startListening(): Promise<void> | void
  stopListening(): Promise<void> | void
  registerActions(): ActionDefinition[]
  executeAction(actionId: string, params: unknown): Promise<void> | void
  getConfigSchema?(): JSONSchemaType<unknown> | Record<string, unknown> | undefined
  validateConfig?(config: unknown): ValidationResult
}

export interface LoadedPlugin {
  manifest: PluginManifest
  instance: PluginModule
  context: PluginContext
  triggers: TriggerDefinition[]
  actions: ActionDefinition[]
}
