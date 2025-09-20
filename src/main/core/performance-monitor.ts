import { performance } from 'perf_hooks'
import type { EventBus } from './event-bus'
import type { Logger } from './logger'
import { createLogger } from './logger'

export interface MemoryMetrics {
  rss: number
  heapTotal: number
  heapUsed: number
  external: number
  arrayBuffers: number
}

export interface PerformanceMetrics {
  memory: MemoryMetrics
  cpu: {
    user: number
    system: number
  }
  eventLoopLag: number
  activeHandles: number
  activeRequests: number
}

export interface PerformanceMark {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, unknown>
}

export interface PerformanceThresholds {
  memoryUsageWarning?: number // MB
  memoryUsageCritical?: number // MB
  heapGrowthRate?: number // MB/minute
  eventLoopLagWarning?: number // ms
  eventLoopLagCritical?: number // ms
}

export class PerformanceMonitor {
  private readonly logger: Logger
  private readonly eventBus?: EventBus
  private readonly marks = new Map<string, PerformanceMark>()
  private readonly thresholds: PerformanceThresholds
  private monitoringInterval?: NodeJS.Timer
  // private previousMemory?: MemoryMetrics // Currently unused, may be needed for future features
  private previousCpu?: NodeJS.CpuUsage
  private memoryHistory: number[] = []
  private readonly maxHistorySize = 60 // 1 minute of history at 1Hz

  constructor(eventBus?: EventBus, thresholds: PerformanceThresholds = {}) {
    this.eventBus = eventBus
    this.logger = createLogger('PerformanceMonitor')
    this.thresholds = {
      memoryUsageWarning: thresholds.memoryUsageWarning ?? 500, // 500 MB
      memoryUsageCritical: thresholds.memoryUsageCritical ?? 800, // 800 MB
      heapGrowthRate: thresholds.heapGrowthRate ?? 50, // 50 MB/minute
      eventLoopLagWarning: thresholds.eventLoopLagWarning ?? 100, // 100ms
      eventLoopLagCritical: thresholds.eventLoopLagCritical ?? 500, // 500ms
      ...thresholds,
    }
  }

  start(intervalMs = 1000): void {
    if (this.monitoringInterval) {
      this.logger.warn('Performance monitoring already started')
      return
    }

    this.logger.info('Starting performance monitoring')
    this.previousCpu = process.cpuUsage()

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics()
    }, intervalMs)

    // Prevent the interval from keeping the process alive
    this.monitoringInterval.unref()
  }

  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval as NodeJS.Timeout)
      this.monitoringInterval = undefined
      this.logger.info('Performance monitoring stopped')
    }
  }

  mark(name: string, metadata?: Record<string, unknown>): void {
    const mark: PerformanceMark = {
      name,
      startTime: performance.now(),
      metadata,
    }

    this.marks.set(name, mark)
  }

  measure(name: string): number | undefined {
    const mark = this.marks.get(name)
    if (!mark) {
      this.logger.warn(`Performance mark '${name}' not found`)
      return undefined
    }

    const endTime = performance.now()
    const duration = endTime - mark.startTime

    mark.endTime = endTime
    mark.duration = duration

    this.emitPerformanceEvent('performance.measure', {
      name,
      duration,
      metadata: mark.metadata,
    })

    return duration
  }

  startOperation(operationName: string): () => void {
    const startTime = performance.now()

    return () => {
      const duration = performance.now() - startTime
      this.emitPerformanceEvent('performance.operation', {
        operation: operationName,
        duration,
      })

      if (duration > 1000) {
        this.logger.warn(`Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`)
      }
    }
  }

  getMetrics(): PerformanceMetrics {
    const memory = this.getMemoryMetrics()
    const cpu = this.getCpuMetrics()

    return {
      memory,
      cpu,
      eventLoopLag: this.getEventLoopLag(),
      activeHandles: (process as unknown as { _getActiveHandles?: () => unknown[] })._getActiveHandles?.().length ?? 0,
      activeRequests: (process as unknown as { _getActiveRequests?: () => unknown[] })._getActiveRequests?.().length ?? 0,
    }
  }

  getMemoryMetrics(): MemoryMetrics {
    const mem = process.memoryUsage()
    return {
      rss: mem.rss,
      heapTotal: mem.heapTotal,
      heapUsed: mem.heapUsed,
      external: mem.external,
      arrayBuffers: mem.arrayBuffers,
    }
  }

  private getCpuMetrics(): { user: number; system: number } {
    const usage = process.cpuUsage(this.previousCpu)
    this.previousCpu = process.cpuUsage()

    return {
      user: usage.user / 1000, // Convert to ms
      system: usage.system / 1000,
    }
  }

  private getEventLoopLag(): number {
    let lag = 0
    const start = performance.now()

    setImmediate(() => {
      lag = performance.now() - start
    })

    return lag
  }

  private collectMetrics(): void {
    const metrics = this.getMetrics()

    // Track memory history
    const heapUsedMB = metrics.memory.heapUsed / 1024 / 1024
    this.memoryHistory.push(heapUsedMB)

    if (this.memoryHistory.length > this.maxHistorySize) {
      this.memoryHistory.shift()
    }

    // Check thresholds
    this.checkMemoryThresholds(metrics.memory)
    this.checkHeapGrowth()
    this.checkEventLoopLag(metrics.eventLoopLag)

    // Emit metrics event
    this.emitPerformanceEvent('performance.metrics', {
      memory: {
        rss: Math.round(metrics.memory.rss / 1024 / 1024), // MB
        heapTotal: Math.round(metrics.memory.heapTotal / 1024 / 1024),
        heapUsed: Math.round(metrics.memory.heapUsed / 1024 / 1024),
        external: Math.round(metrics.memory.external / 1024 / 1024),
      },
      cpu: metrics.cpu,
      eventLoopLag: metrics.eventLoopLag,
      activeHandles: metrics.activeHandles,
      activeRequests: metrics.activeRequests,
    })

    // Store for future use if needed for delta calculations
    // this.previousMemory = metrics.memory
  }

  private checkMemoryThresholds(memory: MemoryMetrics): void {
    const heapUsedMB = memory.heapUsed / 1024 / 1024

    if (heapUsedMB > this.thresholds.memoryUsageCritical!) {
      this.logger.error(`Critical memory usage: ${heapUsedMB.toFixed(2)} MB`)
      this.emitPerformanceEvent('performance.alert', {
        type: 'memory_critical',
        value: heapUsedMB,
        threshold: this.thresholds.memoryUsageCritical,
      })
    } else if (heapUsedMB > this.thresholds.memoryUsageWarning!) {
      this.logger.warn(`High memory usage: ${heapUsedMB.toFixed(2)} MB`)
      this.emitPerformanceEvent('performance.alert', {
        type: 'memory_warning',
        value: heapUsedMB,
        threshold: this.thresholds.memoryUsageWarning,
      })
    }
  }

  private checkHeapGrowth(): void {
    if (this.memoryHistory.length < 60) return // Need at least 1 minute of data

    const recentMemory = this.memoryHistory.slice(-60)
    const oldMemory = recentMemory[0]
    const currentMemory = recentMemory[recentMemory.length - 1]
    const growthMB = currentMemory - oldMemory

    if (growthMB > this.thresholds.heapGrowthRate!) {
      this.logger.warn(`High heap growth rate: ${growthMB.toFixed(2)} MB/minute`)
      this.emitPerformanceEvent('performance.alert', {
        type: 'heap_growth',
        value: growthMB,
        threshold: this.thresholds.heapGrowthRate,
      })

      // Suggest garbage collection if growth is excessive
      if (global.gc && growthMB > this.thresholds.heapGrowthRate! * 2) {
        this.logger.info('Triggering garbage collection due to high heap growth')
        global.gc()
      }
    }
  }

  private checkEventLoopLag(lag: number): void {
    if (lag > this.thresholds.eventLoopLagCritical!) {
      this.logger.error(`Critical event loop lag: ${lag.toFixed(2)}ms`)
      this.emitPerformanceEvent('performance.alert', {
        type: 'event_loop_critical',
        value: lag,
        threshold: this.thresholds.eventLoopLagCritical,
      })
    } else if (lag > this.thresholds.eventLoopLagWarning!) {
      this.logger.warn(`Event loop lag: ${lag.toFixed(2)}ms`)
      this.emitPerformanceEvent('performance.alert', {
        type: 'event_loop_warning',
        value: lag,
        threshold: this.thresholds.eventLoopLagWarning,
      })
    }
  }

  private emitPerformanceEvent(eventType: string, data: unknown): void {
    if (!this.eventBus) return

    const typeMap: Record<string, string> = {
      'performance.metrics': 'system.performance.metrics',
      'performance.alert': 'system.performance.alert',
      'performance.measure': 'system.performance.measure',
      'performance.operation': 'system.performance.operation'
    }

    const fullType = typeMap[eventType]
    if (fullType) {
      this.eventBus.emit({
        type: fullType as any,
        payload: data as any,
      })
    }
  }

  detectMemoryLeaks(): Map<string, number> {
    const potentialLeaks = new Map<string, number>()

    // Check for increasing memory trend
    if (this.memoryHistory.length >= 30) {
      const recent = this.memoryHistory.slice(-30)
      let increasingCount = 0

      for (let i = 1; i < recent.length; i++) {
        if (recent[i] > recent[i - 1]) {
          increasingCount++
        }
      }

      const increaseRate = increasingCount / recent.length
      if (increaseRate > 0.8) {
        potentialLeaks.set('heap_trend', increaseRate)
      }
    }

    // Check for excessive external memory
    const metrics = this.getMetrics()
    const externalMB = metrics.memory.external / 1024 / 1024
    if (externalMB > 100) {
      potentialLeaks.set('external_memory', externalMB)
    }

    // Check for too many active handles
    if (metrics.activeHandles > 100) {
      potentialLeaks.set('active_handles', metrics.activeHandles)
    }

    if (potentialLeaks.size > 0) {
      this.logger.warn('Potential memory leaks detected', Object.fromEntries(potentialLeaks))
    }

    return potentialLeaks
  }
}