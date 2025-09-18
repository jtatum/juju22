import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, vi } from 'vitest'
import { app } from './mocks/electron'

vi.mock('@main/core/logger', () => import('./mocks/logger'))

const tempUserData = mkdtempSync(join(tmpdir(), 'aidle-test-'))

app.getPath.mockReturnValue(tempUserData)

afterAll(() => {
  rmSync(tempUserData, { recursive: true, force: true })
})
