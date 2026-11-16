export function summarize(rows: Array<{ price: number; count: number; label: string }>) {
  const lines: string[] = [];
  let total = 0;

  for (const row of rows) {
    const subtotal = row.price * row.count;

    total += subtotal;
    lines.push(`${row.label}: ${row.count} x ${row.price} = ${subtotal}`);
  }

  lines.push(`Total: ${total}`);

  return lines.join('\n');
}
