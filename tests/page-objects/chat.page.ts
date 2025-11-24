import type { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * ChatPage - Page Object Model for chat interactions
 *
 * Handles message sending, file uploads, and conversation interactions
 * following 2025 best practices with role-based locators
 */
export class ChatPage extends BasePage {
  // Input elements
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly stopButton: Locator;
  readonly fileInput: Locator;
  readonly attachButton: Locator;

  // Conversation elements
  readonly conversationContainer: Locator;
  readonly messages: Locator;

  constructor(page: Page) {
    super(page);

    // Message input (textarea with name="message")
    this.messageInput = this.page.getByRole('textbox', { name: 'message' });

    // Action buttons - Send and Stop
    this.sendButton = this.page.getByRole('button', { name: /send|submit/i });
    this.stopButton = this.page.getByRole('button', { name: /stop/i });

    // File upload
    this.attachButton = this.page.getByRole('button', { name: /attach|paperclip/i });
    this.fileInput = this.page.locator('input[type="file"]');

    // Conversation elements
    this.conversationContainer = this.page.locator('[data-testid="conversation"]').or(
      this.page.locator('.conversation')
    );
    this.messages = this.page.locator('[data-testid="message"]').or(
      this.page.locator('.message')
    );
  }

  /**
   * Navigate to new chat page
   */
  async navigateToNewChat() {
    await this.goto('/chat/new');
  }

  /**
   * Navigate to specific chat by ID
   */
  async navigateToChat(chatId: string) {
    await this.goto(`/chat/${chatId}`);
  }

  /**
   * Type message in the input field
   */
  async typeMessage(message: string) {
    await this.messageInput.fill(message);
  }

  /**
   * Click send button
   */
  async clickSend() {
    await this.sendButton.click();
  }

  /**
   * Send a message (type + send)
   */
  async sendMessage(message: string) {
    await this.typeMessage(message);
    await this.clickSend();
  }

  /**
   * Stop streaming response
   */
  async stopStreaming() {
    await this.stopButton.click();
  }

  /**
   * Check if chat is streaming
   */
  async isStreaming(): Promise<boolean> {
    try {
      await this.stopButton.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for streaming to complete
   */
  async waitForStreamingComplete(timeout = 30000) {
    await this.stopButton.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Get all messages in the conversation
   */
  async getMessages(): Promise<string[]> {
    const messageElements = await this.messages.all();
    const messageTexts: string[] = [];

    for (const element of messageElements) {
      const text = await element.textContent();
      if (text) {
        messageTexts.push(text.trim());
      }
    }

    return messageTexts;
  }

  /**
   * Get the last message in the conversation
   */
  async getLastMessage(): Promise<string | null> {
    const messages = await this.getMessages();
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }

  /**
   * Wait for a new message to appear
   */
  async waitForNewMessage(previousCount: number, timeout = 30000) {
    await this.page.waitForFunction(
      (count) => {
        const messages = document.querySelectorAll('[data-testid="message"], .message');
        return messages.length > count;
      },
      previousCount,
      { timeout }
    );
  }

  /**
   * Get the current message count
   */
  async getMessageCount(): Promise<number> {
    return await this.messages.count();
  }

  /**
   * Wait for AI response to appear and complete
   */
  async waitForAIResponse(timeout = 30000) {
    // Wait for streaming to start
    await this.page.waitForTimeout(500);

    // Wait for streaming to complete
    try {
      await this.waitForStreamingComplete(timeout);
    } catch {
      // If stop button never appeared, response may have been instant
    }
  }

  /**
   * Upload files to chat
   */
  async uploadFiles(filePaths: string[]) {
    // Click attach button to open file picker
    await this.attachButton.click();

    // Set files on the hidden input
    await this.fileInput.setInputFiles(filePaths);
  }

  /**
   * Check if empty state is shown (no messages yet)
   */
  async isEmptyState(): Promise<boolean> {
    const messageCount = await this.getMessageCount();
    return messageCount === 0;
  }

  /**
   * Get placeholder text from input
   */
  async getPlaceholder(): Promise<string | null> {
    return await this.messageInput.getAttribute('placeholder');
  }

  /**
   * Copy message to clipboard (using action button)
   */
  async copyMessage(messageIndex: number) {
    const message = this.messages.nth(messageIndex);
    const copyButton = message.getByRole('button', { name: /copy/i });
    await copyButton.click();
  }

  /**
   * Regenerate AI response
   */
  async regenerateResponse() {
    const regenerateButton = this.page.getByRole('button', { name: /regenerate/i });
    await regenerateButton.click();
  }

  /**
   * Edit a message
   */
  async editMessage(messageIndex: number, newContent: string) {
    const message = this.messages.nth(messageIndex);
    const editButton = message.getByRole('button', { name: /edit/i });
    await editButton.click();

    // Fill new content
    const editInput = message.getByRole('textbox');
    await editInput.fill(newContent);

    // Confirm edit
    const confirmButton = message.getByRole('button', { name: /confirm|save/i });
    await confirmButton.click();
  }

  /**
   * Send feedback on a message (thumbs up/down)
   */
  async sendFeedback(messageIndex: number, feedback: 'up' | 'down') {
    const message = this.messages.nth(messageIndex);
    const feedbackButton = message.getByRole('button', {
      name: feedback === 'up' ? /thumbs up|like/i : /thumbs down|dislike/i,
    });
    await feedbackButton.click();
  }

  /**
   * Wait for success toast message
   */
  async waitForSuccessToast(message?: string): Promise<string> {
    const toast = this.page.locator('[data-sonner-toast][data-type="success"]');
    await toast.waitFor({ state: 'visible' });

    if (message) {
      await toast.filter({ hasText: message }).waitFor({ state: 'visible' });
    }

    const content = await toast.textContent();
    return content || 'Success';
  }

  /**
   * Check if loading state is shown
   */
  async isLoading(): Promise<boolean> {
    try {
      await this.page.locator('text=Loading chat...').waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }
}
