# Crystal Web Server Usage Scenarios

Real-world examples of how to use Crystal's web server functionality.

## 🏠 Scenario 1: Remote Work Setup

**Situation**: You have a powerful desktop at home and want to access Crystal from your laptop at the office.

### Setup

**1. Home Desktop Configuration:**
```json
{
  "anthropicApiKey": "your-key",
  "webServer": {
    "enabled": true,
    "port": 3001,
    "host": "0.0.0.0",
    "auth": {
      "enabled": true,
      "apiKey": "secure-home-office-key-12345"
    }
  }
}
```

**2. Router Configuration:**
- Forward port 3001 to your desktop's local IP
- Or set up VPN for secure access

**3. Access from Office:**
- VPN: `http://192.168.1.100:3001` (home network IP)
- Port Forward: `http://your-public-ip:3001`

### Usage
```bash
# Check connection from office laptop
curl -H "X-API-Key: secure-home-office-key-12345" \
  http://your-home-ip:3001/health

# Create session remotely
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: secure-home-office-key-12345" \
  -d '{
    "name": "Office Work Session",
    "prompt": "Help me fix the authentication bug",
    "worktreePath": "/home/user/projects/webapp",
    "worktreeName": "fix-auth-bug"
  }' \
  http://your-home-ip:3001/api/sessions
```

## 👥 Scenario 2: Team Development

**Situation**: Your team wants to share a Crystal instance for collaborative development.

### Setup

**1. Dedicated Server Configuration:**
```json
{
  "anthropicApiKey": "team-anthropic-key",
  "webServer": {
    "enabled": true,
    "port": 3001,
    "host": "0.0.0.0",
    "cors": {
      "enabled": true,
      "origins": [
        "http://dev-server.company.com:3001",
        "http://192.168.10.*:3001"
      ]
    },
    "auth": {
      "enabled": true,
      "apiKey": "team-shared-api-key-67890"
    }
  }
}
```

**2. Team Access:**
- Share server IP: `192.168.10.50`
- Share API key: `team-shared-api-key-67890`
- Document available at: `http://192.168.10.50:3001`

### Team Workflow

**Developer A - Creates Feature Session:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: team-shared-api-key-67890" \
  -d '{
    "name": "User Authentication Feature",
    "prompt": "Implement OAuth2 authentication with Google",
    "worktreePath": "/projects/webapp",
    "worktreeName": "feature-oauth2",
    "projectId": 1
  }' \
  http://192.168.10.50:3001/api/sessions
```

**Developer B - Monitors Progress:**
```bash
# Check all active sessions
curl -H "X-API-Key: team-shared-api-key-67890" \
  http://192.168.10.50:3001/api/sessions

# Get specific session details
curl -H "X-API-Key: team-shared-api-key-67890" \
  http://192.168.10.50:3001/api/sessions/session-id
```

**Team Lead - Reviews Changes:**
```bash
# Get git diff for session
curl -H "X-API-Key: team-shared-api-key-67890" \
  http://192.168.10.50:3001/api/git/session-id/diff
```

## 📱 Scenario 3: Mobile Monitoring

**Situation**: You want to monitor Crystal sessions from your phone while away from your desk.

### Setup

**1. Mobile-Friendly Configuration:**
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
      "apiKey": "mobile-monitoring-key-abc123"
    }
  }
}
```

**2. Mobile Bookmarks:**
- Main Interface: `http://your-ip:3001`
- Health Check: `http://your-ip:3001/health`

### Mobile Usage

**Quick Status Check:**
```bash
# Save this as a shortcut on your phone's browser
http://your-ip:3001/health
```

**Session Monitoring Script** (save as bookmark):
```javascript
// Bookmarklet for quick session status
javascript:(function(){
  fetch('http://your-ip:3001/api/sessions', {
    headers: {'X-API-Key': 'mobile-monitoring-key-abc123'}
  })
  .then(r => r.json())
  .then(d => alert('Active Sessions: ' + d.data.length));
})();
```

## 🤖 Scenario 4: CI/CD Integration

**Situation**: Integrate Crystal into your automated build and deployment pipeline.

### Setup

**1. CI Server Configuration:**
```json
{
  "webServer": {
    "enabled": true,
    "port": 3001,
    "host": "127.0.0.1",
    "auth": {
      "enabled": true,
      "apiKey": "ci-cd-automation-key-xyz789"
    }
  }
}
```

**2. Environment Variables:**
```bash
export CRYSTAL_API_KEY="ci-cd-automation-key-xyz789"
export CRYSTAL_URL="http://localhost:3001"
```

### CI/CD Scripts

**GitHub Actions Workflow:**
```yaml
name: Automated Code Review
on: [pull_request]

jobs:
  crystal-review:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v2
      
      - name: Create Crystal Session
        run: |
          SESSION_ID=$(curl -X POST \
            -H "Content-Type: application/json" \
            -H "X-API-Key: ${{ secrets.CRYSTAL_API_KEY }}" \
            -d '{
              "name": "PR Review - ${{ github.event.number }}",
              "prompt": "Review this pull request for security issues and code quality",
              "worktreePath": "${{ github.workspace }}",
              "worktreeName": "pr-${{ github.event.number }}"
            }' \
            ${{ secrets.CRYSTAL_URL }}/api/sessions | jq -r '.data.id')
          echo "SESSION_ID=$SESSION_ID" >> $GITHUB_ENV
      
      - name: Wait for Review
        run: |
          while true; do
            STATUS=$(curl -H "X-API-Key: ${{ secrets.CRYSTAL_API_KEY }}" \
              ${{ secrets.CRYSTAL_URL }}/api/sessions/$SESSION_ID | jq -r '.data.status')
            if [ "$STATUS" = "completed" ]; then break; fi
            sleep 30
          done
      
      - name: Get Review Results
        run: |
          curl -H "X-API-Key: ${{ secrets.CRYSTAL_API_KEY }}" \
            ${{ secrets.CRYSTAL_URL }}/api/sessions/$SESSION_ID/output > review-results.txt
```

**Jenkins Pipeline:**
```groovy
pipeline {
    agent any
    environment {
        CRYSTAL_API_KEY = credentials('crystal-api-key')
        CRYSTAL_URL = 'http://localhost:3001'
    }
    stages {
        stage('Code Generation') {
            steps {
                script {
                    def sessionData = [
                        name: "Build ${env.BUILD_NUMBER}",
                        prompt: "Generate unit tests for the new features",
                        worktreePath: env.WORKSPACE,
                        worktreeName: "build-${env.BUILD_NUMBER}"
                    ]
                    
                    def response = httpRequest(
                        httpMode: 'POST',
                        url: "${CRYSTAL_URL}/api/sessions",
                        customHeaders: [[name: 'X-API-Key', value: env.CRYSTAL_API_KEY]],
                        requestBody: groovy.json.JsonOutput.toJson(sessionData)
                    )
                    
                    def sessionId = readJSON(text: response.content).data.id
                    env.CRYSTAL_SESSION_ID = sessionId
                }
            }
        }
        
        stage('Monitor Progress') {
            steps {
                script {
                    timeout(time: 30, unit: 'MINUTES') {
                        waitUntil {
                            def response = httpRequest(
                                url: "${CRYSTAL_URL}/api/sessions/${env.CRYSTAL_SESSION_ID}",
                                customHeaders: [[name: 'X-API-Key', value: env.CRYSTAL_API_KEY]]
                            )
                            def status = readJSON(text: response.content).data.status
                            return status == 'completed'
                        }
                    }
                }
            }
        }
    }
}
```

## 🏢 Scenario 5: Enterprise Deployment

**Situation**: Deploy Crystal web server in an enterprise environment with security and monitoring requirements.

### Setup

**1. Production Configuration:**
```json
{
  "webServer": {
    "enabled": true,
    "port": 3001,
    "host": "127.0.0.1",
    "cors": {
      "enabled": true,
      "origins": [
        "https://crystal.company.com",
        "https://dev-tools.company.com"
      ]
    },
    "auth": {
      "enabled": true,
      "apiKey": "enterprise-secure-key-with-rotation"
    }
  }
}
```

**2. Reverse Proxy (nginx):**
```nginx
upstream crystal {
    server 127.0.0.1:3001;
}

server {
    listen 443 ssl;
    server_name crystal.company.com;
    
    ssl_certificate /etc/ssl/certs/crystal.company.com.crt;
    ssl_certificate_key /etc/ssl/private/crystal.company.com.key;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=crystal:10m rate=10r/s;
    limit_req zone=crystal burst=20 nodelay;
    
    location / {
        proxy_pass http://crystal;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://crystal/health;
        access_log off;
    }
}
```

**3. Monitoring Script:**
```bash
#!/bin/bash
# crystal-monitor.sh

API_KEY="enterprise-secure-key-with-rotation"
CRYSTAL_URL="https://crystal.company.com"
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

# Health check
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$CRYSTAL_URL/health")

if [ "$HEALTH" != "200" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 Crystal web server is down!"}' \
        "$SLACK_WEBHOOK"
fi

# Session monitoring
SESSIONS=$(curl -s -H "X-API-Key: $API_KEY" \
    "$CRYSTAL_URL/api/sessions" | jq '.data | length')

if [ "$SESSIONS" -gt 10 ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"⚠️ High session count: $SESSIONS active sessions\"}" \
        "$SLACK_WEBHOOK"
fi
```

### Enterprise Usage

**Department Access Control:**
```bash
# Different API keys for different departments
FRONTEND_TEAM_KEY="frontend-team-key-123"
BACKEND_TEAM_KEY="backend-team-key-456"
QA_TEAM_KEY="qa-team-key-789"

# Frontend team creates UI sessions
curl -X POST \
  -H "X-API-Key: $FRONTEND_TEAM_KEY" \
  -d '{"name": "Frontend Feature", "prompt": "Create React component"}' \
  https://crystal.company.com/api/sessions

# QA team monitors all sessions
curl -H "X-API-Key: $QA_TEAM_KEY" \
  https://crystal.company.com/api/sessions
```

**Audit Logging:**
```bash
# Log all API calls for compliance
tail -f /var/log/nginx/crystal-access.log | \
  grep -E "(POST|PUT|DELETE)" | \
  while read line; do
    echo "$(date): $line" >> /var/log/crystal-audit.log
  done
```

## 🔧 Scenario 6: Development Team Workflow

**Situation**: A development team wants to use Crystal for pair programming and code reviews.

### Setup

**1. Shared Development Server:**
```json
{
  "webServer": {
    "enabled": true,
    "port": 3001,
    "host": "0.0.0.0",
    "auth": {
      "enabled": true,
      "apiKey": "dev-team-shared-key"
    }
  }
}
```

### Workflow Scripts

**Create Feature Session:**
```bash
#!/bin/bash
# create-feature-session.sh

FEATURE_NAME="$1"
DESCRIPTION="$2"

if [ -z "$FEATURE_NAME" ]; then
    echo "Usage: $0 <feature-name> <description>"
    exit 1
fi

SESSION_ID=$(curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-team-shared-key" \
  -d "{
    \"name\": \"Feature: $FEATURE_NAME\",
    \"prompt\": \"$DESCRIPTION\",
    \"worktreePath\": \"$(pwd)\",
    \"worktreeName\": \"feature-$FEATURE_NAME\"
  }" \
  http://dev-server:3001/api/sessions | jq -r '.data.id')

echo "Created session: $SESSION_ID"
echo "Access at: http://dev-server:3001/#/sessions/$SESSION_ID"
```

**Monitor Team Sessions:**
```bash
#!/bin/bash
# team-status.sh

echo "=== Active Crystal Sessions ==="
curl -s -H "X-API-Key: dev-team-shared-key" \
  http://dev-server:3001/api/sessions | \
  jq -r '.data[] | "\(.name) - \(.status) - \(.createdAt)"'

echo ""
echo "=== Server Health ==="
curl -s http://dev-server:3001/health | jq '.'
```

These scenarios demonstrate the flexibility and power of Crystal's web server functionality across different use cases, from simple remote access to complex enterprise deployments.
