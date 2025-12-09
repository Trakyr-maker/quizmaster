const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});
const cors = require('cors');

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        games: games.size,
        players: playerSockets.size 
    });
});

// Debug endpoint
app.get('/api/games', (req, res) => {
    const gameList = Array.from(games.entries()).map(([code, game]) => ({
        roomCode: code,
        players: game.players.length,
        state: game.state
    }));
    res.json(gameList);
});

// Game state storage
const games = new Map();
const playerSockets = new Map();

// Generate random room code
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Game class
class Game {
    constructor(roomCode, host) {
        this.roomCode = roomCode;
        this.host = host;
        this.players = [];
        this.state = 'lobby'; // lobby, playing, ended
        this.settings = {
            teamMode: false,
            timerEnabled: true,
            questionTime: 30
        };
        this.gameBoard = null;
        this.currentQuestion = null;
        this.currentPlayer = null;
        this.buzzedPlayers = new Set();
        this.playerScores = new Map();
    }

    addPlayer(player) {
        this.players.push(player);
        this.playerScores.set(player.id, 0);
    }

    removePlayer(playerId) {
        this.players = this.players.filter(p => p.id !== playerId);
        this.playerScores.delete(playerId);
    }

    initializeBoard() {
        // 5 Kategorien mit je 5 Fragen
        this.gameBoard = {
            categories: [
                {
                    name: 'Allgemeinwissen',
                    questions: [
                        { points: 100, question: 'Was ist die Hauptstadt von Deutschland?', answer: 'Berlin', completed: false },
                        { points: 200, question: 'Wie viele Kontinente gibt es?', answer: '7', completed: false },
                        { points: 300, question: 'In welchem Jahr fiel die Berliner Mauer?', answer: '1989', completed: false },
                        { points: 400, question: 'Wer schrieb "Faust"?', answer: 'Goethe', completed: false },
                        { points: 500, question: 'Wie heißt der längste Fluss Europas?', answer: 'Wolga', completed: false }
                    ]
                },
                {
                    name: 'Wissenschaft',
                    questions: [
                        { points: 100, question: 'Was ist H2O?', answer: 'Wasser', completed: false },
                        { points: 200, question: 'Wie viele Planeten hat unser Sonnensystem?', answer: '8', completed: false },
                        { points: 300, question: 'Was ist die Lichtgeschwindigkeit (in km/s)?', answer: '300000', completed: false },
                        { points: 400, question: 'Wer entwickelte die Relativitätstheorie?', answer: 'Einstein', completed: false },
                        { points: 500, question: 'Was ist das chemische Symbol für Gold?', answer: 'Au', completed: false }
                    ]
                },
                {
                    name: 'Geschichte',
                    questions: [
                        { points: 100, question: 'In welchem Jahr begann der Zweite Weltkrieg?', answer: '1939', completed: false },
                        { points: 200, question: 'Wer war der erste Bundeskanzler Deutschlands?', answer: 'Adenauer', completed: false },
                        { points: 300, question: 'Wie viele Jahre dauerte der Hundertjährige Krieg?', answer: '116', completed: false },
                        { points: 400, question: 'In welchem Jahr wurde Amerika entdeckt?', answer: '1492', completed: false },
                        { points: 500, question: 'Wer war der letzte römische Kaiser?', answer: 'Romulus Augustulus', completed: false }
                    ]
                },
                {
                    name: 'Sport',
                    questions: [
                        { points: 100, question: 'Wie viele Spieler hat ein Fußballteam auf dem Feld?', answer: '11', completed: false },
                        { points: 200, question: 'In welchem Land fanden die Olympischen Spiele 2020 statt?', answer: 'Japan', completed: false },
                        { points: 300, question: 'Wie heißt der berühmteste Tennisspieler aus der Schweiz?', answer: 'Federer', completed: false },
                        { points: 400, question: 'Wie viele Grand-Slam-Turniere gibt es im Tennis?', answer: '4', completed: false },
                        { points: 500, question: 'Wer ist der erfolgreichste Formel-1-Fahrer aller Zeiten?', answer: 'Hamilton', completed: false }
                    ]
                },
                {
                    name: 'Geographie',
                    questions: [
                        { points: 100, question: 'Auf welchem Kontinent liegt Ägypten?', answer: 'Afrika', completed: false },
                        { points: 200, question: 'Was ist die Hauptstadt von Frankreich?', answer: 'Paris', completed: false },
                        { points: 300, question: 'Wie heißt der höchste Berg der Welt?', answer: 'Mount Everest', completed: false },
                        { points: 400, question: 'Welches Land hat die meisten Einwohner?', answer: 'China', completed: false },
                        { points: 500, question: 'Wie viele Länder grenzen an Deutschland?', answer: '9', completed: false }
                    ]
                }
            ]
        };
    }

    selectRandomPlayer() {
        if (this.players.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * this.players.length);
        this.currentPlayer = this.players[randomIndex];
        return this.currentPlayer;
    }

    selectQuestion(categoryIndex, questionIndex) {
        const question = this.gameBoard.categories[categoryIndex].questions[questionIndex];
        if (question.completed) return null;
        
        this.currentQuestion = {
            ...question,
            categoryIndex,
            questionIndex,
            askingPlayer: this.currentPlayer
        };
        this.buzzedPlayers.clear();
        return this.currentQuestion;
    }

    buzz(playerId) {
        if (this.buzzedPlayers.has(playerId)) return false;
        this.buzzedPlayers.add(playerId);
        return true;
    }

    checkAnswer(playerId, answer) {
        const correct = answer.toLowerCase().trim() === this.currentQuestion.answer.toLowerCase().trim();
        const points = this.currentQuestion.points;
        
        if (correct) {
            this.playerScores.set(playerId, this.playerScores.get(playerId) + points);
        } else {
            this.playerScores.set(playerId, this.playerScores.get(playerId) - Math.floor(points / 2));
        }
        
        if (correct || this.buzzedPlayers.size >= this.players.length) {
            // Frage abschließen
            this.gameBoard.categories[this.currentQuestion.categoryIndex]
                .questions[this.currentQuestion.questionIndex].completed = true;
            this.currentQuestion = null;
        }
        
        return correct;
    }

    isGameComplete() {
        return this.gameBoard.categories.every(category =>
            category.questions.every(q => q.completed)
        );
    }

    getScoreboard() {
        return Array.from(this.playerScores.entries())
            .map(([id, score]) => {
                const player = this.players.find(p => p.id === id);
                return { id, name: player?.name || 'Unknown', score };
            })
            .sort((a, b) => b.score - a.score);
    }
}

// Socket.io handlers
io.on('connection', (socket) => {
    console.log('Neuer Client verbunden:', socket.id);

    // Host erstellt neues Spiel
    socket.on('create-game', (hostName) => {
        const roomCode = generateRoomCode();
        const game = new Game(roomCode, { id: socket.id, name: hostName, isHost: true });
        games.set(roomCode, game);
        playerSockets.set(socket.id, roomCode);
        
        socket.join(roomCode);
        socket.emit('game-created', { roomCode, hostId: socket.id });
        console.log(`✅ Spiel erstellt: ${roomCode} von ${hostName} (Socket: ${socket.id})`);
        console.log(`📊 Aktive Spiele: ${games.size}`);
    });

    // Spieler tritt Spiel bei
    socket.on('join-game', ({ roomCode, playerName }) => {
        console.log(`🔍 Join-Versuch: Code="${roomCode}", Spieler="${playerName}", Socket="${socket.id}"`);
        console.log(`📋 Verfügbare Codes: ${Array.from(games.keys()).join(', ')}`);
        
        const game = games.get(roomCode);
        
        if (!game) {
            console.log(`❌ Spiel nicht gefunden für Code: ${roomCode}`);
            socket.emit('error', 'Spiel nicht gefunden');
            return;
        }
        
        if (game.state !== 'lobby') {
            console.log(`❌ Spiel ${roomCode} hat bereits begonnen`);
            socket.emit('error', 'Spiel hat bereits begonnen');
            return;
        }
        
        const player = { id: socket.id, name: playerName, isHost: false };
        game.addPlayer(player);
        playerSockets.set(socket.id, roomCode);
        
        socket.join(roomCode);
        socket.emit('joined-game', { roomCode, playerId: socket.id });
        
        // Aktualisiere alle Spieler in der Lobby
        io.to(roomCode).emit('player-list-update', {
            players: game.players,
            host: game.host
        });
        
        console.log(`✅ ${playerName} ist Spiel ${roomCode} beigetreten`);
        console.log(`👥 Spieler im Raum: ${game.players.length}`);
    });

    // Host aktualisiert Einstellungen
    socket.on('update-settings', (settings) => {
        const roomCode = playerSockets.get(socket.id);
        const game = games.get(roomCode);
        
        if (!game || game.host.id !== socket.id) return;
        
        game.settings = { ...game.settings, ...settings };
        io.to(roomCode).emit('settings-updated', game.settings);
    });

    // Host startet das Spiel
    socket.on('start-game', () => {
        const roomCode = playerSockets.get(socket.id);
        const game = games.get(roomCode);
        
        if (!game || game.host.id !== socket.id) return;
        
        if (game.players.length < 1) {
            socket.emit('error', 'Mindestens 1 Spieler benötigt');
            return;
        }
        
        game.state = 'playing';
        game.initializeBoard();
        const startPlayer = game.selectRandomPlayer();
        
        io.to(roomCode).emit('game-started', {
            board: game.gameBoard,
            currentPlayer: startPlayer,
            scores: game.getScoreboard()
        });
        
        console.log(`Spiel ${roomCode} gestartet`);
    });

    // Spieler wählt Frage aus
    socket.on('select-question', ({ categoryIndex, questionIndex }) => {
        const roomCode = playerSockets.get(socket.id);
        const game = games.get(roomCode);
        
        if (!game || game.state !== 'playing') return;
        if (game.currentPlayer.id !== socket.id) return;
        
        const question = game.selectQuestion(categoryIndex, questionIndex);
        
        if (!question) {
            socket.emit('error', 'Frage bereits beantwortet');
            return;
        }
        
        io.to(roomCode).emit('question-selected', {
            question: {
                text: question.question,
                points: question.points,
                categoryIndex: question.categoryIndex,
                questionIndex: question.questionIndex
            },
            askingPlayer: game.currentPlayer
        });
    });

    // Spieler buzzert
    socket.on('buzz', () => {
        const roomCode = playerSockets.get(socket.id);
        const game = games.get(roomCode);
        
        if (!game || !game.currentQuestion) return;
        
        const canBuzz = game.buzz(socket.id);
        if (canBuzz) {
            const player = game.players.find(p => p.id === socket.id);
            io.to(roomCode).emit('player-buzzed', { player });
        }
    });

    // Spieler gibt Antwort
    socket.on('submit-answer', (answer) => {
        const roomCode = playerSockets.get(socket.id);
        const game = games.get(roomCode);
        
        if (!game || !game.currentQuestion) return;
        
        const correct = game.checkAnswer(socket.id, answer);
        const player = game.players.find(p => p.id === socket.id);
        
        io.to(roomCode).emit('answer-submitted', {
            player,
            answer,
            correct,
            correctAnswer: game.currentQuestion ? null : game.gameBoard.categories[game.currentQuestion.categoryIndex]
                .questions[game.currentQuestion.questionIndex].answer,
            scores: game.getScoreboard()
        });
        
        // Prüfe ob alle Fragen beantwortet wurden
        if (game.isGameComplete()) {
            game.state = 'ended';
            io.to(roomCode).emit('game-ended', {
                finalScores: game.getScoreboard()
            });
        } else if (!game.currentQuestion) {
            // Nächster Spieler wählt
            const nextPlayerIndex = (game.players.findIndex(p => p.id === game.currentPlayer.id) + 1) % game.players.length;
            game.currentPlayer = game.players[nextPlayerIndex];
            
            io.to(roomCode).emit('next-turn', {
                currentPlayer: game.currentPlayer,
                board: game.gameBoard
            });
        }
    });

    // Spieler verlässt Spiel
    socket.on('disconnect', () => {
        const roomCode = playerSockets.get(socket.id);
        if (!roomCode) return;
        
        const game = games.get(roomCode);
        if (!game) return;
        
        // Wenn Host verlässt, Spiel beenden
        if (game.host.id === socket.id) {
            io.to(roomCode).emit('host-left');
            games.delete(roomCode);
            console.log(`Host hat Spiel ${roomCode} verlassen, Spiel gelöscht`);
        } else {
            game.removePlayer(socket.id);
            io.to(roomCode).emit('player-list-update', {
                players: game.players,
                host: game.host
            });
            console.log(`Spieler ${socket.id} hat Spiel ${roomCode} verlassen`);
        }
        
        playerSockets.delete(socket.id);
    });
});

http.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
