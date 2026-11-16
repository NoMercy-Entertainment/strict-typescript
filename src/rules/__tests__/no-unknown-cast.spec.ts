// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { noUnknownCast } from '../no-unknown-cast.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester();

tester.run('no-unknown-cast', noUnknownCast, {
  valid: [
    'const backend = handle as unknown as IAudioBackend; // mixin: private field',
    '// registry stores the base type; narrow this generic instance\nconst entry = self as unknown as Player;',
    'const narrowed = value as IAudioBackend;',
    'const literal = 1 as const;',
  ],
  invalid: [
    {
      code: 'const backend = handle as unknown as IAudioBackend;',
      errors: [{ messageId: 'unknownCast' }],
    },
  ],
});
