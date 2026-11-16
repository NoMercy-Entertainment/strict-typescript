// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import { run } from '../src/cli.js';

const root = path.resolve(import.meta.dirname, '..');
const base = process.env['STRICT_TS_TEST_TMP'] ?? os.tmpdir();
const created: string[] = [];

function sh(cwd: string, command: string, args: string[], env: Record<string, string> = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });

  return {
    status: result.status,
    output: `${result.stdout}${result.stderr}`,
  };
}

function git(cwd: string, ...args: string[]) {
  return sh(cwd, 'git', ['-c', 'user.name=test', '-c', 'user.email=test@example.test', ...args]);
}

function project(): string {
  fs.mkdirSync(base, { recursive: true });

  const dir = fs.mkdtempSync(path.join(base, 'cli-'));

  created.push(dir);
  git(dir, 'init', '--quiet');

  return dir;
}

function read(dir: string, file: string): string {
  return fs.readFileSync(path.join(dir, file), 'utf8');
}

function write(dir: string, file: string, text: string): void {
  const target = path.join(dir, file);

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text);
}

afterEach(() => {
  for (const dir of created.splice(0)) {
    const link = path.join(dir, 'node_modules');

    // A junction to the package's node_modules goes first, so no recursive delete walks into it.
    if (fs.existsSync(link) && fs.lstatSync(link).isSymbolicLink()) {
      fs.unlinkSync(link);
    }

    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('init', () => {
  it('writes the config files, the scripts and the hooks into an empty project', () => {
    const dir = project();
    const result = run(['init'], dir);

    expect(result.code).toBe(0);
    expect(read(dir, 'eslint.config.js')).toContain('export default strict();');

    expect(JSON.parse(read(dir, 'tsconfig.json'))).toEqual({
      extends: '@nomercy-entertainment/strict-typescript/tsconfig/dom.json',
      include: ['src'],
    });

    expect(read(dir, '.editorconfig')).toContain('max_line_length = 100');

    expect(JSON.parse(read(dir, 'cspell.json'))).toEqual({
      import: ['@nomercy-entertainment/strict-typescript/cspell.json'],
    });

    expect(JSON.parse(read(dir, '.jscpd.json')).minTokens).toBe(40);

    const { scripts } = JSON.parse(read(dir, 'package.json'));

    expect(scripts).toEqual({
      lint: 'eslint .',
      'lint:fix': 'eslint . --fix',
      typecheck: 'tsc --noEmit',
      check: 'strict-typescript check',
    });

    expect(read(dir, '.githooks/commit-msg')).toContain('attribution trailer');
    expect(git(dir, 'config', 'core.hooksPath').output.trim()).toBe('.githooks');
    expect(result.out).toContain('wrote eslint.config.js');
  });

  it('writes the Vue and Node variants', () => {
    const vue = project();

    run(['init', '--vue'], vue);

    expect(read(vue, 'eslint.config.js')).toContain('strict({ vue: true })');
    expect(read(vue, 'tsconfig.json')).toContain('tsconfig/vue.json');
    expect(JSON.parse(read(vue, 'package.json')).scripts.typecheck).toBe('vue-tsc --noEmit');

    const node = project();

    run(['init', '--node'], node);

    expect(read(node, 'tsconfig.json')).toContain('tsconfig/node.json');
  });

  it('keeps every existing file the second time and overwrites nothing', () => {
    const dir = project();

    run(['init'], dir);

    const before = ['eslint.config.js', 'tsconfig.json', '.editorconfig', 'cspell.json', '.jscpd.json', 'package.json']
      .map((file) => read(dir, file));

    write(dir, 'eslint.config.js', `${before[0]}// mine\n`);

    const second = run(['init'], dir);

    expect(second.code).toBe(0);
    expect(read(dir, 'eslint.config.js')).toBe(`${before[0]}// mine\n`);
    expect(read(dir, 'tsconfig.json')).toBe(before[1]);
    expect(read(dir, 'package.json')).toBe(before[5]);

    for (const file of ['eslint.config.js', 'tsconfig.json', '.editorconfig', 'cspell.json', '.jscpd.json']) {
      expect(second.out).toContain(`kept ${file}`);
    }

    expect(second.out).not.toContain('wrote ');
  });

  it('keeps a script that exists and adds the missing ones', () => {
    const dir = project();

    write(dir, 'package.json', JSON.stringify({ type: 'module', scripts: { lint: 'oxlint .' } }));

    const result = run(['init'], dir);
    const { scripts } = JSON.parse(read(dir, 'package.json'));

    expect(scripts.lint).toBe('oxlint .');
    expect(scripts.check).toBe('strict-typescript check');
    expect(result.out).toContain('kept script lint');
  });
});

describe('hooks', () => {
  it('chains a hook that was there before, and uninstall puts it back', () => {
    const dir = project();

    write(dir, '.githooks/commit-msg', '#!/bin/sh\necho ran > "$(dirname "$0")/marker"\nexit 0\n');

    const result = run(['hooks', 'install'], dir);

    expect(result.code).toBe(0);
    expect(fs.existsSync(path.join(dir, '.githooks/commit-msg.local'))).toBe(true);

    write(dir, 'msg.txt', 'feat: add a thing\n');

    expect(sh(dir, 'sh', ['.githooks/commit-msg', 'msg.txt']).status).toBe(0);
    expect(fs.existsSync(path.join(dir, '.githooks/marker'))).toBe(true);

    write(dir, '.githooks/commit-msg.local', '#!/bin/sh\nexit 3\n');

    expect(sh(dir, 'sh', ['.githooks/commit-msg', 'msg.txt']).status).toBe(3);

    expect(run(['hooks', 'uninstall'], dir).code).toBe(0);
    expect(git(dir, 'config', 'core.hooksPath').output.trim()).toBe('');
    expect(read(dir, '.githooks/commit-msg')).toContain('exit 3');
    expect(fs.existsSync(path.join(dir, '.githooks/commit-msg.local'))).toBe(false);
  });

  it('chains a hook from .git/hooks, which core.hooksPath would otherwise hide', () => {
    const dir = project();

    write(dir, '.git/hooks/pre-push', '#!/bin/sh\nexit 4\n');
    run(['hooks', 'install'], dir);

    expect(read(dir, '.githooks/pre-push.local')).toContain('exit 4');
  });

  it('refuses a message with a Co-Authored-By trailer and accepts a clean one', () => {
    const dir = project();

    run(['hooks', 'install'], dir);
    write(dir, 'bad.txt', 'feat: add a thing\n\nCo-Authored-By: x\n');
    write(dir, 'odd.txt', 'fix: a thing\n\nco authored by : x\n');
    write(dir, 'clean.txt', 'feat: add a thing\n\nNo trailer here.\n# a comment line\n');

    const bad = sh(dir, 'sh', ['.githooks/commit-msg', 'bad.txt']);

    expect(bad.status).toBe(1);
    expect(bad.output).toContain('attribution trailer');
    expect(sh(dir, 'sh', ['.githooks/commit-msg', 'odd.txt']).status).toBe(1);
    expect(sh(dir, 'sh', ['.githooks/commit-msg', 'clean.txt']).status).toBe(0);
  });

  it('refuses the commit itself through git', () => {
    const dir = project();

    run(['hooks', 'install'], dir);
    write(dir, 'a.txt', 'a\n');
    git(dir, 'add', 'a.txt');

    expect(git(dir, 'commit', '-m', 'feat: a\n\nCo-Authored-By: x').status).not.toBe(0);
    expect(git(dir, 'commit', '-m', 'feat: a').status).toBe(0);
  });

  describe('pre-push', () => {
    const zero = '0'.repeat(40);

    function committed(lint: string) {
      const dir = project();
      const lock = {
        name: 'demo',
        lockfileVersion: 3,
        requires: true,
        packages: { '': { name: 'demo' } },
      };

      write(dir, 'package.json', JSON.stringify({
        name: 'demo',
        scripts: { lint: 'node lint.js', typecheck: 'node -e 0' },
      }));

      write(dir, 'package-lock.json', JSON.stringify(lock));
      write(dir, 'lint.js', `process.exit(${lint});\n`);
      run(['hooks', 'install'], dir);
      git(dir, 'add', '.');
      git(dir, 'commit', '--quiet', '-m', 'feat: demo');

      return { dir, sha: git(dir, 'rev-parse', 'HEAD').output.trim() } as const satisfies { dir: string; sha: string };
    }

    function push(dir: string, sha: string, env: Record<string, string> = {}) {
      return spawnSync('sh', ['.githooks/pre-push', 'origin', 'url'], {
        cwd: dir,
        encoding: 'utf8',
        input: `refs/heads/main ${sha} refs/heads/main ${zero}\n`,
        env: { ...process.env, ...env },
      });
    }

    it('skips the gate with STRICT_TS_SKIP_PREPUSH=1', () => {
      const { dir, sha } = committed('1');
      const result = push(dir, sha, { STRICT_TS_SKIP_PREPUSH: '1' });

      expect(result.status).toBe(0);
      expect(fs.existsSync(path.join(dir, '.git/strict-typescript-gate'))).toBe(false);
    });

    it('blocks a push whose lint script fails, and passes one that is clean', () => {
      const bad = committed('1');
      const blocked = push(bad.dir, bad.sha);

      expect(blocked.status).toBe(1);
      expect(blocked.stdout).toContain('lint failed, push blocked');

      const good = committed('0');

      expect(push(good.dir, good.sha).status).toBe(0);
    }, 120_000);
  });
});

describe('check', () => {
  function linked(): string {
    const dir = project();
    const configUrl = pathToFileURL(path.join(root, 'dist/index.js')).href;

    fs.symlinkSync(path.join(root, 'node_modules'), path.join(dir, 'node_modules'), 'junction');

    write(dir, 'package.json', JSON.stringify({
      type: 'module',
      scripts: { typecheck: 'node -e 0' },
    }));

    write(dir, 'tsconfig.json', JSON.stringify({ compilerOptions: { strict: true }, include: ['src'] }));

    write(dir, 'eslint.config.js', [
      `import strict from '${configUrl}';`,
      '',
      'export default strict({ tsconfigRootDir: import.meta.dirname });',
      '',
    ].join('\n'));

    return dir;
  }

  it('prints FAIL for a planted lint error and PASS once it is fixed', () => {
    const dir = linked();

    write(dir, 'src/value.ts', 'export const t = 1;\n');

    const bad = run(['check'], dir);

    expect(bad.code).toBe(1);
    expect(bad.out).toContain('FAIL eslint');
    expect(bad.out).toContain('PASS typecheck');

    write(dir, 'src/value.ts', 'export const seconds = 1;\n');

    const good = run(['check'], dir);

    expect(good.out).toContain('PASS eslint');
    expect(good.out).toContain('PASS typecheck');
    expect(good.code).toBe(0);
  }, 120_000);

  it('runs cspell and jscpd only when they are installed in the project', () => {
    const dir = linked();

    write(dir, 'src/value.ts', 'export const seconds = 1;\n');

    const withTools = run(['check'], dir);

    expect(withTools.out).toContain('PASS cspell');
    expect(withTools.out).toContain('PASS jscpd');
    expect(withTools.out).toContain('PASS oxlint');

    const bare = project();

    write(bare, 'package.json', JSON.stringify({ type: 'module', scripts: { typecheck: 'node -e 0' } }));

    const without = run(['check'], bare);

    expect(without.out).not.toContain('cspell');
    expect(without.out).not.toContain('jscpd');
  }, 120_000);
});

describe('usage', () => {
  it('prints the commands for an unknown command and exits 2', () => {
    const result = run(['nope'], os.tmpdir());

    expect(result.code).toBe(2);
    expect(result.out).toContain('init');
    expect(result.out).toContain('hooks install');
    expect(result.out).toContain('check');
  });
});
