import { test as setup, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/auth.page';
import { STORAGE_STATE_PATH, TEST_USER, authenticateUser } from '../fixtures/auth.fixture';
import fs from 'fs';
import path from 'path';

/**
 * Authentication Setup
 *
 * Runs before authenticated tests to:
 * 1. Log in with test user credentials
 * 2. Save authentication state (cookies, sessionStorage, localStorage)
 * 3. Reuse the saved state across all authenticated tests
 *
 * This approach follows Playwright 2025 best practices for efficient auth handling
 */

setup('authenticate user', async ({ page }) => {
  const authPage = new AuthPage(page);

  // Ensure .auth directory exists
  const authDir = path.dirname(STORAGE_STATE_PATH);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  console.log(`Authenticating test user: ${TEST_USER.email}`);

  // Perform login
  await authenticateUser(authPage, TEST_USER);

  // Verify we're authenticated (app redirects to /chat/new or /)
  await expect(page).toHaveURL(/\/(chat\/new)?/, { timeout: 10000 });

  // Additional verification: check for auth indicators
  const isAuthenticated = await authPage.isAuthenticated();
  expect(isAuthenticated).toBe(true);

  console.log('Authentication successful, saving state...');

  // Capture sessionStorage (Playwright doesn't capture this automatically)
  const sessionStorageData = await page.evaluate(() => {
    const data: Record<string, string> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        data[key] = sessionStorage.getItem(key) || '';
      }
    }
    return data;
  });

  // Save storage state (includes cookies and localStorage)
  const storageState = await page.context().storageState();

  // Add sessionStorage to the state
  if (storageState.origins && storageState.origins.length > 0) {
    (storageState.origins[0] as any).sessionStorage = Object.entries(sessionStorageData).map(
      ([name, value]) => ({ name, value })
    );
  }

  // Save enhanced state to file
  fs.writeFileSync(STORAGE_STATE_PATH, JSON.stringify(storageState, null, 2));

  console.log(`Storage state (with sessionStorage) saved to: ${STORAGE_STATE_PATH}`);
});
