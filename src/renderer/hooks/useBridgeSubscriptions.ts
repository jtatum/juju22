import { useEffect } from 'react'
import { usePluginStore } from '../stores/usePluginStore'
import { useEventStore } from '../stores/useEventStore'
import { useVariableStore } from '../stores/useVariableStore'
import { useNotificationStore } from '../stores/useNotificationStore'

export const useBridgeSubscriptions = () => {
  const applyStatus = usePluginStore((state) => state.applyStatus)
  const applyStatusBootstrap = usePluginStore((state) => state.applyStatusBootstrap)
  const bootstrapEvents = useEventStore((state) => state.bootstrap)
  const addEvent = useEventStore((state) => state.addEntry)
  const applyVariableMutation = useVariableStore((state) => state.applyMutation)
  const addNotification = useNotificationStore((state) => state.addNotification)

  useEffect(() => {
    void usePluginStore.getState().fetchPlugins()
    void usePluginStore.getState().refreshStatuses()

    const unsubscribeStatus = window.juju22.events.onPluginStatus((payload) => {
      applyStatus(payload)
    })

    const unsubscribeStatusBootstrap = window.juju22.events.onPluginStatusBootstrap((entries) => {
      applyStatusBootstrap(entries)
    })

    const unsubscribeLogBootstrap = window.juju22.events.onLogBootstrap((entries) => {
      bootstrapEvents(entries)
    })

    const unsubscribeLog = window.juju22.events.onLogEntry((entry) => {
      addEvent(entry)
    })

    const unsubscribeVariable = window.juju22.events.onVariableMutation((mutation) => {
      applyVariableMutation(mutation)
    })

    // Subscribe to error events
    const unsubscribeError = window.juju22.events.onError((error) => {
      addNotification({
        type: 'error',
        title: error.userMessage || 'Error',
        message: error.message || 'An error occurred',
        suggestions: error.suggestions,
      })
    })

    const unsubscribeErrorRecovered = window.juju22.events.onErrorRecovered((recovery) => {
      addNotification({
        type: 'success',
        title: 'Issue Resolved',
        message: recovery.message || 'The issue has been resolved',
      })
    })

    const unsubscribeCircuitOpened = window.juju22.events.onCircuitOpened((circuit) => {
      addNotification({
        type: 'warning',
        title: 'Service Unavailable',
        message: circuit.message,
        suggestions: circuit.suggestions,
      })
    })

    const unsubscribeCircuitClosed = window.juju22.events.onCircuitClosed((circuit) => {
      addNotification({
        type: 'info',
        title: 'Service Restored',
        message: circuit.message,
      })
    })

    return () => {
      unsubscribeStatus()
      unsubscribeStatusBootstrap()
      unsubscribeLogBootstrap()
      unsubscribeLog()
      unsubscribeVariable()
      unsubscribeError()
      unsubscribeErrorRecovered()
      unsubscribeCircuitOpened()
      unsubscribeCircuitClosed()
    }
  }, [applyStatus, applyStatusBootstrap, bootstrapEvents, addEvent, applyVariableMutation, addNotification])
}
