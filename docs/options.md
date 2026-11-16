# Options

`strict(options?)` returns a flat config array. Every option is optional.

```js
import strict from '@nomercy-entertainment/strict-typescript';

export default strict({ vue: true, ignores: ['public/**'] });
```

Add your own entries after the call. The result is a plain array:

```js
export default [...strict(), { rules: { 'strict/max-call-nesting': 'off' } }];
```

## Core options

| Option            | Default                                       | What it does                                                         |
| ----------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| `vue`             | `false`                                       | Lint `.vue` files and templates too. Needs `eslint-plugin-vue` and `vue-eslint-parser`. |
| `files`           | `['**/*.{ts,mts,cts,tsx}']`, plus `'**/*.vue'` with `vue` | Files the config lints.                                  |
| `ignores`         | none                                          | Added to `dist`, `dist-ssr`, `dev-dist` and `coverage`.              |
| `typeChecked`     | `true`                                        | `false` drops the rules that need type information. See below.       |
| `tsconfigRootDir` | the working directory                         | Folder that holds the `tsconfig.json` the typed rules read.          |
| `arrayHelpers`    | `@nomercy-entertainment/strict-typescript/array` | Module named in the `merge` and `keysOf` messages. See [array helpers](#array-helpers). |
| `testFiles`       | `['**/__tests__/**', '**/*.{spec,test}.ts']`  | Files where the `unknown`, `keyof`, object-literal cast, unknown cast and compat-word checks stay off. |

`typeChecked: false` drops `strict/no-redundant-type-annotation`, `strict/generic-over-annotation` and `@typescript-eslint/no-deprecated`.

## Project options

These need a plugin package. Install it only for the options you use.
A missing package makes `strict()` throw an error that names it.

| Option             | Default                              | What it does                                                                 | Packages |
| ------------------ | ------------------------------------ | ---------------------------------------------------------------------------- | -------- |
| `vitest`           | on when the plugin resolves          | Vitest rules for `testFiles`. `false` turns them off. A list of globs sets the files. | `@vitest/eslint-plugin` |
| `playwright`       | on when the plugin resolves          | Playwright rules for `e2e/**/*.{test,spec}.{js,ts,jsx,tsx}`. `false` turns them off. A list of globs sets the files. | `eslint-plugin-playwright` |
| `i18n`             | off                                  | vue-i18n rules: every key exists, no raw text, no `v-html`. A duplicate-key check for locale files. | `@intlify/eslint-plugin-vue-i18n`, `jsonc-eslint-parser` |
| `tailwind`         | off                                  | Canonical Tailwind class names.                                              | `eslint-plugin-better-tailwindcss` |
| `compatVocab`      | none                                 | Words for [`strict/no-compat-vocab`](rules/no-compat-vocab.md).              | none |
| `generated`        | none                                 | Globs of generated files. They skip the style rules, and `no-explicit-any` and `no-unused-vars` are off there. | none |
| `importBoundaries` | none                                 | Imports that only some folders may use.                                      | none |
| `oxlint`           | off                                  | `true` turns off the ESLint rules that oxlint covers, using the shipped `oxlintrc.json`. A string names your own file. | `eslint-plugin-oxlint` |

### i18n

```js
strict({
  vue: true,
  i18n: {
    localeDir: ['src/i18n/locales/*.json'],
    messageSyntaxVersion: '^11.0.0',
  },
});
```

`localeDir` is the vue-i18n setting of the same name: a list of globs, or `{ pattern, localeKey }` entries with `localeKey` set to `file`, `path` or `key`.
`messageSyntaxVersion` defaults to `^11.0.0`.

### tailwind

```js
strict({ tailwind: { entryPoint: 'src/styles/main.css', ignores: ['src/legacy/**'] } });
```

`entryPoint` is the CSS file that imports Tailwind. It is relative to `tsconfigRootDir`, or to the working directory.
`ignores` lists file globs the Tailwind rules skip. Generated files are skipped too.
The rules are `enforce-canonical-classes` and `no-unnecessary-whitespace`.

### compatVocab

```js
strict({
  compatVocab: {
    identifiers: ['oldPlayer'],
    identifierPatterns: ['^Legacy[A-Z]'],
    classes: ['LegacyCore'],
    commentSubstrings: ['shim for'],
  },
});
```

`commentSubstrings` extend the built-in markers `@deprecated`, `compatible alias`, `compat alias` and `v1-compat`.

### importBoundaries

```js
strict({
  importBoundaries: [
    {
      module: '(^|/)api/client$',
      allowedIn: ['src/api/**'],
      message: 'Only src/api may import the API client.',
    },
  ],
});
```

`module` is a regular expression, as a string, that ESLint matches against the import path.
`allowedIn` lists the globs of the files that may import it. Every other file gets `message`.

### generated

```js
strict({ generated: ['src/components/ui/**'] });
```

## Array helpers

Two rules point you to small helpers at `@nomercy-entertainment/strict-typescript/array`.
The rule that joins two spreads, `[...a, ...b]`, tells you to use `merge`. The rule on `as keyof` tells you to use `oneOf(keysOf(TABLE), value)`.

| Helper                | What it does                                                          |
| --------------------- | --------------------------------------------------------------------- |
| `merge(a, b)`         | Joins lists. Tuples stay typed.                                       |
| `keysOf(table)`       | Returns the keys of a constant table, typed.                          |
| `oneOf(list, value)`  | Narrows a plain string to a known set. Needs no cast.                 |
| `lookup(table, key)`  | Reads a constant table with a plain string key. Needs no cast.        |

If your project has its own helpers, set `arrayHelpers` to that module. The messages then name your module.

## Plugin export

The rules live under the plugin name `strict`, for example `strict/body-shape`.
The plugin is also a named export:

```js
import { plugin, rules } from '@nomercy-entertainment/strict-typescript';
```
