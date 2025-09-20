import type { Logger } from './logger'
import { createLogger } from './logger'
import type { EventBus } from './event-bus'

export interface RetryConfig {
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  jitter?: boolean
  timeout?: number
  retryableErrors?: string[]
  abortErrors?: string[]
}

export interface RetryContext {
  attempt: number
  totalAttempts: number
  delay: number
  error?: unknown
  startTime: number
}

export interface RetryResult<T> {
  success: boolean
  result?: T
  error?: unknown
  attempts: number
  duration: number
}

export class RetryManager {
  private readonly logger: Logger
  private readonly eventBus?: EventBus
  private readonly defaultConfig: Required<RetryConfig> = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
    timeout: 60000,
    retryableErrors: [],
    abortErrors: [],
  }

  constructor(eventBus?: EventBus, logger?: Logger) {
    this.eventBus = eventBus
    this.logger = logger ?? createLogger('RetryManager')
  }

  async execute<T>(
    operation: string,
    fn: () => Promise<T>,
    config?: RetryConfig,
  ): Promise<RetryResult<T>> {
    const finalConfig = { ...this.defaultConfig, ...config }
    const startTime = Date.now()
    let lastError: unknown

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      const context: RetryContext = {
        attempt,
        totalAttempts: finalConfig.maxAttempts,
        delay: this.calculateDelay(attempt, finalConfig),
        startTime,
      }

      try {
        this.logger.debug(`Attempting operation ${operation} (${attempt}/${finalConfig.maxAttempts})`)

        const result = await this.executeWithTimeout(fn, finalConfig.timeout)

        this.emitRetryEvent('retry.success', operation, context)

        return {
          success: true,
          result,
          attempts: attempt,
          duration: Date.now() - startTime,
        }
      } catch (error) {
        lastError = error
        context.error = error

        if (this.shouldAbort(error, finalConfig)) {
          this.logger.error(`Operation ${operation} failed with non-retryable error`, error)
          this.emitRetryEvent('retry.aborted', operation, context)
          break
        }

        if (attempt < finalConfig.maxAttempts) {
          this.logger.warn(
            `Operation ${operation} failed (attempt ${attempt}/${finalConfig.maxAttempts}), retrying in ${context.delay}ms`,
            error,
          )

          this.emitRetryEvent('retry.attempt', operation, context)
          await this.delay(context.delay)
        } else {
          this.logger.error(
            `Operation ${operation} failed after ${attempt} attempts`,
            error,
          )

          this.emitRetryEvent('retry.exhausted', operation, context)
        }
      }
    }

    return {
      success: false,
      error: lastError,
      attempts: finalConfig.maxAttempts,
      duration: Date.now() - startTime,
    }
  }

  async executeWithRetry<T>(
    operation: string,
    fn: () => Promise<T>,
    config?: RetryConfig,
  ): Promise<T> {
    const result = await this.execute(operation, fn, config)

    if (!result.success) {
      throw result.error
    }

    return result.result!
  }

  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeout: number,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeout}ms`))
      }, timeout)

      fn()
        .then((result) => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch((error) => {
          clearTimeout(timer)
          reject(error)
        })
    })
  }

  private calculateDelay(attempt: number, config: Required<RetryConfig>): number {
    let delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1)

    // Apply max delay cap
    delay = Math.min(delay, config.maxDelay)

    // Add jitter if enabled
    if (config.jitter) {
      const jitterRange = delay * 0.2 // 20% jitter
      const jitter = Math.random() * jitterRange - jitterRange / 2
      delay += jitter
    }

    return Math.round(delay)
  }

  private shouldAbort(error: unknown, config: Required<RetryConfig>): boolean {
    if (!error || typeof error !== 'object') {
      return false
    }

    const errorRecord = error as Record<string, unknown>
    const errorCode = errorRecord.code ? String(errorRecord.code) : errorRecord.name ? String(errorRecord.name) : undefined

    // Check if error is in abort list
    if (config.abortErrors.length > 0 && errorCode) {
      if (config.abortErrors.includes(errorCode)) {
        return true
      }
    }

    // Check if error is retryable (if list is specified)
    if (config.retryableErrors.length > 0 && errorCode) {
      return !config.retryableErrors.includes(errorCode)
    }

    // Default: retry all errors
    return false
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private emitRetryEvent(
    type: string,
    operation: string,
    context: RetryContext,
  ): void {
    if (!this.eventBus) return

    this.eventBus.emit({
      type: 'system.retry',
      payload: {
        type: type as 'retry.success' | 'retry.attempt' | 'retry.exhausted' | 'retry.aborted',
        operation,
        attempt: context.attempt,
        totalAttempts: context.totalAttempts,
        delay: context.delay,
        duration: Date.now() - context.startTime,
        error: context.error instanceof Error ? context.error.message : String(context.error),
      },
    })
  }
}

// Service-specific retry configurations
export const RetryProfiles = {
  API: {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true,
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'],
    abortErrors: ['UNAUTHORIZED', 'FORBIDDEN'],
  },

  DATABASE: {
    maxAttempts: 5,
    initialDelay: 100,
    maxDelay: 5000,
    backoffMultiplier: 1.5,
    jitter: false,
    retryableErrors: ['SQLITE_BUSY', 'SQLITE_LOCKED'],
  },

  PLUGIN: {
    maxAttempts: 2,
    initialDelay: 500,
    maxDelay: 3000,
    backoffMultiplier: 2,
    jitter: true,
    timeout: 5000,
  },

  NETWORK: {
    maxAttempts: 4,
    initialDelay: 2000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
    retryableErrors: ['ECONNREFUSED', 'EHOSTUNREACH', 'ENETUNREACH'],
  },
} as const