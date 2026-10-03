/*!
 * Copyright (c) 2026 Interop Alliance. All rights reserved.
 */
/**
 * The write-stamp guards the WAS server and client share. A stamp is read off
 * the wire by every peer that orders revisions, so both sides decide "is this a
 * whole stamp?" by the same rule. A partial stamp is treated as none: a
 * counter or origin beside a missing `updatedAt` would read as a complete
 * stamp that loses to every revision.
 */

import type { ResourceMetaStamp, WriteStamp } from './was.js'

const ORIGIN_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

/**
 * Whether a value is a whole {@link WriteStamp}: a non-empty `updatedAt`
 * string, a non-negative integer `updatedAtCounter`, and an `originId`
 * matching `[A-Za-z0-9_-]{1,64}`.
 *
 * @param value {unknown}
 * @returns {boolean}
 */
export function isWriteStamp(value: unknown): value is WriteStamp {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const { updatedAt, updatedAtCounter, originId } = value as Partial<WriteStamp>
  return (
    typeof updatedAt === 'string' &&
    updatedAt !== '' &&
    typeof updatedAtCounter === 'number' &&
    Number.isInteger(updatedAtCounter) &&
    updatedAtCounter >= 0 &&
    typeof originId === 'string' &&
    ORIGIN_ID_PATTERN.test(originId)
  )
}

/**
 * Whether a value is a whole {@link ResourceMetaStamp}: a
 * {@link isWriteStamp | write stamp} plus a non-empty `generation` string.
 *
 * @param value {unknown}
 * @returns {boolean}
 */
export function isMetaStamp(value: unknown): value is ResourceMetaStamp {
  if (!isWriteStamp(value)) {
    return false
  }
  const { generation } = value as Partial<ResourceMetaStamp>
  return typeof generation === 'string' && generation !== ''
}
