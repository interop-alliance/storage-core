# Storage Core _(@interop/storage-core)_

[![Node.js CI](https://github.com/interop-alliance/storage-core/workflows/CI/badge.svg)](https://github.com/interop-alliance/storage-core/actions?query=workflow%3A%22CI%22)
[![NPM Version](https://img.shields.io/npm/v/@interop/storage-core.svg)](https://npm.im/@interop/storage-core)

> Shared wire-model types and error vocabulary for Wallet Attached Storage (WAS)
> -- the single source of truth imported by both the WAS server and client.

## Table of Contents

- [Background](#background)
- [Security](#security)
- [Install](#install)
- [Usage](#usage)
- [Contribute](#contribute)
- [License](#license)

## Background

This package holds the **wire shapes** (the JSON a WAS server emits and a client
parses) and the **error vocabulary** (problem-type URIs plus their HTTP-status
mapping) shared between
[`was-teaching-server`](https://github.com/interop-alliance/was-teaching-server)
and [`was-client`](https://github.com/interop-alliance/was-client). Extracting
them here keeps the two repos from silently drifting apart.

It is named `storage-core` rather than `was-core` because the WAS and encrypted
data vault (EDV) data models are being aligned, and the shared EDV types will
live here too. The source is organized by domain to leave room for that:

- `src/common.ts` -- cross-spec primitives: the capability-action vocabulary,
  the RFC9457 problem-type registry + `application/problem+json` body shapes +
  canonical code-to-status map, the storage-limit shape, the RFC9264 linkset
  shapes, and the reserved path-segment registry.
- `src/was.ts` -- the WAS data model: Space / Collection / Resource descriptions
  and summaries, listing shapes, resource metadata, backend descriptor / usage,
  the quota report, and the policy document.
- `src/edv.ts` -- (later) the EDV data model.

The package is **pure types plus a few `const` values** (`ProblemTypes`,
`ProblemStatusCodes`, the reserved-segment sets); it has no platform APIs and no
runtime dependency surface beyond a type-only reference to
`@interop/data-integrity-core` (`IDID`), which it uses but does not re-export.

## Install

- Node.js 22+ is recommended.

### PNPM

To install via PNPM:

```
pnpm install @interop/storage-core
```

### Development

To install locally (for development):

```
git clone https://github.com/interop-alliance/storage-core.git
cd storage-core
pnpm install
```

## Usage

```ts
import {
  ProblemTypes,
  ProblemStatusCodes,
  type SpaceDescription,
  type SpaceQuotaReport
} from '@interop/storage-core'

const status = ProblemStatusCodes[ProblemTypes.QUOTA_EXCEEDED] // 507
```

Consumers that need `IDID` / `IZcap` / `ISigner` import them directly from
`@interop/data-integrity-core`; this package references but does not re-export
them.

## Contribute

PRs accepted. See [CONTRIBUTING.md](CONTRIBUTING.md) for editor setup (Prettier,
ESLint, and EditorConfig) and how it maps to CI.

If editing the Readme, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

[MIT License](LICENSE.md) © 2026 Interop Alliance.
