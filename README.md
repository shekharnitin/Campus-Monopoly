# 🎮 Campus Monopoly Game - IIT (ISM) Dhanbad

A real-time multiplayer monopoly game featuring the actual campus buildings of IIT (ISM) Dhanbad. Perfect for your Fintech Club event!

## 📁 Project Structure

```
campus-monopoly/
├── frontend/           # Web application (HTML, CSS, JS)
│   ├── index.html
│   ├── style.css
│   └── app.js
├── backend/            # Node.js server
│   ├── server.js
│   ├── package.json
│   └── .env
├── docs/              # Documentation
└── README.md          # This file
```

## 🚀 Quick Start

### Option 1: Run with Backend (Recommended)

1. **Install Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/

2. **Navigate to backend folder**
   ```bash
   cd backend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   - Go to: http://localhost:3001
   - The frontend will be served by the backend

### Option 2: Frontend Only (Demo Mode)

1. **Open frontend/index.html** directly in your browser
2. The game will run in demo mode without real multiplayer

## 🎯 How to Use

### For Hosts:
1. Click "Host New Game"
2. Share the 6-digit game code with players
3. Wait for players to join
4. Click "Start Game" when ready

### For Players:
1. Click "Join Game"
2. Enter the game code from host
3. Enter your name
4. Wait for host to start the game

### Playing the Game:
- Roll dice to move around the campus
- Buy properties when you land on them
- Collect rent from other players
- Build facilities to increase rent
- Last player standing wins!

## 🏛️ Campus Properties

### Property Categories:
- **🟤 Brown**: Historic buildings (Old Library, Main Heritage)
- **🔵 Light Blue**: Academic complexes (NLHC, DLHC, CLT)
- **🩷 Pink**: Engineering buildings (Central Research, Science Block)
- **🟠 Orange**: Department buildings (Computer Science, Petroleum)
- **🔴 Red**: Student hostels (Jasper, Sapphire, New Rosaline)
- **🟡 Yellow**: Sports facilities (Sports Complex, Swimming Pool, SAC)
- **🟢 Green**: Library & research (New Central Library, Centre of Excellence)
- **🔵 Blue**: Premium facilities (Seismological Observatory, Shooting Range)

### Special Spaces:
- **🚌 Transport**: Bus Stop, Cycle Stand, Auto Stand, Metro Station
- **⚡ Utilities**: Wi-Fi Network, Power Grid
- **🚪 Main Gate**: Start position (collect ₹200 salary)
- **👮 Jail**: Temporary holding area
- **🅿️ Free Parking**: Safe rest area

## 💡 Features

### ✅ Current Features:
- Real-time multiplayer (up to 8 players)
- Host dashboard with game monitoring
- Property buying and selling
- Rent collection system
- Campus-themed board with actual IIT ISM buildings
- Responsive design (works on mobile and desktop)
- Game state persistence during session
- Player tokens and money management

### 🔄 Coming Soon:
- Property trading between players
- Building houses and hotels
- Auction system for declined properties
- Game statistics and leaderboards
- Sound effects and animations
- Mobile app version

## 🛠️ Technical Details

### Frontend:
- **HTML5, CSS3, JavaScript** - Pure web technologies
- **Socket.IO Client** - Real-time communication
- **Responsive Design** - Works on all devices
- **Progressive Enhancement** - Works without backend

### Backend:
- **Node.js + Express** - Server framework
- **Socket.IO** - WebSocket communication
- **In-memory storage** - Fast game state management
- **Input validation** - Secure data handling
- **CORS enabled** - Cross-origin support

## 🔧 Development

### Backend Development:
```bash
cd backend
npm install
npm run dev  # Starts with nodemon for auto-reload
```

### Testing:
```bash
cd backend
npm test     # Run test suite
```

### Production Deployment:
```bash
# Set environment to production
export NODE_ENV=production

# Start server
npm start
```

## 📱 Deployment Options

### Local Network (Recommended for Events):
1. Start the backend server on one computer
2. Find your IP address (e.g., 192.168.1.100)
3. Share the URL: `http://192.168.1.100:3001`
4. Players can access from their phones/laptops

### Cloud Deployment:
- **Heroku**: Easy deployment with git
- **Railway**: Modern cloud platform
- **DigitalOcean**: VPS hosting
- **AWS/Google Cloud**: Enterprise solutions

## 🎉 Event Setup Guide

### For Your Fintech Club Event:

1. **Pre-Event Setup** (30 minutes before):
   - Set up a laptop/computer with the game running
   - Test the connection with a few devices
   - Prepare the game codes and rules explanation

2. **During the Event**:
   - Display the main game screen on a projector
   - Give each participant the game code
   - Monitor progress from the host dashboard
   - Explain rules and help newcomers

3. **Event Tips**:
   - Have backup game codes ready
   - Designate tech helpers for troubleshooting
   - Consider prizes for winners
   - Take screenshots for social media!

## 🆘 Troubleshooting

### Common Issues:

**"Cannot connect to server"**
- Make sure the backend is running on port 3001
- Check if firewall is blocking connections
- Verify the URL is correct

**"Game code not found"**
- Ensure the game code is typed correctly
- Check if the host's game is still active
- Try creating a new game

**"Not your turn" error**
- Wait for your turn in the player rotation
- Check if the game has started
- Look at the current player indicator

### Getting Help:
- Check the browser console for error messages
- Verify Node.js version (should be 16+)
- Ensure all dependencies are installed
- Contact the IIT ISM Fintech Club for support

## 🏆 Game Rules Summary

1. **Movement**: Roll dice to move clockwise around the board
2. **Properties**: Buy unowned properties you land on
3. **Rent**: Pay rent when landing on others' properties
4. **Money**: Start with ₹1,500, collect ₹200 for passing Main Gate
5. **Winning**: Last player with money wins!

## 📄 License

MIT License - Feel free to modify and distribute!

## 👥 Credits

- **Developed by**: IIT (ISM) Dhanbad Fintech Club
- **Campus Map**: IIT (ISM) Dhanbad Official
- **Game Design**: Classic Monopoly rules adapted for campus
- **Technology**: Node.js, Socket.IO, HTML5

---

**Have fun playing Campus Monopoly! 🎮🏛️**

For questions or issues, contact the Fintech Club at IIT (ISM) Dhanbad.
