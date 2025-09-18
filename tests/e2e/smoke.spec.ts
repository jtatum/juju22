import { test } from '@playwright/test'

test.skip('Electron app launches to dashboard', async () => {
  test.info().annotations.push({ type: 'todo', description: 'Launch packaged Electron app and assert dashboard renders' })
})
