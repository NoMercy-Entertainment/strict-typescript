// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';

import { noCompatVocab } from '../no-compat-vocab.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester();

// The v2 player words, now passed in by the project that owns them.
const playerWords = {
  identifiers: ['nmVideoPlayer', 'nmMusicPlayer', 'nmMPlayer', 'trackEndingSoon'],
  identifierPatterns: ['^(Play|Volume|Repeat|Shuffle)StateToken$'],
  classes: ['PlayerCore'],
} as const;

tester.run('no-compat-vocab', noCompatVocab, {
  valid: [
    {
      code: 'class NMVideoPlayer {}',
      options: [{ words: playerWords }],
    },
    {
      code: 'class NMMusicPlayer {}',
      options: [{ words: playerWords }],
    },
    {
      code: 'const itemEndingSoon = true;',
      options: [{ words: playerWords }],
    },
    {
      code: 'type PlayState = \'playing\' | \'paused\';',
      options: [{ words: playerWords }],
    },
    '// Resolve before init — re-init corrupts a live instance.',
    {
      code: 'const nmplayer = () => {};',
      options: [{ words: playerWords }],
    },
    // "compatible alias" as a substring of another word is not a compat marker.
    '// incompatible aliasing across cores\nconst value = 1;',
    // Without the words option, no identifier is banned.
    'const nmVideoPlayer = () => {};',
  ],
  invalid: [
    {
      code: 'const nmVideoPlayer = () => {};',
      options: [{ words: playerWords }],
      errors: [{ messageId: 'bannedIdentifier' }],
    },
    {
      code: 'const nmMPlayer = () => {};',
      options: [{ words: playerWords }],
      errors: [{ messageId: 'bannedIdentifier' }],
    },
    {
      code: 'class PlayerCore {}',
      options: [{ words: playerWords }],
      errors: [{ messageId: 'bannedIdentifier' }],
    },
    {
      code: 'type PlayStateToken = string;',
      options: [{ words: playerWords }],
      errors: [{ messageId: 'bannedIdentifier' }],
    },
    {
      code: 'const trackEndingSoon = 1;',
      options: [{ words: playerWords }],
      errors: [{ messageId: 'bannedIdentifier' }],
    },
    {
      code: '// @deprecated use nmplayer instead\nconst value = 1;',
      errors: [{ messageId: 'bannedComment' }],
    },
    {
      code: '// Backwards-compatible alias for releaseLock().\nfunction releaseLeadership() {}',
      errors: [{ messageId: 'bannedComment' }],
    },
    // The marker list is replaceable.
    {
      code: '// legacy shim for v1\nconst value = 1;',
      options: [{ words: { commentSubstrings: ['legacy shim'] } }],
      errors: [{ messageId: 'bannedComment' }],
    },
  ],
});
