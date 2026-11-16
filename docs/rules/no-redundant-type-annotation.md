# strict/no-redundant-type-annotation

Drops an annotation that repeats the type of the value, and moves a literal's type to `as const satisfies T`.

- Fixable: yes, with `--fix` (code).
- Needs type information: yes. `typeChecked: false` turns it off.
- Source: [no-redundant-type-annotation.ts](../../src/rules/no-redundant-type-annotation.ts). Tests: [no-redundant-type-annotation.spec.ts](../../src/rules/__tests__/no-redundant-type-annotation.spec.ts).

## What it catches

The rule uses the TypeScript checker. It reports only when the change keeps the type the same or tighter.
Each message names one case.

| Message          | Case                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------ |
| `redundant`      | The value already has this type. Drop the annotation.                                |
| `table`          | A constant object states its type as `{ ... } as const satisfies T`.                 |
| `list`           | A constant list states its type as `[ ... ] as const satisfies readonly T[]`.        |
| `callbackParam`  | The list already types this callback parameter.                                      |
| `bareSatisfies`  | A literal uses a bare `satisfies T`. Write `as const satisfies T`.                   |
| `callbackTarget` | The generic or annotation names what a callback returns. State it on the literal.    |
| `literalNeverNull` | A literal is never null or undefined. Drop the empty members of the union.         |
| `callbackReturn` | Type the returned literal, not the function.                                         |

## Why

`as const satisfies T` keeps the exact literal types and still checks the literal against `T`.
An annotation widens the value to `T`, and a repeated annotation only adds noise.

## Wrong

```ts
const biggest: number = Math.max(1, 2)
const events: readonly string[] = ['a', 'b']
const dark: Theme = { bg: '#000', fg: '#fff' }
function section(id: string): Section { return { id, items: ['a'] } }
```

## Right

```ts
const biggest = Math.max(1, 2)
const events = ['a', 'b'] as const satisfies readonly string[]
const dark = { bg: '#000', fg: '#fff' } as const satisfies Theme
function section(id: string) { return { id, items: ['a'] } as const satisfies Section }
```

## Left alone

The rule keeps an annotation that does real work:

- It widens: `const ids: string[] = []`.
- It narrows through a generic: `const root: HTMLElement | null = document.querySelector('.x')`.
- A `let` may take a wider value later: `let total: number = Math.max(1, 2)`.
- The value is changed later, so `as const` would reject the write.
- A recursive function or an overload needs its return type.
- An async function returns a promise, not the literal.

## Options

None.

## When not to use it

Set `typeChecked: false` in a project with no TypeScript project to read types from.
That also turns off `strict/generic-over-annotation` and `@typescript-eslint/no-deprecated`.
