# strict/arrow-ternary-body

A ternary arrow body starts on the next line, without brackets.

- Fixable: yes, with `--fix` (whitespace).
- Needs type information: no.
- Source: [arrow-ternary-body.ts](../../src/rules/arrow-ternary-body.ts). Tests: [arrow-ternary-body.spec.ts](../../src/rules/__tests__/arrow-ternary-body.spec.ts).

## What it catches

An arrow function whose whole body is a ternary and that starts on the arrow line.
The rule moves the body to the next line and drops the brackets around it.

## Why

A ternary reads best when its test, `?` branch and `:` branch each get a line.
The brackets and the arrow-line start hide that shape.
This rule works with `@stylistic/multiline-ternary` and `@stylistic/indent`, which `strict()` also turns on.

## Wrong

```ts
const pick = (a: boolean) => (a
  ? 1
  : 2)
```

## Right

```ts
const pick = (a: boolean) =>
  a
    ? 1
    : 2
```

Two bodies stay as they are. Brackets that belong to a member read are kept, and so are the brackets around an object body:

```ts
const bare = (name: string) => (name ? 'a' : 'b').toLowerCase()
const make = () => ({ a: 1 })
```

## Options

None.

## When not to use it

Turn it off if your team writes ternary arrow bodies inside brackets on the arrow line.

```js
export default [...strict(), { rules: { 'strict/arrow-ternary-body': 'off' } }];
```
