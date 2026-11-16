// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import { createRequire } from 'node:module';

import stylistic from '@stylistic/eslint-plugin';
import type { TSESLint } from '@typescript-eslint/utils';
import type { Linter } from 'eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

import { plugin, rules } from './plugin.js';

export { plugin, rules };

type Config = TSESLint.FlatConfig.Config;

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
}

interface VueParts {
  plugin: { configs: Record<string, Config[]> };
  parser: NonNullable<TSESLint.FlatConfig.LanguageOptions['parser']>;
}

const defaultArrayHelpers = '@nomercy-entertainment/strict-typescript/array';

// Required on demand so a project without Vue never needs the two packages.
function loadVue() {
  const load = createRequire(import.meta.url);

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

    {
      name: 'strict/format',
      files,
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
      rules: { 'no-restricted-syntax': restrictedSyntax(arrayHelpers, true) },
    },
    {
      name: 'strict/no-unknown-tests',
      files: testFiles,
      rules: { 'no-restricted-syntax': restrictedSyntax(arrayHelpers, false) },
    },
  ];

  // eslint-disable-next-line no-restricted-syntax -- the two config types describe the same shape
  return configs as unknown as Linter.Config[];
}

export default strict;
