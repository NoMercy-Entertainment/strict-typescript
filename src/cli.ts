// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface CliResult {
  code: number;
  out: string;
}

interface PackageJson {
  type?: string;
  scripts?: Record<string, string>;
  bin?: string | Record<string, string>;
}

interface StepResult {
  ok: boolean;
  output: string;
}

const packageName = '@nomercy-entertainment/strict-typescript';
const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const hookNames = ['commit-msg', 'pre-push'] as const;
const hookMarker = 'strict-typescript hook:';
const eslintConfigs = ['eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs', 'eslint.config.ts', 'eslint.config.mts', 'eslint.config.cts'];
const cspellConfigs = ['cspell.json', '.cspell.json', 'cspell.config.json', 'cspell.config.js', 'cspell.config.cjs', 'cspell.config.mjs'];
const maxOutputLines = 30;

const usage = [
  'strict-typescript <command>',
  '',
  '  init [--vue] [--node]   write the config files and scripts, then install the hooks',
  '  hooks install           install the commit-msg and pre-push git hooks',
  '  hooks uninstall         remove them and restore the hooks that were there before',
  '  check                   run eslint, the typecheck script, and cspell, jscpd and oxlint when installed',
];

function exists(dir: string, file: string): boolean {
  return fs.existsSync(path.join(dir, file));
}

function readText(dir: string, file: string): string {
  return fs.readFileSync(path.join(dir, file), 'utf8');
}

function readPackage(dir: string) {
  return exists(dir, 'package.json')
    ? JSON.parse(readText(dir, 'package.json')) as PackageJson
    : {} as const satisfies PackageJson;
}

function writeJson(dir: string, file: string, value: object): void {
  fs.writeFileSync(path.join(dir, file), `${JSON.stringify(value, null, 2)}\n`);
}

function git(cwd: string, args: string[]): { status: number | null; stdout: string } {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });

  return {
    status: result.status,
    stdout: result.stdout.trim(),
  };
}

// Writes a file that does not exist yet. An existing file stays, and the log says what to merge.
function writeNew(dir: string, file: string, content: string, log: string[], merge: string): void {
  if (exists(dir, file)) {
    log.push(`kept ${file}`, `  merge by hand: ${merge}`);

    return;
  }

  fs.writeFileSync(path.join(dir, file), content);
  log.push(`wrote ${file}`);
}

function firstExisting(dir: string, files: string[]): string | undefined {
  return files.find((file) => exists(dir, file));
}

function copyFromPackage(dir: string, file: string, target: string, log: string[]): void {
  const source = path.join(packageRoot, file);

  writeNew(dir, target, fs.readFileSync(source, 'utf8'), log, `compare with ${packageName}/${file}`);
}

function writeScripts(dir: string, scripts: Record<string, string>, log: string[]): void {
  const pkg = readPackage(dir);
  const current = pkg.scripts ?? {};
  const added: Record<string, string> = {};

  for (const [name, command] of Object.entries(scripts)) {
    if (current[name] === undefined) {
      added[name] = command;
      continue;
    }

    log.push(`kept script ${name}`, `  merge by hand: "${name}": "${command}"`);
  }

  if (Object.keys(added).length === 0) return;

  writeJson(dir, 'package.json', { ...pkg, scripts: { ...current, ...added } });
  log.push(`wrote scripts ${Object.keys(added).join(', ')} in package.json`);
}

function hooksFolder(root: string, log: string[]): string | undefined {
  const configured = git(root, ['config', '--get', 'core.hooksPath']).stdout;

  if (configured !== '')
    return path.resolve(root, configured);

  git(root, ['config', 'core.hooksPath', '.githooks']);
  git(root, ['config', 'strict-typescript.setHooksPath', 'true']);
  log.push('set core.hooksPath to .githooks');

  return path.join(root, '.githooks');
}

function chainBefore(folder: string, hook: string, gitDir: string, log: string[]): void {
  const target = path.join(folder, hook);
  const local = `${target}.local`;
  const preGit = path.join(gitDir, 'hooks', hook);

  if (fs.existsSync(local)) return;

  if (fs.existsSync(target) && !fs.readFileSync(target, 'utf8').includes(hookMarker)) {
    fs.renameSync(target, local);
    log.push(`chained the existing ${hook} as ${hook}.local`);

    return;
  }

  if (!fs.existsSync(target) && fs.existsSync(preGit)) {
    fs.copyFileSync(preGit, local);
    log.push(`chained .git/hooks/${hook} as ${hook}.local`);
  }
}

function hooksInstall(cwd: string, log: string[]): boolean {
  const top = git(cwd, ['rev-parse', '--show-toplevel']);

  if (top.status !== 0) {
    log.push('skipped hooks: this folder is not a git repository');

    return false;
  }

  const root = path.resolve(top.stdout);
  const gitDir = path.resolve(root, git(root, ['rev-parse', '--git-dir']).stdout);
  const folder = hooksFolder(root, log);

  if (folder === undefined)
    return false;

  fs.mkdirSync(folder, { recursive: true });

  for (const hook of hookNames) {
    chainBefore(folder, hook, gitDir, log);
    const template = fs.readFileSync(path.join(packageRoot, 'hooks', hook));

    fs.writeFileSync(path.join(folder, hook), template, { mode: 0o755 });
    log.push(`installed hook ${hook}`);
  }

  return true;
}

function restoreHook(folder: string, hook: string, gitDir: string, log: string[]): void {
  const target = path.join(folder, hook);
  const local = `${target}.local`;

  if (fs.existsSync(target) && fs.readFileSync(target, 'utf8').includes(hookMarker)) {
    fs.rmSync(target);
    log.push(`removed hook ${hook}`);
  }

  if (!fs.existsSync(local)) return;

  const preGit = path.join(gitDir, 'hooks', hook);
  const copied = fs.existsSync(preGit) && fs.readFileSync(preGit, 'utf8') === fs.readFileSync(local, 'utf8');

  if (copied) {
    fs.rmSync(local);

    return;
  }

  fs.renameSync(local, target);
  log.push(`restored ${hook}`);
}

function hooksUninstall(cwd: string, log: string[]): boolean {
  const top = git(cwd, ['rev-parse', '--show-toplevel']);

  if (top.status !== 0) {
    log.push('skipped hooks: this folder is not a git repository');

    return false;
  }

  const root = path.resolve(top.stdout);
  const gitDir = path.resolve(root, git(root, ['rev-parse', '--git-dir']).stdout);
  const configured = git(root, ['config', '--get', 'core.hooksPath']).stdout;
  const folder = path.resolve(root, configured === ''
    ? '.githooks'
    : configured);

  for (const hook of hookNames) {
    restoreHook(folder, hook, gitDir, log);
  }

  if (git(root, ['config', '--get', 'strict-typescript.setHooksPath']).stdout === 'true') {
    git(root, ['config', '--unset', 'core.hooksPath']);
    git(root, ['config', '--unset', 'strict-typescript.setHooksPath']);
    log.push('unset core.hooksPath');
  }

  if (fs.existsSync(folder) && fs.readdirSync(folder).length === 0) {
    fs.rmdirSync(folder);
  }

  return true;
}

function init(cwd: string, flags: string[], log: string[]): void {
  const vue = flags.includes('--vue');
  const frontend = vue
    ? 'vue'
    : 'dom';
  const preset = flags.includes('--node')
    ? 'node'
    : frontend;

  if (!exists(cwd, 'package.json')) {
    writeJson(cwd, 'package.json', { private: true, type: 'module' });
    log.push('wrote package.json');
  }

  const esm = readPackage(cwd).type === 'module';
  const call = vue
    ? 'strict({ vue: true })'
    : 'strict()';
  const eslintFile = firstExisting(cwd, eslintConfigs);

  if (eslintFile === undefined) {
    const content = `import strict from '${packageName}';\n\nexport default ${call};\n`;

    writeNew(cwd, esm
      ? 'eslint.config.js'
      : 'eslint.config.mjs', content, log, '');
  } else {
    log.push(`kept ${eslintFile}`, `  merge by hand: export default ${call};`);
  }

  const extend = `${packageName}/tsconfig/${preset}.json`;

  writeNew(cwd, 'tsconfig.json', `${JSON.stringify({ extends: extend, include: ['src'] }, null, 2)}\n`, log, `"extends": "${extend}"`);
  copyFromPackage(cwd, '.editorconfig', '.editorconfig', log);

  const cspellFile = firstExisting(cwd, cspellConfigs);
  const cspellImport = `${JSON.stringify({ import: [`${packageName}/cspell.json`] }, null, 2)}\n`;

  if (cspellFile === undefined) {
    writeNew(cwd, 'cspell.json', cspellImport, log, '');
  } else {
    log.push(`kept ${cspellFile}`, `  merge by hand: "import": ["${packageName}/cspell.json"]`);
  }

  copyFromPackage(cwd, 'jscpd.json', '.jscpd.json', log);

  writeScripts(cwd, {
    lint: 'eslint .',
    'lint:fix': 'eslint . --fix',
    typecheck: vue
      ? 'vue-tsc --noEmit'
      : 'tsc --noEmit',
    check: 'strict-typescript check',
  }, log);

  const needs = ['eslint', 'typescript', ...(vue
    ? ['eslint-plugin-vue', 'vue-eslint-parser', 'vue-tsc']
    : [])];

  log.push(`next: npm i -D ${packageName} ${needs.join(' ')}${preset === 'node'
    ? ' @types/node'
    : ''}`);

  hooksInstall(cwd, log);
}

// Finds a tool the way node would: in node_modules, from the project folder up.
function findBin(cwd: string, name: string): string | undefined {
  for (let dir = path.resolve(cwd); ; dir = path.dirname(dir)) {
    const manifest = path.join(dir, 'node_modules', name, 'package.json');

    if (fs.existsSync(manifest)) {
      const { bin } = JSON.parse(fs.readFileSync(manifest, 'utf8')) as PackageJson;
      const file = typeof bin === 'string'
        ? bin
        : Object.values(bin ?? {})[0];

      return file === undefined
        ? undefined
        : path.join(path.dirname(manifest), file);
    }

    if (path.dirname(dir) === dir)
      return undefined;
  }
}

function runNode(cwd: string, script: string, args: string[]) {
  const result = spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' });

  return {
    ok: result.status === 0,
    output: `${result.stdout}${result.stderr}`,
  } as const satisfies StepResult;
}

function runInstalled(cwd: string, name: string, args: string[]): StepResult | undefined {
  const bin = findBin(cwd, name);

  if (bin === undefined)
    return undefined;

  return runNode(cwd, bin, args);
}

function typecheck(cwd: string): StepResult {
  if (readPackage(cwd).scripts?.['typecheck'] === undefined)
    return { ok: false, output: 'package.json has no typecheck script. Run: npx strict-typescript init' };

  const result = spawnSync('npm run --silent typecheck', {
    cwd,
    encoding: 'utf8',
    shell: true,
  });

  return {
    ok: result.status === 0,
    output: `${result.stdout}${result.stderr}`,
  };
}

function sourceTarget(cwd: string): string {
  return exists(cwd, 'src')
    ? 'src'
    : '.';
}

function oxlintConfig(cwd: string): string {
  const own = firstExisting(cwd, ['.oxlintrc.json', 'oxlintrc.json']);

  return own === undefined
    ? path.join(packageRoot, 'oxlintrc.json')
    : path.join(cwd, own);
}

function check(cwd: string, log: string[]): boolean {
  const cspellGlob = '**/*.{ts,tsx,mts,cts,vue,md}';
  const steps = [
    ['eslint', runInstalled(cwd, 'eslint', ['.']) ?? { ok: false, output: 'eslint is not installed. Run: npm i -D eslint' }],
    ['typecheck', typecheck(cwd)],
    ['cspell', runInstalled(cwd, 'cspell', ['--no-progress', '--gitignore', '--no-must-find-files', cspellGlob])],
    ['jscpd', runInstalled(cwd, 'jscpd', ['--config', exists(cwd, '.jscpd.json')
      ? '.jscpd.json'
      : path.join(packageRoot, 'jscpd.json'), sourceTarget(cwd)])],
    ['oxlint', runInstalled(cwd, 'oxlint', ['-c', oxlintConfig(cwd), sourceTarget(cwd)])],
  ] as const;
  let passed = true;

  for (const [name, result] of steps) {
    if (result === undefined) continue;

    if (!result.ok) {
      passed = false;
      log.push(...result.output.trim().split('\n').slice(0, maxOutputLines).map((line) => `  | ${line}`));
    }

    log.push(`${result.ok
      ? 'PASS'
      : 'FAIL'} ${name}`);
  }

  return passed;
}

export function run(args: string[], cwd: string) {
  const [command, subcommand] = args;
  const log: string[] = [];
  let code = 0;

  if (command === 'init') {
    init(cwd, args.slice(1), log);
  } else if (command === 'hooks' && subcommand === 'install') {
    code = hooksInstall(cwd, log)
      ? 0
      : 1;
  } else if (command === 'hooks' && subcommand === 'uninstall') {
    code = hooksUninstall(cwd, log)
      ? 0
      : 1;
  } else if (command === 'check') {
    code = check(cwd, log)
      ? 0
      : 1;
  } else {
    log.push(...usage);

    code = command === undefined || command === '--help' || command === 'help'
      ? 0
      : 2;
  }

  return { code, out: `${log.join('\n')}\n` } as const satisfies CliResult;
}
