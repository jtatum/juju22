import { useEffect } from 'react'
import MetricCard from '../components/MetricCard'
import PluginCard from '../components/PluginCard'
import EventFeed from '../components/EventFeed'
import { usePluginStore } from '../stores/usePluginStore'
import { useRuleStore } from '../stores/useRuleStore'
import { useEventStore } from '../stores/useEventStore'
import './DashboardPage.css'

export const DashboardPage = () => {
  const plugins = usePluginStore((state) => state.plugins)
  const fetchPlugins = usePluginStore((state) => state.fetchPlugins)
  const statuses = usePluginStore((state) => state.statuses)
  const rules = useRuleStore((state) => state.rules)
  const fetchRules = useRuleStore((state) => state.fetchRules)
  const events = useEventStore((state) => state.entries)

  useEffect(() => {
    void fetchPlugins()
    void fetchRules()
  }, [fetchPlugins, fetchRules])

  const connectedPlugins = Object.values(statuses).filter((status) => status.state === 'connected')

  return (
    <div className="dashboard">
      <section className="dashboard__metrics">
        <MetricCard
          label="Active Plugins"
          value={plugins.length}
          description={`${connectedPlugins.length} connected`}
        />
        <MetricCard
          label="Automation Rules"
          value={rules.length}
          description={`${rules.filter((rule) => rule.enabled).length} enabled`}
        />
        <MetricCard
          label="Recent Events"
          value={events.length}
          description={events.length > 0 ? `Last update ${new Date(events[0].timestamp).toLocaleTimeString()}` : 'No activity yet'}
        />
      </section>

      <section className="dashboard__section">
        <header>
          <h2>Plugin Health</h2>
          <p>Monitor plugin status and jump to configuration.</p>
        </header>
        <div className="dashboard__grid">
          {plugins.map((plugin) => (
            <PluginCard key={plugin.id} plugin={plugin} />
          ))}
          {plugins.length === 0 ? <p className="empty-state">No plugins loaded. Drop a plugin into plugins-external to get started.</p> : null}
        </div>
      </section>

      <section className="dashboard__section">
        <header>
          <h2>Live Event Monitor</h2>
          <p>Automation evaluations, dispatched actions, and errors stream in real time.</p>
        </header>
        {events.length === 0 ? <p className="empty-state">No automation events yet.</p> : <EventFeed entries={events} limit={12} />}
      </section>
    </div>
  )
}

export default DashboardPage
