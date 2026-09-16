# storage-core Roadmap (open items)

nextAvailableId: 8

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

### SC-7: Move the two signature members off `PwsVersionEntry` onto an authorization-profile entry type

- status: todo
- priority: high
- labels: service-description, authorization, wire-contract, breaking
- touches:
  - wallet-attached-storage-spec: WASS-44. SHIPPED (2026-09-16): the zCap
    profile is the companion spec `PWS-AUTHZ`
    (`https://w3c-ccg.github.io/wallet-attached-storage-spec/authz-profile/`)
    with persistent identifier `https://w3id.org/pws/authz-profile` and version
    `0.1`. Its version entry, not core's, carries `signatureAlgorithms` and
    `zcapCryptosuites` (decision 0008 in that repo). Core's entry keeps `spaces`
    and `features`
  - was-teaching-server: WAS-112 lists the profile entry and moves the two
    members; consumes this item's published version
  - was-client: WCL-107 checks for the profile entry and reads the members from
    it; consumes this item's published version
  - was-conformance-suite: its "Authorization profile extraction" roadmap
    section carries the service-description checks; it types the entries locally
    today (`src/suites/service-description-api.ts:165-166`) and can switch to
    these types when it schedules that work
- acceptance:
  - [ ] `PwsVersionEntry` (`src/was.ts`) loses `signatureAlgorithms` and
        `zcapCryptosuites`, and its doc comment loses the two bullets
  - [ ] A new `AuthzProfileVersionEntry extends ServiceDescriptionVersionEntry`
        carries both members as optional string arrays, with a doc comment
        citing the profile's Service Description Entry section
        (`https://w3c-ccg.github.io/wallet-attached-storage-spec/authz-profile/#service-description-entry`)
        and noting that the entry advertises no policy types
  - [ ] The `ServiceDescriptionVersionEntry` doc comment's "The WAS entry is
        PwsVersionEntry" sentence names both entry types
  - [ ] `test/node/serviceDescription.test.ts` (around lines 4-28) exercises the
        new type and no longer places the two members on a `PwsVersionEntry`
  - [ ] Exported from the package's export map alongside `PwsVersionEntry`
  - [ ] CHANGELOG entry marks the removal from `PwsVersionEntry` as breaking;
        publishes before WAS-112 and WCL-107 (publish in dependency order, per
        LEARNINGS.md)

Filed 2026-09-16 from WASS-44. A pure type move: the members' shapes and values
do not change, only which `specs` entry a server puts them on and a client reads
them from. On the identifier constant: no spec-identifier constant lives in this
package today (was-client and was-teaching-server each carry their own
`https://w3id.org/pws` string), so this item adds no constant either; the
identifier string stays with the consumers unless they ask for a shared one.
