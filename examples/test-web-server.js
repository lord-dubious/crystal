#!/usr/bin/env node

/**
 * Test script for Crystal Web Server functionality
 * 
 * This script tests the web server API endpoints to ensure they work correctly.
 * Run this after starting Crystal with web server enabled.
 */

const http = require('http');

const API_BASE = 'http://localhost:3001';

// Allow API key to be set via environment variable or command-line argument
function getApiKey() {
  // 1. Check command-line arguments
  const argKey = process.argv.find(arg => arg.startsWith('--api-key='));
  if (argKey) {
    return argKey.split('=')[1];
  }
  // 2. Check environment variable
  if (process.env.CRYSTAL_API_KEY) {
    return process.env.CRYSTAL_API_KEY;
  }
  // 3. Fallback to placeholder (warn user)
  console.warn('Warning: Using default API key. Set CRYSTAL_API_KEY env or use --api-key argument.');
  return 'your-api-key-here';
}
const API_KEY = getApiKey();

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('🔍 Testing health check...');
  try {
    const response = await makeRequest('GET', '/health');
    if (response.status === 200 && response.data.success) {
      console.log('✅ Health check passed');
      return true;
    } else {
      console.log('❌ Health check failed:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

async function testAppInfo() {
  console.log('🔍 Testing app info endpoints...');
  try {
    const version = await makeRequest('GET', '/api/app/version');
    const platform = await makeRequest('GET', '/api/app/platform');
    const packaged = await makeRequest('GET', '/api/app/packaged');

    if (version.status === 200 && platform.status === 200 && packaged.status === 200) {
      console.log('✅ App info endpoints working');
      console.log(`   Version: ${version.data.data}`);
      console.log(`   Platform: ${platform.data.data}`);
      console.log(`   Packaged: ${packaged.data.data}`);
      return true;
    } else {
      console.log('❌ App info endpoints failed');
      return false;
    }
  } catch (error) {
    console.log('❌ App info error:', error.message);
    return false;
  }
}

async function testConfig() {
  console.log('🔍 Testing config endpoint...');
  try {
    const response = await makeRequest('GET', '/api/config');
    if (response.status === 200 && response.data.success) {
      console.log('✅ Config endpoint working');
      console.log(`   Web server enabled: ${response.data.data.webServer?.enabled || false}`);
      return true;
    } else {
      console.log('❌ Config endpoint failed:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Config error:', error.message);
    return false;
  }
}

async function testProjects() {
  console.log('🔍 Testing projects endpoint...');
  try {
    const response = await makeRequest('GET', '/api/projects');
    if (response.status === 200 && response.data.success) {
      console.log('✅ Projects endpoint working');
      console.log(`   Found ${response.data.data.length} projects`);
      return true;
    } else {
      console.log('❌ Projects endpoint failed:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Projects error:', error.message);
    return false;
  }
}

async function testSessions() {
  console.log('🔍 Testing sessions endpoint...');
  try {
    const response = await makeRequest('GET', '/api/sessions');
    if (response.status === 200 && response.data.success) {
      console.log('✅ Sessions endpoint working');
      console.log(`   Found ${response.data.data.length} sessions`);
      return true;
    } else {
      console.log('❌ Sessions endpoint failed:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Sessions error:', error.message);
    return false;
  }
}

async function testAuthentication() {
  console.log('🔍 Testing authentication...');
  try {
    // Test without API key
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/sessions',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
        // No API key
      }
    };

    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      });
      req.on('error', reject);
      req.end();
    });

    if (response.status === 401) {
      console.log('✅ Authentication working (unauthorized without API key)');
      return true;
    } else if (response.status === 200) {
      console.log('⚠️  Authentication disabled (no API key required)');
      return true;
    } else {
      console.log('❌ Authentication test failed:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Crystal Web Server API Tests\n');

  const tests = [
    testHealthCheck,
    testAuthentication,
    testAppInfo,
    testConfig,
    testProjects,
    testSessions
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) passed++;
    } catch (error) {
      console.log('❌ Test error:', error.message);
    }
    console.log(''); // Empty line between tests
  }

  console.log('📊 Test Results:');
  console.log(`   Passed: ${passed}/${total}`);
  console.log(`   Success Rate: ${Math.round((passed / total) * 100)}%`);

  if (passed === total) {
    console.log('🎉 All tests passed! Crystal Web Server is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the configuration and try again.');
    process.exit(1);
  }
}

// Check if server is running
async function checkServerRunning() {
  try {
    await makeRequest('GET', '/health');
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('Checking if Crystal Web Server is running...');
  
  const isRunning = await checkServerRunning();
  if (!isRunning) {
    console.log('❌ Crystal Web Server is not running on http://localhost:3001');
    console.log('');
    console.log('To start Crystal with web server:');
    console.log('1. Add web server configuration to ~/.crystal/config.json');
    console.log('2. Start Crystal normally');
    console.log('');
    console.log('Example config:');
    console.log(JSON.stringify({
      webServer: {
        enabled: true,
        port: 3001,
        host: "0.0.0.0",
        auth: {
          enabled: true,
          apiKey: "your-api-key-here"
        }
      }
    }, null, 2));
    process.exit(1);
  }

  await runTests();
}

main().catch(console.error);
