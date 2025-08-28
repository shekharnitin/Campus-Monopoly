// Campus Monopoly Game Client - Enhanced Version
const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://campus-monopoly.onrender.com/';
let socket = null;
let gameState = {
    currentPlayer: null,
    isHost: false,
    gameCode: null,
    players: [],
    board: [],
    gamePhase: 'menu' // menu, waiting, playing
};

// Campus buildings data
const campusBuildings = [
    { "name": "Main Gate", "type": "start", "position": 0 },
    { "name": "Old Library Building", "type": "property", "position": 1, "price": 60, "color": "brown", "rent": [2, 10, 30, 90, 160, 250] },
    { "name": "Community Chest", "type": "community_chest", "position": 2 },
    { "name": "Heritage Building", "type": "property", "position": 3, "price": 80, "color": "brown", "rent": [4, 20, 60, 180, 320, 450] },
    { "name": "Income Tax", "type": "tax", "position": 4, "amount": 200 },
    { "name": "RD", "type": "property", "position": 5, "price": 200, "color": "blue", "rent": [8, 40, 100, 300, 450, 600]},
    { "name": "NLHC", "type": "property", "position": 6, "price": 100, "color": "light_blue", "rent": [6, 30, 90, 270, 400, 550] },
    { "name": "Chance", "type": "chance", "position": 7 },
    { "name": "OAT", "type": "property", "position": 8, "price": 120, "color": "blue", "rent": [8, 40, 100, 300, 450, 600] },
    { "name": "Penman Auditorium", "type": "property", "position": 9, "price": 140, "color": "blue", "rent": [10, 50, 150, 450, 625, 750] },
    { "name": "Jail", "type": "jail", "position": 10 },
    { "name": "Central Research Facility", "type": "property", "position": 11, "price": 140, "color": "pink", "rent": [10, 50, 150, 450, 625, 750] },
    { "name": "Wi-Fi Network", "type": "utility", "position": 12, "price": 150 },
    { "name": "Science Block", "type": "property", "position": 13, "price": 160, "color": "orange", "rent": [12, 60, 180, 500, 700, 900] },
    { "name": "Management Studies", "type": "property", "position": 14, "price": 180, "color": "orange", "rent": [14, 70, 200, 550, 750, 950] },
    { "name": "Cycle Stand", "type": "transport", "position": 15, "price": 200 },
    { "name": "Computer Science", "type": "property", "position": 16, "price": 180, "color": "orange", "rent": [14, 70, 200, 550, 750, 950] },
    { "name": "Community Chest", "type": "community_chest", "position": 17 },
    { "name": "Petroleum Engineering", "type": "property", "position": 18, "price": 200, "color": "orange", "rent": [16, 80, 220, 600, 800, 1000] },
    { "name": "Environmental Science", "type": "property", "position": 19, "price": 220, "color": "orange", "rent": [18, 90, 250, 700, 875, 1050] },
    { "name": "Free Parking", "type": "free_parking", "position": 20 },
    { "name": "Jasper Hostel", "type": "property", "position": 21, "price": 220, "color": "red", "rent": [18, 90, 250, 700, 875, 1050] },
    { "name": "Chance", "type": "chance", "position": 22 },
    { "name": "Sapphire Hostel", "type": "property", "position": 23, "price": 240, "color": "red", "rent": [20, 100, 300, 750, 925, 1100] },
    { "name": "New Rosaline Hostel", "type": "property", "position": 24, "price": 260, "color": "red", "rent": [22, 110, 330, 800, 975, 1150] },
    { "name": "Auto Stand", "type": "transport", "position": 25, "price": 200 },
    { "name": "Sports Complex", "type": "property", "position": 26, "price": 260, "color": "yellow", "rent": [22, 110, 330, 800, 975, 1150] },
    { "name": "Swimming Pool", "type": "property", "position": 27, "price": 280, "color": "yellow", "rent": [24, 120, 360, 850, 1025, 1200] },
    { "name": "Power Grid", "type": "utility", "position": 28, "price": 150 },
    { "name": "SAC", "type": "property", "position": 29, "price": 300, "color": "blue", "rent": [26, 130, 390, 900, 1100, 1275] },
    { "name": "Go to Jail", "type": "go_to_jail", "position": 30 },
    { "name": "Central Library", "type": "property", "position": 31, "price": 300, "color": "green", "rent": [26, 130, 390, 900, 1100, 1275] },
    { "name": "Opal Hostel", "type": "property", "position": 32, "price": 280, "color": "red", "rent": [28, 150, 450, 1000, 1200, 1400] },
    { "name": "Community Chest", "type": "community_chest", "position": 33 },
    { "name": "Aquamarine Hostel", "type": "property", "position": 34, "price": 320, "color": "red", "rent": [28, 150, 450, 1000, 1200, 1400] },
    { "name": "NAC", "type": "property", "position": 35, "price": 200, "color": "light_blue", "rent": [6, 30, 90, 270, 400, 550] },
    { "name": "Chance", "type": "chance", "position": 36 },
    { "name": "EDC", "type": "property", "position": 37, "price": 350, "color": "blue", "rent": [35, 175, 500, 1100, 1300, 1500] },
    { "name": "Luxury Tax", "type": "tax", "position": 38, "amount": 100 },
    { "name": "Shooting Range", "type": "property", "position": 39, "price": 400, "color": "blue", "rent": [50, 200, 600, 1400, 1700, 2000] }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeUI();
    connectToServer();
});

function connectToServer() {
    socket = io(BACKEND_URL);

    socket.on('connect', () => {
        console.log('Connected to server');
        showStatus('Connected to server', 'success');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        showStatus('Disconnected from server', 'error');
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
        showStatus(error.message || 'Server error', 'error');
    });

    setupSocketListeners();
}

function setupSocketListeners() {
    socket.on('gameCreated', handleGameCreated);
    socket.on('gameJoined', handleGameJoined);
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('gameStarted', handleGameStarted);
    socket.on('diceRolled', handleDiceRolled);
    socket.on('propertyPurchased', handlePropertyPurchased);
    socket.on('rentPaid', handleRentPaid);
    socket.on('turnEnded', handleTurnEnded);
    socket.on('gameEnded', handleGameEnded);
    socket.on('playerLeft', handlePlayerLeft);
}

function initializeUI() {
    // Main menu buttons
    document.getElementById('hostGameBtn').addEventListener('click', showHostGame);
    document.getElementById('joinGameBtn').addEventListener('click', showJoinGame);
    document.getElementById('viewRulesBtn').addEventListener('click', showRules);

    // Join game form
    document.getElementById('joinGameSubmitBtn').addEventListener('click', joinGame);
    document.getElementById('backToMenuBtn').addEventListener('click', showMainMenu);

    // Host controls
    document.getElementById('startGameBtn').addEventListener('click', startGame);
    document.getElementById('endGameBtn').addEventListener('click', endGame);
    document.getElementById('copyCodeBtn').addEventListener('click', copyGameCode);

    // Game controls
    document.getElementById('rollDiceBtn').addEventListener('click', rollDice);
    document.getElementById('buyPropertyBtn').addEventListener('click', buyProperty);
    document.getElementById('sellPropertyBtn').addEventListener('click', sellProperty);
    document.getElementById('endTurnBtn').addEventListener('click', endTurn);

    // Initialize board
    createBoard();
    createPropertyInfoCard();
}

function updateGameState(newState) {
    Object.assign(gameState, newState);
    updateUI();
}

function updateUI() {
    updatePlayerInfo();
    updateGameBoard();
    updatePlayersList(gameState.players || []);
    updateSidebar();
}

function rollDice() {
    if (socket && socket.connected) {
        // Add rolling animation
        const dice1El = document.getElementById('dice1');
        const dice2El = document.getElementById('dice2');
        
        dice1El.classList.add('rolling');
        dice2El.classList.add('rolling');
        
        setTimeout(() => {
            dice1El.classList.remove('rolling');
            dice2El.classList.remove('rolling');
        }, 1000);
        
        socket.emit('rollDice');
    } else {
        // Demo mode fallback
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        updateDiceDisplay(dice1, dice2);
        showStatus(`Rolled ${dice1} + ${dice2} = ${dice1 + dice2}`, 'info');
    }
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

function showMainMenu() {
    showScreen('mainMenu');
    gameState.gamePhase = 'menu';
}

function showHostGame() {
    if (socket && socket.connected) {
        const hostName = prompt('Enter your name as host:');
        if (hostName) {
            socket.emit('createGame', { hostName: hostName });
        }
    } else {
        showStatus('Backend not available. Cannot host multiplayer game.', 'error');
    }
}

function showJoinGame() {
    if (socket && socket.connected) {
        showScreen('joinGameScreen');
    } else {
        showStatus('Backend not available. Cannot join multiplayer game.', 'error');
    }
}

function showRules() {
    alert(`IIT (ISM) Dhanbad Campus Monopoly Rules:

1. Players take turns rolling dice and moving around the board
2. Buy campus properties when you land on them
3. Collect rent from other players who land on your properties
4. Build facilities (houses) and major facilities (hotels) to increase rent
5. The last player remaining wins!

Campus Property Categories:
• Brown: Historic buildings (Old Library, Main Heritage)
• Light Blue: Academic complexes (NLHC, NAC)
• Pink: Engineering buildings (Central Research)
• Orange: Department buildings (Computer Science, Petroleum, etc.)
• Red: Student hostels (Jasper, Sapphire, New Rosaline, etc.)
• Yellow: Sports facilities (Sports Complex, Swimming Pool)
• Green: Library & research (Central Library)
• Blue: Facilities (RD, OAT, Penman, SAC, EDC, Shooting Range)

Transport: Bus Stop, Cycle Stand, Auto Stand, Metro Station
Utilities: Wi-Fi Network, Power Grid

Good luck and have fun!`);
}

function joinGame() {
    const gameCode = document.getElementById('gameCodeInput').value.toUpperCase();
    const playerName = document.getElementById('playerNameInput').value;

    if (!gameCode || !playerName) {
        showStatus('Please enter both game code and your name', 'error');
        return;
    }

    if (socket && socket.connected) {
        socket.emit('joinGame', { gameCode, playerName });
    } else {
        showStatus('Backend not available', 'error');
    }
}

function startGame() {
    if (socket && socket.connected) {
        socket.emit('startGame');
    }
}

function endGame() {
    if (confirm('Are you sure you want to end the game?')) {
        showMainMenu();
    }
}

function copyGameCode() {
    const gameCode = document.getElementById('hostGameCode').textContent;
    navigator.clipboard.writeText(gameCode).then(() => {
        showStatus('Game code copied to clipboard!', 'success');
    });
}

function buyProperty() {
    if (socket && socket.connected) {
        socket.emit('buyProperty');
    } else {
        showStatus('Property purchased in demo mode', 'success');
        document.getElementById('buyPropertyBtn').style.display = 'none';
        document.getElementById('endTurnBtn').style.display = 'inline-block';
    }
}

function sellProperty() {
    showStatus('Property selling feature coming soon!', 'info');
}

function endTurn() {
    if (socket && socket.connected) {
        socket.emit('endTurn');
    } else {
        // Demo mode
        document.getElementById('rollDiceBtn').disabled = true;
        document.getElementById('endTurnBtn').style.display = 'none';
        showStatus('Turn ended in demo mode', 'info');
    }
}

// Socket event handlers
function handleGameCreated(data) {
    gameState.isHost = true;
    gameState.gameCode = data.gameCode;
    gameState.gamePhase = 'waiting';
    gameState.players = data.game.players;

    document.getElementById('hostGameCode').textContent = data.gameCode;
    showScreen('hostDashboard');
    updatePlayersList(data.game.players);
}

function handleGameJoined(data) {
    gameState.isHost = false;
    gameState.gameCode = data.gameCode;
    gameState.currentPlayer = data.player;
    gameState.gamePhase = 'waiting';
    gameState.players = data.game.players;

    document.getElementById('waitingGameCode').textContent = data.gameCode;

    showStatus(`Joined game ${data.gameCode} successfully!`, 'success');
    showScreen('playerWaiting');
}

function handlePlayerJoined(data) {
    if (gameState.isHost) {
        gameState.players = data.game.players;
        updatePlayersList(data.game.players);
    }
}

function handleGameStarted(data) {
    gameState.players = data.game.players;
    gameState.currentPlayer = data.currentPlayer;
    gameState.board = data.game.board;
    gameState.gamePhase = 'playing';

    showScreen('gameBoard');
    updateGameBoard();
    updatePlayerInfo();
    updatePlayerPieces();
    updateSidebar();
}

function handleDiceRolled(data) {
    updateDiceDisplay(data.dice[0], data.dice[1]);
    addToGameLog(`${data.player.name} rolled ${data.dice[0]} + ${data.dice[1]} = ${data.totalRoll}`);

    // Update game state with new player positions
    gameState.players = data.game.players;
    gameState.currentPlayer = data.player;
    
    // Animate player movement
    animatePlayerMovement(data.player, data.newPosition);

    // Show property action buttons if landed on purchasable property
    const property = data.landedProperty;
    if (['property', 'transport', 'utility'].includes(property.type) && !property.owner) {
        document.getElementById('buyPropertyBtn').style.display = 'inline-block';
    }

    document.getElementById('endTurnBtn').style.display = 'inline-block';
    updateSidebar();
}

function handlePropertyPurchased(data) {
    addToGameLog(`${data.player.name} bought ${data.property.name} for ₹${data.property.price}`);
    
    // Update game state
    gameState.players = data.game.players;
    gameState.board = data.game.board;
    
    updatePlayerInfo();
    updateGameBoard();
    updateSidebar();
    document.getElementById('buyPropertyBtn').style.display = 'none';
}

function handleRentPaid(data) {
    addToGameLog(`${data.payer.name} paid ₹${data.amount} rent to ${data.receiver.name}`);
    
    // Update game state
    gameState.players = data.game.players;
    updatePlayerInfo();
    updateSidebar();
}

function handleTurnEnded(data) {
    gameState.currentPlayer = data.nextPlayer;
    gameState.players = data.game.players;
    updatePlayerInfo();
    updateSidebar();

    // Hide action buttons
    document.getElementById('buyPropertyBtn').style.display = 'none';
    document.getElementById('endTurnBtn').style.display = 'none';
    document.getElementById('rollDiceBtn').disabled = false;
}

function handleGameEnded(data) {
    if (data.winner) {
        showStatus(`Game Over! ${data.winner.name} wins!`, 'success');
    } else {
        showStatus(`Game ended: ${data.reason}`, 'info');
    }

    setTimeout(showMainMenu, 3000);
}

function handlePlayerLeft(data) {
    if (gameState.isHost) {
        showStatus(`Player left the game`, 'info');
    }
}

// UI update functions
function updatePlayersList(players) {
    const playersList = document.getElementById('playersList');
    const playerCount = document.getElementById('playerCount');
    const startBtn = document.getElementById('startGameBtn');

    playerCount.textContent = players.length;

    if (players.length === 0) {
        playersList.innerHTML = '<div class="text-muted">No players joined yet...</div>';
        startBtn.disabled = true;
    } else {
        playersList.innerHTML = players.map(player => 
            `<div class="player-card">
                <span>${player.token} ${player.name}</span>
                <span>₹${player.money}</span>
            </div>`
        ).join('');

        startBtn.disabled = players.length < 2;
    }
}

function createBoard() {
    const boardSpaces = document.getElementById('boardSpaces');
    if (!boardSpaces) return;

    boardSpaces.innerHTML = '';

    campusBuildings.forEach((building, index) => {
        const space = document.createElement('div');
        space.className = `board-space ${building.color || building.type}`;
        space.innerHTML = `
            <div class="space-name">${building.name}</div>
            ${building.price ? `<div class="space-price">₹${building.price}</div>` : ''}
        `;
        space.id = `space-${index}`;

        // Position spaces in rectangle (Monopoly board layout)
        let x, y;
        if (index <= 10) {
            // Bottom row (right to left)
            x = 90 - (index * 8);
            y = 90;
        } else if (index <= 20) {
            // Left column (bottom to top)
            x = 10;
            y = 90 - ((index - 10) * 8);
        } else if (index <= 30) {
            // Top row (left to right)
            x = 10 + ((index - 20) * 8);
            y = 10;
        } else {
            // Right column (top to bottom)
            x = 90;
            y = 10 + ((index - 30) * 8);
        }

        space.style.left = `${x}%`;
        space.style.top = `${y}%`;
        space.style.width = '80px';  
        space.style.height = '60px';

        // Add hover events for property info
        if (building.type === 'property' || building.type === 'transport' || building.type === 'utility') {
            space.addEventListener('mouseenter', (e) => showPropertyInfo(e, building, index));
            space.addEventListener('mouseleave', hidePropertyInfo);
        }

        boardSpaces.appendChild(space);
    });
}

function createPropertyInfoCard() {
    const infoCard = document.createElement('div');
    infoCard.id = 'property-info-card';
    infoCard.className = 'property-info-card hidden';
    document.body.appendChild(infoCard);
}

function showPropertyInfo(event, building, position) {
    const infoCard = document.getElementById('property-info-card');
    const boardProperty = gameState.board && gameState.board[position] ? gameState.board[position] : building;
    
    let content = `<h3>${building.name}</h3>`;
    
    if (building.type === 'property') {
        content += `
            <div class="property-price">Price: ₹${building.price}</div>
            <div class="property-rent">
                <strong>Rent:</strong><br>
                Base: ₹${building.rent[0]}<br>
                1 House: ₹${building.rent[1]}<br>
                2 Houses: ₹${building.rent[2]}<br>
                3 Houses: ₹${building.rent[3]}<br>
                4 Houses: ₹${building.rent[4]}<br>
                Hotel: ₹${building.rent[5]}
            </div>
        `;
    } else if (building.type === 'transport') {
        content += `
            <div class="property-price">Price: ₹${building.price}</div>
            <div class="property-rent">
                <strong>Rent:</strong><br>
                1 Transport: ₹25<br>
                2 Transports: ₹50<br>
                3 Transports: ₹100<br>
                4 Transports: ₹200
            </div>
        `;
    } else if (building.type === 'utility') {
        content += `
            <div class="property-price">Price: ₹${building.price}</div>
            <div class="property-rent">
                <strong>Rent:</strong><br>
                1 Utility: 4 × dice roll<br>
                2 Utilities: 10 × dice roll
            </div>
        `;
    }
    
    if (boardProperty.owner) {
        const owner = gameState.players.find(p => p.id === boardProperty.owner);
        if (owner) {
            content += `<div class="property-owner">Owner: ${owner.name} ${owner.token}</div>`;
        }
    }
    
    infoCard.innerHTML = content;
    infoCard.classList.remove('hidden');
    
    // Position the card above the property space
    const rect = event.target.getBoundingClientRect();
    
    
    // Calculate position to center the card above the property
    let left = rect.left + (rect.width / 2) - (200 / 2); // 200px is approximate card width
    let top = rect.top - 200; // Position above the property with 10px gap
    
    // Ensure the card stays within viewport
    const viewportWidth = window.innerWidth;
    
    
    // Adjust horizontal position if card would go off screen
    if (left < 10) left = 10;
    if (left + 200 > viewportWidth - 10) left = viewportWidth - 210;
    
    // If card would go above viewport, show it below the property instead
    if (top < 10) {
        top = 10;
    }
    
    infoCard.style.left = `${left}px`;
    infoCard.style.top = `${top}px`;
}

function hidePropertyInfo() {
    const infoCard = document.getElementById('property-info-card');
    infoCard.classList.add('hidden');
}

function updateGameBoard() {
    // Update board with current game state
    if (gameState.board) {
        gameState.board.forEach((space, index) => {
            const spaceElement = document.getElementById(`space-${index}`);
            if (spaceElement && space.owner) {
                spaceElement.classList.add('owned');
                
                // Add owner indicator
                const owner = gameState.players.find(p => p.id === space.owner);
                if (owner) {
                    spaceElement.style.borderColor = getPlayerColor(owner.token);
                }
            }
        });
    }
    updatePlayerPieces();
}

function updatePlayerPieces() {
    // Remove all existing player pieces
    document.querySelectorAll('.player-piece').forEach(piece => piece.remove());
    
    if (!gameState.players) return;
    
    // Add player pieces to their current positions
    gameState.players.forEach((player, playerIndex) => {
        if (player.bankrupt) return;
        
        const spaceElement = document.getElementById(`space-${player.position}`);
        if (spaceElement) {
            const piece = document.createElement('div');
            piece.className = 'player-piece';
            piece.textContent = player.token;
            piece.style.backgroundColor = getPlayerColor(player.token);
            piece.title = player.name;
            
            // Position multiple pieces on the same space
            const existingPieces = spaceElement.querySelectorAll('.player-piece');
            piece.style.left = `${5 + (existingPieces.length * 15)}px`;
            piece.style.top = `${5}px`;
            
            spaceElement.appendChild(piece);
        }
    });
}

function animatePlayerMovement(player, newPosition) {
    // Find and remove the old piece
    document.querySelectorAll('.player-piece').forEach(piece => {
        if (piece.textContent === player.token && piece.title === player.name) {
            piece.remove();
        }
    });
    
    // Add piece to new position with animation
    setTimeout(() => {
        updatePlayerPieces();
        
        // Highlight the new position briefly
        const newSpace = document.getElementById(`space-${newPosition}`);
        if (newSpace) {
            newSpace.classList.add('highlight');
            setTimeout(() => newSpace.classList.remove('highlight'), 2000);
        }
    }, 500);
}

function getPlayerColor(token) {
    const colors = {
        '🎓': '#ff6b35', // Orange
        '📚': '#4ecdc4', // Teal  
        '⚗️': '#45b7d1', // Blue
        '🏗️': '#96ceb4', // Green
        '🎯': '#ffeaa7', // Yellow
        '🏆': '#dda0dd', // Plum
        '🎨': '#ff7675', // Red
        '🔬': '#a29bfe'  // Purple
    };
    return colors[token] || '#666';
}

function updatePlayerInfo() {
    const nameEl = document.getElementById('currentPlayerName');
    const moneyEl = document.getElementById('currentPlayerMoney');

    if (gameState.currentPlayer) {
        nameEl.textContent = `${gameState.currentPlayer.token} ${gameState.currentPlayer.name}`;
        moneyEl.textContent = `₹${gameState.currentPlayer.money}`;
    }
}

function updateDiceDisplay(dice1, dice2) {
    document.getElementById('dice1').textContent = dice1;
    document.getElementById('dice2').textContent = dice2;
}

function addToGameLog(message) {
    const gameLog = document.getElementById('gameLog');
    if (gameLog) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = message;
        gameLog.appendChild(entry);
        gameLog.scrollTop = gameLog.scrollHeight;

        // Keep only last 10 entries
        while (gameLog.children.length > 10) {
            gameLog.removeChild(gameLog.firstChild);
        }
    }
}

function updateSidebar() {
    updatePlayerProperties();
    updateAllPlayers();
}

function updatePlayerProperties() {
    const playerPropertiesEl = document.getElementById('playerProperties');
    if (!playerPropertiesEl || !gameState.currentPlayer || !gameState.board) return;

    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer.id);
    if (!currentPlayer) return;

    const ownedProperties = gameState.board.filter(space => 
        space.owner === currentPlayer.id && 
        ['property', 'transport', 'utility'].includes(space.type)
    );

    if (ownedProperties.length === 0) {
        playerPropertiesEl.innerHTML = '<div class="text-muted">No properties owned</div>';
        return;
    }

    playerPropertiesEl.innerHTML = ownedProperties.map(property => {
        const building = campusBuildings[property.position];
        return `
            <div class="property-item ${building.color || building.type}">
                <div class="property-name">${building.name}</div>
                <div class="property-value">₹${building.price}</div>
                ${property.houses > 0 ? `<div class="property-houses">${property.houses} houses</div>` : ''}
            </div>
        `;
    }).join('');
}

function updateAllPlayers() {
    const allPlayersEl = document.getElementById('allPlayers');
    if (!allPlayersEl || !gameState.players) return;

    allPlayersEl.innerHTML = gameState.players.map(player => {
        const isCurrentPlayer = gameState.currentPlayer && player.id === gameState.currentPlayer.id;
        const propertyCount = gameState.board ? 
            gameState.board.filter(space => space.owner === player.id).length : 0;

        return `
            <div class="player-summary ${isCurrentPlayer ? 'current-player' : ''} ${player.bankrupt ? 'bankrupt' : ''}">
                <div class="player-info">
                    <span class="player-token">${player.token}</span>
                    <span class="player-name">${player.name}</span>
                </div>
                <div class="player-stats">
                    <div class="player-money">₹${player.money}</div>
                    <div class="player-properties">${propertyCount} properties</div>
                </div>
            </div>
        `;
    }).join('');
}

function showStatus(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);

    const statusDiv = document.createElement('div');
    statusDiv.className = `status-message status-${type}`;
    statusDiv.textContent = message;
    statusDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    switch(type) {
        case 'success': statusDiv.style.backgroundColor = '#059669'; break;
        case 'error': statusDiv.style.backgroundColor = '#dc2626'; break;
        case 'warning': statusDiv.style.backgroundColor = '#d97706'; break;
        default: statusDiv.style.backgroundColor = '#2563eb';
    }

    document.body.appendChild(statusDiv);

    setTimeout(() => {
        if (statusDiv.parentNode) {
            statusDiv.parentNode.removeChild(statusDiv);
        }
    }, 4000);
}