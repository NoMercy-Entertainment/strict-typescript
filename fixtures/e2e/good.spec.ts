// -----------------------------------------------------------------------------
//  Copyright (c) NoMercy Entertainment
//
//  Licensed under the Apache License, Version 2.0. See LICENSE for details.
//
//  SPDX-License-Identifier: Apache-2.0
// -----------------------------------------------------------------------------

import { expect, test } from '@playwright/test';

test('is not focused', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Home');
});
