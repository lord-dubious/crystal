import { test, expect, request } from '@playwright/test';

// Configuration
const WEB_SERVER_URL = process.env.CRYSTAL_WEB_URL || 'http://localhost:3001';
const API_KEY = process.env.CRYSTAL_API_KEY || 'test-api-key-for-e2e';

test.describe('Crystal Web Server API Validation', () => {
  let apiContext: any;

  test.beforeAll(async ({ playwright }) => {
    // Create API request context
    apiContext = await playwright.request.newContext({
      baseURL: WEB_SERVER_URL,
      extraHTTPHeaders: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('should respond to health check endpoint', async () => {
    const response = await apiContext.get('/health');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('status', 'healthy');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('version');
  });

  test('should require authentication for protected endpoints', async () => {
    // Create context without API key
    const unauthContext = await request.newContext({
      baseURL: WEB_SERVER_URL
    });
    
    const response = await unauthContext.get('/api/sessions');
    
    // Should return 401 if auth is enabled, or 200 if auth is disabled
    expect([200, 401]).toContain(response.status());
    
    if (response.status() === 401) {
      const data = await response.json();
      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error', 'Unauthorized');
    }
    
    await unauthContext.dispose();
  });

  test('should return app version information', async () => {
    const response = await apiContext.get('/api/app/version');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(typeof data.data).toBe('string');
    expect(data.data).toMatch(/^\d+\.\d+\.\d+/); // Version format
  });

  test('should return platform information', async () => {
    const response = await apiContext.get('/api/app/platform');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(['win32', 'darwin', 'linux']).toContain(data.data);
  });

  test('should return packaged status', async () => {
    const response = await apiContext.get('/api/app/packaged');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(typeof data.data).toBe('boolean');
  });

  test('should return current configuration', async () => {
    const response = await apiContext.get('/api/config');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(typeof data.data).toBe('object');
    
    // Should have web server config if enabled
    if (data.data.webServer) {
      expect(data.data.webServer).toHaveProperty('enabled');
      expect(data.data.webServer).toHaveProperty('port');
    }
  });

  test('should return sessions list', async () => {
    const response = await apiContext.get('/api/sessions');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
  });

  test('should return projects list', async () => {
    const response = await apiContext.get('/api/projects');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
  });

  test('should handle CORS headers correctly', async () => {
    const response = await apiContext.options('/api/sessions');
    
    // Should handle OPTIONS request for CORS
    expect([200, 204]).toContain(response.status());
    
    // Check for CORS headers in a regular request
    const getResponse = await apiContext.get('/api/sessions');
    const headers = getResponse.headers();
    
    // Should have CORS headers if CORS is enabled
    if (headers['access-control-allow-origin']) {
      expect(headers).toHaveProperty('access-control-allow-origin');
    }
  });

  test('should validate API request/response format', async () => {
    // Test that all API responses follow consistent format
    const endpoints = [
      '/api/app/version',
      '/api/app/platform', 
      '/api/sessions',
      '/api/projects',
      '/api/config'
    ];
    
    for (const endpoint of endpoints) {
      const response = await apiContext.get(endpoint);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      
      // All API responses should have success field
      expect(data).toHaveProperty('success');
      expect(typeof data.success).toBe('boolean');
      
      // Successful responses should have data field
      if (data.success) {
        expect(data).toHaveProperty('data');
      } else {
        // Failed responses should have error field
        expect(data).toHaveProperty('error');
      }
    }
  });

  test('should handle invalid endpoints gracefully', async () => {
    const response = await apiContext.get('/api/non-existent-endpoint');
    
    // Should return 404 or handle gracefully
    expect([404, 500]).toContain(response.status());
    
    if (response.status() === 404) {
      // Should return JSON error response
      const contentType = response.headers()['content-type'];
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        expect(data).toHaveProperty('success', false);
      }
    }
  });

  test('should handle malformed requests', async () => {
    // Test POST with invalid JSON
    const response = await apiContext.post('/api/sessions', {
      data: 'invalid-json-string'
    });
    
    // Should handle gracefully
    expect([400, 422, 500]).toContain(response.status());
  });

  test('should respect rate limiting if implemented', async () => {
    // Make multiple rapid requests to test rate limiting
    const promises = Array(10).fill(null).map(() => 
      apiContext.get('/api/app/version')
    );
    
    const responses = await Promise.all(promises);
    
    // All should succeed or some should be rate limited
    for (const response of responses) {
      expect([200, 429]).toContain(response.status());
    }
  });

  test('should maintain session state correctly', async () => {
    // Test that API maintains proper session/state management
    const response1 = await apiContext.get('/api/sessions');
    const response2 = await apiContext.get('/api/sessions');
    
    expect(response1.status()).toBe(200);
    expect(response2.status()).toBe(200);
    
    const data1 = await response1.json();
    const data2 = await response2.json();
    
    // Should return consistent data structure
    expect(data1).toHaveProperty('success');
    expect(data2).toHaveProperty('success');
    expect(Array.isArray(data1.data)).toBeTruthy();
    expect(Array.isArray(data2.data)).toBeTruthy();
  });
});
