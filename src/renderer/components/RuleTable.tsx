import { Link } from 'react-router-dom'
import type {
  RuleActionInvocation,
  RuleDefinition,
  PluginActionInvocation,
  VariableActionInvocation,
  LoopActionInvocation,
  BranchActionInvocation,
  RandomActionInvocation
} from '@shared/rules/types'
import './RuleTable.css'

interface RuleTableProps {
  rules: RuleDefinition[]
  onDelete: (ruleId: string) => void
}

export const RuleTable = ({ rules, onDelete }: RuleTableProps) => (
  <table className="rule-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Trigger</th>
        <th>Actions</th>
        <th>Status</th>
        <th>Priority</th>
        <th aria-label="actions" />
      </tr>
    </thead>
    <tbody>
      {rules.map((rule) => (
        <tr key={rule.id}>
          <td>
            <div className="rule-table__name">
              <Link to={`/rules/${rule.id}`}>{rule.name}</Link>
              {rule.description ? <span>{rule.description}</span> : null}
            </div>
          </td>
          <td>
            <code>
              {rule.trigger.pluginId}:{rule.trigger.triggerId}
            </code>
          </td>
          <td className="rule-table__actions">
            {rule.actions.map((action, actionIndex) => (
              <code key={`${rule.id}-action-${actionIndex}`}>{describeAction(action)}</code>
            ))}
          </td>
          <td>
            <span className={rule.enabled ? 'badge badge--success' : 'badge badge--muted'}>
              {rule.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </td>
          <td>{rule.priority}</td>
          <td>
            <button type="button" className="ghost-button" onClick={() => onDelete(rule.id)}>
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)

const describeAction = (action: RuleActionInvocation) => {
  const kind = action.kind ?? 'plugin'
  switch (kind) {
    case 'plugin':
      return `${(action as PluginActionInvocation).pluginId}:${(action as PluginActionInvocation).actionId}`
    case 'variable':
      return `variable ${(action as VariableActionInvocation).operation} ${(action as VariableActionInvocation).scope}.${(action as VariableActionInvocation).key}`
    case 'loop':
      return `loop ×${(action as LoopActionInvocation).maxIterations ?? 'auto'}`
    case 'branch':
      return `branch ${(action as BranchActionInvocation).branches.length}`
    case 'random':
      return `random pick ${(action as RandomActionInvocation).pick ?? 1}`
    case 'script':
      return 'script'
    default:
      return kind
  }
}

export default RuleTable
