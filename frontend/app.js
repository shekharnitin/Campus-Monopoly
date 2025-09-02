// Campus Monopoly Game Client - Enhanced Version
const BACKEND_URL = (() => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3001';
    } else {
        // Use the same origin for production deployments
        return window.location.origin;
    }
})();

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
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
    { "name": "RD", "type": "property", "position": 5, "price": 200, "color": "blue", "rent": [8, 40, 100, 300, 450, 600] },
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
document.addEventListener('DOMContentLoaded', function () {
    // Wait a bit before connecting to ensure DOM is fully loaded
    setTimeout(() => {
        initializeUI();
        connectToServer();
    }, 100);
});

function connectToServer() {
    if (socket && socket.connected) {
        console.log('Already connected to server');
        return;
    }

    // Check if io is available
    if (typeof io === 'undefined') {
        console.error('Socket.IO not loaded. Make sure the script tag is correct.');
        showStatus('Socket.IO library not loaded. Please refresh the page.', 'error');
        return;
    }

    console.log(`Attempting to connect to: ${BACKEND_URL}`);

    socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 5000,
        forceNew: true
    });

    socket.on('connect', () => {
        console.log('Successfully connected to server');
        reconnectAttempts = 0;
        showStatus('Connected to server', 'success');
    });

    socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
        showStatus(`Disconnected: ${reason}`, 'warning');

        // Don't auto-reconnect if it was intentional
        if (reason === 'io client disconnect') {
            return;
        }
    });

    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reconnectAttempts++;

        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            showStatus('Failed to connect to server. Please check if the server is running on port 3001.', 'error');
        } else {
            showStatus(`Connection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} failed. Retrying...`, 'warning');
        }
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
        showStatus(error.message || 'Server error occurred', 'error');
    });

    setupSocketListeners();
}

function setupSocketListeners() {
    if (!socket) return;

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
    socket.on('taxPaid', handleTaxPaid);
    socket.on('cardDrawn', handleCardDrawn);
    socket.on('playerSentToJail', handlePlayerSentToJail);
    socket.on('playerLeftJail', handlePlayerLeftJail);
    socket.on('jailTurnFailed', handleJailTurnFailed);
    socket.on('buildingOffer', handleBuildingOffer);
    socket.on('propertyBuilt', handlePropertyBuilt);
    socket.on('gameStateChanged', handleGameStateChanged);
    socket.on('playerKicked', handlePlayerKicked);
    socket.on('gameUpdated', (data) => {
        console.log("Full game state received from server.");
        // Update the local game state with the authoritative one from the server
        gameState.players = data.game.players;
        gameState.board = data.game.board;
        gameState.currentPlayer = data.game.players[data.game.currentPlayerIndex];
        // Now, refresh all UI components
        updateUI();
        updateHostDashboard();
    });
    socket.on('hostMessage', (data) => {
        // We can reuse our existing status popup to show the message
        showStatus(`Host Announcement: ${data.message}`, 'info');
    });
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
    document.getElementById('endGameHostBtn').addEventListener('click', endGame);

    // Add null check for copyCodeBtn
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', copyGameCode);
    }

    // Game controls
    document.getElementById('rollDiceBtn').addEventListener('click', rollDice);
    document.getElementById('buyPropertyBtn').addEventListener('click', buyProperty);
    document.getElementById('sellPropertyBtn').addEventListener('click', sellProperty);
    document.getElementById('endTurnBtn').addEventListener('click', endTurn);

    // Initialize board
    createBoard();
    createPropertyInfoCard();

    // Add null check for spectator copy button
    const copySpectatorCodeBtn = document.getElementById('copySpectatorCodeBtn');
    if (copySpectatorCodeBtn) {
        copySpectatorCodeBtn.addEventListener('click', copySpectatorGameCode);
    }
}

function copyGameCode() {
    const gameCode = gameState.gameCode || document.getElementById('hostGameCode').textContent;
    if (gameCode && gameCode !== '------') {
        navigator.clipboard.writeText(gameCode).then(() => {
            showStatus('Game code copied to clipboard!', 'success');
        }).catch(() => {
            showStatus('Failed to copy game code', 'error');
        });
    }
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
    updateJailCardCounter();
    updateCurrentTurnDisplay();
}

function rollDice() {
    if (!socket || !socket.connected) {
        showStatus('Connection lost. Please refresh the page.', 'error');
        return;
    }

    if (gameState.gamePhase !== 'playing') {
        showStatus('Game is not in progress', 'warning');
        return;
    }

    // Add rolling animation
    const dice1El = document.getElementById('dice1');
    const dice2El = document.getElementById('dice2');

    if (dice1El && dice2El) {
        dice1El.classList.add('rolling');
        dice2El.classList.add('rolling');

        setTimeout(() => {
            dice1El.classList.remove('rolling');
            dice2El.classList.remove('rolling');
        }, 1000);
    }

    socket.emit('rollDice');
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
    }
}

function showMainMenu() {
    showScreen('mainMenu');
    gameState.gamePhase = 'menu';
}

function showHostGame() {
    if (!socket || !socket.connected) {
        showStatus('Connection lost. Please refresh and try again.', 'error');
        return;
    }

    const hostName = prompt('Enter your name as host:');
    if (!hostName || hostName.trim().length < 2) {
        showStatus('Please enter a valid name (at least 2 characters)', 'error');
        return;
    }

    console.log('Sending createGame event:', { hostName: hostName.trim() });
    socket.emit('createGame', { hostName: hostName.trim() });
}

function showJoinGame() {
    if (!socket || !socket.connected) {
        showStatus('Connection lost. Please refresh and try again.', 'error');
        return;
    }

    showScreen('joinGameScreen');
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
    const gameCode = document.getElementById('gameCodeInput').value.trim().toUpperCase();
    const playerName = document.getElementById('playerNameInput').value.trim();

    // Input validation
    if (!gameCode || gameCode.length !== 6) {
        showStatus('Please enter a valid 6-character game code', 'error');
        return;
    }

    if (!playerName || playerName.length < 2) {
        showStatus('Please enter a valid name (at least 2 characters)', 'error');
        return;
    }

    if (playerName.length > 20) {
        showStatus('Name must be 20 characters or less', 'error');
        return;
    }

    if (!socket || !socket.connected) {
        showStatus('Connection lost. Please refresh and try again.', 'error');
        return;
    }

    socket.emit('joinGame', { gameCode, playerName });
}

function startGame() {
    if (!socket || !socket.connected) {
        showStatus('Connection lost. Cannot start game.', 'error');
        return;
    }

    console.log('Starting game...');
    socket.emit('startGame');
}



function copySpectatorGameCode() {
    const gameCode = document.getElementById('spectatorGameCode').textContent;
    if (gameCode) {
        navigator.clipboard.writeText(gameCode).then(() => {
            showStatus('Game code copied to clipboard!', 'success');
        }).catch(() => {
            showStatus('Failed to copy game code', 'error');
        });
    }
}

function buyProperty() {
    if (!socket || !socket.connected) {
        showStatus('Connection lost. Please refresh the page.', 'error');
        return;
    }

    socket.emit('buyProperty');
}

function sellProperty() {
    showStatus('Property selling feature coming soon!', 'info');
}

function endTurn() {
    if (!socket || !socket.connected) {
        showStatus('Connection lost. Please refresh the page.', 'error');
        return;
    }
    socket.emit('endTurn');
}

// Socket event handlers
function handleGameCreated(data) {
    console.log('Game created:', data);
    gameState.isHost = true;
    gameState.gameCode = data.gameCode;
    gameState.gamePhase = 'waiting';
    gameState.players = data.game?.players || [];

    document.getElementById('hostGameCode').textContent = data.gameCode;
    showScreen('hostDashboard');
    updatePlayersList(gameState.players);
    updatePlayerCount();

    showStatus('Game created! You are now the host/spectator. Share the code for players to join.', 'success');
}

function handleGameJoined(data) {
    console.log('Joined game:', data);
    gameState.isHost = false;
    gameState.gameCode = data.game.code;
    gameState.currentPlayer = data.player;
    gameState.gamePhase = 'waiting';
    gameState.players = data.game.players;

    document.getElementById('waitingGameCode').textContent = data.game.code;

    showStatus(`Joined game ${data.game.code} successfully!`, 'success');
    showScreen('playerWaiting');

    updatePlayersList(gameState.players);
    updatePlayerCount();
}

function handlePlayerJoined(data) {
    console.log('Player joined event received:', data);
    // Update for both host and regular players
    if (data.game && data.game.players) {
        gameState.players = data.game.players;
        updatePlayersList(data.game.players);

        // Show notification about new player
        if (data.player && data.player.name) {
            showStatus(`${data.player.name} joined the game`, 'success');
        }
    }

    // Update player count displays
    updatePlayerCount();
}
function updatePlayerCount() {
    const playerCountElements = document.querySelectorAll('#playerCount, #waitingPlayerCount');

    playerCountElements.forEach(element => {
        if (element) {
            element.textContent = gameState.players.length;
        }
    });

    // Update start button availability for host
    if (gameState.isHost) {
        const startBtn = document.getElementById('startGameBtn');
        if (startBtn) {
            if (gameState.players.length >= 2) {
                startBtn.disabled = false;
                startBtn.textContent = `Start Game (${gameState.players.length} players)`;
            } else {
                startBtn.disabled = true;
                startBtn.textContent = `Start Game (Need ${2 - gameState.players.length} more players)`;
            }
        }
    }
}


function handleGameStarted(data) {
    gameState.players = data.game.players;
    gameState.currentPlayer = data.currentPlayer;
    gameState.board = data.game.board;
    gameState.gamePhase = 'playing';

    if (gameState.isHost) {
        // Host sees spectator view
        showScreen('hostSpectatorView');
        document.getElementById('spectatorGameCode').textContent = gameState.gameCode;
        updateHostDashboard();

        // Copy board to spectator view
        createSpectatorBoard();
    } else {
        // Players see normal game board
        showScreen('gameBoard');
    }
    updateGameBoard();
    updatePlayerInfo();
    updatePlayerPieces();
    updateSidebar();
    updateCurrentTurnDisplay();
}

function createSpectatorBoard() {
    // 1. Target the spectator's .monopoly-board grid container
    const spectatorBoard = document.querySelector('#spectatorBoard.monopoly-board');
    if (!spectatorBoard) return;

    // Clear only the spaces, keeping the center div
    spectatorBoard.querySelectorAll('.board-space').forEach(space => space.remove());

    campusBuildings.forEach((building) => {
        const space = document.createElement('div');
        space.className = `board-space ${building.color || building.type}`;

        // Use the 'position' from the server data
        space.setAttribute('data-position', building.position);

        space.innerHTML = `
            <div class="space-name">${building.name}</div>
            ${building.price ? `<div class="space-price">₹${building.price}</div>` : ''}
        `;

        // Set the ID to match the CSS Grid positioning (position + 1)
        space.id = `space-${building.position + 1}`;

        spectatorBoard.appendChild(space);
    });
}

function createBoard() {
    // 1. Target the .monopoly-board grid container directly
    const boardContainer = document.querySelector('#gameBoard .monopoly-board');
    if (!boardContainer) return;

    // Clear only the spaces, keeping the center div
    boardContainer.querySelectorAll('.board-space').forEach(space => space.remove());

    campusBuildings.forEach((building) => {
        const space = document.createElement('div');
        space.className = `board-space ${building.color || building.type}`;

        // Use the 'position' from the server data
        space.setAttribute('data-position', building.position);

        space.innerHTML = `
            <div class="space-name">${building.name}</div>
            ${building.price ? `<div class="space-price">₹${building.price}</div>` : ''}
        `;

        // Set the ID to match the CSS Grid positioning (position + 1)
        space.id = `space-${building.position + 1}`;

        if (['property', 'transport', 'utility'].includes(building.type)) {
            space.addEventListener('mouseenter', (e) => showPropertyInfo(e, building, building.position));
            space.addEventListener('mouseleave', hidePropertyInfo);
        }

        boardContainer.appendChild(space);
    });
}

function handleGameStateChanged(data) {
    gameState.gamePhase = data.gameState;
    showStatus(data.message, 'info');
    updateHostDashboard();
}

function kickPlayer(playerId) {
    if (!gameState.isHost || !socket || !socket.connected) return;

    if (confirm('Are you sure you want to kick this player?')) {
        socket.emit('kickPlayer', { playerId });
    }
}


function handlePlayerKicked(data) {
    showStatus(data.reason, 'warning');
    setTimeout(showMainMenu, 2000);
}

function handleDiceRolled(data) {
    updateDiceDisplay(data.dice[0], data.dice[1]);
    addToGameLog(`${data.player.name} rolled ${data.dice[0]} + ${data.dice[1]} = ${data.totalRoll}`);

    // Update game state with new player positions
    gameState.players = data.game.players;
    gameState.currentPlayer = data.player;

    // Animate player movement
    animatePlayerMovement(data.player, data.newPosition);

    // Check if player is just visiting jail
    const property = data.landedProperty;
    if (property.type === 'jail' && !data.player.inJail) {
        showStatus('Just Visiting Detention - no penalty!', 'info');
    }

    // Show property action buttons if landed on purchasable property
    if (['property', 'transport', 'utility'].includes(property.type) && !property.owner) {
        document.getElementById('buyPropertyBtn').style.display = 'inline-block';
    }

    document.getElementById('endTurnBtn').style.display = 'inline-block';
    updateSidebar();
    updateCurrentTurnDisplay();
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

function handleTaxPaid(data) {
    addToGameLog(`${data.player.name} paid ₹${data.amount} ${data.property.name}`);

    // Update game state
    gameState.players = data.game.players;
    updatePlayerInfo();
    updateSidebar();
}

function handleCardDrawn(data) {
    addToGameLog(data.result);

    // Show card modal/popup
    showCardModal(data.card, data.deckType);

    // Update game state
    gameState.players = data.game.players;
    gameState.currentPlayer = data.player;
    updatePlayerInfo();
    updateSidebar();
    updateJailCardCounter();
}

function showCardModal(card, deckType) {
    const modal = document.getElementById('cardModal');
    const cardType = document.getElementById('cardType');
    const cardMessage = document.getElementById('cardMessage');

    // Set card type and message
    cardType.textContent = deckType === 'chance' ? 'Chance Card' : 'Community Chest Card';
    cardMessage.textContent = card.message;

    // Show modal
    modal.style.display = 'block';

    // Close modal when clicking outside
    modal.onclick = function (event) {
        if (event.target === modal) {
            closeCardModal();
        }
    };
}

function closeCardModal() {
    document.getElementById('cardModal').style.display = 'none';
}

function handleTurnEnded(data) {
    gameState.currentPlayer = data.nextPlayer;
    gameState.players = data.game.players;
    updatePlayerInfo();
    updateSidebar();
    updateCurrentTurnDisplay();

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
    // Find the player who left by their ID
    const leftPlayer = gameState.players.find(p => p.id === data.playerId);
    const playerName = leftPlayer ? leftPlayer.name : 'A player';

    // Show a more specific status message
    showStatus(`${playerName} left the game (${data.reason})`, 'warning');

    // Remove the player from the local gameState.players array
    gameState.players = gameState.players.filter(p => p.id !== data.playerId);

    // Now, update all UI components that show the player list
    updatePlayersList(gameState.players);
    updatePlayerCount();
    updateSidebar(); // This ensures the in-game list is also updated
}

function handlePlayerSentToJail(data) {
    addToGameLog(`${data.player.name} was sent to Detention!`);

    // Update game state
    gameState.players = data.game.players;
    updatePlayerInfo();
    updateSidebar();

    // Show jail options if it's current player
    if (data.player.socketId === socket.id) {
        showJailOptions();
    }
}

function handlePlayerLeftJail(data) {
    let message = `${data.player.name} left Detention`;

    switch (data.method) {
        case 'doubles':
            message += ' by rolling doubles!';
            break;
        case 'fine':
            message += ` by paying ₹${data.amount} fine!`;
            break;
        case 'card':
            message += ' using "Get Out of Detention Free" card!';
            break;
    }

    addToGameLog(message);

    // Update game state
    gameState.players = data.game.players;
    updatePlayerInfo();
    updateSidebar();

    hideJailOptions();
}

function handleJailTurnFailed(data) {
    addToGameLog(`${data.player.name} failed to roll doubles. ${data.turnsRemaining} turns remaining in Detention.`);

    // Update game state
    gameState.players = data.game.players;
    updatePlayerInfo();
    updateSidebar();
}

function showJailOptions() {
    const jailOptions = document.getElementById('jailOptions');
    if (jailOptions) {
        jailOptions.style.display = 'block';
    }
}

function hideJailOptions() {
    const jailOptions = document.getElementById('jailOptions');
    if (jailOptions) {
        jailOptions.style.display = 'none';
    }
}

function payJailFine() {
    if (socket && socket.connected) {
        socket.emit('payJailFine');
    }
}

function useJailCard() {
    if (socket && socket.connected) {
        socket.emit('useJailCard');
    }
}

function hostAction(action, playerId, extraData = {}) {
    if (!socket || !socket.connected || !gameState.isHost) return;

    socket.emit('hostAction', {
        action,
        playerId,
        ...extraData
    });
}

function modifyPlayerMoney(playerId, playerName) {
    const amountStr = prompt(`Enter amount to add or subtract for ${playerName}:\n(e.g., 500 to add, -200 to subtract)`);
    if (amountStr) {
        const amount = parseInt(amountStr, 10);
        if (!isNaN(amount)) {
            hostAction('modifyMoney', playerId, { amount });
        } else {
            alert('Invalid number entered.');
        }
    }
}

function forcePlayerTurnEnd(playerId, playerName) {
    if (confirm(`Are you sure you want to force an end to ${playerName}'s turn?`)) {
        hostAction('forceEndTurn', playerId);
    }
}

// UI update functions
function updateHostDashboard() {
    if (!gameState.isHost) return;

    const hostControls = document.getElementById('hostControls');
    if (!hostControls) return;

    let controlsHTML = `
    <div class="host-control-panel">
      <h3>Host Controls</h3>
      <div class="control-buttons">
        <button id="pauseGameBtn" class="btn btn--warning">Pause/Resume</button>
        <button id="spectatorEndGameBtn" class="btn btn--danger">End Game</button>
      </div>
      
      <div class="game-stats">
        <p><strong>Players:</strong> ${gameState.players.length}</p>
        <p><strong>Game Phase:</strong> ${gameState.gamePhase}</p>
        <p><strong>Current Turn:</strong> ${getCurrentPlayerName()}</p>
      </div>
    </div>
  `;

    hostControls.innerHTML = controlsHTML;

    // Add event listeners to the NEWLY created buttons
    const pauseBtn = document.getElementById('pauseGameBtn');
    const endBtn = document.getElementById('spectatorEndGameBtn');

    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseGame);
    }

    if (endBtn) {
        endBtn.addEventListener('click', endGame);
    }
}

function getCurrentPlayerName() {
    if (!gameState.players || gameState.players.length === 0) return 'None';
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer?.id);
    return currentPlayer ? currentPlayer.name : 'Unknown';
}

function updateCurrentTurnDisplay() {
    // Update current turn display in spectator view
    const currentTurnPlayerEl = document.getElementById('currentTurnPlayer');
    if (currentTurnPlayerEl && gameState.isHost) {
        const currentPlayerName = getCurrentPlayerName();
        if (gameState.currentPlayer && currentPlayerName !== 'None' && currentPlayerName !== 'Unknown') {
            currentTurnPlayerEl.innerHTML = `${gameState.currentPlayer.token} ${currentPlayerName}`;
        } else {
            currentTurnPlayerEl.textContent = 'Waiting...';
        }
    }
}

function pauseGame() {
    if (socket && socket.connected && gameState.isHost) {
        socket.emit('pauseGame');
    }
}

function endGame() {
    if (confirm('Are you sure you want to end the game for everyone?')) {
        if (socket && socket.connected && gameState.isHost) {
            // Send the end game event to the server
            socket.emit('endGameByHost');
        } else {
            // Failsafe in case of disconnection or not being host
            showStatus('Could not end game. You might be disconnected.', 'error');
            // Go to menu anyway as a fallback for the host
            showMainMenu();
        }
    }
}

function updatePlayersList(players) {
    const hostPlayersList = document.getElementById('playersList');
    if (hostPlayersList) {
        updatePlayerListElement(hostPlayersList, players);
    }

    // Update waiting screen player list
    const waitingPlayersList = document.getElementById('waitingPlayersList');
    if (waitingPlayersList) {
        updatePlayerListElement(waitingPlayersList, players);
    }

    // Update spectator player list
    const spectatorPlayersList = document.getElementById('spectatorPlayersList');
    if (spectatorPlayersList) {
        updatePlayerListElement(spectatorPlayersList, players);
    }
}

function updatePlayerListElement(listElement, players) {
    if (!listElement) return;

    if (players.length === 0) {
        listElement.innerHTML = '<div class="text-muted">Waiting for players to join...</div>';
        return;
    }

    listElement.innerHTML = players.map(player => `
        <div class="player-card">
            <div class="player-info">
                <span class="player-token">${player.token}</span>
                <span class="player-name">${player.name}</span>
            </div>
            ${gameState.isHost && gameState.gamePhase === 'waiting' ?
            `<button class="btn btn--small btn--danger" onclick="kickPlayer('${player.id}')">Kick</button>` :
            ''
        }
        </div>
    `).join('');
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
    if (infoCard) {
        infoCard.classList.add('hidden');
    }
}

function handleBuildingOffer(data) {
    showBuildingModal(data.property, data.buildType, data.cost);
}

function handlePropertyBuilt(data) {
    addToGameLog(`${data.player.name} built a ${data.buildType} on ${data.property.name}`);

    // Update game state
    gameState.players = data.game.players;
    gameState.board = data.game.board;
    updatePlayerInfo();
    updateGameBoard();
    updateSidebar();
}

function showBuildingModal(property, buildType, cost) {
    const modal = document.getElementById('buildingModal');
    const modalTitle = document.getElementById('buildingModalTitle');
    const modalMessage = document.getElementById('buildingModalMessage');
    const buildBtn = document.getElementById('buildConfirmBtn');

    if (!modal || !modalTitle || !modalMessage || !buildBtn) return;

    modalTitle.textContent = `Build on ${property.name}`;

    if (buildType === 'hotel') {
        modalMessage.textContent = `Upgrade to Hotel for ₹${cost}? (Removes 4 Houses)`;
    } else {
        const currentHouses = property.houses || 0;
        modalMessage.textContent = `Build House ${currentHouses + 1} for ₹${cost}?`;
    }

    buildBtn.onclick = () => {
        buildProperty(property.position, buildType);
        closeBuildingModal();
    };

    modal.style.display = 'block';
}

function closeBuildingModal() {
    const modal = document.getElementById('buildingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function buildProperty(propertyPosition, buildType) {
    if (socket && socket.connected) {
        socket.emit('buildProperty', {
            propertyPosition: propertyPosition,
            buildType: buildType
        });
    }
}

function updateJailCardCounter() {
    const counterEl = document.getElementById('jailCardsCount');
    if (!counterEl) return;

    // Find the currentPlayer from players array to get the latest data
    if (!gameState.currentPlayer || !gameState.players) {
        counterEl.textContent = '0';
        return;
    }

    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer.id);
    if (!currentPlayer) {
        counterEl.textContent = '0';
        return;
    }

    const count = currentPlayer.getOutOfJailCards || 0;
    counterEl.textContent = count;
}

function updateGameBoard() {
    if (!gameState.board) return;

    gameState.board.forEach(property => {
        const spaceElement = document.querySelector(`[data-position="${property.position}"]`);
        if (spaceElement && property.type === 'property') {
            // Clear existing building classes
            spaceElement.classList.remove('has-houses', 'has-hotel');
            spaceElement.removeAttribute('data-houses');

            if (property.hotel) {
                spaceElement.classList.add('has-hotel');
            } else if (property.houses && property.houses > 0) {
                spaceElement.classList.add('has-houses');
                spaceElement.setAttribute('data-houses', property.houses);
            }
        }
    });

    // Update board with current game state
    if (gameState.board) {
        gameState.board.forEach((space, index) => {
            const spaceElement = document.getElementById(`space-${index + 1}`);
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
function broadcastHostMessage() {
    const input = document.getElementById('broadcastMessageInput');
    if (input && input.value.trim()) {
        // This action has no specific playerId, so we pass null
        hostAction('broadcastMessage', null, { message: input.value.trim() });
        input.value = ''; // Clear the input after sending
    }
}
function kickPlayerIngame(playerId, playerName) {
    if (confirm(`Are you sure you want to kick ${playerName}?\nThis will make them bankrupt and all their properties will become unowned.`)) {
        hostAction('kickPlayerIngame', playerId);
    }
}

/**
 * Creates and appends a player piece to a target board space element.
 * @param {HTMLElement} targetSpace The board space div to add the piece to.
 * @param {object} player The player object for whom to create the piece.
 */
function createAndAppendPiece(targetSpace, player) {
    if (!targetSpace) return;

    const piece = document.createElement('div');
    piece.className = 'player-piece';
    piece.textContent = player.token;
    piece.style.backgroundColor = getPlayerColor(player.token);
    piece.title = player.name;

    // Add a class if the player is in jail for special styling
    if (player.inJail) {
        piece.classList.add('in-jail');
    }

    // Position multiple pieces on the same space so they don't overlap
    const existingPieces = targetSpace.querySelectorAll('.player-piece').length;
    piece.style.left = `${5 + (existingPieces * 15)}px`;
    piece.style.top = `${5}px`;

    targetSpace.appendChild(piece);
}

function updatePlayerPieces() {
    // Remove all existing player pieces from both boards
    document.querySelectorAll('.player-piece').forEach(piece => piece.remove());

    if (!gameState.players) return;

    // Add player pieces to their current positions on BOTH boards
    gameState.players.forEach(player => {
        if (player.bankrupt) return;

        // Use player.position + 1 to find the correct space ID (e.g., space-1, space-2)
        const correctSpaceId = `space-${player.position + 1}`;

        // Find the space on the regular game board (inside #gameBoard container)
        const regularBoardSpace = document.querySelector(`#gameBoard #${correctSpaceId}`);
        createAndAppendPiece(regularBoardSpace, player);

        // Find the space on the host's spectator board (inside #spectatorBoard container)
        const spectatorBoardSpace = document.querySelector(`#spectatorBoard #${correctSpaceId}`);
        createAndAppendPiece(spectatorBoardSpace, player);
    });
}

function animatePlayerMovement(player, newPosition) {
    // THE FIX: The manual removal of the old piece has been deleted from here.
    // We will now rely ONLY on updatePlayerPieces to handle clearing and redrawing.

    // Add piece to new position after a short delay for animation effect
    setTimeout(() => {
        // This function correctly removes ALL old pieces and redraws them in their new spots.
        updatePlayerPieces();

        // Highlight the new position briefly
        const newSpace = document.getElementById(`space-${newPosition + 1}`);
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

    if (gameState.currentPlayer && nameEl && moneyEl) {
        nameEl.textContent = `${gameState.currentPlayer.token} ${gameState.currentPlayer.name}`;
        moneyEl.textContent = `₹${gameState.currentPlayer.money}`;
    }

    const currentPlayer = gameState.currentPlayer;
    if (currentPlayer && currentPlayer.inJail) {
        showJailOptions();

        // Update UI to show jail status
        const playerStatus = document.getElementById('playerStatus');
        if (playerStatus) {
            playerStatus.innerHTML = `🏫 In Detention (Turn ${currentPlayer.jailTurns}/3)`;
        }
    } else {
        hideJailOptions();
    }
}

function updateDiceDisplay(dice1, dice2) {
    const dice1El = document.getElementById('dice1');
    const dice2El = document.getElementById('dice2');

    if (dice1El) dice1El.textContent = dice1;
    if (dice2El) dice2El.textContent = dice2;
}

function addToGameLog(message) {
    const gameLog = document.getElementById('gameLog');
    const spectatorLog = document.getElementById('spectatorGameLog');

    if (gameLog) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = message;
        gameLog.appendChild(entry);
        gameLog.scrollTop = gameLog.scrollHeight;
    }
    if (spectatorLog && gameState.isHost) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = message;
        spectatorLog.appendChild(entry);
        spectatorLog.scrollTop = spectatorLog.scrollHeight;
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
    // Select both new, unique elements
    const gameBoardPlayersEl = document.querySelector('#gameBoardAllPlayers');
    const spectatorPlayersEl = document.querySelector('#spectatorAllPlayers');

    if (!gameState.players) return;

    // Generate the standard player list HTML for players view
    const playersHtml = gameState.players.map(player => {
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

    // Update the player's game board panel (no controls)
    if (gameBoardPlayersEl) {
        gameBoardPlayersEl.innerHTML = playersHtml;
    }

    // **NEW LOGIC**: Generate an enhanced list with controls for the host's spectator panel
    if (spectatorPlayersEl && gameState.isHost) {
        const hostPlayersHtml = gameState.players.map(player => {
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
                    <div class="host-player-actions">
                        <button class="btn btn--small btn--outline" onclick="modifyPlayerMoney('${player.id}', '${player.name}')" title="Modify Money">💰</button>
                        <button class="btn btn--small btn--outline" onclick="forcePlayerTurnEnd('${player.id}', '${player.name}')" title="Force End Turn">⏭️</button>
                        <button class="btn btn--small btn--danger" onclick="kickPlayerIngame('${player.id}', '${player.name}')" title="Kick Player">❌</button>
                    </div>
                </div>`;
        }).join('');
        spectatorPlayersEl.innerHTML = hostPlayersHtml;
    } else if (spectatorPlayersEl) {
        // If it's not the host, just show the simple list
        spectatorPlayersEl.innerHTML = playersHtml;
    }
}

function showStatus(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);

    // Remove existing status messages
    document.querySelectorAll('.status-message').forEach(msg => msg.remove());

    const statusDiv = document.createElement('div');
    statusDiv.className = `status-message status-${type}`;
    statusDiv.textContent = message;

    // Add close button for error messages
    if (type === 'error') {
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            margin-left: 10px;
            cursor: pointer;
        `;
        closeBtn.onclick = () => statusDiv.remove();
        statusDiv.appendChild(closeBtn);
    }

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
        max-width: 350px;
        word-wrap: break-word;
    `;

    switch (type) {
        case 'success': statusDiv.style.backgroundColor = '#059669'; break;
        case 'error': statusDiv.style.backgroundColor = '#dc2626'; break;
        case 'warning': statusDiv.style.backgroundColor = '#d97706'; break;
        default: statusDiv.style.backgroundColor = '#2563eb';
    }

    document.body.appendChild(statusDiv);

    // Auto-remove after delay (longer for errors)
    const delay = type === 'error' ? 8000 : 4000;
    setTimeout(() => {
        if (statusDiv.parentNode) {
            statusDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => statusDiv.remove(), 300);
        }
    }, delay);
}