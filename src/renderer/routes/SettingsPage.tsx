import { useEffect, useState } from 'react'
import { useNotificationStore } from '../stores/useNotificationStore'
import './SettingsPage.css'

interface Backup {
  id: string
  timestamp: number
  label?: string
  path: string
  size: number
}

interface BackupSettings {
  enabled: boolean
  interval: number
  maxBackups: number
  nextBackup?: number
}

interface PerformanceMetrics {
  cpu: {
    percentage: number
    model?: string
    cores?: number
  }
  memory: {
    heapUsed: number
    heapTotal: number
    rss: number
    external: number
    arrayBuffers: number
  }
  eventLoopLag: number
  activeHandles?: number
  activeRequests?: number
}

interface MemoryLeak {
  indicator: string
  trend: 'INCREASING' | 'STABLE' | 'DECREASING'
  samples: number
  growthRate: number
}

export const SettingsPage = () => {
  const addNotification = useNotificationStore((state) => state.addNotification)
  const [backups, setBackups] = useState<Backup[]>([])
  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    enabled: false,
    interval: 86400000, // 24 hours
    maxBackups: 10,
  })
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState<string | null>(null)
  const [backupLabel, setBackupLabel] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [memoryLeaks, setMemoryLeaks] = useState<MemoryLeak[]>([])
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false)

  useEffect(() => {
    loadBackups()
    loadBackupSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadBackups = async () => {
    try {
      const result = await window.juju22.backup.list()
      setBackups(result)
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Load Backups',
        message: error instanceof Error ? error.message : 'Could not retrieve backup list',
      })
    }
  }

  const loadBackupSettings = async () => {
    try {
      const settings = await window.juju22.backup.getSettings()
      setBackupSettings(settings)
    } catch (error) {
      console.error('Failed to load backup settings', error)
    }
  }

  const handleCreateBackup = async () => {
    try {
      setIsCreatingBackup(true)
      const result = await window.juju22.backup.create(backupLabel || undefined)
      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Backup Created',
          message: `Backup saved to ${result.backup.path}`,
        })
        setBackupLabel('')
        await loadBackups()
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Backup Failed',
        message: error instanceof Error ? error.message : 'Failed to create backup',
      })
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const handleRestoreBackup = async (backupId: string) => {
    if (!window.confirm('Are you sure you want to restore this backup? Current data will be replaced.')) {
      return
    }

    try {
      setIsRestoring(backupId)
      const result = await window.juju22.backup.restore(backupId)
      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Backup Restored',
          message: 'Data has been restored from the selected backup. The application will reload.',
        })
        // Reload the app to ensure fresh state
        setTimeout(() => window.location.reload(), 2000)
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Restore Failed',
        message: error instanceof Error ? error.message : 'Failed to restore backup',
      })
    } finally {
      setIsRestoring(null)
    }
  }

  const handleDeleteBackup = async (backupId: string) => {
    if (!window.confirm('Delete this backup? This action cannot be undone.')) {
      return
    }

    try {
      const result = await window.juju22.backup.delete(backupId)
      if (result.success) {
        addNotification({
          type: 'info',
          title: 'Backup Deleted',
          message: 'The backup has been deleted.',
        })
        await loadBackups()
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: error instanceof Error ? error.message : 'Failed to delete backup',
      })
    }
  }

  const handleUpdateBackupSettings = async () => {
    try {
      await window.juju22.backup.updateSettings(backupSettings)
      addNotification({
        type: 'success',
        title: 'Settings Updated',
        message: 'Backup settings have been saved.',
      })
      await loadBackupSettings()
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error instanceof Error ? error.message : 'Failed to update settings',
      })
    }
  }


  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatSize = (bytes: number) => {
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  const loadPerformanceMetrics = async () => {
    try {
      setIsLoadingMetrics(true)
      const metricsResult = await window.juju22.performance.getMetrics()
      if (metricsResult.success) {
        setPerformanceMetrics(metricsResult.data)
      }

      const leaksResult = await window.juju22.performance.detectMemoryLeaks()
      if (leaksResult.success) {
        setMemoryLeaks(leaksResult.data || [])
      }
    } catch (error) {
      console.error('Failed to load performance metrics', error)
    } finally {
      setIsLoadingMetrics(false)
    }
  }

  const formatMemory = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const intervalOptions = [
    { value: 3600000, label: 'Every hour' },
    { value: 21600000, label: 'Every 6 hours' },
    { value: 43200000, label: 'Every 12 hours' },
    { value: 86400000, label: 'Every 24 hours' },
    { value: 604800000, label: 'Every week' },
  ]

  return (
    <div className="settings-page">
      <h2>Settings</h2>

      <section className="settings-section">
        <h3>Backup & Restore</h3>

        <div className="backup-controls">
          <div className="backup-create">
            <input
              type="text"
              placeholder="Backup label (optional)"
              value={backupLabel}
              onChange={(e) => setBackupLabel(e.target.value)}
              disabled={isCreatingBackup}
            />
            <button
              type="button"
              className="primary-button"
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
            >
              {isCreatingBackup ? 'Creating...' : 'Create Backup'}
            </button>
          </div>
        </div>

        <div className="backup-settings">
          <h4>Automatic Backups</h4>
          <label className="settings-field">
            <input
              type="checkbox"
              checked={backupSettings.enabled}
              onChange={(e) => setBackupSettings(s => ({ ...s, enabled: e.target.checked }))}
            />
            <span>Enable automatic backups</span>
          </label>

          <label className="settings-field">
            <span>Backup interval:</span>
            <select
              value={backupSettings.interval}
              onChange={(e) => setBackupSettings(s => ({ ...s, interval: Number(e.target.value) }))}
              disabled={!backupSettings.enabled}
            >
              {intervalOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="settings-field">
            <span>Keep maximum backups:</span>
            <input
              type="number"
              min="1"
              max="100"
              value={backupSettings.maxBackups}
              onChange={(e) => setBackupSettings(s => ({ ...s, maxBackups: Number(e.target.value) }))}
              disabled={!backupSettings.enabled}
            />
          </label>

          {backupSettings.nextBackup && (
            <p className="settings-hint">
              Next backup: {formatDate(backupSettings.nextBackup)}
            </p>
          )}

          <button
            type="button"
            className="secondary-button"
            onClick={handleUpdateBackupSettings}
          >
            Save Settings
          </button>
        </div>

        <div className="backup-list">
          <h4>Available Backups</h4>
          {backups.length === 0 ? (
            <p className="empty-state">No backups available</p>
          ) : (
            <table className="backup-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Label</th>
                  <th>Size</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup) => (
                  <tr key={backup.id}>
                    <td>{formatDate(backup.timestamp)}</td>
                    <td>{backup.label || '-'}</td>
                    <td>{formatSize(backup.size)}</td>
                    <td>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => handleRestoreBackup(backup.id)}
                        disabled={isRestoring === backup.id}
                      >
                        {isRestoring === backup.id ? 'Restoring...' : 'Restore'}
                      </button>
                      <button
                        type="button"
                        className="ghost-button danger"
                        onClick={() => handleDeleteBackup(backup.id)}
                        disabled={isRestoring !== null}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="settings-section">
        <h3>
          Advanced
          <button
            type="button"
            className="ghost-button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ marginLeft: '1rem', fontSize: '0.9rem' }}
          >
            {showAdvanced ? 'Hide' : 'Show'}
          </button>
        </h3>

        {showAdvanced && (
          <div className="advanced-settings">
            <div className="performance-monitor">
              <h4>Performance Monitor</h4>
              <button
                type="button"
                className="secondary-button"
                onClick={loadPerformanceMetrics}
                disabled={isLoadingMetrics}
              >
                {isLoadingMetrics ? 'Loading...' : 'Check Performance'}
              </button>

              {performanceMetrics && (
                <div className="metrics-display">
                  <div className="metric-group">
                    <h5>CPU</h5>
                    <p>Usage: {performanceMetrics.cpu.percentage.toFixed(1)}%</p>
                    {performanceMetrics.cpu.cores && (
                      <p>Cores: {performanceMetrics.cpu.cores}</p>
                    )}
                  </div>

                  <div className="metric-group">
                    <h5>Memory</h5>
                    <p>Heap Used: {formatMemory(performanceMetrics.memory.heapUsed)}</p>
                    <p>Heap Total: {formatMemory(performanceMetrics.memory.heapTotal)}</p>
                    <p>RSS: {formatMemory(performanceMetrics.memory.rss)}</p>
                    <p>External: {formatMemory(performanceMetrics.memory.external)}</p>
                  </div>

                  <div className="metric-group">
                    <h5>Event Loop</h5>
                    <p>Lag: {performanceMetrics.eventLoopLag.toFixed(2)}ms</p>
                    {performanceMetrics.activeHandles !== undefined && (
                      <p>Active Handles: {performanceMetrics.activeHandles}</p>
                    )}
                    {performanceMetrics.activeRequests !== undefined && (
                      <p>Active Requests: {performanceMetrics.activeRequests}</p>
                    )}
                  </div>
                </div>
              )}

              {memoryLeaks.length > 0 && (
                <div className="memory-leaks">
                  <h5>Potential Memory Leaks Detected</h5>
                  <table className="leak-table">
                    <thead>
                      <tr>
                        <th>Indicator</th>
                        <th>Trend</th>
                        <th>Growth Rate</th>
                        <th>Samples</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memoryLeaks.map((leak) => (
                        <tr key={leak.indicator} className={`trend-${leak.trend.toLowerCase()}`}>
                          <td>{leak.indicator}</td>
                          <td>{leak.trend}</td>
                          <td>{leak.growthRate.toFixed(2)} MB/min</td>
                          <td>{leak.samples}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="performance-notes">
                <p className="settings-hint">
                  Performance monitoring runs automatically in the background every 30 seconds.
                  High memory usage or CPU spikes will trigger automatic alerts.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

    </div>
  )
}

export default SettingsPage