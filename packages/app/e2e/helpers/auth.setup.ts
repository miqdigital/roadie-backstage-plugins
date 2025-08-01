/*
 * Copyright 2025 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-restricted-imports */
import { test as setup } from '@playwright/test';
import path from 'path';

const authFile = path.join(
  __dirname,
  '../../../../playwright/.auth/login.json',
);

setup('authenticate', async ({ page }) => {
  // Set the same localStorage
  await page.goto('http://localhost:3000'); // or whatever your root URL is
  await page.evaluate(() => {
    window.localStorage.setItem('@backstage/core:SignInPage:provider', 'guest');
  });

  await page.context().storageState({ path: authFile });
});
