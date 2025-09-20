import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import RuleTable from '../components/RuleTable'
import { useRuleStore } from '../stores/useRuleStore'
import './RulesPage.css'

export const RulesPage = () => {
  const rules = useRuleStore((state) => state.rules)
  const fetchRules = useRuleStore((state) => state.fetchRules)
  const deleteRule = useRuleStore((state) => state.deleteRule)
  const navigate = useNavigate()

  useEffect(() => {
    void fetchRules()
  }, [fetchRules])

  const handleDelete = async (ruleId: string) => {
    if (!window.confirm('Delete this rule? This action cannot be undone.')) return
    await deleteRule(ruleId)
  }

  return (
    <div className="rules-page">
      <header>
        <div>
          <h2>Automation Rules</h2>
          <p>Compose automations by connecting triggers, conditions, and actions.</p>
        </div>
        <button type="button" className="primary-button" onClick={() => navigate('/rules/new')}>
          New Rule
        </button>
      </header>

      {rules.length === 0 ? (
        <p className="empty-state">No rules defined yet. Create your first automation to get started.</p>
      ) : (
        <RuleTable rules={rules} onDelete={handleDelete} />
      )}
    </div>
  )
}

export default RulesPage
