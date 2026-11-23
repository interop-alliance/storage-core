import { describe, it, expectTypeOf } from 'vitest'
import { AUTHZ_PROFILE_SPEC_ID, PWS_SPEC_ID } from '../../src/index.js'
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
      features: ['listing', 'policy'],
      originId: 'z6MkOrigin',
      serverDid: 'did:webvh:zScid:was.example:space:server:id'
    } satisfies PwsVersionEntry
    const authzEntry = {
      version: '0.1',
      signatureAlgorithms: ['EdDSA'],
      zcapCryptosuites: ['Ed25519Signature2020', 'eddsa-jcs-2022'],
      features: ['did-url-targets']
    } satisfies AuthzProfileVersionEntry
    expectTypeOf({
      url: 'https://was.example/service',
      specs: {
        [PWS_SPEC_ID]: [wasEntry],
        [AUTHZ_PROFILE_SPEC_ID]: [authzEntry],
        // another specification's entry, with members this package does not name
        'https://example.org/other-spec': [{ version: '1.2', endpoint: 'x' }]
      },
      instance: { name: 'was-teaching-server' }
    }).toExtend<ServiceDescription>()
  })

  it('advertises the server DID on the core entry, not under instance', () => {
    expectTypeOf<PwsVersionEntry['serverDid']>().toEqualTypeOf<
      string | undefined
    >()
    expectTypeOf<
      NonNullable<ServiceDescription['instance']>
    >().not.toHaveProperty('serverDid')
  })

  it('lists feature tokens on the authorization profile entry', () => {
    expectTypeOf<AuthzProfileVersionEntry['features']>().toEqualTypeOf<
      string[] | undefined
    >()
  })

  it('holds any specification entry carrying a version', () => {
    expectTypeOf<ServiceDescription['specs'][string]>().toEqualTypeOf<
      ServiceDescriptionVersionEntry[]
    >()
    expectTypeOf<
      ServiceDescriptionVersionEntry['version']
    >().toEqualTypeOf<string>()
  })
})
