/*!
 * Copyright (c) 2026 Interop Alliance. All rights reserved.
 */
/**
 * The `createdBy` guard the WAS server and client share. `createdBy` is read
 * off the wire by every peer that carries provenance, so both sides decide
 * "is this a recorded list?" by the same rule.
 */

import type { IDID } from '@interop/data-integrity-core'

/**
 * Whether a value is a recorded `createdBy` list: a non-empty array whose
 * entries are all strings starting with `did:`. A single DID string and an
 * empty array are not.
 *
 * @param value {unknown}
 * @returns {boolean}
 */
export function isCreatedBy(value: unknown): value is IDID[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(entry => typeof entry === 'string' && entry.startsWith('did:'))
  )
}
