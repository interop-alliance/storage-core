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
