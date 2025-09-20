import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { RuleCondition, RuleDefinition, RuleActionInvocation } from '@shared/rules/types'
import { usePluginStore } from '../stores/usePluginStore'
import { useRuleStore } from '../stores/useRuleStore'
import StatusBadge from '../components/StatusBadge'
import './RuleEditorPage.css'

const createEmptyRule = (): RuleDefinition => ({
  id: '',
  name: '',
  description: '',
  trigger: { pluginId: '', triggerId: '' },
  conditions: [],
  actions: [],
  enabled: true,
  priority: 0,
  tags: [],
})

const defaultCondition = (): RuleCondition => ({
  type: 'equals',
  path: '',
  value: '',
})

const defaultAction = (): RuleActionInvocation => ({
  pluginId: '',
  actionId: '',
  params: {},
})

export const RuleEditorPage = () => {
  const { ruleId } = useParams<{ ruleId: string }>()
  const editingExisting = Boolean(ruleId && ruleId !== 'new')
  const navigate = useNavigate()
  const plugins = usePluginStore((state) => state.plugins)
  const statuses = usePluginStore((state) => state.statuses)
  const fetchRules = useRuleStore((state) => state.fetchRules)
  const getRule = useRuleStore((state) => state.getRule)
  const saveRule = useRuleStore((state) => state.saveRule)
  const testRule = useRuleStore((state) => state.testRule)
  const [rule, setRule] = useState<RuleDefinition>(() => createEmptyRule())
  const [saving, setSaving] = useState(false)
  const [testPayload, setTestPayload] = useState('')
  const [testResult, setTestResult] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const triggerOptions = useMemo(() => {
    const plugin = plugins.find((entry) => entry.id === rule.trigger.pluginId)
    return plugin?.triggers ?? []
  }, [plugins, rule.trigger.pluginId])

  const actionOptionsByPlugin = useMemo(() => {
    const map = new Map<string, typeof plugins[number]['actions']>()
    for (const plugin of plugins) {
      map.set(plugin.id, plugin.actions)
    }
    return map
  }, [plugins])

  useEffect(() => {
    void fetchRules()
  }, [fetchRules])

  useEffect(() => {
    if (editingExisting && ruleId) {
      void (async () => {
        const existing = await getRule(ruleId)
        if (existing) {
          setRule(existing)
        }
      })()
    } else {
      setRule((current) => ({
        ...createEmptyRule(),
        id: current.id,
      }))
    }
  }, [editingExisting, ruleId, getRule])

  useEffect(() => {
    if (!rule.trigger.pluginId && plugins.length > 0) {
      setRule((state) => ({
        ...state,
        trigger: {
          pluginId: plugins[0].id,
          triggerId: plugins[0].triggers[0]?.id ?? '',
        },
      }))
    }
  }, [plugins, rule.trigger.pluginId])

  const updateRule = <K extends keyof RuleDefinition>(key: K, value: RuleDefinition[K]) => {
    setRule((state) => ({ ...state, [key]: value }))
  }

  const updateCondition = (index: number, condition: RuleCondition) => {
    setRule((state) => {
      const next = [...(state.conditions ?? [])]
      next[index] = condition
      return { ...state, conditions: next }
    })
  }

  const removeCondition = (index: number) => {
    setRule((state) => {
      const next = [...(state.conditions ?? [])]
      next.splice(index, 1)
      return { ...state, conditions: next }
    })
  }

  const updateAction = (index: number, action: RuleActionInvocation) => {
    setRule((state) => {
      const next = [...state.actions]
      next[index] = action
      return { ...state, actions: next }
    })
  }

  const moveAction = (index: number, direction: -1 | 1) => {
    setRule((state) => {
      const next = [...state.actions]
      const target = index + direction
      if (target < 0 || target >= next.length) return state
      const [item] = next.splice(index, 1)
      next.splice(target, 0, item)
      return { ...state, actions: next }
    })
  }

  const removeAction = (index: number) => {
    setRule((state) => {
      const next = [...state.actions]
      next.splice(index, 1)
      return { ...state, actions: next }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      if (!rule.id) {
        throw new Error('Rule requires a stable ID.')
      }
      if (!rule.name) {
        throw new Error('Provide a rule name.')
      }
      if (!rule.trigger.pluginId || !rule.trigger.triggerId) {
        throw new Error('Select a trigger plugin and event.')
      }
      if (rule.actions.length === 0) {
        throw new Error('Add at least one action.')
      }
      const sanitized: RuleDefinition = {
        ...rule,
        description: rule.description?.trim() || undefined,
        tags: rule.tags?.filter(Boolean) ?? [],
      }
      await saveRule(sanitized)
      navigate('/rules')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTestResult('')
    setError(null)
    try {
      const payload = testPayload ? JSON.parse(testPayload) : {}
      const result = await testRule(rule, payload)
      setTestResult(result.matched ? 'Matched 👍' : `Did not match – ${result.reason ?? 'No reason provided.'}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div className="rule-editor">
      <header>
        <button type="button" className="ghost-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div>
          <h2>{editingExisting ? 'Edit Rule' : 'Create Rule'}</h2>
          <p>Define automation flow, then test against sample events before saving.</p>
        </div>
        <StatusBadge status={statuses[rule.trigger.pluginId]} />
      </header>

      <section className="rule-editor__section">
        <h3>Basics</h3>
        <div className="field-grid">
          <label>
            <span>Rule ID</span>
            <input
              type="text"
              value={rule.id}
              onChange={(event) => updateRule('id', event.target.value)}
              placeholder="unique-rule-id"
              disabled={editingExisting}
            />
          </label>
          <label>
            <span>Name</span>
            <input type="text" value={rule.name} onChange={(event) => updateRule('name', event.target.value)} />
          </label>
          <label>
            <span>Priority</span>
            <input
              type="number"
              value={rule.priority}
              onChange={(event) => updateRule('priority', Number(event.target.value))}
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={rule.enabled}
              onChange={(event) => updateRule('enabled', event.target.checked)}
            />
            <span>Enabled</span>
          </label>
        </div>
        <label className="full-row">
          <span>Description</span>
          <textarea
            value={rule.description ?? ''}
            onChange={(event) => updateRule('description', event.target.value)}
            placeholder="Optional summary for collaborators"
          />
        </label>
        <label className="full-row">
          <span>Tags</span>
          <input
            type="text"
            value={rule.tags?.join(', ') ?? ''}
            onChange={(event) => updateRule('tags', event.target.value.split(',').map((tag) => tag.trim()))}
            placeholder="automation, shoutouts"
          />
        </label>
      </section>

      <section className="rule-editor__section">
        <h3>Trigger</h3>
        <div className="field-grid">
          <label>
            <span>Plugin</span>
            <select
              value={rule.trigger.pluginId}
              onChange={(event) => {
                const pluginId = event.target.value
                const plugin = plugins.find((entry) => entry.id === pluginId)
                updateRule('trigger', {
                  pluginId,
                  triggerId: plugin?.triggers[0]?.id ?? '',
                })
              }}
            >
              {plugins.map((plugin) => (
                <option key={plugin.id} value={plugin.id}>
                  {plugin.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Trigger</span>
            <select
              value={rule.trigger.triggerId}
              onChange={(event) =>
                updateRule('trigger', {
                  pluginId: rule.trigger.pluginId,
                  triggerId: event.target.value,
                })
              }
            >
              {triggerOptions.map((trigger) => (
                <option key={trigger.id} value={trigger.id}>
                  {trigger.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rule-editor__section">
        <div className="section-heading">
          <h3>Conditions</h3>
          <button type="button" className="ghost-button" onClick={() => updateRule('conditions', [...(rule.conditions ?? []), defaultCondition()])}>
            Add Condition
          </button>
        </div>
        <div className="condition-list">
          {(rule.conditions ?? []).map((condition, index) => (
            <div key={`${condition.path}-${index}`} className="condition-item">
              <label>
                <span>Path</span>
                <input
                  type="text"
                  value={condition.path}
                  onChange={(event) => updateCondition(index, { ...condition, path: event.target.value })}
                />
              </label>
              <label>
                <span>Type</span>
                <select
                  value={condition.type}
                  onChange={(event) =>
                    updateCondition(index, {
                      ...condition,
                      type: event.target.value as RuleCondition['type'],
                    })
                  }
                >
                  <option value="equals">equals</option>
                  <option value="notEquals">notEquals</option>
                  <option value="includes">includes</option>
                </select>
              </label>
              <label>
                <span>Value</span>
                <input
                  type="text"
                  value={String(condition.value ?? '')}
                  onChange={(event) => updateCondition(index, { ...condition, value: event.target.value })}
                />
              </label>
              <button type="button" className="ghost-button" onClick={() => removeCondition(index)}>
                Remove
              </button>
            </div>
          ))}
          {(rule.conditions ?? []).length === 0 ? <p className="muted">No conditions. Rule will always match.</p> : null}
        </div>
      </section>

      <section className="rule-editor__section">
        <div className="section-heading">
          <h3>Actions</h3>
          <button type="button" className="ghost-button" onClick={() => updateRule('actions', [...rule.actions, defaultAction()])}>
            Add Action
          </button>
        </div>
        <div className="action-list">
          {rule.actions.map((action, index) => (
            <div key={`${action.pluginId}-${action.actionId}-${index}`} className="action-item">
              <div className="action-item__grid">
                <label>
                  <span>Plugin</span>
                  <select
                    value={action.pluginId}
                    onChange={(event) => {
                      const pluginId = event.target.value
                      const actions = actionOptionsByPlugin.get(pluginId) ?? []
                      updateAction(index, {
                        ...action,
                        pluginId,
                        actionId: actions[0]?.id ?? '',
                      })
                    }}
                  >
                    <option value="" disabled>
                      Select plugin
                    </option>
                    {plugins.map((plugin) => (
                      <option key={plugin.id} value={plugin.id}>
                        {plugin.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Action</span>
                  <select
                    value={action.actionId}
                    onChange={(event) =>
                      updateAction(index, {
                        ...action,
                        actionId: event.target.value,
                      })
                    }
                  >
                    {(actionOptionsByPlugin.get(action.pluginId) ?? []).map((available) => (
                      <option key={available.id} value={available.id}>
                        {available.name}
                      </option>
                    ))}
                  </select>
                </label>
              <label className="full-row">
                <span>Params (JSON)</span>
                <textarea
                  defaultValue={JSON.stringify(action.params ?? {}, null, 2)}
                  onBlur={(event) => {
                    try {
                      const content = event.target.value.trim()
                      const parsed = content.length > 0 ? JSON.parse(content) : {}
                      updateAction(index, {
                        ...action,
                        params: parsed as RuleActionInvocation['params'],
                      })
                      event.target.value = JSON.stringify(parsed, null, 2)
                      setError(null)
                    } catch {
                      setError('Action params must be valid JSON before saving.')
                    }
                  }}
                />
              </label>
              </div>
              <div className="action-item__controls">
                <button type="button" className="ghost-button" onClick={() => moveAction(index, -1)}>
                  ↑
                </button>
                <button type="button" className="ghost-button" onClick={() => moveAction(index, 1)}>
                  ↓
                </button>
                <button type="button" className="ghost-button" onClick={() => removeAction(index)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          {rule.actions.length === 0 ? <p className="muted">No actions yet.</p> : null}
        </div>
      </section>

      <section className="rule-editor__section">
        <h3>Test With Sample Event</h3>
        <textarea
          className="test-area"
          placeholder='{"username": "viewer"}'
          value={testPayload}
          onChange={(event) => setTestPayload(event.target.value)}
        />
        <div className="test-controls">
          <button type="button" className="ghost-button" onClick={handleTest}>
            Run Test
          </button>
          {testResult ? <span className="test-result">{testResult}</span> : null}
        </div>
      </section>

      {error ? <p className="error-text">{error}</p> : null}

      <footer className="rule-editor__footer">
        <button type="button" className="primary-button" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Rule'}
        </button>
      </footer>
    </div>
  )
}

export default RuleEditorPage
