import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll } from 'vitest'
import { app } from './mocks/electron'

const tempUserData = mkdtempSync(join(tmpdir(), 'aidle-test-'))

app.getPath.mockReturnValue(tempUserData)

afterAll(() => {
  rmSync(tempUserData, { recursive: true, force: true })
})
