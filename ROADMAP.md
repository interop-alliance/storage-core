# storage-core Roadmap (open items)

nextAvailableId: 5

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

---

_No open items._
