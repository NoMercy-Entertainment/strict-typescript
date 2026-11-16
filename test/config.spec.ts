import path from 'node:path';

import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

import strict from '../src/index.js';

const fixtures = path.resolve(import.meta.dirname, '../fixtures');

async function lint(file: string, options: Parameters<typeof strict>[0] = {}) {
  const eslint = new ESLint({
    cwd: fixtures,
    overrideConfigFile: true,
    overrideConfig: strict({ tsconfigRootDir: fixtures, ...options }),
  });
  const [result] = await eslint.lintFiles([file]);

  return result?.messages ?? [];
}

function ids(messages: Awaited<ReturnType<typeof lint>>) {
  return messages.map((message) => message.ruleId);
}

describe('strict()', () => {
  it('reports every planted defect in bad.ts', async () => {
    const messages = await lint('bad.ts');
    const found = ids(messages);

    expect(found).toContain('strict/body-shape');
    expect(found).toContain('@stylistic/multiline-ternary');
    expect(found).toContain('@stylistic/padding-line-between-statements');
    expect(found).toContain('no-nested-ternary');
    expect(found).toContain('strict/no-redundant-type-annotation');
    expect(messages.some((message) => message.message.includes('Type the real shape'))).toBe(true);
    expect(messages.some((message) => message.message.includes('instead of casting to keyof'))).toBe(true);
    expect(messages.some((message) => message.message.includes('Join lists with merge'))).toBe(true);
  });

  it('reports nothing in good.ts, next to the bad.ts positive control', async () => {
    const messages = await lint('good.ts');

    expect(messages.map((message) => `${message.ruleId}: ${message.message}`)).toEqual([]);
  });

  it('names the array helper module from the arrayHelpers option', async () => {
    const messages = await lint('bad.ts', { arrayHelpers: '@/lib/array' });

    expect(messages.some((message) => message.message.includes('from @/lib/array.'))).toBe(true);
  });

  it('drops the type-aware rules when typeChecked is false', async () => {
    const found = ids(await lint('bad.ts', { typeChecked: false }));

    expect(found).not.toContain('strict/no-redundant-type-annotation');
    expect(found).toContain('strict/body-shape');
  });

  it('skips the unknown and keyof checks in test files', async () => {
    const messages = await lint('__tests__/loose.ts');

    expect(messages.some((message) => message.message.includes('Type the real shape'))).toBe(false);
    expect(messages.some((message) => message.message.includes('Join lists with merge'))).toBe(true);
  });

  it('adds the extra ignores to the default ones', async () => {
    const messages = await lint('bad.ts', { ignores: ['bad.ts'] });

    expect(messages.map((message) => message.message)).toEqual([
      expect.stringContaining('File ignored because of a matching ignore pattern'),
    ]);
  });
});

describe('strict({ vue: true })', () => {
  it('reports a nested ternary in a template of Bad.vue', async () => {
    const messages = await lint('Bad.vue', { vue: true });

    expect(ids(messages)).toContain('vue/no-restricted-syntax');
  });

  it('reports nothing in Good.vue', async () => {
    const messages = await lint('Good.vue', { vue: true });

    expect(messages.map((message) => `${message.ruleId}: ${message.message}`)).toEqual([]);
  });
});
