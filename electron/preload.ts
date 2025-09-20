console.log('[PRELOAD] Starting preload script...')

let electron
try {
  console.log('[PRELOAD] Attempting to require electron...')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  electron = require('electron')
  console.log('[PRELOAD] Electron required successfully:', typeof electron, Object.keys(electron || {}))
} catch (err) {
  console.error('[PRELOAD] Failed to require electron:', err)
  throw err
}

let contextBridge, ipcRenderer
try {
  console.log('[PRELOAD] Getting contextBridge and ipcRenderer...')
  contextBridge = electron.contextBridge
  ipcRenderer = electron.ipcRenderer
  console.log('[PRELOAD] Got contextBridge:', typeof contextBridge)
  console.log('[PRELOAD] Got ipcRenderer:', typeof ipcRenderer)
} catch (err) {
  console.error('[PRELOAD] Failed to get contextBridge/ipcRenderer:', err)
  throw err
}
import type { IpcRendererEvent } from 'electron'
import type { JSONSchemaType } from 'ajv'
import type {
  ActionDefinition,
  PluginEventPayload,
  PluginManifest,
  PluginSummary,
  PluginStatusPayload,
  TriggerDefinition,
} from '@shared/plugins/types'
import type { RuleDefinition, RuleEvaluationResult } from '@shared/rules/types'
import type { EventLogEntry } from '@shared/events/types'
import type { VariableMutation, VariableRecord, VariableScope, VariableSnapshot } from '@shared/variables/types'

const pluginChannels = {
  list: 'plugins:list',
  get: 'plugins:get',
  execute: 'plugins:execute-action',
  statuses: 'plugins:statuses',
  getConfig: 'plugins:get-config',
  saveConfig: 'plugins:save-config',
} as const

const ruleChannels = {
  list: 'rules:list',
  get: 'rules:get',
  save: 'rules:save',
  delete: 'rules:delete',
  test: 'rules:test',
} as const

const variableChannels = {
  list: 'variables:list',
  get: 'variables:get',
  set: 'variables:set',
  increment: 'variables:increment',
  reset: 'variables:reset',
  snapshot: 'variables:snapshot',
} as const

type PluginDetails = {
  manifest: PluginManifest
  triggers: TriggerDefinition[]
  actions: ActionDefinition[]
  configSchema?: JSONSchemaType<unknown> | Record<string, unknown>
}

const aidleBridge = {
  plugins: {
    list: () => ipcRenderer.invoke(pluginChannels.list) as Promise<PluginSummary[]>,
    get: (pluginId: string) =>
      ipcRenderer.invoke(pluginChannels.get, pluginId) as Promise<PluginDetails | null>,
    executeAction: (pluginId: string, actionId: string, params: unknown) =>
      ipcRenderer.invoke(pluginChannels.execute, { pluginId, actionId, params }) as Promise<{ status: 'ok' }>,
    listStatuses: () => ipcRenderer.invoke(pluginChannels.statuses) as Promise<PluginStatusPayload[]>,
    getConfig: (pluginId: string) => ipcRenderer.invoke(pluginChannels.getConfig, pluginId) as Promise<Record<string, unknown>>,
    saveConfig: (pluginId: string, config: Record<string, unknown>) =>
      ipcRenderer.invoke(pluginChannels.saveConfig, { pluginId, config }) as Promise<{ status: 'ok'; config: Record<string, unknown> }>,
  },
  rules: {
    list: () => ipcRenderer.invoke(ruleChannels.list) as Promise<RuleDefinition[]>,
    get: (ruleId: string) => ipcRenderer.invoke(ruleChannels.get, ruleId) as Promise<RuleDefinition | null>,
    save: (rule: RuleDefinition) => ipcRenderer.invoke(ruleChannels.save, rule) as Promise<RuleDefinition>,
    delete: (ruleId: string) => ipcRenderer.invoke(ruleChannels.delete, ruleId) as Promise<{ status: 'ok' }>,
    test: (rule: RuleDefinition, data: unknown) =>
      ipcRenderer.invoke(ruleChannels.test, { rule, data }) as Promise<RuleEvaluationResult>,
  },
  variables: {
    list: (scope: VariableScope, ownerId?: string) =>
      ipcRenderer.invoke(variableChannels.list, { scope, ownerId }) as Promise<VariableRecord[]>,
    get: (scope: VariableScope, key: string, ownerId?: string) =>
      ipcRenderer.invoke(variableChannels.get, { scope, key, ownerId }) as Promise<unknown>,
    set: (scope: VariableScope, key: string, value: unknown, ownerId?: string) =>
      ipcRenderer.invoke(variableChannels.set, { scope, key, value, ownerId }) as Promise<VariableRecord>,
    increment: (scope: VariableScope, key: string, amount = 1, ownerId?: string) =>
      ipcRenderer.invoke(variableChannels.increment, { scope, key, amount, ownerId }) as Promise<VariableRecord>,
    reset: (scope: VariableScope, key: string, ownerId?: string) =>
      ipcRenderer.invoke(variableChannels.reset, { scope, key, ownerId }) as Promise<{ status: 'ok' }>,
    snapshot: (ruleId: string, pluginId: string) =>
      ipcRenderer.invoke(variableChannels.snapshot, { ruleId, pluginId }) as Promise<VariableSnapshot>,
  },
  events: {
    onPluginTrigger: (handler: (payload: PluginEventPayload) => void) => {
      const listener = (_event: IpcRendererEvent, payload: PluginEventPayload) => handler(payload)
      ipcRenderer.on('events:plugin-trigger', listener)
      return () => ipcRenderer.off('events:plugin-trigger', listener)
    },
    onPluginStatus: (handler: (payload: PluginStatusPayload) => void) => {
      const listener = (_event: IpcRendererEvent, payload: PluginStatusPayload) => handler(payload)
      ipcRenderer.on('events:plugin-status', listener)
      return () => ipcRenderer.off('events:plugin-status', listener)
    },
    onLogEntry: (handler: (entry: EventLogEntry) => void) => {
      const listener = (_event: IpcRendererEvent, entry: EventLogEntry) => handler(entry)
      ipcRenderer.on('events:log-entry', listener)
      return () => ipcRenderer.off('events:log-entry', listener)
    },
    onLogBootstrap: (handler: (entries: EventLogEntry[]) => void) => {
      const listener = (_event: IpcRendererEvent, entries: EventLogEntry[]) => handler(entries)
      ipcRenderer.on('events:log-bootstrap', listener)
      return () => ipcRenderer.off('events:log-bootstrap', listener)
    },
    onPluginStatusBootstrap: (handler: (entries: PluginStatusPayload[]) => void) => {
      const listener = (
        _event: IpcRendererEvent,
        entries: PluginStatusPayload[],
      ) => handler(entries)
      ipcRenderer.on('events:plugin-status-bootstrap', listener)
      return () => ipcRenderer.off('events:plugin-status-bootstrap', listener)
    },
    onVariableMutation: (handler: (mutation: VariableMutation) => void) => {
      const listener = (_event: IpcRendererEvent, mutation: VariableMutation) => handler(mutation)
      ipcRenderer.on('events:variables-mutated', listener)
      return () => ipcRenderer.off('events:variables-mutated', listener)
    },
    onError: (handler: (error: {
      id: string;
      message: string;
      code?: string;
      userMessage?: string;
      suggestions?: string[];
      category: string;
      severity: string;
      recoverable: boolean;
      timestamp: string;
    }) => void) => {
      const listener = (_event: IpcRendererEvent, error: Parameters<typeof handler>[0]) => handler(error)
      ipcRenderer.on('error:reported', listener)
      return () => ipcRenderer.off('error:reported', listener)
    },
    onErrorRecovered: (handler: (recovery: {
      id: string;
      message: string;
    }) => void) => {
      const listener = (_event: IpcRendererEvent, recovery: Parameters<typeof handler>[0]) => handler(recovery)
      ipcRenderer.on('error:recovered', listener)
      return () => ipcRenderer.off('error:recovered', listener)
    },
    onCircuitOpened: (handler: (circuit: {
      name: string;
      failureCount: number;
      message: string;
      suggestions: string[];
    }) => void) => {
      const listener = (_event: IpcRendererEvent, circuit: Parameters<typeof handler>[0]) => handler(circuit)
      ipcRenderer.on('circuit:opened', listener)
      return () => ipcRenderer.off('circuit:opened', listener)
    },
    onCircuitClosed: (handler: (circuit: {
      name: string;
      message: string;
    }) => void) => {
      const listener = (_event: IpcRendererEvent, circuit: Parameters<typeof handler>[0]) => handler(circuit)
      ipcRenderer.on('circuit:closed', listener)
      return () => ipcRenderer.off('circuit:closed', listener)
    },
    // Generic event listeners for custom events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on: (channel: string, callback: (...args: any[]) => void) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const listener = (_event: IpcRendererEvent, ...args: any[]) => callback(...args)
      ipcRenderer.on(channel, listener)
      return () => ipcRenderer.off(channel, listener)
    },
    removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
  },
  settings: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: (key: string) => ipcRenderer.invoke('settings:get', key) as Promise<any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set: (key: string, value: any) => ipcRenderer.invoke('settings:set', key, value) as Promise<{ success: boolean }>,
    has: (key: string) => ipcRenderer.invoke('settings:has', key) as Promise<boolean>,
    delete: (key: string) => ipcRenderer.invoke('settings:delete', key) as Promise<{ success: boolean }>,
    clear: () => ipcRenderer.invoke('settings:clear') as Promise<{ success: boolean }>,
  },
  backup: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create: (label?: string) => ipcRenderer.invoke('backup:create', label) as Promise<any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    list: () => ipcRenderer.invoke('backup:list') as Promise<any[]>,
    restore: (backupId: string) => ipcRenderer.invoke('backup:restore', backupId) as Promise<{ success: boolean }>,
    delete: (backupId: string) => ipcRenderer.invoke('backup:delete', backupId) as Promise<{ success: boolean }>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSettings: () => ipcRenderer.invoke('backup:getSettings') as Promise<any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateSettings: (settings: any) => ipcRenderer.invoke('backup:updateSettings', settings) as Promise<{ success: boolean }>,
  },
  importExport: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exportRules: (ruleIds?: string[]) => ipcRenderer.invoke('import-export:exportRules', ruleIds) as Promise<any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    importRules: () => ipcRenderer.invoke('import-export:importRules') as Promise<any>,
  },
  performance: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getMetrics: () => ipcRenderer.invoke('performance:getMetrics') as Promise<{ success: boolean; data?: any; error?: string }>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getMemoryMetrics: () => ipcRenderer.invoke('performance:getMemoryMetrics') as Promise<{ success: boolean; data?: any; error?: string }>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    detectMemoryLeaks: () => ipcRenderer.invoke('performance:detectMemoryLeaks') as Promise<{ success: boolean; data?: any[]; error?: string }>,
  },
  // Generic invoke for any custom IPC handlers (for backwards compatibility during migration)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
}

try {
  console.log('[PRELOAD] About to expose aidle bridge to window...')
  contextBridge.exposeInMainWorld('aidle', aidleBridge)
  console.log('[PRELOAD] Successfully exposed aidle bridge!')
} catch (err) {
  console.error('[PRELOAD] Failed to expose aidle bridge:', err)
  throw err
}

console.log('[PRELOAD] Preload script completed successfully!')

export type AidleBridge = typeof aidleBridge

declare global {
  interface Window {
    aidle: AidleBridge
  }
}