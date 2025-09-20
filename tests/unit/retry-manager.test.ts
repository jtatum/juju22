import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RetryManager, RetryProfiles } from '@main/core/retry-manager'
import type { Logger } from '@main/core/logger'

const createMockLogger = (): Logger =>
  ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as Logger)

describe('RetryManager', () => {
  let retryManager: RetryManager

  beforeEach(() => {
    retryManager = new RetryManager(undefined, createMockLogger())
  })

  describe('successful operations', () => {
    it('should execute successfully on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success')

      const result = await retryManager.execute('test-op', fn)

      expect(result.success).toBe(true)
      expect(result.result).toBe('success')
      expect(result.attempts).toBe(1)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should return result with executeWithRetry', async () => {
      const fn = vi.fn().mockResolvedValue('success')

      const result = await retryManager.executeWithRetry('test-op', fn)

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('retry behavior', () => {
    it('should retry on failure up to max attempts', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValueOnce('success')

      const result = await retryManager.execute('test-op', fn, {
        maxAttempts: 3,
        initialDelay: 10,
      })

      expect(result.success).toBe(true)
      expect(result.result).toBe('success')
      expect(result.attempts).toBe(3)
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('should fail after max attempts exhausted', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('persistent error'))

      const result = await retryManager.execute('test-op', fn, {
        maxAttempts: 3,
        initialDelay: 10,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
      expect(result.attempts).toBe(3)
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('should throw with executeWithRetry on failure', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('persistent error'))

      await expect(
        retryManager.executeWithRetry('test-op', fn, {
          maxAttempts: 2,
          initialDelay: 10,
        })
      ).rejects.toThrow('persistent error')

      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('exponential backoff', () => {
    it('should apply exponential backoff between retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'))
      const startTime = Date.now()

      await retryManager.execute('test-op', fn, {
        maxAttempts: 3,
        initialDelay: 50,
        backoffMultiplier: 2,
        jitter: false,
      })

      const duration = Date.now() - startTime

      // Should wait 50ms after first failure, 100ms after second
      // Total wait time should be at least 150ms
      expect(duration).toBeGreaterThanOrEqual(150)
      expect(duration).toBeLessThan(250) // With some buffer
    })

    it('should respect max delay limit', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'))
      const startTime = Date.now()

      await retryManager.execute('test-op', fn, {
        maxAttempts: 4,
        initialDelay: 50,
        maxDelay: 75,
        backoffMultiplier: 2,
        jitter: false,
      })

      const duration = Date.now() - startTime

      // Delays: 50, 75 (capped), 75 (capped)
      // Total: 200ms
      expect(duration).toBeGreaterThanOrEqual(200)
      expect(duration).toBeLessThan(300)
    })
  })

  describe('timeout handling', () => {
    it('should timeout long-running operations', async () => {
      const fn = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('late'), 200))
      )

      const result = await retryManager.execute('test-op', fn, {
        maxAttempts: 1,
        timeout: 50,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
      expect((result.error as Error).message).toContain('timed out')
    })
  })

  describe('error filtering', () => {
    it('should retry only retryable errors', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce({ code: 'ECONNRESET' })
        .mockResolvedValueOnce('success')

      const result = await retryManager.execute('test-op', fn, {
        maxAttempts: 3,
        initialDelay: 10,
        retryableErrors: ['ECONNRESET', 'ETIMEDOUT'],
      })

      expect(result.success).toBe(true)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should abort on non-retryable errors', async () => {
      const fn = vi.fn().mockRejectedValue({ code: 'EACCES' })

      const result = await retryManager.execute('test-op', fn, {
        maxAttempts: 3,
        initialDelay: 10,
        retryableErrors: ['ECONNRESET', 'ETIMEDOUT'],
      })

      expect(result.success).toBe(false)
      expect(fn).toHaveBeenCalledTimes(1) // No retry
    })

    it('should abort on specified abort errors', async () => {
      const fn = vi.fn().mockRejectedValue({ code: 'UNAUTHORIZED' })

      const result = await retryManager.execute('test-op', fn, {
        maxAttempts: 3,
        initialDelay: 10,
        abortErrors: ['UNAUTHORIZED', 'FORBIDDEN'],
      })

      expect(result.success).toBe(false)
      expect(fn).toHaveBeenCalledTimes(1) // No retry
    })
  })

  describe('retry profiles', () => {
    it('should use API profile settings', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce({ code: 'ECONNRESET' })
        .mockResolvedValueOnce('success')

      const result = await retryManager.execute('test-op', fn, RetryProfiles.API)

      expect(result.success).toBe(true)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should abort on API profile abort errors', async () => {
      const fn = vi.fn().mockRejectedValue({ code: 'UNAUTHORIZED' })

      const result = await retryManager.execute('test-op', fn, RetryProfiles.API)

      expect(result.success).toBe(false)
      expect(fn).toHaveBeenCalledTimes(1) // No retry for UNAUTHORIZED
    })

    it('should use DATABASE profile settings', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce({ code: 'SQLITE_BUSY' })
        .mockResolvedValueOnce('success')

      const result = await retryManager.execute('test-op', fn, RetryProfiles.DATABASE)

      expect(result.success).toBe(true)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should use PLUGIN profile settings', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockResolvedValueOnce('success')

      const result = await retryManager.execute('test-op', fn, RetryProfiles.PLUGIN)

      expect(result.success).toBe(true)
      expect(result.result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(2) // PLUGIN profile has maxAttempts: 2
    })
  })

  describe('result tracking', () => {
    it('should track execution duration', async () => {
      const fn = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('success'), 50))
      )

      const result = await retryManager.execute('test-op', fn)

      expect(result.duration).toBeGreaterThanOrEqual(50)
      expect(result.duration).toBeLessThan(150)
    })

    it('should track total duration including retries', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce('success')

      const startTime = Date.now()

      const result = await retryManager.execute('test-op', fn, {
        maxAttempts: 2,
        initialDelay: 50,
        jitter: false,
      })

      const actualDuration = Date.now() - startTime

      expect(result.duration).toBeGreaterThanOrEqual(45) // Allow small timing variance
      expect(result.duration).toBeLessThanOrEqual(actualDuration + 10) // Small buffer for timing
    })
  })
})