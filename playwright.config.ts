import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { outputFolder: 'reports/playwright' }]],
  use: {
    headless: true,
    screenshot: 'on',
    video: 'retain-on-failure',
  },
})
