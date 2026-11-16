import { keysOf, merge, oneOf } from '../src/array.js';

const table = { a: 1, b: 2 } as const;

export function good(key: string, left: readonly number[], right: readonly number[]) {
  const known = oneOf(keysOf(table), key);
  const joined = merge(left, right);

  return {
    known,
    joined,
  };
}
