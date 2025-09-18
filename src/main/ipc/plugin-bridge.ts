import * as electron from 'electron'
import type { PluginManager } from '../core/plugin-manager'
import type { PluginSummary, LoadedPlugin } from '../../shared/plugins/types'

type PluginDetails = Pick<LoadedPlugin, 'manifest' | 'triggers' | 'actions'>

export const registerPluginBridge = (pluginManager: PluginManager) => {
  const { ipcMain } = electron
  ipcMain.handle('plugins:list', (): PluginSummary[] => {
    return pluginManager.listLoaded().map((plugin) => ({
      id: plugin.manifest.id,
      name: plugin.manifest.name,
      version: plugin.manifest.version,
      author: plugin.manifest.author,
      triggers: plugin.triggers,
      actions: plugin.actions,
    }))
  })

  ipcMain.handle('plugins:get', (_event, pluginId: string): PluginDetails | null => {
    const plugin = pluginManager.getPlugin(pluginId)
    if (!plugin) return null
    return {
      manifest: plugin.manifest,
      triggers: plugin.triggers,
      actions: plugin.actions,
    }
  })

  ipcMain.handle('plugins:execute-action', async (_event, payload: { pluginId: string; actionId: string; params: unknown }) => {
    const { pluginId, actionId, params } = payload
    await pluginManager.executeAction(pluginId, actionId, params)
    return { status: 'ok' }
  })
}
