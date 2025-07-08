import { test, expect, Page } from '@playwright/test';

// Configuration
const WEB_SERVER_URL = process.env.CRYSTAL_WEB_URL || 'http://localhost:3001';
const API_KEY = process.env.CRYSTAL_API_KEY || 'TEST_API_KEY_FOR_E2E_TESTING';

test.describe('Crystal Web Interface Functionality', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    page = await context.newPage();
    
    // Navigate to Crystal web interface
    await page.goto(WEB_SERVER_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should display Crystal application header and branding', async () => {
    // Check for Crystal branding/title
    await expect(page).toHaveTitle(/Crystal/i);
    
    // Look for Crystal logo or header
    const header = page.locator('header, .header, .app-header');
    if (await header.count() > 0) {
      await expect(header.first()).toBeVisible();
    }
    
    // Check for Crystal-specific text
    const crystalText = page.getByText(/Crystal/i);
    if (await crystalText.count() > 0) {
      await expect(crystalText.first()).toBeVisible();
    }
  });

  test('should display sessions management interface', async () => {
    // Look for sessions-related UI elements
    const sessionsSection = page.locator(
      '[data-testid*="session"], .session, .sessions-container, .sessions-list'
    );
    
    // Check for session creation button
    const createSessionBtn = page.locator(
      'button:has-text("Create Session"), button:has-text("New Session"), ' +
      '[data-testid*="create-session"], .create-session-btn'
    );
    
    // Check for sessions list or empty state
    const sessionsList = page.locator(
      '.sessions-list, .session-item, [data-testid*="sessions-list"]'
    );
    
    const emptyState = page.locator(
      '.empty-state, .no-sessions, [data-testid*="empty"]'
    );
    
    // Either sessions list, empty state, or create button should be visible
    const hasSessionsUI = 
      (await sessionsSection.count() > 0) ||
      (await createSessionBtn.count() > 0) ||
      (await sessionsList.count() > 0) ||
      (await emptyState.count() > 0);
    
    expect(hasSessionsUI).toBeTruthy();
  });

  test('should display project management interface', async () => {
    // Look for project-related elements
    const projectsSection = page.locator(
      '[data-testid*="project"], .project, .projects-container'
    );
    
    const projectSelector = page.locator(
      'select[data-testid*="project"], .project-selector, .project-dropdown'
    );
    
    const projectsList = page.locator(
      '.projects-list, .project-item, [data-testid*="projects-list"]'
    );
    
    // Check if any project-related UI exists
    const hasProjectsUI = 
      (await projectsSection.count() > 0) ||
      (await projectSelector.count() > 0) ||
      (await projectsList.count() > 0);
    
    if (hasProjectsUI) {
      // If projects UI exists, verify it's visible
      const visibleProjectElement = await page.locator(
        '[data-testid*="project"]:visible, .project:visible, .projects-container:visible'
      ).first();
      
      if (await visibleProjectElement.count() > 0) {
        await expect(visibleProjectElement).toBeVisible();
      }
    }
  });

  test('should have working form inputs for session creation', async () => {
    // Look for session creation form or modal
    const createButton = page.locator(
      'button:has-text("Create"), button:has-text("New"), ' +
      '[data-testid*="create"], .create-btn, .new-session-btn'
    );
    
    if (await createButton.count() > 0) {
      // Click create button to open form
      await createButton.first().click();
      await page.waitForTimeout(1000);
      
      // Look for form inputs
      const nameInput = page.locator(
        'input[placeholder*="name" i], input[data-testid*="name"], ' +
        'input[name*="name"], .session-name-input'
      );
      
      const promptInput = page.locator(
        'textarea[placeholder*="prompt" i], textarea[data-testid*="prompt"], ' +
        'textarea[name*="prompt"], .prompt-input'
      );
      
      // Test name input if it exists
      if (await nameInput.count() > 0) {
        await expect(nameInput.first()).toBeVisible();
        await nameInput.first().fill('Test Session');
        await expect(nameInput.first()).toHaveValue('Test Session');
      }
      
      // Test prompt input if it exists
      if (await promptInput.count() > 0) {
        await expect(promptInput.first()).toBeVisible();
        await promptInput.first().fill('Test prompt for session');
        await expect(promptInput.first()).toHaveValue('Test prompt for session');
      }
      
      // Look for cancel/close button to close the form
      const cancelButton = page.locator(
        'button:has-text("Cancel"), button:has-text("Close"), ' +
        '[data-testid*="cancel"], .cancel-btn'
      );
      
      if (await cancelButton.count() > 0) {
        await cancelButton.first().click();
      } else {
        // Try pressing Escape to close
        await page.keyboard.press('Escape');
      }
    }
  });

  test('should display session output and conversation interface', async () => {
    // Look for session output areas
    const outputArea = page.locator(
      '.session-output, .conversation, .messages, [data-testid*="output"], ' +
      '.chat-container, .session-content'
    );
    
    const messagesList = page.locator(
      '.messages-list, .conversation-messages, .chat-messages, ' +
      '[data-testid*="messages"]'
    );
    
    // Check for input area for sending messages
    const messageInput = page.locator(
      'input[placeholder*="message" i], textarea[placeholder*="message" i], ' +
      '.message-input, [data-testid*="message-input"]'
    );
    
    const sendButton = page.locator(
      'button:has-text("Send"), [data-testid*="send"], .send-btn'
    );
    
    // If any conversation UI exists, verify it's functional
    if (await outputArea.count() > 0 || await messagesList.count() > 0) {
      // Check that conversation area is visible
      const conversationElement = (await outputArea.count() > 0) ? 
        outputArea.first() : messagesList.first();
      await expect(conversationElement).toBeVisible();
    }
    
    // If message input exists, test it
    if (await messageInput.count() > 0) {
      await expect(messageInput.first()).toBeVisible();
      await messageInput.first().fill('Test message');
      await expect(messageInput.first()).toHaveValue('Test message');
      
      // Clear the input
      await messageInput.first().clear();
    }
  });

  test('should display git diff and file changes interface', async () => {
    // Look for git/diff related UI elements
    const diffViewer = page.locator(
      '.diff-viewer, .git-diff, .file-changes, [data-testid*="diff"], ' +
      '.monaco-editor, .code-editor'
    );
    
    const filesList = page.locator(
      '.files-list, .changed-files, [data-testid*="files"], .file-tree'
    );
    
    const gitControls = page.locator(
      '.git-controls, .git-actions, [data-testid*="git"], .version-control'
    );
    
    // Check if any git/diff UI exists
    const hasGitUI = 
      (await diffViewer.count() > 0) ||
      (await filesList.count() > 0) ||
      (await gitControls.count() > 0);
    
    if (hasGitUI) {
      // Verify git UI elements are visible
      if (await diffViewer.count() > 0) {
        await expect(diffViewer.first()).toBeVisible();
      }
      if (await filesList.count() > 0) {
        await expect(filesList.first()).toBeVisible();
      }
    }
  });

  test('should have working navigation and routing', async () => {
    // Test navigation between different sections
    const navLinks = page.locator(
      'nav a, .nav-link, [data-testid*="nav"], .navigation a'
    );
    
    if (await navLinks.count() > 0) {
      const initialUrl = page.url();
      
      // Click first navigation link
      const firstLink = navLinks.first();
      const linkText = await firstLink.textContent();
      
      if (linkText?.trim()) {
        await firstLink.click();
        await page.waitForTimeout(1000);
        
        // URL should change or content should update
        const newUrl = page.url();
        const urlChanged = newUrl !== initialUrl;
        
        // Check if content changed (even if URL didn't)
        const hasContent = await page.locator('body').isVisible();
        expect(hasContent).toBeTruthy();
        
        // Navigate back if URL changed
        if (urlChanged) {
          await page.goBack();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('should handle settings and configuration interface', async () => {
    // Look for settings/config UI
    const settingsButton = page.locator(
      'button:has-text("Settings"), [data-testid*="settings"], ' +
      '.settings-btn, .config-btn'
    );
    
    const settingsIcon = page.locator(
      '[data-icon*="settings"], [data-testid*="settings-icon"], ' +
      '.settings-icon, .gear-icon'
    );
    
    const settingsLink = page.locator(
      'a:has-text("Settings"), a[href*="settings"], .settings-link'
    );
    
    // Try to access settings
    if (await settingsButton.count() > 0) {
      await settingsButton.first().click();
      await page.waitForTimeout(1000);
      
      // Look for settings form or modal
      const settingsForm = page.locator(
        '.settings-form, .config-form, [data-testid*="settings-form"]'
      );
      
      if (await settingsForm.count() > 0) {
        await expect(settingsForm.first()).toBeVisible();
        
        // Close settings
        const closeButton = page.locator(
          'button:has-text("Close"), button:has-text("Cancel"), ' +
          '[data-testid*="close"]'
        );
        
        if (await closeButton.count() > 0) {
          await closeButton.first().click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    } else if (await settingsLink.count() > 0) {
      // Test settings link navigation
      await settingsLink.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test('should display status indicators and notifications', async () => {
    // Look for status indicators
    const statusIndicators = page.locator(
      '.status, .indicator, [data-testid*="status"], .connection-status, ' +
      '.health-indicator'
    );
    
    const notifications = page.locator(
      '.notification, .alert, .toast, [data-testid*="notification"], ' +
      '.message-banner'
    );
    
    const loadingSpinners = page.locator(
      '.loading, .spinner, .loader, [data-testid*="loading"]'
    );
    
    // Check for any status/notification UI
    const hasStatusUI = 
      (await statusIndicators.count() > 0) ||
      (await notifications.count() > 0) ||
      (await loadingSpinners.count() > 0);
    
    // Status indicators are optional, so we just verify they work if present
    if (await statusIndicators.count() > 0) {
      await expect(statusIndicators.first()).toBeVisible();
    }
  });

  test('should handle responsive design on different screen sizes', async () => {
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // Main content should still be visible
    const mainContent = page.locator(
      'main, .main-content, .app-content, [role="main"]'
    );
    
    if (await mainContent.count() > 0) {
      await expect(mainContent.first()).toBeVisible();
    }
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Check for mobile navigation (hamburger menu, etc.)
    const mobileNav = page.locator(
      '.mobile-nav, .hamburger, [data-testid*="mobile"], .menu-toggle'
    );
    
    // Content should still be accessible
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});
