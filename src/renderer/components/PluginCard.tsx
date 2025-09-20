import { Link } from 'react-router-dom'
import type { PluginSummary } from '@shared/plugins/types'
import { StatusBadge } from './StatusBadge'
import { usePluginStore } from '../stores/usePluginStore'
import './PluginCard.css'

interface PluginCardProps {
  plugin: PluginSummary
}

export const PluginCard = ({ plugin }: PluginCardProps) => {
  const status = usePluginStore((state) => state.statuses[plugin.id])

  return (
    <Link to={`/plugins/${plugin.id}`} className="plugin-card">
      <header className="plugin-card__header">
        <h3>{plugin.name}</h3>
        <StatusBadge status={status} />
      </header>
      <p className="plugin-card__meta">v{plugin.version} • {plugin.author}</p>
      <p className="plugin-card__counts">
        {plugin.triggers.length} trigger{plugin.triggers.length === 1 ? '' : 's'} · {plugin.actions.length} action
        {plugin.actions.length === 1 ? '' : 's'}
      </p>
      {plugin.hasConfigSchema ? <span className="plugin-card__tag">Configurable</span> : null}
    </Link>
  )
}

export default PluginCard
