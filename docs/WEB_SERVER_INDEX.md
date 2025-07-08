# Crystal Web Server Documentation Index

Complete guide to using Crystal as a web server for remote access and API integration.

## 🎯 Choose Your Path

### 🚀 I want to get started quickly
**→ [Quick Start Guide](QUICK_START_WEB_SERVER.md)**
- 5-minute setup
- Basic configuration
- Immediate access from browser and mobile

### 📚 I want comprehensive documentation
**→ [Complete Setup Guide](WEB_SERVER_SETUP.md)**
- Detailed configuration options
- Complete API reference
- Security considerations
- Production deployment

### 🔧 I'm having problems
**→ [Troubleshooting Guide](WEB_SERVER_TROUBLESHOOTING.md)**
- Common issues and solutions
- Diagnostic commands
- Step-by-step fixes

### 💡 I want to see real examples
**→ [Usage Scenarios](../examples/usage-scenarios.md)**
- Remote work setup
- Team collaboration
- CI/CD integration
- Enterprise deployment

### 🧪 I want to test my setup
**→ [Test Script](../examples/test-web-server.js)**
- Automated testing
- API validation
- Health checks

## 📋 Documentation Overview

### Getting Started
| Document | Purpose | Time to Read |
|----------|---------|--------------|
| [Quick Start Guide](QUICK_START_WEB_SERVER.md) | Get up and running fast | 5 minutes |
| [Complete Setup Guide](WEB_SERVER_SETUP.md) | Comprehensive configuration | 20 minutes |

### Problem Solving
| Document | Purpose | When to Use |
|----------|---------|-------------|
| [Troubleshooting Guide](WEB_SERVER_TROUBLESHOOTING.md) | Fix common issues | When things don't work |
| [Test Script](../examples/test-web-server.js) | Validate setup | After configuration changes |

### Advanced Usage
| Document | Purpose | Audience |
|----------|---------|----------|
| [Usage Scenarios](../examples/usage-scenarios.md) | Real-world examples | Teams, enterprises |
| [API Reference](WEB_SERVER_SETUP.md#available-endpoints) | Complete API docs | Developers, integrators |

## 🎯 Use Case Quick Navigation

### 👤 Individual Developer
**Goal**: Access Crystal from multiple devices
1. Start with [Quick Start Guide](QUICK_START_WEB_SERVER.md)
2. Enable basic authentication
3. Access from phone/tablet

### 👥 Small Team (2-5 people)
**Goal**: Share Crystal instance for collaboration
1. Read [Team Collaboration](../examples/usage-scenarios.md#scenario-2-team-development)
2. Set up shared server
3. Configure team access

### 🏢 Enterprise Team (5+ people)
**Goal**: Secure, monitored, production deployment
1. Review [Enterprise Deployment](../examples/usage-scenarios.md#scenario-5-enterprise-deployment)
2. Set up reverse proxy with SSL
3. Implement monitoring and logging

### 🤖 DevOps/Automation
**Goal**: Integrate Crystal into CI/CD pipelines
1. Check [CI/CD Integration](../examples/usage-scenarios.md#scenario-4-cicd-integration)
2. Set up API automation
3. Monitor via health checks

### 📱 Mobile Access
**Goal**: Monitor and control Crystal from mobile devices
1. Follow [Mobile Access Setup](QUICK_START_WEB_SERVER.md#access-from-phonetablet)
2. Configure responsive interface
3. Set up mobile bookmarks

## 🔧 Configuration Quick Reference

### Minimal Configuration
```json
{
  "webServer": {
    "enabled": true
  }
}
```

### Secure Configuration
```json
{
  "webServer": {
    "enabled": true,
    "port": 3001,
    "host": "0.0.0.0",
    "auth": {
      "enabled": true,
      "apiKey": "your-secure-api-key"
    }
  }
}
```

### Production Configuration
```json
{
  "webServer": {
    "enabled": true,
    "port": 3001,
    "host": "127.0.0.1",
    "cors": {
      "enabled": true,
      "origins": ["https://crystal.yourdomain.com"]
    },
    "auth": {
      "enabled": true,
      "apiKey": "production-api-key"
    }
  }
}
```

## 🚀 Quick Commands

### Health Check
```bash
curl http://localhost:3001/health
```

### Test API Access
```bash
curl -H "X-API-Key: your-key" http://localhost:3001/api/app/version
```

### List Sessions
```bash
curl -H "X-API-Key: your-key" http://localhost:3001/api/sessions
```

### Create Session
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{"name": "Test Session", "prompt": "Hello Crystal"}' \
  http://localhost:3001/api/sessions
```

## 🔍 Troubleshooting Quick Links

### Common Issues
- [Web Server Won't Start](WEB_SERVER_TROUBLESHOOTING.md#1-web-server-wont-start)
- [Can't Access from Browser](WEB_SERVER_TROUBLESHOOTING.md#2-cant-access-from-browser)
- [Can't Access from Other Devices](WEB_SERVER_TROUBLESHOOTING.md#3-cant-access-from-other-devices)
- [Authentication Issues](WEB_SERVER_TROUBLESHOOTING.md#4-authentication-issues)
- [CORS Errors](WEB_SERVER_TROUBLESHOOTING.md#5-cors-errors)

### Diagnostic Commands
```bash
# Check if port is in use
lsof -i :3001

# Test network connectivity
curl -I http://localhost:3001/health

# Validate configuration
cat ~/.crystal/config.json | python -m json.tool
```

## 📞 Getting Help

### Before Asking for Help
1. ✅ Check the [Troubleshooting Guide](WEB_SERVER_TROUBLESHOOTING.md)
2. ✅ Run the [Test Script](../examples/test-web-server.js)
3. ✅ Gather diagnostic information

### Information to Include
- Crystal version
- Operating system
- Configuration file (remove sensitive data)
- Error messages
- Network setup

### Where to Get Help
- **GitHub Issues**: For bugs and feature requests
- **Documentation**: Check all guides in this index
- **Test Script**: Run automated diagnostics

## 🎉 Success Stories

### ✅ Remote Development
"I can now work on my home desktop from anywhere with just my laptop and browser."

### ✅ Team Collaboration
"Our team shares one powerful Crystal instance and collaborates in real-time."

### ✅ Mobile Monitoring
"I check session progress from my phone during meetings."

### ✅ CI/CD Integration
"Crystal automatically generates tests for every pull request."

## 🔄 Keep Updated

### Regular Maintenance
- Update Crystal regularly for latest features
- Rotate API keys periodically
- Monitor server logs
- Test backup access methods

### Security Best Practices
- Use strong API keys (32+ characters)
- Restrict CORS origins in production
- Use HTTPS with reverse proxy
- Monitor access logs

---

**Ready to get started? Choose your path above and begin your Crystal web server journey!**
