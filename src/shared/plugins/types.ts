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

export interface PluginStorageAccessor {
  get<T = unknown>(key: string): T | undefined
  set<T = unknown>(key: string, value: T): void
  delete(key: string): void
  clear(): void
}

export interface PluginStorageBridge {
  config: PluginStorageAccessor
  secrets: PluginStorageAccessor
}

export type PluginConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error'

export interface PluginStatusUpdate {
  state: PluginConnectionState
  message?: string
  details?: Record<string, unknown>
  at?: number
}

export interface PluginContext {
  logger: Logger
  eventBus: EventBus
  settings: SettingsStore
  emitTrigger: (triggerId: string, data: unknown) => void
  emitStatus: (status: PluginStatusUpdate) => void
  storage: PluginStorageBridge
}

export interface MatchedRuleSummary {
  ruleId: string
  matched: boolean
  reason?: string
}

export interface PluginEventPayload {
  pluginId: string
  triggerId: string
  data: unknown
  timestamp: number
  matchedRules?: MatchedRuleSummary[]
}

export interface PluginStatusPayload {
  pluginId: string
  status: PluginStatusUpdate
}

export interface PluginSummary {
  id: string
  name: string
  version: string
  author: string
  triggers: TriggerDefinition[]
  actions: ActionDefinition[]
  hasConfigSchema?: boolean
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
  configSchema?: JSONSchemaType<unknown> | Record<string, unknown>
}

export type PluginConfigSnapshot = Record<string, unknown>
