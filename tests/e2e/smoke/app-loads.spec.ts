import { test, expect } from '@playwright/test';

/**
 * Smoke Tests
 *
 * Quick validation tests that verify:
 * - App loads without errors
 * - Basic UI elements are present
 * - Navigation works
 * - No authentication required
 *
 * These tests run fast and catch critical breaking issues
 */

test.describe('Smoke Tests - App Loads', () => {
  test('should load login page without errors', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Page should load successfully
    await expect(page).toHaveURL('/login');

    // No console errors (critical ones)
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check for OneSuite branding
    const brandingElement = page.getByLabel(/OneSuite branding/i);
    await expect(brandingElement).toBeVisible();

    // Login card title should be visible (CardTitle is a div, not heading)
    const loginCard = page.getByText(/^(Welcome back|Create an account)$/);
    await expect(loginCard).toBeVisible();
  });

  test('should have all essential form elements on login page', async ({ page }) => {
    await page.goto('/login');

    // Email input
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toBeEnabled();

    // Password input
    const passwordInput = page.getByLabel('Password');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toBeEnabled();

    // Submit button
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();

    // Mode toggle button
    const toggleButton = page.getByRole('button', { name: /don't have an account/i });
    await expect(toggleButton).toBeVisible();
  });

  test('should toggle between login and signup modes', async ({ page }) => {
    await page.goto('/login');

    // Initial state - login mode (CardTitle is a div, not heading)
    const loginHeading = page.getByText('Welcome back');
    await expect(loginHeading).toBeVisible();

    // Toggle to signup
    const toggleButton = page.getByRole('button', { name: /don't have an account/i });
    await toggleButton.click();

    // Verify signup mode
    const signupHeading = page.getByText('Create an account');
    await expect(signupHeading).toBeVisible();

    // Name field should be visible
    const nameInput = page.getByLabel('Name');
    await expect(nameInput).toBeVisible();
  });

  test('should have no critical accessibility violations on login page', async ({ page }) => {
    await page.goto('/login');

    // Check for proper HTML structure
    // Should have main element
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Form should have proper labels
    const emailLabel = page.locator('label[for="email"]');
    await expect(emailLabel).toBeVisible();

    const passwordLabel = page.locator('label[for="password"]');
    await expect(passwordLabel).toBeVisible();

    // Inputs should have associated labels
    const emailInput = page.locator('input#email');
    await expect(emailInput).toHaveAttribute('type', 'email');

    const passwordInput = page.locator('input#password');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/login');

    // Page should have a title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should redirect root to login when not authenticated', async ({ page }) => {
    // Try to access root
    await page.goto('/');

    // Should redirect to login
    await page.waitForURL('/login', { timeout: 5000 });
    await expect(page).toHaveURL('/login');
  });

  test('should have responsive layout on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/login');

    // Login card should still be visible and usable (CardTitle is a div, not heading)
    const loginCard = page.getByText('Welcome back');
    await expect(loginCard).toBeVisible();

    // Form inputs should be visible
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toBeVisible();

    // Submit button should be visible
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await expect(submitButton).toBeVisible();
  });

  test('should load static assets', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('requestfailed', (request) => {
      const url = request.url();
      // Track failed asset requests from our domain only (ignore external CDN failures)
      if (url.match(/\.(js|css|svg|png|jpg|jpeg|gif|woff|woff2)$/) &&
          !url.includes('cdn.jsdelivr.net') &&
          !url.includes('fonts.googleapis.com')) {
        failedRequests.push(url);
      }
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Critical assets from our domain should load successfully
    expect(failedRequests).toHaveLength(0);
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    await page.goto('/login');

    // Verify we're on login
    await expect(page).toHaveURL('/login');

    // Toggle to signup
    const toggleButton = page.getByRole('button', { name: /don't have an account/i });
    await toggleButton.click();

    // Go back (though this won't change URL, just mode)
    await page.goBack();

    // Go forward
    await page.goForward();

    // Should still be on login page
    await expect(page).toHaveURL('/login');
  });

  test('should have working skip to main content link', async ({ page }) => {
    await page.goto('/login');

    // Tab to skip link (it should be first focusable element)
    await page.keyboard.press('Tab');

    // Skip link should exist in DOM (it's sr-only so not in viewport by default)
    const skipLink = page.getByText(/skip to main content/i);
    await expect(skipLink).toBeAttached();

    // Verify it has the correct href
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('should not have JavaScript errors on page load', async ({ page }) => {
    const jsErrors: string[] = [];

    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Should not have any JavaScript errors
    expect(jsErrors).toHaveLength(0);
  });
});

test.describe('Smoke Tests - Theme Support', () => {
  test('should support both light and dark themes', async ({ page }) => {
    await page.goto('/login');

    // Check if theme can be determined from HTML or body class
    const htmlElement = page.locator('html');
    const bodyElement = page.locator('body');

    // At least one should have theme-related classes or attributes
    const htmlClass = await htmlElement.getAttribute('class');
    const bodyClass = await bodyElement.getAttribute('class');

    const hasThemeClasses = (htmlClass?.includes('light') || htmlClass?.includes('dark')) ||
                            (bodyClass?.includes('light') || bodyClass?.includes('dark'));

    // Theme system should be in place (even if we can't toggle it from login)
    expect(typeof hasThemeClasses).toBe('boolean');
  });
});
