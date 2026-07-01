# Contributing to Juju22

Thanks for your interest in contributing! Juju22 is a **plugin-first**
automation and integration platform, so most contributions fall into one of two
buckets:

1. **Building a plugin** against the runtime (the most common case).
2. **Improving the core** (Electron main process, React renderer, or the
   `@juju22/plugin-sdk`).

This guide covers both.

## Prerequisites

- **Node.js 24** (see [`.nvmrc`](./.nvmrc); run `nvm use` to match).
- npm (bundled with Node).

## Getting Started

```bash
npm install
npm run dev
```

- The renderer runs with Vite hot-module reload.
- The Electron main process reloads automatically during development.

> Note: `postinstall` runs `electron-rebuild` to compile the native
> `better-sqlite3` binding against the bundled Electron version. Re-run
> `npm install` if you change Electron or Node versions.

## Building a Plugin (plugin-first workflow)

Plugins are the primary extension point. The typed SDK lives in
[`packages/plugin-sdk`](./packages/plugin-sdk) and is published locally as
`@juju22/plugin-sdk`, which re-exports the runtime interfaces (`PluginModule`,
`PluginContext`, `TriggerDefinition`, etc.).

1. Scaffold a new plugin from the built-in template:

   ```bash
   npm run create:plugin com.example.counter "Counter Plugin"
   ```

   This copies [`templates/plugin-basic/`](./templates/plugin-basic) into
   `plugins-external/<plugin-id>/`, updates the manifest, and prints the target
   path.

2. Edit the generated `index.js`. Type it against the SDK:

   ```js
   /** @type {import('@juju22/plugin-sdk').PluginModule} */
   ```

3. Reload the plugin from the renderer (or restart the app) to pick up changes.

Manifests may be JSON or YAML and are validated against
`src/shared/plugins/manifest-schema.ts`. Plugins run sandboxed in a Node VM with
a restricted `require` surface and cannot touch privileged `process` APIs — keep
your plugin within that boundary.

The full guide, including the `onConfigUpdate` hook and credential handling, is
in [`docs/plugin-sdk.md`](./docs/plugin-sdk.md).

## Contributing to the Core

The repository is organized as:

```
juju22/
├── electron/           # Electron entrypoints
├── packages/plugin-sdk # @juju22/plugin-sdk — shared plugin interfaces
├── src/
│   ├── main/           # Core engine (plugin manager, storage, ipc)
│   ├── renderer/       # React UI
│   ├── plugins/        # Built-in plugins
│   └── shared/         # Shared types and schemas
├── templates/          # Plugin scaffolding templates
└── tests/              # Vitest unit/integration and Playwright e2e
```

A few conventions worth knowing (see [`CLAUDE.md`](./CLAUDE.md) for the full
list):

- Prefer the path aliases (`@main/...`, `@juju22/plugin-sdk`) over deep relative
  imports.
- Inject a logger via the constructor. **Do not call `createLogger` in tests** —
  it writes to disk; pass a mock logger instead.

## Tests and Checks

Before opening a pull request, make sure the same checks CI runs pass locally:

```bash
npm run test:unit    # Vitest suite (must pass)
npm run lint         # ESLint — zero warnings
npx tsc --noEmit     # Type check must pass
```

End-to-end tests use Playwright:

```bash
npm run test:e2e
```

New behavior should come with tests. Unit and integration tests live under
`tests/` and run with Vitest.

## Pull Requests

1. Branch off `main`.
2. Keep each pull request focused on a single change.
3. Ensure tests, lint, and type-check are green.
4. Describe what changed and why, and link any related issue.

## Reporting Issues

Please open an issue with clear reproduction steps for bugs, or a description of
the use case for feature requests. For plugin ideas, note which trigger/action
surface you need so we can prioritize SDK support.

Thanks for helping build Juju22!
