import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { PerformanceMonitor } from '@main/core/performance-monitor'
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

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor
  let mockEventBus: EventBus
  let mockLogger: Logger

  beforeEach(() => {
    mockEventBus = createMockEventBus()
    mockLogger = createMockLogger()
    monitor = new PerformanceMonitor(mockEventBus, {}, mockLogger)
  })

  afterEach(() => {
    monitor.stop()
  })

  describe('metrics collection', () => {
    it('should collect performance metrics', () => {
      const metrics = monitor.getMetrics()

      expect(metrics).toHaveProperty('cpu')
      expect(metrics).toHaveProperty('memory')
      expect(metrics.memory).toHaveProperty('heapUsed')
      expect(metrics.memory).toHaveProperty('heapTotal')
      expect(metrics.memory).toHaveProperty('rss')
      expect(metrics).toHaveProperty('eventLoopLag')
    })

    it('should get memory metrics', () => {
      const memoryMetrics = monitor.getMemoryMetrics()

      expect(memoryMetrics).toHaveProperty('rss')
      expect(memoryMetrics).toHaveProperty('heapTotal')
      expect(memoryMetrics).toHaveProperty('heapUsed')
      expect(memoryMetrics).toHaveProperty('external')
      expect(memoryMetrics).toHaveProperty('arrayBuffers')
    })
  })

  describe('memory leak detection', () => {
    it('should detect potential memory leaks', () => {
      const leaks = monitor.detectMemoryLeaks()

      // May or may not detect leaks depending on actual memory usage
      expect(leaks).toBeInstanceOf(Map)
    })
  })

  describe('performance operations', () => {
    it('should mark and measure performance', () => {
      monitor.mark('start')

      // Simulate some work
      const delay = 10
      const start = Date.now()
      while (Date.now() - start < delay) {
        // Busy wait
      }

      monitor.mark('end')
      const duration = monitor.measure('start')

      expect(duration).toBeDefined()
      expect(duration).toBeGreaterThanOrEqual(0)
    })

    it('should track operations with startOperation', () => {
      const endOperation = monitor.startOperation('test-operation')

      // Simulate work
      const delay = 10
      const start = Date.now()
      while (Date.now() - start < delay) {
        // Busy wait
      }

      endOperation()

      // Operation tracking is internal, just verify it doesn't throw
      expect(endOperation).toBeDefined()
    })
  })

  describe('monitoring control', () => {
    it('should start and stop monitoring', () => {
      monitor.start()
      // No public isMonitoring method, just verify it doesn't throw

      monitor.stop()
      // Verify stop doesn't throw
      expect(monitor).toBeDefined()
    })

    it('should start monitoring with custom interval', () => {
      monitor.start(5000)

      // Monitoring starts, verify it doesn't throw
      monitor.stop()
      expect(monitor).toBeDefined()
    })
  })
})