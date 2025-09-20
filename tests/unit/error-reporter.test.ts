import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ErrorReporter, ErrorCategory, ErrorSeverity } from '@main/core/error-reporter'
import type { EventBus } from '@main/core/event-bus'
import type { Logger } from '@main/core/logger'

const createMockLogger = (): Logger =>
  ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as Logger)

const createMockEventBus = (): EventBus => ({
  emit: vi.fn(),
  on: vi.fn(),
  onAll: vi.fn(),
  emitPluginTrigger: vi.fn(),
  emitPluginStatus: vi.fn(),
  emitVariableMutation: vi.fn(),
  onPluginTrigger: vi.fn(),
  onPluginStatus: vi.fn(),
  onVariableMutation: vi.fn(),
  onLog: vi.fn(),
  getRecentLogEntries: vi.fn().mockReturnValue([]),
} as unknown as EventBus)

describe('ErrorReporter', () => {
  let reporter: ErrorReporter
  let mockEventBus: EventBus
  let mockLogger: Logger

  beforeEach(() => {
    mockEventBus = createMockEventBus()
    mockLogger = createMockLogger()
    reporter = new ErrorReporter(mockEventBus, mockLogger)
  })

  describe('error categorization', () => {
    it('should categorize network errors correctly', () => {
      const error = new Error('Connection refused')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(error as any).code = 'ECONNREFUSED'

      const report = reporter.report(error)

      expect(report.context.category).toBe(ErrorCategory.NETWORK)
    })

    it('should categorize plugin errors correctly', () => {
      const error = new Error('Plugin initialization failed')

      const report = reporter.report(error, { category: ErrorCategory.PLUGIN })

      expect(report.context.category).toBe(ErrorCategory.PLUGIN)
    })

    it('should assess severity correctly', () => {
      const criticalError = new Error('Database crashed')
      const report = reporter.report(criticalError, { category: ErrorCategory.DATABASE })

      expect(report.context.severity).toBe(ErrorSeverity.CRITICAL)
    })
  })

  describe('error recovery', () => {
    it('should provide recovery suggestions for network errors', () => {
      const error = new Error('Network timeout')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(error as any).code = 'ETIMEDOUT'

      const report = reporter.report(error)

      expect(report.suggestions).toContain('Check your network connection')
      expect(report.suggestions).toContain('The system will automatically retry')
      expect(report.recoverable).toBe(true)
    })

    it('should mark plugin errors with correct suggestions', () => {
      const error = new Error('Plugin error')

      const report = reporter.report(error, {
        category: ErrorCategory.PLUGIN,
        pluginId: 'test-plugin'
      })

      expect(report.suggestions[0]).toContain('Plugin test-plugin will be automatically restarted')
      expect(report.recoverable).toBe(true)
    })

    it('should use custom message when provided in metadata', () => {
      const error = new Error('Technical error details')

      const report = reporter.report(error, {
        category: ErrorCategory.PLUGIN,
        pluginId: 'obs',
        metadata: { customMessage: 'Failed to connect to OBS WebSocket' }
      })

      expect(report.userMessage).toBe('Failed to connect to OBS WebSocket')
    })
  })

  describe('error history', () => {
    it('should maintain error history', () => {
      const error1 = new Error('Error 1')
      const error2 = new Error('Error 2')

      reporter.report(error1)
      reporter.report(error2)

      const history = reporter.getErrorHistory()
      expect(history).toHaveLength(2)
      expect(history[0].error.message).toBe('Error 2') // Most recent first
    })

    it('should filter history by category', () => {
      reporter.report(new Error('Network error'), { category: ErrorCategory.NETWORK })
      reporter.report(new Error('Plugin error'), { category: ErrorCategory.PLUGIN })

      const networkErrors = reporter.getErrorHistory(ErrorCategory.NETWORK)
      expect(networkErrors).toHaveLength(1)
      expect(networkErrors[0].context.category).toBe(ErrorCategory.NETWORK)
    })

    it('should clear error history', () => {
      reporter.report(new Error('Test error'))
      reporter.clearErrorHistory()

      const history = reporter.getErrorHistory()
      expect(history).toHaveLength(0)
    })
  })

  describe('error statistics', () => {
    it('should track error statistics by category', () => {
      reporter.report(new Error('Error 1'), { category: ErrorCategory.NETWORK })
      reporter.report(new Error('Error 2'), { category: ErrorCategory.NETWORK })
      reporter.report(new Error('Error 3'), { category: ErrorCategory.PLUGIN })

      const stats = reporter.getErrorStatistics()

      expect(stats[ErrorCategory.NETWORK]).toBe(2)
      expect(stats[ErrorCategory.PLUGIN]).toBe(1)
    })
  })

  describe('event emission', () => {
    it('should emit error events to EventBus', () => {
      const error = new Error('Test error')
      reporter.report(error)

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('error.reported'),
          payload: expect.objectContaining({
            error: expect.objectContaining({
              message: 'Test error'
            })
          })
        })
      )
    })
  })
})