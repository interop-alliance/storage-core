/*!
 * Copyright (c) 2026 Interop Alliance. All rights reserved.
 */
/**
 * Public entry point for `@interop/storage-core`: a flat re-export of the
 * cross-spec primitives (`./common`), the WAS data model (`./was`), and the
 * resource-log wire types (`./resourceLog`). The EDV data model will be added
 * as `./edv` without changing this surface.
 */
export * from './common.js'
export * from './resourceLog.js'
export * from './was.js'
