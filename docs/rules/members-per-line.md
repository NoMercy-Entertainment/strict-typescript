# strict/members-per-line

An object, or an object type, with three or more entries puts each entry on its own line.

- Fixable: yes, with `--fix` (whitespace).
- Needs type information: no.
- Source: [members-per-line.ts](../../src/rules/members-per-line.ts). Tests: [members-per-line.spec.ts](../../src/rules/__tests__/members-per-line.spec.ts).

## What it catches

An object literal, a type literal or an interface body with three or more entries where two entries share a line.
Object types end each line with a semicolon. Object literals keep a trailing comma.

## Why

Three entries on one line are hard to scan, and a diff that adds a fourth entry changes the whole line.
One entry per line keeps diffs small.
Two entries still fit on one line.

## Wrong

```ts
type Query<T> = { data: T; isPending: boolean; isError: boolean }

function f() {
  return { ...labels, ...words('x'), roles: words('y') }
}
```

## Right

```ts
type Query<T> = {
  data: T;
  isPending: boolean;
  isError: boolean;
}

function f() {
  return {
    ...labels,
    ...words('x'),
    roles: words('y'),
  }
}
```

```ts
type Link = { name: string; label: string }
```

## Options

None. The limit is 3 entries.

## When not to use it

Turn it off if you want to keep short tuples-as-objects on one line, such as `{ x: 1, y: 2, z: 3 }`.
