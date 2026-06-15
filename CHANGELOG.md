# @interop/storage-core Changelog

## 0.2.3 - 2026-06-15

### Added

- `ProblemTypes.INVALID_CURSOR` (`#invalid-cursor`, status `400`) -- a pagination
  `cursor` query parameter is malformed or can no longer be honored (spec
  "Pagination"). Like `precondition-failed`, it is only ever observable by a
  caller already authorized to list the target (an under-authorized caller gets
  the privacy-merged `not-found`). Wired into `ProblemStatusCodes`.
- `CollectionResourcesList.next?: string` -- the optional pagination
  continuation link (spec "Pagination"): a URL the client dereferences for the
  following page, present if and only if more items may follow (its absence is
  the authoritative end-of-list signal). Omitted by a server that returns every
  item in one response, so the field is optional and additive.

## 0.2.2 - 2026-06-14

### Added

- `ProblemTypes.PRECONDITION_FAILED` (`#precondition-failed`, status `412`) -- a
  conditional write's `If-Match` / `If-None-Match` precondition evaluated false
  (stale `ETag`, or a create-if-absent target that already exists). Header-driven
  and deliberately distinct from the `409` conflict kinds; advertised by backends
  carrying the `conditional-writes` feature. Additive, so no type change.

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
