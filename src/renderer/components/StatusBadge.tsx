import type { PluginStatusUpdate } from '@shared/plugins/types'
import './StatusBadge.css'

interface StatusBadgeProps {
  status?: PluginStatusUpdate
}

const STATUS_COLORS: Record<string, string> = {
  idle: '#94a3b8',
  connecting: '#fbbf24',
  connected: '#22c55e',
  reconnecting: '#f97316',
  disconnected: '#f87171',
  error: '#ef4444',
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const color = STATUS_COLORS[status?.state ?? 'idle'] ?? '#94a3b8'
  return (
    <span className="status-badge" style={{ backgroundColor: `${color}22`, color }}>
      <span className="status-indicator" style={{ backgroundColor: color }} />
      {status?.state ?? 'idle'}
    </span>
  )
}

export default StatusBadge
