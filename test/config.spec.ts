// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

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

  it('reports each general player rule in bad.ts', async () => {
    const found = ids(await lint('bad.ts'));

    expect(found).toContain('strict/no-single-letter-ident');
    expect(found).toContain('strict/no-history-comments');
    expect(found).toContain('strict/no-object-literal-cast');
    expect(found).toContain('strict/no-unknown-cast');
    expect(found).toContain('strict/no-compat-vocab');
  });

  it('extends the compat comment markers with compatVocab', async () => {
    const messages = await lint('bad.ts', { compatVocab: { commentSubstrings: ['tidy this up'] } });
    const markers = messages.filter((message) => message.ruleId === 'strict/no-compat-vocab');

    expect(markers).toHaveLength(2);
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

  it('allows the object literal and unknown casts in test files', async () => {
    const found = ids(await lint('__tests__/loose.ts'));

    expect(found).not.toContain('strict/no-object-literal-cast');
    expect(found).not.toContain('strict/no-unknown-cast');
  });

  it('adds the extra ignores to the default ones', async () => {
    const messages = await lint('bad.ts', { ignores: ['bad.ts'] });

    expect(messages.map((message) => message.message)).toEqual([
      expect.stringContaining('File ignored because of a matching ignore pattern'),
    ]);
  });
});

// A planted defect reports, and the clean file next to it reports nothing, in the same run.
// The rule ids the bad file reports, and what the good file reports beside them.
async function defectAndClean(
  bad: string,
  good: string,
  options: Parameters<typeof strict>[0],
) {
  const found = ids(await lint(bad, options));
  const clean = (await lint(good, options)).map((message) => `${message.ruleId}: ${message.message}`);

  return { found, clean };
}

describe('strict({ vitest })', () => {
  it('reports a focused test and keeps a normal test clean', async () => {
    const { found, clean } = await defectAndClean('vitest/bad.spec.ts', 'vitest/good.spec.ts', { typeChecked: false });

    expect(found).toContain('vitest/no-focused-tests');
    expect(clean).toEqual([]);
  });

  it('turns the vitest rules off with false', async () => {
    const found = ids(await lint('vitest/bad.spec.ts', { typeChecked: false, vitest: false }));

    expect(found).not.toContain('vitest/no-focused-tests');
  });

  it('takes its own file list', async () => {
    const found = ids(await lint('vitest/bad.spec.ts', { typeChecked: false, vitest: ['nothing/**'] }));

    expect(found).not.toContain('vitest/no-focused-tests');
  });
});

describe('strict({ playwright })', () => {
  it('reports a focused e2e test and keeps a normal one clean', async () => {
    const { found, clean } = await defectAndClean('e2e/bad.spec.ts', 'e2e/good.spec.ts', { typeChecked: false, vitest: false });

    expect(found).toContain('playwright/no-focused-test');
    expect(clean).toEqual([]);
  });

  it('turns the playwright rules off with false', async () => {
    const found = ids(await lint('e2e/bad.spec.ts', {
      typeChecked: false,
      vitest: false,
      playwright: false,
    }));

    expect(found).not.toContain('playwright/no-focused-test');
  });
});

describe('strict({ i18n })', () => {
  const i18n = { localeDir: [{ pattern: './i18n/locales/*.json', localeKey: 'file' }] } as const;
  const options = {
    typeChecked: false,
    vue: true,
    i18n,
  } as const satisfies Parameters<typeof strict>[0];

  it('reports raw template text and a missing key, and keeps a translated template clean', async () => {
    const found = ids(await lint('i18n/Bad.vue', options));

    expect(found).toContain('@intlify/vue-i18n/no-raw-text');
    expect(found).toContain('@intlify/vue-i18n/no-missing-keys');
    expect(await lint('i18n/Good.vue', options)).toEqual([]);
  });

  it('reports a key written twice in a locale file and keeps a clean locale file clean', async () => {
    const { found, clean } = await defectAndClean('i18n/locales/nl.json', 'i18n/locales/en.json', options);

    expect(found).toContain('@intlify/vue-i18n/no-duplicate-keys-in-locale');
    expect(clean).toEqual([]);
  });

  it('is off when i18n is not given', async () => {
    const found = ids(await lint('i18n/Bad.vue', {
      typeChecked: false,
      vue: true,
    }));

    expect(found.some((id) => id?.startsWith('@intlify/'))).toBe(false);
  });
});

describe('strict({ tailwind })', () => {
  const options = {
    typeChecked: false,
    vue: true,
    tailwind: { entryPoint: 'tailwind/main.css' },
  } as const satisfies Parameters<typeof strict>[0];

  it('reports a non-canonical class and keeps a canonical one clean', async () => {
    const { found, clean } = await defectAndClean('tailwind/Bad.vue', 'tailwind/Good.vue', options);

    expect(found).toContain('better-tailwindcss/enforce-canonical-classes');
    expect(clean).toEqual([]);
  });

  it('skips the files named in tailwind.ignores', async () => {
    const found = ids(await lint('tailwind/Bad.vue', {
      ...options,
      tailwind: {
        entryPoint: 'tailwind/main.css',
        ignores: ['tailwind/**'],
      },
    }));

    expect(found).not.toContain('better-tailwindcss/enforce-canonical-classes');
  });
});

describe('strict({ generated })', () => {
  it('exempts a generated file and still reports the same file without the option', async () => {
    const without = await lint('gen/generated.ts', { typeChecked: false });
    const exempt = await lint('gen/generated.ts', {
      typeChecked: false,
      generated: ['gen/**'],
    });

    expect(ids(without)).toContain('@typescript-eslint/no-explicit-any');
    expect(ids(without)).toContain('strict/body-shape');
    expect(exempt).toEqual([]);
  });
});

describe('strict({ importBoundaries })', () => {
  const clientRule = {
    module: '(^|/)client$',
    allowedIn: ['boundaries/api/**'],
    message: 'Only boundaries/api may import the client.',
  } as const;
  const secretRule = {
    module: '(^|/)secrets$',
    allowedIn: ['boundaries/vault/**'],
    message: 'Only boundaries/vault may import the secrets.',
  } as const;
  const options = {
    typeChecked: false,
    importBoundaries: [clientRule, secretRule],
  } as const satisfies Parameters<typeof strict>[0];

  it('reports an import outside the allowed folder and keeps the allowed folder clean', async () => {
    const outside = await lint('boundaries/other.ts', options);

    expect(outside.map((message) => message.message)).toEqual([expect.stringContaining('Only boundaries/api may import the client.')]);

    expect(await lint('boundaries/api/inside.ts', {
      ...options,
      importBoundaries: [clientRule],
    })).toEqual([]);
  });

  it('reports every entry that applies to one file', async () => {
    const text = (await lint('boundaries/both.ts', options)).map((message) => message.message).join('\n');

    expect(text).toContain('Only boundaries/api may import the client.');
    expect(text).toContain('Only boundaries/vault may import the secrets.');
  });

  it('applies only the entries whose folder does not allow the file', async () => {
    const messages = (await lint('boundaries/api/inside.ts', options)).map((message) => message.message);

    expect(messages).toEqual([expect.stringContaining('Only boundaries/vault may import the secrets.')]);
  });
});

describe('strict({ oxlint })', () => {
  const options = {
    typeChecked: false,
    vitest: false,
  } as const satisfies Parameters<typeof strict>[0];

  it('turns off the ESLint rules the shipped oxlintrc.json covers, and reports them when it is off', async () => {
    const off = ids(await lint('oxlint/bad.ts', { ...options, oxlint: false }));
    const on = ids(await lint('oxlint/bad.ts', { ...options, oxlint: true }));

    expect(off).toContain('@typescript-eslint/no-this-alias');
    expect(on).not.toContain('@typescript-eslint/no-this-alias');
  });

  it('reads a config path when oxlint is a string', async () => {
    const found = ids(await lint('oxlint/bad.ts', {
      ...options,
      oxlint: path.resolve(fixtures, 'oxlint/empty.oxlintrc.json'),
    }));

    expect(found).toContain('@typescript-eslint/no-this-alias');
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
