import { useEffect, useMemo, useState } from 'react'
import type { EventLogEntry } from '@shared/events/types'
import type { PluginSummary } from '@shared/plugins/types'
import type { RuleDefinition } from '@shared/rules/types'
import './App.css'

function App() {
  const [plugins, setPlugins] = useState<PluginSummary[]>([])
  const [rules, setRules] = useState<RuleDefinition[]>([])
  const [logEntries, setLogEntries] = useState<EventLogEntry[]>([])
  const [statusMessage, setStatusMessage] = useState<string>('')

  useEffect(() => {
    Promise.all([window.aidle.plugins.list(), window.aidle.rules.list()])
      .then(([loadedPlugins, definedRules]) => {
        setPlugins(loadedPlugins)
        setRules(definedRules)
        setStatusMessage(`Loaded ${loadedPlugins.length} plugin(s) • ${definedRules.length} rule(s) active`)
      })
      .catch((error) => {
        setStatusMessage(`Bootstrap failed: ${error.message}`)
      })

    const unsubscribeTrigger = window.aidle.events.onPluginTrigger((payload) => {
      setStatusMessage(`Trigger ${payload.pluginId}:${payload.triggerId} received`)
    })

    const unsubscribeBootstrap = window.aidle.events.onLogBootstrap((entries) => {
      setLogEntries(entries)
    })

    const unsubscribeLog = window.aidle.events.onLogEntry((entry) => {
      setLogEntries((current) => [entry, ...current].slice(0, 50))
    })

    return () => {
      unsubscribeTrigger()
      unsubscribeBootstrap()
      unsubscribeLog()
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

  const ruleCount = useMemo(() => rules.filter((rule) => rule.enabled !== false).length, [rules])

  const displayedLogEntries = useMemo(() => logEntries.slice(0, 25), [logEntries])

  return (
    <div className="container">
      <header>
        <h1>Aidle Dashboard</h1>
        <p className="status">{statusMessage || `Ready • ${plugins.length} plugins • ${ruleCount} rules`}</p>
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
        <h2>Automation Rules</h2>
        {rules.length === 0 ? (
          <p>No rules defined yet. Build your first automation in Phase 2.</p>
        ) : (
          <ul className="plugin-list">
            {rules.map((rule) => (
              <li key={rule.id}>
                <h3>
                  {rule.name}{' '}
                  <span className="muted">{rule.enabled ? 'enabled' : 'disabled'}</span>
                </h3>
                <p className="muted">
                  {rule.trigger.pluginId}:{rule.trigger.triggerId} → {rule.actions.map((action) => action.actionId).join(', ')}
                </p>
                {rule.conditions && rule.conditions.length > 0 && (
                  <div className="meta">
                    <span>{rule.conditions.length} condition(s)</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Event Feed</h2>
        {displayedLogEntries.length === 0 ? (
          <p>No activity yet. Start the demo timer to emit a trigger.</p>
        ) : (
          <ul className="event-list">
            {displayedLogEntries.map((entry, index) => (
              <li key={`${entry.type}-${entry.timestamp}-${index}`}>
                <header className="event-header">
                  <strong>{formatEventType(entry.type)}</strong>
                  <time dateTime={new Date(entry.timestamp).toISOString()}>
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </time>
                </header>
                {renderEventBody(entry)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

const formatEventType = (type: EventLogEntry['type']) => {
  switch (type) {
    case 'plugin.trigger':
      return 'Plugin Trigger'
    case 'rule.evaluation':
      return 'Rule Evaluated'
    case 'rule.action':
      return 'Action Dispatched'
    case 'rule.error':
      return 'Rule Error'
    default:
      return type
  }
}

const renderEventBody = (entry: EventLogEntry) => {
  switch (entry.type) {
    case 'plugin.trigger': {
      const payload = entry.payload
      return (
        <div>
          <p>
            <strong>{payload.pluginId}</strong>
            <span className="muted">{payload.triggerId}</span>
          </p>
          <pre>{JSON.stringify(payload.data, null, 2)}</pre>
          {payload.matchedRules && payload.matchedRules.length > 0 && (
            <p className="muted">
              Rules evaluated:{' '}
              {payload.matchedRules.map((match) => `${match.ruleId}${match.matched ? '' : ' (miss)'}`).join(', ')}
            </p>
          )}
        </div>
      )
    }
    case 'rule.evaluation': {
      const { ruleId, result } = entry.payload
      return (
        <div>
          <p>
            Rule <strong>{ruleId}</strong> {result.matched ? 'matched' : 'did not match'}.
          </p>
          {result.reason && <p className="muted">{result.reason}</p>}
        </div>
      )
    }
    case 'rule.action': {
      const { ruleId, action } = entry.payload
      return (
        <div>
          <p>
            Action <strong>{action.actionId}</strong> dispatched for rule <strong>{ruleId}</strong>.
          </p>
          {action.params && <pre>{JSON.stringify(action.params, null, 2)}</pre>}
        </div>
      )
    }
    case 'rule.error': {
      const { ruleId, error, details } = entry.payload
      return (
        <div>
          <p>
            {ruleId ? (
              <>
                Rule <strong>{ruleId}</strong> error: {error}
              </>
            ) : (
              <>Rule error: {error}</>
            )}
          </p>
          {details && <pre>{JSON.stringify(details, null, 2)}</pre>}
        </div>
      )
    }
    default:
      return <pre>{JSON.stringify(entry.payload, null, 2)}</pre>
  }
}

export default App
