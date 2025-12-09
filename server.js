const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Spiel-Datenstrukturen
const games = new Map();
const playerSockets = new Map();

// Quiz-Fragen
const QUESTIONS = {
  allgemeinwissen: [
    { q: 'Wie viele Kontinente gibt es?', a: '7', points: 100 },
    { q: 'Hauptstadt von Frankreich?', a: 'Paris', points: 200 },
    { q: 'Größter Planet im Sonnensystem?', a: 'Jupiter', points: 300 },
    { q: 'Wie heißt der längste Fluss der Welt?', a: 'Nil', points: 400 },
    { q: 'In welchem Jahr fiel die Berliner Mauer?', a: '1989', points: 500 }
  ],
  wissenschaft: [
    { q: 'Chemisches Symbol für Gold?', a: 'Au', points: 100 },
    { q: 'Wie viele Knochen hat ein erwachsener Mensch?', a: '206', points: 200 },
    { q: 'Lichtgeschwindigkeit in km/s?', a: '300000', points: 300 },
    { q: 'Wer entwickelte die Relativitätstheorie?', a: 'Einstein', points: 400 },
    { q: 'Wie heißt das kleinste Teilchen?', a: 'Quark', points: 500 }
  ],
  geschichte: [
    { q: 'Wann endete der 2. Weltkrieg?', a: '1945', points: 100 },
    { q: 'Erster Mensch auf dem Mond?', a: 'Armstrong', points: 200 },
    { q: 'Wann wurde die USA gegründet?', a: '1776', points: 300 },
    { q: 'Wer entdeckte Amerika?', a: 'Kolumbus', points: 400 },
    { q: 'Römischer Kaiser bei Jesu Geburt?', a: 'Augustus', points: 500 }
  ],
  sport: [
    { q: 'Wie viele Spieler in einem Fußballteam?', a: '11', points: 100 },
    { q: 'Höchster Berg der Welt?', a: 'Mount Everest', points: 200 },
    { q: 'Welches Land gewann WM 2014?', a: 'Deutschland', points: 300 },
    { q: 'Wie viele olympische Ringe gibt es?', a: '5', points: 400 },
    { q: 'Schnellster Mensch der Welt?', a: 'Usain Bolt', points: 500 }
  ],
  geographie: [
    { q: 'Größtes Land der Welt?', a: 'Russland', points: 100 },
    { q: 'Hauptstadt von Japan?', a: 'Tokio', points: 200 },
    { q: 'Wie viele Ozeane gibt es?', a: '5', points: 300 },
    { q: 'Kleinster Kontinent?', a: 'Australien', points: 400 },
    { q: 'Längste Wüste der Welt?', a: 'Sahara', points: 500 }
  ]
};

// Raumcode generieren
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Spiel-Klasse
class Game {
  constructor(roomCode, host) {
    this.roomCode = roomCode;
    this.host = host;
    this.players = [host];
    this.state = 'lobby';
    this.currentPlayer = null;
    this.currentQuestion = null;
    this.buzzedPlayers = [];
    this.scores = {};
    this.board = this.initializeBoard();
    this.completedQuestions = new Set();
  }

  initializeBoard() {
    const board = {};
    Object.keys(QUESTIONS).forEach(category => {
      board[category] = QUESTIONS[category].map(q => ({ ...q, completed: false }));
    });
    return board;
  }

  addPlayer(player) {
    this.players.push(player);
    this.scores[player.id] = 0;
  }

  selectRandomPlayer() {
    return this.players[Math.floor(Math.random() * this.players.length)];
  }
}

app.use(express.static('public'));

// Socket.io
io.on('connection', (socket) => {
  console.log('Client verbunden:', socket.id);

  socket.on('create-game', (hostName) => {
    const roomCode = generateRoomCode();
    const game = new Game(roomCode, { id: socket.id, name: hostName, isHost: true });
    games.set(roomCode, game);
    game.scores[socket.id] = 0;
    playerSockets.set(socket.id, roomCode);
    
    socket.join(roomCode);
    socket.emit('game-created', { roomCode, hostId: socket.id });
    console.log(`Spiel erstellt: ${roomCode} von ${hostName}`);
  });

  socket.on('join-game', ({ roomCode, playerName }) => {
    roomCode = roomCode.toUpperCase().trim();
    const game = games.get(roomCode);
    
    if (!game) {
      socket.emit('error', 'Spiel nicht gefunden');
      return;
    }
    
    if (game.state !== 'lobby') {
      socket.emit('error', 'Spiel hat bereits begonnen');
      return;
    }
    
    const player = { id: socket.id, name: playerName, isHost: false };
    game.addPlayer(player);
    playerSockets.set(socket.id, roomCode);
    
    socket.join(roomCode);
    socket.emit('joined-game', { roomCode, playerId: socket.id });
    
    io.to(roomCode).emit('player-list-update', {
      players: game.players,
      host: game.host
    });
    
    console.log(`${playerName} ist Spiel ${roomCode} beigetreten`);
  });

  socket.on('start-game', (roomCode) => {
    const game = games.get(roomCode);
    if (!game) return;
    
    game.state = 'playing';
    game.currentPlayer = game.selectRandomPlayer();
    
    io.to(roomCode).emit('game-started', {
      board: game.board,
      currentPlayer: game.currentPlayer,
      scores: game.scores
    });
  });

  socket.on('select-question', ({ roomCode, category, index }) => {
    const game = games.get(roomCode);
    if (!game) return;
    
    const question = game.board[category][index];
    if (question.completed) return;
    
    game.currentQuestion = { category, index, ...question };
    game.buzzedPlayers = [];
    
    io.to(roomCode).emit('question-selected', {
      question: question.q,
      points: question.points,
      category
    });
  });

  socket.on('buzz', ({ roomCode, playerId }) => {
    const game = games.get(roomCode);
    if (!game) return;
    
    if (game.buzzedPlayers.includes(playerId)) return;
    
    game.buzzedPlayers.push(playerId);
    const player = game.players.find(p => p.id === playerId);
    
    if (game.buzzedPlayers.length === 1) {
      io.to(roomCode).emit('player-buzzed', {
        playerId,
        playerName: player.name
      });
    }
  });

  socket.on('submit-answer', ({ roomCode, playerId, answer }) => {
    const game = games.get(roomCode);
    if (!game || !game.currentQuestion) return;
    
    const isCorrect = answer.toLowerCase().trim() === game.currentQuestion.a.toLowerCase().trim();
    
    if (isCorrect) {
      game.scores[playerId] += game.currentQuestion.points;
      game.board[game.currentQuestion.category][game.currentQuestion.index].completed = true;
      
      const nextPlayer = game.players.find(p => p.id === playerId);
      game.currentPlayer = nextPlayer;
      
      io.to(roomCode).emit('answer-result', {
        correct: true,
        playerId,
        points: game.currentQuestion.points,
        newScore: game.scores[playerId],
        correctAnswer: game.currentQuestion.a,
        nextPlayer: game.currentPlayer,
        scores: game.scores
      });
      
      // Check if game is over
      const allCompleted = Object.values(game.board).every(cat => 
        cat.every(q => q.completed)
      );
      
      if (allCompleted) {
        const sortedScores = Object.entries(game.scores)
          .map(([id, score]) => ({
            player: game.players.find(p => p.id === id),
            score
          }))
          .sort((a, b) => b.score - a.score);
        
        io.to(roomCode).emit('game-ended', { finalScores: sortedScores });
      }
    } else {
      game.scores[playerId] -= Math.floor(game.currentQuestion.points / 2);
      
      io.to(roomCode).emit('answer-result', {
        correct: false,
        playerId,
        points: -Math.floor(game.currentQuestion.points / 2),
        newScore: game.scores[playerId],
        correctAnswer: game.currentQuestion.a,
        scores: game.scores
      });
      
      if (game.buzzedPlayers.length === game.players.length) {
        game.board[game.currentQuestion.category][game.currentQuestion.index].completed = true;
        
        const playerIndex = game.players.findIndex(p => p.id === game.currentPlayer.id);
        game.currentPlayer = game.players[(playerIndex + 1) % game.players.length];
        
        io.to(roomCode).emit('question-failed', {
          nextPlayer: game.currentPlayer
        });
      }
    }
    
    game.currentQuestion = null;
  });

  socket.on('disconnect', () => {
    const roomCode = playerSockets.get(socket.id);
    if (roomCode) {
      const game = games.get(roomCode);
      if (game) {
        game.players = game.players.filter(p => p.id !== socket.id);
        
        if (game.players.length === 0) {
          games.delete(roomCode);
        } else if (socket.id === game.host.id) {
          game.host = game.players[0];
          game.host.isHost = true;
        }
        
        io.to(roomCode).emit('player-list-update', {
          players: game.players,
          host: game.host
        });
      }
      playerSockets.delete(socket.id);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
