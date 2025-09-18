# Aidle – Phase 1 Foundation

Phase 1 establishes the scaffolding and core runtime necessary to build Aidle’s automation platform. This document summarises the deliverables, architecture decisions, and how to work with the new code.

## Highlights

- Electron 30 + Vite + React 18 development environment with hot reload and production build pipeline (`electron-builder`).
- Persistent storage stack: `electron-store` for user settings, `better-sqlite3` for rules/configuration data.
- Plugin-first runtime featuring manifest validation (JSON/YAML), sandboxed execution, trigger/action registration, and IPC surface to the renderer.
- Event Bus broadcasting plugin triggers into the UI for live monitoring.
- Built-in **System** plugin demonstrating timer actions and notification logging.
- Testing infrastructure: Vitest unit/integration suites (with coverage) and Playwright skeleton for upcoming E2E flows.

## Runtime Architecture

```
Electron Main
 ├─ DataStores (settings + rules persistence)
 ├─ EventBus (typed trigger propagation)
 ├─ PluginManager
 │    ├─ Manifest validation (Ajv)
 │    ├─ PluginSandbox (Node VM)
 │    └─ Lifecycle (initialize → listen → destroy)
 ├─ IPC Bridges
 │    ├─ plugins:list / get / execute-action
 │    └─ events:plugin-trigger → renderer
 └─ Window bootstrap + application menu

React Renderer
 ├─ Aidle bridge (exposed via preload)
 ├─ Dashboard displaying loaded plugins & recent events
 └─ Demo timer trigger exercising the System plugin
```

### Persistence Layer

- `SettingsStore` (`electron-store`) handles strongly-typed global preferences.
- `RuleRepository` (`better-sqlite3`) backs rule CRUD with JSON payload storage, enabling future schema evolution.
- Data lives under `<userData>/data/` ensuring OS-appropriate storage locations.

### Plugin Runtime

- Manifests accept `.json`, `.yaml`, `.yml` and are validated against `src/shared/plugins/manifest-schema.ts`.
- `PluginSandbox` executes plugin code inside a VM context with a restricted `require` surface (built-ins + relative modules) and a guarded `process` proxy.
- `PluginManager` scans built-in (`src/plugins/`) and external (`plugins-external/`) directories, initialises plugins, captures trigger/action metadata, and surfaces aggregated errors.
- Plugins interact with the platform through a `PluginContext` exposing a per-plugin logger, settings access, EventBus, and a guarded `emitTrigger(triggerId, data)` helper.

### IPC & UI Bridge

- `registerPluginBridge` exposes typed IPC handlers for listing plugins and dispatching actions.
- `registerEventBridge` streams trigger payloads to renderer windows, with automatic cleanup on window close.
- `preload.ts` publishes a narrowed `window.aidle` API for the renderer (`plugins.list`, `plugins.executeAction`, `events.onPluginTrigger`).
- The React dashboard surfaces loaded plugins and recent trigger events, plus a demo button that invokes the System plugin’s timer action.

## Testing Strategy

- **Vitest** (`npm run test:unit`) covers manifest validation, plugin loading, persistence CRUD, and IPC bridging.
- **Integration tests** validate plugin-triggered events travelling through the EventBus.
- **Coverage** (`npm run test:coverage`) yields text + HTML reports via V8.
- **Playwright** scaffold (`npm run test:e2e`) is in place with a TODO smoke test for future UI automation.
- `tests/setup.ts` mocks Electron primitives to keep the unit tests fast and hermetic.

### Running Tests

```bash
npm run test:unit      # Vitest suite once
npm run test:coverage  # Vitest with coverage report under coverage/
npm run test:e2e       # (placeholder) Playwright suite
```

_Note:_ Native modules (`better-sqlite3`) require a post-install compilation step. Run `npm install` (or `npm rebuild`) after pulling to ensure binaries are built for your platform.

## Developer Workflow

1. `npm install`
2. `npm run dev`
3. Use the dashboard to verify plugin load and timer demo.
4. Add plugins under `src/plugins/` (built-in) or drop external plugins in `plugins-external/` with a manifest + entry module.
5. Execute `npm run test:unit` before committing.

## Next Steps (Phase 2 Preview)

- Expand the EventBus with richer trigger/action payloads and logging hooks.
- Implement the rule engine data model atop the SQLite layer.
- Integrate OBS/Twitch API clients as dedicated plugins leveraging the established sandbox.
- Flesh out Playwright scenarios once the rule builder UI lands.

Phase 1 lays the groundwork for rapid iteration in subsequent phases while providing confidence through tests and modular architecture. See `docs/phase-2.md` for the automation and integration features layered on top of this foundation.
