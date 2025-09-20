# Juju22 – Phase 5 Advanced Features

Phase 5 introduces stateful automation primitives on top of the runtime and GUI delivered in earlier phases. This milestone adds a variable service with interpolation, a richer action graph (branches, loops, random selectors, scripts), and a documented plugin authoring workflow.

## Highlights

- **Variable service** – A new `VariableService` wraps the SQLite-backed repository and the `EventBus`, exposing scoped getters/setters and emitting `variables.mutated` events for live tooling. Variables support global, plugin, and rule scopes with atomic increments and reset semantics. Interpolation helpers resolve `{{variables.*}}`, `{{context.locals.*}}`, and payload references prior to action execution.
- **Rule context enrichment** – `RuleEvaluationContext` now ships trigger metadata, raw payloads, scoped variable snapshots, and mutable `locals`. Conditions, loops, and scripts can address `context.payload`, `context.variables`, and `context.locals` paths.
- **Advanced actions** – The rule engine evaluates discriminated action unions:
  - `branch` actions inspect condition arrays with first-match semantics.
  - `loop` actions support bounded iteration or `forEach` collections with optional delays.
  - `random` actions pick unique or replacement-based sub-actions.
  - `variable` actions set, increment, or reset scoped variables without writing scripts.
  - `script` actions execute sandboxed VM snippets with access to scoped variables and helper utilities.
- **Renderer updates** – The rule editor exposes an action type selector, dedicated editors for plugin/variable/script actions, and JSON editors for complex flows. A new Variables surface lists scoped state, handles inline mutations, and refreshes via `variables.mutated` events. Event feeds label variable mutations alongside rule evaluations.
- **Plugin authoring** – A workspace-scoped `@juju22/plugin-sdk` package re-exports the runtime types, a starter template lives under `templates/plugin-basic`, and the `scripts/create-plugin.mjs` helper scaffolds new plugins into `plugins-external/`.
- **Testing** – Fresh unit coverage verifies branch dispatch, loop counter increments, and script execution within the sandbox. Existing tests exercise action dispatch failure paths.

## Runtime Updates

- `VariableRepository` and `VariableService` centralize persistence, snapshots, and mutation events.
- `RuleEngine` consumes the service, resolves interpolations via `resolveExpressions`, and orchestrates recursive action execution with depth and loop guards.
- `EventBus` exports `onVariableMutation`, wiring mutations into the renderer bridge.
- IPC bridges expose variable CRUD + snapshot APIs alongside the existing rule handlers.

## Renderer Enhancements

- Rule editor action palette (plugin, variable, branch, loop, random, script) with contextual editors.
- JSON-based editor for advanced action graphs and script arguments.
- Variables page with scope filters, inline mutators, and bulk refresh.
- Event feed labeling for `variables.mutated` entries.

## Plugin Workflow

- `packages/plugin-sdk` shares plugin + rule type definitions for external authors.
- `templates/plugin-basic` contains a manifest and module scaffold.
- `scripts/create-plugin.mjs` bootstraps a new plugin folder with templated metadata.
- Documentation in `docs/plugin-sdk.md` explains development flows and simulator expectations.

## Testing

- New Vitest suites validate branch matching, loop increments, and script side effects.
- Existing tests updated to consume `VariableService` injected via the rule engine.

## Next Steps

- Expand Playwright coverage to exercise advanced action builders.
- Add regression tests for variable mutation races and script sandbox hardening.
- Package the plugin SDK for external publication once APIs stabilize.
