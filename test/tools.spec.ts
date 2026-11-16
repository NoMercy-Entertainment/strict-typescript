// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '..');
const tools = path.join(root, 'fixtures/tools');

function run(bin: string, args: string[]) {
  const result = spawnSync(process.execPath, [path.join(root, 'node_modules', bin), ...args], {
    cwd: root,
    encoding: 'utf8',
  });

  return {
    status: result.status,
    output: `${result.stdout}${result.stderr}`,
  };
}

describe('cspell.json', () => {
  const config = path.join(root, 'cspell.json');

  it('flags a British spelling and passes the American one', () => {
    const bad = run('cspell/bin.mjs', ['--config', config, '--no-progress', path.join(tools, 'british.txt')]);
    const good = run('cspell/bin.mjs', ['--config', config, '--no-progress', path.join(tools, 'american.txt')]);

    expect(bad.output).toContain('colour');
    expect(bad.status).toBe(1);
    expect(good.status).toBe(0);
  });
});

describe('jscpd.json', () => {
  const config = path.join(root, 'jscpd.json');

  it('fails on two duplicated blocks and passes on one', () => {
    const bad = run('jscpd/run-jscpd.js', ['--config', config, path.join(tools, 'dup')]);
    const good = run('jscpd/run-jscpd.js', ['--config', config, path.join(tools, 'clean')]);

    expect(bad.status).toBe(1);
    expect(good.status).toBe(0);
  });
});

describe('oxlintrc.json', () => {
  const config = path.join(root, 'oxlintrc.json');

  it('reports a debugger statement and passes the clean file', () => {
    const bad = run('oxlint/bin/oxlint', ['-c', config, path.join(tools, 'oxlint-bad.ts')]);
    const good = run('oxlint/bin/oxlint', ['-c', config, path.join(tools, 'oxlint-good.ts')]);

    expect(bad.output).toContain('no-debugger');
    expect(bad.status).toBe(1);
    expect(good.status).toBe(0);
  });
});
