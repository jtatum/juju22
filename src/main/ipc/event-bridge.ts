import type { BrowserWindow } from 'electron'
import type { EventBus } from '../core/event-bus'

export const registerEventBridge = (window: BrowserWindow, eventBus: EventBus) => {
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

  const sendInitialLog = () => {
    if (!window.isDestroyed()) {
      window.webContents.send('events:log-bootstrap', eventBus.getRecentLogEntries(50))
    }
  }

  if (window.webContents.isLoading()) {
    window.webContents.once('did-finish-load', sendInitialLog)
  } else {
    sendInitialLog()
  }

  window.on('closed', () => {
    unsubscribe()
    unsubscribeLog()
  })
}
