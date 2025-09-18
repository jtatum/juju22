import * as electron from 'electron'
import type {
  ActionDefinition,
  PluginEventPayload,
  PluginManifest,
  PluginSummary,
  TriggerDefinition,
} from '@shared/plugins/types'
import type { RuleDefinition } from '@shared/rules/types'
import type { EventLogEntry } from '@shared/events/types'

const pluginChannels = {
  list: 'plugins:list',
  get: 'plugins:get',
  execute: 'plugins:execute-action',
} as const

const ruleChannels = {
  list: 'rules:list',
  get: 'rules:get',
  save: 'rules:save',
  delete: 'rules:delete',
} as const

const { contextBridge, ipcRenderer } = electron

type PluginDetails = {
  manifest: PluginManifest
  triggers: TriggerDefinition[]
  actions: ActionDefinition[]
}

const aidleBridge = {
  plugins: {
    list: () => ipcRenderer.invoke(pluginChannels.list) as Promise<PluginSummary[]>,
    get: (pluginId: string) =>
      ipcRenderer.invoke(pluginChannels.get, pluginId) as Promise<PluginDetails | null>,
    executeAction: (pluginId: string, actionId: string, params: unknown) =>
      ipcRenderer.invoke(pluginChannels.execute, { pluginId, actionId, params }) as Promise<{ status: 'ok' }>,
  },
  rules: {
    list: () => ipcRenderer.invoke(ruleChannels.list) as Promise<RuleDefinition[]>,
    get: (ruleId: string) => ipcRenderer.invoke(ruleChannels.get, ruleId) as Promise<RuleDefinition | null>,
    save: (rule: RuleDefinition) => ipcRenderer.invoke(ruleChannels.save, rule) as Promise<RuleDefinition>,
    delete: (ruleId: string) => ipcRenderer.invoke(ruleChannels.delete, ruleId) as Promise<{ status: 'ok' }>,
  },
  events: {
    onPluginTrigger: (handler: (payload: PluginEventPayload) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: PluginEventPayload) => handler(payload)
      ipcRenderer.on('events:plugin-trigger', listener)
      return () => ipcRenderer.off('events:plugin-trigger', listener)
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
  },
}

contextBridge.exposeInMainWorld('aidle', aidleBridge)

export type AidleBridge = typeof aidleBridge

declare global {
  interface Window {
    aidle: AidleBridge
  }
}
