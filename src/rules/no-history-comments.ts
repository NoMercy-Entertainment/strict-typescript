// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import { ESLintUtils } from '@typescript-eslint/utils';

// Bans the detectable subset of useless comments: bug-number history, spec section citations
// and open-task markers with no issue reference. The general "no WHAT comment" judgment stays
// with the reviewer.

const defaultIssueRef = '#\\d+|[(\\[][A-Z][A-Z0-9]+-\\d+|https?://';

const bugHistory = /\bbug\s+\d/i;
const specCitation = /§/;
const todoMarker = /\b(?:TODO|FIXME)\b/i;

export const noHistoryComments = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        properties: { issueRefPattern: { type: 'string' } },
        additionalProperties: false,
      },
    ],
    messages: {
      bugHistory: 'Bug-number history in a comment — that belongs in the commit message, not the code.',
      specCitation: 'Spec citation (\'§\') in a comment — link the spec from docs; don\'t cite section markers in code.',
      nakedTodo: 'TODO/FIXME without an issue reference — file an issue and reference it, or remove the note.',
    },
  },
  defaultOptions: [{ issueRefPattern: defaultIssueRef }],
  create(context, [options]) {
    const issueRef = new RegExp(options.issueRefPattern ?? defaultIssueRef);
    const source = context.sourceCode;

    return {
      Program() {
        for (const comment of source.getAllComments()) {
          const text = comment.value;

          if (bugHistory.test(text)) {
            context.report({
              loc: comment.loc,
              messageId: 'bugHistory',
            });
          } else if (specCitation.test(text)) {
            context.report({
              loc: comment.loc,
              messageId: 'specCitation',
            });
          } else if (todoMarker.test(text) && !issueRef.test(text)) {
            context.report({
              loc: comment.loc,
              messageId: 'nakedTodo',
            });
          }
        }
      },
    };
  },
});
