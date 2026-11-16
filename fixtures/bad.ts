const table = { a: 1, b: 2 };

export function bad(value: number, key: string, left: number[], right: number[], free: unknown) {
  let total = 0;
  if (value > 1) total = 1;
  const label = value > 1 ? 'big' : 'small';
  const size = value > 2 ? value > 3 ? 'huge' : 'large' : 'tiny';
  const count: number = Math.max(1, 2);
  const picked = key as keyof typeof table;
  const joined = [...left, ...right];
  total += 1;
  return [total, label, size, count, picked, joined, free];
}

export function hygiene(free: unknown) {
  // TODO tidy this up
  // compat alias for the old name
  const q = { a: 1 } as { a: number };
  const text = free as unknown as string;

  return [q, text];
}
