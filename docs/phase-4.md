# Juju22 – Phase 4 GUI Development

Phase 4 delivers the first full-featured desktop GUI for Juju22, building on the automation runtime introduced in earlier milestones. The renderer now ships a multi-surface experience for managing plugins, configuring credentials, constructing automations, and inspecting live telemetry.

## Highlights

- **Application shell + navigation** – A persistent sidebar with contextual routing (Dashboard, Plugins, Rules, Events) powered by React Router enables deep-linkable flows and parallel development of renderer surfaces.
- **State management** – Global automation state is cached through Zustand stores (`usePluginStore`, `useRuleStore`, `useEventStore`) with live hydration via the Electron preload bridge.
- **Event streaming** – The main process now forwards `plugin.status` telemetry. The renderer subscribes to status + log bootstraps for instant dashboards and health monitoring.
- **Plugin manager** – Dedicated list + detail views expose manifest metadata, real-time status badges, trigger/action catalogs, and JSON Schema–driven configuration forms. Config mutations are validated server-side before persisting to the encrypted store.
- **Rule builder** – A visual editor provides drag-free but fully reorderable action chains, condition builders, and draft metadata. Inline “Run Test” invokes the rule engine to evaluate sample payloads before committing.
- **Event monitor** – Filterable event feed surfaces plugin triggers, status transitions, evaluations, dispatched actions, and errors with structured payload previews.

## Main Process Enhancements

- `PluginManager`
  - Persists the latest `PluginStatusUpdate` per plugin and exposes `listStatuses/getStatus`.
  - Provides configuration snapshots and validation-aware updates via `getConfig/updateConfig`.
  - Captures optional plugin config schemas during load for renderer form generation.
- IPC bridges
  - `plugins:statuses`, `plugins:get-config`, `plugins:save-config` surface new management capabilities.
  - `rules:test` proxies rule evaluation requests to the core engine.
- `EventBridge` now bootstraps status history alongside the existing log.
- `RuleEngine` exposes `testRule` for dry-run evaluations.

## Renderer Architecture

```
src/renderer/
├── components/      # Layout, status badges, cards, tables, config form
├── hooks/           # useBridgeSubscriptions hydrates Zustand stores from IPC events
├── routes/          # Dashboard, Plugins, PluginDetail, Rules, RuleEditor, Events
├── stores/          # Zustand stores for plugins, rules, events
└── App.tsx          # HashRouter layout + route definitions
```

### Key Surfaces

- **Dashboard** – Summaries for plugin count, connected plugins, rule inventory, and recent events plus quick cards for each plugin and a live log excerpt.
- **Plugin Manager** – Grid of plugin cards with health statuses and per-plugin detail pages featuring schema-aware config forms and trigger/action references.
- **Rule Builder** – Guided workflow for identifiers, metadata, trigger selection, conditional logic, action sequencing (with reordering), and JSON test payload execution.
- **Event Monitor** – Filter controls by event type with ability to clear history and inspect structured payloads.

## Testing

- Updated unit suites cover the expanded plugin and rule IPC bridges plus configuration/state accessors inside `PluginManager`.
- Renderer surfaces rely on shared Zustand stores; integration-worthy tests will be added in Phase 5 alongside planned E2E automation.

## Next Steps

- Enrich config form scaffolding with per-field validation messaging and secret/credential affordances.
- Add drag-and-drop ergonomics and templated variable helpers to the rule builder.
- Capture and persist event history to disk for long-term observability.
- Layer Playwright smoke tests across the new navigation and rule creation flows.
