# Aidle – Phase 2 Automation Upgrade

Phase 2 layers automation and integrations on top of the Phase 1 foundation. The focus areas are the rule engine, richer observability, and first-party plugin scaffolds for upcoming service integrations.

## New Capabilities

- **SQLite-backed rule engine** – `RuleEngine` evaluates trigger payloads, persists structured rules through `RuleRepository`, and dispatches plugin actions when conditions pass. Rules are exposed to the renderer via the `rules:*` IPC bridge.
- **Event Bus telemetry** – The `EventBus` now records every automation event (plugin triggers, rule evaluations, action dispatches, and errors) with an in-memory log that streams to the renderer dashboard.
- **Mock OBS + Twitch plugins** – Built-in scaffolds emit simulated events so you can exercise the automation stack before connecting real services. They illustrate the manifest structure and lifecycle hooks required for Phase 3 adapters.
- **Dashboard refresh** – The renderer lists active rules and surfaces the unified event feed, making it easy to validate automation flows without leaving the app.

## Rule Engine Overview

- Rules live in the new `rule_definitions` table (managed by `RuleRepository`). Each entry stores trigger metadata, conditions, actions, tags, and priority.
- Conditions currently support `equals`, `notEquals`, and `includes` checks against trigger payload fields using dot-notation paths.
- Actions run sequentially through the existing `PluginManager.executeAction` pipeline and receive source rule metadata in their params.
- The default demo rule links the System plugin’s `timer.completed` trigger to the `notification.send` action, so firing the demo timer exercises the full stack.

## Working with Rules

- Use the renderer dashboard (or IPC channels) to list existing rules. Additional CRUD handling can be layered on via the `rules:save` and `rules:delete` handlers.
- The rule engine exposes helper methods to manage rules server-side. `ensureDemoRules` seeds the initial automation so Phase 2 starts with a functional example.

## Event Feed

- `registerEventBridge` streams both plugin trigger payloads and structured log entries to renderer windows.
- The renderer batches up to 25 events, highlighting rule evaluations, dispatched actions, and automation errors alongside raw trigger payloads.
- `EventBus.getRecentLogEntries` powers bootstrap so late subscribers immediately see prior automation activity.

## Plugin Scaffolds

### OBS

- Emits periodic mock `scene.changed` events and exposes `scene.switch`, `stream.start`, and `stream.stop` actions.
- Designed for easy expansion: replace the mock runtime with a websocket-backed integration once credentials and connection management land in Phase 3.

### Twitch

- Emits mock `chat.message` events and supports `chat.send` and `channel.shoutout` actions for testing rule dispatch.
- Provides a safe place to wire authentication and Helix/EventSub clients in future iterations.

## Next Steps

- Replace mock runtimes with real OBS WebSocket and Twitch EventSub/Helix clients.
- Expand the rule condition DSL (comparisons, numeric ops, templated strings) and expose rule editing in the renderer.
- Persist event logs for historical inspection and debugging beyond the in-memory buffer.
- Harden the plugin sandbox for network-bound integrations and add OAuth token storage helpers for Twitch.

Phase 2 primes Aidle for service integrations and richer automations, paving the way for the visual rule builder and production-ready plugin catalog in subsequent phases.
