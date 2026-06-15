import { describe, it, expect } from 'vitest'
import {
  ProblemTypes,
  ProblemStatusCodes,
  RESERVED_COLLECTION_IDS,
  RESERVED_RESOURCE_IDS
} from '../../src/index.js'

describe('@interop/storage-core', () => {
  it('exposes problem-type URIs anchored into the spec', () => {
    expect(ProblemTypes.NOT_FOUND).toBe('https://wallet.storage/spec#not-found')
    expect(ProblemTypes.QUOTA_EXCEEDED).toBe(
      'https://wallet.storage/spec#quota-exceeded'
    )
  })

  it('maps every problem type to a canonical HTTP status', () => {
    for (const type of Object.values(ProblemTypes)) {
      expect(typeof ProblemStatusCodes[type]).toBe('number')
    }
    expect(ProblemStatusCodes[ProblemTypes.NOT_FOUND]).toBe(404)
    expect(ProblemStatusCodes[ProblemTypes.QUOTA_EXCEEDED]).toBe(507)
    expect(ProblemStatusCodes[ProblemTypes.UNSUPPORTED_OPERATION]).toBe(501)
    expect(ProblemStatusCodes[ProblemTypes.PRECONDITION_FAILED]).toBe(412)
  })

  it('lists the reserved path segments', () => {
    expect(RESERVED_COLLECTION_IDS.has('export')).toBe(true)
    expect(RESERVED_RESOURCE_IDS.has('quota')).toBe(true)
  })
})
