// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import strict from './dist/index.js';

// The package lints itself with the built output of its own config. The rules read AST nodes
// and TypeScript types that are unknown by nature, so the unknown and merge checks skip them.
export default [
  ...strict({ ignores: ['fixtures/**'] }),
  {
    name: 'self/rules-take-unknown-nodes',
    files: ['src/rules/*.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
];
