#!/usr/bin/env node

/**
 * Crystal Web Server E2E Test Runner
 * 
 * This script helps run E2E tests for Crystal's web server functionality.
 * It can optionally start Crystal with web server enabled, run the tests,
 * and then clean up.
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const WEB_SERVER_URL = process.env.CRYSTAL_WEB_URL || 'http://localhost:3001';
const API_KEY = process.env.CRYSTAL_API_KEY || 'test-api-key-for-e2e';
const CRYSTAL_CONFIG_PATH = process.env.CRYSTAL_CONFIG_PATH || path.join(require('os').homedir(), '.crystal', 'config.json');

// Command line arguments
const args = process.argv.slice(2);
const shouldStartCrystal = args.includes('--start-crystal');
const shouldSetupConfig = args.includes('--setup-config');
const testPattern = args.find(arg => arg.startsWith('--grep='))?.split('=')[1];
const browser = args.find(arg => arg.startsWith('--browser='))?.split('=')[1] || 'web-server-chrome';

console.log('🌐 Crystal Web Server E2E Test Runner');
console.log('=====================================');

// Helper functions
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

function checkServerHealth(url) {
  return new Promise((resolve) => {
    const http = require('http');
    const urlObj = new URL(url + '/health');
    
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function waitForServer(url, maxAttempts = 30) {
  console.log(`⏳ Waiting for server at ${url}...`);
  
  for (let i = 0; i < maxAttempts; i++) {
    const isHealthy = await checkServerHealth(url);
    if (isHealthy) {
      console.log(`✅ Server is ready at ${url}`);
      return true;
    }
    
    process.stdout.write('.');
    await sleep(2000);
  }
  
  console.log(`\n❌ Server not ready after ${maxAttempts} attempts`);
  return false;
}

function setupTestConfig() {
  console.log('🔧 Setting up test configuration...');
  
  const configDir = path.dirname(CRYSTAL_CONFIG_PATH);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  const testConfig = {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || 'test-key',
    webServer: {
      enabled: true,
      port: 3001,
      host: '0.0.0.0',
      cors: {
        enabled: true,
        origins: ['*']
      },
      auth: {
        enabled: true,
        apiKey: API_KEY
      }
    },
    defaultPermissionMode: 'ignore',
    verbose: true
  };
  
  // Backup existing config if it exists
  if (fs.existsSync(CRYSTAL_CONFIG_PATH)) {
    const backupPath = CRYSTAL_CONFIG_PATH + '.backup.' + Date.now();
    fs.copyFileSync(CRYSTAL_CONFIG_PATH, backupPath);
    console.log(`📋 Backed up existing config to ${backupPath}`);
  }
  
  fs.writeFileSync(CRYSTAL_CONFIG_PATH, JSON.stringify(testConfig, null, 2));
  console.log(`✅ Test configuration written to ${CRYSTAL_CONFIG_PATH}`);
}

async function runTests() {
  console.log('🧪 Running E2E tests...');
  
  const playwrightArgs = [
    'test',
    '--project', browser
  ];
  
  if (testPattern) {
    playwrightArgs.push('--grep', testPattern);
  }
  
  // Add environment variables
  const env = {
    ...process.env,
    CRYSTAL_WEB_URL: WEB_SERVER_URL,
    CRYSTAL_API_KEY: API_KEY
  };
  
  try {
    await runCommand('npx', ['playwright', ...playwrightArgs], { env });
    console.log('✅ Tests completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Tests failed:', error.message);
    return false;
  }
}

async function main() {
  try {
    // Setup test configuration if requested
    if (shouldSetupConfig) {
      setupTestConfig();
    }
    
    let crystalProcess = null;
    
    // Start Crystal if requested
    if (shouldStartCrystal) {
      console.log('🚀 Starting Crystal with web server...');
      
      // Start Crystal in background
      crystalProcess = spawn('pnpm', ['electron-dev'], {
        stdio: 'pipe',
        detached: true
      });
      
      // Wait for web server to be ready
      const serverReady = await waitForServer(WEB_SERVER_URL);
      if (!serverReady) {
        throw new Error('Failed to start Crystal web server');
      }
    } else {
      // Check if server is already running
      console.log('🔍 Checking if Crystal web server is running...');
      const serverReady = await checkServerHealth(WEB_SERVER_URL);
      if (!serverReady) {
        console.log('❌ Crystal web server is not running');
        console.log('');
        console.log('To start Crystal with web server:');
        console.log('1. Enable web server in your Crystal config');
        console.log('2. Start Crystal normally, or');
        console.log('3. Run this script with --start-crystal flag');
        console.log('');
        console.log('Example config:');
        console.log(JSON.stringify({
          webServer: {
            enabled: true,
            port: 3001,
            auth: { enabled: true, apiKey: 'your-api-key' }
          }
        }, null, 2));
        process.exit(1);
      }
      console.log('✅ Crystal web server is running');
    }
    
    // Run the tests
    const testsSucceeded = await runTests();
    
    // Cleanup
    if (crystalProcess) {
      console.log('🧹 Stopping Crystal...');
      crystalProcess.kill('SIGTERM');
      
      // Wait a bit for graceful shutdown
      await sleep(3000);
      
      // Force kill if still running
      try {
        process.kill(crystalProcess.pid, 'SIGKILL');
      } catch (e) {
        // Process already dead
      }
    }
    
    // Exit with appropriate code
    process.exit(testsSucceeded ? 0 : 1);
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

// Help text
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node scripts/test-web-server.js [options]

Options:
  --start-crystal     Start Crystal with web server before running tests
  --setup-config      Create test configuration file
  --grep=<pattern>    Run only tests matching pattern
  --browser=<name>    Browser project to use (default: web-server-chrome)
                      Options: web-server-chrome, web-server-firefox, web-server-mobile
  --help, -h          Show this help

Environment Variables:
  CRYSTAL_WEB_URL     Web server URL (default: http://localhost:3001)
  CRYSTAL_API_KEY     API key for authentication (default: test-api-key-for-e2e)
  CRYSTAL_CONFIG_PATH Config file path (default: ~/.crystal/config.json)
  ANTHROPIC_API_KEY   Anthropic API key for Crystal

Examples:
  # Run tests against existing Crystal instance
  node scripts/test-web-server.js
  
  # Start Crystal and run tests
  node scripts/test-web-server.js --start-crystal --setup-config
  
  # Run specific test pattern
  node scripts/test-web-server.js --grep="session creation"
  
  # Run tests in Firefox
  node scripts/test-web-server.js --browser=web-server-firefox
  
  # Run mobile tests
  node scripts/test-web-server.js --browser=web-server-mobile
`);
  process.exit(0);
}

// Run main function
main().catch(console.error);
