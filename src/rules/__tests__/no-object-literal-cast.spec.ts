// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { noObjectLiteralCast } from '../no-object-literal-cast.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester();

tester.run('no-object-literal-cast', noObjectLiteralCast, {
  valid: [
    'const config = { retries: 3 } as const;',
    'const change: SubtitleCueChange = { cues: [], language: undefined };',
    'const narrowed = payload as SubtitleCueChange;',
    'const list = [] as number[];',
    // Angle-bracket assertion on a non-literal is not this rule's concern.
    'const narrowed = <SubtitleCueChange>payload;',
  ],
  invalid: [
    {
      code: 'const change = { cues: [], language: undefined } as SubtitleCueChange;',
      errors: [{ messageId: 'literalCast' }],
    },
    {
      code: 'emit(\'subtitleCue\', { cues: [] } as SubtitleCueChange);',
      errors: [{ messageId: 'literalCast' }],
    },
    // Angle-bracket assertion is equally banned.
    {
      code: 'const change = <SubtitleCueChange>{ cues: [] };',
      errors: [{ messageId: 'literalCast' }],
    },
  ],
});
