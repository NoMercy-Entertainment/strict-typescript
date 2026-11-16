// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

export function loose(key: string, left: number[], right: number[], free: unknown) {
  const table = { a: 1 };
  const picked = key as keyof typeof table;
  const joined = [...left, ...right];

  return [picked, joined, free];
}

export function looseCasts(free: unknown) {
  const shape = { a: 1 } as { a: number };
  const text = free as unknown as string;

  return [shape, text];
}
