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

export const rules = {
  'arrow-ternary-body': arrowTernaryBody,
  'body-shape': bodyShape,
  'generic-over-annotation': genericOverAnnotation,
  'max-call-nesting': maxCallNesting,
  'members-per-line': membersPerLine,
  'no-compat-vocab': noCompatVocab,
  'no-history-comments': noHistoryComments,
  'no-object-literal-cast': noObjectLiteralCast,
  'no-redundant-type-annotation': noRedundantTypeAnnotation,
  'no-single-letter-ident': noSingleLetterIdent,
  'no-unknown-cast': noUnknownCast,
  'trailing-arrow-argument': trailingArrowArgument,
};

export const plugin = {
  meta: { name: '@nomercy-entertainment/strict-typescript' },
  rules,
};
