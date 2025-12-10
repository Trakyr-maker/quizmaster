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

// 7 Kategorien verfügbar - pro Spiel werden 5 zufällig gewählt!
const QUESTIONS = {
  allgemeinwissen: {
    100: [
      { q: 'Wie viele Kontinente gibt es?', a: '7' },
      { q: 'Hauptstadt von Deutschland?', a: 'Berlin' },
      { q: 'Wie viele Beine hat eine Spinne?', a: '8' },
      { q: 'Wie viele Tage hat ein Jahr?', a: '365' },
      { q: 'Wie heißt der größte Ozean?', a: 'Pazifik' }
    ],
    200: [
      { q: 'Hauptstadt von Frankreich?', a: 'Paris' },
      { q: 'Wie viele Bundesländer hat Deutschland?', a: '16' },
      { q: 'Welche Farbe hat ein Smaragd?', a: 'Grün' },
      { q: 'Wie heißt der höchste Berg Europas?', a: 'Mont Blanc' }
    ],
    300: [
      { q: 'Größter Planet im Sonnensystem?', a: 'Jupiter' },
      { q: 'Wie heißt der längste Fluss der Welt?', a: 'Nil' },
      { q: 'Wie viele Zähne hat ein Erwachsener?', a: '32' },
      { q: 'Wer malte die Mona Lisa?', a: 'Da Vinci' }
    ],
    400: [
      { q: 'Wie heißt der kleinste Knochen im menschlichen Körper?', a: 'Steigbügel' },
      { q: 'Welches Gas macht den größten Teil der Atmosphäre aus?', a: 'Stickstoff' },
      { q: 'Wie viele Herzen hat ein Oktopus?', a: '3' }
    ],
    500: [
      { q: 'In welchem Jahr fiel die Berliner Mauer?', a: '1989' },
      { q: 'Wie heißt die Hauptstadt von Australien?', a: 'Canberra' },
      { q: 'Wer erfand das Telefon?', a: 'Bell' }
    ]
  },
  wissenschaft: {
    100: [
      { q: 'Chemisches Symbol für Wasser?', a: 'H2O' },
      { q: 'Wie viele Planeten hat unser Sonnensystem?', a: '8' },
      { q: 'Bei welcher Temperatur gefriert Wasser?', a: '0' }
    ],
    200: [
      { q: 'Chemisches Symbol für Gold?', a: 'Au' },
      { q: 'Wie viele Chromosomen hat der Mensch?', a: '46' },
      { q: 'Was ist die Einheit für elektrischen Widerstand?', a: 'Ohm' }
    ],
    300: [
      { q: 'Lichtgeschwindigkeit in km/s (gerundet)?', a: '300000' },
      { q: 'Wie heißt der rote Planet?', a: 'Mars' },
      { q: 'Welches Gas atmen Pflanzen aus?', a: 'Sauerstoff' }
    ],
    400: [
      { q: 'Wer entwickelte die Relativitätstheorie?', a: 'Einstein' },
      { q: 'Wie nennt man eine Baby-Katze?', a: 'Kitten' },
      { q: 'Welches Organ produziert Insulin?', a: 'Bauchspeicheldrüse' }
    ],
    500: [
      { q: 'Wie heißt das kleinste Teilchen eines Elements?', a: 'Atom' },
      { q: 'Wer entdeckte das Penicillin?', a: 'Fleming' },
      { q: 'Wie viele Knochen hat ein Baby?', a: '300' }
    ]
  },
  geschichte: {
    100: [
      { q: 'In welchem Jahr endete der 2. Weltkrieg?', a: '1945' },
      { q: 'Wer war der erste Kanzler der BRD?', a: 'Adenauer' }
    ],
    200: [
      { q: 'Erster Mensch auf dem Mond?', a: 'Armstrong' },
      { q: 'In welchem Jahr fiel die Berliner Mauer?', a: '1989' }
    ],
    300: [
      { q: 'Wann wurde die USA gegründet?', a: '1776' },
      { q: 'Wer war der erste Präsident der USA?', a: 'Washington' }
    ],
    400: [
      { q: 'Wer entdeckte Amerika?', a: 'Kolumbus' },
      { q: 'In welchem Jahr begann der 1. Weltkrieg?', a: '1914' }
    ],
    500: [
      { q: 'Römischer Kaiser bei Jesu Geburt?', a: 'Augustus' },
      { q: 'Wann fand die Französische Revolution statt?', a: '1789' }
    ]
  },
  sport: {
    100: [
      { q: 'Wie viele Spieler in einem Fußballteam?', a: '11' },
      { q: 'Wie viele Ringe hat das olympische Symbol?', a: '5' }
    ],
    200: [
      { q: 'Höchster Berg der Welt?', a: 'Mount Everest' },
      { q: 'Welches Land gewann die WM 2014?', a: 'Deutschland' }
    ],
    300: [
      { q: 'Wie viele Grand Slam Turniere gibt es im Tennis?', a: '4' },
      { q: 'Wie lang ist ein Marathon?', a: '42.195' }
    ],
    400: [
      { q: 'Schnellster Mensch der Welt?', a: 'Usain Bolt' },
      { q: 'Wie viele Spieler sind auf dem Volleyballfeld?', a: '6' }
    ],
    500: [
      { q: 'In welchem Jahr fand die erste Fußball-WM statt?', a: '1930' },
      { q: 'Wie viele Goldmedaillen gewann Michael Phelps?', a: '23' }
    ]
  },
  geographie: {
    100: [
      { q: 'Größtes Land der Welt?', a: 'Russland' },
      { q: 'Auf welchem Kontinent liegt Ägypten?', a: 'Afrika' }
    ],
    200: [
      { q: 'Hauptstadt von Japan?', a: 'Tokio' },
      { q: 'Wie viele Ozeane gibt es?', a: '5' }
    ],
    300: [
      { q: 'Kleinster Kontinent?', a: 'Australien' },
      { q: 'In welchem Land liegt die Sahara?', a: 'Afrika' }
    ],
    400: [
      { q: 'Längste Wüste der Welt (heiß)?', a: 'Sahara' },
      { q: 'Welcher Fluss fließt durch London?', a: 'Themse' }
    ],
    500: [
      { q: 'Tiefster Punkt der Erde?', a: 'Marianengraben' },
      { q: 'Wie viele Länder grenzen an Deutschland?', a: '9' }
    ]
  },
  mathe: {
    100: [
      { q: 'Rechne: 12 + 8', a: '20' },
      { q: 'Rechne: 5 × 4', a: '20' },
      { q: 'Rechne: 100 - 35', a: '65' },
      { q: 'Rechne: 8 + 9', a: '17' },
      { q: 'Rechne: 6 × 7', a: '42' }
    ],
    200: [
      { q: 'Rechne: 15 × 6 - 12', a: '78' },
      { q: 'Rechne: 144 ÷ 12 + 5', a: '17' },
      { q: 'Rechne: 18 × 5 - 10', a: '80' },
      { q: 'Rechne: 200 ÷ 8 + 15', a: '40' },
      { q: 'Rechne: 25 × 4 + 10', a: '110' }
    ],
    300: [
      { q: 'Rechne: 20% von 150', a: '30' },
      { q: 'Rechne: 3/4 von 80', a: '60' },
      { q: 'Rechne: 25% von 200', a: '50' },
      { q: 'Rechne: 2/3 von 90', a: '60' },
      { q: 'Rechne: 30% von 120', a: '36' }
    ],
    400: [
      { q: 'Rechne: 15² - 50', a: '175' },
      { q: 'Rechne: 30% von 240 + 18', a: '90' },
      { q: 'Rechne: 12² + 20', a: '164' },
      { q: 'Rechne: 35% von 200 - 15', a: '55' },
      { q: 'Rechne: 20² - 75', a: '325' }
    ],
    500: [
      { q: 'Rechne: √144 + 5³', a: '137' },
      { q: 'Rechne: 40% von 350 - 15% von 200', a: '110' },
      { q: 'Rechne: √169 + 7³', a: '356' },
      { q: 'Rechne: 45% von 400 - 20% von 150', a: '150' },
      { q: 'Rechne: √196 + 6³', a: '230' }
    ]
  },
  fehlersuche: {
    // Einfache Fehler (offensichtlich - Zahlen/Fakten)
    100: [
      { q: 'Ein Fußballspiel dauert 60 Minuten', a: '90', errorType: 'obvious', errorHint: '60 Minuten' },
      { q: 'Es gibt 6 Kontinente', a: '7', errorType: 'obvious', errorHint: '6 Kontinente' },
      { q: 'Ein Jahr hat 360 Tage', a: '365', errorType: 'obvious', errorHint: '360 Tage' }
    ],
    200: [
      { q: 'Paris ist die Hauptstadt von Spanien', a: 'Frankreich', errorType: 'obvious', errorHint: 'Spanien' },
      { q: 'Der 1. Weltkrieg begann 1918', a: '1914', errorType: 'obvious', errorHint: '1918' },
      { q: 'Deutschland hat 10 Bundesländer', a: '16', errorType: 'obvious', errorHint: '10 Bundesländer' }
    ],
    300: [
      { q: 'Der 2. Weltkrieg endete 1944', a: '1945', errorType: 'obvious', errorHint: '1944' },
      { q: 'Wasser gefriert bei 10 Grad Celsius', a: '0', errorType: 'obvious', errorHint: '10 Grad' },
      { q: 'Die Sahara liegt in Asien', a: 'Afrika', errorType: 'obvious', errorHint: 'Asien' }
    ],
    // Komplexe Fehler (nicht offensichtlich - Richtig/Falsch)
    400: [
      { q: 'Die Titanic sank im Jahr 1922 - Richtig oder Falsch?', a: 'Falsch', correctAnswer: '1912', errorType: 'complex', bonusPoints: 100 },
      { q: 'Die französische Revolution begann 1889 - Richtig oder Falsch?', a: 'Falsch', correctAnswer: '1789', errorType: 'complex', bonusPoints: 100 },
      { q: 'Michael Phelps gewann 15 olympische Goldmedaillen - Richtig oder Falsch?', a: 'Falsch', correctAnswer: '23', errorType: 'complex', bonusPoints: 100 }
    ],
    500: [
      { q: 'Marie Curie entdeckte das Penicillin - Richtig oder Falsch?', a: 'Falsch', correctAnswer: 'Alexander Fleming', errorType: 'complex', bonusPoints: 150 },
      { q: 'Die Photosynthese findet in den Mitochondrien statt - Richtig oder Falsch?', a: 'Falsch', correctAnswer: 'Chloroplasten', errorType: 'complex', bonusPoints: 150 },
      { q: 'Der Amazonas ist der längste Fluss der Welt - Richtig oder Falsch?', a: 'Falsch', correctAnswer: 'Nil', errorType: 'complex', bonusPoints: 150 }
    ]
  }
};

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// NEU: Wähle 5 zufällige Kategorien aus allen verfügbaren
function selectRandomCategories() {
  const allCategories = Object.keys(QUESTIONS);
  const shuffled = allCategories.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
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
      buzzerTime: 5,
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
    this.questionTimer = null;
    this.selectedCategories = []; // NEU: Die 5 gewählten Kategorien
    this.awaitingBonusAnswer = false; // NEU: Für Fehlersuche-Bonus
  }

  initializeBoard() {
    // Wähle 5 zufällige Kategorien!
    this.selectedCategories = selectRandomCategories();
    
    const board = {};
    
    this.selectedCategories.forEach(category => {
      board[category] = [];
      [100, 200, 300, 400, 500].forEach(points => {
        const questionsForPoints = QUESTIONS[category][points];
        const randomQuestion = questionsForPoints[Math.floor(Math.random() * questionsForPoints.length)];
        board[category].push({
          ...randomQuestion,
          points,
          completed: false,
          type: category === 'mathe' ? 'math' : category === 'fehlersuche' ? 'error' : 'text'
        });
      });
    });
    
    if (this.customQuestions.length > 0) {
      const hasCustomCategory = this.customQuestions.some(q => q.category === 'custom');
      
      if (hasCustomCategory) {
        board['custom'] = [100, 200, 300, 400, 500].map(points => ({
          q: '',
          a: '',
          type: 'text',
          points,
          completed: true
        }));
      }
      
      this.customQuestions.forEach(customQ => {
        if (customQ.category === 'custom') {
          const index = [100, 200, 300, 400, 500].indexOf(customQ.points);
          board['custom'][index] = {
            ...customQ,
            points: this.settings.customBonusPoints,
            completed: false,
            isCustom: true
          };
        } else {
          const index = [100, 200, 300, 400, 500].indexOf(customQ.points);
          if (board[customQ.category]) {
            board[customQ.category][index] = {
              ...customQ,
              completed: false,
              isCustom: true
            };
          }
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
    game.awaitingBonusAnswer = false;
    
    const timeLimit = game.settings.questionTime;
    
    io.to(roomCode).emit('question-selected', {
      question: question.q,
      points: question.points,
      type: question.type,
      category,
      phase: 'initial',
      answeringPlayer: game.answeringPlayer,
      correctAnswer: question.a,
      timeLimit: timeLimit,
      errorType: question.errorType,
      errorHint: question.errorHint
    });
    
    if (game.questionTimer) clearTimeout(game.questionTimer);
    game.questionTimer = setTimeout(() => {
      handleTimeout(game, roomCode);
    }, timeLimit * 1000);
  });

  function handleTimeout(game, roomCode) {
    const points = game.currentQuestion.points;
    const halfPoints = Math.floor(points / 2);
    
    game.board[game.currentQuestion.category][game.currentQuestion.index].completed = true;
    
    if (game.settings.teamMode) {
      const team = game.answeringPlayer ? game.getPlayerTeam(game.answeringPlayer.id) : game.currentTeam;
      game.scores[team.id] -= halfPoints;
    } else {
      game.scores[game.currentPlayer.id] -= halfPoints;
      game.buzzedPlayers.push(game.currentPlayer.id);
    }
    
    if (!game.settings.teamMode) {
      game.questionPhase = 'buzzer';
      
      io.to(roomCode).emit('answer-result', {
        correct: false,
        playerName: game.currentPlayer.name,
        points: -halfPoints,
        scores: game.scores,
        phase: 'buzzer',
        buzzerTime: game.settings.buzzerTime,
        reason: 'timeout'
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
    } else {
      game.nextPlayer();
      
      io.to(roomCode).emit('question-timeout', {
        correctAnswer: game.currentQuestion.a,
        nextPlayer: game.currentPlayer,
        nextTeam: game.currentTeam,
        board: game.board,
        scores: game.scores
      });
      
      game.currentQuestion = null;
    }
  }

  socket.on('submit-answer', ({ roomCode, answer }) => {
    const game = games.get(roomCode);
    if (!game || !game.currentQuestion) return;
    
    if (game.questionTimer) clearTimeout(game.questionTimer);
    
    const playerName = game.players.find(p => p.id === socket.id)?.name || 'Spieler';
    const correctAnswer = game.currentQuestion.a.toLowerCase().trim();
    const givenAnswer = answer.toLowerCase().trim();
    
    // Auto-Correct für exakte Übereinstimmungen (außer Fehlersuche-Complex)
    if (givenAnswer === correctAnswer && game.currentQuestion.errorType !== 'complex') {
      const points = game.currentQuestion.points;
      
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
      points: game.currentQuestion.points,
      errorType: game.currentQuestion.errorType,
      correctAnswerDetail: game.currentQuestion.correctAnswer
    });
    
    io.to(roomCode).emit('awaiting-host-decision', {
      playerName: playerName
    });
  });

  // NEU: Bonus-Antwort für Fehlersuche-Complex
  socket.on('submit-bonus-answer', ({ roomCode, bonusAnswer }) => {
    const game = games.get(roomCode);
    if (!game || !game.currentQuestion || !game.awaitingBonusAnswer) return;
    
    game.pendingAnswer.bonusAnswer = bonusAnswer;
    
    io.to(game.host.id).emit('bonus-answer-submitted', {
      playerName: game.pendingAnswer.playerName,
      bonusAnswer: bonusAnswer,
      correctAnswer: game.currentQuestion.correctAnswer,
      bonusPoints: game.currentQuestion.bonusPoints
    });
  });

  // NEU: Host vergibt Bonus-Punkte
  socket.on('award-bonus', ({ roomCode, bonusPoints }) => {
    const game = games.get(roomCode);
    if (!game || socket.id !== game.host.id || !game.pendingAnswer) return;
    
    if (game.settings.teamMode) {
      const team = game.getPlayerTeam(game.pendingAnswer.playerId);
      game.scores[team.id] += bonusPoints;
    } else {
      game.scores[game.pendingAnswer.playerId] += bonusPoints;
    }
    
    io.to(roomCode).emit('bonus-awarded', {
      playerName: game.pendingAnswer.playerName,
      bonusPoints: bonusPoints,
      scores: game.scores
    });
  });

  socket.on('host-decision', ({ roomCode, isCorrect }) => {
    const game = games.get(roomCode);
    if (!game || socket.id !== game.host.id || !game.pendingAnswer) return;
    
    const points = game.currentQuestion.points;
    const halfPoints = Math.floor(points / 2);
    
    game.board[game.currentQuestion.category][game.currentQuestion.index].completed = true;
    
    if (isCorrect) {
      if (game.settings.teamMode) {
        const team = game.getPlayerTeam(game.pendingAnswer.playerId);
        game.scores[team.id] += points;
      } else {
        game.scores[game.pendingAnswer.playerId] += points;
      }
      
      // Bei Fehlersuche-Complex: Frage nach Bonus-Antwort
      if (game.currentQuestion.errorType === 'complex') {
        game.awaitingBonusAnswer = true;
        
        io.to(roomCode).emit('answer-result', {
          correct: true,
          playerId: game.pendingAnswer.playerId,  // WICHTIG: Damit Client weiß, wer antworten soll!
          playerName: game.pendingAnswer.playerName,
          points: points,
          scores: game.scores,
          board: game.board,
          awaitBonus: true,
          bonusQuestion: `Was ist die richtige Antwort?`,
          correctAnswer: game.currentQuestion.correctAnswer,
          maxBonusPoints: game.currentQuestion.bonusPoints
        });
        
        return; // Warte auf Bonus-Antwort
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
      playerName: game.answeringPlayer.name,
      buzzerTimeLimit: 5
    });
    
    if (game.questionTimer) clearTimeout(game.questionTimer);
    game.questionTimer = setTimeout(() => {
      const halfPoints = Math.floor(game.currentQuestion.points / 2);
      game.scores[socket.id] -= halfPoints;
      
      io.to(roomCode).emit('buzzer-answer-timeout', {
        playerName: game.answeringPlayer.name,
        points: -halfPoints,
        scores: game.scores
      });
      
      game.questionPhase = 'buzzer';
      
      io.to(roomCode).emit('answer-result', {
        correct: false,
        playerName: game.answeringPlayer.name,
        points: -halfPoints,
        scores: game.scores,
        phase: 'buzzer',
        buzzerTime: game.settings.buzzerTime,
        reason: 'buzzer-timeout'
      });
      
      if (game.buzzerTimer) clearTimeout(game.buzzerTimer);
      game.buzzerTimer = setTimeout(() => {
        game.board[game.currentQuestion.category][game.currentQuestion.index].completed = true;
        game.nextPlayer();
        
        io.to(roomCode).emit('buzzer-timeout', {
          correctAnswer: game.currentQuestion.a,
          nextPlayer: game.currentPlayer,
          nextTeam: game.currentTeam,
          board: game.board
        });
        
        game.currentQuestion = null;
      }, game.settings.buzzerTime * 1000);
    }, 5000);
  });

  socket.on('skip-bonus', ({ roomCode }) => {
    const game = games.get(roomCode);
    if (!game || !game.awaitingBonusAnswer) return;
    
    game.awaitingBonusAnswer = false;
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
      game.currentQuestion = null;
      game.pendingAnswer = null;
      io.to(roomCode).emit('question-closed', {
        nextPlayer: game.currentPlayer,
        nextTeam: game.currentTeam
      });
    }
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
