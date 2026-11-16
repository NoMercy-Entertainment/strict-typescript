// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import { ESLintUtils } from '@typescript-eslint/utils';

// Bans compat vocabulary from code that carries no compat layer: banned identifiers, banned
// class names and compat markers in comments. Only the comment markers have defaults; a project
// names its own identifiers, patterns and classes under the `words` option.

export const defaultCommentSubstrings = ['@deprecated', 'compatible alias', 'compat alias', 'v1-compat'];

export interface Words {
  identifiers?: readonly string[];
  identifierPatterns?: readonly string[];
  classes?: readonly string[];
  commentSubstrings?: readonly string[];
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const noCompatVocab = ESLintUtils.RuleCreator.withoutDocs<[{ words?: Words }], 'bannedIdentifier' | 'bannedComment'>({
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: {
          words: {
            type: 'object',
            properties: {
              identifiers: {
                type: 'array',
                items: { type: 'string' },
              },
              identifierPatterns: {
                type: 'array',
                items: { type: 'string' },
              },
              classes: {
                type: 'array',
                items: { type: 'string' },
              },
              commentSubstrings: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      bannedIdentifier: 'Compat vocabulary \'{{name}}\' is banned in v2 — {{hint}}',
      bannedComment: 'Compat marker \'{{marker}}\' in a comment — v2 carries no compat layer; drop it or move the rationale to the commit message.',
    },
  },
  defaultOptions: [{}],
  create(context, [options]) {
    const words = options.words ?? {};
    const identifiers = new Set(words.identifiers ?? []);
    const patterns = (words.identifierPatterns ?? []).map((pattern) => new RegExp(pattern));
    const classes = new Set(words.classes ?? []);
    // A marker matches as a standalone token, so a longer word that contains it stays quiet.
    const markers = (words.commentSubstrings ?? defaultCommentSubstrings).map((marker) => ({
      marker,
      regex: new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(marker)}(?![A-Za-z0-9])`, 'i'),
    }));
    const source = context.sourceCode;

    return {
      Identifier(node) {
        const banned = identifiers.has(node.name) ||
          patterns.some((pattern) => pattern.test(node.name));

        if (!banned) return;

        context.report({
          node,
          messageId: 'bannedIdentifier',
          data: {
            name: node.name,
            hint: 'use the canonical v2 name.',
          },
        });
      },
      ClassDeclaration(node) {
        if (node.id === null || !classes.has(node.id.name)) return;

        context.report({
          node: node.id,
          messageId: 'bannedIdentifier',
          data: {
            name: node.id.name,
            hint: 'this class has no place in v2.',
          },
        });
      },
      Program() {
        for (const comment of source.getAllComments()) {
          const hit = markers.find(({ regex }) => regex.test(comment.value));

          if (hit === undefined) continue;

          context.report({
            loc: comment.loc,
            messageId: 'bannedComment',
            data: { marker: hit.marker },
          });
        }
      },
    };
  },
});
