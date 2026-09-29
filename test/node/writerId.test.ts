import { describe, it, expectTypeOf } from 'vitest'
import type {
  ResourceMetadata,
  ResourceSummary,
  ChangeDocument
} from '../../src/index.js'

describe('writerId', () => {
  it('is an optional string sibling of epoch on ResourceMetadata', () => {
    const withWriterId = {
      contentType: 'application/json',
      size: 16,
      epoch: 'epoch-1',
      writerId: 'z6fVXHKn8PdQm2Rt'
    } satisfies ResourceMetadata
    const withoutWriterId = {
      contentType: 'application/json',
      size: 16
    } satisfies ResourceMetadata
    expectTypeOf(withWriterId.writerId).toEqualTypeOf<string | undefined>()
    expectTypeOf(withoutWriterId).toExtend<ResourceMetadata>()
  })

  it('mirrors onto the listing item summary', () => {
    const summary = {
      id: 'hello-world',
      url: '/space/x/messages/hello-world',
      contentType: 'application/json',
      epoch: 'epoch-1',
      writerId: 'z6fVXHKn8PdQm2Rt'
    } satisfies ResourceSummary
    expectTypeOf(summary.writerId).toEqualTypeOf<string | undefined>()
  })

  it('rides the changes feed, tombstones included', () => {
    const entry = {
      id: 'hello-world',
      _deleted: false,
      updatedAt: '2026-01-15T12:00:00.000Z',
      version: 1,
      writerId: 'z6fVXHKn8PdQm2Rt'
    } satisfies ChangeDocument
    const tombstone = {
      id: 'hello-world',
      _deleted: true,
      updatedAt: '2026-01-15T12:00:00.000Z',
      version: 2,
      writerId: 'z6fVXHKn8PdQm2Rt'
    } satisfies ChangeDocument
    expectTypeOf(entry.writerId).toEqualTypeOf<string | undefined>()
    expectTypeOf(tombstone.writerId).toEqualTypeOf<string | undefined>()
  })
})
