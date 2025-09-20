import { EventEmitter } from 'events'
import type { Logger } from './logger'
import { createLogger } from './logger'

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerConfig {
  failureThreshold?: number
  successThreshold?: number
  timeout?: number
  resetTimeout?: number
  logger?: Logger
}

export interface CircuitBreakerStats {
  state: CircuitState
  failures: number
  successes: number
  lastFailureTime?: number
  nextAttemptTime?: number
  totalCalls: number
  totalFailures: number
  totalSuccesses: number
}

export class CircuitBreaker extends EventEmitter {
  private state: CircuitState = CircuitState.CLOSED
  private failures = 0
  private successes = 0
  private lastFailureTime?: number
  private nextAttemptTime?: number
  private totalCalls = 0
  private totalFailures = 0
  private totalSuccesses = 0

  private readonly failureThreshold: number
  private readonly successThreshold: number
  private readonly timeout: number
  private readonly resetTimeout: number
  private readonly logger: Logger
  private readonly name: string

  constructor(name: string, config: CircuitBreakerConfig = {}) {
    super()
    this.name = name
    this.failureThreshold = config.failureThreshold ?? 5
    this.successThreshold = config.successThreshold ?? 2
    this.timeout = config.timeout ?? 60000 // 1 minute
    this.resetTimeout = config.resetTimeout ?? 30000 // 30 seconds
    this.logger = config.logger ?? createLogger(`CircuitBreaker:${name}`)
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalCalls++

    if (this.state === CircuitState.OPEN) {
      if (this.canAttemptReset()) {
        this.transitionToHalfOpen()
      } else {
        const error = new Error(`Circuit breaker is OPEN for ${this.name}`) as Error & { code?: string }
        error.code = 'CIRCUIT_OPEN'
        throw error
      }
    }

    try {
      const result = await this.executeWithTimeout(fn)
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure(error)
      throw error
    }
  }

  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${this.timeout}ms`))
      }, this.timeout)

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

  private onSuccess(): void {
    this.totalSuccesses++
    this.failures = 0

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++
      if (this.successes >= this.successThreshold) {
        this.transitionToClosed()
      }
    }
  }

  private onFailure(error: unknown): void {
    this.totalFailures++
    this.failures++
    this.lastFailureTime = Date.now()

    this.logger.warn(`Circuit breaker ${this.name} failure #${this.failures}`, error)

    if (this.state === CircuitState.HALF_OPEN) {
      this.transitionToOpen()
    } else if (this.state === CircuitState.CLOSED && this.failures >= this.failureThreshold) {
      this.transitionToOpen()
    }
  }

  private canAttemptReset(): boolean {
    return (
      this.nextAttemptTime !== undefined &&
      Date.now() >= this.nextAttemptTime
    )
  }

  private transitionToOpen(): void {
    this.state = CircuitState.OPEN
    this.nextAttemptTime = Date.now() + this.resetTimeout
    this.successes = 0

    this.logger.error(`Circuit breaker ${this.name} transitioned to OPEN`)
    this.emit('open', this.name)
  }

  private transitionToHalfOpen(): void {
    this.state = CircuitState.HALF_OPEN
    this.successes = 0
    this.failures = 0

    this.logger.info(`Circuit breaker ${this.name} transitioned to HALF_OPEN`)
    this.emit('halfOpen', this.name)
  }

  private transitionToClosed(): void {
    this.state = CircuitState.CLOSED
    this.failures = 0
    this.successes = 0
    this.nextAttemptTime = undefined

    this.logger.info(`Circuit breaker ${this.name} transitioned to CLOSED`)
    this.emit('closed', this.name)
  }

  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      totalCalls: this.totalCalls,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
    }
  }

  reset(): void {
    this.state = CircuitState.CLOSED
    this.failures = 0
    this.successes = 0
    this.lastFailureTime = undefined
    this.nextAttemptTime = undefined

    this.logger.info(`Circuit breaker ${this.name} manually reset`)
    this.emit('reset', this.name)
  }
}

export class CircuitBreakerManager {
  private readonly breakers = new Map<string, CircuitBreaker>()
  private readonly logger: Logger

  constructor(logger?: Logger) {
    this.logger = logger ?? createLogger('CircuitBreakerManager')
  }

  getBreaker(name: string, config?: CircuitBreakerConfig): CircuitBreaker {
    if (!this.breakers.has(name)) {
      const breakerConfig = { ...config, logger: config?.logger ?? this.logger }
      const breaker = new CircuitBreaker(name, breakerConfig)
      this.breakers.set(name, breaker)

      // Forward events for monitoring
      breaker.on('open', () => this.onBreakerOpen(name))
      breaker.on('halfOpen', () => this.onBreakerHalfOpen(name))
      breaker.on('closed', () => this.onBreakerClosed(name))
    }

    return this.breakers.get(name)!
  }

  getAllStats(): Map<string, CircuitBreakerStats> {
    const stats = new Map<string, CircuitBreakerStats>()
    for (const [name, breaker] of this.breakers) {
      stats.set(name, breaker.getStats())
    }
    return stats
  }

  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset()
    }
  }

  private onBreakerOpen(name: string): void {
    this.logger.warn(`Circuit breaker opened: ${name}`)
  }

  private onBreakerHalfOpen(name: string): void {
    this.logger.info(`Circuit breaker half-open: ${name}`)
  }

  private onBreakerClosed(name: string): void {
    this.logger.info(`Circuit breaker closed: ${name}`)
  }
}