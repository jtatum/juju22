import { useEffect } from 'react'
import { usePluginStore } from '../stores/usePluginStore'
import { useEventStore } from '../stores/useEventStore'

export const useBridgeSubscriptions = () => {
  const applyStatus = usePluginStore((state) => state.applyStatus)
  const applyStatusBootstrap = usePluginStore((state) => state.applyStatusBootstrap)
  const bootstrapEvents = useEventStore((state) => state.bootstrap)
  const addEvent = useEventStore((state) => state.addEntry)

  useEffect(() => {
    void usePluginStore.getState().fetchPlugins()
    void usePluginStore.getState().refreshStatuses()

    const unsubscribeStatus = window.aidle.events.onPluginStatus((payload) => {
      applyStatus(payload)
    })

    const unsubscribeStatusBootstrap = window.aidle.events.onPluginStatusBootstrap((entries) => {
      applyStatusBootstrap(entries)
    })

    const unsubscribeLogBootstrap = window.aidle.events.onLogBootstrap((entries) => {
      bootstrapEvents(entries)
    })

    const unsubscribeLog = window.aidle.events.onLogEntry((entry) => {
      addEvent(entry)
    })

    return () => {
      unsubscribeStatus()
      unsubscribeStatusBootstrap()
      unsubscribeLogBootstrap()
      unsubscribeLog()
    }
  }, [applyStatus, applyStatusBootstrap, bootstrapEvents, addEvent])
}
