# Crystal Web Server E2E Testing Guide

Comprehensive testing suite for Crystal's web server functionality using Playwright.

## 🎯 Overview

This testing suite validates that Crystal's web interface works correctly across different browsers and devices, ensuring all UI components function properly when accessed remotely.

## 📋 Test Coverage

### UI Component Tests (`crystal-web-functionality.spec.ts`)
- ✅ **Application Loading**: Verifies Crystal loads correctly in web browsers
- ✅ **Navigation**: Tests routing and navigation between sections
- ✅ **Session Management**: Validates session creation, listing, and interaction
- ✅ **Project Management**: Tests project selection and management UI
- ✅ **Form Inputs**: Verifies all form fields work correctly
- ✅ **Responsive Design**: Tests mobile and tablet compatibility
- ✅ **Accessibility**: Checks keyboard navigation and ARIA attributes

### General UI Tests (`web-server-ui.spec.ts`)
- ✅ **Component Visibility**: Ensures all UI elements render correctly
- ✅ **Interactive Elements**: Tests buttons, inputs, and controls
- ✅ **Loading States**: Validates loading indicators and error handling
- ✅ **Browser Compatibility**: Tests across Chrome, Firefox, Safari
- ✅ **Performance**: Checks page load times and responsiveness

### API Validation Tests (`web-server-api.spec.ts`)
- ✅ **Health Checks**: Validates server health endpoint
- ✅ **Authentication**: Tests API key authentication
- ✅ **Endpoint Coverage**: Validates all API endpoints
- ✅ **Error Handling**: Tests error responses and edge cases
- ✅ **CORS Configuration**: Validates cross-origin requests
- ✅ **Data Consistency**: Ensures API responses are consistent

## 🚀 Quick Start

### Prerequisites
1. **Crystal with Web Server**: Crystal must be running with web server enabled
2. **Playwright**: Install Playwright dependencies
3. **Configuration**: Set up test configuration

### Installation
```bash
# Install Playwright
npm install -D @playwright/test

# Install browser dependencies
npx playwright install
```

### Basic Test Run
```bash
# Run all web server tests
npm run test:web-server

# Or use the test runner script
node scripts/test-web-server.js
```

## 🔧 Configuration

### Environment Variables
```bash
# Web server URL (default: http://localhost:3001)
export CRYSTAL_WEB_URL="http://localhost:3001"

# API key for authentication
export CRYSTAL_API_KEY="your-test-api-key"

# Crystal config path (optional)
export CRYSTAL_CONFIG_PATH="~/.crystal/config.json"

# Anthropic API key (for Crystal functionality)
export ANTHROPIC_API_KEY="your-anthropic-key"
```

### Crystal Configuration
Ensure Crystal is configured with web server enabled:

```json
{
  "anthropicApiKey": "your-anthropic-key",
  "webServer": {
    "enabled": true,
    "port": 3001,
    "host": "0.0.0.0",
    "cors": {
      "enabled": true,
      "origins": ["*"]
    },
    "auth": {
      "enabled": true,
      "apiKey": "your-test-api-key"
    }
  }
}
```

## 🧪 Running Tests

### Using the Test Runner Script

**Automatic Setup and Run:**
```bash
# Start Crystal and run tests automatically
node scripts/test-web-server.js --start-crystal --setup-config
```

**Run Against Existing Crystal Instance:**
```bash
# Crystal must already be running with web server enabled
node scripts/test-web-server.js
```

**Specific Test Patterns:**
```bash
# Run only session-related tests
node scripts/test-web-server.js --grep="session"

# Run only API tests
node scripts/test-web-server.js --grep="API"
```

**Different Browsers:**
```bash
# Run in Firefox
node scripts/test-web-server.js --browser=web-server-firefox

# Run mobile tests
node scripts/test-web-server.js --browser=web-server-mobile
```

### Using Playwright Directly

**All Web Server Tests:**
```bash
npx playwright test --project=web-server-chrome
```

**Specific Test Files:**
```bash
# UI functionality tests
npx playwright test tests/e2e/crystal-web-functionality.spec.ts

# API validation tests
npx playwright test tests/e2e/web-server-api.spec.ts

# General UI tests
npx playwright test tests/e2e/web-server-ui.spec.ts
```

**Multiple Browsers:**
```bash
# Chrome and Firefox
npx playwright test --project=web-server-chrome --project=web-server-firefox

# Include mobile
npx playwright test --project=web-server-chrome --project=web-server-mobile
```

**Debug Mode:**
```bash
# Run with browser visible
npx playwright test --headed --project=web-server-chrome

# Debug specific test
npx playwright test --debug tests/e2e/crystal-web-functionality.spec.ts
```

## 📊 Test Reports

### HTML Report
```bash
# Generate and open HTML report
npx playwright show-report
```

### JSON Report
```bash
# Generate JSON report
npx playwright test --reporter=json --output-file=test-results/results.json
```

### Custom Reporting
```bash
# Multiple reporters
npx playwright test --reporter=list,html,json
```

## 🔍 Debugging Tests

### Visual Debugging
```bash
# Run with browser visible
npx playwright test --headed

# Slow motion for better visibility
npx playwright test --headed --slowMo=1000
```

### Screenshots and Videos
```bash
# Take screenshots on failure
npx playwright test --screenshot=only-on-failure

# Record videos
npx playwright test --video=retain-on-failure
```

### Trace Viewer
```bash
# Generate traces
npx playwright test --trace=on

# View traces
npx playwright show-trace trace.zip
```

## 🛠️ Troubleshooting

### Common Issues

**Crystal Not Running:**
```bash
# Error: Server not ready after 30 attempts
# Solution: Start Crystal with web server enabled
```

**Authentication Errors:**
```bash
# Error: 401 Unauthorized
# Solution: Check API key in environment variables
export CRYSTAL_API_KEY="your-actual-api-key"
```

**Port Conflicts:**
```bash
# Error: Port 3001 already in use
# Solution: Change port in Crystal config or use different URL
export CRYSTAL_WEB_URL="http://localhost:3002"
```

**Browser Installation:**
```bash
# Error: Browser not found
# Solution: Install Playwright browsers
npx playwright install
```

### Debug Commands

**Check Server Health:**
```bash
curl http://localhost:3001/health
```

**Test API Access:**
```bash
curl -H "X-API-Key: your-key" http://localhost:3001/api/app/version
```

**Validate Configuration:**
```bash
cat ~/.crystal/config.json | python -m json.tool
```

## 📝 Writing Custom Tests

### Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('My Custom Tests', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.my-element')).toBeVisible();
  });
});
```

### API Testing
```typescript
test('should test API endpoint', async ({ request }) => {
  const response = await request.get('/api/my-endpoint', {
    headers: { 'X-API-Key': process.env.CRYSTAL_API_KEY }
  });
  expect(response.status()).toBe(200);
});
```

### Best Practices
- Use data-testid attributes for reliable element selection
- Test user workflows, not just individual components
- Include both positive and negative test cases
- Test responsive design on different screen sizes
- Validate accessibility features

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
name: Web Server E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Start Crystal with web server
        run: |
          node scripts/test-web-server.js --setup-config &
          sleep 30
        env:
          CRYSTAL_API_KEY: ${{ secrets.CRYSTAL_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      
      - name: Run E2E tests
        run: npx playwright test --project=web-server-chrome
        env:
          CRYSTAL_WEB_URL: http://localhost:3001
          CRYSTAL_API_KEY: ${{ secrets.CRYSTAL_API_KEY }}
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📈 Performance Testing

### Load Testing
```bash
# Test multiple concurrent users
npx playwright test --workers=4 tests/e2e/web-server-api.spec.ts
```

### Metrics Collection
```typescript
test('should measure page load time', async ({ page }) => {
  const start = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - start;
  
  expect(loadTime).toBeLessThan(5000); // 5 seconds max
});
```

---

**🎉 Ready to test! Your Crystal web server UI components are now thoroughly validated across browsers and devices.**
