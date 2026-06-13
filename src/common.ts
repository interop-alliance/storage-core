/*!
 * Copyright (c) 2026 Interop Alliance. All rights reserved.
 */
/**
 * Cross-spec primitives shared by the WAS (and, later, EDV) data models: the
 * capability-action vocabulary, the RFC9457 problem-type registry plus its
 * `application/problem+json` body shape and canonical code -> HTTP-status map,
 * the storage-limit shape, the RFC9264 linkset shapes, and the reserved
 * path-segment registry.
 *
 * This module is pure types plus a handful of `const` values; it has no runtime
 * dependencies and is fully isomorphic.
 */

/**
 * A capability action -- an HTTP verb in its canonical uppercase form, as it
 * appears in the signed zcap. WAS servers match actions case-sensitively.
 */
export type Action = 'GET' | 'PUT' | 'POST' | 'DELETE'

/**
 * The action input accepted by delegation helpers: canonical uppercase or
 * lowercase. Lowercase is normalized to uppercase before the zcap is signed, so
 * a grant of `'get'` still validates on the server (which expects `'GET'`).
 */
export type ActionInput = Action | Lowercase<Action>

const SPEC_URL = 'https://wallet.storage/spec'

/**
 * Catalog of `type` URIs emitted in `application/problem+json` error responses.
 *
 * Per [[RFC9457]], a problem `type` identifies the *kind* of problem and is
 * reused across operations; the per-occurrence specifics live in the `errors`
 * array (`detail` / `pointer`) and the human summary in `title`. So these URIs
 * are keyed by problem-kind, not by operation -- a single `type` such as
 * `INVALID_ID` is emitted by Create / Update / Read across Spaces, Collections,
 * and Resources alike.
 *
 * **Privacy-merged kinds.** Under the spec's maximum-privacy principle, an
 * unauthorized caller MUST NOT be able to tell a missing resource from one they
 * simply cannot access. `NOT_FOUND` therefore deliberately covers both the
 * "resource absent" and "invalid authorization" conditions (Space / Collection
 * / Resource not found, and failed capability invocation) -- callers cannot use
 * `type` to probe existence.
 *
 * Each URI is a fragment anchor into the WAS specification's Error Type
 * Registry appendix.
 */
export const ProblemTypes = {
  /**
   * Privacy-merged -- the resource does not exist, OR the caller is not
   * authorized to access it. The two conditions are intentionally
   * indistinguishable; do not split this kind (see file header).
   */
  NOT_FOUND: `${SPEC_URL}#not-found`,

  /** A Space / Collection / Resource id is missing or not URL-safe. */
  INVALID_ID: `${SPEC_URL}#invalid-id`,

  /**
   * A client-supplied `id` in a `POST` create operation already exists.
   * (Create-or-replace at a chosen id is the idempotent `PUT` path, which does
   * not conflict.) Typical status 409.
   */
  ID_CONFLICT: `${SPEC_URL}#id-conflict`,

  /**
   * A client-supplied `id` collides with a segment from the spec's Reserved
   * Path Segment Registry (e.g. a Collection named `export` would shadow
   * `/space/{id}/export`). Typical status 409.
   */
  RESERVED_ID: `${SPEC_URL}#reserved-id`,

  /**
   * A Collection create/update names a `backend` id that is not in the Space's
   * backends-available list. Typical status 409.
   */
  UNSUPPORTED_BACKEND: `${SPEC_URL}#unsupported-backend`,

  /** The request body is missing or invalid (missing required fields, etc.). */
  INVALID_REQUEST_BODY: `${SPEC_URL}#invalid-request-body`,

  /** A required `Content-Type` header is missing. */
  MISSING_CONTENT_TYPE: `${SPEC_URL}#missing-content-type`,

  /** Required `Authorization` / `Capability-Invocation` headers are missing. */
  MISSING_AUTHORIZATION: `${SPEC_URL}#missing-authorization`,

  /**
   * The `Authorization`, `Capability-Invocation`, or `Digest` header is
   * malformed, unparseable, or failed verification.
   */
  INVALID_AUTHORIZATION_HEADER: `${SPEC_URL}#invalid-authorization-header`,

  /**
   * The DID that signed the capability invocation does not match the
   * `controller` supplied in a Create Space request body.
   */
  CONTROLLER_MISMATCH: `${SPEC_URL}#controller-mismatch`,

  /** An uploaded archive is not a valid WAS space export. */
  INVALID_IMPORT: `${SPEC_URL}#invalid-import`,

  /** An underlying storage operation failed (server-side fault). */
  STORAGE_ERROR: `${SPEC_URL}#storage-error`,

  /**
   * A write was rejected because the target backend's per-Space storage quota
   * is exhausted (see the spec "Quotas" section). Typical status 507.
   */
  QUOTA_EXCEEDED: `${SPEC_URL}#quota-exceeded`,

  /**
   * An upload exceeds the target backend's `maxUploadBytes` constraint (see
   * the spec "Quotas" section). Unlike `quota-exceeded`, this rejection is
   * per-request, not cumulative: smaller uploads may still succeed. Typical
   * status 413.
   */
  PAYLOAD_TOO_LARGE: `${SPEC_URL}#payload-too-large`,

  /**
   * The server does not implement this OPTIONAL operation (e.g. updating
   * Resource Metadata). Typical status 501.
   */
  UNSUPPORTED_OPERATION: `${SPEC_URL}#unsupported-operation`,

  /** Fallback for an unexpected server-side fault with no more specific kind. */
  INTERNAL_ERROR: `${SPEC_URL}#internal-error`
} as const

/** One of the problem-type URIs in {@link ProblemTypes}. */
export type ProblemType = (typeof ProblemTypes)[keyof typeof ProblemTypes]

/**
 * A single entry in the `errors` array of an `application/problem+json`
 * response body.
 *
 * - `detail` -- a specific explanation of this occurrence.
 * - `pointer` -- an RFC6901 JSON Pointer (in `#/field` form) identifying the
 *   offending part of the request body.
 */
export interface Problem {
  detail: string
  pointer?: string
}

/**
 * The `application/problem+json` response body a WAS server emits (RFC9457).
 * `type` is one of {@link ProblemTypes}; `title` is a short human-readable
 * summary; `errors` carries the per-occurrence {@link Problem} entries.
 *
 * Note: the wire field is `errors`. A server's internal error object may carry
 * these under a different name (the reference server's `ProblemError` uses
 * `problems`); the mapping to `errors` happens at serialization time.
 */
export interface ProblemDocument {
  type: ProblemType | string
  title: string
  errors: Problem[]
}

/**
 * The canonical HTTP status code for each problem kind. Both the server (when
 * throwing) and the client (when interpreting a response) treat these as the
 * default status associated with a `type`; a server MAY still override per
 * occurrence, but the reference implementation does not.
 */
export const ProblemStatusCodes: Record<ProblemType, number> = {
  [ProblemTypes.NOT_FOUND]: 404,
  [ProblemTypes.INVALID_ID]: 400,
  [ProblemTypes.ID_CONFLICT]: 409,
  [ProblemTypes.RESERVED_ID]: 409,
  [ProblemTypes.UNSUPPORTED_BACKEND]: 409,
  [ProblemTypes.INVALID_REQUEST_BODY]: 400,
  [ProblemTypes.MISSING_CONTENT_TYPE]: 400,
  [ProblemTypes.MISSING_AUTHORIZATION]: 401,
  [ProblemTypes.INVALID_AUTHORIZATION_HEADER]: 400,
  [ProblemTypes.CONTROLLER_MISMATCH]: 400,
  [ProblemTypes.INVALID_IMPORT]: 400,
  [ProblemTypes.STORAGE_ERROR]: 500,
  [ProblemTypes.QUOTA_EXCEEDED]: 507,
  [ProblemTypes.PAYLOAD_TOO_LARGE]: 413,
  [ProblemTypes.UNSUPPORTED_OPERATION]: 501,
  [ProblemTypes.INTERNAL_ERROR]: 500
}

/**
 * The storage limit for a backend (spec "Quotas"). When `isUnlimited` is
 * `true`, `capacityBytes` MAY be omitted (the reference filesystem backend
 * omits it unless a capacity was configured).
 */
export interface StorageLimit {
  capacityBytes?: number
  isUnlimited: boolean
}

/**
 * One member of a {@link LinkSet} (RFC9264): an `anchor` plus relation keys
 * (e.g. `https://wallet.storage/spec#policy`) mapping to arrays of link
 * targets.
 */
export interface LinkSetEntry {
  anchor?: string
  [relation: string]: unknown
}

/**
 * An RFC9264 `application/linkset+json` document, the return shape of the
 * `linkset` reserved resource on a Space or Collection.
 */
export interface LinkSet {
  linkset: LinkSetEntry[]
}

/**
 * Reserved Collection-id path segments (the spec's Reserved Path Segment
 * Registry, plus the reference server's non-spec `import` endpoint). A
 * client-chosen Collection id matching one of these would shadow the reserved
 * route at that position (e.g. a Collection named `export` would shadow
 * `/space/{id}/export`), so it MUST be rejected with 409 `reserved-id`.
 */
export const RESERVED_COLLECTION_IDS = new Set([
  'backends',
  'collections',
  'export',
  'import',
  'linkset',
  'policy',
  'query',
  'quotas'
])

/**
 * Reserved Resource-id path segments (the spec's Reserved Path Segment
 * Registry). A client-chosen Resource id matching one of these would shadow the
 * reserved route at that position, so it MUST be rejected with 409
 * `reserved-id`. Space ids have no reserved siblings, so no set exists for the
 * `space` kind.
 */
export const RESERVED_RESOURCE_IDS = new Set([
  'backend',
  'linkset',
  'policy',
  'query',
  'quota'
])
