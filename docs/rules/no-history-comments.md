# strict/no-history-comments

Bans bug-number history, spec section marks, and TODO or FIXME notes with no issue reference.

- Fixable: no.
- Needs type information: no.
- Source: [no-history-comments.ts](../../src/rules/no-history-comments.ts). Tests: [no-history-comments.spec.ts](../../src/rules/__tests__/no-history-comments.spec.ts).

## What it catches

| Message        | Meaning                                                                    |
| -------------- | -------------------------------------------------------------------------- |
| `bugHistory`   | A comment such as `Bug 1 fix`. That story belongs in the commit message.   |
| `specCitation` | A section mark (`§`) in a comment. Link the spec from the docs instead.    |
| `nakedTodo`    | `TODO` or `FIXME` with no issue reference.                                 |

An issue reference is `#123`, a key such as `(NM-42` or `[NM-42`, or a URL.
Codec names such as `CEA-608` or `UTF-8` are not references, so a `TODO` that only mentions them is still reported.

## Why

A comment should say why the code is the way it is now.
History and open tasks go stale in a file. A commit message or an issue keeps them findable.

## Wrong

```ts
// Bug 1 fix: single AudioContext invariant.
// Spec §AB: avoid re-initializing core state.
// TODO strip the auth paths from the worker.
```

## Right

```ts
// Resolve before init: a second init corrupts a live instance.
// TODO(#123): strip the auth paths from the worker.
// See https://example.test/spec for the wire format.
```

## Options

Rule option, when you use the plugin by hand:

| Option            | Default                                       | Meaning                                    |
| ----------------- | --------------------------------------------- | ------------------------------------------ |
| `issueRefPattern` | `#\d+\|[(\[][A-Z][A-Z0-9]+-\d+\|https?://`    | Regular expression, as a string, that counts as an issue reference. |

`strict()` uses the default.

## When not to use it

Turn it off in a project that has no issue tracker to point at.
