# storage-core Roadmap (open items)

Status as of 2026-08-20. Uses the formalized item structure shared with the
freewallet and was-teaching-server roadmaps (canonical in
isomorphic-lib-template's AGENTS.md, "Roadmap & Task Conventions").

Scope: open work items only. This document tracks the **remaining** items;
completed items move verbatim to [archived-roadmap.md](archived-roadmap.md)
as they land, so SC-N references keep resolving (CHANGELOG.md remains the
record of what landed).

## Item format

Each work item is a `### SC-N: Title` heading followed by a field block and
free prose context. Ids are permanent and never reused; new items take the
next unused number regardless of section. Statuses: `todo`, `in-progress`,
`draft` (no actionable done-state yet -- blocked externally or a parking
record); `done` items move to [archived-roadmap.md](archived-roadmap.md) once
shipped.

---

## Wire types

### SC-1: Move `CollectionDescription.indexes` under a new `plaintext` member

- status: todo
- priority: medium
- labels: wire-types, breaking
- touches:
  - storage-core: `src/was.ts` -- `CollectionDescription` gains
    `plaintext?: { indexes?: Array<string | CollectionIndexDeclaration> }`
    and drops the top-level `indexes`; the `CollectionIndexDeclaration`
    entry shape and its doc comment stay; the `encryption` and new
    `plaintext` doc comments state the presence-based mutual exclusion;
    CHANGELOG.md (breaking)
  - was-teaching-server: follows the type (its WAS-63)
  - was-client: unaffected today (`CollectionWritableFields` carries no
    `indexes`; it gains `plaintext` only when an equality binding lands,
    WASS-26 in the spec roadmap)
  - wallet-attached-storage-spec: the shape of record is decision record
    `_spec/decisions/0004-plaintext-and-encryption-counterparts.md`
    (2026-08-20); the spec text itself lands with the `equality` profile
    under WASS-26
- acceptance:
  - [ ] `CollectionDescription` has `plaintext?: { indexes?: ... }` and no
        top-level `indexes`; no compatibility alias for the flat member
        (greenfield move)
  - [ ] Doc comments: `plaintext` is the counterpart of `encryption` (at
        most one present; server rejects both with `invalid-request-body`),
        updatable for the Collection's life; `plaintext.indexes` is
        server-side plaintext indexing, distinct from the client-blinded
        indexes of an encrypted Collection
  - [ ] Published as a breaking release; was-teaching-server WAS-63 picks it
        up

The WAS spec settled server-side indexing as `plaintext.indexes` rather
than a flat `indexes` member (decision 0004, 2026-08-20; text ships with
WASS-26): `plaintext` and
`encryption` are the two mutually exclusive top-level members describing how
the server may treat a Collection's Resources, so the exclusion reads as a
structural fact and "indexes" no longer collides with the blinded indexes of
an encrypted Collection in prose. The flat `indexes` shipped here in 0.3.6
before the spec text existed; nothing downstream consumes it except the
reference server, so the move is cheap now.
