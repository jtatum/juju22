import * as electron from 'electron'
import type {
  ActionDefinition,
  PluginEventPayload,
  PluginManifest,
  PluginSummary,
  TriggerDefinition,
} from '@shared/plugins/types'

const pluginChannels = {
  list: 'plugins:list',
  get: 'plugins:get',
  execute: 'plugins:execute-action',
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
  events: {
    onPluginTrigger: (handler: (payload: PluginEventPayload) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: PluginEventPayload) => handler(payload)
      ipcRenderer.on('events:plugin-trigger', listener)
      return () => ipcRenderer.off('events:plugin-trigger', listener)
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
