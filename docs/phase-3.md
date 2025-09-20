# Aidle – Phase 3 Service Integrations

Phase 3 replaces the mock automation scaffolds with production-ready integrations for desktop automation, OBS Studio, and Twitch. The focus areas are richer system triggers, real streaming adapters, secure credential storage, and runtime observability so creators can trust their automation graph while operating live.

## Highlights

- **Plugin connection telemetry** – Plugins now publish connection status transitions through the EventBus (`plugin.status`), enabling renderer surfaces to visualise health and errors in real time.
- **Scoped configuration + credentials** – Each plugin receives a sandboxed config and secrets store backed by encrypted Electron Store files. Secrets are protected with a per-installation key that lives in the global settings store.
- **Extended sandbox** – Sandboxed plugins can opt-in to additional dependencies declared in their manifest. Phase 3 plugins use this to load `cron`, `chokidar`, `obs-websocket-js`, and `tmi.js` inside the VM while keeping third-party code constrained.

## System Plugin Upgrades

- Global hotkey management via Electron `globalShortcut` with hotkey triggers and register/unregister actions.
- Cron-backed schedules, file system watchers, and a lightweight webhook receiver (supporting shared-secret auth) all emit first-class triggers for rules.
- Plugin-configurable state persisted per feature; secrets (webhook token) stored encrypted. Service lifecycle emits connection status updates to the UI.

## OBS Plugin Upgrades

- Swappable runtime: production mode uses `obs-websocket-js` with automatic reconnect, retry backoff, and WebSocket event coverage (scene and stream state). Mock mode remains for offline development.
- Connection configuration action persists host/port/SSL/password and restarts the runtime on changes.
- Actions are forwarded to real OBS RPCs (`SetCurrentProgramScene`, `StartStream`, `StopStream`). Connection failures degrade gracefully into mock mode when the dependency is unavailable.

## Twitch Plugin Upgrades

- Live runtime driven by `tmi.js` for chat, subscription, and raid events plus Helix polling for follower detection.
- OAuth token refresh support with encrypted credential storage (access token, refresh token, client secret, chat token, expiry).
- Actions for chat messaging, shoutouts, channel metadata updates, and clip creation wired to Helix endpoints with automatic retry on 401 via refresh tokens.
- Mock runtime retained for offline automation demos.

## Testing & Tooling

- Unit tests expanded to ensure plugin sandbox dependency allowlists, plugin-scoped storage, and EventBus status notifications behave as expected.
- Phase 3 docs describe prerequisite setup for OBS WebSocket and Twitch API credentials so developers can quickly validate live integrations.

## Next Steps

- Surface plugin status telemetry in the renderer dashboard (Phase 4).
- Provide a configuration UI for managing plugin credentials and feature state instead of action-only workflows.
- Capture webhook payload history and follower/subscription archives for auditability.
