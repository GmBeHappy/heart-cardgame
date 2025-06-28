# WebSocket Connection Troubleshooting Guide

## Issue: WebSocket connection to 'wss://heart-api.game.witchayut.com/socket.io/?EIO=4&transport=websocket' failed

### Step 1: Verify Nginx Proxy Manager Configuration

In your nginx proxy manager, for the proxy host `heart-api.game.witchayut.com`:

1. **Basic Settings:**

   - Domain Names: `heart-api.game.witchayut.com`
   - Scheme: `http`
   - Forward Hostname: `your-server-ip` (or `localhost` if on same machine)
   - Forward Port: `3001`
   - **Enable WebSocket Support**: ✅ CHECKED
   - **Block Common Exploits**: ✅ CHECKED
   - **Request Buffering**: ❌ UNCHECKED (important for WebSocket)

2. **Custom Nginx Configuration** (add this in the Advanced tab):

```nginx
# WebSocket support for Socket.IO
location /socket.io/ {
    proxy_pass http://your-server-ip:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # WebSocket specific settings
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 86400;
    proxy_send_timeout 86400;
    proxy_connect_timeout 86400;

    # Disable buffering for real-time communication
    proxy_buffering off;
    proxy_request_buffering off;

    # Handle Socket.IO polling
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
}

# Health check endpoint
location /health {
    proxy_pass http://your-server-ip:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Step 2: Environment Variables

Create a `.env` file in your project root:

```env
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
CORS_ORIGIN=https://your-frontend-domain.com

# Frontend Configuration
NEXT_PUBLIC_SERVER_URL=https://heart-api.game.witchayut.com
```

### Step 3: Test Connection

1. **Test the health endpoint:**

   ```bash
   curl https://heart-api.game.witchayut.com/health
   ```

2. **Test WebSocket connection manually:**
   ```bash
   wscat -c wss://heart-api.game.witchayut.com/socket.io/?EIO=4&transport=websocket
   ```

### Step 4: Debug Steps

1. **Check server logs:**

   ```bash
   docker logs your-server-container-name
   ```

2. **Check nginx logs:**

   ```bash
   # In nginx proxy manager container
   docker logs nginx-proxy-manager
   ```

3. **Browser Network Tab:**
   - Open DevTools → Network tab
   - Filter by "WS" (WebSocket)
   - Try to connect and check the failed request

### Step 5: Common Issues and Solutions

#### Issue 1: Connection Refused

- **Cause**: Server not listening on correct interface
- **Solution**: Ensure server listens on `0.0.0.0:3001`

#### Issue 2: 404 Not Found

- **Cause**: Nginx not properly routing `/socket.io/` requests
- **Solution**: Check custom nginx configuration

#### Issue 3: CORS Errors

- **Cause**: CORS not properly configured
- **Solution**: Update `CORS_ORIGIN` environment variable

#### Issue 4: SSL/TLS Issues

- **Cause**: Mixed content or certificate issues
- **Solution**: Ensure consistent HTTPS usage

### Step 6: Alternative Configuration

If the above doesn't work, try this simplified nginx configuration:

```nginx
location / {
    proxy_pass http://your-server-ip:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400;
    proxy_send_timeout 86400;
    proxy_buffering off;
}
```

### Step 7: Verify Deployment

1. **Rebuild and redeploy:**

   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

2. **Check container status:**
   ```bash
   docker-compose ps
   docker-compose logs server
   ```

### Step 8: Final Test

After implementing all changes:

1. Clear browser cache
2. Open browser dev tools
3. Navigate to your frontend
4. Check console for connection logs
5. Check network tab for WebSocket connections

If still failing, check the specific error message in the browser console for more details.
