# storage-core Roadmap (archived items)

Completed items moved verbatim from [ROADMAP.md](ROADMAP.md) as they land, so
SC-N references keep resolving. CHANGELOG.md remains the record of what shipped.

---

## Wire types

### SC-1: Move `CollectionDescription.indexes` under a new `plaintext` member

- status: done (2026-09-05)
- priority: medium
- labels: wire-types, breaking
- touches:
  - storage-core: `src/was.ts` -- `CollectionDescription` gains
    `plaintext?: { indexes?: Array<string | CollectionIndexDeclaration> }` and
    drops the top-level `indexes`; the `CollectionIndexDeclaration` entry shape
    and its doc comment stay; the `encryption` and new `plaintext` doc comments
    state the presence-based mutual exclusion; CHANGELOG.md (breaking)
  - was-teaching-server: follows the type (its WAS-63)
  - was-client: unaffected today (`CollectionWritableFields` carries no
    `indexes`; it gains `plaintext` only when an equality binding lands, WASS-26
    in the spec roadmap)
  - wallet-attached-storage-spec: the shape of record is decision record
    `_spec/decisions/0004-plaintext-and-encryption-counterparts.md`
    (2026-08-20); the spec text itself lands with the `equality` profile under
    WASS-26
- acceptance:
  - [x] `CollectionDescription` has `plaintext?: { indexes?: ... }` and no
        top-level `indexes`; no compatibility alias for the flat member
        (greenfield move)
  - [x] Doc comments: `plaintext` is the counterpart of `encryption` (at most
        one present; server rejects both with `invalid-request-body`), updatable
        for the Collection's life; `plaintext.indexes` is server-side plaintext
        indexing, distinct from the client-blinded indexes of an encrypted
        Collection
  - [ ] Published as a breaking release; was-teaching-server WAS-63 picks it up

The WAS spec settled server-side indexing as `plaintext.indexes` rather than a
flat `indexes` member (decision 0004, 2026-08-20; text ships with WASS-26):
`plaintext` and `encryption` are the two mutually exclusive top-level members
describing how the server may treat a Collection's Resources, so the exclusion
reads as a structural fact and "indexes" no longer collides with the blinded
indexes of an encrypted Collection in prose. The flat `indexes` shipped here in
0.3.6 before the spec text existed; nothing downstream consumes it except the
reference server, so the move is cheap now.

### SC-4: Merge `CollectionDescription` and `CollectionMetadata`; rename `SpaceDescription`

- status: done (2026-09-11)
- priority: high
- labels: was-v0.5, breaking, wire-types
- touches:
  - wallet-attached-storage-spec: shipped -- WASS-29 landed the spec text
    2026-09-11 (decision
    `_spec/decisions/0005-container-descriptions-live-at-meta.md`)
  - storage-core: `src/was.ts` (the two Collection types and their doc comments,
    `SpaceDescription`, and the container `url` members of `SpaceSummary`,
    `SpaceListing`, `CollectionSummary`, `CollectionsList`,
    `CollectionResourcesList`); AGENTS.md; a CHANGELOG entry naming the break
  - was-client: WCL-41 consumes the merged type
  - was-teaching-server: its WASS-29 item persists and serves the merged object
  - was-conformance-suite: its WASS-29 checks assert the merged shape
  - encrypted-collections-spec: ECS-8 is the prose half; the `custom` envelope
    and its `was.collection` binding are unchanged
- acceptance:
  - [x] One exported type carries the merged Collection Metadata object: the
        former `CollectionDescription` members (`id`, `type`, `name`,
        `generator`, `generatorOrigin`, `backend`, `encryption`, `plaintext`,
        `url`, `linkset`, `createdBy`) beside the former `CollectionMetadata`
        members (`createdAt`, `updatedAt`, `custom`, `epoch`), with `createdBy`
        appearing once
  - [x] The name settled before implementation. Both current names are exported
        public API, so this is a rename of one and a deletion of the other
        either way. Settled 2026-09-11: the merged type is `CollectionMetadata`
        and the Space type is `SpaceMetadata`, matching the spec's
        `#collection-metadata-data-model` / `#space-metadata-data-model`
        sections; `CollectionDescription` and `SpaceDescription` are removed
        with no alias
  - [x] The `CollectionMetadata` doc block that today states the invariant this
        change reverses -- "Collection Metadata is stored and versioned
        independently of the Collection Description... writing one never bumps
        the other's version" -- is replaced by the single-validator rule: one
        `metaVersion` covers configuration and annotation writes alike, and
        `If-None-Match: *` means "create only if the Collection does not exist"
  - [x] The timestamps' meaning is corrected in the doc comments: `createdAt`
        now describes the Collection, not a separately-written metadata object,
        so the "may postdate the Collection's creation" caveat goes away
  - [x] `SpaceDescription` is renamed to match the spec's "Space Metadata
        object", with its `url` doc comment naming the canonical trailing-slash
        form
  - [x] The container `url` doc comments say the value is canonically
        trailing-slash (`CollectionSummary.url` today says
        `/space/:spaceId/:collectionId`); `ResourceSummary.url` is left alone,
        since a Resource is not a container
  - [x] No new problem types. `RESERVED_ID`, `ID_CONFLICT`,
        `ENCRYPTION_IMMUTABLE`, `ENCRYPTION_SCHEME_MISMATCH`,
        `ENCRYPTION_HISTORY_LOG_GOVERNED`, and `UNSUPPORTED_OPERATION` all carry
        over; their doc comments now describe writes to the merged object rather
        than to a Description-only surface

Context: WAS v0.5 serves a Collection's description and its annotations as one
object at `/space/{s}/{c}/meta`, with one validator. storage-core models them
today as two exported types, `CollectionDescription` and `CollectionMetadata`,
whose doc comments assert the independence the merge removes. Every other party
to the contract reads its shapes from here, so the merged type is the first
thing that has to land: was-client, the reference server, and the conformance
suite all depend on it.

This repo holds types only -- no path builders, no URL helpers -- so the
trailing-slash half of WASS-29 reaches it as doc-comment wording on the
container `url` members, nothing more.

2026-09-11: the storage-core half landed. `CollectionMetadata` is the merged
object and `SpaceMetadata` the renamed Space one, both with no compatibility
alias; the CHANGELOG names the break under 0.14.0. The `touches` entries in
was-client, was-teaching-server, and was-conformance-suite pick it up from the
published release.

## Errors

### SC-2: Problem type for an already-revoked revocation submission

- status: done (2026-09-10)
- priority: medium
- labels: errors, registry, zcap
- touches:
  - was-teaching-server: WAS-91 emits it on
    `POST /space/:spaceId/zcaps/revocations/:id` (shipped)
  - was-client: WCL-39 maps it to its own error name (shipped)
  - wallet-attached-storage-spec: the type joins the revocation spec text
    (WASS-4) when that lands; WASS-32 tracks it there (waived here)
- acceptance:
  - [x] `ProblemTypes` (`src/common.ts`) gains one entry for "the submitted
        capability, or a capability in its chain, is already revoked", with
        status 400 in the status table. The fragment spelling is a permanent
        wire value; settled 2026-09-09 as `#capability-already-revoked`
        (`ProblemTypes.CAPABILITY_ALREADY_REVOKED`)
  - [x] The entry's doc comment states that a server emits it only after the
        submission is authorized, so it is not a revocation-state oracle
  - [x] CHANGELOG entry

Discovered 2026-09-09 from wallet-core WC-135. Today the revocation route
reports a resubmission with `INVALID_REQUEST_BODY`, the same type as a chain
that fails to verify, and a client resuming a torn ceremony cannot tell the two
apart.

2026-09-09: the registry half landed. 2026-09-10: published as 0.12.0 and the
`touches` entries shipped; archived.

### SC-3: Typed denial reasons for refused capability invocations

- status: done (2026-09-10)
- priority: low
- labels: errors, registry, zcap
- touches:
  - was-teaching-server: WAS-57 emits them from the capability-invocation
    verification path (shipped, archived 2026-09-10)
  - was-client: WCL-40 maps them to `CapabilityRevokedError` /
    `CapabilityExpiredError` (shipped, 0.57.0)
  - was-conformance-suite: `denial-reasons-api` optional negative-path
    assertions (shipped, 0.14.0)
  - wallet-attached-storage-spec: the types join the revocation spec text
    (WASS-4) when that lands; WASS-32 tracks it there (waived here)
- acceptance:
  - [x] `ProblemTypes` gains `CAPABILITY_REVOKED` (`#capability-revoked`) and
        `CAPABILITY_EXPIRED` (`#capability-expired`), status 404 in the status
        table (settled 2026-09-09: the status stays the merged `not-found`, the
        `type` is the only new signal)
  - [x] Each entry's doc comment states that a server emits it only after the
        request signature and delegation chain verified, so it is not an oracle
        for a prober
  - [x] CHANGELOG entry

Discovered 2026-09-09 from was-teaching-server WAS-57. Today every refused
invocation collapses into `not-found`, so a holder cannot tell a revoked grant
from an expired one or from a verification failure.

2026-09-09: the registry half landed. 2026-09-10: published as 0.13.0 and the
`touches` entries shipped; archived.
