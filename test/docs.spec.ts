import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { rules } from '../src/plugin.js';

const root = path.resolve(import.meta.dirname, '..');
const urlBase = 'https://github.com/NoMercy-Entertainment/strict-typescript/blob/master/';

function markdownFiles(): string[] {
  const docs = fs.readdirSync(path.join(root, 'docs'), { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.md'))
    .map((file) => path.join('docs', file));

  return ['README.md', 'CHANGELOG.md', ...docs];
}

describe('rule documentation', () => {
  it('gives each of the 12 rules a url and a page that exists', () => {
    const names = Object.keys(rules);

    expect(names).toHaveLength(12);

    const problems: string[] = [];

    for (const [name, rule] of Object.entries(rules)) {
      if (rule.meta.docs?.url !== `${urlBase}docs/rules/${name}.md`) {
        problems.push(`${name}: wrong url`);
      }

      if (!fs.existsSync(path.join(root, 'docs/rules', `${name}.md`))) {
        problems.push(`${name}: no page`);
      }

      if (!rule.meta.docs?.description) {
        problems.push(`${name}: no description`);
      }
    }

    expect(problems).toEqual([]);
  });
});

describe('links', () => {
  it('resolve to a file in the repository from every README and docs page', () => {
    const missing: string[] = [];
    let total = 0;

    for (const file of markdownFiles()) {
      const text = fs.readFileSync(path.join(root, file), 'utf8');

      for (const match of text.matchAll(/\]\(([^)\s]+)\)/g)) {
        const target = match[1] ?? '';

        if (/^(https?:|mailto:)/.test(target)) continue;

        total++;

        const [pathPart] = target.split('#');
        const resolved = path.resolve(root, path.dirname(file), pathPart ?? '');

        if (!fs.existsSync(resolved)) {
          missing.push(`${file} -> ${target}`);
        }
      }
    }

    expect(total).toBeGreaterThan(20);
    expect(missing).toEqual([]);
  });
});
