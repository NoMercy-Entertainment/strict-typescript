# strict/no-object-literal-cast

Bans `{ ... } as T`. Type the value where you build it.

- Fixable: no.
- Needs type information: no.
- Off in test files (the `testFiles` option).
- Source: [no-object-literal-cast.ts](../../src/rules/no-object-literal-cast.ts). Tests: [no-object-literal-cast.spec.ts](../../src/rules/__tests__/no-object-literal-cast.spec.ts).

## What it catches

A cast, in `as T` or `<T>` form, applied straight to an object literal.
`as const` is allowed.

## Why

A cast on a literal turns off the check that the literal has the right shape.
A missing or misspelled field compiles.
A typed constant, a typed parameter or a return type keeps the check.

## Wrong

```ts
const change = { cues: [], language: undefined } as SubtitleCueChange;
emit('subtitleCue', { cues: [] } as SubtitleCueChange);
const other = <SubtitleCueChange>{ cues: [] };
```

## Right

```ts
const change: SubtitleCueChange = { cues: [], language: undefined };
const config = { retries: 3 } as const;
```

Casting a value that is not a literal is not this rule's concern: `payload as SubtitleCueChange`.

## Options

None.

## When not to use it

Test doubles cast partial mocks on purpose, so `strict()` turns the rule off in test files.
Turn it off elsewhere only for generated code. The `generated` option does that for you.
