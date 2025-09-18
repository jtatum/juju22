import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, expect, it, vi } from 'vitest'
import { PluginManager } from '@main/core/plugin-manager'
import { EventBus } from '@main/core/event-bus'
import { DataStores } from '@main/core/storage'
import type { Logger } from '@main/core/logger'

const setupPlugin = (root: string) => {
  const pluginRoot = join(root, 'event-plugin')
  mkdirSync(pluginRoot, { recursive: true })
  writeFileSync(
    join(pluginRoot, 'manifest.json'),
    JSON.stringify(
      {
        id: 'event-plugin',
        name: 'Event Plugin',
        version: '0.0.1',
        author: 'Aidle',
        main: 'index.js',
        triggers: [{ id: 'event.trigger', name: 'Event Trigger' }],
        actions: [{ id: 'event.emit', name: 'Emit Event' }],
      },
      null,
      2,
    ),
  )
  writeFileSync(
    join(pluginRoot, 'index.js'),
    `const manifest = require('./manifest.json')

module.exports = {
  manifest,
  async initialize(context) {
    this.context = context
  },
  registerTriggers() { return manifest.triggers },
  registerActions() { return manifest.actions },
  async startListening() {},
  async stopListening() {},
  async executeAction() {
    this.context.emitTrigger('event.trigger', { fired: true })
  },
  async destroy() {},
}
`)
}

describe('Plugin event flow', () => {
  it('emits trigger events through the event bus', async () => {
    const root = mkdtempSync(join(tmpdir(), 'aidle-event-plugin-'))
    const externalDir = join(root, 'external')
    mkdirSync(externalDir, { recursive: true })
    setupPlugin(root)

    try {
      const eventBus = new EventBus()
      const stores = new DataStores()
      const manager = new PluginManager(
        {
          builtInDirectory: root,
          externalDirectory: externalDir,
        },
        eventBus,
        stores,
        createMockLogger(),
      )

      const events: unknown[] = []
      eventBus.onPluginTrigger((payload) => events.push(payload))

      await manager.loadPlugins()
      await manager.executeAction('event-plugin', 'event.emit', {})

      expect(events).toHaveLength(1)
      expect(events[0]).toMatchObject({ pluginId: 'event-plugin', triggerId: 'event.trigger' })
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
const createMockLogger = (): Logger =>
  ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as Logger)
