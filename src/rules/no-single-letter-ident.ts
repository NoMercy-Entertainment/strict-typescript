// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import { AST_NODE_TYPES, ESLintUtils, type TSESTree } from '@typescript-eslint/utils';

// Disallow single-letter parameter and variable names. The allow list covers the two
// conventional exceptions: x/y/z for maths and i/j/k for loop counters. Type parameters are
// never flagged. Report-only: a good rename needs the binding's type and a collision check.

const defaultAllow = ['x', 'y', 'z', 'i', 'j', 'k'];

type Param = TSESTree.Parameter;

function unwrap(param: TSESTree.Node | undefined): TSESTree.Identifier | null {
  switch (param?.type) {
    case AST_NODE_TYPES.Identifier:
      return param;
    case AST_NODE_TYPES.AssignmentPattern:
      return unwrap(param.left);
    case AST_NODE_TYPES.RestElement:
      return unwrap(param.argument);
    case AST_NODE_TYPES.TSParameterProperty:
      return unwrap(param.parameter);
    default:
      return null;
  }
}

export const noSingleLetterIdent = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      singleLetter: 'Single-letter name \'{{name}}\' — use a descriptive word (allowed only: {{allowed}}).',
    },
  },
  defaultOptions: [{ allow: defaultAllow }],
  create(context, [options]) {
    const allow = new Set(options.allow ?? defaultAllow);
    const allowedText = [...allow].join(', ');
    const source = context.sourceCode;

    function report(identifier: TSESTree.Identifier | null): void {
      if (identifier === null || identifier.name.length !== 1 || allow.has(identifier.name)) return;

      context.report({
        node: identifier,
        messageId: 'singleLetter',
        data: {
          name: identifier.name,
          allowed: allowedText,
        },
      });
    }

    function reportDeclared(node: TSESTree.Node): void {
      for (const variable of source.getDeclaredVariables(node)) {
        const declaration = variable.identifiers[0];

        if (declaration) {
          report(declaration);
        }
      }
    }

    function reportSignatureParams(node: { params: Param[] }): void {
      for (const param of node.params) {
        report(unwrap(param));
      }
    }

    return {
      FunctionDeclaration: reportDeclared,
      FunctionExpression: reportDeclared,
      ArrowFunctionExpression: reportDeclared,
      VariableDeclaration: reportDeclared,
      CatchClause: reportDeclared,
      TSDeclareFunction: reportSignatureParams,
      TSFunctionType: reportSignatureParams,
      TSMethodSignature: reportSignatureParams,
      TSCallSignatureDeclaration: reportSignatureParams,
      TSConstructSignatureDeclaration: reportSignatureParams,
      TSEmptyBodyFunctionExpression: reportSignatureParams,
    };
  },
});
