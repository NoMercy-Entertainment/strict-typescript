# @nomercy-entertainment/strict-typescript

One import gives any TypeScript project the NoMercy strict rules.

You get an ESLint flat config, twelve custom rules, tsconfig presets, an editorconfig and
shared configs for oxlint, cspell and jscpd.
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
| `testFiles`       | `['**/__tests__/**', '**/*.{spec,test}.ts']`      | Files where the `unknown`, `keyof`, cast and compat-word checks stay off. |
| `vitest`          | on when `@vitest/eslint-plugin` resolves          | Vitest rules. `false` turns them off. A list of globs sets the files. |
| `playwright`      | on when `eslint-plugin-playwright` resolves       | Playwright rules for `e2e/**/*.{test,spec}.{js,ts,jsx,tsx}`. `false` turns them off. A list of globs sets the files. |
| `i18n`            | off                                               | vue-i18n rules and the duplicate-key check for locale files. Takes `localeDir` and `messageSyntaxVersion`. |
| `tailwind`        | off                                               | Canonical Tailwind classes. Takes `entryPoint` (the CSS file that imports Tailwind, relative to `tsconfigRootDir` or the working directory) and `ignores`. |
| `compatVocab`     | none                                              | Words for `strict/no-compat-vocab`: `identifiers`, `identifierPatterns`, `classes`, `commentSubstrings`. Comment markers extend the built-in ones. |
| `generated`       | none                                              | Globs of generated files. They skip the style rules, and `no-explicit-any` and `no-unused-vars` are off there. |
| `importBoundaries` | none                                             | Imports that only some folders may use. Each entry has `module` (a regex), `allowedIn` (globs) and `message`. |
| `oxlint`          | off                                               | `true` turns off the ESLint rules that oxlint covers, from the shipped `oxlintrc.json`. A string names your own file. |

The optional options need their plugin packages.
Install them only for the options you use. A missing package makes `strict()` throw an error that names it.

| Option                  | Packages                                                       |
| ----------------------- | -------------------------------------------------------------- |
| `vue`                   | `eslint-plugin-vue`, `vue-eslint-parser`                       |
| `vitest`                | `@vitest/eslint-plugin`                                        |
| `playwright`            | `eslint-plugin-playwright`                                     |
| `i18n`                  | `@intlify/eslint-plugin-vue-i18n`, `jsonc-eslint-parser`       |
| `tailwind`              | `eslint-plugin-better-tailwindcss`                             |
| `oxlint`                | `eslint-plugin-oxlint`                                         |

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
All 19 rows are in this package. The 8 rows that need a plugin or a project folder are options.
The five hygiene rules come from the NoMercy player libraries. They are extra, so they have no row.

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
| 12  | `pluginPlaywright` (e2e)                  | In     | `strict/playwright`, set by the `playwright` option.                 |
| 13  | `pluginVitest` (tests)                    | In     | `strict/vitest`, set by the `vitest` option.                         |
| 14  | `app/vue-i18n`                            | In     | `strict/i18n`, set by the `i18n` option.                             |
| 15  | `app/vue-i18n-locales`                    | In     | `strict/i18n-locales`, set by the `i18n` option.                     |
| 16  | `app/tailwind-canonical`                  | In     | `strict/tailwind-canonical`, set by the `tailwind` option.           |
| 17  | `app/shadcn-generated`                    | In     | `strict/generated`, set by the `generated` option.                   |
| 18  | `app/api-client-only-in-api`              | In     | `strict/import-boundaries-*`, set by the `importBoundaries` option.  |
| 19  | `pluginOxlint`                            | In     | The `oxlint` option and the shipped `oxlintrc.json`.                 |

## The custom rules

| Rule                                   | Needs types | What it checks                                                       |
| -------------------------------------- | ----------- | -------------------------------------------------------------------- |
| `strict/arrow-ternary-body`            | No          | A ternary arrow body starts on the next line, without brackets.      |
| `strict/body-shape`                    | No          | An `if` body is a bare exit, a returned value on the next line, or a block. |
| `strict/generic-over-annotation`       | Yes         | A generic call takes its type as a generic, not an annotation.       |
| `strict/max-call-nesting`              | No          | Calls nest at most 2 deep. Name the inner steps.                     |
| `strict/members-per-line`              | No          | Objects with three or more entries put each entry on its own line.   |
| `strict/no-compat-vocab`               | No          | Bans compat words: marked comments (`@deprecated`, `compat alias`), and the identifiers and classes you list in `compatVocab`. Off in test files. |
| `strict/no-history-comments`           | No          | Bans bug-number history, spec section marks and TODO or FIXME with no issue reference. |
| `strict/no-object-literal-cast`        | No          | Bans `{ ... } as T`. Type the value at construction. Off in test files. |
| `strict/no-redundant-type-annotation`  | Yes         | Drops an annotation that repeats the value's type.                   |
| `strict/no-single-letter-ident`        | No          | Bans one-letter names. Only `x`, `y`, `z`, `i`, `j` and `k` pass.    |
| `strict/no-unknown-cast`               | No          | Bans `as unknown as T` without an inline comment that says why. Off in test files. |
| `strict/trailing-arrow-argument`       | No          | An arrow after another argument starts its body on the line after `=>`. |

`strict()` turns all twelve on. Only `strict/generic-over-annotation` and
`strict/no-redundant-type-annotation` need `typeChecked`.

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

## Project options

One call carries a whole project.

```js
import strict from '@nomercy-entertainment/strict-typescript';

export default strict({
  vue: true,
  i18n: { localeDir: ['src/i18n/locales/*.json'] },
  tailwind: { entryPoint: 'src/styles/main.css' },
  generated: ['src/components/ui/**'],
  importBoundaries: [
    {
      module: '(^|/)api/client$',
      allowedIn: ['src/api/**'],
      message: 'Only src/api may import the API client.',
    },
  ],
  oxlint: true,
});
```

The array form of the flat config still lets you append anything of your own.

## Tool configs

The package also ships three tool configs. Point each tool at the file.

| File             | Tool    | What it holds                                                       |
| ---------------- | ------- | ------------------------------------------------------------------- |
| `oxlintrc.json`  | oxlint  | The `correctness` category as errors. The `oxlint` option reads it. |
| `cspell.json`    | cspell  | American English: flags British spellings and suggests the American one. |
| `jscpd.json`     | jscpd   | Duplicate-code limits: 40 tokens, a 2.42 percent threshold.         |

```sh
npx oxlint -c node_modules/@nomercy-entertainment/strict-typescript/oxlintrc.json
npx cspell --config node_modules/@nomercy-entertainment/strict-typescript/cspell.json "src/**"
npx jscpd --config node_modules/@nomercy-entertainment/strict-typescript/jscpd.json src
```

In a cspell config, import it instead:
`{ "import": ["@nomercy-entertainment/strict-typescript/cspell.json"] }`.

## Develop

```sh
npm ci
npm run build
npm run typecheck
npm test
npm run lint
```

`npm test` runs the twelve rule specs, `test/config.spec.ts` and `test/tools.spec.ts`.
The config test lints `fixtures/bad.ts` and expects every planted defect.
It lints `fixtures/good.ts` in the same run and expects none.

## License

Apache-2.0
