const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Game state storage
const games = new Map();
const players = new Map();

// Campus buildings data
const campusBuildings = [
    { name: "Main Gate", type: "start", position: 0 },
    {
        name: "Old Library Building",
        type: "property",
        position: 1,
        price: 60,
        color: "brown",
        rent: [2, 10, 30, 90, 160, 250],
    },
    { name: "Community Chest", type: "community_chest", position: 2 },
    {
        name: "Heritage Building",
        type: "property",
        position: 3,
        price: 80,
        color: "brown",
        rent: [4, 20, 60, 180, 320, 450],
    },
    { name: "Income Tax", type: "tax", position: 4, amount: 200 },
    {
        name: "RD",
        type: "property",
        position: 5,
        price: 200,
        color: "blue",
        rent: [8, 40, 100, 300, 450, 600],
    },
    {
        name: "NLHC",
        type: "property",
        position: 6,
        price: 100,
        color: "light_blue",
        rent: [6, 30, 90, 270, 400, 550],
    },
    { name: "Chance", type: "chance", position: 7 },
    {
        name: "OAT",
        type: "property",
        position: 8,
        price: 120,
        color: "blue",
        rent: [8, 40, 100, 300, 450, 600],
    },
    {
        name: "Penman Auditorium",
        type: "property",
        position: 9,
        price: 140,
        color: "blue",
        rent: [10, 50, 150, 450, 625, 750],
    },
    { name: "Jail", type: "jail", position: 10 },
    {
        name: "Central Research Facility",
        type: "property",
        position: 11,
        price: 140,
        color: "pink",
        rent: [10, 50, 150, 450, 625, 750],
    },
    { name: "Wi-Fi Network", type: "utility", position: 12, price: 150 },
    {
        name: "Science Block",
        type: "property",
        position: 13,
        price: 160,
        color: "orange",
        rent: [12, 60, 180, 500, 700, 900],
    },
    {
        name: "Management Studies",
        type: "property",
        position: 14,
        price: 180,
        color: "orange",
        rent: [14, 70, 200, 550, 750, 950],
    },
    { name: "Cycle Stand", type: "transport", position: 15, price: 200 },
    {
        name: "Computer Science",
        type: "property",
        position: 16,
        price: 180,
        color: "orange",
        rent: [14, 70, 200, 550, 750, 950],
    },
    { name: "Community Chest", type: "community_chest", position: 17 },
    {
        name: "Petroleum Engineering",
        type: "property",
        position: 18,
        price: 200,
        color: "orange",
        rent: [16, 80, 220, 600, 800, 1000],
    },
    {
        name: "Environmental Science",
        type: "property",
        position: 19,
        price: 220,
        color: "orange",
        rent: [18, 90, 250, 700, 875, 1050],
    },
    { name: "Free Parking", type: "free_parking", position: 20 },
    {
        name: "Jasper Hostel",
        type: "property",
        position: 21,
        price: 220,
        color: "red",
        rent: [18, 90, 250, 700, 875, 1050],
    },
    { name: "Chance", type: "chance", position: 22 },
    {
        name: "Sapphire Hostel",
        type: "property",
        position: 23,
        price: 240,
        color: "red",
        rent: [20, 100, 300, 750, 925, 1100],
    },
    {
        name: "New Rosaline Hostel",
        type: "property",
        position: 24,
        price: 260,
        color: "red",
        rent: [22, 110, 330, 800, 975, 1150],
    },
    { name: "Auto Stand", type: "transport", position: 25, price: 200 },
    {
        name: "Sports Complex",
        type: "property",
        position: 26,
        price: 260,
        color: "yellow",
        rent: [22, 110, 330, 800, 975, 1150],
    },
    {
        name: "Swimming Pool",
        type: "property",
        position: 27,
        price: 280,
        color: "yellow",
        rent: [24, 120, 360, 850, 1025, 1200],
    },
    { name: "Power Grid", type: "utility", position: 28, price: 150 },
    {
        name: "SAC",
        type: "property",
        position: 29,
        price: 300,
        color: "blue",
        rent: [26, 130, 390, 900, 1100, 1275],
    },
    { name: "Go to Jail", type: "go_to_jail", position: 30 },
    {
        name: "Central Library",
        type: "property",
        position: 31,
        price: 300,
        color: "green",
        rent: [26, 130, 390, 900, 1100, 1275],
    },
    {
        name: "Opal Hostel",
        type: "property",
        position: 32,
        price: 280,
        color: "red",
        rent: [28, 150, 450, 1000, 1200, 1400],
    },
    { name: "Community Chest", type: "community_chest", position: 33 },
    {
        name: "Aquamarine Hostel",
        type: "property",
        position: 34,
        price: 320,
        color: "red",
        rent: [28, 150, 450, 1000, 1200, 1400],
    },
    {
        name: "NAC",
        type: "property",
        position: 35,
        price: 200,
        color: "light_blue",
        rent: [6, 30, 90, 270, 400, 550],
    },
    { name: "Chance", type: "chance", position: 36 },
    {
        name: "EDC",
        type: "property",
        position: 37,
        price: 350,
        color: "blue",
        rent: [35, 175, 500, 1100, 1300, 1500],
    },
    { name: "Luxury Tax", type: "tax", position: 38, amount: 100 },
    {
        name: "Shooting Range",
        type: "property",
        position: 39,
        price: 400,
        color: "blue",
        rent: [50, 200, 600, 1400, 1700, 2000],
    },
];

const chanceCards = [
    { type: "money", amount: 200, message: "Scholarship Awarded! Collect ₹200" },
    {
        type: "money",
        amount: 150,
        message: "Research Grant Approved! Collect ₹150",
    },
    { type: "money", amount: -50, message: "Late Assignment Penalty! Pay ₹50" },
    { type: "money", amount: -100, message: "Hostel Damage Fine! Pay ₹100" },
    { type: "move", position: 0, message: "Advance to Main Gate! Collect ₹200" },
    { type: "move", position: 31, message: "Go to Central Library!" },
    { type: "jail", message: "Go to Detention! Move directly to Jail" },
    {
        type: "payall",
        amount: 25,
        message: "Student Council Election! Pay ₹25 to each player",
    },
    {
        type: "collectall",
        amount: 25,
        message: "Group Study Session! Collect ₹25 from each player",
    },
    {
        type: "repair",
        house: 40,
        hotel: 115,
        message: "Property Tax! Pay ₹40 per house, ₹115 per hotel",
    },
    {
        type: "getoutofjail",
        message: "Get Out of Detention Free! Keep this card",
    },
];

const communityChestCards = [
    {
        type: "money",
        amount: 100,
        message: "Emergency Scholarship! Collect ₹100",
    },
    {
        type: "money",
        amount: 50,
        message: "Birthday Money from Home! Collect ₹50",
    },
    { type: "money", amount: -50, message: "Medical Center Bill! Pay ₹50" },
    { type: "money", amount: -100, message: "Semester Fee Due! Pay ₹100" },
    {
        type: "money",
        amount: 125,
        message: "Campus Competition Prize! Collect ₹125",
    },
    {
        type: "repair",
        house: 40,
        hotel: 100,
        message: "Campus Maintenance! Pay ₹40 per house, ₹100 per hotel",
    },
    {
        type: "getoutofjail",
        message: "Get Out of Detention Free! Keep this card",
    },
];

const gameConfig = {
    startingMoney: 1500,
    salaryAmount: 200,
    maxPlayers: 8,
    minPlayers: 2,
};

const playerTokens = ["🎓", "📚", "⚗️", "🏗️", "🎯", "🏆", "🎨", "🔬"];

// Validation schemas
const createGameSchema = Joi.object({
    hostName: Joi.string().min(2).max(30).required(),
});

const joinGameSchema = Joi.object({
    gameCode: Joi.string().length(6).required(),
    playerName: Joi.string().min(2).max(30).required(),
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
        gameState: "waiting",
        currentPlayerIndex: 0,
        board: campusBuildings.map((building) => ({
            ...building,
            owner: null,
            houses: 0,
            mortgaged: false,
        })),
        createdAt: new Date(),
        gameLog: [],
    };

    games.set(gameCode, game);
    return game;
}

function addPlayerToGame(gameCode, playerName, socketId) {
    const game = games.get(gameCode);
    if (!game) return null;

    if (game.players.length >= gameConfig.maxPlayers) {
        return { error: "Game is full" };
    }

    if (game.gameState !== "waiting") {
        return { error: "Game already started" };
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
        bankrupt: false,
    };

    game.players.push(player);
    players.set(socketId, { gameCode, playerId: player.id });

    return { player, game };
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initializeCardDecks() {
    return {
        chance: shuffleArray([...chanceCards]),
        communityChest: shuffleArray([...communityChestCards]),
        chanceIndex: 0,
        communityIndex: 0,
    };
}

function broadcastGameUpdate(game) {
    if (game && game.code) {
        // We use a new event 'gameUpdated' to push the full state.
        io.to(game.code).emit("gameUpdated", { game });
    }
}

// Game logic functions
function rollDice() {
    return [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
}

function movePlayer(game, playerId, steps) {
    const player = game.players.find((p) => p.id === playerId);
    if (!player) return false;

    const oldPosition = player.position;
    player.position = (player.position + steps) % 40;

    // Collect salary if passed START
    if (oldPosition + steps >= 40) {
        player.money += gameConfig.salaryAmount;
        game.gameLog.push(
            `${player.name} passed Main Gate and collected ₹${gameConfig.salaryAmount}`
        );
    }

    return true;
}

function calculateRent(property, game, lastDiceRoll = [1, 1]) {
    if (property.type === "transport") {
        const ownedTransports = game.board.filter(
            (p) => p.type === "transport" && p.owner === property.owner
        ).length;
        return 25 * Math.pow(2, ownedTransports - 1);
    }

    if (property.type === "utility") {
        const ownedUtilities = game.board.filter(
            (p) => p.type === "utility" && p.owner === property.owner
        ).length;
        const multiplier = ownedUtilities === 1 ? 4 : 10;
        return (lastDiceRoll[0] + lastDiceRoll[1]) * multiplier;
    }

    if (property.type === "property") {
        // Check for hotel
        if (property.hotel) {
            return property.rent[5] || property.rent[4]; // Hotel rent (highest)
        }

        // Check for houses (1-4)
        const houses = property.houses || 0;
        if (houses > 0) {
            return property.rent[houses]; // House rent based on number of houses
        }

        // Base rent (no houses, no hotel)
        return property.rent[0];
    }

    return 0;
}

function drawCard(game, cardType) {
    if (!game.cardDecks) {
        game.cardDecks = initializeCardDecks();
    }

    let card, deck, index;

    if (cardType === "chance") {
        deck = game.cardDecks.chance;
        index = game.cardDecks.chanceIndex;
        game.cardDecks.chanceIndex = (index + 1) % deck.length;
    } else {
        deck = game.cardDecks.communityChest;
        index = game.cardDecks.communityIndex;
        game.cardDecks.communityIndex = (index + 1) % deck.length;
    }

    return deck[index];
}

function executeCard(game, player, card, deckType) {
    let message = card.message;

    switch (card.type) {
        case "money":
            player.money += card.amount;
            if (card.amount < 0 && player.money < 0) {
                player.bankrupt = true;
                message += ` ${player.name} is bankrupt!`;
            }
            break;

        case "move":
            const oldPosition = player.position;
            player.position = card.position;
            if (card.position === 0 || oldPosition > card.position) {
                player.money += gameConfig.salaryAmount;
                message += ` Collected ₹${gameConfig.salaryAmount} for passing Main Gate!`;
            }
            break;

        case "jail":
            player.position = 10;
            player.inJail = true;
            player.jailTurns = 0;
            player.doublesCount = 0;
            game.gameLog.push(`${player.name} was sent to Detention by card!`);
            io.to(game.code).emit("playerSentToJail", {
                player: player,
                game: game,
            });
            break;

        case "payall":
            const activePlayers = game.players.filter(
                (p) => !p.bankrupt && p.id !== player.id
            );
            const totalPay = card.amount * activePlayers.length;
            player.money -= totalPay;
            activePlayers.forEach((p) => (p.money += card.amount));
            break;

        case "collectall":
            const otherPlayers = game.players.filter(
                (p) => !p.bankrupt && p.id !== player.id
            );
            otherPlayers.forEach((p) => {
                p.money -= card.amount;
                player.money += card.amount;
            });
            break;

        case "repair":
            // Calculate total houses and hotels owned by player
            let totalHouses = 0;
            let totalHotels = 0;

            // Loop through all board properties to count player's buildings
            game.board.forEach(property => {
                if (property.owner === player.id && property.type === 'property') {
                    totalHouses += property.houses || 0;
                    if (property.hotel) {
                        totalHotels += 1;
                    }
                }
            });

            const repairCost = totalHouses * card.house + totalHotels * card.hotel;
            player.money -= repairCost;
            message += ` Total cost: ₹${repairCost} (${totalHouses} houses × ₹${card.house} + ${totalHotels} hotels × ₹${card.hotel})`;

            // Check for bankruptcy
            if (player.money < 0) {
                player.bankrupt = true;
                message += ` ${player.name} is bankrupt!`;
            }
            break;

        case "getoutofjail":
            if (!player.getOutOfJailCards) player.getOutOfJailCards = 0;
            player.getOutOfJailCards++;
            break;
    }

    return {
        message: message,
        deckType: deckType,
    };
}

// REST API Endpoints
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date(),
        activeGames: games.size,
        activePlayers: players.size,
    });
});

app.get("/api/games/:code", (req, res) => {
    const game = games.get(req.params.code);
    if (!game) {
        return res.status(404).json({ error: "Game not found" });
    }

    const publicGame = {
        code: game.code,
        hostName: game.hostName,
        playerCount: game.players.length,
        maxPlayers: gameConfig.maxPlayers,
        gameState: game.gameState,
        createdAt: game.createdAt,
    };

    res.json(publicGame);
});

// WebSocket event handlers
io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on("createGame", (data) => {
        try {
            const { error, value } = createGameSchema.validate(data);
            if (error) {
                socket.emit("error", { message: error.details[0].message });
                return;
            }

            const game = createNewGame(value.hostName, socket.id);
            // DON'T add host as a player anymore - just create the game
            socket.join(game.code);
            players.set(socket.id, {
                gameCode: game.code,
                isHost: true,
                playerId: null  // Host has no player ID
            });

            socket.emit("gameCreated", {
                gameCode: game.code,
                hostId: game.hostId,
                game: game,
                isHost: true
            });

            console.log(`Game created: ${game.code} by ${value.hostName} (Host Only)`);
        } catch (err) {
            console.error("Create game error:", err);
            socket.emit("error", { message: "Failed to create game" });
        }

    });

    socket.on("joinGame", (data) => {
        try {
            const { error, value } = joinGameSchema.validate(data);
            if (error) {
                socket.emit("error", { message: error.details[0].message });
                return;
            }

            const result = addPlayerToGame(
                value.gameCode,
                value.playerName,
                socket.id
            );

            if (!result) {
                socket.emit("error", { message: "Game not found" });
                return;
            }

            if (result.error) {
                socket.emit("error", { message: result.error });
                return;
            }

            socket.join(value.gameCode);

            // Send confirmation to the joining player
            socket.emit("gameJoined", {
                player: result.player,
                game: result.game,
            });

            // Notify ALL other players in the room (including host) about the new player
            socket.to(value.gameCode).emit("playerJoined", {
                player: result.player,
                game: result.game,  // Send full game object to everyone
                playerCount: result.game.players.length,
            });

            console.log(`Player ${value.playerName} joined game ${value.gameCode}`);
        } catch (err) {
            console.error("Join game error:", err);
            socket.emit("error", { message: "Failed to join game" });
        }
    });

    socket.on("startGame", (data) => {
        const playerInfo = players.get(socket.id);
        if (!playerInfo) {
            socket.emit("error", { message: "Player not in any game" });
            return;
        }

        const game = games.get(playerInfo.gameCode);
        if (!game || game.hostId !== socket.id) {
            socket.emit("error", { message: "Only host can start the game" });
            return;
        }

        if (game.players.length < gameConfig.minPlayers) {
            socket.emit("error", {
                message: `Need at least ${gameConfig.minPlayers} players to start`,
            });
            return;
        }

        game.gameState = "playing";
        game.currentPlayerIndex = 0;
        game.gameLog.push("Game started!");

        io.to(game.code).emit("gameStarted", {
            game: game,
            currentPlayer: game.players[0],
        });

        console.log(`Game ${game.code} started`);
    });

    // Host can pause/resume game
    socket.on("pauseGame", (data) => {
        const playerInfo = players.get(socket.id);
        if (!playerInfo || !playerInfo.isHost) {
            socket.emit("error", { message: "Only host can pause game" });
            return;
        }

        const game = games.get(playerInfo.gameCode);
        if (!game) return;

        game.gameState = game.gameState === "paused" ? "playing" : "paused";
        io.to(game.code).emit("gameStateChanged", {
            gameState: game.gameState,
            message: `Game ${game.gameState} by host`
        });
    });

    // Host can kick players
    socket.on("kickPlayer", (data) => {
        const playerInfo = players.get(socket.id);
        if (!playerInfo || !playerInfo.isHost) {
            socket.emit("error", { message: "Only host can kick players" });
            return;
        }

        const game = games.get(playerInfo.gameCode);
        if (!game) return;

        // Find and remove player
        const kickedPlayer = game.players.find(p => p.id === data.playerId);
        if (kickedPlayer) {
            game.players = game.players.filter(p => p.id !== data.playerId);

            // Notify kicked player
            io.to(kickedPlayer.socketId).emit("playerKicked", {
                reason: "Kicked by host"
            });

            // Update all players
            io.to(game.code).emit("playerLeft", {
                playerId: data.playerId,
                playerName: kickedPlayer.name,
                playerCount: game.players.length,
                reason: "Kicked by host"
            });
        }
    });


    socket.on("rollDice", (data) => {
        const playerInfo = players.get(socket.id);
        if (!playerInfo) {
            socket.emit("error", { message: "Player not in any game" });
            return;
        }
        if (playerInfo.isHost) {
            socket.emit("error", { message: "Host cannot participate in gameplay" });
            return;
        }
        const game = games.get(playerInfo.gameCode);
        if (!game) {
            socket.emit("error", { message: "Game not found" });
            return;
        }

        if (game.gameState !== "playing") {
            socket.emit("error", { message: "Game not in progress" });
            return;
        }

        if (game.currentPlayerIndex >= game.players.length || game.currentPlayerIndex < 0) {
            console.error("Invalid current player index:", game.currentPlayerIndex);
            game.currentPlayerIndex = 0; // Reset to first player
        }
        const currentPlayer = game.players[game.currentPlayerIndex];
        if (!currentPlayer) {
            socket.emit("error", { message: "Current player not found" });
            return;
        }
        if (currentPlayer.socketId !== socket.id) {
            socket.emit("error", { message: "Not your turn" });
            return;
        }
        try {
            const dice = rollDice();
            const totalRoll = dice[0] + dice[1];
            const isDoubles = dice[0] === dice[1];

            // Handle jail turns
            if (currentPlayer.inJail) {
                const playerMoved = handleJailTurn(game, currentPlayer, dice);

                io.to(game.code).emit("diceRolled", {
                    player: currentPlayer,
                    dice: dice,
                    totalRoll: totalRoll,
                    isDoubles: isDoubles,
                    inJail: true,
                    newPosition: currentPlayer.position,
                    landedProperty: game.board[currentPlayer.position],
                    game: game,
                });

                if (playerMoved) {
                    handlePropertyLanding(game, currentPlayer, game.board[currentPlayer.position], dice);
                }
                return;
            }

            // Track consecutive doubles
            if (!currentPlayer.doublesCount) currentPlayer.doublesCount = 0;

            if (isDoubles) {
                currentPlayer.doublesCount++;

                // 3 doubles in a row = go to jail
                if (currentPlayer.doublesCount >= 3) {
                    game.gameLog.push(`${currentPlayer.name} rolled 3 doubles in a row!`);
                    sendPlayerToJail(game, currentPlayer);

                    io.to(game.code).emit("diceRolled", {
                        player: currentPlayer,
                        dice: dice,
                        totalRoll: totalRoll,
                        isDoubles: isDoubles,
                        tripledDoubles: true,
                        newPosition: currentPlayer.position,
                        landedProperty: game.board[currentPlayer.position],
                        game: game,
                    });
                    return;
                }
            } else {
                currentPlayer.doublesCount = 0; // Reset if not doubles
            }

            movePlayer(game, currentPlayer.id, totalRoll);

            const landedProperty = game.board[currentPlayer.position];
            game.gameLog.push(
                `${currentPlayer.name} rolled ${dice[0]}+${dice[1]}=${totalRoll} and landed on ${landedProperty.name}`
            );

            io.to(game.code).emit("diceRolled", {
                player: currentPlayer,
                dice: dice,
                totalRoll: totalRoll,
                isDoubles: isDoubles,
                newPosition: currentPlayer.position,
                landedProperty: landedProperty,
                game: game,
            });

            handlePropertyLanding(game, currentPlayer, landedProperty, dice);
        } catch (err) {
            console.error("Roll dice error:", err);
            socket.emit("error", { message: "Failed to roll dice" })
        }
    });

    socket.on("buyProperty", (data) => {
        const playerInfo = players.get(socket.id);
        if (!playerInfo) {
            socket.emit("error", { message: "Player not in any game" });
            return;
        }

        const game = games.get(playerInfo.gameCode);
        const player = game.players.find((p) => p.socketId === socket.id);

        // Check if it's player's turn
        const currentPlayer = game.players[game.currentPlayerIndex];
        if (currentPlayer.socketId !== socket.id) {
            socket.emit("error", { message: "Not your turn" });
            return;
        }

        const property = game.board[player.position];

        // Validation checks
        if (
            !property ||
            !["property", "transport", "utility"].includes(property.type)
        ) {
            socket.emit("error", {
                message:
                    property.type === "start"
                        ? "Cannot buy the Main Gate!"
                        : property.type === "tax"
                            ? "Cannot buy tax spaces!"
                            : "Cannot buy this space",
            });
            return;
        }

        if (property.owner) {
            socket.emit("error", { message: "Property already owned" });
            return;
        }

        if (player.money < property.price) {
            socket.emit("error", { message: "Insufficient funds" });
            return;
        }

        // Execute purchase
        player.money -= property.price;
        property.owner = player.id;
        player.properties.push(property.position);

        game.gameLog.push(
            `${player.name} bought ${property.name} for ₹${property.price}`
        );

        io.to(game.code).emit("propertyPurchased", {
            player: player,
            property: property,
            game: game,
        });

        // Don't auto-end turn - let player choose
    });

    socket.on("buildProperty", (data) => {
        const playerInfo = players.get(socket.id);
        if (!playerInfo) return;

        const game = games.get(playerInfo.gameCode);
        const player = game.players.find((p) => p.socketId === socket.id);

        if (!data.propertyPosition || !data.buildType) {
            socket.emit("error", { message: "Invalid building request" });
            return;
        }

        const result = buildOnProperty(
            game,
            player,
            data.propertyPosition,
            data.buildType
        );

        if (result.success) {
            const property = game.board.find(
                (p) => p.position === data.propertyPosition
            );

            io.to(game.code).emit("propertyBuilt", {
                player: player,
                property: property,
                buildType: data.buildType,
                buildings: result.buildings,
                game: game,
            });
        } else {
            socket.emit("error", { message: result.message });
        }
    });

    socket.on("endTurn", (data) => {
        const playerInfo = players.get(socket.id);
        if (!playerInfo) return;

        const game = games.get(playerInfo.gameCode);
        if (!game) return;

        endPlayerTurn(game);
    });

    socket.on("payJailFine", (data) => {
        const playerInfo = players.get(socket.id);
        if (!playerInfo) return;

        const game = games.get(playerInfo.gameCode);
        const player = game.players.find((p) => p.socketId === socket.id);

        if (player.inJail) {
            payJailFine(game, player);
        }
    });

    socket.on("useJailCard", (data) => {
        const playerInfo = players.get(socket.id);
        if (!playerInfo) return;

        const game = games.get(playerInfo.gameCode);
        const player = game.players.find((p) => p.socketId === socket.id);

        if (player.inJail) {
            useGetOutOfJailCard(game, player);
        }
    });
    socket.on("hostAction", (data) => {
        const playerInfo = players.get(socket.id);
        if (!playerInfo || !playerInfo.isHost) {
            return socket.emit("error", { message: "Only the host can perform this action." });
        }

        const game = games.get(playerInfo.gameCode);
        if (!game) {
            return socket.emit("error", { message: "Game not found." });
        }
        let targetPlayer = null;
        if (data.action !== 'broadcastMessage') {
            targetPlayer = game.players.find(p => p.id === data.playerId);
            if (!targetPlayer) {
                return socket.emit("error", { message: "Target player not found." });
            }
        }

        if (targetPlayer) {
            console.log(`Host action received: ${data.action} for player ${targetPlayer.name}`);
        } else {
            console.log(`Host action received: ${data.action}`);
        }

        switch (data.action) {
            case 'modifyMoney':
                const amount = parseInt(data.amount, 10);
                if (!isNaN(amount)) {
                    targetPlayer.money += amount;
                    game.gameLog.push(`Host adjusted ${targetPlayer.name}'s money by ${amount > 0 ? '+' : ''}${amount}.`);
                }
                break;
            case 'forceEndTurn':
                // Important: Verify it's actually the target player's turn before ending it.
                if (game.players[game.currentPlayerIndex].id === data.playerId) {
                    game.gameLog.push(`Host forced ${targetPlayer.name}'s turn to end.`);
                    endPlayerTurn(game); // Reusing your existing function!
                } else {
                    // Silently ignore or send an error if it's not their turn
                    return socket.emit("error", { message: "It is not that player's turn." });
                }
                break;
            case 'broadcastMessage':
                if (data.message && data.message.trim() !== '') {
                    // Emit a new, specific event for this. It's more efficient.
                    io.to(game.code).emit('hostMessage', { message: data.message });
                }
                break;
            case 'kickPlayerIngame':
                // Mark the player as bankrupt. This is an easy way to remove them from active play.
                targetPlayer.bankrupt = true;

                // Iterate through the entire board to find and free up their properties.
                game.board.forEach(prop => {
                    if (prop.owner === targetPlayer.id) {
                        prop.owner = null;
                        prop.houses = 0;
                        prop.hotel = false;
                        // You could also reset mortgaged status if you have it
                        // prop.mortgaged = false;
                    }
                });

                game.gameLog.push(`Host kicked ${targetPlayer.name} from the game. Their properties are now available.`);

                // Notify all players that this player has left (reusing the existing 'playerLeft' event)
                io.to(game.code).emit("playerLeft", {
                    playerId: targetPlayer.id,
                    playerName: targetPlayer.name,
                    reason: "Kicked by host"
                });

                // Notify the kicked player specifically so their client returns to the main menu
                // (reusing the existing 'playerKicked' event)
                io.to(targetPlayer.socketId).emit("playerKicked", {
                    reason: "You have been kicked by the host."
                });
                break;
        }
        if (data.action !== 'broadcastMessage') {
            broadcastGameUpdate(game);
        }
    });
    socket.on("endGameByHost", () => {
        const playerInfo = players.get(socket.id);
        if (!playerInfo || !playerInfo.isHost) {
            return socket.emit("error", { message: "Only the host can end the game." });
        }

        const game = games.get(playerInfo.gameCode);
        if (!game) {
            return socket.emit("error", { message: "Game not found." });
        }

        console.log(`Host ended game: ${game.code}`);

        // Notify all players (including the host) that the game has ended
        io.to(game.code).emit("gameEnded", {
            reason: "The host has ended the game."
        });

        // Clean up server state by removing all players and the game itself
        game.players.forEach(player => {
            players.delete(player.socketId);
        });
        players.delete(socket.id); // Remove the host
        games.delete(game.code); // Delete the game
    });
    socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`);
        const playerInfo = players.get(socket.id);
        if (playerInfo) {
            const game = games.get(playerInfo.gameCode);
            if (game) {
                if (playerInfo.isHost) {
                    // Host disconnected - end game or transfer host
                    console.log(`Host disconnected from game: ${playerInfo.gameCode}`);
                    io.to(playerInfo.gameCode).emit("gameEnded", {
                        reason: "Host left the game"
                    });
                    game.players.forEach(player => {
                        players.delete(player.socketId);
                    });
                    games.delete(playerInfo.gameCode);
                } else {
                    // Regular player disconnected
                    const playerIndex = game.players.findIndex(p => p.socketId === socket.id);
                    if (playerIndex !== -1) {
                        const disconnectedPlayer = game.players[playerIndex];

                        // Mark as bankrupt instead of removing to maintain game flow
                        disconnectedPlayer.bankrupt = true;

                        socket.to(playerInfo.gameCode).emit("playerLeft", {
                            playerId: playerInfo.playerId,
                            playerName: disconnectedPlayer.name,
                            playerCount: game.players.filter(p => !p.bankrupt).length,
                            reason: "Player disconnected"
                        });

                        // Check if game should end
                        const activePlayers = game.players.filter(p => !p.bankrupt);
                        if (activePlayers.length <= 1 && game.gameState === "playing") {
                            game.gameState = "finished";
                            io.to(game.code).emit("gameEnded", {
                                winner: activePlayers[0] || null,
                                reason: "Not enough players remaining"
                            });
                        }
                    }
                }
            }
            players.delete(socket.id);
        }
    });
});

function handlePropertyLanding(game, player, property, lastDiceRoll = [1, 1]) {
    if (property.type === "jail" && !player.inJail) {
        game.gameLog.push(
            `${player.name} is Just Visiting Detention - no penalty!`
        );
        return; // Nothing else happens
    }
    // Handle "Go to Jail" space
    if (property.type === "go_to_jail") {
        sendPlayerToJail(game, player);
        return;
    }
    if (property.type === "chance" || property.type === "community_chest") {
        const cardType = property.type === "chance" ? "chance" : "community_chest";
        const card = drawCard(game, cardType);
        const result = executeCard(game, player, card, cardType);

        game.gameLog.push(`${player.name} drew: ${result.message}`);

        io.to(game.code).emit("cardDrawn", {
            player: player,
            card: card,
            result: result.message,
            deckType: result.deckType,
            game: game,
        });

        // Handle movement cards
        if (card.type === "move") {
            const newProperty = game.board[player.position];
            // Recursively handle landing on new property
            setTimeout(() => {
                handlePropertyLanding(game, player, newProperty, lastDiceRoll);
            }, 1000);
        }

        return;
    }
    // Handle tax spaces
    if (property.type === "tax") {
        const taxAmount = property.amount;

        if (player.money >= taxAmount) {
            player.money -= taxAmount;
            game.gameLog.push(`${player.name} paid ₹${taxAmount} ${property.name}`);

            io.to(game.code).emit("taxPaid", {
                player: player,
                amount: taxAmount,
                property: property,
                game: game,
            });
        } else {
            // Player can't afford tax - bankruptcy
            game.gameLog.push(
                `${player.name} cannot afford ₹${taxAmount} ${property.name} and is bankrupt!`
            );
            player.bankrupt = true;

            io.to(game.code).emit("playerBankrupt", {
                player: player,
                game: game,
            });
        }
    }

    // Handle landing on own property - offer to build
    if (property.owner === player.id && property.type === "property") {
        const buildCheck = canBuildOnProperty(game, player, property.position);
        if (buildCheck.canBuild) {
            io.to(game.code).emit("buildingOffer", {
                player: player,
                property: property,
                buildType: buildCheck.buildType,
                cost: buildCheck.cost,
                game: game,
            });
            return; // Don't process rent on own property
        }
    }

    // Handle rent on owned properties
    if (property.owner && property.owner !== player.id && !property.mortgaged) {
        const rent = calculateRent(property, game, lastDiceRoll);
        const owner = game.players.find((p) => p.id === property.owner);

        if (player.money >= rent) {
            player.money -= rent;
            owner.money += rent;
            game.gameLog.push(
                `${player.name} paid ₹${rent} rent to ${owner.name} for ${property.name}`
            );

            io.to(game.code).emit("rentPaid", {
                payer: player,
                receiver: owner,
                amount: rent,
                property: property,
            });
        } else {
            game.gameLog.push(`${player.name} cannot afford rent and is bankrupt!`);
            player.bankrupt = true;

            io.to(game.code).emit("playerBankrupt", {
                player: player,
                game: game,
            });
        }
    }

    // Check for game end
    const activePlayers = game.players.filter((p) => !p.bankrupt);
    if (activePlayers.length === 1) {
        game.gameState = "finished";
        io.to(game.code).emit("gameEnded", {
            winner: activePlayers[0],
            reason: "All other players bankrupt",
        });
    }
}

function canBuildOnProperty(game, player, propertyPosition) {
    const property = game.board.find((p) => p.position === propertyPosition);

    // Must be a property (not transport, utility, etc.)
    if (property.type !== "property") {
        return { canBuild: false, reason: "Cannot build on this type of space" };
    }

    // Must own the property
    if (property.owner !== player.id) {
        return { canBuild: false, reason: "You do not own this property" };
    }

    const currentHouses = property.houses || 0;

    // Check if can build hotel (must have exactly 4 houses)
    if (currentHouses === 4 && !property.hotel) {
        if (player.money >= property.price) {
            return { canBuild: true, buildType: "hotel", cost: property.price };
        } else {
            return { canBuild: false, reason: "Insufficient funds for hotel" };
        }
    }

    // Check if can build house (less than 4 houses and no hotel)
    if (currentHouses < 4 && !property.hotel) {
        if (player.money >= property.price) {
            return { canBuild: true, buildType: "house", cost: property.price };
        } else {
            return { canBuild: false, reason: "Insufficient funds for house" };
        }
    }

    return { canBuild: false, reason: "Property fully developed" };
}

function buildOnProperty(game, player, propertyPosition, buildType) {
    const buildCheck = canBuildOnProperty(game, player, propertyPosition);

    if (!buildCheck.canBuild) {
        return { success: false, message: buildCheck.reason };
    }

    const property = game.board.find((p) => p.position === propertyPosition);

    // Deduct money
    player.money -= buildCheck.cost;

    if (buildType === "house") {
        if (!property.houses) property.houses = 0;
        property.houses += 1;
        game.gameLog.push(
            `${player.name} built a house on ${property.name} for ₹${buildCheck.cost}`
        );

        return {
            success: true,
            message: `House built on ${property.name}`,
            buildings: { houses: property.houses, hotel: false },
        };
    } else if (buildType === "hotel") {
        property.houses = 0; // Remove 4 houses
        property.hotel = true;
        game.gameLog.push(
            `${player.name} built a hotel on ${property.name} for ₹${buildCheck.cost}`
        );

        return {
            success: true,
            message: `Hotel built on ${property.name}`,
            buildings: { houses: 0, hotel: true },
        };
    }

    return { success: false, message: "Invalid build type" };
}

function sendPlayerToJail(game, player) {
    player.position = 10; // Jail position
    player.inJail = true;
    player.jailTurns = 0;
    player.doublesCount = 0; // Reset doubles count

    game.gameLog.push(`${player.name} was sent to Detention!`);

    io.to(game.code).emit("playerSentToJail", {
        player: player,
        game: game,
    });
}

function handleJailTurn(game, player, dice) {
    const isDoubles = dice[0] === dice[1];

    if (isDoubles) {
        // Player rolled doubles - gets out of jail
        player.inJail = false;
        player.jailTurns = 0;

        // Move player normally
        const totalRoll = dice[0] + dice[1];
        movePlayer(game, player.id, totalRoll);

        game.gameLog.push(
            `${player.name} rolled doubles and got out of Detention!`
        );

        io.to(game.code).emit("playerLeftJail", {
            player: player,
            method: "doubles",
            newPosition: player.position,
            game: game,
        });

        return true; // Player moved
    } else {
        // Increment jail turns
        player.jailTurns++;

        if (player.jailTurns >= 3) {
            // Must pay fine after 3 turns
            payJailFine(game, player);
            return false; // Turn ends
        } else {
            game.gameLog.push(
                `${player.name} failed to roll doubles. Detention turn ${player.jailTurns}/3`
            );

            io.to(game.code).emit("jailTurnFailed", {
                player: player,
                turnsRemaining: 3 - player.jailTurns,
                game: game,
            });

            return false; // Turn ends
        }
    }
}

function payJailFine(game, player) {
    const fine = 50;

    if (player.money >= fine) {
        player.money -= fine;
        player.inJail = false;
        player.jailTurns = 0;

        game.gameLog.push(`${player.name} paid ₹${fine} fine and left Detention`);

        io.to(game.code).emit("playerLeftJail", {
            player: player,
            method: "fine",
            amount: fine,
            game: game,
        });
    } else {
        // Player can't afford fine - bankruptcy
        player.bankrupt = true;
        game.gameLog.push(
            `${player.name} cannot afford Detention fine and is bankrupt!`
        );

        io.to(game.code).emit("playerBankrupt", {
            player: player,
            reason: "jail_fine",
            game: game,
        });
    }
}

function useGetOutOfJailCard(game, player) {
    if (player.getOutOfJailCards && player.getOutOfJailCards > 0) {
        player.getOutOfJailCards--;
        player.inJail = false;
        player.jailTurns = 0;

        game.gameLog.push(`${player.name} used "Get Out of Detention Free" card`);

        io.to(game.code).emit("playerLeftJail", {
            player: player,
            method: "card",
            game: game,
        });

        return true;
    }
    return false;
}

function endPlayerTurn(game) {
    const activePlayers = game.players.filter(p => !p.bankrupt);
    if (activePlayers.length <= 1) {
        game.gameState = "finished";
        io.to(game.code).emit("gameEnded", {
            winner: activePlayers[0] || null,
            reason: "Game completed"
        });
        return;
    }
    // Find next active player
    let attempts = 0;
    const maxAttempts = game.players.length;
    do {
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
        attempts++;

        if (attempts > maxAttempts) {
            console.error("Could not find next active player");
            game.currentPlayerIndex = 0;
            break;
        }
    } while (game.players[game.currentPlayerIndex].bankrupt);

    const nextPlayer = game.players[game.currentPlayerIndex];

    io.to(game.code).emit("turnEnded", {
        nextPlayer: nextPlayer,
        game: game,
    });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🎮 Campus Monopoly Server running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
});

module.exports = { app, server, io };
