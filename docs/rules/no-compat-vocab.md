# strict/no-compat-vocab

Bans compat words: marked comments, and the identifiers and classes your project lists.

- Fixable: no.
- Needs type information: no.
- Off in test files (the `testFiles` option).
- Source: [no-compat-vocab.ts](../../src/rules/no-compat-vocab.ts). Tests: [no-compat-vocab.spec.ts](../../src/rules/__tests__/no-compat-vocab.spec.ts).

## What it catches

The rule has two messages.

| Message            | Meaning                                                              |
| ------------------ | -------------------------------------------------------------------- |
| `bannedIdentifier` | A name, a name pattern or a class that your project banned.          |
| `bannedComment`    | A compat marker in a comment. The built-in markers are `@deprecated`, `compatible alias`, `compat alias` and `v1-compat`. |

A marker matches as a whole word, so `incompatible aliasing` stays quiet.

## Why

A rewrite that keeps a compatibility layer never finishes.
The rule keeps old names and "temporary" bridges out of new code.
The reason for a change belongs in the commit message.

## Wrong

With these words set:

```js
strict({
  compatVocab: {
    identifiers: ['nmVideoPlayer'],
    classes: ['PlayerCore'],
  },
});
```

```ts
const nmVideoPlayer = () => {};
class PlayerCore {}
// @deprecated use nmplayer instead
// Backwards-compatible alias for releaseLock().
```

## Right

```ts
const videoPlayer = () => {};
// Resolve before init: a second init corrupts a live instance.
```

Without the `compatVocab` option no identifier is banned. Only the comment markers have defaults.

## Options

Set them through `strict({ compatVocab })`. Every field is optional.

| Field                | Meaning                                                                   |
| -------------------- | ------------------------------------------------------------------------- |
| `identifiers`        | Exact names that are banned.                                              |
| `identifierPatterns` | Regular expressions, as strings. A name that matches is banned.           |
| `classes`            | Class names that are banned.                                              |
| `commentSubstrings`  | More comment markers. They extend the built-in ones in `strict()`.        |

## When not to use it

Skip it in a project that must keep a public compatibility layer, or leave `compatVocab` empty so only the comment markers apply.
