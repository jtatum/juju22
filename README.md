# Aidle

Aidle is a cross-platform automation and integration platform for content creators. The project pairs an Electron main process with a React renderer and a plugin-first automation engine.

## Phase 1 Deliverables

- Electron + React + TypeScript scaffolding with hot reload and build tooling
- Core persistence layer using `electron-store` (settings) and SQLite (`better-sqlite3`) for rules
- Plugin runtime with manifest validation, sandboxed loading, and IPC bridge to the renderer
- Built-in System plugin showcasing timer triggers and notifications
- Vitest-based test harness with initial unit/integration coverage and Playwright skeleton for E2E

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
aidle/
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

Refer to `docs/phase-1.md` for a detailed overview of the Phase 1 architecture and testing strategy.
