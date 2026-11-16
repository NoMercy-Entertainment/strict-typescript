// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

// merge takes lists of any item type, so its input must accept everything.
// eslint-disable-next-line no-restricted-syntax -- merge takes lists of any item type
type List = readonly unknown[];

type Merged<Lists extends readonly List[]> = Lists extends readonly [
  infer First extends List,
  ...infer Rest extends readonly List[],
]
  ? readonly [...First, ...Merged<Rest>]
  : readonly [];

// Several lists as one new read-only list, in order. Tuples stay tuples, so `as const` input
// keeps every position typed.
export function merge<const Lists extends readonly List[]>(...lists: Lists): Merged<Lists> {
// eslint-disable-next-line no-restricted-syntax -- flat() widens the tuple the Merged type restores
  return lists.flat() as unknown as Merged<Lists>;
}

// The keys of a table as a non-empty tuple typed by the table's own keys. Only for objects whose
// type lists every key they hold, such as a `const` table; an object with extra runtime keys would
// lie about them. The one Object.keys cast of the package lives here.
export function keysOf<const T extends object>(
  value: T,
): [Extract<keyof T, string>, ...Extract<keyof T, string>[]] {
  return Object.keys(value) as [Extract<keyof T, string>, ...Extract<keyof T, string>[]];
}

// The item of `list` equal to `value`, or undefined. It narrows a plain string (a route query, a
// prop, a tab name) to the known set without a cast: the result comes out of the list itself.
export function oneOf<const Item extends string>(
  list: readonly Item[],
  value: string | undefined,
): Item | undefined {
  return list.find((item) => item === value);
}

// The entry of a constant table for a key that arrives as a plain string (a status, an event type, a
// key name), or undefined when the table has no such key. The key is narrowed through the table's own
// key list, so no `as keyof` cast is needed and a name like "toString" never reaches the prototype.
export function lookup<const T extends object>(
  table: T,
  key: string | undefined,
): T[Extract<keyof T, string>] | undefined {
  const known = oneOf(keysOf(table), key);

  return known === undefined
    ? undefined
    : table[known];
}
