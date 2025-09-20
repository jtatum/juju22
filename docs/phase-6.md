# Phase 6: Performance & Reliability Features

## Overview

Phase 6 introduces critical performance monitoring, error handling, and reliability features to ensure Juju22 runs smoothly and provides excellent user experience.

## Performance Monitoring

### Usage

The `PerformanceMonitor` tracks memory usage, CPU utilization, and detects potential memory leaks.

```typescript
import { PerformanceMonitor } from '@main/core/performance-monitor'
import { EventBus } from '@main/core/event-bus'

const monitor = new PerformanceMonitor(eventBus)

// Start monitoring (checks every second by default)
monitor.start()

// Get current metrics
const metrics = monitor.getMetrics()
// Returns: { memory, cpu, eventLoopLag, activeHandles, activeRequests }

// Track specific operations
const endOperation = monitor.startOperation('database-query')
// ... perform operation ...
endOperation() // Automatically measures duration

// Detect memory leaks
const potentialLeaks = monitor.detectMemoryLeaks()
// Returns Map of leak indicators with growth rates

// Stop monitoring
monitor.stop()
```

### Memory Leak Detection

The monitor tracks memory usage over time and identifies potential leaks by:
- Monitoring heap growth trends over 30+ samples
- Calculating growth rate in MB/minute
- Flagging consistent upward trends exceeding thresholds

### Performance Events

The monitor emits events through the EventBus:
- `system.performance.metrics` - Regular metrics updates
- `system.performance.alert` - Threshold violations
- `system.performance.operation` - Operation completions

## Circuit Breaker Pattern

### Purpose

Prevents cascading failures by temporarily blocking calls to failing services.

### Usage

```typescript
import { CircuitBreakerManager } from '@main/core/circuit-breaker'

const manager = new CircuitBreakerManager(logger, eventBus)

// Get or create a circuit breaker
const breaker = manager.getBreaker('external-api', {
  failureThreshold: 5,      // Open after 5 failures
  successThreshold: 2,      // Close after 2 successes in half-open
  resetTimeout: 30000,      // Try again after 30 seconds
  timeout: 10000            // Request timeout
})

// Execute with circuit breaker protection
try {
  await breaker.execute(async () => {
    return await externalApiCall()
  })
} catch (error) {
  if (error.code === 'CIRCUIT_OPEN') {
    // Service temporarily unavailable
  }
}
```

### States

1. **CLOSED** - Normal operation, requests pass through
2. **OPEN** - Service is failing, requests are blocked
3. **HALF_OPEN** - Testing if service recovered

### UI Notifications

When circuits open/close, users receive notifications with:
- Service name and status
- Suggested actions
- Auto-recovery updates

## Error Reporter

### Features

- Automatic error categorization
- User-friendly messages
- Recovery suggestions
- Error history tracking
- Auto-recovery attempts

### Usage

```typescript
import { ErrorReporter } from '@main/core/error-reporter'

const reporter = new ErrorReporter(eventBus)

// Report an error
const report = reporter.report(error, {
  category: ErrorCategory.PLUGIN,
  pluginId: 'my-plugin',
  operation: 'initialization'
})

// Get error history
const history = reporter.getErrorHistory(ErrorCategory.NETWORK, 50)

// Get statistics
const stats = reporter.getErrorStatistics()
```

### Error Categories

- `NETWORK` - Connection issues
- `DATABASE` - Storage problems
- `PLUGIN` - Plugin failures
- `VALIDATION` - Invalid data
- `PERMISSION` - Access denied
- `CONFIGURATION` - Settings issues
- `SYSTEM` - General system errors

## Retry Manager

### Purpose

Automatically retries failed operations with exponential backoff and jitter.

### Profiles

```typescript
// Built-in profiles
RetryProfiles.API      // 3 attempts, 1-10s delays
RetryProfiles.DATABASE // 5 attempts, 100ms-5s delays
RetryProfiles.PLUGIN   // 2 attempts, 500ms-3s delays
RetryProfiles.NETWORK  // 4 attempts, 2-30s delays
```

### Usage

```typescript
import { RetryManager, RetryProfiles } from '@main/core/retry-manager'

const retryManager = new RetryManager(eventBus)

// Retry with profile
const result = await retryManager.executeWithRetry(
  'fetch-data',
  async () => await fetchData(),
  RetryProfiles.API
)

// Custom retry options
const customResult = await retryManager.executeWithRetry(
  'custom-operation',
  async () => await riskyOperation(),
  {
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
    shouldRetry: (error) => error.code !== 'FATAL'
  }
)
```

## Import/Export Manager

### Features

- Export rules to JSON/YAML
- Import rules with conflict detection
- Selective import/export
- Validation before import

### Usage

```typescript
// Export rules
const result = await importExportManager.exportRules('/path/to/rules.json', {
  format: 'json',
  includeDisabled: true,
  ruleIds: ['rule1', 'rule2'] // Optional: specific rules
})

// Import rules
const imported = await importExportManager.importRules('/path/to/rules.json', {
  mode: 'merge',        // or 'replace'
  skipExisting: true,   // Skip conflicting rules
  validateOnly: false   // Set true for dry run
})
```

## Backup Manager

### Features

- Compressed backups
- Scheduled automatic backups
- Point-in-time restoration
- Backup rotation

### Usage

```typescript
// Create backup
const backup = await backupManager.createBackup({
  compress: true,
  includeRules: true,
  includeVariables: true,
  includePluginConfigs: true,
  includeSettings: true
})

// Restore backup
const restored = await backupManager.restoreBackup('/path/to/backup', {
  overwrite: true,
  skipConflicts: false
})

// List available backups
const backups = await backupManager.listBackups()
```

## UI Components

### Notification System

Displays errors, warnings, and success messages with:
- Auto-dismiss timers
- Action suggestions
- Progress indicators
- Stacking for multiple notifications

### Settings Page

Access via Settings menu:
- Backup/restore controls
- Automatic backup scheduling
- Import/export rules
- Error history viewer

### Onboarding Wizard

First-time users see:
1. Welcome screen with feature overview
2. Plugin introduction
3. Sample rule creation
4. Getting started guide

## Best Practices

### Performance Monitoring

1. Start monitoring early in app lifecycle
2. Set appropriate thresholds based on your hardware
3. Review memory leak reports regularly
4. Track critical operations with markers

### Error Handling

1. Always provide context when reporting errors
2. Use appropriate error categories
3. Implement recovery strategies for critical paths
4. Monitor error statistics for patterns

### Circuit Breakers

1. Configure appropriate thresholds per service
2. Use different timeouts for different operations
3. Monitor circuit states in dashboards
4. Test failure scenarios

### Backups

1. Schedule automatic backups
2. Test restore procedures regularly
3. Keep multiple backup versions
4. Store backups in safe locations

## Event Reference

### System Events

```typescript
// Circuit breaker events
'system.circuit.opened'  // Service unavailable
'system.circuit.closed'  // Service recovered

// Error events
'system.error.reported'  // Error occurred
'system.error.recovered' // Error auto-recovered

// Performance events
'system.performance.metrics'    // Regular metrics
'system.performance.alert'      // Threshold exceeded
'system.performance.operation'  // Operation completed

// Retry events
'system.retry.attempt'    // Retry attempted
'system.retry.success'    // Retry succeeded
'system.retry.exhausted'  // All retries failed

// Backup events
'system.backup.created'   // Backup completed
'system.backup.restored'  // Restore completed
'system.backup.scheduled' // Next backup scheduled
```

## Troubleshooting

### High Memory Usage

1. Check `PerformanceMonitor.detectMemoryLeaks()`
2. Review operation history for long-running tasks
3. Check plugin memory consumption
4. Increase heap size if needed

### Circuit Breaker Opens Frequently

1. Review failure thresholds
2. Check network stability
3. Increase timeout values
4. Review service health

### Failed Imports

1. Validate import file format
2. Check for rule ID conflicts
3. Review validation errors
4. Use dry-run mode first

### Backup Failures

1. Check disk space
2. Verify write permissions
3. Review backup directory access
4. Check compression settings