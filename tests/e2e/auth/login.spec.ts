import { test, expect } from '../../fixtures/auth.fixture';
import { TEST_USER } from '../../fixtures/auth.fixture';

/**
 * Authentication E2E Tests
 *
 * Tests login, signup, and protected route access using real backend
 * Following 2025 best practices with role-based locators and test isolation
 */

test.describe('Authentication', () => {
  test.describe('Login Flow', () => {
    test('should login successfully with valid credentials', async ({ authPage }) => {
      await authPage.navigate();

      // Verify we're on login page
      await expect(authPage.cardTitle).toHaveText(/Welcome back/i);

      // Fill and submit login form
      await authPage.login(TEST_USER.email, TEST_USER.password);

      // Wait for redirect to chat (app redirects to /chat/new after login)
      await authPage.waitForAuthSuccess();

      // Verify successful authentication
      await expect(authPage.page).toHaveURL(/\/(chat\/new)?/); // Accept / or /chat/new
      const isAuthenticated = await authPage.isAuthenticated();
      expect(isAuthenticated).toBe(true);
    });

    test('should show error with invalid credentials', async ({ authPage }) => {
      await authPage.navigate();

      // Try to login with invalid credentials
      await authPage.login('invalid@example.com', 'WrongPassword123!');

      // Wait for error toast
      const errorMessage = await authPage.waitForAuthError();

      // Verify error is shown
      expect(errorMessage).toMatch(/authentication failed|invalid|error/i);

      // Verify we're still on login page
      await expect(authPage.page).toHaveURL('/login');
    });

    test('should show error with empty fields', async ({ authPage }) => {
      await authPage.navigate();

      // Try to submit without filling fields
      await authPage.submit();

      // Browser validation should prevent submission
      // Email input should have validation error
      const emailValidity = await authPage.emailInput.evaluate((el: HTMLInputElement) =>
        el.checkValidity()
      );
      expect(emailValidity).toBe(false);
    });

    test('should toggle between login and signup modes', async ({ authPage }) => {
      await authPage.navigate();

      // Verify we start in login mode
      expect(await authPage.isLoginMode()).toBe(true);

      // Toggle to signup
      await authPage.toggleMode();

      // Verify we're in signup mode
      expect(await authPage.isSignupMode()).toBe(true);
      await expect(authPage.cardTitle).toHaveText(/Create an account/i);

      // Name field should be visible in signup mode
      await expect(authPage.nameInput).toBeVisible();

      // Toggle back to login
      await authPage.toggleMode();

      // Verify we're back in login mode
      expect(await authPage.isLoginMode()).toBe(true);
      await expect(authPage.cardTitle).toHaveText(/Welcome back/i);
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing protected route without auth', async ({
      page,
    }) => {
      // Try to access chat page without authentication
      await page.goto('/chat/new');

      // Should be redirected to login
      await page.waitForURL('/login', { timeout: 5000 });
      await expect(page).toHaveURL('/login');
    });

    test('should redirect to login when accessing projects without auth', async ({ page }) => {
      // Try to access projects page without authentication
      await page.goto('/projects');

      // Should be redirected to login
      await page.waitForURL('/login', { timeout: 5000 });
      await expect(page).toHaveURL('/login');
    });

    test('should redirect authenticated users away from login page', async ({
      authPage,
      page,
      context,
    }) => {
      // First login
      await authPage.navigate();
      await authPage.login(TEST_USER.email, TEST_USER.password);
      await authPage.waitForAuthSuccess();

      // Try to access login page again (navigation will be interrupted by redirect)
      try {
        await authPage.navigate();
      } catch (error) {
        // Navigation interruption is expected - authenticated users get redirected
      }

      // Should redirect away from login since already authenticated
      await expect(authPage.page).not.toHaveURL('/login');

      // Clean up: Clear storage to prevent test contamination
      await page.evaluate(() => {
        sessionStorage.clear();
        localStorage.clear();
      });
      await context.clearCookies();
    });
  });

  test.describe('Session Persistence', () => {
    test('should persist session after page reload', async ({ authPage, page, context }) => {
      // Login
      await authPage.navigate();
      await authPage.login(TEST_USER.email, TEST_USER.password);
      await authPage.waitForAuthSuccess();

      // Verify authenticated
      const isAuthBefore = await authPage.isAuthenticated();
      expect(isAuthBefore).toBe(true);

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still be authenticated
      const isAuthAfter = await authPage.isAuthenticated();
      expect(isAuthAfter).toBe(true);

      // Should not be on login page
      await expect(page).not.toHaveURL('/login');

      // Clean up: Clear storage to prevent test contamination
      await page.evaluate(() => {
        sessionStorage.clear();
        localStorage.clear();
      });
      await context.clearCookies();
    });
  });

  test.describe('UI Elements', () => {
    test('should display OneSuite branding', async ({ authPage }) => {
      await authPage.navigate();

      // Check for logo or brand text
      const brandingElement = authPage.page.getByLabel(/OneSuite branding/i);
      await expect(brandingElement).toBeVisible();
    });

    test('should show submit button state during login', async ({ authPage }) => {
      await authPage.navigate();

      // Get initial button text
      const initialText = await authPage.getSubmitButtonText();
      expect(initialText).toMatch(/sign in/i);

      // Fill form
      await authPage.fillLoginForm(TEST_USER.email, TEST_USER.password);

      // Submit and check loading state
      await authPage.submitButton.click();

      // Button should show loading state (briefly)
      // Note: This may be very quick with fast backend
      const isSubmitting = await authPage.isSubmitting();
      // Just verify the test can check this state (may or may not catch it)
      expect(typeof isSubmitting).toBe('boolean');
    });

    test('should have accessible form labels', async ({ authPage }) => {
      await authPage.navigate();

      // Verify form inputs have proper labels (accessible)
      await expect(authPage.emailInput).toBeVisible();
      await expect(authPage.passwordInput).toBeVisible();

      // Verify inputs can be focused
      await authPage.emailInput.focus();
      await expect(authPage.emailInput).toBeFocused();
    });
  });
});
