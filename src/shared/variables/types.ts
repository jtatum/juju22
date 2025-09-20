export type VariableScope = 'global' | 'plugin' | 'rule'

export interface VariableKey {
  scope: VariableScope
  key: string
  ownerId?: string
}

export interface VariableRecord extends VariableKey {
  value: unknown
  createdAt: string
  updatedAt: string
}

export interface VariableMutation {
  key: VariableKey
  value: unknown | undefined
  previousValue: unknown
  mutatedAt: number
  source?: {
    type: 'rule' | 'plugin' | 'user'
    id?: string
  }
}

export interface VariableSnapshot {
  global: Record<string, unknown>
  plugin: Record<string, unknown>
  rule: Record<string, unknown>
}
