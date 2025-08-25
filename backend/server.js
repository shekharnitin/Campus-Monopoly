const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Game state storage
const games = new Map();
const players = new Map();

// Campus buildings data
const campusBuildings = [
    {"name": "Main Gate", "type": "start", "position": 0},
    {"name": "Old Library Building", "type": "property", "position": 1, "price": 60, "color": "brown", "rent": [2, 10, 30, 90, 160, 250]},
    {"name": "Community Chest", "type": "community_chest", "position": 2},
    {"name": "Main Heritage Building", "type": "property", "position": 3, "price": 80, "color": "brown", "rent": [4, 20, 60, 180, 320, 450]},
    {"name": "Income Tax", "type": "tax", "position": 4, "amount": 200},
    {"name": "Bus Stop", "type": "transport", "position": 5, "price": 200},
    {"name": "NLHC", "type": "property", "position": 6, "price": 100, "color": "light_blue", "rent": [6, 30, 90, 270, 400, 550]},
    {"name": "Chance", "type": "chance", "position": 7},
    {"name": "DLHC", "type": "property", "position": 8, "price": 120, "color": "light_blue", "rent": [8, 40, 100, 300, 450, 600]},
    {"name": "CLT", "type": "property", "position": 9, "price": 140, "color": "light_blue", "rent": [10, 50, 150, 450, 625, 750]},
    {"name": "Jail", "type": "jail", "position": 10},
    {"name": "Central Research Facility", "type": "property", "position": 11, "price": 140, "color": "pink", "rent": [10, 50, 150, 450, 625, 750]},
    {"name": "Wi-Fi Network", "type": "utility", "position": 12, "price": 150},
    {"name": "Science Block", "type": "property", "position": 13, "price": 160, "color": "pink", "rent": [12, 60, 180, 500, 700, 900]},
    {"name": "Management Studies", "type": "property", "position": 14, "price": 180, "color": "pink", "rent": [14, 70, 200, 550, 750, 950]},
    {"name": "Cycle Stand", "type": "transport", "position": 15, "price": 200},
    {"name": "Computer Science", "type": "property", "position": 16, "price": 180, "color": "orange", "rent": [14, 70, 200, 550, 750, 950]},
    {"name": "Community Chest", "type": "community_chest", "position": 17},
    {"name": "Petroleum Engineering", "type": "property", "position": 18, "price": 200, "color": "orange", "rent": [16, 80, 220, 600, 800, 1000]},
    {"name": "Environmental Science", "type": "property", "position": 19, "price": 220, "color": "orange", "rent": [18, 90, 250, 700, 875, 1050]},
    {"name": "Free Parking", "type": "free_parking", "position": 20},
    {"name": "Jasper Hostel", "type": "property", "position": 21, "price": 220, "color": "red", "rent": [18, 90, 250, 700, 875, 1050]},
    {"name": "Chance", "type": "chance", "position": 22},
    {"name": "Sapphire Hostel", "type": "property", "position": 23, "price": 240, "color": "red", "rent": [20, 100, 300, 750, 925, 1100]},
    {"name": "New Rosaline Hostel", "type": "property", "position": 24, "price": 260, "color": "red", "rent": [22, 110, 330, 800, 975, 1150]},
    {"name": "Auto Stand", "type": "transport", "position": 25, "price": 200},
    {"name": "Sports Complex", "type": "property", "position": 26, "price": 260, "color": "yellow", "rent": [22, 110, 330, 800, 975, 1150]},
    {"name": "Swimming Pool", "type": "property", "position": 27, "price": 280, "color": "yellow", "rent": [24, 120, 360, 850, 1025, 1200]},
    {"name": "Power Grid", "type": "utility", "position": 28, "price": 150},
    {"name": "SAC", "type": "property", "position": 29, "price": 300, "color": "yellow", "rent": [26, 130, 390, 900, 1100, 1275]},
    {"name": "Go to Jail", "type": "go_to_jail", "position": 30},
    {"name": "New Central Library", "type": "property", "position": 31, "price": 300, "color": "green", "rent": [26, 130, 390, 900, 1100, 1275]},
    {"name": "Centre of Excellence", "type": "property", "position": 32, "price": 320, "color": "green", "rent": [28, 150, 450, 1000, 1200, 1400]},
    {"name": "Community Chest", "type": "community_chest", "position": 33},
    {"name": "Central Library Reading Room", "type": "property", "position": 34, "price": 320, "color": "green", "rent": [28, 150, 450, 1000, 1200, 1400]},
    {"name": "Metro Station", "type": "transport", "position": 35, "price": 200},
    {"name": "Chance", "type": "chance", "position": 36},
    {"name": "Seismological Observatory", "type": "property", "position": 37, "price": 350, "color": "blue", "rent": [35, 175, 500, 1100, 1300, 1500]},
    {"name": "Luxury Tax", "type": "tax", "position": 38, "amount": 100},
    {"name": "Shooting Range", "type": "property", "position": 39, "price": 400, "color": "blue", "rent": [50, 200, 600, 1400, 1700, 2000]}
];

const gameConfig = {
    startingMoney: 1500,
    salaryAmount: 200,
    maxPlayers: 8,
    minPlayers: 2
};

const playerTokens = ["🎓", "📚", "⚗️", "🏗️", "🎯", "🏆", "🎨", "🔬"];

// Validation schemas
const createGameSchema = Joi.object({
    hostName: Joi.string().min(2).max(30).required()
});

const joinGameSchema = Joi.object({
    gameCode: Joi.string().length(6).required(),
    playerName: Joi.string().min(2).max(30).required()
});

// Utility functions
function generateGameCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function createNewGame(hostName, hostSocketId) {
    const gameCode = generateGameCode();
    const game = {
        id: uuidv4(),
        code: gameCode,
        hostId: hostSocketId,
        hostName: hostName,
        players: [],
        gameState: 'waiting',
        currentPlayerIndex: 0,
        board: campusBuildings.map(building => ({
            ...building,
            owner: null,
            houses: 0,
            mortgaged: false
        })),
        createdAt: new Date(),
        gameLog: []
    };

    games.set(gameCode, game);
    return game;
}

function addPlayerToGame(gameCode, playerName, socketId) {
    const game = games.get(gameCode);
    if (!game) return null;

    if (game.players.length >= gameConfig.maxPlayers) {
        return { error: 'Game is full' };
    }

    if (game.gameState !== 'waiting') {
        return { error: 'Game already started' };
    }

    const player = {
        id: uuidv4(),
        socketId: socketId,
        name: playerName,
        money: gameConfig.startingMoney,
        position: 0,
        properties: [],
        inJail: false,
        jailTurns: 0,
        token: playerTokens[game.players.length % playerTokens.length],
        bankrupt: false
    };

    game.players.push(player);
    players.set(socketId, { gameCode, playerId: player.id });

    return { player, game };
}

// Game logic functions
function rollDice() {
    return [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
}

function movePlayer(game, playerId, steps) {
    const player = game.players.find(p => p.id === playerId);
    if (!player) return false;

    const oldPosition = player.position;
    player.position = (player.position + steps) % 40;

    // Collect salary if passed START
    if (player.position < oldPosition || (oldPosition < 40 && player.position >= 0)) {
        player.money += gameConfig.salaryAmount;
        game.gameLog.push(`${player.name} passed Main Gate and collected ₹${gameConfig.salaryAmount}`);
    }

    return true;
}

function calculateRent(property, game) {
    if (property.type === 'transport') {
        const ownedTransports = game.board.filter(p => 
            p.type === 'transport' && p.owner === property.owner
        ).length;
        return 25 * Math.pow(2, ownedTransports - 1);
    }

    if (property.type === 'utility') {
        const ownedUtilities = game.board.filter(p => 
            p.type === 'utility' && p.owner === property.owner
        ).length;
        const diceRoll = rollDice();
        const multiplier = ownedUtilities === 1 ? 4 : 10;
        return (diceRoll[0] + diceRoll[1]) * multiplier;
    }

    if (property.type === 'property') {
        return property.rent[property.houses];
    }

    return 0;
}

// REST API Endpoints
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date(),
        activeGames: games.size,
        activePlayers: players.size
    });
});

app.get('/api/games/:code', (req, res) => {
    const game = games.get(req.params.code);
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }

    const publicGame = {
        code: game.code,
        hostName: game.hostName,
        playerCount: game.players.length,
        maxPlayers: gameConfig.maxPlayers,
        gameState: game.gameState,
        createdAt: game.createdAt
    };

    res.json(publicGame);
});

// WebSocket event handlers
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on('createGame', (data) => {
        try {
            const { error, value } = createGameSchema.validate(data);
            if (error) {
                socket.emit('error', { message: error.details[0].message });
                return;
            }

            const game = createNewGame(value.hostName, socket.id);
            socket.join(game.code);

            socket.emit('gameCreated', {
                gameCode: game.code,
                hostId: game.hostId,
                game: game
            });

            console.log(`Game created: ${game.code} by ${value.hostName}`);
        } catch (err) {
            socket.emit('error', { message: 'Failed to create game' });
        }
    });

    socket.on('joinGame', (data) => {
        try {
            const { error, value } = joinGameSchema.validate(data);
            if (error) {
                socket.emit('error', { message: error.details[0].message });
                return;
            }

            const result = addPlayerToGame(value.gameCode, value.playerName, socket.id);
            if (!result) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }

            if (result.error) {
                socket.emit('error', { message: result.error });
                return;
            }

            socket.join(value.gameCode);

            socket.emit('gameJoined', {
                player: result.player,
                game: result.game
            });

            socket.to(value.gameCode).emit('playerJoined', {
                player: result.player,
                playerCount: result.game.players.length
            });

            const hostSocket = io.sockets.sockets.get(result.game.hostId);
            if (hostSocket) {
                hostSocket.emit('playerJoined', {
                    player: result.player,
                    game: result.game
                });
            }

            console.log(`Player ${value.playerName} joined game ${value.gameCode}`);
        } catch (err) {
            socket.emit('error', { message: 'Failed to join game' });
        }
    });

    socket.on('startGame', (data) => {
        const playerInfo = players.get(socket.id);
        if (!playerInfo) {
            socket.emit('error', { message: 'Player not in any game' });
            return;
        }

        const game = games.get(playerInfo.gameCode);
        if (!game || game.hostId !== socket.id) {
            socket.emit('error', { message: 'Only host can start the game' });
            return;
        }

        if (game.players.length < gameConfig.minPlayers) {
            socket.emit('error', { message: `Need at least ${gameConfig.minPlayers} players to start` });
            return;
        }

        game.gameState = 'playing';
        game.currentPlayerIndex = 0;
        game.gameLog.push('Game started!');

        io.to(game.code).emit('gameStarted', {
            game: game,
            currentPlayer: game.players[0]
        });

        console.log(`Game ${game.code} started`);
    });

    socket.on('rollDice', (data) => {
        const playerInfo = players.get(socket.id);
        if (!playerInfo) {
            socket.emit('error', { message: 'Player not in any game' });
            return;
        }

        const game = games.get(playerInfo.gameCode);
        if (!game || game.gameState !== 'playing') {
            socket.emit('error', { message: 'Game not in progress' });
            return;
        }

        const currentPlayer = game.players[game.currentPlayerIndex];
        if (currentPlayer.socketId !== socket.id) {
            socket.emit('error', { message: 'Not your turn' });
            return;
        }

        const dice = rollDice();
        const totalRoll = dice[0] + dice[1];

        movePlayer(game, currentPlayer.id, totalRoll);

        const landedProperty = game.board[currentPlayer.position];
        game.gameLog.push(`${currentPlayer.name} rolled ${dice[0]}+${dice[1]}=${totalRoll} and landed on ${landedProperty.name}`);

        io.to(game.code).emit('diceRolled', {
            player: currentPlayer,
            dice: dice,
            totalRoll: totalRoll,
            newPosition: currentPlayer.position,
            landedProperty: landedProperty,
            game: game
        });

        handlePropertyLanding(game, currentPlayer, landedProperty);
    });

    socket.on('buyProperty', (data) => {
        const playerInfo = players.get(socket.id);
        if (!playerInfo) {
            socket.emit('error', { message: 'Player not in any game' });
            return;
        }

        const game = games.get(playerInfo.gameCode);
        const player = game.players.find(p => p.socketId === socket.id);
        const property = game.board[player.position];

        if (!property || !['property', 'transport', 'utility'].includes(property.type)) {
            socket.emit('error', { message: 'Cannot buy this space' });
            return;
        }

        if (property.owner) {
            socket.emit('error', { message: 'Property already owned' });
            return;
        }

        if (player.money < property.price) {
            socket.emit('error', { message: 'Insufficient funds' });
            return;
        }

        player.money -= property.price;
        property.owner = player.id;
        player.properties.push(property.position);

        game.gameLog.push(`${player.name} bought ${property.name} for ₹${property.price}`);

        io.to(game.code).emit('propertyPurchased', {
            player: player,
            property: property,
            game: game
        });

        endPlayerTurn(game);
    });

    socket.on('endTurn', (data) => {
        const playerInfo = players.get(socket.id);
        if (!playerInfo) return;

        const game = games.get(playerInfo.gameCode);
        if (!game) return;

        endPlayerTurn(game);
    });

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);

        const playerInfo = players.get(socket.id);
        if (playerInfo) {
            const game = games.get(playerInfo.gameCode);
            if (game) {
                game.players = game.players.filter(p => p.socketId !== socket.id);

                socket.to(playerInfo.gameCode).emit('playerLeft', {
                    playerId: playerInfo.playerId,
                    playerCount: game.players.length
                });

                if (game.hostId === socket.id) {
                    io.to(playerInfo.gameCode).emit('gameEnded', {
                        reason: 'Host left the game'
                    });
                    games.delete(playerInfo.gameCode);
                }

                if (game.players.length === 0) {
                    games.delete(playerInfo.gameCode);
                }
            }

            players.delete(socket.id);
        }
    });
});

function handlePropertyLanding(game, player, property) {
    if (property.owner && property.owner !== player.id && !property.mortgaged) {
        const rent = calculateRent(property, game);
        const owner = game.players.find(p => p.id === property.owner);

        if (player.money >= rent) {
            player.money -= rent;
            owner.money += rent;

            game.gameLog.push(`${player.name} paid ₹${rent} rent to ${owner.name} for ${property.name}`);

            io.to(game.code).emit('rentPaid', {
                payer: player,
                receiver: owner,
                amount: rent,
                property: property
            });
        } else {
            game.gameLog.push(`${player.name} cannot afford rent and is bankrupt!`);
            player.bankrupt = true;

            io.to(game.code).emit('playerBankrupt', {
                player: player,
                game: game
            });
        }
    }

    const activePlayers = game.players.filter(p => !p.bankrupt);
    if (activePlayers.length === 1) {
        game.gameState = 'finished';
        io.to(game.code).emit('gameEnded', {
            winner: activePlayers[0],
            reason: 'All other players bankrupt'
        });
    }
}

function endPlayerTurn(game) {
    do {
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    } while (game.players[game.currentPlayerIndex].bankrupt && game.players.filter(p => !p.bankrupt).length > 1);

    const nextPlayer = game.players[game.currentPlayerIndex];

    io.to(game.code).emit('turnEnded', {
        nextPlayer: nextPlayer,
        game: game
    });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🎮 Campus Monopoly Server running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
});

module.exports = { app, server, io };