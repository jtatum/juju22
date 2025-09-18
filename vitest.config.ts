import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.ts'],
    exclude: ['tests/e2e/**'],
    coverage: {
      reporter: ['text', 'json-summary', 'html'],
      provider: 'v8',
      all: false,
    },
  },
  resolve: {
    alias: {
      '@main': path.resolve(__dirname, 'src/main'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@plugins': path.resolve(__dirname, 'src/plugins'),
      electron: path.resolve(__dirname, 'tests/mocks/electron.ts'),
      'better-sqlite3': path.resolve(__dirname, 'tests/mocks/better-sqlite3.ts'),
      'electron-store': path.resolve(__dirname, 'tests/mocks/electron-store.ts'),
    },
  },
})
