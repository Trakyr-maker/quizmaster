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

// Quiz-Fragen mit Schwierigkeitsgraden und Typen
const QUESTIONS = {
  allgemeinwissen: {
    100: [
      { q: 'Wie viele Kontinente gibt es?', a: '7', type: 'text' },
      { q: 'Hauptstadt von Deutschland?', a: 'Berlin', type: 'text' },
      { q: 'Wie viele Beine hat eine Spinne?', a: '8', type: 'text' },
      { q: 'Rechne: 12 + 8', a: '20', type: 'math' },
      { q: 'Rechne: 5 × 4', a: '20', type: 'math' },
      { q: 'Finde den Fehler: Es gibt siben Tage in der Woche', a: 'siben → sieben', type: 'error' }
    ],
    200: [
      { q: 'Hauptstadt von Frankreich?', a: 'Paris', type: 'text' },
      { q: 'Wie viele Bundesländer hat Deutschland?', a: '16', type: 'text' },
      { q: 'Rechne: 15 × 6 - 12', a: '78', type: 'math' },
      { q: 'Rechne: 144 ÷ 12 + 5', a: '17', type: 'math' },
      { q: 'Finde den Fehler: Paris ist die Hauptstadt von Italien', a: 'Italien → Frankreich', type: 'error' }
    ],
    300: [
      { q: 'Größter Planet im Sonnensystem?', a: 'Jupiter', type: 'text' },
      { q: 'Wie heißt der längste Fluss der Welt?', a: 'Nil', type: 'text' },
      { q: 'Rechne: 20% von 150', a: '30', type: 'math' },
      { q: 'Rechne: 3/4 von 80', a: '60', type: 'math' },
      { q: 'Finde den Fehler: Der 2. Weltkrieg endete 1944', a: '1944 → 1945', type: 'error' }
    ],
    400: [
      { q: 'Wie heißt der kleinste Knochen im menschlichen Körper?', a: 'Steigbügel', type: 'text' },
      { q: 'Rechne: 15² - 50', a: '175', type: 'math' },
      { q: 'Rechne: 30% von 240 + 18', a: '90', type: 'math' },
      { q: 'Finde den Fehler: Die Titanic sank im Jahr 1922', a: '1922 → 1912', type: 'error' }
    ],
    500: [
      { q: 'In welchem Jahr fiel die Berliner Mauer?', a: '1989', type: 'text' },
      { q: 'Rechne: √144 + 5³', a: '137', type: 'math' },
      { q: 'Rechne: 40% von 350 - 15% von 200', a: '110', type: 'math' },
      { q: 'Finde den Fehler: Marie Curie entdeckte das Penicillin', a: 'Marie Curie → Alexander Fleming', type: 'error' }
    ]
  },
  wissenschaft: {
    100: [
      { q: 'Chemisches Symbol für Wasser?', a: 'H2O', type: 'text' },
      { q: 'Wie viele Planeten hat unser Sonnensystem?', a: '8', type: 'text' },
      { q: 'Rechne: 10 + 15', a: '25', type: 'math' },
      { q: 'Rechne: 6 × 7', a: '42', type: 'math' },
      { q: 'Finde den Fehler: Die Erde ist ein Dreieck', a: 'Dreieck → Kugel', type: 'error' }
    ],
    200: [
      { q: 'Chemisches Symbol für Gold?', a: 'Au', type: 'text' },
      { q: 'Wie viele Zähne hat ein Erwachsener?', a: '32', type: 'text' },
      { q: 'Rechne: 18 × 5 - 10', a: '80', type: 'math' },
      { q: 'Rechne: 200 ÷ 8 + 15', a: '40', type: 'math' },
      { q: 'Finde den Fehler: Die Sonne dreht sich um die Erde', a: 'Sonne um Erde → Erde um Sonne', type: 'error' }
    ],
    300: [
      { q: 'Lichtgeschwindigkeit in km/s (gerundet)?', a: '300000', type: 'text' },
      { q: 'Rechne: 25% von 200', a: '50', type: 'math' },
      { q: 'Rechne: 2/3 von 90', a: '60', type: 'math' },
      { q: 'Finde den Fehler: Wasser gefriert bei 10 Grad Celsius', a: '10 → 0', type: 'error' }
    ],
    400: [
      { q: 'Wer entwickelte die Relativitätstheorie?', a: 'Einstein', type: 'text' },
      { q: 'Rechne: 12² + 20', a: '164', type: 'math' },
      { q: 'Rechne: 35% von 200 - 15', a: '55', type: 'math' },
      { q: 'Finde den Fehler: DNA steht für Desoxyribonukleinsäule', a: 'Säule → Säure', type: 'error' }
    ],
    500: [
      { q: 'Wie heißt das kleinste Teilchen eines Elements?', a: 'Atom', type: 'text' },
      { q: 'Rechne: √169 + 7³', a: '356', type: 'math' },
      { q: 'Rechne: 45% von 400 - 20% von 150', a: '150', type: 'math' },
      { q: 'Finde den Fehler: Die Photosynthese findet in den Mitochondrien statt', a: 'Mitochondrien → Chloroplasten', type: 'error' }
    ]
  },
  geschichte: {
    100: [
      { q: 'In welchem Jahr endete der 2. Weltkrieg?', a: '1945', type: 'text' },
      { q: 'Wer war der erste Kanzler der BRD?', a: 'Adenauer', type: 'text' },
      { q: 'Rechne: 20 - 7', a: '13', type: 'math' },
      { q: 'Finde den Fehler: Kolumbus entdeckte Amerika im Jahr 1500', a: '1500 → 1492', type: 'error' }
    ],
    200: [
      { q: 'Erster Mensch auf dem Mond?', a: 'Armstrong', type: 'text' },
      { q: 'In welchem Jahr fiel die Berliner Mauer?', a: '1989', type: 'text' },
      { q: 'Rechne: 25 × 4 + 10', a: '110', type: 'math' },
      { q: 'Finde den Fehler: Der 1. Weltkrieg begann 1918', a: '1918 → 1914', type: 'error' }
    ],
    300: [
      { q: 'Wann wurde die USA gegründet?', a: '1776', type: 'text' },
      { q: 'Rechne: 15% von 300', a: '45', type: 'math' },
      { q: 'Rechne: 3/5 von 100', a: '60', type: 'math' },
      { q: 'Finde den Fehler: Napoleon wurde 1821 auf Elba geboren', a: 'geboren auf Elba → gestorben auf St. Helena', type: 'error' }
    ],
    400: [
      { q: 'Wer entdeckte Amerika?', a: 'Kolumbus', type: 'text' },
      { q: 'Rechne: 18² - 100', a: '224', type: 'math' },
      { q: 'Rechne: 40% von 150 + 25', a: '85', type: 'math' },
      { q: 'Finde den Fehler: Die französische Revolution begann 1889', a: '1889 → 1789', type: 'error' }
    ],
    500: [
      { q: 'Römischer Kaiser bei Jesu Geburt?', a: 'Augustus', type: 'text' },
      { q: 'Rechne: √225 + 8³', a: '527', type: 'math' },
      { q: 'Rechne: 50% von 300 - 25% von 80', a: '130', type: 'math' },
      { q: 'Finde den Fehler: Julius Caesar wurde von seinem Sohn Brutus ermordet', a: 'Sohn → Adoptivsohn/Vertrauter', type: 'error' }
    ]
  },
  sport: {
    100: [
      { q: 'Wie viele Spieler in einem Fußballteam?', a: '11', type: 'text' },
      { q: 'Wie viele Ringe hat das olympische Symbol?', a: '5', type: 'text' },
      { q: 'Rechne: 8 + 9', a: '17', type: 'math' },
      { q: 'Finde den Fehler: Ein Fußballspiel dauert 60 Minuten', a: '60 → 90', type: 'error' }
    ],
    200: [
      { q: 'Höchster Berg der Welt?', a: 'Mount Everest', type: 'text' },
      { q: 'Welches Land gewann die WM 2014?', a: 'Deutschland', type: 'text' },
      { q: 'Rechne: 12 × 8 - 15', a: '81', type: 'math' },
      { q: 'Finde den Fehler: Ein Marathon ist 50 km lang', a: '50 → 42.195', type: 'error' }
    ],
    300: [
      { q: 'Wie viele Grand Slam Turniere gibt es im Tennis?', a: '4', type: 'text' },
      { q: 'Rechne: 30% von 120', a: '36', type: 'math' },
      { q: 'Rechne: 4/5 von 75', a: '60', type: 'math' },
      { q: 'Finde den Fehler: Usain Bolt läuft 100m in 8 Sekunden', a: '8 → 9.58', type: 'error' }
    ],
    400: [
      { q: 'Schnellster Mensch der Welt?', a: 'Usain Bolt', type: 'text' },
      { q: 'Rechne: 20² - 75', a: '325', type: 'math' },
      { q: 'Rechne: 45% von 200 + 30', a: '120', type: 'math' },
      { q: 'Finde den Fehler: Michael Phelps gewann 15 olympische Goldmedaillen', a: '15 → 23', type: 'error' }
    ],
    500: [
      { q: 'In welchem Jahr fand die erste Fußball-WM statt?', a: '1930', type: 'text' },
      { q: 'Rechne: √196 + 6³', a: '230', type: 'math' },
      { q: 'Rechne: 60% von 250 - 30% von 100', a: '120', type: 'math' },
      { q: 'Finde den Fehler: Roger Federer gewann 25 Grand Slam Titel', a: '25 → 20', type: 'error' }
    ]
  },
  geographie: {
    100: [
      { q: 'Größtes Land der Welt?', a: 'Russland', type: 'text' },
      { q: 'Auf welchem Kontinent liegt Ägypten?', a: 'Afrika', type: 'text' },
      { q: 'Rechne: 15 + 12', a: '27', type: 'math' },
      { q: 'Finde den Fehler: Berlin ist die Hauptstadt von Österreich', a: 'Berlin/Österreich → Wien/Österreich', type: 'error' }
    ],
    200: [
      { q: 'Hauptstadt von Japan?', a: 'Tokio', type: 'text' },
      { q: 'Wie viele Ozeane gibt es?', a: '5', type: 'text' },
      { q: 'Rechne: 14 × 7 + 8', a: '106', type: 'math' },
      { q: 'Finde den Fehler: Der Nil fließt durch Asien', a: 'Asien → Afrika', type: 'error' }
    ],
    300: [
      { q: 'Kleinster Kontinent?', a: 'Australien', type: 'text' },
      { q: 'Rechne: 35% von 140', a: '49', type: 'math' },
      { q: 'Rechne: 5/8 von 80', a: '50', type: 'math' },
      { q: 'Finde den Fehler: Die Sahara ist die größte Wüste der Welt', a: 'Sahara → Antarktis', type: 'error' }
    ],
    400: [
      { q: 'Längste Wüste der Welt (heiß)?', a: 'Sahara', type: 'text' },
      { q: 'Rechne: 25² - 150', a: '475', type: 'math' },
      { q: 'Rechne: 55% von 180 - 20', a: '79', type: 'math' },
      { q: 'Finde den Fehler: Der Mount Everest liegt in Nepal und China', a: 'China → Tibet (oder kein Fehler)', type: 'error' }
    ],
    500: [
      { q: 'Tiefster Punkt der Erde?', a: 'Marianengraben', type: 'text' },
      { q: 'Rechne: √289 + 9³', a: '746', type: 'math' },
      { q: 'Rechne: 70% von 400 - 40% von 150', a: '220', type: 'math' },
      { q: 'Finde den Fehler: Der Amazonas ist der längste Fluss der Welt', a: 'Amazonas → Nil', type: 'error' }
    ]
  }
};

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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
      buzzerTime: 10,
      customQuestionsLimit: 5,
      customBonusPoints: 50
    };
    this.customQuestions = [];
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
    this.board = null;
    this.buzzerTimer = null;
  }

  initializeBoard() {
    const board = {};
    const categories = Object.keys(QUESTIONS);
    
    // Standard-Kategorien
    categories.forEach(category => {
      board[category] = [];
      [100, 200, 300, 400, 500].forEach(points => {
        const questionsForPoints = QUESTIONS[category][points];
        const randomQuestion = questionsForPoints[Math.floor(Math.random() * questionsForPoints.length)];
        board[category].push({
          ...randomQuestion,
          points,
          completed: false
        });
      });
    });
    
    // Custom-Fragen einmischen
    if (this.customQuestions.length > 0) {
      const hasCustomCategory = this.customQuestions.some(q => q.category === 'custom');
      
      if (hasCustomCategory) {
        // Erstelle Custom-Kategorie
        board['custom'] = [100, 200, 300, 400, 500].map(points => ({
          q: '',
          a: '',
          type: 'text',
          points,
          completed: true // Leere Slots als completed
        }));
      }
      
      this.customQuestions.forEach(customQ => {
        if (customQ.category === 'custom') {
          // Custom Kategorie: Frage an richtiger Stelle einfügen
          const index = [100, 200, 300, 400, 500].indexOf(customQ.points);
          board['custom'][index] = {
            ...customQ,
            completed: false,
            isCustom: true,
            bonusPoints: this.settings.customBonusPoints
          };
        } else {
          // Bestehende Kategorie: Ersetze Frage
          const index = [100, 200, 300, 400, 500].indexOf(customQ.points);
          board[customQ.category][index] = {
            ...customQ,
            completed: false,
            isCustom: true,
            bonusPoints: 0 // Kein Bonus für bestehende Kategorien
          };
        }
      });
    }
    
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
      settings: game.settings,
      customQuestions: game.customQuestions
    });
    
    console.log(`${playerName} ist Spiel ${roomCode} beigetreten`);
  });

  socket.on('update-settings', ({ roomCode, settings }) => {
    const game = games.get(roomCode);
    if (!game || socket.id !== game.host.id) return;
    
    game.settings = { ...game.settings, ...settings };
    
    io.to(roomCode).emit('settings-updated', game.settings);
  });

  socket.on('add-custom-question', ({ roomCode, question }) => {
    const game = games.get(roomCode);
    if (!game || socket.id !== game.host.id) return;
    
    if (game.customQuestions.length >= game.settings.customQuestionsLimit) {
      socket.emit('error', `Maximum ${game.settings.customQuestionsLimit} Custom-Fragen erreicht`);
      return;
    }
    
    game.customQuestions.push({
      id: Date.now().toString(),
      ...question
    });
    
    io.to(roomCode).emit('custom-questions-updated', game.customQuestions);
  });

  socket.on('remove-custom-question', ({ roomCode, questionId }) => {
    const game = games.get(roomCode);
    if (!game || socket.id !== game.host.id) return;
    
    game.customQuestions = game.customQuestions.filter(q => q.id !== questionId);
    
    io.to(roomCode).emit('custom-questions-updated', game.customQuestions);
  });

  socket.on('start-game', (roomCode) => {
    const game = games.get(roomCode);
    if (!game || socket.id !== game.host.id) return;
    
    game.state = 'playing';
    game.board = game.initializeBoard();
    
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
      bonusPoints: question.bonusPoints || 0,
      type: question.type,
      category,
      phase: 'initial',
      answeringPlayer: game.answeringPlayer,
      correctAnswer: question.a
    });
  });

  socket.on('submit-answer', ({ roomCode, answer }) => {
    const game = games.get(roomCode);
    if (!game || !game.currentQuestion) return;
    
    const playerName = game.players.find(p => p.id === socket.id)?.name || 'Spieler';
    const correctAnswer = game.currentQuestion.a.toLowerCase().trim();
    const givenAnswer = answer.toLowerCase().trim();
    
    if (givenAnswer === correctAnswer) {
      const points = game.currentQuestion.points + (game.currentQuestion.bonusPoints || 0);
      
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
      
      game.nextPlayer();
      
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
      
      return;
    }
    
    game.pendingAnswer = {
      playerId: socket.id,
      playerName: playerName,
      answer: answer,
      isTeam: game.settings.teamMode && game.questionPhase === 'team-answer'
    };
    
    io.to(game.host.id).emit('answer-submitted', {
      playerName: playerName,
      answer: answer,
      correctAnswer: game.currentQuestion.a,
      points: game.currentQuestion.points + (game.currentQuestion.bonusPoints || 0)
    });
    
    io.to(roomCode).emit('awaiting-host-decision', {
      playerName: playerName
    });
  });

  socket.on('host-decision', ({ roomCode, isCorrect }) => {
    const game = games.get(roomCode);
    if (!game || socket.id !== game.host.id || !game.pendingAnswer) return;
    
    const points = game.currentQuestion.points + (game.currentQuestion.bonusPoints || 0);
    const halfPoints = Math.floor(points / 2);
    
    game.board[game.currentQuestion.category][game.currentQuestion.index].completed = true;
    
    if (isCorrect) {
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
        board: game.board
      });
      
      game.nextPlayer();
      
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
      if (game.settings.teamMode) {
        const team = game.getPlayerTeam(game.pendingAnswer.playerId);
        game.scores[team.id] -= halfPoints;
        
        const otherTeam = game.teams.find(t => t.id !== team.id);
        game.currentTeam = otherTeam;
        
        io.to(roomCode).emit('answer-result', {
          correct: false,
          playerName: game.pendingAnswer.playerName,
          points: -halfPoints,
          scores: game.scores,
          phase: 'team-opportunity',
          nextTeam: otherTeam,
          board: game.board
        });
      } else {
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
        
        if (game.buzzerTimer) clearTimeout(game.buzzerTimer);
        game.buzzerTimer = setTimeout(() => {
          game.nextPlayer();
          
          io.to(roomCode).emit('buzzer-timeout', {
            correctAnswer: game.currentQuestion.a,
            nextPlayer: game.currentPlayer,
            nextTeam: game.currentTeam,
            board: game.board
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
    
    if (socket.id === game.host.id) {
      return;
    }
    
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
              settings: game.settings,
              customQuestions: game.customQuestions
            });
          }
        }
      }
      playerSockets.delete(socket.id);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🧠 BrainBuzz Server läuft auf Port ${PORT}`);
});
