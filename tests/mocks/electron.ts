import { EventEmitter } from 'node:events'
import { vi } from 'vitest'

const emitter = new EventEmitter()

export const app = {
  getPath: vi.fn(() => process.cwd()),
  whenReady: vi.fn(() => Promise.resolve()),
  on: vi.fn(),
  name: 'Aidle Test',
}

export const ipcMain = {
  handle: vi.fn(),
  removeHandler: vi.fn(),
  emit: emitter.emit.bind(emitter),
  on: emitter.on.bind(emitter),
}

export class BrowserWindow {
  webContents = {
    send: vi.fn(),
  }

  on = vi.fn()

  isDestroyed() {
    return false
  }
}

export default {
  app,
  ipcMain,
  BrowserWindow,
}
