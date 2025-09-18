import { createWriteStream, existsSync, mkdirSync, type WriteStream } from 'node:fs'
import { join } from 'node:path'
import * as electron from 'electron'

const { app } = electron

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

export class Logger {
  private readonly name: string
  private readonly level: LogLevel
  private stream: WriteStream | null = null

  constructor(name: string, level: LogLevel = (process.env.AIDLE_LOG_LEVEL as LogLevel) ?? 'info') {
    this.name = name
    this.level = level
  }

  debug(message: string, meta?: unknown) {
    this.write('debug', message, meta)
  }

  info(message: string, meta?: unknown) {
    this.write('info', message, meta)
  }

  warn(message: string, meta?: unknown) {
    this.write('warn', message, meta)
  }

  error(message: string, meta?: unknown) {
    this.write('error', message, meta)
  }

  private write(level: LogLevel, message: string, meta?: unknown) {
    if (levelOrder[level] < levelOrder[this.level]) return

    const timestamp = new Date().toISOString()
    const formatted = `${timestamp} [${level.toUpperCase()}] [${this.name}] ${message}`
    const stream = this.ensureStream()
    if (stream) {
      if (meta) {
        stream.write(`${formatted} ${JSON.stringify(meta)}\n`)
      } else {
        stream.write(`${formatted}\n`)
      }
    }
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console[level === 'debug' ? 'log' : level](formatted, meta ?? '')
    }
  }

  private ensureStream() {
    if (this.stream) return this.stream

    const file = this.resolveLogFile()
    try {
      this.stream = createWriteStream(file, { flags: 'a' })
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
        // Directory may have been removed between runs; recreate and retry once.
        const dir = join(app.getPath('userData'), 'logs')
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true })
        }
        this.stream = createWriteStream(file, { flags: 'a' })
      } else {
        this.stream = null
      }
    }

    return this.stream
  }

  private resolveLogFile(): string {
    const dir = join(app.getPath('userData'), 'logs')
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    return join(dir, 'aidle.log')
  }
}

export const createLogger = (name: string) => new Logger(name)
