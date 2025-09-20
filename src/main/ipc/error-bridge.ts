import { ipcMain, BrowserWindow } from 'electron'
import type { EventBus } from '../core/event-bus'
import type { ErrorReporter } from '../core/error-reporter'
import type { ErrorReport } from '../core/error-reporter'
import { ErrorCategory } from '../core/error-reporter'

export class ErrorBridge {
  constructor(
    private readonly eventBus: EventBus,
    private readonly errorReporter: ErrorReporter,
  ) {
    this.setupHandlers()
    this.setupEventListeners()
  }

  private setupHandlers() {
    // Get error history
    ipcMain.handle('errors:getHistory', async (_event, category?: ErrorCategory, limit?: number) => {
      return this.errorReporter.getErrorHistory(category, limit)
    })

    // Get error statistics
    ipcMain.handle('errors:getStatistics', async () => {
      return this.errorReporter.getErrorStatistics()
    })

    // Clear error history
    ipcMain.handle('errors:clearHistory', async () => {
      this.errorReporter.clearErrorHistory()
    })
  }

  private setupEventListeners() {
    // Forward relevant events to renderer using wildcard listener
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.eventBus.onAll((event: any) => {
      if (event.type === 'system.error.reported') {
        const report = event.payload as ErrorReport

        // Send to all renderer windows
        for (const window of BrowserWindow.getAllWindows()) {
          window.webContents.send('error:reported', {
            id: report.id,
            message: report.error.message,
            code: report.error.code,
            userMessage: report.userMessage,
            suggestions: report.suggestions,
            category: report.context.category,
            severity: report.context.severity,
            recoverable: report.recoverable,
            timestamp: report.timestamp,
          })
        }
      }

      if (event.type === 'system.error.recovered') {
        const report = event.payload as ErrorReport

        for (const window of BrowserWindow.getAllWindows()) {
          window.webContents.send('error:recovered', {
            id: report.id,
            message: 'Issue has been automatically resolved',
          })
        }
      }

      // Forward circuit breaker events
      if (event.type === 'system.circuit.opened') {
        const { name, failureCount } = event.payload as { name: string; failureCount: number }

        for (const window of BrowserWindow.getAllWindows()) {
          window.webContents.send('circuit:opened', {
            name,
            failureCount,
            message: `Service "${name}" is temporarily unavailable due to repeated failures`,
            suggestions: [
              'The system will automatically retry in a few moments',
              'Check your network connection',
              'Verify the service is running',
            ],
          })
        }
      }

      if (event.type === 'system.circuit.closed') {
        const { name } = event.payload as { name: string }

        for (const window of BrowserWindow.getAllWindows()) {
          window.webContents.send('circuit:closed', {
            name,
            message: `Service "${name}" has recovered and is now available`,
          })
        }
      }
    })
  }
}