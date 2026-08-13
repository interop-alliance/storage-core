/*!
 * Copyright (c) 2026 Interop Alliance. All rights reserved.
 */
/**
 * The resource-log wire types: the on-the-wire JSON shapes of the Resource Log
 * Profile (App Connect spec, `#resource-log-profile`) -- a hash-linked log
 * format, extracted from the `did:webvh` log format, for key resources
 * co-managed between a wallet's clients and the storage server (collection
 * encryption descriptors and the key rosters associated with them). A log is
 * stored as a single WAS resource serialized as JSON Lines, one
 * {@link ResourceLogEntry} per line.
 *
 * Types only: parsing, hashing, chain verification, and appending live in the
 * consuming packages. As with the rest of this package, the types are modeled
 * to what the spec guarantees; the profile's verifier-side MUSTs (exact member
 * sets, fail-closed `parameters` rules) are enforced by verifiers at runtime,
 * not by these compile-time shapes.
 */

/**
 * The format identifier of the Resource Log Profile, the value of
 * `parameters.method` in a genesis entry (see {@link ResourceLogGenesisParameters})
 * and of the `history.method` dispatch hint on a referencing point-state
 * document. Byte-significant and compared only for byte equality, never
 * parsed: the `0.1` is part of the opaque identifier, not an orderable
 * version number -- a future revision is a different identifier reached only
 * through the terminal-handover mechanism.
 */
export const RESOURCE_LOG_METHOD = 'resource-log:0.1'

/**
 * The `parameters` of a resource log's genesis (first) entry. `method` is the
 * format identifier ({@link RESOURCE_LOG_METHOD}) and `scid` the log's
 * self-certifying identifier -- both are inside the hashed genesis content, so
 * the SCID commits to the format and a host cannot downgrade a log's format
 * without changing its identity. `previousLog` appears only on the genesis of
 * a successor log created by a terminal handover (compaction or format
 * migration): the prior log's SCID plus the `versionId` of the prior log's
 * last regular entry -- the terminal entry's predecessor, not the terminal
 * entry itself, which cannot be named because it commits to this successor's
 * SCID. No other member is permitted (verifiers reject unknown `parameters`
 * members fail-closed, so the `did:webvh` key-management parameters this
 * profile deleted can never be smuggled back in).
 */
export interface ResourceLogGenesisParameters {
  method: string
  scid: string
  previousLog?: { scid: string; head: string }
}

/**
 * The `parameters` of a terminal handover entry -- the signed, in-chain entry
 * that closes a log and names its successor, serving both compaction and
 * format migration. Exactly `{ nextLog: { method, scid } }`: the successor
 * log's format identifier and SCID. A terminal entry's `state` must equal its
 * predecessor's (a handover changes no resource state), and every verifier
 * must recognize terminal entries and refuse to append past one, even though
 * nothing currently emits them.
 */
export interface ResourceLogTerminalParameters {
  nextLog: { method: string; scid: string }
}

/**
 * The `parameters` member of a {@link ResourceLogEntry}. Unlike `did:webvh`,
 * parameters do not evolve: the genesis entry carries
 * {@link ResourceLogGenesisParameters}, a terminal entry carries
 * {@link ResourceLogTerminalParameters}, and every other entry's `parameters`
 * is exactly `{}`. A verifier rejects an entry whose `parameters` carry any
 * member the profile does not define for that entry position.
 */
export type ResourceLogParameters =
  | ResourceLogGenesisParameters
  | ResourceLogTerminalParameters
  | Record<string, never>

/**
 * One element of a {@link ResourceLogEntry}'s `proof` array: a Data Integrity
 * proof with the profile's fixed shape -- `eddsa-jcs-2022` only, proof purpose
 * `assertionMethod`. The proof input is the complete entry, including its
 * final `versionId`, with the `proof` member absent; since the `versionId` is
 * a commitment to the whole chain, the signature covers the chain link and an
 * entry cannot be re-parented without breaking its proof.
 *
 * `verificationMethod` is a DID URL identifying the signing key in the log's
 * controller document. Where the controller's DID method provides versioned
 * resolution (as `did:webvh` does) it carries the entry anchor -- a
 * `versionId` DID parameter naming the controller-document version the entry
 * was authorized under, inside the signed proof options and so
 * tamper-evident. Authorization is external: every proof's signing key must
 * be listed under `assertionMethod` in the independently verified controller
 * document at the anchored version, and anchors must be monotone along the
 * log.
 */
export interface ResourceLogEntryProof {
  type: 'DataIntegrityProof'
  cryptosuite: 'eddsa-jcs-2022'
  proofPurpose: 'assertionMethod'
  verificationMethod: string
  proofValue: string
  created?: string
  '@context'?: string | string[]
}

/**
 * One entry of a resource log: a JSON object with exactly these five members,
 * all required -- a verifier rejects an entry carrying any other member.
 *
 * - `versionId` -- `<n>-<entryHash>`: the entry's 1-based ordinal position, a
 *   `-`, and the entry hash (the SHA-256 multihash of the JCS-canonicalized
 *   entry with `proof` removed and `versionId` replaced by the predecessor's
 *   `versionId` -- for the genesis entry, by the SCID -- serialized as bare
 *   `base58btc` with no multibase prefix, the `did:webvh` entry-hash format).
 * - `versionTime` -- the append time as an RFC3339 UTC datetime (`Z` suffix).
 *   Advisory only: a writer sets its best knowledge of the current time, and
 *   a verifier must not refuse an entry on temporal grounds -- ordering
 *   authority rests entirely with the hash chain.
 * - `parameters` -- see {@link ResourceLogParameters}.
 * - `state` -- the full resource state at this version. It must carry a
 *   `type` member identifying its schema (state schemas are defined by the
 *   referencing profile, e.g. WAS-EC for encryption descriptors and key
 *   rosters, not by the log profile) and must not carry a `history` member
 *   (that member belongs to the point-state projection only -- see the
 *   `history` member of `CollectionEncryption`). The resource's current
 *   state is the verified head entry's `state`.
 * - `proof` -- a non-empty array of {@link ResourceLogEntryProof}; a verifier
 *   verifies every proof, and one failing proof rejects the entry.
 */
export interface ResourceLogEntry {
  versionId: string
  versionTime: string
  parameters: ResourceLogParameters
  state: { type: string; [member: string]: unknown }
  proof: ResourceLogEntryProof[]
}
