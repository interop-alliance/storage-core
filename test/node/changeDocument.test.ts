/*!
 * Copyright (c) 2026 Interop Alliance. All rights reserved.
 */
import { describe, expect, it } from 'vitest'
import { isJsonResourceChange, isResourceChange } from '../../src/index.js'
import type { ChangeDocument } from '../../src/index.js'

const stamp = {
  updatedAt: '2026-01-01T00:00:00.000Z',
  updatedAtCounter: 0,
  originId: 'origin-a',
  checkpoint: 'cp-1'
}

function resource(contentType: string | undefined, deleted = false) {
  const doc: ChangeDocument = {
    kind: 'resource',
    id: 'a',
    contentType: contentType!,
    deleted,
    ...(deleted ? {} : { data: { n: 1 } }),
    ...stamp
  }
  return doc
}

const metadata: ChangeDocument = {
  kind: 'collection-metadata',
  id: 'https://was.example/space/s/c/meta',
  deleted: false,
  ...stamp
}

const policyTombstone: ChangeDocument = {
  kind: 'policy',
  id: 'https://was.example/space/s/c/r/policy',
  deleted: true,
  ...stamp
}

describe('isResourceChange', () => {
  it('keeps a resource of any content type and drops every other kind', () => {
    expect(isResourceChange(resource('image/png'))).toBe(true)
    expect(isResourceChange(metadata)).toBe(false)
    expect(isResourceChange(policyTombstone)).toBe(false)
  })
})

describe('isJsonResourceChange', () => {
  it.each(['application/json', 'application/ld+json; charset=utf-8'])(
    'keeps a live or deleted %s resource',
    contentType => {
      expect(isJsonResourceChange(resource(contentType))).toBe(true)
      expect(isJsonResourceChange(resource(contentType, true))).toBe(true)
    }
  )

  it.each(['image/png', 'text/jsonl', 'application/octet-stream', undefined])(
    'drops a %s resource',
    contentType => {
      expect(isJsonResourceChange(resource(contentType))).toBe(false)
    }
  )

  it('drops every other kind, an unknown one included', () => {
    expect(isJsonResourceChange(metadata)).toBe(false)
    expect(isJsonResourceChange({ kind: 'log' })).toBe(false)
    expect(isJsonResourceChange(policyTombstone)).toBe(false)
  })
})
