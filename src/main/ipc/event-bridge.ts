import type { BrowserWindow } from 'electron'
import type { EventBus } from '../core/event-bus'

export const registerEventBridge = (window: BrowserWindow, eventBus: EventBus) => {
  const unsubscribe = eventBus.onPluginTrigger((payload) => {
    if (!window.isDestroyed()) {
      window.webContents.send('events:plugin-trigger', payload)
    }
  })

  window.on('closed', () => {
    unsubscribe()
  })
}
