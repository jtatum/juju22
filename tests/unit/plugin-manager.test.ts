import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, expect, it } from 'vitest'
import { PluginManager } from '@main/core/plugin-manager'
import { EventBus } from '@main/core/event-bus'
import { DataStores } from '@main/core/storage'

const createTestPlugin = (root: string, manifestOverrides: Record<string, unknown> = {}) => {
  const pluginRoot = join(root, 'demo-plugin')
  mkdirSync(pluginRoot, { recursive: true })
  const manifest = {
    id: 'demo-plugin',
    name: 'Demo Plugin',
    version: '0.0.1',
    author: 'Aidle',
    main: 'index.js',
    triggers: [{ id: 'demo.trigger', name: 'Demo Trigger' }],
    actions: [{ id: 'demo.action', name: 'Demo Action' }],
    ...manifestOverrides,
  }
  writeFileSync(join(pluginRoot, 'manifest.json'), JSON.stringify(manifest, null, 2))
  writeFileSync(
    join(pluginRoot, 'index.js'),
    `const manifest = require('./manifest.json')

module.exports = {
  manifest,
  async initialize() {},
  registerTriggers() { return manifest.triggers },
  registerActions() { return manifest.actions },
  async startListening() {},
  async stopListening() {},
  async executeAction() {},
  async destroy() {},
}
`,
  )
}

describe('PluginManager', () => {
  it('loads plugins from filesystem', async () => {
    const root = mkdtempSync(join(tmpdir(), 'aidle-plugin-'))
    const externalDir = join(root, 'external')
    mkdirSync(externalDir, { recursive: true })
    createTestPlugin(root)

    try {
      const manager = new PluginManager(
        {
          builtInDirectory: root,
          externalDirectory: externalDir,
        },
        new EventBus(),
        new DataStores(),
      )

      await manager.loadPlugins()
      const loaded = manager.getPlugin('demo-plugin')
      expect(loaded).toBeDefined()
      expect(loaded?.triggers).toHaveLength(1)
      expect(loaded?.actions).toHaveLength(1)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('throws on invalid plugin manifest', async () => {
    const root = mkdtempSync(join(tmpdir(), 'aidle-plugin-invalid-'))
    const externalDir = join(root, 'external')
    mkdirSync(externalDir, { recursive: true })
    createTestPlugin(root, { version: 'not-a-semver' })

    try {
      const manager = new PluginManager(
        {
          builtInDirectory: root,
          externalDirectory: externalDir,
        },
        new EventBus(),
        new DataStores(),
      )

      await expect(manager.loadPlugins()).rejects.toThrow(/PluginManager encountered errors/)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
