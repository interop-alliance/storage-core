/*!
 * Copyright (c) 2026 Interop Alliance. All rights reserved.
 */
/**
 * The content-type classifier the WAS server and client share. A server
 * parses a JSON Resource body on write and a client parses it on read, so
 * both sides decide "is this JSON?" by the same rule.
 */

/**
 * The JSON media types: `application/json` or any `application/<prefix>+json`
 * structured-suffix variant (e.g. `application/ld+json`,
 * `application/jose+json`), each optionally followed by parameters
 * (`; charset=utf-8`). The `json` token is anchored to the end of the media
 * type, so a non-JSON type that merely contains the substring `json` --
 * `application/jsonl`, `application/json-seq`, `application/json5` -- does not
 * match. A server registers its JSON body parser under this expression so the
 * parser and {@link isJsonContentType} decide by the same rule.
 */
export const JSON_MEDIA_TYPE = /^application\/([^+\s;]+\+)?json\s*(;.*)?$/i

/**
 * Whether a content-type denotes JSON, by {@link JSON_MEDIA_TYPE}. An absent
 * content-type is not JSON.
 *
 * @param contentType {string | undefined}
 * @returns {boolean}
 */
export function isJsonContentType(contentType: string | undefined): boolean {
  return typeof contentType === 'string' && JSON_MEDIA_TYPE.test(contentType)
}
