import { vi } from 'vitest'

export class Logger {
  constructor(public readonly name: string) {}

  debug = vi.fn<void, [string, unknown?]>()
  info = vi.fn<void, [string, unknown?]>()
  warn = vi.fn<void, [string, unknown?]>()
  error = vi.fn<void, [string, unknown?]>()
}

export const createLogger = (name: string) => new Logger(name)
