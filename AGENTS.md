# Agent Guidelines

This is a repository housing core TypeScript types (and in the future, JSON
schemas) for WAS (Wallet Attached Storage) types, extracted from:

- `@interop/was-client`
- `@interop/was-teaching-server`

Also relevant, the WAS spec (a W3C CCG work item):

- https://github.com/w3c-ccg/wallet-attached-storage-spec/blob/main/spec.md

## Toolchain & Project Layout

### Package Manager

Use `pnpm` (not `npm` or `yarn`). The lockfile is `pnpm-lock.yaml`. Install deps
with `pnpm install`; run scripts with `pnpm run <script>` or `pnpm <script>`.

### Build

The library is built with `tsc` (not `vite build`). `vite.config.ts` exists only
to configure Vitest. Running `pnpm run build` compiles `src/` to `dist/` via
`tsconfig.json`.

### Two tsconfigs

- `tsconfig.json` — library build only; includes `src/**/*`
- `tsconfig.dev.json` — extends the above with `noEmit: true`; adds `test/**/*`
  and `vite.config.ts` so ESLint's type-aware rules cover all files

Do not add test files to `tsconfig.json` — they would be emitted into `dist/`.

### Tests

- `test/node/` — Vitest unit tests (`pnpm run test:node`); run in Node

This is a types-only package with no runtime/platform behavior to exercise in a
real browser, so there are no Playwright/browser tests.

### ESM & import paths

The package is ESM-only (`"type": "module"`). Local imports must use the `.js`
extension even though source files are `.ts` — e.g.
`import { Example } from '../../src/index.js'`. TypeScript's
`moduleResolution: Bundler` resolves these to the `.ts` source at compile time.

## Conventions

Code style, refactoring, JSDoc, comment, and error-handling conventions live in
@CONTRIBUTING.md -- follow them.
