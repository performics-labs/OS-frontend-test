import { test as base, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/auth.page';
import { ChatPage } from '../page-objects/chat.page';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

/**
 * Authentication Fixture
 *
 * Provides authenticated test context by:
 * 1. Logging in a test user
 * 2. Saving authentication state to file
 * 3. Reusing saved state across tests
 *
 * Based on Playwright 2025 best practices for authentication
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const STORAGE_STATE_PATH = path.join(__dirname, '../.auth/user.json');

type AuthFixtures = {
  authPage: AuthPage;
  chatPage: ChatPage;
};

/**
 * Extended test with page object fixtures
 * Automatically restores sessionStorage from storage state
 */
export const test = base.extend<AuthFixtures>({
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },

  chatPage: async ({ page }, use) => {
    const chatPage = new ChatPage(page);
    await use(chatPage);
  },

  page: async ({ page }, use) => {
    // Restore sessionStorage if it exists in storage state
    // This is needed because Playwright doesn't automatically restore sessionStorage
    try {
      const storageStateData = fs.readFileSync(STORAGE_STATE_PATH, 'utf-8');
      const storageState = JSON.parse(storageStateData);

      if (storageState.origins?.[0]?.sessionStorage) {
        await page.goto('/');  // Navigate to domain first
        await page.evaluate((sessionData) => {
          sessionData.forEach(({ name, value }: { name: string; value: string }) => {
            sessionStorage.setItem(name, value);
          });
        }, storageState.origins[0].sessionStorage);

        // Wait for storage to be set
        await page.waitForLoadState('domcontentloaded');
      }
    } catch (error) {
      // Storage state file might not exist yet (for non-authenticated tests)
    }

    await use(page);
  },
});

export { expect };

/**
 * Test credentials for authentication
 * These should match test users created in the backend database
 */
export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
  name: 'Test User',
};

/**
 * Perform login and save authentication state
 * Used in setup tests to authenticate once and reuse the state
 */
export async function authenticateUser(authPage: AuthPage, user = TEST_USER) {
  await authPage.navigate();
  await authPage.login(user.email, user.password);
  await authPage.waitForAuthSuccess();
}
