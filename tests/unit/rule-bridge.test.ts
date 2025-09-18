import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ipcMain } from 'electron'
import { registerRuleBridge } from '@main/ipc/rule-bridge'

const createRuleEngineMock = () => ({
  listRules: vi.fn(() => []),
  getRule: vi.fn(() => null),
  saveRule: vi.fn(async (rule) => rule),
  deleteRule: vi.fn(),
})

describe('registerRuleBridge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers IPC handlers for rule operations', async () => {
    const ruleEngine = createRuleEngineMock()
    registerRuleBridge(ruleEngine as never)

    const listHandler = (ipcMain.handle as unknown as vi.Mock).mock.calls.find((call) => call[0] === 'rules:list')?.[1]
    expect(listHandler).toBeTypeOf('function')
    await listHandler?.()
    expect(ruleEngine.listRules).toHaveBeenCalled()

    const saveHandler = (ipcMain.handle as unknown as vi.Mock).mock.calls.find((call) => call[0] === 'rules:save')?.[1]
    expect(saveHandler).toBeTypeOf('function')
    await saveHandler?.({}, { id: 'rule-1' })
    expect(ruleEngine.saveRule).toHaveBeenCalledWith({ id: 'rule-1' })

    const deleteHandler = (ipcMain.handle as unknown as vi.Mock).mock.calls.find((call) => call[0] === 'rules:delete')?.[1]
    expect(deleteHandler).toBeTypeOf('function')
    await deleteHandler?.({}, 'rule-1')
    expect(ruleEngine.deleteRule).toHaveBeenCalledWith('rule-1')
  })
})
