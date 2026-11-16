# Tool configs

The package ships configs for four tools. `npx strict-typescript init` wires up three of them.
`npx strict-typescript check` runs each one that is installed in the project.

## cspell

File: `cspell.json`. Language `en-US`.
It flags British spellings and suggests the American one, for example `colour` to `color`, `behaviour` to `behavior` and `cancelled` to `canceled`.
It also ignores `aria-labelledby`.

Use it by import, so you can add words of your own:

```json
{ "import": ["@nomercy-entertainment/strict-typescript/cspell.json"] }
```

Or point the tool at the file:

```sh
npx cspell --config node_modules/@nomercy-entertainment/strict-typescript/cspell.json "src/**"
```

## jscpd

File: `jscpd.json`. It reports duplicated code.

| Setting      | Value     | Meaning                                  |
| ------------ | --------- | ---------------------------------------- |
| `minTokens`  | `40`      | A block shorter than this is not counted. |
| `threshold`  | `2.42`    | The run fails above this percent of duplicated code. |
| `reporters`  | `console` | Print the result.                        |
| `silent`     | `true`    | Print only the report.                   |

`init` copies it to `.jscpd.json`. Run it with:

```sh
npx jscpd --config .jscpd.json src
```

## oxlint

File: `oxlintrc.json`. It turns on the `correctness` category as errors.

Two ways to use it:

- Run oxlint on its own: `npx oxlint -c node_modules/@nomercy-entertainment/strict-typescript/oxlintrc.json`.
- Set `strict({ oxlint: true })`. ESLint then turns off every rule that oxlint already covers, using this file. A string names your own oxlint config instead. This needs `eslint-plugin-oxlint`.

## editorconfig

File: `.editorconfig`. `init` copies it into the project root.

It applies to `js`, `jsx`, `mjs`, `cjs`, `ts`, `tsx`, `mts`, `cts`, `vue`, `css`, `scss`, `sass`, `less` and `styl` files:

| Key                        | Value    |
| -------------------------- | -------- |
| `charset`                  | `utf-8`  |
| `indent_style`             | `space`  |
| `indent_size`              | `2`      |
| `end_of_line`              | `lf`     |
| `insert_final_newline`     | `true`   |
| `trim_trailing_whitespace` | `true`   |
| `max_line_length`          | `100`    |

The line length matches the `max-len` limit of 100 that `strict()` sets.
