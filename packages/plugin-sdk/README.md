# Aidle Plugin SDK (Internal)

Shared type definitions and helpers for building Aidle plugins. These exports mirror the runtime contracts used by the host application so plugin authors can rely on rich TypeScript support when implementing triggers and actions.

## Usage

```ts
import type { PluginModule, PluginContext } from '@aidle/plugin-sdk'

const plugin: PluginModule = {
  manifest: {
    id: 'example.plugin',
    name: 'Example Plugin',
    version: '0.1.0',
    author: 'Aidle',
    main: 'index.js',
  },
  async initialize(context: PluginContext) {
    context.logger.info('Plugin initialized')
  },
  registerTriggers() {
    return []
  },
  registerActions() {
    return []
  },
  async startListening() {},
  async stopListening() {},
  async executeAction() {},
  async destroy() {},
}

export default plugin
```

> The SDK is currently an internal workspace package; publishing instructions will follow once the API stabilises.
