export function loose(key: string, left: number[], right: number[], free: unknown) {
  const table = { a: 1 };
  const picked = key as keyof typeof table;
  const joined = [...left, ...right];

  return [picked, joined, free];
}
