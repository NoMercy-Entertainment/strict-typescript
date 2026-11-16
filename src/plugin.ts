// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import { arrowTernaryBody } from './rules/arrow-ternary-body.js';
import { bodyShape } from './rules/body-shape.js';
import { genericOverAnnotation } from './rules/generic-over-annotation.js';
import { maxCallNesting } from './rules/max-call-nesting.js';
import { membersPerLine } from './rules/members-per-line.js';
import { noCompatVocab } from './rules/no-compat-vocab.js';
import { noHistoryComments } from './rules/no-history-comments.js';
import { noObjectLiteralCast } from './rules/no-object-literal-cast.js';
import { noRedundantTypeAnnotation } from './rules/no-redundant-type-annotation.js';
import { noSingleLetterIdent } from './rules/no-single-letter-ident.js';
import { noUnknownCast } from './rules/no-unknown-cast.js';
import { trailingArrowArgument } from './rules/trailing-arrow-argument.js';

const docsBase = 'https://github.com/NoMercy-Entertainment/strict-typescript/blob/master/docs/rules';

// The rule files stay as ported; the docs link is added here, in one place.
function documented<Rule extends { meta: object }>(name: string, description: string, rule: Rule) {
  return {
    ...rule,
    meta: { ...rule.meta, docs: { description, url: `${docsBase}/${name}.md` } },
  } as const satisfies Rule;
}

export const rules = {
  'arrow-ternary-body': documented('arrow-ternary-body', 'Start a ternary arrow body on the next line, without brackets.', arrowTernaryBody),
  'body-shape': documented('body-shape', 'Keep an if body to a bare exit, a returned value on the next line, or a block.', bodyShape),
  'generic-over-annotation': documented('generic-over-annotation', 'Pass the type to a generic call instead of annotating the variable.', genericOverAnnotation),
  'max-call-nesting': documented('max-call-nesting', 'Nest calls at most two deep.', maxCallNesting),
  'members-per-line': documented('members-per-line', 'Put each entry of an object with three or more entries on its own line.', membersPerLine),
  'no-compat-vocab': documented('no-compat-vocab', 'Ban compat markers in comments and the compat words a project lists.', noCompatVocab),
  'no-history-comments': documented('no-history-comments', 'Ban bug-number history, spec section marks and TODO notes without an issue reference.', noHistoryComments),
  'no-object-literal-cast': documented('no-object-literal-cast', 'Type an object literal at construction instead of casting it.', noObjectLiteralCast),
  'no-redundant-type-annotation': documented('no-redundant-type-annotation', 'Drop a type annotation that repeats the type of the value.', noRedundantTypeAnnotation),
  'no-single-letter-ident': documented('no-single-letter-ident', 'Ban one-letter names except x, y, z, i, j and k.', noSingleLetterIdent),
  'no-unknown-cast': documented('no-unknown-cast', 'Ban as unknown as T without an inline comment that says why.', noUnknownCast),
  'trailing-arrow-argument': documented('trailing-arrow-argument', 'Start the body of an arrow that follows another argument on the line after the arrow.', trailingArrowArgument),
};

export const plugin = {
  meta: { name: '@nomercy-entertainment/strict-typescript' },
  rules,
};
