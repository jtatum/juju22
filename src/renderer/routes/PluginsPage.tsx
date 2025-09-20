import { useEffect } from 'react'
import PluginCard from '../components/PluginCard'
import { usePluginStore } from '../stores/usePluginStore'
import './PluginsPage.css'

export const PluginsPage = () => {
  const plugins = usePluginStore((state) => state.plugins)
  const fetchPlugins = usePluginStore((state) => state.fetchPlugins)
  const refreshStatuses = usePluginStore((state) => state.refreshStatuses)
  const loading = usePluginStore((state) => state.loading)

  useEffect(() => {
    void fetchPlugins()
    void refreshStatuses()
  }, [fetchPlugins, refreshStatuses])

  return (
    <div className="plugins-page">
      <header className="plugins-page__header">
        <div>
          <h2>Plugin Manager</h2>
          <p>Manage built-in and community plugins. Configure credentials, monitor status, and trigger actions.</p>
        </div>
        <button type="button" className="ghost-button" onClick={() => void refreshStatuses()} disabled={loading}>
          Refresh Status
        </button>
      </header>

      <div className="plugins-page__grid">
        {plugins.map((plugin) => (
          <PluginCard key={plugin.id} plugin={plugin} />
        ))}
      </div>

      {plugins.length === 0 ? <p className="empty-state">No plugins available. Ensure built-in plugins are bundled and reload the app.</p> : null}
    </div>
  )
}

export default PluginsPage
