# Crystal Web Server Troubleshooting Guide

Common issues and solutions for Crystal web server functionality.

## 🔍 Diagnostic Commands

Before troubleshooting, run these commands to gather information:

```bash
# Check if Crystal web server is running
curl -I http://localhost:3001/health

# Check what's listening on port 3001
netstat -an | grep 3001

# Test API access
curl -H "X-API-Key: $CRYSTAL_API_KEY" http://localhost:3001/api/app/version
```

## 🚫 Common Issues

### 1. Web Server Won't Start

**Symptoms:**
- No web server startup message in Crystal logs
- Cannot access `http://localhost:3001`
- "Connection refused" errors

**Solutions:**

**Check Configuration:**
```bash
# Verify config file exists and is valid JSON
cat ~/.crystal/config.json | python -m json.tool
```

**Verify Configuration Format:**
```json
{
  "webServer": {
    "enabled": true,
    "port": 3001,
    "host": "0.0.0.0"
  }
}
```

**Check Port Availability:**
```bash
# See what's using port 3001
lsof -i :3001

# Try a different port if 3001 is busy
```

**Restart Crystal:**
1. Quit Crystal completely
2. Wait 5 seconds
3. Restart Crystal
4. Check logs for startup messages

### 2. Can't Access from Browser

**Symptoms:**
- "This site can't be reached" error
- Page doesn't load
- Timeout errors

**Solutions:**

**Check URL:**
- Use `http://localhost:3001` (not https)
- Verify port number matches configuration
- Try `http://127.0.0.1:3001` as an alternative

**Check the Firewall:**
```bash
# macOS - check if port is blocked
sudo pfctl -sr | grep 3001

# Linux - check ufw status
sudo ufw status

# Windows - check Windows Defender Firewall settings
```

**Test with curl:**
```bash
# This should return health status
curl http://localhost:3001/health
```

### 3. Can't Access from Other Devices

**Symptoms:**
- Works on localhost but not from other devices
- "Connection refused" from mobile/other computers
- Network timeout errors

**Solutions:**

**Check Host Configuration:**
```json
{
  "webServer": {
    "host": "0.0.0.0"  // NOT "localhost" or "127.0.0.1"
  }
}
```

**Find Your IP Address:**
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr "IPv4"
```

**Test Network Access:**
```bash
# From another device, replace YOUR_IP with actual IP
curl http://YOUR_IP:3001/health
```

**Check Network Connectivity:**
```bash
# From another device, test if port is reachable
telnet YOUR_IP 3001
```

### 4. Authentication Issues

**Symptoms:**
- 401 Unauthorized errors
- "Valid API key required" messages
- API calls fail with authentication errors

**Solutions:**

**Verify API Key Format:**
```bash
# Set your API key first
export CRYSTAL_API_KEY="your-actual-api-key"

# Correct header formats
curl -H "X-API-Key: $CRYSTAL_API_KEY" http://localhost:3001/api/sessions
curl -H "Authorization: Bearer $CRYSTAL_API_KEY" http://localhost:3001/api/sessions
```

**Check Configuration:**
```json
{
  "webServer": {
    "auth": {
      "enabled": true,
      "apiKey": "your-actual-api-key-here"
    }
  }
}
```

**Test Without Authentication:**
```json
{
  "webServer": {
    "auth": {
      "enabled": false
    }
  }
}
```

**Generate New API Key:**
```bash
# Generate a secure 32-character key
openssl rand -hex 32
```

### 5. CORS Errors

**Symptoms:**
- "CORS policy" errors in browser console
- "Access-Control-Allow-Origin" errors
- API calls fail from web applications

**Solutions:**

**Allow All Origins (Development):**
```json
{
  "webServer": {
    "cors": {
      "enabled": true,
      "origins": ["*"]
    }
  }
}
```

**Specific Origins (Production):**
```json
{
  "webServer": {
    "cors": {
      "enabled": true,
      "origins": [
        "http://localhost:3000",
        "https://yourdomain.com"
      ]
    }
  }
}
```

**Disable CORS (Not Recommended):**
```json
{
  "webServer": {
    "cors": {
      "enabled": false
    }
  }
}
```

### 6. API Endpoints Not Working

**Symptoms:**
- 404 Not Found errors
- API returns unexpected responses
- Endpoints return empty data

**Solutions:**

**Check Endpoint URLs:**
```bash
# Correct API endpoints
curl http://localhost:3001/api/sessions      # ✅ Correct
curl http://localhost:3001/sessions         # ❌ Wrong (missing /api)
```

**Verify Crystal State:**
- Ensure Crystal has projects configured
- Check that sessions exist before trying to access them
- Verify database is properly initialized

**Test Basic Endpoints:**
```bash
# These should always work
curl http://localhost:3001/health
curl -H "X-API-Key: key" http://localhost:3001/api/app/version
```

### 7. Performance Issues

**Symptoms:**
- Slow loading times
- Timeouts
- Unresponsive interface

**Solutions:**

**Check Network Speed:**
- Use WiFi instead of mobile data
- Test on local network first
- Consider network latency

**Browser Optimization:**
- Use Chrome or Firefox for best performance
- Clear browser cache
- Disable browser extensions
- Close other tabs

**Server Resources:**
- Ensure Crystal has sufficient memory
- Check CPU usage
- Close unnecessary applications

### 8. Mobile Access Issues

**Symptoms:**
- Interface doesn't display properly on mobile
- Touch controls don't work
- Keyboard issues

**Solutions:**

**Browser Compatibility:**
- Use Chrome, Safari, or Firefox on mobile
- Avoid older browser versions
- Enable JavaScript

**Network Connection:**
- Ensure mobile device is on the same WiFi network
- Check mobile data restrictions
- Test with different devices

**Interface Scaling:**
- Use browser zoom controls
- Rotate device for a better view
- Use landscape mode for complex operations

## 🔧 Advanced Troubleshooting

### Enable Debug Logging

Add to Crystal configuration:
```json
{
  "verbose": true,
  "webServer": {
    "enabled": true
  }
}
```

### Check Crystal Logs

**macOS/Linux:**
```bash
# Check Crystal log files
tail -f ~/.crystal/logs/crystal.log
```

**Windows:**
```cmd
# Check Crystal log files
type %USERPROFILE%\.crystal\logs\crystal.log
```

### Network Diagnostics

```bash
# Check if port is open
nmap -p 3001 localhost

# Check network route
traceroute YOUR_IP

# Test DNS resolution
nslookup YOUR_DOMAIN
```

### Process Diagnostics

```bash
# Check if Crystal is running
ps aux | grep -i crystal

# Check memory usage
top | grep -i crystal

# Check open files
lsof -p CRYSTAL_PID
```

## 🆘 Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide**
2. **Run the test script**: `node examples/test-web-server.js`
3. **Gather diagnostic information**:
   - Crystal version
   - Operating system
   - Configuration file contents
   - Error messages
   - Network setup

### Information to Include

When reporting issues, include:

```bash
# Crystal version
Crystal --version

# Operating system
uname -a  # macOS/Linux
systeminfo  # Windows

# Network configuration
ifconfig  # macOS/Linux
ipconfig  # Windows

# Configuration (remove sensitive data)
cat ~/.crystal/config.json
```

### Test Script Output

Run the test script and include the output:
```bash
cd crystal
node examples/test-web-server.js
```

### Log Files

Include relevant log entries:
```bash
# Last 50 lines of Crystal logs
tail -50 ~/.crystal/logs/crystal.log
```

## 📋 Checklist for Common Issues

### ✅ Web Server Won't Start
- [ ] Configuration file exists and is valid JSON
- [ ] `webServer.enabled` is set to `true`
- [ ] Port 3001 is not in use by another application
- [ ] Crystal has been restarted after configuration changes

### ✅ Can't Access Locally
- [ ] Using `http://` not `https://`
- [ ] Correct port number (default: 3001)
- [ ] Crystal web server startup message appeared
- [ ] Firewall allows local connections

### ✅ Can't Access from Network
- [ ] `host` is set to `"0.0.0.0"` in the configuration
- [ ] Computer's IP address is correct
- [ ] Devices are on the same network
- [ ] Firewall allows incoming connections on port 3001

### ✅ Authentication Problems
- [ ] API key is correctly configured
- [ ] Using correct header format
- [ ] API key matches configuration
- [ ] Authentication is enabled in configuration

### ✅ API Issues
- [ ] Using correct endpoint URLs (`/api/...`)
- [ ] Including authentication headers
- [ ] Crystal has data to return (projects, sessions)
- [ ] Request format is correct (JSON for POST requests)

---

**Still having issues? Check the [full documentation](WEB_SERVER_SETUP.md) or create an issue on GitHub with the diagnostic information above.**
