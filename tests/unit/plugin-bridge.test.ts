import { vi, describe, expect, it, beforeEach } from 'vitest'
import { ipcMain } from 'electron'
import { registerPluginBridge } from '@main/ipc/plugin-bridge'

const createPluginManagerMock = () => ({
  listLoaded: vi.fn(() => [
    {
      manifest: { id: 'demo', name: 'Demo', version: '1.0.0', author: 'Tester' },
      triggers: [],
      actions: [],
      configSchema: undefined,
    },
  ]),
  getPlugin: vi.fn(() => ({
    manifest: { id: 'demo', name: 'Demo', version: '1.0.0', author: 'Tester' },
    triggers: [],
    actions: [],
    configSchema: undefined,
  })),
  executeAction: vi.fn(async () => undefined),
  listStatuses: vi.fn(() => []),
  getConfig: vi.fn(() => ({})),
  updateConfig: vi.fn(() => ({})),
})

describe('registerPluginBridge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers IPC handlers and proxies calls', async () => {
    const pluginManager = createPluginManagerMock()
    registerPluginBridge(pluginManager as never)

    const listHandler = (ipcMain.handle as unknown as vi.Mock).mock.calls.find((call) => call[0] === 'plugins:list')?.[1]
    expect(listHandler).toBeTypeOf('function')
    const serialized = await listHandler()
    expect(serialized).toHaveLength(1)
    expect(serialized[0].id).toBe('demo')

    const executeHandler = (ipcMain.handle as unknown as vi.Mock).mock.calls.find((call) => call[0] === 'plugins:execute-action')?.[1]
    expect(executeHandler).toBeTypeOf('function')
    await executeHandler({}, { pluginId: 'demo', actionId: 'demo.action', params: {} })
    expect(pluginManager.executeAction).toHaveBeenCalledWith('demo', 'demo.action', {})

    const statusHandler = (ipcMain.handle as unknown as vi.Mock).mock.calls.find((call) => call[0] === 'plugins:statuses')?.[1]
    expect(statusHandler).toBeTypeOf('function')
    await statusHandler()
    expect(pluginManager.listStatuses).toHaveBeenCalled()

    const configHandler = (ipcMain.handle as unknown as vi.Mock).mock.calls.find((call) => call[0] === 'plugins:get-config')?.[1]
    expect(configHandler).toBeTypeOf('function')
    await configHandler({}, 'demo')
    expect(pluginManager.getConfig).toHaveBeenCalledWith('demo')

    const saveConfigHandler = (ipcMain.handle as unknown as vi.Mock).mock.calls.find((call) => call[0] === 'plugins:save-config')?.[1]
    expect(saveConfigHandler).toBeTypeOf('function')
    await saveConfigHandler({}, { pluginId: 'demo', config: { foo: 'bar' } })
    expect(pluginManager.updateConfig).toHaveBeenCalledWith('demo', { foo: 'bar' })
  })
})
