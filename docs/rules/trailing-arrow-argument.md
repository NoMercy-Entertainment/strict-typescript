# strict/trailing-arrow-argument

An arrow that follows another argument starts its body on the line after `=>`.

- Fixable: yes, with `--fix` (whitespace).
- Needs type information: no.
- Source: [trailing-arrow-argument.ts](../../src/rules/trailing-arrow-argument.ts). Tests: [trailing-arrow-argument.spec.ts](../../src/rules/__tests__/trailing-arrow-argument.spec.ts).

## What it catches

The last argument of a call, when it is an arrow with an expression body and another argument comes before it.

| Message               | Meaning                                                              |
| --------------------- | -------------------------------------------------------------------- |
| `bodyNextLine`        | The body starts on the line after `=>`.                              |
| `literalOnArrowLine`  | An object or array body opens on the `=>` line.                      |
| `bareOnArrowLine`     | A literal or a single-variable body stays on the `=>` line.          |

## Why

The arguments before the arrow and the body after it are two different things.
A line break after `=>` makes the split visible, and a short body such as `() => false` needs none.

## Wrong

```ts
pick(rows, () => this.value)
set(key, (current) => apply(current, variables))
usePanelState(scripts, () =>
  false)
```

## Right

```ts
pick(rows, () =>
  this.value)
set(key, (current) =>
  apply(current, variables))
usePanelState(scripts, () => false)
```

These stay as they are:

```ts
ids.map((row) => row.id)
watch(settings, (next) => apply(next), { deep: true })
set(key, (current) => {
  apply(current)
})
vi.mock('../client', () => ({ client: http }))
```

A lone or first callback, an arrow that has more arguments after it, a block body, and an object or array body are not reported.

## Options

None.

## When not to use it

Turn it off if your team keeps short call bodies on the arrow line.
