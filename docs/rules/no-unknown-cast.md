# strict/no-unknown-cast

Bans `as unknown as T` without an inline comment that says why.

- Fixable: no.
- Needs type information: no.
- Off in test files (the `testFiles` option).
- Source: [no-unknown-cast.ts](../../src/rules/no-unknown-cast.ts). Tests: [no-unknown-cast.spec.ts](../../src/rules/__tests__/no-unknown-cast.spec.ts).

## What it catches

A double cast through `unknown`.
The rule passes it when a comment sits on the same line or on the line directly above.

## Why

A few double casts are forced by the types, for example a mixin that reaches a private field.
Each one switches off the type checker for that value, so each one must be deliberate and explained.

## Wrong

```ts
const backend = handle as unknown as IAudioBackend;
```

The message: `as unknown as IAudioBackend: add a short inline comment justifying the double-cast, or type it at construction.`

## Right

```ts
const backend = handle as unknown as IAudioBackend; // mixin: private field

// registry stores the base type; narrow this generic instance
const entry = self as unknown as Player;
```

A single cast is not this rule's concern: `value as IAudioBackend`.

## Options

None.

## When not to use it

Test doubles cast mocks through `unknown` on purpose, so `strict()` turns the rule off in test files.
