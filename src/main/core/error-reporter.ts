import type { EventBus } from './event-bus'
import type { Logger } from './logger'
import { createLogger } from './logger'

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  PLUGIN = 'plugin',
  NETWORK = 'network',
  DATABASE = 'database',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  CONFIGURATION = 'configuration',
  SYSTEM = 'system',
  UNKNOWN = 'unknown',
}

export interface ErrorContext {
  category: ErrorCategory
  severity: ErrorSeverity
  operation?: string
  pluginId?: string
  ruleId?: string
  userId?: string
  metadata?: Record<string, unknown>
}

export interface ErrorReport {
  id: string
  timestamp: number
  error: {
    message: string
    code?: string
    stack?: string
  }
  context: ErrorContext
  userMessage: string
  suggestions: string[]
  recoverable: boolean
  autoRecoveryAttempted: boolean
}

export interface ErrorRecoveryStrategy {
  canRecover(error: unknown, context: ErrorContext): boolean
  recover(error: unknown, context: ErrorContext): Promise<boolean>
  getSuggestions(error: unknown, context: ErrorContext): string[]
}

export class ErrorReporter {
  private readonly logger: Logger
  private readonly eventBus?: EventBus
  private readonly errorHistory: ErrorReport[] = []
  private readonly maxHistorySize = 100
  private readonly recoveryStrategies = new Map<ErrorCategory, ErrorRecoveryStrategy>()

  constructor(eventBus?: EventBus, logger?: Logger) {
    this.eventBus = eventBus
    this.logger = logger ?? createLogger('ErrorReporter')
    this.registerDefaultRecoveryStrategies()
  }

  report(error: unknown, context: Partial<ErrorContext> = {}): ErrorReport {
    const fullContext = this.buildContext(error, context)
    const report = this.createReport(error, fullContext)

    this.logger.error(`Error reported: ${report.userMessage}`, {
      error,
      context: fullContext,
    })

    // Add to history
    this.errorHistory.push(report)
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift()
    }

    // Emit error event
    this.emitErrorEvent(report)

    // Attempt auto-recovery if possible
    if (report.recoverable) {
      void this.attemptRecovery(error, fullContext, report)
    }

    return report
  }

  private buildContext(error: unknown, partial: Partial<ErrorContext>): ErrorContext {
    return {
      category: partial.category ?? this.categorizeError(error),
      severity: partial.severity ?? this.assessSeverity(error, partial.category),
      operation: partial.operation,
      pluginId: partial.pluginId,
      ruleId: partial.ruleId,
      userId: partial.userId,
      metadata: partial.metadata,
    }
  }

  private createReport(error: unknown, context: ErrorContext): ErrorReport {
    const errorObj = this.normalizeError(error)
    const userMessage = this.generateUserMessage(errorObj, context)
    const suggestions = this.generateSuggestions(error, context)
    const recoverable = this.isRecoverable(error, context)

    return {
      id: this.generateErrorId(),
      timestamp: Date.now(),
      error: errorObj,
      context,
      userMessage,
      suggestions,
      recoverable,
      autoRecoveryAttempted: false,
    }
  }

  private normalizeError(error: unknown): { message: string; code?: string; stack?: string } {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: (error as Error & { code?: string }).code,
        stack: error.stack,
      }
    }

    if (typeof error === 'string') {
      return { message: error }
    }

    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>
      return {
        message: errorObj.message ? String(errorObj.message) : String(error),
        code: errorObj.code ? String(errorObj.code) : undefined,
        stack: errorObj.stack ? String(errorObj.stack) : undefined,
      }
    }

    return { message: String(error) }
  }

  private categorizeError(error: unknown): ErrorCategory {
    const message = this.getErrorMessage(error).toLowerCase()
    const code = this.getErrorCode(error)?.toLowerCase()

    // Network errors
    if (
      code?.includes('econnrefused') ||
      code?.includes('etimedout') ||
      code?.includes('enotfound') ||
      message.includes('network') ||
      message.includes('connection')
    ) {
      return ErrorCategory.NETWORK
    }

    // Database errors
    if (
      code?.includes('sqlite') ||
      message.includes('database') ||
      message.includes('sql')
    ) {
      return ErrorCategory.DATABASE
    }

    // Plugin errors
    if (message.includes('plugin') || code?.includes('plugin')) {
      return ErrorCategory.PLUGIN
    }

    // Validation errors
    if (
      message.includes('invalid') ||
      message.includes('validation') ||
      message.includes('schema')
    ) {
      return ErrorCategory.VALIDATION
    }

    // Permission errors
    if (
      code?.includes('eacces') ||
      code?.includes('eperm') ||
      message.includes('permission') ||
      message.includes('unauthorized')
    ) {
      return ErrorCategory.PERMISSION
    }

    // Configuration errors
    if (message.includes('config') || message.includes('setting')) {
      return ErrorCategory.CONFIGURATION
    }

    return ErrorCategory.UNKNOWN
  }

  private assessSeverity(error: unknown, category?: ErrorCategory): ErrorSeverity {
    const message = this.getErrorMessage(error).toLowerCase()

    // Critical errors
    if (
      message.includes('crash') ||
      message.includes('fatal') ||
      message.includes('critical') ||
      category === ErrorCategory.DATABASE
    ) {
      return ErrorSeverity.CRITICAL
    }

    // High severity
    if (
      category === ErrorCategory.PERMISSION ||
      message.includes('failed') ||
      message.includes('error')
    ) {
      return ErrorSeverity.HIGH
    }

    // Medium severity
    if (
      category === ErrorCategory.NETWORK ||
      category === ErrorCategory.PLUGIN
    ) {
      return ErrorSeverity.MEDIUM
    }

    // Low severity
    return ErrorSeverity.LOW
  }

  private generateUserMessage(error: { message: string; code?: string }, context: ErrorContext): string {
    // Check for custom message in metadata
    if (context.metadata?.customMessage) {
      return String(context.metadata.customMessage)
    }

    const categoryMessages: Record<ErrorCategory, (error: { message: string; code?: string }) => string> = {
      [ErrorCategory.NETWORK]: () => 'Network connection issue detected. Please check your internet connection.',
      [ErrorCategory.DATABASE]: () => 'Database operation failed. The application may need to be restarted.',
      [ErrorCategory.PLUGIN]: () => `Plugin ${context.pluginId || 'unknown'} encountered an error.`,
      [ErrorCategory.VALIDATION]: () => 'Invalid data provided. Please check your input.',
      [ErrorCategory.PERMISSION]: () => 'Permission denied. Please check your access rights.',
      [ErrorCategory.CONFIGURATION]: () => 'Configuration error detected. Please review your settings.',
      [ErrorCategory.SYSTEM]: () => 'System error occurred. Please try again.',
      [ErrorCategory.UNKNOWN]: () => `An unexpected error occurred: ${error.message}`,
    }

    return categoryMessages[context.category](error)
  }

  private generateSuggestions(error: unknown, context: ErrorContext): string[] {
    const strategy = this.recoveryStrategies.get(context.category)
    if (strategy) {
      return strategy.getSuggestions(error, context)
    }

    // Default suggestions
    const suggestions: string[] = []

    switch (context.category) {
      case ErrorCategory.NETWORK:
        suggestions.push('Check your internet connection')
        suggestions.push('Verify the service is accessible')
        suggestions.push('Try again in a few moments')
        break

      case ErrorCategory.DATABASE:
        suggestions.push('Restart the application')
        suggestions.push('Check available disk space')
        suggestions.push('Verify database file integrity')
        break

      case ErrorCategory.PLUGIN:
        suggestions.push(`Disable and re-enable the plugin`)
        suggestions.push('Check plugin configuration')
        suggestions.push('Update the plugin to the latest version')
        break

      case ErrorCategory.VALIDATION:
        suggestions.push('Review the input data format')
        suggestions.push('Check for required fields')
        suggestions.push('Ensure data types are correct')
        break

      case ErrorCategory.PERMISSION:
        suggestions.push('Run the application with appropriate permissions')
        suggestions.push('Check file/folder access rights')
        suggestions.push('Verify user credentials')
        break

      case ErrorCategory.CONFIGURATION:
        suggestions.push('Review application settings')
        suggestions.push('Reset to default configuration')
        suggestions.push('Check configuration file syntax')
        break

      default:
        suggestions.push('Try the operation again')
        suggestions.push('Restart the application if the issue persists')
        suggestions.push('Check the logs for more details')
    }

    return suggestions
  }

  private isRecoverable(error: unknown, context: ErrorContext): boolean {
    const strategy = this.recoveryStrategies.get(context.category)
    if (strategy) {
      return strategy.canRecover(error, context)
    }

    // Default recoverability logic
    return (
      context.category === ErrorCategory.NETWORK ||
      context.category === ErrorCategory.PLUGIN ||
      (context.category === ErrorCategory.DATABASE && context.severity !== ErrorSeverity.CRITICAL)
    )
  }

  private async attemptRecovery(
    error: unknown,
    context: ErrorContext,
    report: ErrorReport,
  ): Promise<void> {
    const strategy = this.recoveryStrategies.get(context.category)
    if (!strategy) return

    try {
      this.logger.info(`Attempting auto-recovery for error: ${report.id}`)
      report.autoRecoveryAttempted = true

      const recovered = await strategy.recover(error, context)

      if (recovered) {
        this.logger.info(`Successfully recovered from error: ${report.id}`)
        this.emitErrorEvent({
          ...report,
          type: 'error.recovered',
        })
      } else {
        this.logger.warn(`Failed to recover from error: ${report.id}`)
      }
    } catch (recoveryError) {
      this.logger.error(`Error during recovery attempt: ${report.id}`, recoveryError)
    }
  }

  registerRecoveryStrategy(category: ErrorCategory, strategy: ErrorRecoveryStrategy): void {
    this.recoveryStrategies.set(category, strategy)
  }

  private registerDefaultRecoveryStrategies(): void {
    // Network recovery strategy
    this.registerRecoveryStrategy(ErrorCategory.NETWORK, {
      canRecover: () => true,
      recover: async () => {
        // Wait a moment and retry
        await new Promise(resolve => setTimeout(resolve, 1000))
        return false // Let retry manager handle actual retry
      },
      getSuggestions: () => [
        'Check your network connection',
        'The system will automatically retry',
        'Verify firewall settings',
      ],
    })

    // Plugin recovery strategy
    this.registerRecoveryStrategy(ErrorCategory.PLUGIN, {
      canRecover: (_, context) => !!context.pluginId,
      recover: async () => {
        // Plugin manager should handle plugin restart
        return false
      },
      getSuggestions: (_, context) => [
        `Plugin ${context.pluginId} will be automatically restarted`,
        'Check plugin logs for details',
        'Update plugin configuration if needed',
      ],
    })
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    if (error && typeof error === 'object' && 'message' in error) {
      const errorObj = error as Record<string, unknown>
      return String(errorObj.message)
    }
    return String(error)
  }

  private getErrorCode(error: unknown): string | undefined {
    if (error && typeof error === 'object' && 'code' in error) {
      const errorObj = error as Record<string, unknown>
      return String(errorObj.code)
    }
    return undefined
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private emitErrorEvent(report: ErrorReport | (ErrorReport & { type: string })): void {
    if (!this.eventBus) return

    const isRecovered = 'type' in report && report.type === 'error.recovered'

    this.eventBus.emit({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: isRecovered ? 'system.error.recovered' : 'system.error.reported' as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload: report as any,
    })
  }

  getErrorHistory(category?: ErrorCategory, limit = 50): ErrorReport[] {
    let history = [...this.errorHistory]

    if (category) {
      history = history.filter(report => report.context.category === category)
    }

    return history.slice(-limit).reverse()
  }

  clearErrorHistory(): void {
    this.errorHistory.length = 0
    this.logger.info('Error history cleared')
  }

  getErrorStatistics(): Record<ErrorCategory, number> {
    const stats: Record<ErrorCategory, number> = {
      [ErrorCategory.PLUGIN]: 0,
      [ErrorCategory.NETWORK]: 0,
      [ErrorCategory.DATABASE]: 0,
      [ErrorCategory.VALIDATION]: 0,
      [ErrorCategory.PERMISSION]: 0,
      [ErrorCategory.CONFIGURATION]: 0,
      [ErrorCategory.SYSTEM]: 0,
      [ErrorCategory.UNKNOWN]: 0,
    }

    for (const report of this.errorHistory) {
      stats[report.context.category]++
    }

    return stats
  }
}