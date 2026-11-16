# CLI

The package installs one command, `strict-typescript`.
It uses only Node built-ins. Run it with `npx strict-typescript <command>` or through the package scripts that `init` writes.

| Command                     | What it does                                                        |
| --------------------------- | ------------------------------------------------------------------- |
| `init [--vue] [--node]`     | Writes the config files and package scripts, then installs the git hooks. |
| `hooks install`             | Installs the `commit-msg` and `pre-push` hooks. See [hooks](hooks.md). |
| `hooks uninstall`           | Removes them and puts back the hooks that were there before.        |
| `check`                     | Runs the lint, the typecheck and the optional tools. One line per tool. |

An unknown command prints this list and exits with 2.

## init

Run it in the project root.

```sh
npx strict-typescript init
npx strict-typescript init --vue
npx strict-typescript init --node
```

`init` never overwrites a file. When a file exists, it prints `kept <file>` and the line to merge by hand.
Run it a second time and nothing changes.

| File or script      | Content                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `eslint.config.js`  | `import strict from '@nomercy-entertainment/strict-typescript'; export default strict();`. With `--vue` it is `strict({ vue: true })`. A project whose `package.json` has no `"type": "module"` gets `eslint.config.mjs`. An existing ESLint config in any of the six names is kept. |
| `tsconfig.json`     | Extends the `dom` preset. `--vue` uses `vue`, `--node` uses `node`. Written only when none exists. |
| `.editorconfig`     | A copy of the package file.                                                               |
| `cspell.json`       | `{ "import": ["@nomercy-entertainment/strict-typescript/cspell.json"] }`.                 |
| `.jscpd.json`       | A copy of the package `jscpd.json`.                                                       |
| `package.json`      | Scripts `lint` (`eslint .`), `lint:fix` (`eslint . --fix`), `typecheck` (`tsc --noEmit`, or `vue-tsc --noEmit` with `--vue`) and `check` (`strict-typescript check`). A script you already have is kept. |

If there is no `package.json`, `init` writes a minimal one with `"private": true` and `"type": "module"`.
`init` does not install packages. It prints the `npm i -D` line to run next.
It then runs `hooks install`. In a folder that is not a git repository it prints `skipped hooks` and carries on.

## check

```sh
npx strict-typescript check
```

`check` runs these in order and prints `PASS <tool>` or `FAIL <tool>` for each.

| Tool        | Command it runs                                      | When it runs                      |
| ----------- | ---------------------------------------------------- | --------------------------------- |
| `eslint`    | `eslint .`                                           | Always. Not installed counts as FAIL. |
| `typecheck` | `npm run typecheck`                                  | Always. A missing script counts as FAIL. |
| `cspell`    | `cspell` over `ts`, `tsx`, `mts`, `cts`, `vue` and `md` files | Only when `cspell` is installed in the project. |
| `jscpd`     | `jscpd --config .jscpd.json src`                     | Only when `jscpd` is installed. Uses the package config when the project has no `.jscpd.json`. |
| `oxlint`    | `oxlint -c <config> src`                             | Only when `oxlint` is installed. Uses `.oxlintrc.json` or `oxlintrc.json` in the project, else the package one. |

The folder is `src` when it exists, else the project root.
The output of a failing tool is printed above its `FAIL` line, up to 30 lines.
The exit code is 1 when any tool fails, else 0.

```text
  | /project/src/value.ts
  |   1:14  error  Single-letter name 't' ...  strict/no-single-letter-ident
FAIL eslint
PASS typecheck
```

## hooks

See [hooks](hooks.md) for what the two hooks do and how chaining works.
