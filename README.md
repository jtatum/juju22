# Juju22

[![CI](https://github.com/jtatum/juju22/actions/workflows/ci.yml/badge.svg)](https://github.com/jtatum/juju22/actions/workflows/ci.yml)
[![Release](https://github.com/jtatum/juju22/actions/workflows/release.yml/badge.svg)](https://github.com/jtatum/juju22/actions/workflows/release.yml)

Juju22 is a cross-platform automation and integration platform for content creators. The project pairs an Electron main process with a React renderer and a plugin-first automation engine.

## Phase 1 Deliverables

- Electron + React + TypeScript scaffolding with hot reload and build tooling
- Core persistence layer using `electron-store` (settings) and SQLite (`better-sqlite3`) for rules
- Plugin runtime with manifest validation, sandboxed loading, and IPC bridge to the renderer
- Built-in System plugin showcasing timer triggers and notifications
- Vitest-based test harness with initial unit/integration coverage and Playwright skeleton for E2E

## Phase 2 Highlights

- SQLite-backed rule engine with IPC bridge for managing automation definitions
- Expanded EventBus featuring structured logging, renderer dashboards, and rule evaluation telemetry
- Mock OBS and Twitch plugin scaffolds demonstrating the Phase 2 integration surface

## Phase 3 Highlights

- Plugin-scoped config and encrypted credential stores with status telemetry events for observability
- System plugin hotkeys, cron schedules, filesystem watchers, and webhook ingestion ready for live automation
- OBS plugin powered by `obs-websocket-js` with reconnect/backoff and real scene/stream control (mock fallback retained)
- Twitch plugin wired to `tmi.js` chat plus Helix APIs for followers, subscriptions, raids, shoutouts, channel metadata, and clip creation

## Phase 6 Highlights (Performance & Reliability)

- **Circuit Breaker Pattern** – Prevents cascading failures with automatic recovery and user notifications
- **Performance Monitoring** – Real-time CPU/memory tracking with memory leak detection
- **Error Reporter** – Intelligent error categorization with recovery suggestions and history tracking
- **Retry Manager** – Configurable retry strategies with exponential backoff for different service types
- **Import/Export** – Rule portability with conflict detection and validation
- **Backup System** – Scheduled automatic backups with compression and point-in-time restoration
- **Notification System** – Toast notifications for errors, warnings, and success messages
- **Onboarding Wizard** – First-run experience with guided setup and sample rule creation

## Getting Started

```bash
npm install
npm run dev
```

- The renderer runs with Vite hot-module reload.
- Electron main process reloads automatically during development.

## Scripts

- `npm run dev` – start Electron + Vite in development mode
- `npm run build` – produce distributable artifacts via `electron-builder`
- `npm run lint` – run ESLint across the project
- `npm run test` – run Vitest in watch mode
- `npm run test:unit` – run the Vitest suite once
- `npm run test:coverage` – generate coverage reports under `coverage/`
- `npm run test:e2e` – run Playwright tests (placeholder in Phase 1)

## Project Structure

```
juju22/
├── electron/           # Electron entrypoints
├── src/
│   ├── main/           # Core application engine (plugin manager, storage, ipc)
│   ├── renderer/       # React UI
│   ├── plugins/        # Built-in plugins
│   └── shared/         # Shared types and schemas
├── plugins-external/   # External plugin directory (created at runtime)
├── tests/              # Vitest unit/integration and Playwright e2e suites
└── docs/               # Project documentation
```

## Development Notes

- Plugin manifests support JSON and YAML formats and are validated against `src/shared/plugins/manifest-schema.ts`.
- Plugins are sandboxed via Node VM with a restricted require surface and cannot access privileged `process` APIs.
- Events emitted by plugins flow through a typed EventBus to the renderer via IPC, enabling live monitoring.
- Settings and rule data are stored under the user’s Electron `appData` directory inside the `data/` subfolder.

Refer to `docs/phase-1.md` for the Phase 1 foundation, `docs/phase-2.md` for the automation engine, `docs/phase-3.md` for service integrations, and `docs/phase-4.md` for the new GUI experience.

See also `docs/phase-6.md` for performance monitoring, error handling, and reliability features added in Phase 6.
