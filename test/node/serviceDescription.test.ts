import { describe, it, expectTypeOf } from 'vitest'
import type {
  ServiceDescription,
  ServiceDescriptionVersionEntry,
  PwsVersionEntry,
  AuthzProfileVersionEntry
} from '../../src/index.js'

describe('ServiceDescription', () => {
  it('accepts the document a v0.5 server serves', () => {
    const wasEntry = {
      version: '0.5',
      spaces: 'https://was.example/spaces/',
      features: ['listing', 'policy']
    } satisfies PwsVersionEntry
    const authzEntry = {
      version: '0.1',
      signatureAlgorithms: ['EdDSA'],
      zcapCryptosuites: ['Ed25519Signature2020', 'eddsa-jcs-2022']
    } satisfies AuthzProfileVersionEntry
    const document = {
      url: 'https://was.example/service',
      specs: {
        'https://w3id.org/pws': [wasEntry],
        'https://w3id.org/pws/authz-profile': [authzEntry],
        // another specification's entry, with members this package does not name
        'https://example.org/other-spec': [{ version: '1.2', endpoint: 'x' }]
      },
      instance: { name: 'was-teaching-server' }
    } satisfies ServiceDescription
    expectTypeOf(
      document.specs['https://w3id.org/pws']![0]!
    ).toExtend<ServiceDescriptionVersionEntry>()
    expectTypeOf(
      document.specs['https://w3id.org/pws/authz-profile']![0]!
    ).toExtend<ServiceDescriptionVersionEntry>()
  })
})
