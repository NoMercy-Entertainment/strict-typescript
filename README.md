# @nomercy-entertainment/strict-typescript

One package gives any TypeScript project the NoMercy strict rules.
It holds an ESLint flat config, twelve custom rules, five tsconfig presets, an editorconfig, shared cspell, jscpd and oxlint configs, two git hooks, and a command that sets all of it up.
Add it once and never copy rule files between projects again.

## Install

```sh
npm i -D @nomercy-entertainment/strict-typescript eslint typescript
```

Vue projects also need `eslint-plugin-vue`, `vue-eslint-parser` and `vue-tsc`.

## Quick start

```sh
npx strict-typescript init
```

`init` writes `eslint.config.js`, `tsconfig.json`, `.editorconfig`, `cspell.json` and `.jscpd.json`.
It adds the scripts `lint`, `lint:fix`, `typecheck` and `check`, and installs the git hooks.
It never overwrites a file. It prints `kept <file>` and the line to merge instead.
Add `--vue` for a Vue project or `--node` for Node. See [the CLI](docs/cli.md).

Then run:

```sh
npm run check
```

`check` prints one `PASS` or `FAIL` line per tool and exits with 1 when any tool fails.

## Use it

### TypeScript

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

The same `eslint.config.js`. Extend the `node` preset, which needs `@types/node`:

```json
{
  "extends": "@nomercy-entertainment/strict-typescript/tsconfig/node.json",
  "include": ["src"]
}
```

### Vue

```js
export default strict({ vue: true });
```

Extend the `vue` preset: `@nomercy-entertainment/strict-typescript/tsconfig/vue.json`.
The Vue packages load only when `vue` is true. If they are missing, `strict({ vue: true })` throws an error that names both.

### A whole project

One call carries the options for a project:

```js
export default strict({
  vue: true,
  i18n: { localeDir: ['src/i18n/locales/*.json'] },
  tailwind: { entryPoint: 'src/styles/main.css' },
  generated: ['src/components/ui/**'],
  oxlint: true,
});
```

The result is a plain array, so you can add your own entries after it.

## Options

`strict(options?)`. Every option is optional. [All options in detail](docs/options.md).

| Option             | Default                                        | What it does                                                      |
| ------------------ | ---------------------------------------------- | ----------------------------------------------------------------- |
| `vue`              | `false`                                        | Lint `.vue` files and templates too.                              |
| `files`            | TypeScript files, plus `.vue` with `vue`       | Files the config lints.                                           |
| `ignores`          | none                                           | Added to `dist`, `dist-ssr`, `dev-dist` and `coverage`.           |
| `typeChecked`      | `true`                                         | `false` drops the rules that need type information.               |
| `tsconfigRootDir`  | the working directory                          | Folder with the `tsconfig.json` the typed rules read.             |
| `arrayHelpers`     | `@nomercy-entertainment/strict-typescript/array` | Module the `merge` and `keysOf` messages name.                  |
| `testFiles`        | `**/__tests__/**`, `**/*.{spec,test}.ts`       | Files where the unknown, keyof, cast and compat-word checks stay off. |
| `vitest`           | on when the plugin resolves                    | Vitest rules. `false` turns them off.                             |
| `playwright`       | on when the plugin resolves                    | Playwright rules for `e2e/` specs.                                |
| `i18n`             | off                                            | vue-i18n rules and the duplicate-key check for locale files.      |
| `tailwind`         | off                                            | Canonical Tailwind classes.                                       |
| `compatVocab`      | none                                           | Words for `strict/no-compat-vocab`.                               |
| `generated`        | none                                           | Generated files. They skip the style rules.                       |
| `importBoundaries` | none                                           | Imports that only some folders may use.                           |
| `oxlint`           | off                                            | Turns off the ESLint rules that oxlint covers.                    |

## The 12 rules

They live under the plugin name `strict`, for example `strict/body-shape`.
`strict()` turns all of them on. Each name links to its page, with a wrong and a right example.

| Rule | What it catches | Fixable |
| ---- | --------------- | ------- |
| [`strict/arrow-ternary-body`](docs/rules/arrow-ternary-body.md) | A ternary arrow body that does not start on the next line. | Yes |
| [`strict/body-shape`](docs/rules/body-shape.md) | An `if` body that is not a bare exit, a returned value on the next line, or a block. | Yes |
| [`strict/generic-over-annotation`](docs/rules/generic-over-annotation.md) | An annotation that should be a generic on the call. Needs types. | Yes |
| [`strict/max-call-nesting`](docs/rules/max-call-nesting.md) | Calls nested more than 2 deep. | No |
| [`strict/members-per-line`](docs/rules/members-per-line.md) | An object with three or more entries that shares lines. | Yes |
| [`strict/no-compat-vocab`](docs/rules/no-compat-vocab.md) | Compat markers in comments and the compat words you list. | No |
| [`strict/no-history-comments`](docs/rules/no-history-comments.md) | Bug-number history, section marks, and TODO with no issue. | No |
| [`strict/no-object-literal-cast`](docs/rules/no-object-literal-cast.md) | `{ ... } as T`. | No |
| [`strict/no-redundant-type-annotation`](docs/rules/no-redundant-type-annotation.md) | An annotation that repeats the value's type. Needs types. | Yes |
| [`strict/no-single-letter-ident`](docs/rules/no-single-letter-ident.md) | One-letter names, except `x`, `y`, `z`, `i`, `j` and `k`. | No |
| [`strict/no-unknown-cast`](docs/rules/no-unknown-cast.md) | `as unknown as T` with no comment that says why. | No |
| [`strict/trailing-arrow-argument`](docs/rules/trailing-arrow-argument.md) | An arrow after another argument that starts its body on the arrow line. | Yes |

Around the rules, `strict()` also sets the typescript-eslint recommended config, unused-import removal, the stylistic format rules (2 spaces, single quotes, semicolons, 100 columns), blank-line padding, and the restricted-syntax checks behind the `merge` and `keysOf` messages.

## Tool configs

| File             | Tool    | What it holds                                                        |
| ---------------- | ------- | -------------------------------------------------------------------- |
| `oxlintrc.json`  | oxlint  | The `correctness` category as errors.                                |
| `cspell.json`    | cspell  | American English: flags British spellings and suggests the American one. |
| `jscpd.json`     | jscpd   | Duplicate-code limits: 40 tokens, a 2.42 percent threshold.          |
| `.editorconfig`  | editors | Two spaces, LF line ends, 100 columns.                               |

Details and commands: [tool configs](docs/tools.md). The tsconfig presets and every flag they set: [tsconfig presets](docs/tsconfig.md).

## Git hooks

`npx strict-typescript hooks install` writes two hooks into `.githooks` and sets `core.hooksPath`.

- `commit-msg` refuses a message with a `Co-Authored-By` or similar attribution trailer.
- `pre-push` runs `npm run lint` and `npm run typecheck` on the pushed commit in its own worktree. Skip it once with `STRICT_TS_SKIP_PREPUSH=1`.

A hook that was there before still runs, as `<hook>.local`. `hooks uninstall` reverses it. See [hooks](docs/hooks.md).

## CLI

| Command                 | What it does                                              |
| ----------------------- | --------------------------------------------------------- |
| `init [--vue] [--node]` | Writes the config files and scripts, then installs hooks. |
| `hooks install`         | Installs the git hooks.                                   |
| `hooks uninstall`       | Removes them.                                             |
| `check`                 | Runs eslint, the typecheck, and cspell, jscpd and oxlint when installed. |

See [the CLI](docs/cli.md).

## What is in it

The rule set comes from the NomNomzBot dashboard config. It had 20 config entries.
Two of them (Vue essential and typescript-eslint recommended) share one row below, so the table has 19 rows.
All 19 rows are in this package. The 8 rows that need a plugin or a project folder are options.
The five hygiene rules come from the NoMercy player libraries. They are extra, so they have no row.

| #   | Source block                                    | Where it went                                                        |
| --- | ----------------------------------------------- | -------------------------------------------------------------------- |
| 1   | `app/files-to-lint`                             | `strict/files-to-lint`, set by the `files` option.                   |
| 2   | `globalIgnores`                                 | `strict/ignores`, plus the `ignores` option.                         |
| 3   | Vue essential and typescript-eslint recommended | typescript-eslint `recommended`. With `vue: true`, also Vue `flat/essential` and the Vue parser with the TypeScript parser inside. |
| 4   | `app/unused-imports`                            | `strict/unused-imports`.                                             |
| 5   | `app/no-redundant-type-annotation`              | `strict/no-redundant-type-annotation`: two custom rules and `no-deprecated`. |
| 6   | `app/format`                                    | `strict/format`: stylistic preset, `no-nested-ternary`, `max-len` 100. |
| 7   | `app/format-vue-template`                       | `strict/format-vue-template`, only with `vue: true`.                 |
| 8   | `app/blank-lines`                               | `strict/blank-lines`: all padding lines.                             |
| 9   | `app/layout`                                    | `strict/layout`: ternary, indent and five custom rules.              |
| 10  | `app/merge-lists`                               | `strict/merge-lists`: three selectors. Messages name `arrayHelpers`. |
| 11  | `app/no-unknown-tests`                          | `strict/no-unknown-tests`, set by `testFiles`.                       |
| 12  | `pluginPlaywright` (e2e)                        | `strict/playwright`, set by the `playwright` option.                 |
| 13  | `pluginVitest` (tests)                          | `strict/vitest`, set by the `vitest` option.                         |
| 14  | `app/vue-i18n`                                  | `strict/i18n`, set by the `i18n` option.                             |
| 15  | `app/vue-i18n-locales`                          | `strict/i18n-locales`, set by the `i18n` option.                     |
| 16  | `app/tailwind-canonical`                        | `strict/tailwind-canonical`, set by the `tailwind` option.           |
| 17  | `app/shadcn-generated`                          | `strict/generated`, set by the `generated` option.                   |
| 18  | `app/api-client-only-in-api`                    | `strict/import-boundaries-*`, set by the `importBoundaries` option.  |
| 19  | `pluginOxlint`                                  | The `oxlint` option and the shipped `oxlintrc.json`.                 |

The five hygiene rules are `strict/no-single-letter-ident`, `strict/no-history-comments`, `strict/no-object-literal-cast`, `strict/no-unknown-cast` and `strict/no-compat-vocab`.
The config block that holds them is `strict/hygiene`, and `strict/hygiene-tests` turns three of them off in test files.

## Versioning

The package follows semantic versioning.
A change that can fail a project that passed before, such as a new rule in `strict()`, a stricter rule, a removed option or a changed default, arrives in a major release.
Fixes and new options that are off by default arrive in minor and patch releases.
The [changelog](CHANGELOG.md) lists every release.

## Contributing

```sh
npm ci
npm run build
npm run typecheck
npm test
npm run lint
```

`npm test` runs the twelve rule specs, the config test, the tool config test, the CLI test and the docs test.
The config test lints `fixtures/bad.ts` and expects every planted defect. It lints `fixtures/good.ts` in the same run and expects none.
The package lints itself with the built output, so run `npm run build` before `npm run lint`.

A new rule needs a spec, a planted defect in `fixtures/bad.ts`, a page in `docs/rules/` and a row in the rule table above.
The docs test fails when a rule has no page.

## License

Apache-2.0
