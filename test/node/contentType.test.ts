/*!
 * Copyright (c) 2026 Interop Alliance. All rights reserved.
 */
import { describe, expect, it } from 'vitest'
import { isJsonContentType } from '../../src/index.js'

describe('isJsonContentType', () => {
  it.each([
    'application/json',
    'application/JSON',
    'application/json; charset=utf-8',
    'application/ld+json',
    'application/edv+json',
    'application/vnd.api+json',
    'application/problem+json'
  ])('treats %s as JSON', contentType => {
    expect(isJsonContentType(contentType)).toBe(true)
  })

  it.each([
    'application/jsonl',
    'application/json-seq',
    'application/json5',
    'application/x-ndjson',
    'application/octet-stream',
    'text/plain',
    'image/png',
    'text/json',
    'text/foo+json',
    undefined
  ])('does not treat %s as JSON', contentType => {
    expect(isJsonContentType(contentType)).toBe(false)
  })
})
