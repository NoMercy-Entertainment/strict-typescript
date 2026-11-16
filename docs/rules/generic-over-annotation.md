# strict/generic-over-annotation

A generic call takes its type as a generic, not as an annotation on the variable.

- Fixable: yes, with `--fix` (code).
- Needs type information: yes. `typeChecked: false` turns it off.
- Source: [generic-over-annotation.ts](../../src/rules/generic-over-annotation.ts). Tests: [generic-over-annotation.spec.ts](../../src/rules/__tests__/generic-over-annotation.spec.ts).

## What it catches

A variable that has a type annotation and is set from a generic call, where the annotation could be passed to the call instead.
The rule checks with the TypeScript checker that the call really takes that type argument.
It leaves the code alone when the generic would not compile.

## Why

`ref<number | null>(null)` states the type once, at the call, and the variable infers it.
An annotation on the variable repeats the wrapper type, such as `Ref<...>` or `ComputedRef<...>`, and drifts from the call.

## Wrong

```ts
const count: Ref<number | null> = ref(null);
const route: ComputedRef<{ name: string } | null> = computed(() => null);
```

## Right

```ts
const count = ref<number | null>(null);
const route = computed<{ name: string } | null>(() => null);
```

## Left alone

- The call is not generic: `const count: ComputedRef<number> = makeCount();`
- The annotation names another wrapper than the call returns.
- The call already passes type arguments: `const set: Set<string> = new Set<'a'>();`
- A declaration with no value: `let count: Ref<number>;`
- The call resolves to a non-generic overload, such as `Promise.resolve()`.

## Options

None.

## When not to use it

Set `typeChecked: false` in `strict()` for a project that has no TypeScript project to read types from.
That also turns off `strict/no-redundant-type-annotation`.
