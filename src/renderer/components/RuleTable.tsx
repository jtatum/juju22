import { Link } from 'react-router-dom'
import type { RuleDefinition } from '@shared/rules/types'
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
            {rule.actions.map((action) => (
              <code key={`${rule.id}-${action.pluginId}-${action.actionId}`}>
                {action.pluginId}:{action.actionId}
              </code>
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

export default RuleTable
