import { useEffect, useMemo, useState } from 'react'
import type { VariableRecord, VariableScope } from '@shared/variables/types'
import { useVariableStore } from '../stores/useVariableStore'
import './VariablesPage.css'

const scopeOptions: Array<{ value: VariableScope; label: string }> = [
  { value: 'global', label: 'Global' },
  { value: 'plugin', label: 'Plugin' },
  { value: 'rule', label: 'Rule' },
]

const ownerLabelByScope: Record<Exclude<VariableScope, 'global'>, string> = {
  plugin: 'Plugin ID',
  rule: 'Rule ID',
}

const requiresOwner = (scope: VariableScope): scope is Exclude<VariableScope, 'global'> => scope !== 'global'

const formatValue = (record: VariableRecord) => {
  if (typeof record.value === 'object' && record.value !== null) {
    return JSON.stringify(record.value)
  }
  return String(record.value)
}

const VariablesPage = () => {
  const [scope, setScope] = useState<VariableScope>('global')
  const [ownerId, setOwnerId] = useState('')
  const [newKey, setNewKey] = useState('')
  const [rawValue, setRawValue] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const items = useVariableStore((state) => state.items)
  const loading = useVariableStore((state) => state.loading)
  const error = useVariableStore((state) => state.error)
  const fetchVariables = useVariableStore((state) => state.fetch)
  const setValue = useVariableStore((state) => state.setValue)
  const incrementValue = useVariableStore((state) => state.increment)
  const resetValue = useVariableStore((state) => state.reset)

  const activeOwner = useMemo(() => {
    if (!requiresOwner(scope)) {
      return undefined
    }
    const trimmed = ownerId.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }, [scope, ownerId])

  useEffect(() => {
    if (requiresOwner(scope) && !activeOwner) {
      return
    }
    void fetchVariables(scope, activeOwner)
  }, [scope, activeOwner, fetchVariables])

  const handleSave = async () => {
    try {
      if (!newKey.trim()) {
        throw new Error('Provide a variable key.')
      }
      let parsed: unknown = rawValue
      const trimmed = rawValue.trim()
      if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed === 'null' || trimmed === 'true' || trimmed === 'false') {
        parsed = JSON.parse(trimmed)
      } else if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
        parsed = Number(trimmed)
      }
      await setValue(scope, newKey.trim(), parsed, activeOwner)
      setNewKey('')
      setRawValue('')
      setActionError(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleIncrement = async (record: VariableRecord) => {
    try {
      await incrementValue(record.scope, record.key, 1, record.ownerId)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleReset = async (record: VariableRecord) => {
    try {
      await resetValue(record.scope, record.key, record.ownerId)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div className="variables-page">
      <header>
        <div>
          <h2>Variables</h2>
          <p>Manage global, plugin, and rule-scoped variables for your automations.</p>
        </div>
      </header>

      <section className="variables-controls">
        <label>
          <span>Scope</span>
          <select
            value={scope}
            onChange={(event) => {
              setScope(event.target.value as VariableScope)
              setOwnerId('')
            }}
          >
            {scopeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {requiresOwner(scope) ? (
          <label>
            <span>{ownerLabelByScope[scope]}</span>
            <input
              type="text"
              value={ownerId}
              onChange={(event) => setOwnerId(event.target.value)}
              placeholder={scope === 'plugin' ? 'system' : 'rule-id'}
            />
          </label>
        ) : null}
        <button
          type="button"
          className="ghost-button"
          onClick={() => void fetchVariables(scope, activeOwner)}
          disabled={requiresOwner(scope) && !activeOwner}
        >
          Refresh
        </button>
      </section>

      {requiresOwner(scope) && !activeOwner ? (
        <p className="hint">Provide a {ownerLabelByScope[scope]} to view scoped variables.</p>
      ) : null}

      {error ? <p className="error-text">{error}</p> : null}
      {actionError ? <p className="error-text">{actionError}</p> : null}

      <section className="variables-editor">
        <h3>Create or Update Variable</h3>
        <div className="form-grid">
          <label>
            <span>Key</span>
            <input type="text" value={newKey} onChange={(event) => setNewKey(event.target.value)} placeholder="counter" />
          </label>
          <label className="full-row">
            <span>Value</span>
            <textarea
              value={rawValue}
              onChange={(event) => setRawValue(event.target.value)}
              placeholder='42 or {"message":"hi"}'
              rows={3}
            />
          </label>
        </div>
        <div className="editor-actions">
          <button
            type="button"
            className="primary-button"
            onClick={handleSave}
            disabled={requiresOwner(scope) && !activeOwner}
          >
            Save Variable
          </button>
        </div>
      </section>

      <section className="variables-table">
        <h3>Current Variables</h3>
        {loading ? <p className="muted">Loading…</p> : null}
        {!loading && items.length === 0 ? <p className="muted">No variables found.</p> : null}
        {items.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((record) => (
                <tr key={`${record.scope}-${record.ownerId ?? 'global'}-${record.key}`}>
                  <td>{record.key}</td>
                  <td>{formatValue(record)}</td>
                  <td>{new Date(record.updatedAt).toLocaleString()}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="ghost-button" onClick={() => handleIncrement(record)}>
                        +1
                      </button>
                      <button type="button" className="ghost-button" onClick={() => handleReset(record)}>
                        Reset
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>
    </div>
  )
}

export default VariablesPage
