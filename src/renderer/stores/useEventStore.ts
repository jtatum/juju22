import { create } from 'zustand'
import type { EventLogEntry } from '@shared/events/types'

const MAX_ENTRIES = 200

type EventState = {
  entries: EventLogEntry[]
  bootstrap: (initial: EventLogEntry[]) => void
  addEntry: (entry: EventLogEntry) => void
  clear: () => void
}

export const useEventStore = create<EventState>((set) => ({
  entries: [],
  bootstrap(initial) {
    set({ entries: initial.slice(0, MAX_ENTRIES) })
  },
  addEntry(entry) {
    set((state) => {
      const next = [entry, ...state.entries]
      if (next.length > MAX_ENTRIES) {
        next.length = MAX_ENTRIES
      }
      return { entries: next }
    })
  },
  clear() {
    set({ entries: [] })
  },
}))
