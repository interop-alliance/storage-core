# storage-core Roadmap (open items)

nextAvailableId: 10

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
