# Aidle Plugin SDK Guide

This document describes how to build and test local plugins against the Aidle runtime introduced in Phase 5.

## Getting Started

1. Install dependencies and start the desktop app in development mode:

   ```bash
   npm install
   npm run dev
   ```

2. Scaffold a new plugin inside `plugins-external/` using the helper script:

   ```bash
   npm run create:plugin com.example.counter "Counter Plugin"
   ```

   The script copies the template in `templates/plugin-basic/`, updates the manifest, and prints the target path.

3. Edit the generated `index.js`. The file is typed via `@aidle/plugin-sdk`, which re-exports the runtime interfaces (`PluginModule`, `PluginContext`, `TriggerDefinition`, etc.).

4. Restart the running Aidle instance or, while in dev mode, toggle the plugin via the renderer to reload it. Phase 5 still requires a manual reload; hot-module support is tracked for Phase 6.

## Variable Helpers

Plugins can access the new variable service through the action payloads forwarded by the rule engine. Every action invocation includes `__context`, exposing:

- `context.payload` – the original trigger payload
- `context.variables` – snapshots of `global`, `plugin`, and `rule` variable scopes
- `context.locals` – values produced by loops, scripts, or helper utilities

Rule authors can also add variable actions (`set`, `increment`, `reset`) directly from the rule editor.

## Writing Scripts

Script actions execute inside a locked-down Node `vm`. The sandbox includes:

- `context` – the same object passed to actions
- `variables` – scoped adapters with `get`, `set`, `increment`, `reset`
- `helpers.setLocal(name, value)` – store ad-hoc values for later actions in the same rule
- `console` – proxied to the Aidle logger

Scripts should be synchronous and must complete within the configured timeout (defaults to `1000ms`).

## Testing Plugins

- Use the mock triggers in `templates/plugin-basic/index.js` as a reference for emitting events via `context.emitTrigger`.
- Unit test plugin modules directly by importing them and calling lifecycle methods with a mocked `PluginContext`.
- Integration tests can run inside Vitest by instantiating `PluginSandbox` with the template module and asserting emitted triggers/actions.

## Directory Structure Recap

```
plugins-external/
  com.example.counter/
    manifest.json
    index.js
packages/
  plugin-sdk/
    src/index.ts     # type re-exports
templates/
  plugin-basic/
    manifest.json
    index.js
scripts/
  create-plugin.mjs  # scaffolding helper
```

## Next Steps

- Phase 6 will add hot-reload support for external plugins and CLI validation against the manifest schema.
- The SDK will gain published artifacts once the API surface stabilises.
