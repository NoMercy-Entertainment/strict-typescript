// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { noSingleLetterIdent } from '../no-single-letter-ident.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester();

tester.run('no-single-letter-ident', noSingleLetterIdent, {
  valid: [
    'const seconds = 1;',
    'function scale(level) { return level; }',
    'const add = (x, y, z) => x + y + z;',
    'for (let i = 0; i < 3; i++) {}',
    'interface Backend { volume(level: number): void; }',
    'type Fn = (seconds: number) => void;',
    'declare function seek(seconds: number): void;',
    'function identity<T>(value: T): T { return value; }',
    {
      code: 'const total = sum(a, b);',
      options: [{ allow: ['a', 'b'] }],
    },
  ],
  invalid: [
    {
      code: 'const t = 1;',
      errors: [{ messageId: 'singleLetter' }],
    },
    {
      code: 'function scale(v: number) { return v; }',
      errors: [{ messageId: 'singleLetter' }],
    },
    {
      code: 'function attach(p: Player) { return p; }',
      errors: [{ messageId: 'singleLetter' }],
    },
    {
      // interface signature param.
      code: 'interface Menu { pick(q: QualityLevel): void; }',
      errors: [{ messageId: 'singleLetter' }],
    },
    {
      code: 'type Fn = (t: number) => void;',
      errors: [{ messageId: 'singleLetter' }],
    },
    {
      code: 'class Player { volume(v: number): void {} }',
      errors: [{ messageId: 'singleLetter' }],
    },
    {
      code: 'try { doThing(); } catch (e) { report(e); }',
      errors: [{ messageId: 'singleLetter' }],
    },
    {
      code: 'const combine = (a, b) => a + b;',
      errors: [{ messageId: 'singleLetter' }, { messageId: 'singleLetter' }],
    },
  ],
});
