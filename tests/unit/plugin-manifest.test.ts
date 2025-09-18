import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { describe, expect, it } from 'vitest'
import { pluginManifestSchema } from '@shared/plugins/manifest-schema'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)
const validate = ajv.compile(pluginManifestSchema)

describe('plugin manifest schema', () => {
  it('accepts a valid manifest', () => {
    const manifest = {
      id: 'demo-plugin',
      name: 'Demo Plugin',
      version: '1.0.0',
      author: 'Test',
      main: 'index.js',
      triggers: [{ id: 'example.trigger', name: 'Example Trigger' }],
      actions: [{ id: 'example.action', name: 'Example Action' }],
    }

    expect(validate(manifest)).toBe(true)
  })

  it('rejects manifest with invalid version number', () => {
    const manifest = {
      id: 'invalid-plugin',
      name: 'Invalid Plugin',
      version: 'not-semver',
      author: 'Test',
      main: 'index.js',
    }

    expect(validate(manifest)).toBe(false)
    expect(validate.errors?.map((error) => error.message)).toContain('must match pattern "^\\d+\\.\\d+\\.\\d+$"')
  })
})
