import { create } from 'zustand'
import type { PluginStatusPayload, PluginSummary, PluginStatusUpdate, PluginConfigSnapshot } from '@shared/plugins/types'

type PluginState = {
  plugins: PluginSummary[]
  statuses: Record<string, PluginStatusUpdate>
  configs: Record<string, PluginConfigSnapshot>
  loading: boolean
  error: string | null
  fetchPlugins: () => Promise<void>
  refreshStatuses: () => Promise<void>
  applyStatus: (payload: PluginStatusPayload) => void
  applyStatusBootstrap: (entries: PluginStatusPayload[]) => void
  fetchConfig: (pluginId: string) => Promise<PluginConfigSnapshot>
  saveConfig: (pluginId: string, config: PluginConfigSnapshot) => Promise<PluginConfigSnapshot>
}

export const usePluginStore = create<PluginState>((set, get) => ({
  plugins: [],
  statuses: {},
  configs: {},
  loading: false,
  error: null,
  async fetchPlugins() {
    if (get().loading) return
    set({ loading: true, error: null })
    try {
      const plugins = await window.juju22.plugins.list()
      set({ plugins })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) })
    } finally {
      set({ loading: false })
    }
  },
  async refreshStatuses() {
    try {
      const statuses = await window.juju22.plugins.listStatuses()
      set((state) => {
        const next = { ...state.statuses }
        for (const entry of statuses) {
          next[entry.pluginId] = entry.status
        }
        return { statuses: next }
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) })
    }
  },
  applyStatus(payload) {
    set((state) => ({ statuses: { ...state.statuses, [payload.pluginId]: payload.status } }))
  },
  applyStatusBootstrap(entries) {
    set((state) => {
      const next = { ...state.statuses }
      for (const entry of entries) {
        next[entry.pluginId] = entry.status
      }
      return { statuses: next }
    })
  },
  async fetchConfig(pluginId) {
    const cached = get().configs[pluginId]
    if (cached) {
      return cached
    }

    const config = await window.juju22.plugins.getConfig(pluginId)
    set((state) => ({ configs: { ...state.configs, [pluginId]: config } }))
    return config
  },
  async saveConfig(pluginId, config) {
    const response = await window.juju22.plugins.saveConfig(pluginId, config)
    set((state) => ({ configs: { ...state.configs, [pluginId]: response.config } }))
    return response.config
  },
}))
