import { ipcMain } from 'electron'
import type { PerformanceMonitor } from '../core/performance-monitor'

export function registerPerformanceBridge(performanceMonitor: PerformanceMonitor) {
  ipcMain.handle('performance:getMetrics', async () => {
    try {
      return {
        success: true,
        data: performanceMonitor.getMetrics()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get performance metrics'
      }
    }
  })

  ipcMain.handle('performance:getMemoryMetrics', async () => {
    try {
      return {
        success: true,
        data: performanceMonitor.getMemoryMetrics()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get memory metrics'
      }
    }
  })

  ipcMain.handle('performance:detectMemoryLeaks', async () => {
    try {
      const leaks = performanceMonitor.detectMemoryLeaks()
      const leaksArray = Array.from(leaks.entries()).map(([key, value]) => ({
        indicator: key,
        value: value,
        // Infer trend based on the indicator and value
        trend: key === 'heap_trend' && value > 0.8 ? 'INCREASING' :
               key === 'heap_trend' && value < 0.3 ? 'DECREASING' : 'STABLE',
        samples: key === 'heap_trend' ? 30 : 1,
        growthRate: key === 'heap_trend' ? value * 10 : value // Estimate growth rate
      }))
      return {
        success: true,
        data: leaksArray
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to detect memory leaks'
      }
    }
  })
}