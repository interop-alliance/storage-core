# storage-core Roadmap (open items)

nextAvailableId: 14

Status as of 2026-09-11. Uses the formalized item structure shared with the
freewallet and web-spaces-server roadmaps (canonical in
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

### SC-13: `serverDid` moves from `instance` to the core version entry

- status: todo
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
  - portable-web-spaces-spec: resolved 2026-10-29 -- the core version entry
    defines `serverDid` beside `originId`, and the Instance Disclosure list does
    not carry it
- acceptance:
  - [ ] `PwsVersionEntry` gains `serverDid?: string`, documented as the server's
        own `did:webvh` at the path `space:server:id`, the grantee of a
        replication pull capability, placed here beside `originId` because a
        client gates on it
  - [ ] `ServiceDescription.instance` loses `serverDid`, and its JSDoc no longer
        describes the DID (the export signing method's description stays, under
        SC-12's name)
  - [ ] The `ReplicaCollectionStatus.stall.reason` JSDoc says the token set is
        closed per replication version and a reader treats an unknown token as
        "stalled for an unrecognized reason"
  - [ ] The node test pins the member on the entry and its absence from
        `instance`
  - [ ] CHANGELOG entry names the move as a wire change to the service
        description

Context: the replication companion decided on 2026-10-29 where a server's DID is
advertised. The reference server put it under `instance`, but core says
`instance` is optional operator disclosure a client may not gate on, and a
wallet gates on the DID: it is the `controller` it delegates the pull capability
to, and a server without one cannot hold a replica. So the member sits on the
core `https://w3id.org/pws` entry, as `originId` does and for the same reason.
These are the types the server and clients build against, so the move lands here
first. No alias under `instance` is kept.
