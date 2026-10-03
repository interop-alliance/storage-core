import { describe, it, expectTypeOf } from 'vitest'
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
    const entry = {
      id: 'hello-world',
      _deleted: false,
      checkpoint: 'opaque-1',
      ...stamp,
      meta: { ...stamp, updatedAtCounter: 1, generation: '3mJr7AoUXx2' }
    } satisfies ChangeDocument
    expectTypeOf(entry).toExtend<WriteStamp>()
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
    const metadata = {
      contentType: 'application/json',
      size: 16,
      ...stamp,
      meta: { ...stamp, generation: '3mJr7AoUXx2' }
    } satisfies ResourceMetadata
    expectTypeOf(metadata.meta).toExtend<ResourceMetaStamp>()
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
