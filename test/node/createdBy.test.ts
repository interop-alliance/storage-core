import { describe, it, expect } from 'vitest'
import { isCreatedBy } from '../../src/index.js'

describe('isCreatedBy', () => {
  it('accepts a non-empty array of DIDs', () => {
    expect(isCreatedBy(['did:key:z6MkInvoker'])).toBe(true)
    expect(isCreatedBy(['did:key:z6MkApp', 'did:web:agent.example'])).toBe(true)
  })

  it.each([
    ['a single DID string', 'did:key:z6MkInvoker'],
    ['an empty array', []],
    ['an array with a non-DID entry', ['did:key:z6MkApp', 'not-a-did']],
    ['an array with a non-string entry', ['did:key:z6MkApp', 42]],
    ['a number', 42],
    ['null', null],
    ['undefined', undefined]
  ])('refuses %s', (_label, value) => {
    expect(isCreatedBy(value)).toBe(false)
  })
})
