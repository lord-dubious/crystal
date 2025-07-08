# Crystal Web Server - Quick Start Guide

Get Crystal running as a web server in 5 minutes!

## 🚀 Quick Setup (5 minutes)

### Step 1: Enable Web Server (1 minute)

Create or edit your Crystal config file:

**Location**: `~/.crystal/config.json` (macOS/Linux) or `%USERPROFILE%\.crystal\config.json` (Windows)

**Basic Configuration** (no authentication):
```json
{
  "anthropicApiKey": "YOUR_ANTHROPIC_API_KEY_HERE",
  "webServer": {
    "enabled": true,
    "port": 3001,
    "host": "0.0.0.0"
  }
}
```

**Secure Configuration** (with authentication):
```json
{
  "anthropicApiKey": "YOUR_ANTHROPIC_API_KEY_HERE",
  "webServer": {
    "enabled": true,
    "port": 3001,
    "host": "0.0.0.0",
    "auth": {
      "enabled": true,
      "apiKey": "YOUR_SECURE_API_KEY_HERE"
    }
  }
}
```

### Step 2: Start Crystal (1 minute)

1. Launch Crystal desktop application
2. Look for this message in the console:
   ```text
   [WebServer] Server started on http://0.0.0.0:3001
   ```

### Step 3: Access Crystal (1 minute)

**In your browser, go to:**
- Local access: `http://localhost:3001`
- Network access: `http://YOUR_IP:3001`

**You should see the full Crystal interface!**

## 📱 Access from Phone/Tablet

1. Make sure your device is on the same WiFi network
2. Find your computer's IP address:
   - **Mac**: System Preferences → Network
   - **Windows**: Run `ipconfig` in Command Prompt
   - **Linux**: Run `hostname -I` in terminal
3. Open browser on your device
4. Go to `http://YOUR_COMPUTER_IP:3001`

## 🔧 API Usage Examples

### Test the API
```bash
# Check if server is running
curl http://localhost:3001/health

# List sessions (with authentication)
curl -H "X-API-Key: YOUR_API_KEY_HERE" http://localhost:3001/api/sessions

# Get app version
curl -H "X-API-Key: YOUR_API_KEY_HERE" http://localhost:3001/api/app/version
```

### Create a Session via API
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -d '{
    "name": "My API Session",
    "prompt": "Help me build a simple web app",
    "worktreePath": "/path/to/your/project",
    "worktreeName": "api-feature",
    "projectId": 1
  }' \
  http://localhost:3001/api/sessions
```

## 🔒 Security Setup (Optional but Recommended)

### Generate Secure API Key
```bash
# Generate a random 32-character key
openssl rand -hex 32
```

### Update Configuration
Add the generated key to your config:
```json
{
  "webServer": {
    "auth": {
      "enabled": true,
      "apiKey": "PASTE_YOUR_GENERATED_KEY_HERE"
    }
  }
}
```

### Test Authentication
```bash
# This should fail (401 Unauthorized)
curl http://localhost:3001/api/sessions

# This should work
curl -H "X-API-Key: YOUR_GENERATED_KEY_HERE" http://localhost:3001/api/sessions
```

## 🌐 Common Use Cases

### 1. Remote Development
- Work on your home computer from the office
- Access Crystal from a laptop while the main workstation runs the sessions
- Collaborate with team members in real-time

### 2. Mobile Monitoring
- Check session progress from your phone
- Review code changes on a tablet
- Get notifications when sessions complete

### 3. Team Collaboration
- Share Crystal access with team members
- Review each other's sessions and changes
- Coordinate development efforts

### 4. CI/CD Integration
- Trigger Crystal sessions from build scripts
- Automate code generation workflows
- Monitor automated development processes

## 🛠️ Troubleshooting

### Can't Access from Browser
1. **Check if Crystal is running**: Look for web server startup message
2. **Check the port**: Make sure you're using the correct port (default: 3001)
3. **Check firewall**: Ensure port 3001 is allowed through firewall
4. **Check IP address**: Use `localhost` for local access, actual IP for network access

### Can't Access from Other Devices
1. **Same network**: Ensure devices are on the same WiFi/network
2. **Host setting**: Make sure `host` is set to `"0.0.0.0"` not `"localhost"`
3. **Firewall**: Check that your computer's firewall allows incoming connections
4. **IP address**: Double-check your computer's IP address

### Authentication Issues
1. **API key**: Make sure you're using the correct API key
2. **Header format**: Use `X-API-Key: your-key` or `Authorization: Bearer your-key`
3. **Config reload**: Restart Crystal after changing authentication settings

### Performance Issues
1. **Network speed**: Slower on mobile networks vs WiFi
2. **Browser choice**: Chrome/Firefox typically perform better
3. **Session complexity**: Large sessions may load slower in browser

## 📚 Next Steps

### Learn More
- **Full Documentation**: [WEB_SERVER_SETUP.md](WEB_SERVER_SETUP.md)
- **API Reference**: See the API endpoints section in the full documentation
- **Security Guide**: Learn about production deployment and security

### Advanced Configuration
- **CORS Settings**: Restrict access to specific domains
- **Custom Port**: Change the default port if needed
- **Production Setup**: Deploy with HTTPS and reverse proxy

### Integration Examples
- **Automation Scripts**: Use the API to automate workflows
- **Team Tools**: Integrate with Slack, Discord, or other team tools
- **Monitoring**: Set up health checks and alerts

## 💡 Tips

1. **Start Simple**: Begin with basic configuration, add security later
2. **Test Locally First**: Make sure everything works on localhost before network access
3. **Use Strong API Keys**: Generate random keys, don't use simple passwords
4. **Monitor Usage**: Keep an eye on who's accessing your Crystal instance
5. **Regular Updates**: Keep Crystal updated for latest features and security fixes

## 🆘 Need Help?

- **Full Documentation**: [WEB_SERVER_SETUP.md](WEB_SERVER_SETUP.md)
- **Test Script**: Run `node examples/test-web-server.js` to verify setup
- **GitHub Issues**: Report problems or ask questions on the Crystal GitHub repository

---

**🎉 That's it! You now have Crystal running as a web server and can access it from anywhere on your network.**
