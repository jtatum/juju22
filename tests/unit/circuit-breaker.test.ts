import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CircuitBreaker, CircuitState, CircuitBreakerManager } from '@main/core/circuit-breaker'
import type { Logger } from '@main/core/logger'

const createMockLogger = (): Logger =>
  ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as Logger)

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker

  beforeEach(() => {
    breaker = new CircuitBreaker('test', {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 100,
      resetTimeout: 50,
      logger: createMockLogger(),
    })
  })

  describe('state transitions', () => {
    it('should start in CLOSED state', () => {
      const stats = breaker.getStats()
      expect(stats.state).toBe(CircuitState.CLOSED)
      expect(stats.failures).toBe(0)
      expect(stats.successes).toBe(0)
    })

    it('should transition to OPEN after failure threshold', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('test error'))

      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(failingFn)
        } catch { /* Expected error */ }
      }

      const stats = breaker.getStats()
      expect(stats.state).toBe(CircuitState.OPEN)
      expect(stats.failures).toBe(3) // Failures are not reset when opening
      expect(stats.totalFailures).toBe(3)
    })

    it('should transition to HALF_OPEN after reset timeout', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('test error'))

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(failingFn)
        } catch { /* Expected error */ }
      }

      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 60))

      // Try again - should move to HALF_OPEN
      const successFn = vi.fn().mockResolvedValue('success')
      await breaker.execute(successFn)

      const stats = breaker.getStats()
      expect(stats.state).toBe(CircuitState.HALF_OPEN)
    })

    it('should transition from HALF_OPEN to CLOSED after success threshold', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('test error'))
      const successFn = vi.fn().mockResolvedValue('success')

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(failingFn)
        } catch { /* Expected error */ }
      }

      // Wait and transition to HALF_OPEN
      await new Promise(resolve => setTimeout(resolve, 60))

      // Succeed twice to close
      await breaker.execute(successFn)
      await breaker.execute(successFn)

      const stats = breaker.getStats()
      expect(stats.state).toBe(CircuitState.CLOSED)
    })

    it('should transition from HALF_OPEN back to OPEN on failure', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('test error'))
      const successFn = vi.fn().mockResolvedValue('success')

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(failingFn)
        } catch { /* Expected error */ }
      }

      // Wait and transition to HALF_OPEN
      await new Promise(resolve => setTimeout(resolve, 60))
      await breaker.execute(successFn)

      // Fail in HALF_OPEN state
      try {
        await breaker.execute(failingFn)
      } catch {
        // Expected error
      }

      const stats = breaker.getStats()
      expect(stats.state).toBe(CircuitState.OPEN)
    })
  })

  describe('execution', () => {
    it('should execute function when circuit is CLOSED', async () => {
      const fn = vi.fn().mockResolvedValue('result')
      const result = await breaker.execute(fn)

      expect(fn).toHaveBeenCalled()
      expect(result).toBe('result')
    })

    it('should reject immediately when circuit is OPEN', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('test error'))

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(failingFn)
        } catch { /* Expected error */ }
      }

      // Try to execute when open
      const fn = vi.fn().mockResolvedValue('result')
      await expect(breaker.execute(fn)).rejects.toThrow('Circuit breaker is OPEN')
      expect(fn).not.toHaveBeenCalled()
    })

    it('should timeout long-running operations', async () => {
      const slowFn = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('result'), 200))
      )

      await expect(breaker.execute(slowFn)).rejects.toThrow('Operation timed out')
    })
  })

  describe('statistics', () => {
    it('should track call statistics', async () => {
      const successFn = vi.fn().mockResolvedValue('success')
      const failFn = vi.fn().mockRejectedValue(new Error('fail'))

      await breaker.execute(successFn)
      await breaker.execute(successFn)

      try {
        await breaker.execute(failFn)
      } catch {
        // Expected error
      }

      const stats = breaker.getStats()
      expect(stats.totalCalls).toBe(3)
      expect(stats.totalSuccesses).toBe(2)
      expect(stats.totalFailures).toBe(1)
    })
  })

  describe('manual control', () => {
    it('should reset circuit manually', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('test error'))

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(failingFn)
        } catch { /* Expected error */ }
      }

      expect(breaker.getStats().state).toBe(CircuitState.OPEN)

      // Manual reset
      breaker.reset()

      expect(breaker.getStats().state).toBe(CircuitState.CLOSED)
      expect(breaker.getStats().failures).toBe(0)
    })
  })
})

describe('CircuitBreakerManager', () => {
  let manager: CircuitBreakerManager

  beforeEach(() => {
    manager = new CircuitBreakerManager(createMockLogger())
  })

  it('should create and return same breaker for same name', () => {
    const breaker1 = manager.getBreaker('test')
    const breaker2 = manager.getBreaker('test')

    expect(breaker1).toBe(breaker2)
  })

  it('should create different breakers for different names', () => {
    const breaker1 = manager.getBreaker('test1')
    const breaker2 = manager.getBreaker('test2')

    expect(breaker1).not.toBe(breaker2)
  })

  it('should get all breaker statistics', async () => {
    const breaker1 = manager.getBreaker('test1')
    manager.getBreaker('test2')

    const failFn = vi.fn().mockRejectedValue(new Error('fail'))

    try {
      await breaker1.execute(failFn)
    } catch {
      // Expected error
    }

    const stats = manager.getAllStats()

    expect(stats.size).toBe(2)
    expect(stats.get('test1')?.totalFailures).toBe(1)
    expect(stats.get('test2')?.totalFailures).toBe(0)
  })

  it('should reset all breakers', async () => {
    const breaker1 = manager.getBreaker('test1', { failureThreshold: 1 })
    const breaker2 = manager.getBreaker('test2', { failureThreshold: 1 })

    const failFn = vi.fn().mockRejectedValue(new Error('fail'))

    // Open both circuits
    try {
      await breaker1.execute(failFn)
    } catch {
      // Expected error
    }
    try {
      await breaker2.execute(failFn)
    } catch {
      // Expected error
    }

    expect(breaker1.getStats().state).toBe(CircuitState.OPEN)
    expect(breaker2.getStats().state).toBe(CircuitState.OPEN)

    // Reset all
    manager.resetAll()

    expect(breaker1.getStats().state).toBe(CircuitState.CLOSED)
    expect(breaker2.getStats().state).toBe(CircuitState.CLOSED)
  })
})