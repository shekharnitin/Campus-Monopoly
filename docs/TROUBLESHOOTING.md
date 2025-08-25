# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 🚫 Cannot Start Server

**Error: "npm: command not found"**
```bash
# Solution: Install Node.js
1. Go to https://nodejs.org/
2. Download LTS version for your OS
3. Install and restart terminal
4. Verify: node --version
```

**Error: "Port 3001 already in use"**
```bash
# Solution 1: Kill existing process
# macOS/Linux:
lsof -ti:3001 | xargs kill -9

# Windows:
netstat -ano | findstr :3001
taskkill /PID [PID_NUMBER] /F

# Solution 2: Change port
# Edit backend/.env file:
PORT=3002
```

**Error: "Cannot find module"**
```bash
# Solution: Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 🌐 Connection Issues

**"Failed to connect to backend"**
- ✅ Check if backend server is running
- ✅ Verify URL is correct (http://localhost:3001)
- ✅ Check firewall settings
- ✅ Try refreshing browser

**Players cannot join from other devices**
```bash
# Find your IP address:
# Windows: ipconfig
# Mac/Linux: ifconfig

# Share this URL: http://YOUR-IP:3001
# Example: http://192.168.1.100:3001
```

**"Game code not found"**
- ✅ Ensure game code is typed correctly (6 characters)
- ✅ Check if host is still in the game
- ✅ Verify host hasn't ended the game
- ✅ Try creating a new game

### 🎮 Game Issues

**"Not your turn" error**
- ✅ Wait for turn indicator to show your name
- ✅ Check if game has started
- ✅ Verify you're not bankrupt
- ✅ Look at player order in sidebar

**Buttons not working**
```javascript
// Check browser console (F12) for errors
// Common fixes:
1. Refresh the page
2. Clear browser cache
3. Try different browser
4. Check internet connection
```

**Game freezes or stops responding**
- ✅ Check if host disconnected
- ✅ Refresh browser page
- ✅ Check network connection
- ✅ Look at server console for errors

### 📱 Mobile Device Issues

**Touch controls not working**
```css
/* Add to style.css if needed */
.btn {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
}
```

**Game board too small on mobile**
- ✅ Rotate device to landscape mode
- ✅ Zoom out in browser
- ✅ Use desktop for better experience

**Cannot enter game code on mobile**
- ✅ Ensure keyboard is in English
- ✅ Use uppercase letters
- ✅ Check for auto-correct interference

### ⚡ Performance Issues

**Game runs slowly**
```bash
# Increase Node.js memory:
node --max-old-space-size=4096 backend/server.js

# Check system resources:
# Windows: Task Manager
# Mac: Activity Monitor  
# Linux: htop
```

**Too many players causing lag**
```javascript
// Reduce max players in server.js:
const gameConfig = {
    maxPlayers: 4,  // Reduce from 8
    // ... other settings
};
```

**Browser becomes unresponsive**
- ✅ Close other browser tabs
- ✅ Clear browser cache and cookies
- ✅ Restart browser
- ✅ Try Chrome/Firefox for best performance

### 🔒 Security Warnings

**"Connection not secure" warning**
```bash
# For local network, this is normal
# Click "Advanced" → "Proceed to localhost"
# Or use HTTP instead of HTTPS
```

**Firewall blocking connections**
```bash
# Windows Defender:
1. Windows Settings → Update & Security → Windows Security
2. Firewall & network protection → Allow an app
3. Add Node.js or the port 3001

# macOS:
1. System Preferences → Security & Privacy → Firewall
2. Firewall Options → Add Node.js

# Router firewall:
1. Access router admin panel
2. Port forwarding → Add rule for port 3001
```

### 💾 Data Loss Issues

**Game progress lost**
- ⚠️ Games are stored in memory only
- ⚠️ Server restart will end all games
- ⚠️ No automatic save feature yet

**Players disappear from game**
- ✅ Check if they disconnected
- ✅ Have them refresh and rejoin
- ✅ Host can restart game if needed

### 🖥️ Browser Specific Issues

**Internet Explorer/Old Edge**
```html
<!-- Not supported, use modern browser -->
Supported browsers:
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
```

**Safari issues**
```javascript
// Add to app.js if needed:
if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
    console.log('Safari detected - some features may be limited');
}
```

**Mobile browser issues**
- ✅ Use Chrome/Firefox on mobile
- ✅ Enable JavaScript
- ✅ Allow pop-ups for game notifications

## 🛠️ Advanced Troubleshooting

### Debug Mode
```bash
# Start server with debug logging:
DEBUG=* npm start

# Or for specific modules:
DEBUG=express:*,socket.io:* npm start
```

### Network Diagnostics
```bash
# Test server connectivity:
curl http://localhost:3001/api/health

# Should return:
{
  "status": "healthy",
  "activeGames": 0,
  "activePlayers": 0
}
```

### Log Analysis
```javascript
// Check browser console (F12) for:
- WebSocket connection errors
- JavaScript runtime errors
- Network request failures
- Security policy violations
```

### Reset Everything
```bash
# Nuclear option - fresh start:
1. Close all browsers
2. Kill Node.js processes
3. Delete node_modules folder
4. Run npm install
5. Start server
6. Clear browser cache
7. Try again
```

## 📞 Getting Help

### Self-Help Checklist:
- [ ] Read error messages carefully
- [ ] Check browser console (F12)
- [ ] Verify Node.js version (16+)
- [ ] Test with different browser
- [ ] Try on different device
- [ ] Check network connection
- [ ] Restart server and browser

### Contact Support:
1. **Document the issue** (screenshots, error messages)
2. **Note your setup** (OS, browser, Node.js version)
3. **Try basic troubleshooting** first
4. **Contact IIT (ISM) Fintech Club** with details

### Community Help:
- Check README.md for common solutions
- Look at GitHub issues if available
- Ask technical team during events
- Help other participants with known fixes

---

**Most issues can be solved with a simple restart! 🔄**

When in doubt, try:
1. Refresh browser
2. Restart server  
3. Check network connection
4. Read error messages

**Happy troubleshooting! 🛠️**
