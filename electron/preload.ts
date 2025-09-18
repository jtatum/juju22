import * as electron from 'electron'

const pluginChannels = {
  list: 'plugins:list',
  get: 'plugins:get',
  execute: 'plugins:execute-action',
} as const

const { contextBridge, ipcRenderer } = electron

const aidleBridge = {
  plugins: {
    list: () => ipcRenderer.invoke(pluginChannels.list),
    get: (pluginId: string) => ipcRenderer.invoke(pluginChannels.get, pluginId),
    executeAction: (pluginId: string, actionId: string, params: unknown) =>
      ipcRenderer.invoke(pluginChannels.execute, { pluginId, actionId, params }),
  },
  events: {
    onPluginTrigger: (handler: (payload: unknown) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: unknown) => handler(payload)
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
