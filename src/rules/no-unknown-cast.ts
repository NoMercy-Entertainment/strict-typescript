// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

// Disallow `value as unknown as T` unless a comment on the same line or the line directly above
// says why. A few double casts are forced by the types; each one must be deliberate.

export const noUnknownCast = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'suggestion',
    schema: [],
    messages: {
      unknownCast: '`as unknown as {{type}}` — add a short inline comment justifying the double-cast, or type it at construction.',
    },
  },
  defaultOptions: [],
  create(context) {
    const source = context.sourceCode;
    const commentLines = new Set<number>();

    for (const comment of source.getAllComments()) {
      for (let line = comment.loc.start.line; line <= comment.loc.end.line; line++) {
        commentLines.add(line);
      }
    }

    return {
      TSAsExpression(node) {
        const inner = node.expression;

        if (inner.type !== AST_NODE_TYPES.TSAsExpression) return;

        if (inner.typeAnnotation.type !== AST_NODE_TYPES.TSUnknownKeyword) return;

        const line = node.loc.start.line;

        if (commentLines.has(line) || commentLines.has(line - 1)) return;

        context.report({
          node,
          messageId: 'unknownCast',
          data: { type: source.getText(node.typeAnnotation) },
        });
      },
    };
  },
});
