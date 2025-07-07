# Crystal Web Server Setup

Crystal now supports running as a web server, allowing you to access the application remotely over the network while maintaining all original desktop functionality.

## Features

- **Dual Mode Operation**: Run as desktop app, web server, or both simultaneously
- **RESTful API**: Complete API access to all Crystal functionality
- **Security**: Optional API key authentication and CORS configuration
- **Frontend Serving**: Serves the React frontend for web browser access
- **Real-time Updates**: WebSocket support for live session updates

## Configuration

Add the following to your Crystal configuration file (`~/.crystal/config.json`):

```json
{
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
      "apiKey": "your-secure-api-key-here"
    }
  }
}
```

### Configuration Options

- **enabled**: Enable/disable the web server (default: false)
- **port**: Port to run the server on (default: 3001)
- **host**: Host to bind to (default: "0.0.0.0" for all interfaces)
- **cors.enabled**: Enable CORS headers (default: true)
- **cors.origins**: Allowed origins for CORS (default: ["*"])
- **auth.enabled**: Enable API key authentication (default: false)
- **auth.apiKey**: API key for authentication (required if auth.enabled is true)

## Usage

### Starting Crystal with Web Server

1. **Desktop + Web Server**: Run Crystal normally - if web server is enabled in config, it will start automatically
   ```bash
   crystal
   ```

2. **Web Server Only**: You can also run Crystal in headless mode (future feature)

### Accessing the Web Interface

Once the web server is running, you can access Crystal in your web browser:

- **Local Access**: `http://localhost:3001`
- **Network Access**: `http://YOUR_SERVER_IP:3001`

### API Access

The web server exposes a complete RESTful API:

#### Authentication
If authentication is enabled, include the API key in requests:
```bash
# Using X-API-Key header
curl -H "X-API-Key: your-api-key" http://localhost:3001/api/sessions

# Using Authorization header
curl -H "Authorization: Bearer your-api-key" http://localhost:3001/api/sessions
```

#### Available Endpoints

**Sessions**
- `GET /api/sessions` - List all sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `DELETE /api/sessions/:id` - Archive session
- `POST /api/sessions/:id/continue` - Continue conversation
- `GET /api/sessions/:id/output` - Get session output
- `GET /api/sessions/:id/conversation` - Get conversation history

**Projects**
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/activate` - Set active project

**Configuration**
- `GET /api/config` - Get current configuration
- `POST /api/config` - Update configuration

**Application Info**
- `GET /api/app/version` - Get app version
- `GET /api/app/platform` - Get platform info
- `GET /api/app/packaged` - Check if app is packaged

**Health Check**
- `GET /health` - Server health status

## Security Considerations

### API Key Authentication
When `auth.enabled` is true, all API endpoints (except `/health`) require a valid API key. Generate a strong, unique API key:

```bash
# Generate a secure API key
openssl rand -hex 32
```

### CORS Configuration
For production use, restrict CORS origins to specific domains:

```json
{
  "webServer": {
    "cors": {
      "enabled": true,
      "origins": ["https://yourdomain.com", "https://app.yourdomain.com"]
    }
  }
}
```

### Network Security
- Use HTTPS in production (reverse proxy recommended)
- Consider firewall rules to restrict access
- Use strong API keys and rotate them regularly

## Examples

### Creating a Session via API
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "name": "My Session",
    "prompt": "Help me build a web app",
    "worktreePath": "/path/to/project",
    "worktreeName": "feature-branch",
    "projectId": 1
  }' \
  http://localhost:3001/api/sessions
```

### Getting Session Output
```bash
curl -H "X-API-Key: your-api-key" \
  http://localhost:3001/api/sessions/session-id/output
```

### Continuing a Conversation
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"message": "Can you add error handling?"}' \
  http://localhost:3001/api/sessions/session-id/continue
```

## Troubleshooting

### Port Already in Use
If port 3001 is already in use, change the port in your configuration:
```json
{
  "webServer": {
    "port": 3002
  }
}
```

### Cannot Access from Network
1. Check firewall settings
2. Ensure `host` is set to `"0.0.0.0"` not `"localhost"`
3. Verify the port is not blocked

### CORS Issues
If you're getting CORS errors in the browser:
1. Add your domain to the `origins` array
2. Or temporarily set `origins: ["*"]` for testing

## Integration Examples

The web server enables Crystal to be integrated into various workflows:

- **CI/CD Pipelines**: Trigger Crystal sessions from build scripts
- **Web Applications**: Embed Crystal functionality in web apps
- **Remote Development**: Access Crystal from any device with a browser
- **Team Collaboration**: Share Crystal sessions across team members
- **Automation**: Script Crystal operations via the API

For more advanced integration examples, see the `examples/` directory.

## Step-by-Step Usage Guide

### Getting Started

#### Step 1: Enable Web Server
1. Locate your Crystal configuration file:
   - **macOS/Linux**: `~/.crystal/config.json`
   - **Windows**: `%USERPROFILE%\.crystal\config.json`

2. If the file doesn't exist, create it with basic web server configuration:
```json
{
  "anthropicApiKey": "your-anthropic-api-key",
  "webServer": {
    "enabled": true,
    "port": 3001,
    "host": "0.0.0.0",
    "cors": {
      "enabled": true,
      "origins": ["*"]
    },
    "auth": {
      "enabled": false
    }
  }
}
```

3. If the file exists, add the `webServer` section to your existing configuration.

#### Step 2: Start Crystal
1. Launch Crystal normally (desktop application)
2. Check the console/logs for web server startup message:
   ```
   [WebServer] Server started on http://0.0.0.0:3001
   ```

#### Step 3: Access Crystal via Web Browser
1. **Local Access**: Open `http://localhost:3001` in your browser
2. **Network Access**: Open `http://YOUR_COMPUTER_IP:3001` from another device
3. You should see the full Crystal interface in your browser

### Setting Up Authentication (Recommended)

#### Step 1: Generate API Key
```bash
# Generate a secure 32-character API key
openssl rand -hex 32
# Example output: a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

#### Step 2: Update Configuration
```json
{
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
      "apiKey": "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"
    }
  }
}
```

#### Step 3: Restart Crystal
Restart Crystal for the authentication changes to take effect.

#### Step 4: Test Authentication
```bash
# This should fail with 401 Unauthorized
curl http://localhost:3001/api/sessions

# This should succeed
curl -H "X-API-Key: your-api-key-here" http://localhost:3001/api/sessions
```

### Using the Web Interface

#### Accessing Crystal in Browser
1. Open your web browser
2. Navigate to `http://localhost:3001` (or your server's IP)
3. You'll see the complete Crystal interface
4. All desktop features work in the browser:
   - Create and manage sessions
   - View git diffs
   - Run terminal commands
   - Manage projects
   - Configure settings

#### Browser Compatibility
- **Chrome/Chromium**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile browsers**: Basic support (responsive design)

### Using the API Programmatically

#### Basic API Usage

**1. Check Server Health**
```bash
curl http://localhost:3001/health
```
Response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "0.1.11"
}
```

**2. Get Application Info**
```bash
curl -H "X-API-Key: your-key" http://localhost:3001/api/app/version
```

**3. List All Sessions**
```bash
curl -H "X-API-Key: your-key" http://localhost:3001/api/sessions
```

**4. Get Session Details**
```bash
curl -H "X-API-Key: your-key" http://localhost:3001/api/sessions/session-id-here
```

#### Advanced API Examples

**1. Create a New Session**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{
    "name": "Build React App",
    "prompt": "Help me create a React application with TypeScript",
    "worktreePath": "/path/to/project",
    "worktreeName": "feature-react-app",
    "projectId": 1,
    "permissionMode": "ignore"
  }' \
  http://localhost:3001/api/sessions
```

**2. Continue a Conversation**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{
    "message": "Add error boundaries and loading states"
  }' \
  http://localhost:3001/api/sessions/session-id/continue
```

**3. Get Session Output**
```bash
curl -H "X-API-Key: your-key" \
  http://localhost:3001/api/sessions/session-id/output
```

**4. Create a New Project**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{
    "name": "My Web App",
    "path": "/path/to/project",
    "systemPrompt": "You are a helpful web development assistant",
    "runScript": "npm start",
    "buildScript": "npm run build",
    "defaultPermissionMode": "ignore"
  }' \
  http://localhost:3001/api/projects
```

### Network Access Setup

#### Finding Your Computer's IP Address

**macOS/Linux:**
```bash
# Get local network IP
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'

# Or use hostname
hostname -I
```

**Windows:**
```cmd
# Get local network IP
ipconfig | findstr "IPv4"
```

#### Accessing from Other Devices

1. **Same Network**: Use your computer's local IP address
   - Example: `http://192.168.1.100:3001`

2. **Different Network**: Set up port forwarding on your router
   - Forward external port to your computer's IP:3001
   - Access via your public IP address

3. **VPN Access**: Use VPN for secure remote access
   - Connect remote device to your network via VPN
   - Access using local IP address

#### Firewall Configuration

**macOS:**
```bash
# Allow incoming connections on port 3001
sudo pfctl -f /etc/pf.conf
```

**Linux (Ubuntu/Debian):**
```bash
# Allow port 3001
sudo ufw allow 3001
```

**Windows:**
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Create new "Inbound Rule"
4. Allow port 3001 for TCP

### Mobile Device Access

#### Setup for Mobile Use
1. Ensure Crystal web server is running
2. Connect mobile device to same WiFi network
3. Open browser on mobile device
4. Navigate to `http://YOUR_COMPUTER_IP:3001`

#### Mobile-Optimized Features
- **Responsive Design**: Interface adapts to mobile screens
- **Touch Controls**: Tap and swipe gestures supported
- **Virtual Keyboard**: Works with mobile keyboards
- **Zoom Support**: Pinch to zoom for detailed views

#### Mobile Limitations
- **Terminal**: Limited terminal interaction on mobile
- **File Upload**: May have restrictions depending on browser
- **Performance**: May be slower than desktop

### Team Collaboration Setup

#### Shared Development Server
1. **Designate Server Machine**: Choose a powerful computer as the Crystal server
2. **Configure for Team Access**:
```json
{
  "webServer": {
    "enabled": true,
    "port": 3001,
    "host": "0.0.0.0",
    "cors": {
      "enabled": true,
      "origins": [
        "http://teammate1-computer.local:3001",
        "http://teammate2-computer.local:3001",
        "http://192.168.1.*:3001"
      ]
    },
    "auth": {
      "enabled": true,
      "apiKey": "shared-team-api-key-here"
    }
  }
}
```

3. **Share Access Details**:
   - Server IP address
   - Port number (3001)
   - API key (if authentication enabled)

#### Team Workflow
1. **Session Creation**: Team members create sessions for different features
2. **Code Review**: Use web interface to review changes and diffs
3. **Collaboration**: Multiple people can monitor session progress
4. **Integration**: Use API to integrate with team tools

### Production Deployment

#### Server Setup
1. **Use Dedicated Server**: Deploy on a server machine
2. **Reverse Proxy**: Set up nginx or Apache for HTTPS
3. **Domain Name**: Configure DNS for easy access
4. **SSL Certificate**: Use Let's Encrypt for HTTPS

#### Example nginx Configuration
```nginx
server {
    listen 80;
    server_name crystal.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name crystal.yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Production Configuration
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
      "apiKey": "very-secure-production-api-key"
    }
  }
}
```
