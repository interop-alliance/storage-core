/*!
 * Copyright (c) 2026 Interop Alliance. All rights reserved.
 */
/**
 * The guard that tells a Collection tombstone item of a List Collections
 * listing from a live one. The server lists tombstones only under
 * `?include=deleted`, and the client and a replicating peer read them by the
 * same rule.
 */

import type { CollectionSummary, CollectionTombstoneSummary } from './was.js'

/**
 * Whether a List Collections item is a {@link CollectionTombstoneSummary}:
 * an item carrying `deleted: true`. A live {@link CollectionSummary} carries
 * no `deleted` member.
 *
 * @param item {CollectionSummary | CollectionTombstoneSummary}
 * @returns {boolean}
 */
export function isCollectionTombstoneSummary(
  item: CollectionSummary | CollectionTombstoneSummary
): item is CollectionTombstoneSummary {
  return 'deleted' in item && item.deleted === true
}
