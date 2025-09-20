// System events for Phase 6 components

export interface RetryEvent {
  type: 'retry.success' | 'retry.attempt' | 'retry.exhausted' | 'retry.aborted'
  operation: string
  attempt?: number
  totalAttempts?: number
  delay?: number
  duration?: number
  error?: string
}

export interface PerformanceMetricsEvent {
  memory: {
    rss: number
    heapTotal: number
    heapUsed: number
    external: number
  }
  cpu: {
    user: number
    system: number
  }
  eventLoopLag: number
  activeHandles: number
  activeRequests: number
}

export interface PerformanceAlertEvent {
  type: 'memory_warning' | 'memory_critical' | 'heap_growth' | 'event_loop_warning' | 'event_loop_critical'
  value: number
  threshold: number
}

export interface PerformanceMeasureEvent {
  name: string
  duration: number
  metadata?: Record<string, unknown>
}

export interface PerformanceOperationEvent {
  operation: string
  duration: number
}

export interface ErrorReportEvent {
  id: string
  timestamp: number
  error: {
    message: string
    code?: string
    stack?: string
  }
  context: {
    category: string
    severity: string
    operation?: string
    pluginId?: string
    ruleId?: string
    metadata?: Record<string, unknown>
  }
  userMessage: string
  suggestions: string[]
  recoverable: boolean
  autoRecoveryAttempted: boolean
}

export interface ExportImportEvent {
  type: 'export.success' | 'export.failed' | 'import.complete' | 'import.failed'
  filePath?: string
  ruleCount?: number
  format?: string
  imported?: number
  skipped?: number
  failed?: number
  error?: string
  mode?: string
  validateOnly?: boolean
}

export interface BackupEvent {
  type: 'backup.created' | 'backup.failed' | 'backup.restored' | 'backup.restore_failed'
  filePath?: string
  size?: number
  compressed?: boolean
  contents?: {
    rules?: number
    variables?: number
    pluginConfigs?: number
    settings?: boolean
  }
  restored?: {
    rules: number
    variables: number
    pluginConfigs: number
    settings: boolean
  }
  conflicts?: number
  error?: string
  dryRun?: boolean
}

export type SystemEvent =
  | { type: 'system.retry'; payload: RetryEvent }
  | { type: 'system.performance.metrics'; payload: PerformanceMetricsEvent }
  | { type: 'system.performance.alert'; payload: PerformanceAlertEvent }
  | { type: 'system.performance.measure'; payload: PerformanceMeasureEvent }
  | { type: 'system.performance.operation'; payload: PerformanceOperationEvent }
  | { type: 'system.error.reported'; payload: ErrorReportEvent }
  | { type: 'system.error.recovered'; payload: ErrorReportEvent & { type: 'error.recovered' } }
  | { type: 'system.export'; payload: ExportImportEvent }
  | { type: 'system.import'; payload: ExportImportEvent }
  | { type: 'system.backup'; payload: BackupEvent }