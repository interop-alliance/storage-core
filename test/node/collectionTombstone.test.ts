/*!
 * Copyright (c) 2026 Interop Alliance. All rights reserved.
 */
import { describe, expect, expectTypeOf, it } from 'vitest'
import { isCollectionTombstoneSummary } from '../../src/index.js'
import type {
  CollectionSummary,
  CollectionTombstoneSummary,
  CollectionsList
} from '../../src/index.js'

const live = {
  id: 'notes',
  url: '/space/s1/notes/',
  name: 'notes',
  public: false
} satisfies CollectionSummary

const tombstone = {
  id: 'old',
  url: '/space/s1/old/',
  deleted: true,
  updatedAt: '2026-10-03T00:00:00.000Z',
  updatedAtCounter: 2,
  originId: 'zOrigin'
} satisfies CollectionTombstoneSummary

describe('Collection tombstone listing items', () => {
  it('accepts a listing that mixes live and tombstone items', () => {
    expectTypeOf({
      url: '/space/s1/',
      totalItems: 1,
      items: [live, tombstone]
    }).toExtend<CollectionsList>()
  })

  it('tells a tombstone item from a live one', () => {
    expect(isCollectionTombstoneSummary(tombstone)).toBe(true)
    expect(isCollectionTombstoneSummary(live)).toBe(false)
  })

  it('narrows a listing item by the guard', () => {
    const items: CollectionsList['items'] = [live, tombstone]
    const deleted = items.filter(isCollectionTombstoneSummary)
    expectTypeOf(deleted).toEqualTypeOf<CollectionTombstoneSummary[]>()
    expect(deleted.map(item => item.updatedAtCounter)).toEqual([2])
  })

  it('carries no name and no public member on a tombstone', () => {
    expectTypeOf<CollectionTombstoneSummary>().not.toHaveProperty('name')
    expectTypeOf<CollectionTombstoneSummary>().not.toHaveProperty('public')
    expectTypeOf<CollectionSummary>().not.toHaveProperty('deleted')
  })
})
