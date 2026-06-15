# @interop/storage-core Changelog

## 0.2.1 - 2026-06-14

### Changed

- Corrected the documented `BackendDescriptor.features` vocabulary:
  `encrypted-documents` is removed. Client-side encryption is not a backend
  capability -- an encrypted document is opaque client-encrypted JSON any
  document-capable backend stores faithfully with no server cooperation, and
  whether a Collection is encrypted varies per-Collection on the same backend.
  The defined tokens are now the genuine server affordances: `conditional-writes`,
  `blinded-index-query`, `chunked-streams`. Docs-only -- `features` remains
  `string[]`, so no type change.

## 0.2.0 - 2026-06-14

### Added

- `BackendDescriptor.features?: string[]` -- an additive, optional capability
  vocabulary a backend advertises so clients can gate behavior on what it
  actually supports. Currently defined tokens (EDV-over-WAS): `encrypted-documents`,
  `blinded-index-query`, `conditional-writes`, `chunked-streams`. The vocabulary
  is open and clients MUST ignore unrecognized tokens; an absent feature means
  the backend makes no claim to that affordance.

## 0.1.0 - 2026-06-13

### Added

- Initial release. Shared WAS wire-model types and error vocabulary extracted
  from `was-teaching-server` and `was-client`:
  - `common.ts` -- `Action` / `ActionInput`, the `ProblemTypes` registry +
    `ProblemType`, the `application/problem+json` body shapes (`ProblemDocument`
    / `Problem`), the canonical `ProblemStatusCodes` (type -> HTTP-status) map,
    `StorageLimit`, `LinkSet` / `LinkSetEntry`, and the reserved path-segment
    registry (`RESERVED_COLLECTION_IDS` / `RESERVED_RESOURCE_IDS`).
  - `was.ts` -- the WAS data model: `SpaceDescription`, `CollectionDescription`,
    `BackendReference`, `SpaceSummary`, `SpaceListing`, `CollectionSummary`,
    `CollectionsList`, `ResourceSummary`, `CollectionResourcesList`,
    `ResourceMetadata`, `ResourceMetadataCustom`, `BackendDescriptor`,
    `BackendState`, `CollectionUsage`, `BackendUsage`, `SpaceQuotaReport`,
    `PolicyDocument`, and `ImportStats`.
