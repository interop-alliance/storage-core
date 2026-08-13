# @interop/storage-core Changelog

## 0.9.0 - 2026-08-13

### Changed

- **BREAKING**: Renamed the resource-log format identifier constant
  `WAS_RESOURCE_LOG_METHOD` (`was-resource-log:0.1`) to `RESOURCE_LOG_METHOD`
  (`resource-log:0.1`). Both the export name and the identifier value change:
  the log format is transport-agnostic and is not tied to the WAS storage API.

## 0.8.0 - 2026-08-12

### Added

- `CollectionMetadata`: the Collection-level wire type for the reserved `meta`
  segment of a Collection (`createdAt`, `updatedAt`, `createdBy`, `epoch`,
  `custom`). Mirrors `ResourceMetadata` minus `contentType` / `size`, which
  describe a stored representation a Collection does not have.
- `RESERVED_RESOURCE_IDS`: added `meta`. Collection Metadata occupies the
  `{resource_id}` position, so a Resource named `meta` would shadow it.

## 0.7.0 - 2026-08-12

### Added

- `CollectionEncryption`: the optional `hmac` member -- the Collection's
  blinded-index HMAC key (`id`, `type`, and `recipients`, the key wrapped to
  each recipient in the same JWE `recipients` entry shape as the epoch secrets).
  Installed at provisioning or never, and never rotated.

## 0.6.0 - 2026-08-11

### Added

- Add the optional `generator` and `generatorOrigin` properties to
  `CollectionDescription` (spec "Collection Data Model"): the DID of the
  application the Collection was provisioned for and the Web origin it was bound
  to at provisioning time. Both are controller-asserted -- client- supplied,
  updatable (so a wallet can backfill existing Collections), and never
  server-verified -- in contrast to the server-observed, read-only `createdBy`,
  which under delegated provisioning names the invoker rather than the
  application.

## 0.5.0 - 2026-08-10

### Changed

- **BREAKING**: `CollectionEncryption`: the `epochsMac` member and the
  `CollectionEncryptionEpochsMac` interface are removed -- the epoch-
  configuration MAC is retired stack-wide (with `@interop/was-client@0.32.0`).
  On a log-governed descriptor its coverage was a strict subset of chain
  verification, and its classic gaps (whole-configuration replay, fresh
  fabrication under a newly minted secret) were gaps with or without it.
  Greenfield: no tolerance for MAC-bearing descriptors, no strip migration.

## 0.4.0 - 2026-08-10

### Added

- The resource-log wire types (`src/resourceLog.ts`, re-exported from the root),
  per the App Connect spec's Resource Log Profile: `ResourceLogEntry` (the
  five-member entry), `ResourceLogGenesisParameters` (`method`, `scid`, optional
  `previousLog`), `ResourceLogTerminalParameters` (`nextLog`),
  `ResourceLogParameters`, `ResourceLogEntryProof` (the fixed `eddsa-jcs-2022` /
  `assertionMethod` Data Integrity proof shape carrying the entry anchor), and
  the byte-significant format identifier constant `WAS_RESOURCE_LOG_METHOD`
  (`was-resource-log:0.1`).
- `CollectionEncryption`: the optional `type` member (the Resource Log Profile's
  state-document schema identifier, `WasEpochConfiguration` for an encryption
  descriptor) and the optional `history: { method, resource }` member (the
  profile's dispatch hint on a point-state document -- never authoritative,
  absent inside log entry `state`).

### Changed

- `CollectionEncryption`: the `version` doc comment now matches the WAS spec's
  settled shape -- a positive-integer registry key (absent = `1`), set-once,
  version-monotonic (idempotent re-declaration allowed, decrease/removal/clear
  rejected, raise allowed when the server recognizes the new pair). Type shape
  unchanged.

### Removed

- **BREAKING**: `CollectionEncryptionEpochsSig` and the `epochsSig` member of
  `CollectionEncryption`, added in 0.3.13. The Resource Log Profile's entry
  proof replaces the detached epoch-configuration signature; no deployment
  produced or verified `epochsSig` descriptors.

## 0.3.13 - 2026-08-05

### Added

- `CollectionEncryptionEpochsSig` and the optional `epochsSig` member of
  `CollectionEncryption`: a client-computed detached signature over the same
  epoch configuration the `epochsMac` covers, by a signing key the reader
  resolves against a root of trust outside the descriptor (e.g. a DID document
  verification method). Complements the MAC, which cannot authenticate a
  configuration to a reader meeting an epoch for the first time (its key is
  delivered by the descriptor itself). Stored and returned opaquely by servers
  like the rest of the descriptor.

## 0.3.11-0.3.12 - 2026-08-01

### Changed

- Update to latest `@interop/data-integrity-core@8.4.0`.

## 0.3.10 - 2026-08-01

### Changed

- Documentation only: the `encryption` member of a Collection Description is now
  called the "encryption descriptor" (previously "marker"), following the spec
  wording. No identifiers, types, or wire shapes change.

## 0.3.9 - 2026-07-23

### Added

- Add the optional `public` member to `CollectionSummary`: whether a
  `PublicCanRead` policy is attached to the Collection, surfaced inline in the
  List Collections result so a client need not issue one policy probe per listed
  Collection. A server that computes it includes it on every item; absent means
  the server predates the field.

## 0.3.8 - 2026-07-21

### Added

- Add the optional `version` member to `CollectionEncryption` (the encryption
  scheme's version; servers enforce it never decreases and is never removed) and
  the optional `epochsMac` member with its `CollectionEncryptionEpochsMac` shape
  (`{ v, alg, mac }`) -- a client-computed MAC over the epoch configuration,
  keyed from the current epoch's secret, letting writers detect a server-side
  rollback of `currentEpoch` before encrypting.

## 0.3.7 - 2026-07-20

### Changed

- Add the optional `next` pagination continuation link to `CollectionsList` and
  `SpaceListing`, mirroring `CollectionResourcesList.next`, so the List
  Collections and List Spaces operations can return one cursor-paginated page at
  a time (spec "Pagination" appendix). `SpaceListing.totalItems` becomes
  optional: a paginating server MAY omit the full count, which for List Spaces
  would require verifying every candidate controller.

## 0.3.6 - 2026-07-19

### Added

- Add the optional `indexes` property to `CollectionDescription` (the `equality`
  query profile's declaration surface) and the `CollectionIndexDeclaration`
  entry shape (`{ name, source?, unique? }`; a bare string entry is shorthand
  for a content-sourced attribute). `indexes` is mutually exclusive with the
  `encryption` marker and, unlike it, updatable.

## 0.3.5 - 2026-07-17

### Changed

- Update to `@interop/data-integrity-core@8.3.0`.

## 0.3.4 - 2026-07-11

### Added

- Widen `CollectionEncryption` (the `'edv'` variant) with the key-epoch public
  references for multi-recipient encrypted Collections: `epochs?` (each epoch an
  `{ id, recipients }`, wrapping the epoch's collection key once per recipient)
  and `currentEpoch?` (the epoch new writes encrypt under; MUST name an entry in
  `epochs`). Recipient entries (`CollectionEncryptionRecipient`) reuse the JWE
  general-serialization `recipients` entry shape verbatim (`header` with
  `kid`/`alg`/key-agreement members, plus `encrypted_key`) -- one wire
  vocabulary for "a key wrapped to a recipient". Nothing secret appears in the
  marker: public keys and wrapped-key ciphertext only.
- Add an optional client-declared `epoch?: string` to `ResourceMetadata` -- the
  key-epoch id the Resource's content was encrypted under, a sibling of `custom`
  (on an encrypted Collection `custom` is the opaque envelope and is
  full-replaced on every metadata write, so the epoch cannot live inside it).
  The server stores the value opaquely; it never computes or verifies it. Also
  carried on `ChangeDocument` and `ResourceSummary`, so a replicating reader (or
  one walking a listing) can pick the right epoch key without a `/meta` fetch
  per Resource.

## 0.3.3 - 2026-07-09

### Added

- Add the wire shapes of the `changes` query profile (spec "Query Profile
  Registry"), shared by the server that serves the feed and the client that
  replicates from it: `ChangeDocument` (`id`, `_deleted`, `updatedAt`,
  `version`, optional `metaVersion` / `createdBy` / `data` / `custom`),
  `ChangesPage` (`documents` + `checkpoint`), and `ChangesCheckpoint` (the
  `(updatedAt, id)` keyset position). `data` is `unknown` because a Resource
  body may be any JSON value. These are the wire shapes; a server's internal
  storage-port shape need not match them.

## 0.3.2 - 2026-07-09

### Added

- Add an optional server-managed `createdBy` (a DID) to `ResourceMetadata`,
  `SpaceDescription`, and `CollectionDescription`, recording the party whose
  capability invocation created the object. Set on the first write and preserved
  across later writes, so it names the creator rather than the last writer, and
  read-only: a value supplied in a write body is ignored. On a Space it is
  distinct from `controller`, which under delegated provisioning need not be the
  creator. Optional and additive: an absent `createdBy` means "not recorded",
  not "no creator". Extends the properties the spec's "Resource Metadata Data
  Model", "Space Data Model", and "Collection Data Model" define.

## 0.3.1 - 2026-07-01

### Added

- Add two problem types for the spec's "Encryption Scheme Registry" fail-closed
  guarantee, to `ProblemTypes` / `ProblemStatusCodes`:
  - `ENCRYPTION_SCHEME_MISMATCH` (`#encryption-scheme-mismatch`, 422) -- a
    content write into an encrypted Collection did not conform to the declared
    scheme's envelope profile (wrong media type, or not a structurally valid
    envelope).
  - `UNSUPPORTED_ENCRYPTION_SCHEME` (`#unsupported-encryption-scheme`, 400) -- a
    Collection marker named a `scheme` the server does not recognize and cannot
    enforce.

## 0.3.0 - 2026-06-27

### Added

- Add `CollectionEncryption` (a closed, `scheme`-discriminated union; v1
  `{ scheme: 'edv' }`) and the optional `encryption` property on
  `CollectionDescription` -- the non-secret, set-once marker declaring a
  Collection client-side encrypted (spec "Encrypted Collections").
- Add the `ENCRYPTION_IMMUTABLE` (`#encryption-immutable`, 409) problem type to
  `ProblemTypes` / `ProblemStatusCodes`, raised when a Collection update tries
  to change or clear an existing `encryption` marker.

## 0.2.4-0.2.5 - 2026-06-26

### Added

- Backend registration wire shapes (spec "Backends"), the client to server
  contract for registering an `external` ("Bring Your Own Storage") backend
  against a Space. The types enforce the write-vs-read split: a
  `BackendRegistration` POST/PUT body carries a secret-bearing `connection`, but
  every read path returns only the sanitized public projection.
  - `BackendRegistration` -- the register body shape:
    `{ id, name?, managedBy?: 'external', provider, storageMode?, features?, connection }`.
  - `BackendConnectionInput` -- the write-side connection, open and
    secret-bearing (`{ kind: string; [key: string]: unknown }`), carrying
    provider-specific grant material (e.g. an OAuth `authorizationCode` /
    `refreshToken`).
  - `BackendConnectionPublic` -- the sanitized (secret-free) connection returned
    on every read path: `kind`, a lifecycle `status`
    (`registered`/`connected`/`expired`/`revoked`/`unreachable`), and optional
    public metadata (`account`/`scope`/`connectedAt`/`rootFolderName`).

### Changed

- `BackendDescriptor` gains two optional `external`-backend fields: `provider?`
  (the adapter id that operates the connection) and
  `connection?: BackendConnectionPublic` (the sanitized connection state). Both
  absent on the server-managed `default` backend; additive, so no break for
  existing servers.

## 0.2.3 - 2026-06-15

### Added

- `ProblemTypes.INVALID_CURSOR` (`#invalid-cursor`, status `400`) -- a
  pagination `cursor` query parameter is malformed or can no longer be honored
  (spec "Pagination"). Like `precondition-failed`, it is only ever observable by
  a caller already authorized to list the target (an under-authorized caller
  gets the privacy-merged `not-found`). Wired into `ProblemStatusCodes`.
- `CollectionResourcesList.next?: string` -- the optional pagination
  continuation link (spec "Pagination"): a URL the client dereferences for the
  following page, present if and only if more items may follow (its absence is
  the authoritative end-of-list signal). Omitted by a server that returns every
  item in one response, so the field is optional and additive.

## 0.2.2 - 2026-06-14

### Added

- `ProblemTypes.PRECONDITION_FAILED` (`#precondition-failed`, status `412`) -- a
  conditional write's `If-Match` / `If-None-Match` precondition evaluated false
  (stale `ETag`, or a create-if-absent target that already exists).
  Header-driven and deliberately distinct from the `409` conflict kinds;
  advertised by backends carrying the `conditional-writes` feature. Additive, so
  no type change.

## 0.2.1 - 2026-06-14

### Changed

- Corrected the documented `BackendDescriptor.features` vocabulary:
  `encrypted-documents` is removed. Client-side encryption is not a backend
  capability -- an encrypted document is opaque client-encrypted JSON any
  document-capable backend stores faithfully with no server cooperation, and
  whether a Collection is encrypted varies per-Collection on the same backend.
  The defined tokens are now the genuine server affordances:
  `conditional-writes`, `blinded-index-query`, `chunked-streams`. Docs-only --
  `features` remains `string[]`, so no type change.

## 0.2.0 - 2026-06-14

### Added

- `BackendDescriptor.features?: string[]` -- an additive, optional capability
  vocabulary a backend advertises so clients can gate behavior on what it
  actually supports. Currently defined tokens (EDV-over-WAS):
  `encrypted-documents`, `blinded-index-query`, `conditional-writes`,
  `chunked-streams`. The vocabulary is open and clients MUST ignore unrecognized
  tokens; an absent feature means the backend makes no claim to that affordance.

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
