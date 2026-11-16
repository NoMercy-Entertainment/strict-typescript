import { defineConfig } from 'vitest/config';

export default defineConfig({
  // The tool tests start cspell, jscpd, oxlint and Tailwind's design system; 5 s is too short on a loaded machine.
  test: { include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'], testTimeout: 60_000 },
});
