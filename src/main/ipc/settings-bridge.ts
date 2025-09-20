import { ipcMain } from 'electron'
import type { DataStores } from '../core/storage'

export function registerSettingsBridge(stores: DataStores) {
  ipcMain.handle('settings:get', async (_event, key: string) => {
    // Cast to any to allow dynamic keys like 'onboardingComplete'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return stores.settings.get(key as any)
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ipcMain.handle('settings:set', async (_event, key: string, value: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stores.settings.set(key as any, value)
    return { success: true }
  })

  ipcMain.handle('settings:has', async (_event, key: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return stores.settings.has(key as any)
  })

  ipcMain.handle('settings:delete', async (_event, key: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stores.settings.delete(key as any)
    return { success: true }
  })

  ipcMain.handle('settings:clear', async () => {
    stores.settings.clear()
    return { success: true }
  })
}