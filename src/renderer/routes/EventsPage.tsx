import { useMemo, useState } from 'react'
import EventFeed from '../components/EventFeed'
import { useEventStore } from '../stores/useEventStore'
import './EventsPage.css'

const EVENT_TYPES = [
  'all',
  'plugin.trigger',
  'plugin.status',
  'rule.evaluation',
  'rule.action',
  'rule.error',
] as const

type FilterType = (typeof EVENT_TYPES)[number]

export const EventsPage = () => {
  const entries = useEventStore((state) => state.entries)
  const clear = useEventStore((state) => state.clear)
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return entries
    return entries.filter((entry) => entry.type === filter)
  }, [entries, filter])

  return (
    <div className="events-page">
      <header>
        <div>
          <h2>Event Monitor</h2>
          <p>Inspect the real-time automation feed and narrow by event type.</p>
        </div>
        <div className="events-page__controls">
          <select value={filter} onChange={(event) => setFilter(event.target.value as FilterType)}>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All events' : type}
              </option>
            ))}
          </select>
          <button type="button" className="ghost-button" onClick={() => clear()}>
            Clear
          </button>
        </div>
      </header>

      {filteredEntries.length === 0 ? (
        <p className="empty-state">No events captured yet.</p>
      ) : (
        <EventFeed entries={filteredEntries} />
      )}
    </div>
  )
}

export default EventsPage
