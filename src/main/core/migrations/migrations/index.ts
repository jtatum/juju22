import { migration as migration0001 } from './0001_initial_schema'
import { migration as migration0002 } from './0002_seed_variable_defaults'
import type { Migration } from '../types'

export const allMigrations: Migration[] = [
  migration0001,
  migration0002,
]