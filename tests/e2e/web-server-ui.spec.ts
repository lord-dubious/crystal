import { test, expect, Page, BrowserContext } from '@playwright/test';

// Configuration for the tests
const WEB_SERVER_URL = process.env.CRYSTAL_WEB_URL || 'http://localhost:3001';
const API_KEY = process.env.CRYSTAL_API_KEY || 'test-api-key-for-e2e';

// Test configuration
test.describe.configure({ mode: 'serial' });

test.describe('Crystal Web Server UI Components', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    // Create a new browser context for all tests
    context = await browser.newContext({
      // Set viewport for consistent testing
      viewport: { width: 1280, height: 720 },
      // Add any additional context options
      ignoreHTTPSErrors: true,
    });
    
    page = await context.newPage();
    
    // Navigate to the Crystal web interface
    await page.goto(WEB_SERVER_URL);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('should load the Crystal web interface', async () => {
    // Check that the page loads successfully
    await expect(page).toHaveTitle(/Crystal/i);
    
    // Wait for the main application to load
    await page.waitForLoadState('networkidle');
    
    // Check for main application container
    const appContainer = page.locator('[data-testid="app-container"], .app, #app, #root');
    await expect(appContainer.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display the main navigation', async () => {
    // Check for navigation elements
    const navigation = page.locator('nav, [role="navigation"], .navigation, .nav-bar');
    await expect(navigation.first()).toBeVisible();
    
    // Check for common navigation items
    const navItems = [
      'Sessions',
      'Projects', 
      'Settings',
      'Dashboard'
    ];
    
    for (const item of navItems) {
      const navItem = page.getByText(item, { exact: false });
      if (await navItem.count() > 0) {
        await expect(navItem.first()).toBeVisible();
      }
    }
  });

  test('should display sessions list/dashboard', async () => {
    // Look for sessions-related content
    const sessionsContent = page.locator(
      '[data-testid*="session"], .session, .sessions-list, .dashboard'
    );
    
    // Should have some sessions-related UI element
    await expect(sessionsContent.first()).toBeVisible({ timeout: 5000 });
    
    // Check for session creation button or similar
    const createButton = page.locator(
      'button:has-text("Create"), button:has-text("New"), [data-testid*="create"]'
    );
    
    if (await createButton.count() > 0) {
      await expect(createButton.first()).toBeVisible();
    }
  });

  test('should have working form inputs', async () => {
    // Look for input fields
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      // Test the first few inputs
      for (let i = 0; i < Math.min(3, inputCount); i++) {
        const input = inputs.nth(i);
        const inputType = await input.getAttribute('type');
        
        // Skip hidden, submit, and button inputs
        if (!inputType || !['hidden', 'submit', 'button'].includes(inputType)) {
          await expect(input).toBeVisible();
          
          // Test that input is interactive
          if (inputType === 'text' || !inputType) {
            await input.click();
            await input.fill('test input');
            await expect(input).toHaveValue('test input');
            await input.clear();
          }
        }
      }
    }
  });

  test('should have working buttons', async () => {
    // Find all buttons
    const buttons = page.locator('button:visible');
    const buttonCount = await buttons.count();
    
    expect(buttonCount).toBeGreaterThan(0);
    
    // Test that buttons are clickable (without actually clicking to avoid side effects)
    for (let i = 0; i < Math.min(3, buttonCount); i++) {
      const button = buttons.nth(i);
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
    }
  });

  test('should display project-related UI elements', async () => {
    // Look for project-related content
    const projectElements = page.locator(
      '[data-testid*="project"], .project, .projects-list'
    );
    
    // Check if projects section exists
    if (await projectElements.count() > 0) {
      await expect(projectElements.first()).toBeVisible();
    }
    
    // Look for project selection or creation UI
    const projectControls = page.locator(
      'select:has(option), .project-selector, [data-testid*="project-select"]'
    );
    
    if (await projectControls.count() > 0) {
      await expect(projectControls.first()).toBeVisible();
    }
  });

  test('should have responsive design elements', async () => {
    // Test responsive behavior
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet size
    await page.waitForTimeout(500); // Wait for responsive changes
    
    // Check that content is still visible
    const mainContent = page.locator('main, .main-content, [role="main"]');
    if (await mainContent.count() > 0) {
      await expect(mainContent.first()).toBeVisible();
    }
    
    // Test mobile size
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile size
    await page.waitForTimeout(500);
    
    // Content should still be accessible
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Reset to desktop size
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should handle loading states', async () => {
    // Reload page to test loading states
    await page.reload();
    
    // Check for loading indicators
    const loadingIndicators = page.locator(
      '.loading, .spinner, [data-testid*="loading"], .loader'
    );
    
    // Loading indicators might appear briefly
    if (await loadingIndicators.count() > 0) {
      // Wait for loading to complete
      await expect(loadingIndicators.first()).toBeHidden({ timeout: 10000 });
    }
    
    // Ensure page is fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should display error handling UI', async () => {
    // Test error states by navigating to a non-existent route
    await page.goto(`${WEB_SERVER_URL}/non-existent-route`);
    
    // Should either show 404 page or redirect to main app
    const errorElements = page.locator(
      '.error, .not-found, [data-testid*="error"], .error-message'
    );
    
    const mainApp = page.locator(
      '[data-testid="app-container"], .app, #app, #root'
    );
    
    // Either error page or main app should be visible
    const hasError = await errorElements.count() > 0;
    const hasMainApp = await mainApp.count() > 0;
    
    expect(hasError || hasMainApp).toBeTruthy();
    
    // Navigate back to main page
    await page.goto(WEB_SERVER_URL);
  });

  test('should have accessible UI elements', async () => {
    // Check for accessibility attributes
    const elementsWithLabels = page.locator('[aria-label], [aria-labelledby]');
    const elementsWithRoles = page.locator('[role]');
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    
    // Should have some accessible elements
    const accessibleElementsCount = 
      (await elementsWithLabels.count()) + 
      (await elementsWithRoles.count()) + 
      (await headings.count());
    
    expect(accessibleElementsCount).toBeGreaterThan(0);
    
    // Check for proper heading structure
    if (await headings.count() > 0) {
      await expect(headings.first()).toBeVisible();
    }
  });

  test('should handle keyboard navigation', async () => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check that focus moves to interactive elements
    const focusedElement = page.locator(':focus');
    if (await focusedElement.count() > 0) {
      await expect(focusedElement).toBeVisible();
    }
    
    // Test escape key (should not cause errors)
    await page.keyboard.press('Escape');
    
    // Test enter key on focused element (should not cause errors)
    const interactiveElements = page.locator('button:visible, a:visible, input:visible');
    if (await interactiveElements.count() > 0) {
      await interactiveElements.first().focus();
      // Note: We don't press Enter to avoid triggering actions
    }
  });

  test('should display consistent styling', async () => {
    // Check for CSS loading
    const body = page.locator('body');
    const bodyStyles = await body.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        fontFamily: styles.fontFamily,
        backgroundColor: styles.backgroundColor,
        color: styles.color
      };
    });
    
    // Should have some styling applied
    expect(bodyStyles.fontFamily).not.toBe('');
    
    // Check that main content has proper styling
    const mainContent = page.locator('main, .main-content, [role="main"], .app');
    if (await mainContent.count() > 0) {
      const contentStyles = await mainContent.first().evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          display: styles.display,
          position: styles.position
        };
      });
      
      expect(contentStyles.display).not.toBe('none');
    }
  });

  test('should handle browser back/forward navigation', async () => {
    const initialUrl = page.url();
    
    // Try to navigate to a different section if possible
    const navLinks = page.locator('a[href]:visible');
    if (await navLinks.count() > 0) {
      const firstLink = navLinks.first();
      const href = await firstLink.getAttribute('href');
      
      if (href && !href.startsWith('http') && href !== '#') {
        await firstLink.click();
        await page.waitForTimeout(1000);
        
        // Go back
        await page.goBack();
        await page.waitForTimeout(1000);
        
        // Should be back to initial state
        expect(page.url()).toBe(initialUrl);
        
        // Go forward
        await page.goForward();
        await page.waitForTimeout(1000);
      }
    }
  });
});
