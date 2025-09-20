import * as electron from 'electron'
import type { VariableService } from '../core/variable-service'
import type { VariableScope } from '../../shared/variables/types'

const normalizeScope = (scope: string): VariableScope => {
  if (scope === 'global' || scope === 'plugin' || scope === 'rule') {
    return scope
  }
  throw new Error(`Unsupported variable scope '${scope}'`)
}

interface VariableRequestPayload {
  scope: VariableScope
  key: string
  ownerId?: string
}

export const registerVariableBridge = (variables: VariableService) => {
  const { ipcMain } = electron

  ipcMain.handle('variables:list', (_event, payload: { scope: string; ownerId?: string }) => {
    const scope = normalizeScope(payload.scope)
    return variables.list(scope, payload.ownerId)
  })

  ipcMain.handle(
    'variables:get',
    (_event, payload: { scope: string; key: string; ownerId?: string }) => {
      const scope = normalizeScope(payload.scope)
      return variables.getValue({ scope, key: payload.key, ownerId: payload.ownerId }) ?? null
    },
  )

  ipcMain.handle(
    'variables:set',
    (_event, payload: VariableRequestPayload & { value: unknown }) => {
      const scope = normalizeScope(payload.scope)
      const record = variables.setValue(
        { scope, key: payload.key, ownerId: payload.ownerId },
        payload.value,
        { type: 'user' },
      )
      return record
    },
  )

  ipcMain.handle(
    'variables:increment',
    (_event, payload: VariableRequestPayload & { amount?: number }) => {
      const scope = normalizeScope(payload.scope)
      const amount = typeof payload.amount === 'number' ? payload.amount : 1
      const record = variables.incrementValue(
        { scope, key: payload.key, ownerId: payload.ownerId },
        amount,
        { type: 'user' },
      )
      return record
    },
  )

  ipcMain.handle('variables:reset', (_event, payload: VariableRequestPayload) => {
    const scope = normalizeScope(payload.scope)
    variables.deleteValue({ scope, key: payload.key, ownerId: payload.ownerId }, { type: 'user' })
    return { status: 'ok' }
  })

  ipcMain.handle(
    'variables:snapshot',
    (_event, payload: { ruleId: string; pluginId: string }) => variables.getSnapshot(payload.ruleId, payload.pluginId),
  )
}
