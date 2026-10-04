import { describe, it, expectTypeOf } from 'vitest'
import type {
  ResourceMetadata,
  ResourceSummary,
  ChangeDocument
} from '../../src/index.js'

describe('writerId', () => {
  it('is an optional string sibling of epoch on ResourceMetadata', () => {
    expectTypeOf<ResourceMetadata['writerId']>().toEqualTypeOf<
      string | undefined
    >()
    expectTypeOf({
      contentType: 'application/json',
      size: 16,
      epoch: 'epoch-1',
      writerId: 'z6fVXHKn8PdQm2Rt'
    }).toExtend<ResourceMetadata>()
    expectTypeOf({
      contentType: 'application/json',
      size: 16
    }).toExtend<ResourceMetadata>()
  })

  it('mirrors onto the listing item summary', () => {
    expectTypeOf<ResourceSummary['writerId']>().toEqualTypeOf<
      string | undefined
    >()
  })

  it('rides the changes feed, tombstones included', () => {
    expectTypeOf<ChangeDocument['writerId']>().toEqualTypeOf<
      string | undefined
    >()
    expectTypeOf({
      id: 'hello-world',
      _deleted: true as const,
      updatedAt: '2026-01-15T12:00:00.000Z',
      updatedAtCounter: 1,
      originId: '8dGmQyVw3nXtRk2LpZc7Ha',
      checkpoint: 'opaque-2',
      writerId: 'z6fVXHKn8PdQm2Rt'
    }).toExtend<ChangeDocument>()
  })
})
