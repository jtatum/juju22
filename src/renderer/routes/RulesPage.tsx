import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RuleTable from '../components/RuleTable'
import { useRuleStore } from '../stores/useRuleStore'
import { useNotificationStore } from '../stores/useNotificationStore'
import './RulesPage.css'

export const RulesPage = () => {
  const rules = useRuleStore((state) => state.rules)
  const fetchRules = useRuleStore((state) => state.fetchRules)
  const deleteRule = useRuleStore((state) => state.deleteRule)
  const navigate = useNavigate()
  const addNotification = useNotificationStore((state) => state.addNotification)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    void fetchRules()
  }, [fetchRules])

  const handleDelete = async (ruleId: string) => {
    if (!window.confirm('Delete this rule? This action cannot be undone.')) return
    await deleteRule(ruleId)
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const result = await window.juju22.importExport.exportRules()
      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Export Successful',
          message: `Exported ${result.count} rule${result.count === 1 ? '' : 's'} to ${result.path}`,
        })
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: error instanceof Error ? error.message : 'Failed to export rules',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    try {
      setIsImporting(true)
      const result = await window.juju22.importExport.importRules()
      if (result.success) {
        await fetchRules() // Refresh the rules list
        addNotification({
          type: 'success',
          title: 'Import Successful',
          message: `Imported ${result.imported} rule${result.imported === 1 ? '' : 's'}`,
          suggestions: result.skipped > 0 ? [`${result.skipped} rule${result.skipped === 1 ? '' : 's'} skipped (already exists)`] : undefined,
        })
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Import Failed',
        message: error instanceof Error ? error.message : 'Failed to import rules',
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="rules-page">
      <header>
        <div>
          <h2>Automation Rules</h2>
          <p>Compose automations by connecting triggers, conditions, and actions.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="secondary-button"
            onClick={handleImport}
            disabled={isImporting}
          >
            {isImporting ? 'Importing...' : 'Import'}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={handleExport}
            disabled={isExporting || rules.length === 0}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
          <button type="button" className="primary-button" onClick={() => navigate('/rules/new')}>
            New Rule
          </button>
        </div>
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
