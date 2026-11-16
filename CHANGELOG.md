# Changelog

## 0.1.0

First release.

- The `strict()` ESLint flat config with the typescript-eslint recommended rules, unused-import removal, the stylistic format rules, blank-line padding and the `merge` and `keysOf` checks.
- Twelve custom rules under the `strict` plugin name: `arrow-ternary-body`, `body-shape`, `generic-over-annotation`, `max-call-nesting`, `members-per-line`, `no-compat-vocab`, `no-history-comments`, `no-object-literal-cast`, `no-redundant-type-annotation`, `no-single-letter-ident`, `no-unknown-cast` and `trailing-arrow-argument`.
- Options for Vue, Vitest, Playwright, vue-i18n, Tailwind, generated files, import boundaries, compat words and oxlint.
- The array helpers `merge`, `keysOf`, `oneOf` and `lookup`.
- Five tsconfig presets: `base`, `dom`, `node`, `vue` and `strictest`.
- Shared configs for oxlint, cspell and jscpd, and an editorconfig.
- The `strict-typescript` command with `init`, `hooks install`, `hooks uninstall` and `check`.
- A `commit-msg` hook that refuses attribution trailers, and a `pre-push` hook that runs the lint and typecheck on the pushed commit.
- A docs page for each rule, and pages for the options, the CLI, the hooks, the tool configs and the tsconfig presets.
- A link on each rule to its docs page.
