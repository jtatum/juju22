import type { BrowserWindow } from 'electron'
import type { EventBus } from '../core/event-bus'
import type { PluginStatusPayload } from '../../shared/plugins/types'

type StatusSupplier = () => PluginStatusPayload[]

export const registerEventBridge = (window: BrowserWindow, eventBus: EventBus, getPluginStatuses?: StatusSupplier) => {
  const unsubscribe = eventBus.onPluginTrigger((payload) => {
    if (!window.isDestroyed()) {
      window.webContents.send('events:plugin-trigger', payload)
    }
  })

  const unsubscribeLog = eventBus.onLog((entry) => {
    if (!window.isDestroyed()) {
      window.webContents.send('events:log-entry', entry)
    }
  })

  const unsubscribeStatus = eventBus.onPluginStatus((payload) => {
    if (!window.isDestroyed()) {
      window.webContents.send('events:plugin-status', payload)
    }
  })

  const unsubscribeVariables = eventBus.onVariableMutation((payload) => {
    if (!window.isDestroyed()) {
      window.webContents.send('events:variables-mutated', payload)
    }
  })

  const sendInitialLog = () => {
    if (!window.isDestroyed()) {
      window.webContents.send('events:log-bootstrap', eventBus.getRecentLogEntries(50))
    }
  }

  const sendInitialStatuses = () => {
    if (!window.isDestroyed() && getPluginStatuses) {
      window.webContents.send('events:plugin-status-bootstrap', getPluginStatuses())
    }
  }

  if (window.webContents.isLoading()) {
    window.webContents.once('did-finish-load', sendInitialLog)
    window.webContents.once('did-finish-load', sendInitialStatuses)
  } else {
    sendInitialLog()
    sendInitialStatuses()
  }

  window.on('closed', () => {
    unsubscribe()
    unsubscribeLog()
    unsubscribeStatus()
    unsubscribeVariables()
  })
}
