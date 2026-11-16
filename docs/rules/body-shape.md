# strict/body-shape

An `if` body is a bare exit, a returned value on the next line, or a block.
A loop body is always a block.

- Fixable: yes, with `--fix` (whitespace).
- Needs type information: no.
- Source: [body-shape.ts](../../src/rules/body-shape.ts). Tests: [body-shape.spec.ts](../../src/rules/__tests__/body-shape.spec.ts).

## What it catches

The rule reports four shapes, one message each.

| Message    | Meaning                                                           |
| ---------- | ----------------------------------------------------------------- |
| `sameLine` | A bare `return`, `break` or `continue` stays on the `if` line.    |
| `nextLine` | A returned or thrown value goes on the next line, one level in.   |
| `block`    | An `if` that does more than return sits in a block.               |
| `loopBlock`| A loop body sits in a block.                                      |

## Why

A reader can tell what an `if` does from its shape.
A bare exit is one short line.
A returned value is a single indented line.
Anything else is a block, so no statement ever hides behind a missing bracket.

## Wrong

```ts
function f(a: boolean) {
  if (a) return 1
}

function g(a: boolean) {
  let b = 0
  if (a) b = 1
}

function h(rows: string[]) {
  for (const row of rows)
    run(row)
}
```

## Right

```ts
function f(a: boolean) {
  if (a)
    return 1
}

function g(a: boolean) {
  let b = 0
  if (a) {
    b = 1
  }
}

function h(rows: string[]) {
  for (const row of rows) {
    run(row)
  }
}
```

A bare exit stays on one line: `if (a) return`.

## Options

None.

## When not to use it

Turn it off if your team writes every `if` body in a block, or every short body on the `if` line.
