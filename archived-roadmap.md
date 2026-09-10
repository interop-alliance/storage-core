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
