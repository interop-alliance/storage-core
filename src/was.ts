/*!
 * Copyright (c) 2026 Interop Alliance. All rights reserved.
 */
/**
 * The Wallet Attached Storage (WAS) data model: the on-the-wire JSON shapes a
 * WAS server emits and a client parses -- Space / Collection / Resource
 * descriptions and summaries, listing shapes, resource metadata, the backend
 * descriptor / usage shapes, the quota report, and the access-control policy
 * document.
 *
 * These types are modeled to what the spec *guarantees* (e.g. on a
 * {@link BackendDescriptor} only `id` is required). A producer that always
 * populates the optional fields asserts that locally with `satisfies
 * Required<T>` at the construction site rather than declaring a stricter type
 * here.
 *
 * `controller` references `IDID` from `@interop/data-integrity-core` via a
 * type-only import; that type is *used* in declarations but not re-exported --
 * consumers that need `IDID` import it directly from `data-integrity-core`.
 */
import type { IDID } from '@interop/data-integrity-core'

import type { Action, StorageLimit } from './common.js'

/**
 * A Space Description object -- the metadata stored for a Space.
 */
export interface SpaceDescription {
  id: string
  /** e.g. `['Space']` */
  type: string[]
  /** optional human-readable name for the Space (see spec) */
  name?: string
  /** the `did:key` that owns (controls) the Space */
  controller: IDID
  /** absolute URL of the Space, when the server populates it */
  url?: string
  /**
   * URL of the Space's linkset resource (RFC9264), where auxiliary resources
   * such as the access-control `policy` are discovered. Attached at response
   * time, not persisted.
   */
  linkset?: string
}

/**
 * A reference to a storage backend, used when creating or configuring a
 * Collection and when describing the backend a Collection is stored on.
 */
export interface BackendReference {
  id: string
}

/**
 * A Collection Description object -- the metadata stored for a Collection.
 */
export interface CollectionDescription {
  id: string
  /** e.g. `['Collection']` */
  type: string[]
  name?: string
  /** absolute URL of the Collection, when the server populates it */
  url?: string
  /**
   * The storage backend selected for this Collection (spec "Collection Backend
   * Selected"). Its `id` MUST be one of the Space's backends-available. Omitted
   * by a client at create time, the server fills it with the default
   * `{ id: 'default' }`; persisted thereafter.
   */
  backend?: BackendReference
  /**
   * URL of the Collection's linkset resource (RFC9264); see
   * `SpaceDescription.linkset`. Attached at response time, not persisted.
   */
  linkset?: string
}

/**
 * An access-control policy document attached to a Space, Collection, or
 * Resource (the `policy` reserved resource at each level). A `type`-discriminated
 * open shape: v1 recognizes only `{ "type": "PublicCanRead" }`. Unrecognized
 * `type` values grant nothing (fail-closed), so the request falls through to the
 * normal zcap-only authorization decision. Policies are permissive-only: they
 * can broaden access beyond what a capability grants, never restrict a valid
 * capability holder.
 */
export interface PolicyDocument {
  type: string
  [key: string]: unknown
}

/** One entry in a {@link SpaceListing} (a Space within the repository). */
export interface SpaceSummary {
  id: string
  name?: string
  /** relative URL of the Space */
  url: string
}

/**
 * Return shape of the List Spaces operation (`GET /spaces/`): the Spaces within
 * the repository the caller is authorized to see.
 */
export interface SpaceListing {
  url: string
  totalItems: number
  items: SpaceSummary[]
}

/** One entry in a {@link CollectionsList} (a Collection within a Space). */
export interface CollectionSummary {
  id: string
  /** relative URL, `/space/:spaceId/:collectionId` */
  url: string
  name: string
}

/**
 * Return shape of the List Collections operation (the Collections within one
 * Space). Renamed from the former `CollectionListing` to disambiguate it from
 * {@link CollectionResourcesList}.
 */
export interface CollectionsList {
  url: string
  totalItems: number
  items: CollectionSummary[]
}

/** One entry in a {@link CollectionResourcesList} (a Resource within a Collection). */
export interface ResourceSummary {
  id: string
  /** relative URL of the Resource */
  url: string
  contentType: string
  /** human-readable name from the Resource's `custom.name`, when set */
  name?: string
}

/**
 * Return shape of the List Collection operation (the Resources within one
 * Collection). Renamed from the former `CollectionListing` (server) /
 * `ResourceListing` (client) to disambiguate it from {@link CollectionsList}.
 */
export interface CollectionResourcesList {
  id: string
  url: string
  /**
   * The listing-level name (the Collection's name). Mirrors the Collection
   * Description's `name`.
   */
  name?: string
  type: string[]
  totalItems: number
  items: ResourceSummary[]
}

/**
 * The user-writable portion of a Resource's Metadata object (spec "Resource
 * Metadata Data Model"), nested under `custom`. Set via Update Resource Metadata
 * (`PUT .../meta`); a full replacement, so any property omitted is cleared.
 */
export interface ResourceMetadataCustom {
  /**
   * Human-readable name for the Resource. The same `name` returned by List
   * Collection -- updating it here updates the name shown in listings.
   */
  name?: string
  /** Application-defined annotations; values SHOULD be strings (spec). */
  tags?: Record<string, string>
}

/**
 * A Resource Metadata object (spec "Resource Metadata Data Model"), addressable
 * at the reserved `/meta` segment under a Resource. `contentType` and `size` are
 * the REQUIRED server-managed fields; `createdAt` / `updatedAt` are the OPTIONAL
 * server-managed timestamps, and `custom` holds the user-writable properties.
 */
export interface ResourceMetadata {
  /** MIME type of the stored representation */
  contentType: string
  /** length in bytes of the stored representation */
  size: number
  /** RFC3339 date-time the Resource was created */
  createdAt?: string
  /** RFC3339 date-time the Resource's content or custom metadata last changed */
  updatedAt?: string
  /** user-writable properties (omitted when none are set) */
  custom?: ResourceMetadataCustom
}

/**
 * A Backend description object (spec "Backend Data Model"), as returned in the
 * array at `GET /space/:spaceId/backends`. The spec only REQUIRES `id` and
 * defines defaults for the rest; a server that always populates the optional
 * fields asserts that at its construction site (`satisfies
 * Required<BackendDescriptor>`).
 *
 * - `id` -- the registration id under the Space (`default` for the single
 *   server-configured backend the reference server ships with).
 * - `name` -- a human-readable label.
 * - `managedBy` -- who operates the backend: `server` (configured server-side)
 *   or `external` (a Bring Your Own Storage provider registered by the client).
 *   Spec default: `server`.
 * - `storageMode` -- which representations the backend can store: `document`
 *   (structured JSON) and/or `blob` (opaque binary). Spec default: both.
 * - `persistence` -- whether the storage engine keeps data on persistent media
 *   that survives a restart (`durable`) or only in memory (`volatile`). Spec
 *   default: `durable`.
 * - `features` -- the optional capability vocabulary a backend advertises so
 *   clients can gate behavior on the optional _server affordances_ the backend
 *   actually provides. Additive and optional: an omitted `features` (or one not
 *   listing a given token) means the backend makes no claim to that affordance,
 *   so clients MUST treat an absent feature as unsupported rather than assuming
 *   a default. Each token names something the server must actively do. The
 *   currently defined tokens:
 *     - `conditional-writes` -- the backend enforces previous+1 `sequence` /
 *       `If-Match` conditional writes (a general WAS mechanism EDV is the first
 *       customer for).
 *     - `blinded-index-query` -- the backend serves the blinded-index profile
 *       of the reserved `/query` endpoint.
 *     - `chunked-streams` -- the backend supports chunk addressing for large
 *       blobs (the reserved `/{resourceId}/chunks/{n}` sub-segment).
 *   The vocabulary is open: backends MAY advertise additional, profile-defined
 *   tokens, and clients MUST ignore tokens they do not recognize.
 */
export interface BackendDescriptor {
  id: string
  name?: string
  managedBy?: 'server' | 'external'
  storageMode?: Array<'document' | 'blob'>
  persistence?: 'durable' | 'volatile'
  features?: string[]
}

/**
 * A backend's current condition in a quota report (spec "Quotas"). `ok`,
 * `near-limit`, and `over-quota` are derived from usage vs the configured limit;
 * `unreachable` is reserved for `external` backends whose provider cannot be
 * queried (the server-managed filesystem backend never reports it).
 */
export type BackendState = 'ok' | 'near-limit' | 'over-quota' | 'unreachable'

/** One Collection's consumption within a backend's `usageByCollection` array. */
export interface CollectionUsage {
  id: string
  usageBytes: number
}

/**
 * One backend's entry in a {@link SpaceQuotaReport} (spec "Quotas"). Combines
 * the backend's identifying properties (`id` / `name` / `managedBy`, from its
 * `describe()`) with the measured usage for the reporting Space.
 *
 * - `usageBytes` -- total bytes this Space consumes on this backend.
 * - `restrictedActions` -- capability actions (uppercase HTTP verbs) currently
 *   unavailable on the backend; e.g. a full backend reports `["POST", "PUT"]`
 *   while still permitting reads and deletes.
 * - `measuredAt` -- when the usage numbers were measured (distinct from the
 *   report's top-level `respondedAt`).
 * - `usageByCollection` -- per-Collection breakdown. The spec makes this opt-in
 *   via `?include=collections`; the field stays optional so a backend may omit
 *   it.
 */
export interface BackendUsage {
  id: string
  name?: string
  managedBy: 'server' | 'external'
  state: BackendState
  usageBytes: number
  limit: StorageLimit
  /** operational constraints such as `maxUploadBytes` */
  constraints?: { maxUploadBytes?: number; [key: string]: unknown }
  restrictedActions: Action[]
  measuredAt: string
  usageByCollection?: CollectionUsage[]
}

/**
 * The Space Quota report (spec "Quotas"), returned by
 * `GET /space/:spaceId/quotas`: a measurement timestamp plus one
 * {@link BackendUsage} entry per backend registered for the Space.
 */
export interface SpaceQuotaReport {
  respondedAt: string
  backends: BackendUsage[]
}

/**
 * Return shape of the Import Space operation: a per-merge tally.
 */
export interface ImportStats {
  collectionsCreated: number
  collectionsSkipped: number
  resourcesCreated: number
  resourcesSkipped: number
  policiesCreated: number
  policiesSkipped: number
}
