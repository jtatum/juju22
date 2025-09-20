import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, expect, it, vi } from 'vitest'
import { PluginManager } from '@main/core/plugin-manager'
import { EventBus } from '@main/core/event-bus'
import { DataStores } from '@main/core/storage'
import type { Logger } from '@main/core/logger'

const createMockLogger = (): Logger =>
  ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as Logger)

const createTestPlugin = (
  root: string,
  manifestOverrides: Record<string, unknown> = {},
  moduleBody?: string,
) => {
  const pluginRoot = join(root, 'demo-plugin')
  mkdirSync(pluginRoot, { recursive: true })
  const manifest = {
    id: 'demo-plugin',
    name: 'Demo Plugin',
    version: '0.0.1',
    author: 'Juju22',
    main: 'index.js',
    triggers: [{ id: 'demo.trigger', name: 'Demo Trigger' }],
    actions: [{ id: 'demo.action', name: 'Demo Action' }],
    ...manifestOverrides,
  }
  writeFileSync(join(pluginRoot, 'manifest.json'), JSON.stringify(manifest, null, 2))
  const implementation =
    moduleBody ?? `const manifest = require('./manifest.json')

module.exports = {
  manifest,
  async initialize(ctx) {
    ctx.storage.config.set('booted', true)
    ctx.emitStatus({ state: 'connected', message: 'ready' })
  },
  registerTriggers() { return manifest.triggers },
  registerActions() { return manifest.actions },
  async startListening() {},
  async stopListening() {},
  async executeAction() {},
  async destroy() {},
}
`

  writeFileSync(join(pluginRoot, 'index.js'), implementation)
}

describe('PluginManager', () => {
  it('loads plugins from filesystem', async () => {
    const root = mkdtempSync(join(tmpdir(), 'juju22-plugin-'))
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
        createMockLogger(),
      )

      await manager.loadPlugins()
      const loaded = manager.getPlugin('demo-plugin')
      expect(loaded).toBeDefined()
      expect(loaded?.triggers).toHaveLength(1)
      expect(loaded?.actions).toHaveLength(1)
      expect(manager.getStatus('demo-plugin')).toBeDefined()
      const configSnapshot = manager.getConfig('demo-plugin')
      expect(configSnapshot).toBeTypeOf('object')

      const updated = manager.updateConfig('demo-plugin', { foo: 'bar' })
      expect(updated.foo).toBe('bar')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('throws on invalid plugin manifest', async () => {
    const root = mkdtempSync(join(tmpdir(), 'juju22-plugin-invalid-'))
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
        createMockLogger(),
      )

      await expect(manager.loadPlugins()).rejects.toThrow(/PluginManager encountered errors/)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('reports plugin errors through emitError', async () => {
    const root = mkdtempSync(join(tmpdir(), 'juju22-plugin-error-'))
    const externalDir = join(root, 'external')
    mkdirSync(externalDir, { recursive: true })


    const moduleBody = `const manifest = require('./manifest.json')

let pluginContext = null

module.exports = {
  manifest,
  async initialize(ctx) {
    pluginContext = ctx
    ctx.emitStatus({ state: 'connected', message: 'ready' })

    // Test emitError immediately
    if (ctx.emitError) {
      const error = new Error('Test connection failed')
      ctx.emitError(error, 'Failed to connect to test service')
    }
  },
  registerTriggers() { return manifest.triggers },
  registerActions() { return manifest.actions },
  async startListening() {},
  async stopListening() {},
  async executeAction(actionId, params) {},
  async destroy() {},
}
`
    createTestPlugin(root, {}, moduleBody)

    try {
      const eventBus = new EventBus()
      const logger = createMockLogger()
      const manager = new PluginManager(
        {
          builtInDirectory: root,
          externalDirectory: externalDir,
        },
        eventBus,
        new DataStores(),
        logger,
      )

      // Spy on eventBus to see if error events are emitted
      const emitSpy = vi.spyOn(eventBus, 'emit')

      await manager.loadPlugins()
      const plugin = manager.getPlugin('demo-plugin')
      expect(plugin).toBeDefined()

      // Check that an error event was emitted through the eventBus
      const errorEmitCall = emitSpy.mock.calls.find(
        call => call[0]?.type === 'system.error.reported'
      )

      expect(errorEmitCall).toBeDefined()
      if (errorEmitCall) {
        const errorReport = errorEmitCall[0].payload
        expect(errorReport.userMessage).toBe('Failed to connect to test service')
        expect(errorReport.context.pluginId).toBe('demo-plugin')
      }
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('allows manifest dependencies inside sandboxed plugins', async () => {
    const root = mkdtempSync(join(process.cwd(), 'juju22-plugin-deps-'))
    const externalDir = join(root, 'external')
    mkdirSync(externalDir, { recursive: true })
    createTestPlugin(
      root,
      {
        dependencies: { cron: '^2.4.4' },
      },
      `const manifest = require('./manifest.json')
const { CronJob } = require('cron')

module.exports = {
  manifest,
  async initialize(ctx) {
    ctx.emitStatus({ state: 'connected', message: 'cron-loaded' })
    new CronJob('* * * * *', () => {})
  },
  registerTriggers() { return manifest.triggers },
  registerActions() { return manifest.actions },
  async startListening() {},
  async stopListening() {},
  async executeAction() {},
  async destroy() {},
}
`,
    )

    try {
      const manager = new PluginManager(
        {
          builtInDirectory: root,
          externalDirectory: externalDir,
        },
        new EventBus(),
        new DataStores(),
        createMockLogger(),
      )

      await manager.loadPlugins()
      const plugin = manager.getPlugin('demo-plugin')
      expect(plugin).toBeDefined()
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
