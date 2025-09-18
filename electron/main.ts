import * as electron from 'electron'
import { mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { EventBus } from '../src/main/core/event-bus'
import { DataStores } from '../src/main/core/storage'
import {
  PluginManager,
  resolveBuiltInPluginDirectory,
  resolveExternalPluginDirectory,
} from '../src/main/core/plugin-manager'
import { registerPluginBridge } from '../src/main/ipc/plugin-bridge'
import { registerEventBridge } from '../src/main/ipc/event-bridge'
import { createLogger } from '../src/main/core/logger'
import type { Logger } from '../src/main/core/logger'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const { app, BrowserWindow, Menu } = electron

process.env.APP_ROOT = process.env.APP_ROOT ?? join(__dirname, '..')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.APP_ROOT, 'public')
  : join(process.env.APP_ROOT, 'dist')

const eventBus = new EventBus()
let pluginManager: PluginManager | null = null
let stores: DataStores | null = null
let logger: Logger | null = null
let isShuttingDown = false

const logError = (message: string, error: unknown) => {
  if (logger) {
    logger.error(message, { error })
  } else {
    console.error(message, error)
  }
}

process.on('unhandledRejection', (reason) => {
  logError('Unhandled promise rejection', reason)
})

process.on('uncaughtException', (error) => {
  logError('Uncaught exception', error)
})

function ensureDirectory(path: string) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true })
  }
}

async function createMainWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    title: 'Aidle',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      contextIsolation: true,
    },
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    await win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    await win.loadFile(join(process.env.APP_ROOT!, 'dist', 'index.html'))
  }

  registerEventBridge(win, eventBus)
  return win
}

function buildMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'File',
      submenu: [{ role: 'close' }],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }, { role: 'front' }],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://aidle.app')
          },
        },
      ],
    },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

async function bootstrap() {
  await app.whenReady()
  logger = createLogger('main')
  buildMenu()

  stores = new DataStores()
  const pluginDirectories = {
    builtInDirectory: resolveBuiltInPluginDirectory(),
    externalDirectory: resolveExternalPluginDirectory(),
  }

  ensureDirectory(pluginDirectories.externalDirectory)

  pluginManager = new PluginManager(pluginDirectories, eventBus, stores)
  registerPluginBridge(pluginManager)

  const window = await createMainWindow()

  try {
    await pluginManager.loadPlugins()
  } catch (error) {
    logError('Failed to load plugins', error)
    window.webContents.send('main-process-error', 'Failed to load plugins. See logs for details.')
  }
}

bootstrap().catch((error) => {
  logError('Unhandled error during bootstrap', error)
  app.exit(1)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow().catch((error) => {
      logError('Failed to recreate main window', error)
    })
  }
})

app.on('before-quit', async (event) => {
  if (pluginManager && !isShuttingDown) {
    event.preventDefault()
    isShuttingDown = true
    try {
      await pluginManager.unloadAll()
    } catch (error) {
      logError('Error while shutting down plugins', error)
    }
    app.exit()
  }
})
