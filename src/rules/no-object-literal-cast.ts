// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import { AST_NODE_TYPES, ESLintUtils, type TSESTree } from '@typescript-eslint/utils';

// Disallow `{ ... } as SomeType` on an object literal. The type belongs at the construction
// site: a typed const, a typed parameter or the return type. `as const` is exempt.

function isAsConst(annotation: TSESTree.TypeNode): boolean {
  return (
    annotation.type === AST_NODE_TYPES.TSTypeReference &&
    annotation.typeName.type === AST_NODE_TYPES.Identifier &&
    annotation.typeName.name === 'const'
  );
}

export const noObjectLiteralCast = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'suggestion',
    schema: [],
    messages: {
      literalCast: 'Cast on an object literal — type it at construction (typed const / parameter / return type) instead of `as {{type}}`.',
    },
  },
  defaultOptions: [],
  create(context) {
    const source = context.sourceCode;

    function check(node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion): void {
      if (node.expression.type !== AST_NODE_TYPES.ObjectExpression) return;

      if (isAsConst(node.typeAnnotation)) return;

      context.report({
        node,
        messageId: 'literalCast',
        data: { type: source.getText(node.typeAnnotation) },
      });
    }

    return {
      TSAsExpression: check,
      TSTypeAssertion: check,
    };
  },
});
