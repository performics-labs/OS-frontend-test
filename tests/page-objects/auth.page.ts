import type { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * AuthPage - Page Object Model for authentication flows
 *
 * Handles both login and signup modes following 2025 best practices:
 * - Role-based locators (getByRole, getByLabel)
 * - Auto-waiting for form elements
 */
export class AuthPage extends BasePage {
  // Page elements
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly nameInput: Locator;
  readonly submitButton: Locator;
  readonly toggleModeButton: Locator;
  readonly cardTitle: Locator;

  constructor(page: Page) {
    super(page);

    // Form inputs using getByLabel for accessibility
    this.emailInput = this.page.getByLabel('Email');
    this.passwordInput = this.page.getByLabel('Password');
    this.nameInput = this.page.getByLabel('Name');

    // Buttons
    this.submitButton = this.page.getByRole('button', { name: /sign in|create account|signing in|creating account/i });
    this.toggleModeButton = this.page.getByRole('button', { name: /don't have an account|already have an account/i });

    // Page elements - CardTitle renders as div, not heading, so use text locator
    this.cardTitle = this.page.getByText(/^(Welcome back|Create an account)$/);
  }

  /**
   * Navigate to login page
   */
  async navigate() {
    await this.goto('/login');
  }

  /**
   * Check if currently on login mode
   */
  async isLoginMode(): Promise<boolean> {
    const title = await this.cardTitle.textContent();
    return title?.includes('Welcome back') ?? false;
  }

  /**
   * Check if currently on signup mode
   */
  async isSignupMode(): Promise<boolean> {
    const title = await this.cardTitle.textContent();
    return title?.includes('Create an account') ?? false;
  }

  /**
   * Toggle between login and signup modes
   */
  async toggleMode() {
    await this.toggleModeButton.click();
  }

  /**
   * Fill login form
   */
  async fillLoginForm(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Fill signup form
   */
  async fillSignupForm(name: string, email: string, password: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Submit the form (works for both login and signup)
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Complete login flow
   */
  async login(email: string, password: string) {
    // Ensure we're in login mode
    const isLogin = await this.isLoginMode();
    if (!isLogin) {
      await this.toggleMode();
    }

    await this.fillLoginForm(email, password);
    await this.submit();
  }

  /**
   * Complete signup flow
   */
  async signup(name: string, email: string, password: string) {
    // Ensure we're in signup mode
    const isSignup = await this.isSignupMode();
    if (!isSignup) {
      await this.toggleMode();
    }

    await this.fillSignupForm(name, email, password);
    await this.submit();
  }

  /**
   * Wait for successful authentication (redirect away from /login)
   */
  async waitForAuthSuccess() {
    // Wait for navigation away from login page
    await this.page.waitForURL((url) => url.pathname !== '/login', { timeout: 15000 });

    // Give the page time to fully load
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for auth error toast
   */
  async waitForAuthError(): Promise<string> {
    const toast = this.page.locator('[data-sonner-toast][data-type="error"]');
    await toast.waitFor({ state: 'visible' });
    const message = await toast.textContent();
    return message || 'Unknown error';
  }

  /**
   * Wait for success toast
   */
  async waitForAuthSuccessToast(): Promise<string> {
    const toast = this.page.locator('[data-sonner-toast][data-type="success"]');
    await toast.waitFor({ state: 'visible' });
    const message = await toast.textContent();
    return message || 'Success';
  }

  /**
   * Check if submit button is disabled (during submission)
   */
  async isSubmitting(): Promise<boolean> {
    return await this.submitButton.isDisabled();
  }

  /**
   * Get the current submit button text
   */
  async getSubmitButtonText(): Promise<string | null> {
    return await this.submitButton.textContent();
  }
}
