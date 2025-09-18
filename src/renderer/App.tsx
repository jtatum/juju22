import { useEffect, useState } from 'react'
import type { PluginEventPayload, PluginSummary } from '@shared/plugins/types'
import './App.css'

function App() {
  const [plugins, setPlugins] = useState<PluginSummary[]>([])
  const [events, setEvents] = useState<PluginEventPayload[]>([])
  const [statusMessage, setStatusMessage] = useState<string>('')

  useEffect(() => {
    window.aidle.plugins
      .list()
      .then((loadedPlugins) => {
        setPlugins(loadedPlugins)
        setStatusMessage(`Loaded ${loadedPlugins.length} plugin(s)`) 
      })
      .catch((error) => {
        setStatusMessage(`Failed to load plugins: ${error.message}`)
      })

    const unsubscribe = window.aidle.events.onPluginTrigger((payload) => {
      setEvents((current) => [payload, ...current].slice(0, 10))
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleTriggerTimer = async () => {
    try {
      await window.aidle.plugins.executeAction('system', 'timer.start', {
        timerId: `demo-${Date.now()}`,
        durationMs: 1000,
      })
      setStatusMessage('Demo timer started. Expect an event shortly!')
    } catch (error) {
      setStatusMessage(`Failed to start timer: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Aidle Dashboard</h1>
        <p className="status">{statusMessage}</p>
        <button type="button" onClick={handleTriggerTimer}>
          Start Demo Timer
        </button>
      </header>

      <section>
        <h2>Loaded Plugins</h2>
        {plugins.length === 0 ? (
          <p>No plugins loaded yet.</p>
        ) : (
          <ul className="plugin-list">
            {plugins.map((plugin) => (
              <li key={plugin.id}>
                <h3>
                  {plugin.name} <span className="muted">v{plugin.version}</span>
                </h3>
                <p className="muted">by {plugin.author}</p>
                <div className="meta">
                  <span>{plugin.triggers.length} triggers</span>
                  <span>{plugin.actions.length} actions</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Recent Events</h2>
        {events.length === 0 ? (
          <p>No events yet. Start the demo timer to emit a trigger.</p>
        ) : (
          <ul className="event-list">
            {events.map((event) => (
              <li key={`${event.pluginId}-${event.triggerId}-${event.timestamp}`}>
                <div>
                  <strong>{event.pluginId}</strong>
                  <span className="muted">{event.triggerId}</span>
                </div>
                <time dateTime={new Date(event.timestamp).toISOString()}>
                  {new Date(event.timestamp).toLocaleTimeString()}
                </time>
                <pre>{JSON.stringify(event.data, null, 2)}</pre>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default App
