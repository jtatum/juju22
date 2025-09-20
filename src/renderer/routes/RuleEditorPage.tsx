import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import type {
  BranchActionInvocation,
  LoopActionInvocation,
  PluginActionInvocation,
  RandomActionInvocation,
  RuleActionInvocation,
  RuleCondition,
  RuleDefinition,
  ScriptActionInvocation,
  VariableActionInvocation,
} from '@shared/rules/types'
import type { VariableScope } from '@shared/variables/types'
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

const createPluginAction = (): PluginActionInvocation => ({
  kind: 'plugin',
  pluginId: '',
  actionId: '',
  params: {},
})

const createVariableAction = (): VariableActionInvocation => ({
  kind: 'variable',
  scope: 'rule',
  operation: 'set',
  key: '',
  value: '',
})

const createLoopAction = (): LoopActionInvocation => ({
  kind: 'loop',
  actions: [],
  maxIterations: 1,
})

const createBranchAction = (): BranchActionInvocation => ({
  kind: 'branch',
  branches: [{ id: 'branch-1', label: 'Branch 1', when: [], actions: [] }],
  otherwise: [],
})

const createRandomAction = (): RandomActionInvocation => ({
  kind: 'random',
  from: [],
  pick: 1,
  unique: true,
})

const createScriptAction = (): ScriptActionInvocation => ({
  kind: 'script',
  code: "// context, variables, and helpers are available here\n",
  timeoutMs: 1000,
  arguments: {},
})

const createActionByKind = (kind: RuleActionInvocation['kind'] | 'plugin'): RuleActionInvocation => {
  switch (kind ?? 'plugin') {
    case 'plugin':
      return createPluginAction()
    case 'variable':
      return createVariableAction()
    case 'loop':
      return createLoopAction()
    case 'branch':
      return createBranchAction()
    case 'random':
      return createRandomAction()
    case 'script':
      return createScriptAction()
    default:
      return createPluginAction()
  }
}

const actionKindOptions: Array<{ value: RuleActionInvocation['kind'] | 'plugin'; label: string }> = [
  { value: 'plugin', label: 'Plugin Action' },
  { value: 'variable', label: 'Variable' },
  { value: 'branch', label: 'Conditional Branch' },
  { value: 'loop', label: 'Loop' },
  { value: 'random', label: 'Random Selector' },
  { value: 'script', label: 'Script' },
]

const getActionKind = (action: RuleActionInvocation): RuleActionInvocation['kind'] | 'plugin' =>
  action.kind ?? 'plugin'

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
  const [newActionKind, setNewActionKind] = useState<RuleActionInvocation['kind'] | 'plugin'>('plugin')
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

  const handleAddAction = () => {
    let nextAction = createActionByKind(newActionKind)
    if (getActionKind(nextAction) === 'plugin' && plugins.length > 0) {
      const firstPlugin = plugins[0]
      const firstAvailable = firstPlugin.actions[0]
      nextAction = {
        ...(nextAction as PluginActionInvocation),
        pluginId: firstPlugin.id,
        actionId: firstAvailable?.id ?? '',
      }
    }
    updateRule('actions', [...rule.actions, nextAction])
  }

  const handleActionKindChange = (index: number, kind: RuleActionInvocation['kind'] | 'plugin') => {
    updateAction(index, createActionByKind(kind))
  }

  const renderPluginAction = (pluginAction: PluginActionInvocation, index: number) => (
    <div className="action-item__grid">
      <label>
        <span>Plugin</span>
        <select
          value={pluginAction.pluginId}
          onChange={(event) => {
            const pluginId = event.target.value
            const actions = actionOptionsByPlugin.get(pluginId) ?? []
            updateAction(index, {
              ...pluginAction,
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
          value={pluginAction.actionId}
          onChange={(event) =>
            updateAction(index, {
              ...pluginAction,
              actionId: event.target.value,
            })
          }
        >
          {(actionOptionsByPlugin.get(pluginAction.pluginId) ?? []).map((available) => (
            <option key={available.id} value={available.id}>
              {available.name}
            </option>
          ))}
        </select>
      </label>
      <label className="full-row">
        <span>Params (JSON)</span>
        <textarea
          defaultValue={JSON.stringify(pluginAction.params ?? {}, null, 2)}
          onBlur={(event) => {
            try {
              const content = event.target.value.trim()
              const parsed = content.length > 0 ? JSON.parse(content) : {}
              updateAction(index, {
                ...pluginAction,
                params: parsed,
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
  )

  const renderVariableAction = (variableAction: VariableActionInvocation, index: number) => (
    <div className="action-item__grid">
      <label>
        <span>Scope</span>
        <select
          value={variableAction.scope}
          onChange={(event) =>
            updateAction(index, {
              ...variableAction,
              scope: event.target.value as VariableScope,
            })
          }
        >
          <option value="global">Global</option>
          <option value="plugin">Plugin</option>
          <option value="rule">Rule</option>
        </select>
      </label>
      <label>
        <span>Operation</span>
        <select
          value={variableAction.operation}
          onChange={(event) =>
            updateAction(index, {
              ...variableAction,
              operation: event.target.value as VariableActionInvocation['operation'],
            })
          }
        >
          <option value="set">Set</option>
          <option value="increment">Increment</option>
          <option value="reset">Reset</option>
        </select>
      </label>
      <label>
        <span>Key</span>
        <input
          type="text"
          value={variableAction.key}
          onChange={(event) => updateAction(index, { ...variableAction, key: event.target.value })}
          placeholder="counter"
        />
      </label>
      {variableAction.operation === 'set' ? (
        <label className="full-row">
          <span>Value</span>
          <textarea
            value={
              typeof variableAction.value === 'string'
                ? variableAction.value
                : variableAction.value == null
                  ? ''
                  : JSON.stringify(variableAction.value)
            }
            onChange={(event) => updateAction(index, { ...variableAction, value: event.target.value })}
            rows={3}
          />
        </label>
      ) : null}
      {variableAction.operation === 'increment' ? (
        <label>
          <span>Amount</span>
          <input
            type="number"
            value={
              typeof variableAction.amount === 'number'
                ? variableAction.amount
                : Number.isFinite(Number(variableAction.amount))
                  ? Number(variableAction.amount)
                  : 1
            }
            onChange={(event) => {
              const next = Number(event.target.value)
              updateAction(index, {
                ...variableAction,
                amount: Number.isNaN(next) ? undefined : next,
              })
            }}
          />
        </label>
      ) : null}
    </div>
  )

  const renderScriptAction = (scriptAction: ScriptActionInvocation, index: number) => (
    <div className="action-item__grid">
      <label className="full-row">
        <span>Script</span>
        <textarea
          value={scriptAction.code}
          onChange={(event) => updateAction(index, { ...scriptAction, code: event.target.value })}
          rows={8}
        />
      </label>
      <label>
        <span>Timeout (ms)</span>
        <input
          type="number"
          value={scriptAction.timeoutMs ?? 1000}
          onChange={(event) => updateAction(index, { ...scriptAction, timeoutMs: Number(event.target.value) })}
        />
      </label>
      <label className="full-row">
        <span>Arguments (JSON)</span>
        <textarea
          defaultValue={JSON.stringify(scriptAction.arguments ?? {}, null, 2)}
          onBlur={(event) => {
            try {
              const content = event.target.value.trim()
              const parsed = content.length > 0 ? JSON.parse(content) : {}
              updateAction(index, { ...scriptAction, arguments: parsed })
              event.target.value = JSON.stringify(parsed, null, 2)
              setError(null)
            } catch {
              setError('Script arguments must be valid JSON before saving.')
            }
          }}
          rows={4}
        />
      </label>
      <p className="muted full-row">Helpers: `variables` (scoped access), `context`, `helpers.setLocal(name, value)`.</p>
    </div>
  )

  const renderAdvancedJsonEditor = (label: string, advancedAction: RuleActionInvocation, index: number) => (
    <div className="action-item__grid">
      <label className="full-row">
        <span>{label} (JSON)</span>
        <textarea
          defaultValue={JSON.stringify(advancedAction, null, 2)}
          onBlur={(event) => {
            try {
              const parsed = JSON.parse(event.target.value) as RuleActionInvocation
              updateAction(index, parsed)
              event.target.value = JSON.stringify(parsed, null, 2)
              setError(null)
            } catch {
              setError('Advanced action configuration must be valid JSON before saving.')
            }
          }}
          rows={8}
        />
      </label>
      <p className="muted full-row">Use JSON to configure branches, loops, or random selection.</p>
    </div>
  )

  const renderActionFields = (currentAction: RuleActionInvocation, index: number) => {
    const kind = getActionKind(currentAction)
    switch (kind) {
      case 'plugin':
        return renderPluginAction(currentAction as PluginActionInvocation, index)
      case 'variable':
        return renderVariableAction(currentAction as VariableActionInvocation, index)
      case 'script':
        return renderScriptAction(currentAction as ScriptActionInvocation, index)
      case 'loop':
        return renderAdvancedJsonEditor('Loop', currentAction, index)
      case 'branch':
        return renderAdvancedJsonEditor('Branch', currentAction, index)
      case 'random':
        return renderAdvancedJsonEditor('Random', currentAction, index)
      default:
        return null
    }
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
          <div className="action-toolbar">
            <select
              value={newActionKind}
              onChange={(event) => setNewActionKind(event.target.value as RuleActionInvocation['kind'] | 'plugin')}
            >
              {actionKindOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button type="button" className="ghost-button" onClick={handleAddAction}>
              Add Action
            </button>
          </div>
        </div>
        <div className="action-list">
          {rule.actions.map((action, index) => {
            const kind = getActionKind(action)
            return (
              <div key={`${kind}-${index}`} className="action-item">
                <div className="action-item__header">
                  <label>
                    <span>Type</span>
                    <select
                      value={kind}
                      onChange={(event) =>
                        handleActionKindChange(index, event.target.value as RuleActionInvocation['kind'] | 'plugin')
                      }
                    >
                      {actionKindOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
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
                <div className="action-item__content">{renderActionFields(action, index)}</div>
              </div>
            )
          })}
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
