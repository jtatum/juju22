import type { EventLogEntry } from '@shared/events/types'
import './EventFeed.css'

interface EventFeedProps {
  entries: EventLogEntry[]
  limit?: number
}

const formatTimestamp = (timestamp: number) => new Date(timestamp).toLocaleTimeString()

const formatType = (type: EventLogEntry['type']) => {
  switch (type) {
    case 'plugin.trigger':
      return 'Plugin Trigger'
    case 'plugin.status':
      return 'Plugin Status'
    case 'rule.evaluation':
      return 'Rule Evaluated'
    case 'rule.action':
      return 'Action'
    case 'rule.error':
      return 'Error'
    default:
      return type
  }
}

export const EventFeed = ({ entries, limit = 50 }: EventFeedProps) => (
  <div className="event-feed">
    {entries.slice(0, limit).map((entry, index) => (
      <article key={`${entry.type}-${entry.timestamp}-${index}`} className="event-feed__item">
        <header>
          <span className={`event-feed__tag event-feed__tag--${entry.type.replace('.', '-')}`}>
            {formatType(entry.type)}
          </span>
          <time dateTime={new Date(entry.timestamp).toISOString()}>{formatTimestamp(entry.timestamp)}</time>
        </header>
        <pre>{JSON.stringify(entry.payload, null, 2)}</pre>
      </article>
    ))}
  </div>
)

export default EventFeed
