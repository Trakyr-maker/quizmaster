const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 3000;

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

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

class Game {
  constructor(roomCode, host) {
    this.roomCode = roomCode;
    this.host = host;
    this.players = [];
    this.state = 'lobby';
    this.settings = {
      teamMode: false,
      numberOfTeams: 2,
      questionTime: 30,
      buzzerTime: 10
    };
    this.teams = [];
    this.currentPlayer = null;
    this.currentTeam = null;
    this.currentQuestion = null;
    this.questionPhase = null;
    this.buzzedPlayers = [];
    this.answeringPlayer = null;
    this.teamVotes = {};
    this.teamProposals = [];
    this.pendingAnswer = null;
    this.scores = {};
    this.board = this.initializeBoard();
    this.buzzerTimer = null;
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
    if (!this.settings.teamMode) {
      this.scores[player.id] = 0;
    }
  }

  setupTeams() {
    if (!this.settings.teamMode) return;
    
    this.teams = [];
    for (let i = 0; i < this.settings.numberOfTeams; i++) {
      this.teams.push({
        id: `team${i + 1}`,
        name: `Team ${i + 1}`,
        players: [],
        score: 0
      });
    }
    
    this.players.forEach((player, index) => {
      const teamIndex = index % this.settings.numberOfTeams;
      this.teams[teamIndex].players.push(player);
    });
    
    this.teams.forEach(team => {
      this.scores[team.id] = 0;
    });
  }

  selectRandomPlayer() {
    return this.players[Math.floor(Math.random() * this.players.length)];
  }

  selectRandomTeam() {
    return this.teams[Math.floor(Math.random() * this.teams.length)];
  }

  getPlayerTeam(playerId) {
    return this.teams.find(team => team.players.some(p => p.id === playerId));
  }

  nextPlayer() {
    if (this.settings.teamMode) {
      const currentIndex = this.teams.findIndex(t => t.id === this.currentTeam.id);
      this.currentTeam = this.teams[(currentIndex + 1) % this.teams.length];
    } else {
      const currentIndex = this.players.findIndex(p => p.id === this.currentPlayer.id);
      this.currentPlayer = this.players[(currentIndex + 1) % this.players.length];
    }
  }
}

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Client verbunden:', socket.id);

  socket.on('create-game', (hostName) => {
    const roomCode = generateRoomCode();
    const game = new Game(roomCode, { id: socket.id, name: hostName, isHost: true });
    games.set(roomCode, game);
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
      host: game.host,
      settings: game.settings
    });
    
    console.log(`${playerName} ist Spiel ${roomCode} beigetreten`);
  });

  socket.on('update-settings', ({ roomCode, settings }) => {
    const game = games.get(roomCode);
    if (!game || socket.id !== game.host.id) return;
    
    game.settings = { ...game.settings, ...settings };
    
    io.to(roomCode).emit('settings-updated', game.settings);
  });

  socket.on('start-game', (roomCode) => {
    const game = games.get(roomCode);
    if (!game || socket.id !== game.host.id) return;
    
    game.state = 'playing';
    
    if (game.settings.teamMode) {
      game.setupTeams();
      game.currentTeam = game.selectRandomTeam();
    } else {
      game.currentPlayer = game.selectRandomPlayer();
    }
    
    io.to(roomCode).emit('game-started', {
      board: game.board,
      currentPlayer: game.currentPlayer,
      currentTeam: game.currentTeam,
      teams: game.teams,
      scores: game.scores,
      settings: game.settings
    });
  });

  socket.on('select-question', ({ roomCode, category, index }) => {
    const game = games.get(roomCode);
    if (!game) return;
    
    const question = game.board[category][index];
    if (question.completed) return;
    
    // Prüfe ob der richtige Spieler/Team wählt
    if (game.settings.teamMode) {
      const playerTeam = game.getPlayerTeam(socket.id);
      if (!playerTeam || playerTeam.id !== game.currentTeam.id) return;
    } else {
      if (socket.id !== game.currentPlayer.id) return;
    }
    
    game.currentQuestion = { category, index, ...question };
    game.questionPhase = 'initial';
    game.answeringPlayer = game.settings.teamMode ? null : game.currentPlayer;
    game.buzzedPlayers = [];
    game.pendingAnswer = null;
    
    io.to(roomCode).emit('question-selected', {
      question: question.q,
      points: question.points,
      category,
      phase: 'initial',
      answeringPlayer: game.answeringPlayer,
      correctAnswer: question.a // Nur für Host sichtbar
    });
  });

  socket.on('submit-answer', ({ roomCode, answer }) => {
    const game = games.get(roomCode);
    if (!game || !game.currentQuestion) return;
    
    const playerName = game.players.find(p => p.id === socket.id)?.name || 'Spieler';
    const correctAnswer = game.currentQuestion.a.toLowerCase().trim();
    const givenAnswer = answer.toLowerCase().trim();
    
    // Auto-Correct: Exakte Übereinstimmung
    if (givenAnswer === correctAnswer) {
      // Automatisch richtig!
      const points = game.currentQuestion.points;
      
      // Markiere Frage als completed
      game.board[game.currentQuestion.category][game.currentQuestion.index].completed = true;
      
      if (game.settings.teamMode) {
        const team = game.getPlayerTeam(socket.id);
        game.scores[team.id] += points;
      } else {
        game.scores[socket.id] += points;
      }
      
      io.to(roomCode).emit('answer-result', {
        correct: true,
        playerName: playerName,
        points: points,
        scores: game.scores,
        correctAnswer: game.currentQuestion.a,
        autoCorrect: true,
        board: game.board
      });
      
      // Nächster Spieler/Team
      game.nextPlayer();
      
      // Check if game over
      const allCompleted = Object.values(game.board).every(cat => 
        cat.every(q => q.completed)
      );
      
      if (allCompleted) {
        const sortedScores = Object.entries(game.scores)
          .map(([id, score]) => {
            if (game.settings.teamMode) {
              const team = game.teams.find(t => t.id === id);
              return { name: team.name, score, isTeam: true };
            } else {
              const player = game.players.find(p => p.id === id);
              return { name: player.name, score, isTeam: false };
            }
          })
          .sort((a, b) => b.score - a.score);
        
        setTimeout(() => {
          io.to(roomCode).emit('game-ended', { finalScores: sortedScores });
        }, 3000);
      } else {
        setTimeout(() => {
          game.currentQuestion = null;
          io.to(roomCode).emit('question-closed', {
            nextPlayer: game.currentPlayer,
            nextTeam: game.currentTeam
          });
        }, 3000);
      }
      
      return; // Fertig, Host muss nicht bewerten
    }
    
    // Nicht exakt → Host muss bewerten
    game.pendingAnswer = {
      playerId: socket.id,
      playerName: playerName,
      answer: answer,
      isTeam: game.settings.teamMode && game.questionPhase === 'team-answer'
    };
    
    // Sende Antwort an Host zur Bewertung
    io.to(game.host.id).emit('answer-submitted', {
      playerName: playerName,
      answer: answer,
      correctAnswer: game.currentQuestion.a,
      points: game.currentQuestion.points
    });
    
    // Sende an alle dass gewartet wird
    io.to(roomCode).emit('awaiting-host-decision', {
      playerName: playerName
    });
  });

  socket.on('host-decision', ({ roomCode, isCorrect }) => {
    const game = games.get(roomCode);
    if (!game || socket.id !== game.host.id || !game.pendingAnswer) return;
    
    const points = game.currentQuestion.points;
    const halfPoints = Math.floor(points / 2);
    
    // Markiere Frage als completed
    game.board[game.currentQuestion.category][game.currentQuestion.index].completed = true;
    
    if (isCorrect) {
      // Richtige Antwort
      if (game.settings.teamMode) {
        const team = game.getPlayerTeam(game.pendingAnswer.playerId);
        game.scores[team.id] += points;
      } else {
        game.scores[game.pendingAnswer.playerId] += points;
      }
      
      io.to(roomCode).emit('answer-result', {
        correct: true,
        playerName: game.pendingAnswer.playerName,
        points: points,
        scores: game.scores,
        correctAnswer: game.currentQuestion.a,
        board: game.board // Board mitschicken!
      });
      
      // Nächster Spieler/Team
      game.nextPlayer();
      
      // Check if game over
      const allCompleted = Object.values(game.board).every(cat => 
        cat.every(q => q.completed)
      );
      
      if (allCompleted) {
        const sortedScores = Object.entries(game.scores)
          .map(([id, score]) => {
            if (game.settings.teamMode) {
              const team = game.teams.find(t => t.id === id);
              return { name: team.name, score, isTeam: true };
            } else {
              const player = game.players.find(p => p.id === id);
              return { name: player.name, score, isTeam: false };
            }
          })
          .sort((a, b) => b.score - a.score);
        
        io.to(roomCode).emit('game-ended', { finalScores: sortedScores });
      } else {
        setTimeout(() => {
          game.currentQuestion = null;
          game.pendingAnswer = null;
          io.to(roomCode).emit('question-closed', {
            nextPlayer: game.currentPlayer,
            nextTeam: game.currentTeam
          });
        }, 3000);
      }
    } else {
      // Falsche Antwort
      if (game.settings.teamMode) {
        const team = game.getPlayerTeam(game.pendingAnswer.playerId);
        game.scores[team.id] -= halfPoints;
        
        // Gegnerteam bekommt Chance
        const otherTeam = game.teams.find(t => t.id !== team.id);
        game.currentTeam = otherTeam;
        
        io.to(roomCode).emit('answer-result', {
          correct: false,
          playerName: game.pendingAnswer.playerName,
          points: -halfPoints,
          scores: game.scores,
          phase: 'team-opportunity',
          nextTeam: otherTeam,
          board: game.board // Board mitschicken!
        });
      } else {
        // Einzelspieler: Punkte abziehen, 10 Sek Buzzer
        game.scores[game.pendingAnswer.playerId] -= halfPoints;
        game.buzzedPlayers.push(game.pendingAnswer.playerId);
        game.questionPhase = 'buzzer';
        
        io.to(roomCode).emit('answer-result', {
          correct: false,
          playerName: game.pendingAnswer.playerName,
          points: -halfPoints,
          scores: game.scores,
          phase: 'buzzer',
          buzzerTime: game.settings.buzzerTime
        });
        
        // 10 Sekunden Buzzer-Timer
        if (game.buzzerTimer) clearTimeout(game.buzzerTimer);
        game.buzzerTimer = setTimeout(() => {
          // Zeit abgelaufen, nächster Spieler
          game.nextPlayer();
          
          io.to(roomCode).emit('buzzer-timeout', {
            correctAnswer: game.currentQuestion.a,
            nextPlayer: game.currentPlayer,
            nextTeam: game.currentTeam,
            board: game.board // Board mitschicken!
          });
          
          game.currentQuestion = null;
          game.pendingAnswer = null;
        }, game.settings.buzzerTime * 1000);
      }
      
      game.pendingAnswer = null;
    }
  });

  socket.on('buzz', ({ roomCode }) => {
    const game = games.get(roomCode);
    if (!game || game.questionPhase !== 'buzzer') return;
    
    // Host kann nicht buzzern!
    if (socket.id === game.host.id) {
      return;
    }
    
    // Prüfe ob Spieler bereits geantwortet hat
    if (game.buzzedPlayers.includes(socket.id)) {
      socket.emit('error', 'Du hast bereits geantwortet!');
      return;
    }
    
    if (game.buzzerTimer) clearTimeout(game.buzzerTimer);
    
    game.buzzedPlayers.push(socket.id);
    game.answeringPlayer = game.players.find(p => p.id === socket.id);
    
    io.to(roomCode).emit('player-buzzed', {
      playerId: socket.id,
      playerName: game.answeringPlayer.name
    });
  });

  socket.on('disconnect', () => {
    const roomCode = playerSockets.get(socket.id);
    if (roomCode) {
      const game = games.get(roomCode);
      if (game) {
        if (socket.id === game.host.id) {
          // Host disconnected, end game
          io.to(roomCode).emit('host-disconnected');
          games.delete(roomCode);
        } else {
          game.players = game.players.filter(p => p.id !== socket.id);
          
          if (game.players.length === 0) {
            games.delete(roomCode);
          } else {
            io.to(roomCode).emit('player-list-update', {
              players: game.players,
              host: game.host,
              settings: game.settings
            });
          }
        }
      }
      playerSockets.delete(socket.id);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
