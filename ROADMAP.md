# storage-core Roadmap (open items)

Status as of 2026-08-20. Uses the formalized item structure shared with the
freewallet and was-teaching-server roadmaps (canonical in
isomorphic-lib-template's AGENTS.md, "Roadmap & Task Conventions").

Scope: open work items only. This document tracks the **remaining** items;
completed items move verbatim to [archived-roadmap.md](archived-roadmap.md) as
they land, so SC-N references keep resolving (CHANGELOG.md remains the record of
what landed).

## Item format

Each work item is a `### SC-N: Title` heading followed by a field block and free
prose context. Ids are permanent and never reused; new items take the next
unused number regardless of section. Statuses: `todo`, `in-progress`, `draft`
(no actionable done-state yet -- blocked externally or a parking record); `done`
items move to [archived-roadmap.md](archived-roadmap.md) once shipped.

---

### SC-3: Typed denial reasons for refused capability invocations

- status: in-progress
- priority: low
- labels: errors, registry, zcap
- touches:
  - was-teaching-server: WAS-57 emits them from the capability-invocation
    verification path
  - was-client: maps them to its own error names
  - was-conformance-suite: optional negative-path assertions
  - wallet-attached-storage-spec: the types join the revocation spec text
    (WASS-4) when that lands
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

2026-09-09: the registry half landed (unpublished, 0.13.0); the item stays open
until the `touches` entries ship.

### SC-2: Problem type for an already-revoked revocation submission

- status: in-progress
- priority: medium
- labels: errors, registry, zcap
- touches:
  - was-teaching-server: WAS-91 emits it on
    `POST /space/:spaceId/zcaps/revocations/:id`
  - was-client: WCL-39 maps it to its own error name
  - wallet-attached-storage-spec: the type joins the revocation spec text
    (WASS-4) when that lands
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

2026-09-09: the registry half landed (unpublished, 0.12.0); the item stays open
until the `touches` entries ship.
