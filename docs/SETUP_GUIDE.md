# 📋 Complete Setup Guide

## System Requirements

### Minimum Requirements:
- **Operating System**: Windows 7+, macOS 10.12+, or Linux
- **Node.js**: Version 16.0.0 or higher
- **RAM**: 512 MB available
- **Storage**: 50 MB free space
- **Network**: Internet connection for initial setup

### Recommended for Events:
- **CPU**: Dual-core processor
- **RAM**: 2 GB available
- **Network**: Stable Wi-Fi or ethernet connection
- **Devices**: 1 host computer + participant devices

## Installation Methods

### Method 1: Automated Setup (Recommended)
```bash
# Clone or extract the project
cd campus-monopoly

# Run the setup script
npm run setup

# Start the server
npm start
```

### Method 2: Manual Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install express socket.io cors uuid dotenv joi

# Install development dependencies (optional)
npm install --save-dev nodemon jest

# Start server
node server.js
```

### Method 3: Development Mode
```bash
cd backend
npm install
npm run dev  # Auto-restarts on changes
```

## Configuration Options

### Environment Variables (.env)
```bash
# Server Configuration
PORT=3001                    # Port to run server on
NODE_ENV=development         # Environment mode

# Game Settings
MAX_GAMES=100               # Maximum concurrent games
GAME_CLEANUP_INTERVAL=3600000 # Cleanup old games (1 hour)

# Network Settings
CORS_ORIGIN=*               # Allow all origins (use specific for production)
```

### Game Configuration (in server.js)
```javascript
const gameConfig = {
    startingMoney: 1500,     // Starting money for each player
    salaryAmount: 200,       # Money for passing Main Gate
    maxPlayers: 8,           # Maximum players per game
    minPlayers: 2            # Minimum players to start
};
```

## Network Setup for Events

### Local Network Setup:
1. **Connect host computer to Wi-Fi**
2. **Find your IP address**:
   - Windows: `ipconfig` in Command Prompt
   - Mac: `ifconfig` in Terminal  
   - Linux: `ip addr show`
3. **Start the server**: `npm start`
4. **Share the URL**: `http://YOUR-IP:3001`
5. **Players connect** from their devices

### Firewall Configuration:
- **Windows**: Allow Node.js through Windows Defender
- **macOS**: System Preferences → Security → Firewall → Allow Node
- **Router**: Forward port 3001 if needed

## Troubleshooting

### Common Installation Issues:

**"npm: command not found"**
```bash
# Install Node.js from https://nodejs.org/
# Restart terminal after installation
node --version  # Should show version number
```

**"Port 3001 already in use"**
```bash
# Kill existing process
killall node  # macOS/Linux
taskkill /f /im node.exe  # Windows

# Or change port in .env file
PORT=3002
```

**"Cannot find module"**
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install
```

**"EACCES: permission denied"**
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $USER /usr/local/lib/node_modules
```

### Game Issues:

**"Game not found" errors**
- Check if backend server is running
- Verify game code is correct
- Ensure host hasn't left the game

**Players can't connect**
- Verify IP address is correct
- Check firewall settings
- Ensure all devices on same network
- Try restarting the server

**Game runs slowly**
- Check server resources
- Reduce number of concurrent games
- Ensure stable network connection

## Performance Optimization

### For Large Events (50+ participants):

1. **Use a dedicated server computer**
2. **Increase memory allocation**:
   ```bash
   node --max-old-space-size=4096 server.js
   ```
3. **Enable clustering** (multiple CPU cores)
4. **Use Redis for state storage** (optional)

### Network Optimization:
- Use 5GHz Wi-Fi for better performance
- Position router centrally
- Limit other network usage during event
- Consider ethernet connection for host

## Security Considerations

### For Public Events:
```javascript
// In server.js, add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
```

### Production Deployment:
- Use HTTPS with SSL certificates
- Set specific CORS origins
- Implement user authentication
- Add input sanitization
- Monitor for suspicious activity

## Backup and Recovery

### Save Game States:
```bash
# Create backup of active games
curl http://localhost:3001/api/backup > games_backup.json
```

### Restore from Backup:
```bash
# Implement restore endpoint in server.js
POST /api/restore
```

## Monitoring and Logging

### Health Checks:
```bash
# Check server status
curl http://localhost:3001/api/health

# Response should show:
{
  "status": "healthy",
  "activeGames": 5,
  "activePlayers": 23
}
```

### Log Files:
- Server logs in terminal/console
- Error logs can be redirected to files
- Game actions logged in real-time

## Support and Updates

### Getting Help:
1. Check this documentation
2. Look at error logs
3. Test with minimal setup
4. Contact IIT ISM Fintech Club

### Updating the Game:
1. Backup current installation
2. Download latest version
3. Run `npm run setup` again
4. Test functionality

---

**Need more help? Check the README.md or contact support!**
