#!/usr/bin/env node
// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import { run } from './cli.js';

const result = run(process.argv.slice(2), process.cwd());

process.stdout.write(result.out);
process.exitCode = result.code;
