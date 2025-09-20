import * as electron from 'electron'
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

const { contextBridge, ipcRenderer } = electron

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
      const listener = (_event: Electron.IpcRendererEvent, payload: PluginEventPayload) => handler(payload)
      ipcRenderer.on('events:plugin-trigger', listener)
      return () => ipcRenderer.off('events:plugin-trigger', listener)
    },
    onPluginStatus: (handler: (payload: PluginStatusPayload) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: PluginStatusPayload) => handler(payload)
      ipcRenderer.on('events:plugin-status', listener)
      return () => ipcRenderer.off('events:plugin-status', listener)
    },
    onLogEntry: (handler: (entry: EventLogEntry) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, entry: EventLogEntry) => handler(entry)
      ipcRenderer.on('events:log-entry', listener)
      return () => ipcRenderer.off('events:log-entry', listener)
    },
    onLogBootstrap: (handler: (entries: EventLogEntry[]) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, entries: EventLogEntry[]) => handler(entries)
      ipcRenderer.on('events:log-bootstrap', listener)
      return () => ipcRenderer.off('events:log-bootstrap', listener)
    },
    onPluginStatusBootstrap: (handler: (entries: PluginStatusPayload[]) => void) => {
      const listener = (
        _event: Electron.IpcRendererEvent,
        entries: PluginStatusPayload[],
      ) => handler(entries)
      ipcRenderer.on('events:plugin-status-bootstrap', listener)
      return () => ipcRenderer.off('events:plugin-status-bootstrap', listener)
    },
    onVariableMutation: (handler: (mutation: VariableMutation) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, mutation: VariableMutation) => handler(mutation)
      ipcRenderer.on('events:variables-mutated', listener)
      return () => ipcRenderer.off('events:variables-mutated', listener)
    },
  },
}

contextBridge.exposeInMainWorld('aidle', aidleBridge)

export type AidleBridge = typeof aidleBridge

declare global {
  interface Window {
    aidle: AidleBridge
  }
}
