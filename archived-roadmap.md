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
  - was-teaching-server: follows the type (its WSS-63)
  - was-client: unaffected today (`CollectionWritableFields` carries no
    `indexes`; it gains `plaintext` only when an equality binding lands, WASS-26
    in the spec roadmap)
  - portable-web-spaces-spec: the shape of record is decision record
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
  - [ ] Published as a breaking release; was-teaching-server WSS-63 picks it up

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
  - portable-web-spaces-spec: shipped -- WASS-29 landed the spec text 2026-09-11
    (decision `_spec/decisions/0005-container-descriptions-live-at-meta.md`)
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

### SC-5: Service description wire types

- status: done (2026-09-13)
- priority: high
- labels: was-v0.5, discovery, wire-types
- touches:
  - portable-web-spaces-spec: waived -- the Service Description section, drafted
    on branch `service-description` (decision
    `_spec/decisions/0006-service-description.md`)
  - storage-core: `src/was.ts`; a CHANGELOG entry
  - was-teaching-server: waived -- WSS-98 there tracks replacing its hand-built
    return type with `ServiceDescription`
  - was-client: waived -- the fetch/parse helper and version selection consume
    these types (item TBD there)
- acceptance:
  - [x] `ServiceDescription` carries `url` and `specs` (both required) and the
        optional `instance` object (`name`, `version`, `source`, `homepage`)
  - [x] `ServiceDescriptionVersionEntry` carries `version` (required) and `url`
        (optional), and stays open to members the owning specification defines
  - [x] `PwsVersionEntry` adds the optional `spaces`, `features`,
        `signatureAlgorithms`, and `zcapCryptosuites`
  - [x] The exported type names are signed off (2026-09-13:
        `ServiceDescription`, `ServiceDescriptionVersionEntry`,
        `PwsVersionEntry`)
  - [x] Published (consumption by was-teaching-server rides WSS-98 there)

The types model the spec's guarantees, so every WAS entry member is optional.
The `https://w3id.org/pws` identifier is not exported as a constant while the
spec marks it provisional.

2026-09-13: published as 0.15.0; archived. The server's consumption rides
WSS-98, and the spec text rides its `service-description` branch.

### SC-6: Remove `features` from the Backend wire types

- status: done (2026-09-16)
- priority: high
- labels: wire-contract, backends, spec-alignment, breaking
- touches:
  - storage-core: `src/was.ts` (`BackendDescriptor`, `BackendRegistration`,
    `PwsVersionEntry` doc comments), CHANGELOG.md
- acceptance:
  - [x] `BackendDescriptor.features` and `BackendRegistration.features` are
        removed, and the `features` doc comment listing `conditional-writes`,
        `blinded-index-query`, and `chunked-streams` goes with them
  - [x] The `PwsVersionEntry.features` doc comment no longer says "same contract
        as `BackendDescriptor` `features`" or that a Backend token is not
        repeated there; it states the contract on its own (open, additive,
        absent means not supported) and notes that `changes-query` is one of its
        tokens
  - [x] A CHANGELOG.md entry records the breaking removal
  - [x] `touches:` entries resolved

Context (2026-09-16): the WAS spec removed the Backend `features` array
(WASS-40). Conditional writes and key-epoch stamping are baseline server
requirements, `changes-query` is a service-description token, and
`blinded-index-query` and `governed-history-logs` are tokens of the WAS-EC
version entry. The shared wire types here still carry `features` on both Backend
shapes and document the retired tokens, so was-client and the server cannot drop
their gates without this change landing first. Publish in dependency order:
storage-core, then was-client and was-teaching-server.

2026-09-16: the type removal and CHANGELOG entry landed; archived. Rides the
0.17.0 release, after which was-client and was-teaching-server can drop their
gates.

### SC-7: Move the two signature members off `PwsVersionEntry` onto an authorization-profile entry type

- status: done (2026-09-16)
- priority: high
- labels: service-description, authorization, wire-contract, breaking
- touches:
  - portable-web-spaces-spec: WASS-44. SHIPPED (2026-09-16): the zCap profile is
    the companion spec `PWS-AUTHZ`
    (`https://w3c-ccg.github.io/portable-web-spaces-spec/authz-profile/`) with
    persistent identifier `https://w3id.org/pws/authz-profile` and version
    `0.1`. Its version entry, not core's, carries `signatureAlgorithms` and
    `zcapCryptosuites` (decision 0008 in that repo). Core's entry keeps `spaces`
    and `features`
  - was-teaching-server: WSS-112 lists the profile entry and moves the two
    members; consumes this item's published version
  - was-client: WCL-107 checks for the profile entry and reads the members from
    it; consumes this item's published version
  - was-conformance-suite: its "Authorization profile extraction" roadmap
    section carries the service-description checks; it types the entries locally
    today (`src/suites/service-description-api.ts:165-166`) and can switch to
    these types when it schedules that work
- acceptance:
  - [x] `PwsVersionEntry` (`src/was.ts`) loses `signatureAlgorithms` and
        `zcapCryptosuites`, and its doc comment loses the two bullets
  - [x] A new `AuthzProfileVersionEntry extends ServiceDescriptionVersionEntry`
        carries both members as optional string arrays, with a doc comment
        citing the profile's Service Description Entry section
        (`https://w3c-ccg.github.io/portable-web-spaces-spec/authz-profile/#service-description-entry`)
        and noting that the entry advertises no policy types
  - [x] The `ServiceDescriptionVersionEntry` doc comment's "The WAS entry is
        PwsVersionEntry" sentence names both entry types
  - [x] `test/node/serviceDescription.test.ts` (around lines 4-28) exercises the
        new type and no longer places the two members on a `PwsVersionEntry`
  - [x] Exported from the package's export map alongside `PwsVersionEntry`
  - [x] CHANGELOG entry marks the removal from `PwsVersionEntry` as breaking;
        publishes before WSS-112 and WCL-107 (publish in dependency order, per
        LEARNINGS.md)

Filed 2026-09-16 from WASS-44. A pure type move: the members' shapes and values
do not change, only which `specs` entry a server puts them on and a client reads
them from. On the identifier constant: no spec-identifier constant lives in this
package today (was-client and was-teaching-server each carry their own
`https://w3id.org/pws` string), so this item adds no constant either; the
identifier string stays with the consumers unless they ask for a shared one.

2026-09-16: the type move, tests, export, and CHANGELOG entry landed; archived.

## Errors

### SC-2: Problem type for an already-revoked revocation submission

- status: done (2026-09-10)
- priority: medium
- labels: errors, registry, zcap
- touches:
  - was-teaching-server: WSS-91 emits it on
    `POST /space/:spaceId/zcaps/revocations/:id` (shipped)
  - was-client: WCL-39 maps it to its own error name (shipped)
  - portable-web-spaces-spec: the type joins the revocation spec text (WASS-4)
    when that lands; WASS-32 tracks it there (waived here)
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
  - was-teaching-server: WSS-57 emits them from the capability-invocation
    verification path (shipped, archived 2026-09-10)
  - was-client: WCL-40 maps them to `CapabilityRevokedError` /
    `CapabilityExpiredError` (shipped, 0.57.0)
  - was-conformance-suite: `denial-reasons-api` optional negative-path
    assertions (shipped, 0.14.0)
  - portable-web-spaces-spec: the types join the revocation spec text (WASS-4)
    when that lands; WASS-32 tracks it there (waived here)
- acceptance:
  - [x] `ProblemTypes` gains `CAPABILITY_REVOKED` (`#capability-revoked`) and
        `CAPABILITY_EXPIRED` (`#capability-expired`), status 404 in the status
        table (settled 2026-09-09: the status stays the merged `not-found`, the
        `type` is the only new signal)
  - [x] Each entry's doc comment states that a server emits it only after the
        request signature and delegation chain verified, so it is not an oracle
        for a prober
  - [x] CHANGELOG entry

Discovered 2026-09-09 from was-teaching-server WSS-57. Today every refused
invocation collapses into `not-found`, so a holder cannot tell a revoked grant
from an expired one or from a verification failure.

2026-09-09: the registry half landed. 2026-09-10: published as 0.13.0 and the
`touches` entries shipped; archived.

### SC-8: Space Metadata `backends` and the import's `spaceMetadata` outcome

- status: done (2026-09-20)
- priority: medium
- labels: types, spaces, import
- discovered-from: freewallet FW-530
- touches:
  - was-teaching-server: serves `backends` on every Space Metadata read and in
    the export archive's `.space.<id>.json` entry, and reports `spaceMetadata`
    from Import Space
  - portable-web-spaces-spec: the Space Metadata Data Model's `backends` member
    and the import bullet's restore rule (landed 2026-09-20)
- acceptance:
  - [x] `SpaceMetadata` gains the read-only `backends?: BackendDescriptor[]`
  - [x] `ImportStats` gains `spaceMetadata: 'restored' | 'skipped' | 'absent'`
  - [x] CHANGELOG entry

The backend description moves onto the Space Metadata object as a server-derived
member, so a client learns a Space's backends from the object it already reads.
Import restores the archived object's user-writable members (`type` and `name`)
only under an invocation of the Space's root capability, and reports which of
the three outcomes it took.

### SC-9: Collection tombstone item in the List Collections listing

- status: done (2026-10-30)
- priority: medium
- labels: types, collections, replication
- discovered-from: was-teaching-server WSS-174 (2026-10-03)
- touches:
  - storage-core (this repo): shipped 2026-10-03, unpublished (0.31.0) --
    `CollectionTombstoneSummary`, `CollectionsList.items` widened to the union,
    `isCollectionTombstoneSummary`, CHANGELOG.md
  - was-teaching-server: shipped -- the Space listing serves tombstone items
    under `?include=deleted` (its WSS-174), building
    `CollectionTombstoneSummary` from this package
  - was-client: shipped -- `Space.collections()` and `collectionsPages()` return
    `CollectionsList`, and the package re-exports the type and the
    `isCollectionTombstoneSummary` guard; the client never asks for
    `?include=deleted` today
  - portable-web-spaces-spec: unresolved -- the List Collections operation text
    names the `?include=deleted` item shape (its WASS-48)
- acceptance:
  - [x] `CollectionTombstoneSummary` carries `id`, `url`, `deleted: true` and
        the write stamp, with no `name` and no `public`
  - [x] `CollectionsList.items` is the union of `CollectionSummary` and
        `CollectionTombstoneSummary`; `CollectionSummary` is unchanged
  - [x] a guard tells the two apart, with a node test
  - [x] CHANGELOG entry
  - [x] the reference server and was-client build against the widened type

Context: the WAS reference server is moving Delete Collection from a hard delete
to a stamped tombstone, so a deleted Collection does not come back from a
replica that still holds it. A puller learns about the delete from the Space
listing: under `?include=deleted` the listing carries the tombstone as an item
with `deleted: true` and the stamp of the delete (decision 0011 in the WAS spec
repo). The shared listing type had no shape for that item. A tombstone item has
no `name` and no `public` flag, since the Collection Metadata object it would
read them from is gone, so it is its own interface rather than optional members
on `CollectionSummary`. The Collection Metadata object type is unchanged: a
tombstone is never served as a Metadata object.

2026-10-30: archived. The reference server and was-client import the type from
the published package; the spec text rides WASS-48 in the spec repo.

### SC-10: Replica registration and status types

- status: done (2026-10-30)
- priority: medium
- labels: types, spaces, replication
- discovered-from: was-teaching-server WSS-176 (2026-10-04)
- touches:
  - storage-core (this repo): shipped 2026-10-04, unpublished (0.35.0) --
    `ReplicaRegistration`, `ReplicaRole`, `ReplicaSummary`,
    `SpaceMetadata.replicas`, `ReplicaStatus`, `ReplicaCollectionStatus`,
    `ReplicaStallReason`, `ReplicaListing`, `ProblemTypes.REPLICA_REFUSED`,
    `CollectionMetadata.created`, `replicas` and `zcaps` in
    `RESERVED_COLLECTION_IDS`, CHANGELOG.md
  - was-teaching-server: shipped -- the registration routes, the `status`
    sub-resource and the derived `replicas` member (its WSS-176) build against
    these types
  - was-client: shipped -- `Space` exposes the `replicas` member and the
    registration API against these types
  - portable-web-spaces-spec: resolved 2026-10-29 -- the replication companion
    (`replication/spec.md`) and core's Space Metadata object carry these shapes
- acceptance:
  - [x] `ReplicaRegistration` carries `id`, `fromSpace`, `toSpace`,
        `capability`, optional `collections` and `role`
  - [x] `SpaceMetadata.replicas` is a list of `{ fromSpace, toSpace, role }`
        with no registration `id` and no capability
  - [x] `ReplicaStatus` carries the loop `state`, the three pull times and the
        per-Collection items with their optional `stall`
  - [x] a node test pins the shapes
  - [x] CHANGELOG entry
  - [x] the reference server and was-client build against the types

Context: the WAS reference server is adding one-way, pull-only replication of a
Space between servers. A controller registers a source peer at a controller-only
sub-resource of the Space, and the server serves the loop's runtime state at a
`status` sub-resource beside it. The shapes were decided in the server's
multi-primary design (its wire items 6 and 7) and its decision record 0005. The
stall `reason` tokens, the listing object, the `replica-refused` problem type
and the nested `created` stamp were decided on 2026-10-04.

2026-10-30: archived. The reference server and was-client import the types from
the published package.

### SC-12: Rename `instance.exportSigningKey` to `exportSigningMethod`

- status: done (2026-10-30)
- priority: medium
- labels: types, service-description, provenance
- discovered-from: portable-web-spaces-spec WASS-7 (2026-10-29)
- touches:
  - storage-core (this repo): `src/was.ts` (the service description's `instance`
    member and its JSDoc), CHANGELOG.md
  - was-teaching-server: shipped 2026-10-30 -- WSS-235 (the member it writes on
    `/service`, its identity module, README, ARCHITECTURE.md and the admin
    guide)
  - portable-web-spaces-spec: resolved 2026-10-29 -- the Instance Disclosure
    list and the Archive provenance section use the new name
  - was-client: unaffected (nothing in it reads the member)
- acceptance:
  - [x] the `instance` type's `exportSigningKey` member is
        `exportSigningMethod`, with the same `did:key` value and optionality
  - [x] the JSDoc describes it as the verification method the instance signs
        Space archives with, and `serverDid`'s JSDoc names it by the new name
  - [x] CHANGELOG entry names the rename as a wire change to the service
        description

Context: the service description's `instance` member advertises the key a server
signs its Space archive exports with. The member was named `exportSigningKey`,
but its value is a `did:key`, which is a verification method identifier rather
than key material. The PWS spec renamed the member to `exportSigningMethod` on
2026-10-29 so the name says what the value is. This is the type the reference
server and clients build against, so the rename lands here first. No
backwards-compatible alias is kept.

### SC-11: Replica pause member, the `paused` state, and the replication IRI constant

- status: done (2026-10-30)
- priority: medium
- labels: types, spaces, replication
- discovered-from: freewallet FW-688 (2026-10-26)
- touches:
  - storage-core (this repo): `src/was.ts` (`ReplicaRegistration`,
    `ReplicaStatus`, `ReplicaListing` and their JSDoc), the replication IRI
    constant, CHANGELOG.md
  - web-spaces-server: the `pausedAt` member, its PUT and the in-place
    capability replacement shipped (2026-10-27, consuming these types through a
    `link:` dependency until 0.40.0 is published); the delegated replicas route
    is its WSS-226
  - was-client: unresolved -- WCL-137 (pause, resume, and the capability
    replacement on `Space`) builds against these types
  - portable-web-spaces-spec: resolved 2026-10-29 -- decision 0013 amended and
    the replication companion's text (the pause, the replacement, the delegated
    route)
  - freewallet: unresolved -- FW-688 / FW-638's pre-flight reads the replication
    entry by the IRI constant
- acceptance:
  - [x] `ReplicaRegistration` (`src/was.ts:1079-1101`) gains an optional
        `pausedAt`: an ISO 8601 UTC time, absent meaning not paused, written and
        cleared by PUT on the registration URL
  - [x] `ReplicaStatus.state` (`src/was.ts:1191-1192`) gains `paused`, and the
        interface's JSDoc state list describes it
  - [x] The JSDoc stops calling the registration route controller-only: the
        `ReplicaRegistration` header (`:1073`), its `capability` member ("serves
        it back to the controller only", `:1092`), `ReplicaListing` (`:1145`),
        and `ReplicaStatus` (`:1182`). The route admits a delegated invocation
        whose chain roots in the Space's root. The header also names PUT, which
        pauses, resumes, and replaces the pull capability in place, keeping the
        registration `id`
  - [x] An exported constant carries the replication spec identifier
        `https://w3id.org/pws/replication`, so a client reads
        `description.specs[...]` without a string literal
  - [x] The node test pins the new member and state
  - [x] CHANGELOG entry

Context: freewallet FW-688 lets every session kind keep a replica of the account
Space on a second server. Stopping a replica keeps its copy as a snapshot. The
server refuses to remove the registration that maps the Space's did:webvh
controller, so Stop pauses the registration instead of removing it. The pause is
`pausedAt` on the registration record, and the loop's `status` reads `paused`
while it is set. Clearing it resumes the loop from its checkpoint. The same PUT
can replace a registration's pull capability in place, since every pull grant
dies when its signer is withdrawn. The replication version stays `0.1`, as
replication has not shipped. No constant for the replication IRI exists in
storage-core or was-client today. The reference server defines its own
(`REPLICATION_IDENTIFIER`, web-spaces-server `src/config.default.ts:449`), and
was-client keeps the base spec's id in an internal constant (`PWS_SPEC_ID`,
`src/internal/service.ts:28`). The design allows the constant on was-client
instead. It is filed here since the `ServiceDescription` types live here.

2026-10-30: archived. The types, the JSDoc and `REPLICATION_SPEC_ID` shipped in
0.44.0; the was-client and freewallet items ride WCL-137 and FW-688 in their own
repos.

### SC-13: `serverDid` moves from `instance` to the core version entry

- status: done (2026-10-30)
- priority: medium
- labels: types, service-description, replication
- discovered-from: portable-web-spaces-spec WASS-50 (2026-10-29)
- touches:
  - storage-core (this repo): `src/was.ts` (`ServiceDescription.instance`,
    `PwsVersionEntry` and both JSDoc blocks; the `ReplicaCollectionStatus` stall
    JSDoc), the node test over the service description shapes, CHANGELOG.md
  - web-spaces-server: unresolved -- WSS-238 (serves the member on the core
    entry and `url` on the replication entry)
  - was-client: unresolved -- WCL-144 (`ServiceInfo.entry` exposes it and the
    replica docs point at it)
  - freewallet: unresolved -- FW-638's pre-flight reads the DID off the core
    entry
  - portable-web-spaces-spec: text landed 2026-10-29 on the `replication-spec`
    branch (the core version entry defines `serverDid` beside `originId`, and
    the Instance Disclosure list does not carry it); not merged to `main` as of
    2026-10-30, so published spec text does not yet carry the member
- acceptance:
  - [x] `PwsVersionEntry` gains `serverDid?: string`, documented as the server's
        own `did:webvh` at the path `space:server:id`, the grantee of a
        replication pull capability, placed here beside `originId` because a
        client gates on it
  - [x] `ServiceDescription.instance` loses `serverDid`, and its JSDoc no longer
        describes the DID (the export signing method's description stays, under
        SC-12's name)
  - [x] The `ReplicaCollectionStatus.stall.reason` JSDoc says the token set is
        closed per replication version and a reader treats an unknown token as
        "stalled for an unrecognized reason"
  - [x] The node test pins the member on the entry and its absence from
        `instance`
  - [x] CHANGELOG entry names the move as a wire change to the service
        description

Context: the replication companion decided on 2026-10-29 where a server's DID is
advertised. The reference server put it under `instance`, but core says
`instance` is optional operator disclosure a client may not gate on, and a
wallet gates on the DID: it is the `controller` it delegates the pull capability
to, and a server without one cannot hold a replica. So the member sits on the
core `https://w3id.org/pws` entry, as `originId` does and for the same reason.
These are the types the server and clients build against, so the move lands here
first. No alias under `instance` is kept.

2026-10-30: archived. The type move, the JSDoc, the test and the CHANGELOG entry
landed in 0.44.0; the server, was-client and freewallet items ride WSS-238,
WCL-144 and FW-638 in their own repos.
