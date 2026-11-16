# tsconfig presets

Five presets live in `@nomercy-entertainment/strict-typescript/tsconfig/`.
Extend one from your `tsconfig.json`:

```json
{
  "extends": "@nomercy-entertainment/strict-typescript/tsconfig/dom.json",
  "include": ["src"]
}
```

To stack two presets, list both. The later one wins:

```json
{
  "extends": [
    "@nomercy-entertainment/strict-typescript/tsconfig/node.json",
    "@nomercy-entertainment/strict-typescript/tsconfig/strictest.json"
  ]
}
```

## base.json

Every other preset except `strictest` extends it. It sets:

| Flag                               | Value      | Effect                                                         |
| ---------------------------------- | ---------- | -------------------------------------------------------------- |
| `strict`                           | `true`     | All strict checks.                                             |
| `noUncheckedIndexedAccess`         | `true`     | An index or `Record` read may be `undefined`.                  |
| `noImplicitThis`                   | `true`     | `this` needs a type.                                           |
| `verbatimModuleSyntax`             | `true`     | Type-only imports need `import type`.                          |
| `moduleDetection`                  | `force`    | Every file is a module.                                        |
| `useDefineForClassFields`          | `true`     | Class fields use the standard define semantics.                |
| `esModuleInterop`                  | `true`     | Default imports from CommonJS work.                            |
| `forceConsistentCasingInFileNames` | `true`     | An import must match the file's casing.                        |
| `resolveJsonModule`                | `true`     | You can import `.json` files.                                  |
| `skipLibCheck`                     | `true`     | Skip type-checking of `.d.ts` files.                           |
| `target`                           | `ESNext`   | No downleveling.                                               |

## dom.json

Extends `base`. For browser code and libraries.

| Flag               | Value                              |
| ------------------ | ---------------------------------- |
| `lib`              | `ES2022`, `DOM`, `DOM.Iterable`    |
| `module`           | `ESNext`                           |
| `moduleResolution` | `bundler`                          |

## node.json

Extends `base`. For Node code. It needs `@types/node`.

| Flag               | Value      |
| ------------------ | ---------- |
| `module`           | `nodenext` |
| `moduleResolution` | `nodenext` |
| `target`           | `es2024`   |
| `types`            | `node`     |

## vue.json

Extends `dom`. For Vue apps.

| Flag              | Value      |
| ----------------- | ---------- |
| `jsx`             | `preserve` |
| `jsxImportSource` | `vue`      |

## strictest.json

Extends `base`. A set of extra checks you can stack on `dom` or `node`.

| Flag                                 | Value  | Effect                                                    |
| ------------------------------------ | ------ | --------------------------------------------------------- |
| `noImplicitOverride`                 | `true` | A method that overrides a base method needs `override`.   |
| `noFallthroughCasesInSwitch`         | `true` | A `case` that runs on into the next one is an error.      |
| `noPropertyAccessFromIndexSignature` | `true` | Read an index-signature key with `obj['key']`.            |
| `isolatedModules`                    | `true` | Each file must compile on its own.                        |
