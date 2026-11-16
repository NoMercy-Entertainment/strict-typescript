# @nomercy-entertainment/strict-typescript

One import gives any TypeScript project the NoMercy strict rules.

You get an ESLint flat config, seven custom rules, tsconfig presets and an editorconfig.
Set it up once. Never copy rule files between projects again.

## Install

```sh
npm i -D @nomercy-entertainment/strict-typescript eslint typescript
```

For Vue projects, add two more packages:

```sh
npm i -D eslint-plugin-vue vue-eslint-parser
```

## Use it

### TypeScript (browser or library)

`eslint.config.js`

```js
import strict from '@nomercy-entertainment/strict-typescript';

export default strict();
```

`tsconfig.json`

```json
{
  "extends": "@nomercy-entertainment/strict-typescript/tsconfig/dom.json",
  "include": ["src"]
}
```

### Node

`eslint.config.js` is the same as above.

`tsconfig.json`

```json
{
  "extends": "@nomercy-entertainment/strict-typescript/tsconfig/node.json",
  "include": ["src"]
}
```

### Vue

`eslint.config.js`

```js
import strict from '@nomercy-entertainment/strict-typescript';

export default strict({ vue: true });
```

`tsconfig.json`

```json
{
  "extends": "@nomercy-entertainment/strict-typescript/tsconfig/vue.json",
  "include": ["src"]
}
```

The Vue packages load only when `vue` is true.
A project without Vue never needs them.
If they are missing, `strict({ vue: true })` throws an error that names both packages.

### Editorconfig

Copy `node_modules/@nomercy-entertainment/strict-typescript/.editorconfig` into your project root.

## Options

`strict(options?)` returns a flat config array. Every option is optional.

| Option            | Default                                           | What it does                                                         |
| ----------------- | ------------------------------------------------- | -------------------------------------------------------------------- |
| `vue`             | `false`                                           | Lint `.vue` files and templates too.                                 |
| `files`           | `['**/*.{ts,mts,cts,tsx}']`, plus `'**/*.vue'`    | Files the config lints.                                              |
| `ignores`         | none                                              | Added to `dist`, `dist-ssr`, `dev-dist` and `coverage`.              |
| `typeChecked`     | `true`                                            | Set to `false` to drop the rules that need type information.         |
| `tsconfigRootDir` | the working directory                             | Folder that holds the tsconfig for typed rules.                      |
| `arrayHelpers`    | `@nomercy-entertainment/strict-typescript/array`  | Module named in the `merge` and `keysOf` messages.                   |
| `testFiles`       | `['**/__tests__/**', '**/*.{spec,test}.ts']`      | Files where the `unknown` and `keyof` checks stay off.               |

Setting `typeChecked: false` drops these rules:

- `strict/no-redundant-type-annotation`
- `strict/generic-over-annotation`
- `@typescript-eslint/no-deprecated`

The rules live under the plugin name `strict`, for example `strict/body-shape`.
The same plugin is a named export: `import { plugin, rules } from '@nomercy-entertainment/strict-typescript'`.

## Array helpers

Two rules point you to small helpers.
They live at `@nomercy-entertainment/strict-typescript/array`.

| Helper                | What it does                                                          |
| --------------------- | --------------------------------------------------------------------- |
| `merge(a, b)`         | Joins lists. Tuples stay typed.                                       |
| `keysOf(table)`       | Returns the keys of a constant table, typed.                          |
| `oneOf(list, value)`  | Narrows a plain string to a known set. Needs no cast.                 |
| `lookup(table, key)`  | Reads a constant table with a plain string key. Needs no cast.        |

If your project has its own helpers, set `arrayHelpers` to that module.
The messages then name your module.

## What is in it

The rule set comes from the NomNomzBot dashboard config. It had 20 config entries.
Two of them (Vue essential and typescript-eslint recommended) share one row below, so the table has 19 rows.
11 rows are in this package. 8 rows stay with the project.

| #   | Source block                              | Status | Where it went                                                        |
| --- | ----------------------------------------- | ------ | -------------------------------------------------------------------- |
| 1   | `app/files-to-lint`                       | In     | `strict/files-to-lint`, set by the `files` option.                   |
| 2   | `globalIgnores`                           | In     | `strict/ignores`, plus the `ignores` option.                         |
| 3   | Vue essential and typescript-eslint recommended | In | typescript-eslint `recommended`. With `vue: true`, also Vue `flat/essential` and the Vue parser with the TypeScript parser inside. |
| 4   | `app/unused-imports`                      | In     | `strict/unused-imports`, same options.                               |
| 5   | `app/no-redundant-type-annotation`        | In     | `strict/no-redundant-type-annotation`. Two custom rules and `no-deprecated`. |
| 6   | `app/format`                              | In     | `strict/format`. Stylistic preset, `no-nested-ternary`, `max-len` 100. |
| 7   | `app/format-vue-template`                 | In     | `strict/format-vue-template`. Only with `vue: true`.                 |
| 8   | `app/blank-lines`                         | In     | `strict/blank-lines`. All padding lines.                             |
| 9   | `app/layout`                              | In     | `strict/layout`. Ternary, indent and five custom rules.              |
| 10  | `app/merge-lists`                         | In     | `strict/merge-lists`. Three selectors. Messages name `arrayHelpers`. |
| 11  | `app/no-unknown-tests`                    | In     | `strict/no-unknown-tests`, set by `testFiles`.                       |
| 12  | `pluginPlaywright` (e2e)                  | Left   | Needs Playwright. Add it where you run e2e tests.                    |
| 13  | `pluginVitest` (tests)                    | Left   | Needs Vitest. Add it where you run Vitest.                           |
| 14  | `app/vue-i18n`                            | Left   | Needs your locale folders.                                           |
| 15  | `app/vue-i18n-locales`                    | Left   | Needs your locale files.                                             |
| 16  | `app/tailwind-canonical`                  | Left   | Needs your Tailwind entry file.                                      |
| 17  | `app/shadcn-generated`                    | Left   | Names a folder only the dashboard has.                               |
| 18  | `app/api-client-only-in-api`              | Left   | Names a folder only the dashboard has.                               |
| 19  | `pluginOxlint`                            | Left   | Needs your own `.oxlintrc.json`.                                     |

## The custom rules

| Rule                                   | Needs types | What it checks                                                       |
| -------------------------------------- | ----------- | -------------------------------------------------------------------- |
| `strict/arrow-ternary-body`            | No          | A ternary arrow body starts on the next line, without brackets.      |
| `strict/body-shape`                    | No          | An `if` body is a bare exit, a returned value on the next line, or a block. |
| `strict/generic-over-annotation`       | Yes         | A generic call takes its type as a generic, not an annotation.       |
| `strict/max-call-nesting`              | No          | Calls nest at most 2 deep. Name the inner steps.                     |
| `strict/members-per-line`              | No          | Objects with three or more entries put each entry on its own line.   |
| `strict/no-redundant-type-annotation`  | Yes         | Drops an annotation that repeats the value's type.                   |
| `strict/trailing-arrow-argument`       | No          | An arrow after another argument starts its body on the line after `=>`. |

## Presets for tsconfig

| Preset                  | Extends  | Use it for                                                           |
| ----------------------- | -------- | -------------------------------------------------------------------- |
| `tsconfig/base.json`    | none     | The shared strict flags.                                             |
| `tsconfig/dom.json`     | base     | Browser code and libraries. `ES2022`, `DOM`, bundler resolution.     |
| `tsconfig/node.json`    | base     | Node code. `nodenext` modules, target `es2024`, Node types.          |
| `tsconfig/vue.json`     | dom      | Vue apps. Adds `jsx: preserve` and `jsxImportSource: vue`.           |
| `tsconfig/strictest.json` | base   | Adds `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature` and `isolatedModules`. |

The base flags are `strict`, `noUncheckedIndexedAccess`, `noImplicitThis`, `verbatimModuleSyntax`,
`moduleDetection: force`, `useDefineForClassFields`, `esModuleInterop`,
`forceConsistentCasingInFileNames`, `resolveJsonModule`, `skipLibCheck` and `target: ESNext`.

The `node` preset needs `@types/node`.
To stack a preset, list both: `"extends": [".../tsconfig/node.json", ".../tsconfig/strictest.json"]`.

## Add what the project owns

The array form of the flat config lets you append anything.

### oxlint

```js
import strict from '@nomercy-entertainment/strict-typescript';
import oxlint from 'eslint-plugin-oxlint';

export default [
  ...strict(),
  ...oxlint.buildFromOxlintConfigFile('.oxlintrc.json'),
];
```

### Vitest

```js
import strict from '@nomercy-entertainment/strict-typescript';
import vitest from '@vitest/eslint-plugin';

export default [
  ...strict(),
  { ...vitest.configs.recommended, files: ['**/__tests__/*'] },
];
```

### Playwright

```js
import strict from '@nomercy-entertainment/strict-typescript';
import playwright from 'eslint-plugin-playwright';

export default [
  ...strict(),
  { ...playwright.configs['flat/recommended'], files: ['e2e/**/*.{test,spec}.ts'] },
];
```

## Develop

```sh
npm ci
npm run build
npm run typecheck
npm test
npm run lint
```

`npm test` runs the seven rule specs and `test/config.spec.ts`.
The config test lints `fixtures/bad.ts` and expects every planted defect.
It lints `fixtures/good.ts` in the same run and expects none.

## License

Apache-2.0
