# storage-core Roadmap (open items)

nextAvailableId: 14

Status as of 2026-09-11. Uses the formalized item structure shared with the
freewallet and was-teaching-server roadmaps (canonical in
isomorphic-lib-template's AGENTS.md, "Roadmap & Task Conventions").

Scope: open work items only. This document tracks the **remaining** items;
completed items move verbatim to [archived-roadmap.md](archived-roadmap.md) as
they land, so SC-N references keep resolving (CHANGELOG.md remains the record of
what landed).

## Item format

Each work item is a `### SC-N: Title` heading followed by a field block and free
prose context. Ids are permanent and never reused. The `nextAvailableId` line
under the H1 is the sole source of the next id: filing an item takes it and
rewrites the line to one higher, in the same edit. Never derive the next id by
scanning this file -- the highest id usually lives in
[archived-roadmap.md](archived-roadmap.md). If the counter's id already appears
in either file, reset it to one past the highest id across both, then take it.
(Seeded 2026-09-11 from the archive's max plus one.) Statuses: `todo`,
`in-progress`, `draft` (no actionable done-state yet -- blocked externally or a
parking record); `done` items move to [archived-roadmap.md](archived-roadmap.md)
once shipped.

### SC-9: Collection tombstone item in the List Collections listing

- status: in-progress
- priority: medium
- labels: types, collections, replication
- discovered-from: was-teaching-server WAS-174 (2026-10-03)
- touches:
  - storage-core (this repo): shipped 2026-10-03, unpublished (0.31.0) --
    `CollectionTombstoneSummary`, `CollectionsList.items` widened to the union,
    `isCollectionTombstoneSummary`, CHANGELOG.md
  - was-teaching-server: unresolved -- the Space listing serves tombstone items
    under `?include=deleted` (its WAS-174), replacing its local
    `CollectionTombstoneSummary` with this one
  - was-client: unresolved -- `Space.collections()` and `collectionsPages()`
    return `CollectionsList`, so code reading `name` off an item narrows it
    first; the client never asks for `?include=deleted` today
  - wallet-attached-storage-spec: unresolved -- the List Collections operation
    text names the `?include=deleted` item shape (its WASS-48)
- acceptance:
  - [x] `CollectionTombstoneSummary` carries `id`, `url`, `deleted: true` and
        the write stamp, with no `name` and no `public`
  - [x] `CollectionsList.items` is the union of `CollectionSummary` and
        `CollectionTombstoneSummary`; `CollectionSummary` is unchanged
  - [x] a guard tells the two apart, with a node test
  - [x] CHANGELOG entry
  - [ ] the reference server and was-client build against the widened type

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

### SC-10: Replica registration and status types

- status: in-progress
- priority: medium
- labels: types, spaces, replication
- discovered-from: was-teaching-server WAS-176 (2026-10-04)
- touches:
  - storage-core (this repo): shipped 2026-10-04, unpublished (0.35.0) --
    `ReplicaRegistration`, `ReplicaRole`, `ReplicaSummary`,
    `SpaceMetadata.replicas`, `ReplicaStatus`, `ReplicaCollectionStatus`,
    `ReplicaStallReason`, `ReplicaListing`, `ProblemTypes.REPLICA_REFUSED`,
    `CollectionMetadata.created`, `replicas` and `zcaps` in
    `RESERVED_COLLECTION_IDS`, CHANGELOG.md
  - was-teaching-server: unresolved -- the registration routes, the `status`
    sub-resource and the derived `replicas` member (its WAS-176)
  - was-client: unresolved -- the `replicas` member and a registration API
  - wallet-attached-storage-spec: resolved 2026-10-29 -- the replication
    companion (`replication/spec.md`) and core's Space Metadata object carry
    these shapes
- acceptance:
  - [x] `ReplicaRegistration` carries `id`, `fromSpace`, `toSpace`,
        `capability`, optional `collections` and `role`
  - [x] `SpaceMetadata.replicas` is a list of `{ fromSpace, toSpace, role }`
        with no registration `id` and no capability
  - [x] `ReplicaStatus` carries the loop `state`, the three pull times and the
        per-Collection items with their optional `stall`
  - [x] a node test pins the shapes
  - [x] CHANGELOG entry
  - [ ] the reference server and was-client build against the types

Context: the WAS reference server is adding one-way, pull-only replication of a
Space between servers. A controller registers a source peer at a controller-only
sub-resource of the Space, and the server serves the loop's runtime state at a
`status` sub-resource beside it. The shapes were decided in the server's
multi-primary design (its wire items 6 and 7) and its decision record 0005. The
stall `reason` tokens, the listing object, the `replica-refused` problem type
and the nested `created` stamp were decided on 2026-10-04.

### SC-11: Replica pause member, the `paused` state, and the replication IRI constant

- status: in-progress
- priority: medium
- labels: types, spaces, replication
- discovered-from: freewallet FW-688 (2026-10-26)
- touches:
  - storage-core (this repo): `src/was.ts` (`ReplicaRegistration`,
    `ReplicaStatus`, `ReplicaListing` and their JSDoc), the replication IRI
    constant, CHANGELOG.md
  - was-teaching-server: the `pausedAt` member, its PUT and the in-place
    capability replacement shipped (2026-10-27, consuming these types through a
    `link:` dependency until 0.40.0 is published); the delegated replicas route
    is its WAS-226
  - was-client: unresolved -- WCL-137 (pause, resume, and the capability
    replacement on `Space`) builds against these types
  - portable-web-spaces-spec: resolved 2026-10-29 -- decision 0013 amended and
    the replication companion's text (the pause, the replacement, the
    delegated route)
  - freewallet: unresolved -- FW-688 / FW-638's pre-flight reads the replication
    entry by the IRI constant
- acceptance:
  - [x] `ReplicaRegistration` (`src/was.ts:1079-1101`) gains an optional
        `pausedAt`: an ISO 8601 UTC time, absent meaning not paused, written and
        cleared by PUT on the registration URL
  - [x] `ReplicaStatus.state` (`src/was.ts:1191-1192`) gains `paused`, and the
        interface's JSDoc state list describes it
  - [ ] The JSDoc stops calling the registration route controller-only: the
        `ReplicaRegistration` header (`:1073`), its `capability` member ("serves
        it back to the controller only", `:1092`), `ReplicaListing` (`:1145`),
        and `ReplicaStatus` (`:1182`). The route admits a delegated invocation
        whose chain roots in the Space's root. The header also names PUT, which
        pauses, resumes, and replaces the pull capability in place, keeping the
        registration `id`
  - [ ] An exported constant carries the replication spec identifier
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
(`REPLICATION_IDENTIFIER`, was-teaching-server `src/config.default.ts:449`), and
was-client keeps the base spec's id in an internal constant (`PWS_SPEC_ID`,
`src/internal/service.ts:28`). The design allows the constant on was-client
instead. It is filed here since the `ServiceDescription` types live here.

### SC-13: `serverDid` moves from `instance` to the core version entry

- status: todo
- priority: medium
- labels: types, service-description, replication
- discovered-from: portable-web-spaces-spec WASS-50 (2026-10-29)
- touches:
  - storage-core (this repo): `src/was.ts` (`ServiceDescription.instance`,
    `PwsVersionEntry` and both JSDoc blocks; the `ReplicaCollectionStatus`
    stall JSDoc), the node test over the service description shapes,
    CHANGELOG.md
  - was-teaching-server: unresolved -- WAS-238 (serves the member on the core
    entry and `url` on the replication entry)
  - was-client: unresolved -- WCL-144 (`ServiceInfo.entry` exposes it and the
    replica docs point at it)
  - freewallet: unresolved -- FW-638's pre-flight reads the DID off the core
    entry
  - portable-web-spaces-spec: resolved 2026-10-29 -- the core version entry
    defines `serverDid` beside `originId`, and the Instance Disclosure list
    does not carry it
- acceptance:
  - [ ] `PwsVersionEntry` gains `serverDid?: string`, documented as the
        server's own `did:webvh` at the path `space:server:id`, the grantee of
        a replication pull capability, placed here beside `originId` because a
        client gates on it
  - [ ] `ServiceDescription.instance` loses `serverDid`, and its JSDoc no
        longer describes the DID (the export signing method's description
        stays, under SC-12's name)
  - [ ] The `ReplicaCollectionStatus.stall.reason` JSDoc says the token set is
        closed per replication version and a reader treats an unknown token as
        "stalled for an unrecognized reason"
  - [ ] The node test pins the member on the entry and its absence from
        `instance`
  - [ ] CHANGELOG entry names the move as a wire change to the service
        description

Context: the replication companion decided on 2026-10-29 where a server's DID
is advertised. The reference server put it under `instance`, but core says
`instance` is optional operator disclosure a client may not gate on, and a
wallet gates on the DID: it is the `controller` it delegates the pull
capability to, and a server without one cannot hold a replica. So the member
sits on the core `https://w3id.org/pws` entry, as `originId` does and for the
same reason. These are the types the server and clients build against, so the
move lands here first. No alias under `instance` is kept.
