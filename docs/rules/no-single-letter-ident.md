# strict/no-single-letter-ident

Bans one-letter names. Only `x`, `y`, `z`, `i`, `j` and `k` pass.

- Fixable: no. A good rename needs the binding's type and a check for name clashes.
- Needs type information: no.
- Source: [no-single-letter-ident.ts](../../src/rules/no-single-letter-ident.ts). Tests: [no-single-letter-ident.spec.ts](../../src/rules/__tests__/no-single-letter-ident.spec.ts).

## What it catches

A one-letter variable, parameter or catch binding.
It covers function parameters, arrow parameters, method parameters, and the parameters in interface and type signatures.
A generic type parameter such as `T` is not reported.

## Why

`t`, `v` and `p` say nothing, and a reader has to read the body to learn what they hold.
A word costs a few keystrokes once.
The six allowed letters are coordinates and loop counters, which every reader knows.

## Wrong

```ts
const t = 1;
function scale(v: number) { return v; }
try { doThing(); } catch (e) { report(e); }
const combine = (a, b) => a + b;
```

## Right

```ts
const seconds = 1;
function scale(level: number) { return level; }
for (let i = 0; i < 3; i++) {}
const add = (x, y, z) => x + y + z;
function identity<T>(value: T): T { return value; }
```

## Options

Rule option, when you use the plugin by hand:

| Option  | Default                        | Meaning                              |
| ------- | ------------------------------ | ------------------------------------ |
| `allow` | `['x', 'y', 'z', 'i', 'j', 'k']` | The letters that pass.               |

```js
{ rules: { 'strict/no-single-letter-ident': ['error', { allow: ['a', 'b'] }] } }
```

`strict()` uses the default.

## When not to use it

Turn it off in math-heavy code where single letters are the standard notation.
