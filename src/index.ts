// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import stylistic from '@stylistic/eslint-plugin';
import type { TSESLint } from '@typescript-eslint/utils';
import type { Linter } from 'eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

import { merge } from './array.js';
import { plugin, rules } from './plugin.js';
import { defaultCommentSubstrings, type Words } from './rules/no-compat-vocab.js';

export { plugin, rules };

type Config = TSESLint.FlatConfig.Config;

export interface I18nOptions {
  // Where the locale files live, as vue-i18n's localeDir setting.
  localeDir: ReadonlyArray<string | {
    pattern: string;
    localeKey: 'file' | 'path' | 'key';
  }>;
  messageSyntaxVersion?: string;
}

export interface TailwindOptions {
  // The CSS file that imports Tailwind.
  entryPoint: string;
  ignores?: readonly string[];
}

export interface ImportBoundary {
  // Regex matched against the import path.
  module: string;
  // Globs of the files that may import it.
  allowedIn: readonly string[];
  message: string;
}

export interface StrictOptions {
  // Lint .vue files too. Needs eslint-plugin-vue and vue-eslint-parser.
  vue?: boolean;
  // Files to lint. Default: TypeScript files, plus .vue files when vue is on.
  files?: string[];
  // Added to the default ignores (dist, dist-ssr, dev-dist, coverage).
  ignores?: string[];
  // Turn off to drop the rules that need type information.
  typeChecked?: boolean;
  tsconfigRootDir?: string;
  // Module named in the merge and keysOf messages.
  arrayHelpers?: string;
  // Files where the unknown and keyof checks stay off.
  testFiles?: string[];
  // Vitest rules. Default: on when @vitest/eslint-plugin resolves, for testFiles.
  vitest?: boolean | readonly string[];
  // Playwright rules. Default: on when eslint-plugin-playwright resolves, for e2e specs.
  playwright?: boolean | readonly string[];
  // vue-i18n rules and the duplicate-key check for locale files. Off when not given.
  i18n?: I18nOptions;
  // Tailwind class rules. Off when not given.
  tailwind?: TailwindOptions;
  // Words for strict/no-compat-vocab. The comment markers extend the built-in ones.
  compatVocab?: Words;
  // Globs of generated files, exempt from the style rules.
  generated?: readonly string[];
  // Imports only some folders may use.
  importBoundaries?: readonly ImportBoundary[];
  // Turns off the ESLint rules oxlint covers. true uses the shipped oxlintrc.json, a string a path.
  oxlint?: boolean | string;
}

interface VueParts {
  plugin: { configs: Record<string, Config[]> };
  parser: NonNullable<TSESLint.FlatConfig.LanguageOptions['parser']>;
}

interface PluginWithConfigs {
  configs: Record<string, Config>;
}

interface OxlintPlugin {
  buildFromOxlintConfigFile: (file: string) => Config[];
}

const defaultArrayHelpers = '@nomercy-entertainment/strict-typescript/array';
const defaultE2eFiles = ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'];
const defaultMessageSyntax = '^11.0.0';
const shippedOxlintConfig = fileURLToPath(new URL('../oxlintrc.json', import.meta.url));

const load = createRequire(import.meta.url);

// Required on demand so a project without Vue never needs the two packages.
function loadVue() {
  try {
    return {
      plugin: load('eslint-plugin-vue') as VueParts['plugin'],
      parser: load('vue-eslint-parser') as VueParts['parser'],
    } as const satisfies VueParts;
  } catch (error) {
    throw new Error(
      'strict({ vue: true }) needs eslint-plugin-vue and vue-eslint-parser. ' +
      'Install them with: npm i -D eslint-plugin-vue vue-eslint-parser',
      { cause: error },
    );
  }
}

function resolves(name: string): boolean {
  try {
    load.resolve(name);

    return true;
  } catch {
    return false;
  }
}

function requirePackage<T>(name: string, option: string): T {
  try {
    return load(name) as T;
  } catch (error) {
    throw new Error(
      `strict({ ${option} }) needs ${name}. Install it with: npm i -D ${name}`,
      { cause: error },
    );
  }
}

// undefined = off. A list of globs or true needs the package; unset is on only when it resolves.
function switchedFiles(
  option: boolean | readonly string[] | undefined,
  name: string,
  defaults: readonly string[],
): readonly string[] | undefined {
  if (option === false)
    return undefined;

  if (option === undefined && !resolves(name))
    return undefined;

  return Array.isArray(option)
    ? option
    : defaults;
}

function i18nConfigs(
  i18n: I18nOptions,
  files: readonly string[],
): Config[] {
  const plugin = requirePackage<TSESLint.FlatConfig.Plugin>('@intlify/eslint-plugin-vue-i18n', 'i18n');
  const parser = requirePackage<NonNullable<TSESLint.FlatConfig.LanguageOptions['parser']>>('jsonc-eslint-parser', 'i18n');
  const settings = {
    'vue-i18n': {
      localeDir: i18n.localeDir,
      messageSyntaxVersion: i18n.messageSyntaxVersion ?? defaultMessageSyntax,
    },
  };

  return [
    {
      // Every key must exist in the locale files, and no text is written in a template.
      name: 'strict/i18n',
      files: [...files],
      plugins: { '@intlify/vue-i18n': plugin },
      settings,
      rules: {
        '@intlify/vue-i18n/no-missing-keys': 'error',
        '@intlify/vue-i18n/no-raw-text': 'error',
        '@intlify/vue-i18n/no-v-html': 'error',
      },
    },
    {
      // A key written twice in a locale file silently keeps the last one.
      name: 'strict/i18n-locales',
      files: localePatterns(i18n.localeDir),
      languageOptions: { parser },
      plugins: { '@intlify/vue-i18n': plugin },
      settings,
      rules: { '@intlify/vue-i18n/no-duplicate-keys-in-locale': 'error' },
    },
  ];
}

function oxlintConfigFile(option: boolean | string | undefined): string | undefined {
  if (option === false)
    return undefined;

  if (option === undefined && !resolves('eslint-plugin-oxlint'))
    return undefined;

  return typeof option === 'string'
    ? path.resolve(option)
    : shippedOxlintConfig;
}

function localePatterns(localeDir: I18nOptions['localeDir']): string[] {
  return localeDir.map((entry) => (typeof entry === 'string'
    ? entry
    : entry.pattern).replace(/^\.\//, ''));
}

// A file that matches an earlier entry's allowedIn is out of that entry only. The config that
// holds exactly the entries applying to a file comes last, so subsets run smallest first.
function boundaryConfigs(
  boundaries: readonly ImportBoundary[],
  files: readonly string[],
): Config[] {
  const masks = Array.from(Array(2 ** boundaries.length - 1).keys(), (index) =>
    index + 1)
    .sort((left, right) => bitCount(left) - bitCount(right) || left - right);

  return masks.map((mask) => {
    const chosen = boundaries.filter((entry, index) => (mask & (1 << index)) !== 0);

    return {
      name: `strict/import-boundaries-${mask}`,
      files: [...files],
      ignores: chosen.flatMap((boundary) => boundary.allowedIn),
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: chosen.map((boundary) => ({
              regex: boundary.module,
              message: boundary.message,
            })),
          },
        ],
      },
    } as const satisfies Config;
  });
}

function bitCount(value: number): number {
  let count = 0;

  for (let rest = value; rest > 0; rest >>= 1) {
    count += rest & 1;
  }

  return count;
}

function restrictedSyntax(arrayHelpers: string, withUnknown: boolean) {
  return [
    'error',
    {
      selector: 'ArrayExpression[elements.0.type=\'SpreadElement\'][elements.1.type=\'SpreadElement\']',
      message: `Join lists with merge(a, b) from ${arrayHelpers}.`,
    },
    {
      selector: 'TSAsExpression > TSTypeOperator[operator=\'keyof\']',
      message: `Narrow the value with oneOf(keysOf(TABLE), value) from ${arrayHelpers} instead of casting to keyof.`,
    },
    ...withUnknown
      ? [
          {
            selector:
              'TSUnknownKeyword:not(CatchClause TSUnknownKeyword, [returnType.typeAnnotation.type=\'TSTypePredicate\'] TSUnknownKeyword)',
            message:
              'Type the real shape. unknown is only for an input that must accept everything (catch variable, type guard).',
          },
        ]
      : [],
  ] as const satisfies TSESLint.SharedConfig.RuleEntry;
}

// The typescript-eslint and ESLint config types differ in small ways; the shape is the same.
export function strict(options: StrictOptions = {}): Linter.Config[] {
  const vue = options.vue ?? false;
  const typeChecked = options.typeChecked ?? true;
  const arrayHelpers = options.arrayHelpers ?? defaultArrayHelpers;
  const testFiles = options.testFiles ?? ['**/__tests__/**', '**/*.{spec,test}.ts'];
  const files = options.files ?? (vue
    ? ['**/*.{ts,mts,cts,tsx}', '**/*.vue']
    : ['**/*.{ts,mts,cts,tsx}']);
  const vueParts = vue
    ? loadVue()
    : undefined;
  const strictPlugin = { strict: plugin };
  const stylisticPlugin = { '@stylistic': stylistic };

  const generated = [...options.generated ?? []];
  const skipGenerated = generated.length > 0
    ? { ignores: generated }
    : {};
  const vitestFiles = switchedFiles(options.vitest, '@vitest/eslint-plugin', testFiles);
  const playwrightFiles = switchedFiles(options.playwright, 'eslint-plugin-playwright', defaultE2eFiles);
  const oxlintFile = oxlintConfigFile(options.oxlint);

  const configs: Config[] = [
    { name: 'strict/files-to-lint', files },
    {
      name: 'strict/ignores',
      ignores: ['**/dist/**', '**/dist-ssr/**', '**/dev-dist/**', '**/coverage/**', ...options.ignores ?? []],
    },

    ...tseslint.configs.recommended as Config[],
    ...vueParts
      ? [
          ...vueParts.plugin.configs['flat/essential'] ?? [],
          {
            name: 'strict/vue-parser',
            files: ['**/*.vue'],
            languageOptions: {
              parser: vueParts.parser,
              parserOptions: {
                parser: tseslint.parser,
                extraFileExtensions: ['.vue'],
                sourceType: 'module',
              },
            },
          } as const satisfies Config,
        ]
      : [],

    {
      name: 'strict/unused-imports',
      files,
      ...skipGenerated,
      plugins: { 'unused-imports': unusedImports },
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
          'error',
          {
            vars: 'all',
            args: 'after-used',
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],
      },
    },

    ...typeChecked
      ? [
          {
            name: 'strict/no-redundant-type-annotation',
            files,
            ...skipGenerated,
            languageOptions: {
              parserOptions: {
                projectService: true,
                ...options.tsconfigRootDir === undefined
                  ? {}
                  : { tsconfigRootDir: options.tsconfigRootDir },
                ...vue
                  ? { extraFileExtensions: ['.vue'] }
                  : {},
              },
            },
            plugins: strictPlugin,
            rules: {
              'strict/no-redundant-type-annotation': 'error',
              'strict/generic-over-annotation': 'error',
              '@typescript-eslint/no-deprecated': 'error',
            },
          } as const satisfies Config,
        ]
      : [],

    ...oxlintFile === undefined
      ? []
      : requirePackage<OxlintPlugin>('eslint-plugin-oxlint', 'oxlint').buildFromOxlintConfigFile(oxlintFile),

    {
      name: 'strict/format',
      files,
      ...skipGenerated,
      plugins: stylisticPlugin,
      rules: {
        ...stylistic.configs.customize({
          indent: 2,
          quotes: 'single',
          semi: true,
          commaDangle: 'always-multiline',
          braceStyle: '1tbs',
          arrowParens: true,
          quoteProps: 'as-needed',
          jsx: false,
        }).rules,
        'no-nested-ternary': 'error',
        '@stylistic/max-len': [
          'error',
          {
            code: 100,
            ignoreUrls: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
            ignoreRegExpLiterals: true,
            ignoreComments: true,
          },
        ],
      },
    },

    ...vue
      ? [
          {
            name: 'strict/format-vue-template',
            files: ['**/*.vue'],
            ...skipGenerated,
            rules: {
              '@stylistic/max-len': 'off',
              'vue/no-restricted-syntax': [
                'error',
                {
                  selector: 'ConditionalExpression ConditionalExpression',
                  message: 'Name a ternary chain: move it to a computed or a function in the script.',
                },
              ],
              'vue/html-indent': ['error', 2],
              'vue/html-quotes': ['error', 'double'],
              'vue/html-closing-bracket-newline': 'error',
              'vue/html-closing-bracket-spacing': 'error',
              'vue/mustache-interpolation-spacing': 'error',
              'vue/no-multi-spaces': 'error',
              'vue/max-attributes-per-line': ['error', { singleline: { max: 4 }, multiline: { max: 1 } }],
              'vue/max-len': [
                'error',
                {
                  code: 100,
                  template: 100,
                  ignoreUrls: true,
                  ignoreStrings: true,
                  ignoreTemplateLiterals: true,
                  ignoreHTMLAttributeValues: true,
                  ignoreComments: true,
                },
              ],
            },
          } as const satisfies Config,
        ]
      : [],

    {
      name: 'strict/blank-lines',
      files,
      ...skipGenerated,
      plugins: stylisticPlugin,
      rules: {
        '@stylistic/padding-line-between-statements': [
          'error',
          {
            blankLine: 'always',
            prev: '*',
            next: 'return',
          },
          {
            blankLine: 'always',
            prev: ['const', 'let'],
            next: '*',
          },
          {
            blankLine: 'any',
            prev: ['const', 'let'],
            next: ['const', 'let'],
          },
          {
            blankLine: 'always',
            prev: 'multiline-block-like',
            next: '*',
          },
          {
            blankLine: 'always',
            prev: '*',
            next: 'multiline-block-like',
          },
          {
            blankLine: 'always',
            prev: 'multiline-expression',
            next: '*',
          },
          {
            blankLine: 'always',
            prev: '*',
            next: 'multiline-expression',
          },
          {
            blankLine: 'always',
            prev: 'import',
            next: '*',
          },
          {
            blankLine: 'any',
            prev: 'import',
            next: 'import',
          },
          {
            blankLine: 'always',
            prev: '*',
            next: ['function', 'class', 'export'],
          },
          {
            blankLine: 'any',
            prev: 'export',
            next: 'export',
          },
          {
            blankLine: 'always',
            prev: ['function-overload', 'multiline-export'],
            next: '*',
          },
          {
            blankLine: 'always',
            prev: '*',
            next: ['function-overload', 'multiline-export'],
          },
          {
            blankLine: 'always',
            prev: '*',
            next: ['if', 'for', 'while', 'do', 'switch', 'try'],
          },
          {
            blankLine: 'always',
            prev: ['if', 'for', 'while', 'do', 'switch', 'try'],
            next: '*',
          },
        ],
      },
    },

    {
      name: 'strict/layout',
      files,
      ...skipGenerated,
      plugins: { ...stylisticPlugin, ...strictPlugin },
      rules: {
        '@stylistic/multiline-ternary': ['error', 'always'],
        '@stylistic/operator-linebreak': [
          'error',
          null,
          { overrides: { '?': 'before', ':': 'before' } },
        ],
        '@stylistic/indent': ['error', 2, { offsetTernaryExpressions: true }],
        'strict/arrow-ternary-body': 'error',
        'strict/body-shape': 'error',
        'strict/trailing-arrow-argument': 'error',
        'strict/max-call-nesting': 'error',
        'strict/members-per-line': 'error',
      },
    },

    {
      name: 'strict/merge-lists',
      files,
      ...skipGenerated,
      rules: { 'no-restricted-syntax': restrictedSyntax(arrayHelpers, true) },
    },
    {
      name: 'strict/no-unknown-tests',
      files: testFiles,
      rules: { 'no-restricted-syntax': restrictedSyntax(arrayHelpers, false) },
    },

    {
      name: 'strict/hygiene',
      files,
      ...skipGenerated,
      plugins: strictPlugin,
      rules: {
        'strict/no-single-letter-ident': 'error',
        'strict/no-history-comments': 'error',
        'strict/no-object-literal-cast': 'error',
        'strict/no-unknown-cast': 'error',
        'strict/no-compat-vocab': ['error', {
          words: {
            ...options.compatVocab,
            commentSubstrings: merge(
              defaultCommentSubstrings,
              options.compatVocab?.commentSubstrings ?? [],
            ),
          },
        }],
      },
    },
    {
      // Test doubles cast mocks and literals on purpose.
      name: 'strict/hygiene-tests',
      files: testFiles,
      plugins: strictPlugin,
      rules: {
        'strict/no-object-literal-cast': 'off',
        'strict/no-unknown-cast': 'off',
        'strict/no-compat-vocab': 'off',
      },
    },

    ...vitestFiles === undefined
      ? []
      : [
          {
            ...requirePackage<{ configs: { recommended: Config } }>('@vitest/eslint-plugin', 'vitest').configs.recommended,
            name: 'strict/vitest',
            files: [...vitestFiles],
          } as const satisfies Config,
        ],

    ...playwrightFiles === undefined
      ? []
      : [
          {
            ...requirePackage<PluginWithConfigs>('eslint-plugin-playwright', 'playwright').configs['flat/recommended'],
            name: 'strict/playwright',
            files: [...playwrightFiles],
          } as const satisfies Config,
        ],

    ...options.i18n === undefined
      ? []
      : i18nConfigs(options.i18n, files),

    ...options.tailwind === undefined
      ? []
      : [
          {
            name: 'strict/tailwind-canonical',
            files,
            ignores: [...merge(generated, options.tailwind.ignores ?? [])],
            plugins: {
              'better-tailwindcss': requirePackage<TSESLint.FlatConfig.Plugin>('eslint-plugin-better-tailwindcss', 'tailwind'),
            },
            // The plugin resolves a relative entryPoint against process.cwd(), so anchor it to the
            // project root. Without rootFontSize it cannot turn w-[16px] into w-4.
            settings: {
              'better-tailwindcss': {
                entryPoint: path.resolve(
                  options.tsconfigRootDir ?? process.cwd(),
                  options.tailwind.entryPoint,
                ),
                rootFontSize: 16,
              },
            },
            rules: {
              'better-tailwindcss/enforce-canonical-classes': 'error',
              // The canonical fix merges classes and leaves the gap behind; this rule closes it.
              'better-tailwindcss/no-unnecessary-whitespace': 'error',
            },
          } as const satisfies Config,
        ],

    ...boundaryConfigs(options.importBoundaries ?? [], files),

    ...generated.length === 0
      ? []
      : [
          {
            // Generated output changes only through its generator, so its style is not linted.
            name: 'strict/generated',
            files: generated,
            rules: {
              '@typescript-eslint/no-explicit-any': 'off',
              '@typescript-eslint/no-unused-vars': 'off',
              ...vue
                ? { 'vue/multi-word-component-names': 'off' }
                : {},
              ...options.i18n === undefined
                ? {}
                : { '@intlify/vue-i18n/no-raw-text': 'off' },
            },
          } as const satisfies Config,
        ],
  ];

  // eslint-disable-next-line no-restricted-syntax -- the two config types describe the same shape
  return configs as unknown as Linter.Config[];
}

export default strict;
