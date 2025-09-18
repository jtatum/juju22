import type { JSONSchemaType } from 'ajv'
import type { PluginManifest } from './types'

export const pluginManifestSchema: JSONSchemaType<PluginManifest> = {
  $id: 'Aidle.PluginManifest',
  type: 'object',
  required: ['id', 'name', 'version', 'author', 'main'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', pattern: '^[a-z0-9-]+$' },
    name: { type: 'string' },
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    author: { type: 'string' },
    description: { type: 'string', nullable: true },
    homepage: { type: 'string', format: 'uri', nullable: true },
    license: { type: 'string', nullable: true },
    main: { type: 'string' },
    triggers: {
      type: 'array',
      nullable: true,
      items: {
        type: 'object',
        required: ['id', 'name'],
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          schema: { type: 'object', nullable: true, additionalProperties: true },
        },
      },
    },
    actions: {
      type: 'array',
      nullable: true,
      items: {
        type: 'object',
        required: ['id', 'name'],
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          schema: { type: 'object', nullable: true, additionalProperties: true },
        },
      },
    },
    configSchema: { type: 'object', nullable: true, additionalProperties: true },
    permissions: {
      type: 'array',
      nullable: true,
      items: { type: 'string' },
    },
    dependencies: {
      type: 'object',
      nullable: true,
      additionalProperties: { type: 'string' },
    },
  },
}
