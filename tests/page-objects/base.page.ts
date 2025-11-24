import type { Page, Locator } from '@playwright/test';

/**
 * BasePage - Common functionality for all page objects
 *
 * Following 2025 best practices:
 * - Role-based locators (getByRole, getByLabel)
 * - Auto-waiting (no manual timeouts)
 * - Reusable navigation and theme utilities
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the current URL
   */
  async getUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(url?: string) {
    if (url) {
      await this.page.waitForURL(url);
    } else {
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Check if current path matches expected path
   */
  async isOnPath(path: string): Promise<boolean> {
    const url = new URL(this.page.url());
    return url.pathname === path;
  }

  /**
   * Get sidebar navigation element
   */
  getSidebar(): Locator {
    return this.page.getByRole('complementary').or(
      this.page.locator('[data-testid="sidebar"]')
    );
  }

  /**
   * Toggle theme between light and dark
   */
  async toggleTheme() {
    const themeButton = this.page.getByRole('button', { name: /theme|dark|light/i });
    await themeButton.click();
  }

  /**
   * Get the current theme from localStorage
   */
  async getCurrentTheme(): Promise<string | null> {
    return await this.page.evaluate(() => {
      return localStorage.getItem('theme');
    });
  }

  /**
   * Navigate using sidebar link
   */
  async navigateToSidebarLink(name: string) {
    const sidebar = this.getSidebar();
    const link = sidebar.getByRole('link', { name: new RegExp(name, 'i') });
    await link.click();
  }

  /**
   * Check if user is authenticated by checking for auth elements
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      // Check for navigation items that appear when authenticated
      // Look for "New Chat" button or user email in sidebar
      await this.page.getByRole('button', { name: /new chat/i }).or(
        this.page.getByText(/@/)
      ).first().waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get error message if displayed
   */
  async getErrorMessage(): Promise<string | null> {
    try {
      const errorElement = this.page.getByRole('alert').or(
        this.page.locator('[data-testid="error-message"]')
      );
      return await errorElement.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Wait for a success message/toast
   */
  async waitForSuccessMessage(message?: string) {
    if (message) {
      await this.page.getByText(message).waitFor({ state: 'visible' });
    } else {
      await this.page.getByRole('status').or(
        this.page.locator('[data-testid="success-message"]')
      ).waitFor({ state: 'visible' });
    }
  }

  /**
   * Take a screenshot with a custom name
   */
  async screenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Fill form field by label
   */
  async fillField(label: string, value: string) {
    const field = this.page.getByLabel(label, { exact: false });
    await field.fill(value);
  }

  /**
   * Click button by name/label
   */
  async clickButton(name: string) {
    const button = this.page.getByRole('button', { name: new RegExp(name, 'i') });
    await button.click();
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string) {
    await this.page.waitForSelector(selector, { state: 'visible' });
  }
}
