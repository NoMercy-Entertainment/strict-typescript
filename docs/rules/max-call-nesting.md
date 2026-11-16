# strict/max-call-nesting

Calls nest at most 2 deep. Name the inner steps.

- Fixable: no.
- Needs type information: no.
- Source: [max-call-nesting.ts](../../src/rules/max-call-nesting.ts). Tests: [max-call-nesting.spec.ts](../../src/rules/__tests__/max-call-nesting.spec.ts).

## What it catches

A call inside a call inside a call.
The rule reports the outer call once, with the depth it found.

The count restarts in three places, so these never count as nesting:

- A chain: `wrapper.find('#a').find('#b').text()` reads left to right.
- A function argument: `color.map((v) => Math.round(v * 255))` starts over inside the arrow.
- A named object property: `t('k', { minutes: Math.max(1, Math.round(seconds / 60)) })` starts over inside `minutes`, because the property name already names the step.

The `expect()` call in a test does not count.

## Why

Three calls in one expression make a reader unpack it from the inside out.
A name on the middle step says what it is.

## Wrong

```ts
const accent = css(tint(rgb(scheme.muted), accent, 0.2, theme))
```

The message: `Calls nest 3 deep; give the inner steps a name of their own (at most 2).`

## Right

```ts
const base = rgb(scheme.muted)
const accent = css(tint(base, accent, 0.2, theme))
```

Two levels are fine: `Math.min(1, Math.max(0, v))`.

## Options

None. The limit is 2.

## When not to use it

Turn it off for code that is mostly a long pipeline of small calls, where a name for each step adds noise.
