import { vi, describe, expect, it, beforeEach } from 'vitest'
import { ipcMain } from 'electron'
import { registerPluginBridge } from '@main/ipc/plugin-bridge'

const createPluginManagerMock = () => ({
  listLoaded: vi.fn(() => [
    {
      manifest: { id: 'demo', name: 'Demo', version: '1.0.0', author: 'Tester' },
      triggers: [],
      actions: [],
    },
  ]),
  getPlugin: vi.fn(() => ({
    manifest: { id: 'demo', name: 'Demo', version: '1.0.0', author: 'Tester' },
    triggers: [],
    actions: [],
  })),
  executeAction: vi.fn(async () => undefined),
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
  })
})
