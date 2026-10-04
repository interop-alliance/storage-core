import { describe, it, expect, expectTypeOf } from 'vitest'
import { isMetaStamp, isWriteStamp } from '../../src/index.js'
import type {
  ChangeDocument,
  CollectionMetadata,
  ResourceMetaStamp,
  ResourceMetadata,
  SpaceMetadata,
  WriteStamp
} from '../../src/index.js'

const stamp = {
  updatedAt: '2026-01-15T12:00:00.000Z',
  updatedAtCounter: 0,
  originId: '8dGmQyVw3nXtRk2LpZc7Ha'
} satisfies WriteStamp

describe('write stamp', () => {
  it('is required on a change document, with the /meta stamp nested', () => {
    expectTypeOf({
      id: 'hello-world',
      _deleted: false,
      checkpoint: 'opaque-1',
      ...stamp,
      meta: { ...stamp, updatedAtCounter: 1, generation: '3mJr7AoUXx2' }
    }).toExtend<ChangeDocument>()
    expectTypeOf<ChangeDocument>().toExtend<WriteStamp>()
    expectTypeOf<ChangeDocument['updatedAtCounter']>().toEqualTypeOf<number>()
    expectTypeOf<ChangeDocument['originId']>().toEqualTypeOf<string>()
    expectTypeOf<ChangeDocument['meta']>().toEqualTypeOf<
      ResourceMetaStamp | undefined
    >()
  })

  it('replaces the version counters on a change document', () => {
    expectTypeOf<ChangeDocument>().not.toHaveProperty('version')
    expectTypeOf<ChangeDocument>().not.toHaveProperty('metaVersion')
  })

  it('is optional on Resource metadata, with the /meta stamp nested', () => {
    expectTypeOf({
      contentType: 'application/json',
      size: 16,
      ...stamp,
      meta: { ...stamp, generation: '3mJr7AoUXx2' }
    }).toExtend<ResourceMetadata>()
    expectTypeOf<ResourceMetadata['meta']>().toEqualTypeOf<
      ResourceMetaStamp | undefined
    >()
    expectTypeOf({
      contentType: 'application/json',
      size: 16
    }).toExtend<ResourceMetadata>()
  })

  it('is optional on the Space and Collection Metadata objects', () => {
    expectTypeOf<SpaceMetadata['updatedAt']>().toEqualTypeOf<
      string | undefined
    >()
    expectTypeOf<SpaceMetadata['updatedAtCounter']>().toEqualTypeOf<
      number | undefined
    >()
    expectTypeOf<SpaceMetadata['originId']>().toEqualTypeOf<
      string | undefined
    >()
    expectTypeOf<CollectionMetadata['updatedAtCounter']>().toEqualTypeOf<
      number | undefined
    >()
    expectTypeOf<CollectionMetadata['originId']>().toEqualTypeOf<
      string | undefined
    >()
  })
})

describe('isWriteStamp', () => {
  it('accepts a whole stamp, with extra members beside it', () => {
    expect(isWriteStamp(stamp)).toBe(true)
    expect(isWriteStamp({ ...stamp, custom: { name: 'A' } })).toBe(true)
    expect(isWriteStamp({ ...stamp, originId: 'a' })).toBe(true)
    expect(isWriteStamp({ ...stamp, originId: 'x'.repeat(64) })).toBe(true)
  })

  it('rejects a non-object', () => {
    expect(isWriteStamp(undefined)).toBe(false)
    expect(isWriteStamp(null)).toBe(false)
    expect(isWriteStamp('2026-01-15T12:00:00.000Z')).toBe(false)
  })

  it('rejects a partial stamp', () => {
    expect(
      isWriteStamp({ updatedAtCounter: 0, originId: stamp.originId })
    ).toBe(false)
    expect(
      isWriteStamp({ updatedAt: stamp.updatedAt, originId: stamp.originId })
    ).toBe(false)
    expect(
      isWriteStamp({ updatedAt: stamp.updatedAt, updatedAtCounter: 0 })
    ).toBe(false)
    expect(isWriteStamp({ ...stamp, updatedAt: '' })).toBe(false)
  })

  it('rejects a counter that is not a non-negative integer', () => {
    expect(isWriteStamp({ ...stamp, updatedAtCounter: -1 })).toBe(false)
    expect(isWriteStamp({ ...stamp, updatedAtCounter: 1.5 })).toBe(false)
    expect(isWriteStamp({ ...stamp, updatedAtCounter: NaN })).toBe(false)
    expect(isWriteStamp({ ...stamp, updatedAtCounter: '0' })).toBe(false)
  })

  it('rejects an originId outside [A-Za-z0-9_-]{1,64}', () => {
    expect(isWriteStamp({ ...stamp, originId: '' })).toBe(false)
    expect(isWriteStamp({ ...stamp, originId: 'has space' })).toBe(false)
    expect(isWriteStamp({ ...stamp, originId: 'a.b' })).toBe(false)
    expect(isWriteStamp({ ...stamp, originId: 'x'.repeat(65) })).toBe(false)
  })
})

describe('isMetaStamp', () => {
  it('accepts a whole stamp with a generation', () => {
    expect(isMetaStamp({ ...stamp, generation: '3mJr7AoUXx2' })).toBe(true)
  })

  it('rejects a missing or empty generation', () => {
    expect(isMetaStamp(stamp)).toBe(false)
    expect(isMetaStamp({ ...stamp, generation: '' })).toBe(false)
    expect(isMetaStamp({ ...stamp, generation: 3 })).toBe(false)
  })

  it('rejects a generation on a partial stamp', () => {
    expect(
      isMetaStamp({
        updatedAt: stamp.updatedAt,
        updatedAtCounter: 0,
        generation: '3mJr7AoUXx2'
      })
    ).toBe(false)
    expect(isMetaStamp(undefined)).toBe(false)
  })
})
