// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import { defineConfig } from 'vitest/config';

export default defineConfig({
  // The tool tests start cspell, jscpd, oxlint and Tailwind's design system; 5 s is too short on a loaded machine.
  test: { include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'], testTimeout: 60_000 },
});
