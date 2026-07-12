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
  /**
   * DID of the party whose capability invocation created the Space.
   * Server-managed and read-only: a value supplied in a write body is ignored,
   * and the recorded value is preserved across later writes. Distinct from
   * `controller` -- under delegated provisioning the creator need not be the
   * owner. OPTIONAL (spec "Space Data Model"): an absent value means "not
   * recorded", not "no creator".
   */
  createdBy?: IDID
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
 * One recipient's wrapped copy of an epoch's collection key, in a
 * {@link CollectionEncryptionEpoch}. Deliberately the JWE general-serialization
 * `recipients` entry shape verbatim (RFC7516: a `header` -- `kid` naming the
 * recipient's key-agreement key, `alg` such as `ECDH-ES+A256KW`, and the
 * key-agreement members like `epk` / `apu` / `apv` -- plus the wrapped key as
 * `encrypted_key`): the same shape an EDV envelope's `recipients` array carries,
 * so there is one wire vocabulary for "a key wrapped to a recipient". Nothing
 * secret appears here -- `kid`/`epk` are public keys and `encrypted_key` is
 * ciphertext only the named recipient can unwrap.
 */
export interface CollectionEncryptionRecipient {
  header: { kid: string; alg: string; [member: string]: unknown }
  encrypted_key: string
}

/**
 * One key epoch of an encrypted Collection: an opaque epoch `id` plus the
 * epoch's collection key wrapped once per recipient. Resources are encrypted
 * under exactly one epoch and carry its id in {@link ResourceMetadata.epoch};
 * a reader resolves its own `kid` among `recipients` and unwraps that epoch's
 * key. Old epochs stay listed so Resources stored under them remain readable
 * by the readers who hold them; removing a reader means minting a NEW epoch
 * without it (never editing an existing one), so epochs are append-only.
 */
export interface CollectionEncryptionEpoch {
  id: string
  recipients: CollectionEncryptionRecipient[]
}

/**
 * The client-side encryption marker for a Collection -- a non-secret, declared
 * property any authorized reader can discover by reading the Collection
 * Description, to learn that the Collection's Resources are client-encrypted and
 * which scheme was used, so it selects the matching codec and supplies its own
 * keys from its wallet/keystore.
 *
 * A `scheme`-discriminated union (modeled like {@link BackendReference}, not an
 * open bag): v1 recognizes only EDV-over-WAS (`scheme: 'edv'`). Future schemes
 * add variants here. The `'edv'` variant's other members are **public
 * references** only:
 *
 * - `epochs` / `currentEpoch` -- the key-epoch list for a multi-recipient
 *   Collection (see {@link CollectionEncryptionEpoch}): each epoch wraps a
 *   collection key to every recipient, writes use `currentEpoch`, and removing
 *   a reader appends a fresh epoch that excludes it. `currentEpoch` MUST name
 *   an entry in `epochs`; servers additionally enforce that `epochs` is
 *   append-only and `currentEpoch` never moves back to an older epoch (a
 *   dropped epoch would strand every Resource stamped with it).
 * - `hmac` -- a blinded-index HMAC key reference, a forward candidate added
 *   when the client code that consumes it lands. Note the blinded-index key
 *   deliberately does NOT rotate with the epoch: rotating it would invalidate
 *   every blinded index in the Collection on every reader removal.
 *
 * Key **material** never appears in this marker: encryption is a per-Collection
 * client concern, never a backend capability, and the server stores this marker
 * opaquely while keys stay in the client's keystore.
 */
export type CollectionEncryption = {
  scheme: 'edv'
  currentEpoch?: string
  epochs?: CollectionEncryptionEpoch[]
}

/**
 * A Collection Description object -- the metadata stored for a Collection.
 */
export interface CollectionDescription {
  id: string
  /** e.g. `['Collection']` */
  type: string[]
  name?: string
  /**
   * DID of the party whose capability invocation created the Collection.
   * Server-managed and read-only, on the same terms as the Space's `createdBy`.
   * OPTIONAL (spec "Collection Data Model").
   */
  createdBy?: IDID
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
   * The client-side encryption marker for this Collection (see
   * {@link CollectionEncryption}). Present iff the Collection's Resources are
   * client-encrypted; absent means plaintext. Declared by a client at create
   * time and persisted thereafter (the server stores it opaquely and never sees
   * key material). Set-once: a server MAY allow declaring it on a Collection
   * that lacks it, but MUST reject changing or clearing an existing marker
   * (changing the encryption mode of a populated Collection corrupts its data).
   */
  encryption?: CollectionEncryption
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
  /**
   * The key-epoch id the Resource was encrypted under, when the writer
   * declared one (see {@link ResourceMetadata.epoch}). Surfaced in listings so
   * a reader can pick the right epoch key without a `/meta` fetch per item.
   */
  epoch?: string
}

/**
 * The keyset position of a `changes` feed page (spec "Query Profile Registry",
 * the `changes` profile): the `(updatedAt, id)` pair of the last document
 * returned. Passed back to resume strictly after it. Opaque to a client --
 * a position token, not a timestamp to do arithmetic on.
 */
export interface ChangesCheckpoint {
  id: string
  updatedAt: string
}

/**
 * One document of the `changes` query profile's replication feed. A tombstone
 * (a soft-deleted Resource) has `_deleted: true` and no `data`; its
 * server-managed properties still travel, so a delete replicates with its
 * attribution intact. Binary (non-JSON) Resources are excluded from the feed.
 *
 * `data` and `custom` are exactly what the server stores. On an encrypted
 * Collection both are the declared scheme's opaque envelope rather than
 * plaintext -- for the v1 `edv` scheme, an EDV encrypted document
 * (`{ id, sequence, jwe, indexed? }`, `IEncryptedDocument` in
 * `@interop/data-integrity-core`), whose JWE is nested at `.jwe`. They are
 * deliberately NOT typed as that envelope: the `scheme` registry is open, so a
 * future scheme's envelope need not be an EDV document, and the server stores
 * whichever it is verbatim without decrypting. `data` is `unknown` also because
 * a plaintext Resource body may be any JSON value, a bare primitive included.
 *
 * Note this is the WIRE shape (`id` / `_deleted`), which a server's internal
 * storage-port shape need not match.
 */
export interface ChangeDocument {
  /** the Resource id */
  id: string
  /** `true` on a tombstone */
  _deleted: boolean
  /** RFC3339 date-time of the change; half of the checkpoint keyset */
  updatedAt: string
  /** the Resource's monotonic content version (its `ETag` validator) */
  version: number
  /** the independent `/meta` version, once metadata has been written */
  metaVersion?: number
  /**
   * DID of the Resource's creator, when one was recorded. Rides the feed so a
   * replica learns provenance without fetching `/meta` per Resource; a
   * tombstone keeps it. See {@link ResourceMetadata.createdBy}.
   */
  createdBy?: IDID
  /**
   * The key-epoch id the Resource was encrypted under, when the writer
   * declared one (see {@link ResourceMetadata.epoch}). Rides the feed so a
   * replicating reader can pick the right epoch key without fetching `/meta`
   * per Resource; a puller encountering an epoch id it does not know must
   * re-read the Collection Description (a rekey changes the description only
   * and emits no feed entry).
   */
  epoch?: string
  /** the stored JSON body, or its encryption envelope; absent on a tombstone */
  data?: unknown
  /**
   * the user-writable metadata (`{ name, tags }`) on a plaintext Collection,
   * or its encryption envelope on an encrypted one
   */
  custom?: ResourceMetadataCustom | Record<string, unknown>
}

/**
 * One page of the `changes` feed. `checkpoint` is the position to resume after,
 * or `null` on an empty page (nothing changed). A page shorter than the
 * requested `limit` means the caller has caught up.
 */
export interface ChangesPage {
  documents: ChangeDocument[]
  checkpoint: ChangesCheckpoint | null
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
  /**
   * Pagination continuation link (spec "Pagination"). When present, a URL the
   * client dereferences (with the same authorization) to retrieve the following
   * page; the server bakes the opaque `cursor` (and any `limit`) into it.
   * Present if and only if more items may follow -- its absence is the
   * authoritative end-of-list signal (do not infer page count from
   * `totalItems`). Omitted by a server that returns every item in one response.
   */
  next?: string
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
 *
 * `createdBy` is an OPTIONAL server-managed property: a server MAY record who
 * created a Resource, and a client MUST treat an absent `createdBy` as "not
 * recorded" rather than as an assertion that the Resource has no creator.
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
  /**
   * DID of the party whose capability invocation created the Resource. Set on
   * the first write and preserved across later writes, so it names the creator
   * rather than the last writer. Server-managed and read-only: it is not
   * settable through Update Resource Metadata.
   */
  createdBy?: IDID
  /**
   * The key-epoch id the Resource's content was encrypted under (an id from
   * the Collection's `encryption.epochs`), on an encrypted multi-recipient
   * Collection. Client-declared: the writer stamps the epoch it encrypted
   * with, and the server stores the value opaquely -- it cannot compute or
   * verify it, since it never holds a key. A reader resolves this id (falling
   * back to the marker's `currentEpoch` when absent) to pick which epoch key
   * to unwrap BEFORE attempting decryption. Deliberately a sibling of
   * `custom`, not inside it: on an encrypted Collection `custom` IS the opaque
   * envelope and is full-replaced by every metadata write, so a value inside
   * it would be lost.
   */
  epoch?: string
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
  /**
   * The provider adapter id of a registered `external` backend (e.g.
   * `google-drive`); selects the code that operates the connection. Absent on
   * the server-managed `default` backend.
   */
  provider?: string
  /**
   * The sanitized (secret-free) connection state of a registered `external`
   * backend, as returned on every read path. Absent on the server-managed
   * `default` backend. The secret-bearing write shape is
   * {@link BackendConnectionInput}, which a server never serializes back.
   */
  connection?: BackendConnectionPublic
}

/**
 * The sanitized, secret-free view of a registered `external` backend's
 * connection, as it appears on every read path (`GET /space/:id/backends`, the
 * register response). The secret-bearing write shape is
 * {@link BackendConnectionInput}; a server never serializes that back to a
 * client -- only this public projection.
 *
 * - `kind` -- the connection family (e.g. `oauth2`), mirrors the write input.
 * - `status` -- the registered connection's lifecycle: `registered` (recorded
 *   but not yet exchanged for live tokens), `connected` (live), `expired`,
 *   `revoked`, or `unreachable`.
 * - `account` / `scope` / `connectedAt` / `rootFolderName` -- optional public
 *   metadata a provider adapter may surface; never secret material.
 */
export interface BackendConnectionPublic {
  kind: string
  status: 'registered' | 'connected' | 'expired' | 'revoked' | 'unreachable'
  account?: string
  scope?: string
  connectedAt?: string
  rootFolderName?: string
}

/**
 * The write-side connection envelope a client supplies when registering an
 * `external` backend (`POST`/`PUT /space/:id/backends`). Deliberately open and
 * secret-bearing -- it carries provider-specific grant material (e.g. an OAuth
 * `authorizationCode` or `refreshToken`) under arbitrary keys, of which only the
 * {@link BackendConnectionPublic} subset is ever read back. `kind` names the
 * connection family so the provider adapter can interpret the rest.
 */
export interface BackendConnectionInput {
  kind: string
  [key: string]: unknown
}

/**
 * The request body shape for registering an `external` backend
 * (`POST`/`PUT /space/:id/backends`). `id` is the registration id under the
 * Space; `provider` selects the adapter; `connection` carries the (secret-
 * bearing) grant material. The remaining fields mirror {@link BackendDescriptor}.
 */
export interface BackendRegistration {
  id: string
  name?: string
  managedBy?: 'external'
  provider: string
  storageMode?: Array<'document' | 'blob'>
  features?: string[]
  connection: BackendConnectionInput
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
