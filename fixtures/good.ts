// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import { keysOf, merge, oneOf } from '../src/array.js';

const table = { a: 1, b: 2 } as const;

export function good(key: string, left: readonly number[], right: readonly number[]) {
  const known = oneOf(keysOf(table), key);
  const joined = merge(left, right);

  return {
    known,
    joined,
  };
}
