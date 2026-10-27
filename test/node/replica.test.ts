/*!
 * Copyright (c) 2026 Interop Alliance. All rights reserved.
 */
import { describe, expectTypeOf, it } from 'vitest'
import type {
  ReplicaRegistration,
  ReplicaStatus,
  ReplicaSummary,
  SpaceMetadata
} from '../../src/index.js'

const summary = {
  fromSpace: 'https://peer.example/space/s9/',
  toSpace: 'https://was.example/space/s1/',
  role: 'source'
} satisfies ReplicaSummary

describe('Replica registration types', () => {
  it('accepts a registration with and without a Collection list', () => {
    expectTypeOf<{
      id: string
      fromSpace: string
      toSpace: string
      capability: ReplicaRegistration['capability']
      role: 'source'
    }>().toExtend<ReplicaRegistration>()
    expectTypeOf<ReplicaRegistration['collections']>().toEqualTypeOf<
      Array<{ id: string }> | undefined
    >()
  })

  it('carries the pause member and the write stamp as optional members', () => {
    expectTypeOf<ReplicaRegistration['pausedAt']>().toEqualTypeOf<
      string | undefined
    >()
    expectTypeOf<ReplicaRegistration['updatedAt']>().toEqualTypeOf<
      string | undefined
    >()
    expectTypeOf<ReplicaRegistration['updatedAtCounter']>().toEqualTypeOf<
      number | undefined
    >()
    expectTypeOf<ReplicaRegistration['originId']>().toEqualTypeOf<
      string | undefined
    >()
  })

  it('reports a paused loop', () => {
    expectTypeOf<'paused'>().toExtend<ReplicaStatus['state']>()
  })

  it('refuses a role other than source', () => {
    expectTypeOf<'target'>().not.toExtend<ReplicaRegistration['role']>()
  })

  it('lists registrations on the Space Metadata object without id or capability', () => {
    expectTypeOf({
      id: 's1',
      type: ['Space'],
      controller: 'did:key:z6MkExample' as SpaceMetadata['controller'],
      replicas: [summary]
    }).toExtend<SpaceMetadata>()
    expectTypeOf<keyof ReplicaSummary>().toEqualTypeOf<
      'fromSpace' | 'toSpace' | 'role'
    >()
  })

  it('accepts a status with a stalled Collection', () => {
    expectTypeOf({
      state: 'stalled' as const,
      lastPullAt: '2026-10-04T00:00:00.000Z',
      nextPullAt: '2026-10-04T00:01:00.000Z',
      collections: [
        { id: 'notes', state: 'synced' as const },
        {
          id: 'photos',
          state: 'stalled' as const,
          stall: {
            reason: 'quota-exceeded' as const,
            since: '2026-10-04T00:00:00.000Z'
          }
        }
      ]
    }).toExtend<ReplicaStatus>()
  })
})
