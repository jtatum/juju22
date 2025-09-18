import type { JSONSchemaType } from 'ajv'
import type { PluginManifest } from './types'

const schema = {
  $id: 'Aidle.PluginManifest',
  type: 'object',
  required: ['id', 'name', 'version', 'author', 'main'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', pattern: '^[a-z0-9-]+$' },
    name: { type: 'string' },
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    author: { type: 'string' },
    description: { type: 'string' },
    homepage: { type: 'string', format: 'uri' },
    license: { type: 'string' },
    main: { type: 'string' },
    triggers: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name'],
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          schema: { type: 'object', additionalProperties: true },
        },
      },
    },
    actions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name'],
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          schema: { type: 'object', additionalProperties: true },
        },
      },
    },
    configSchema: { type: 'object', additionalProperties: true },
    permissions: {
      type: 'array',
      items: { type: 'string' },
    },
    dependencies: {
      type: 'object',
      required: [],
      additionalProperties: { type: 'string' },
    },
  },
} as const

export const pluginManifestSchema = schema as unknown as JSONSchemaType<PluginManifest>
