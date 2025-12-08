let socket;
let roomCode;
let playerId;
let gameData;
let currentPlayer;
let myTurn = false;

function initSocket() {
    socket = io();
    
    roomCode = sessionStorage.getItem('roomCode');
    playerId = sessionStorage.getItem('playerId');
    const gameDataStr = sessionStorage.getItem('gameData');
    
    if (!roomCode || !playerId || !gameDataStr) {
        window.location.href = 'index.html';
        return;
    }
    
    gameData = JSON.parse(gameDataStr);
    currentPlayer = gameData.currentPlayer;
    myTurn = currentPlayer.id === playerId;
    
    initializeBoard(gameData.board);
    updateScoreboard(gameData.scores);
    updateCurrentPlayer(currentPlayer);
    
    socket.on('question-selected', (data) => {
        showQuestion(data);
    });
    
    socket.on('player-buzzed', (data) => {
        if (data.player.id === playerId) {
            showAnswerInput();
        } else {
            showPlayerBuzzed(data.player.name);
        }
    });
    
    socket.on('answer-submitted', (data) => {
        showResult(data);
    });
    
    socket.on('next-turn', (data) => {
        currentPlayer = data.currentPlayer;
        myTurn = currentPlayer.id === playerId;
        updateCurrentPlayer(currentPlayer);
        updateBoard(data.board);
        hideQuestion();
    });
    
    socket.on('game-ended', (data) => {
        showGameEnd(data.finalScores);
    });
    
    socket.on('host-left', () => {
        alert('Der Host hat das Spiel verlassen');
        window.location.href = 'index.html';
    });
}

function initializeBoard(board) {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    // Create responsive grid
    const numCategories = board.categories.length;
    gameBoard.style.gridTemplateColumns = `repeat(${numCategories}, 1fr)`;
    
    board.categories.forEach((category, catIndex) => {
        const column = document.createElement('div');
        column.className = 'category-column';
        
        // Category header
        const header = document.createElement('div');
        header.className = 'category-header';
        header.textContent = category.name;
        column.appendChild(header);
        
        // Questions
        category.questions.forEach((question, qIndex) => {
            const cell = document.createElement('div');
            cell.className = 'question-cell';
            if (question.completed) {
                cell.classList.add('completed');
            }
            cell.textContent = question.points;
            cell.dataset.category = catIndex;
            cell.dataset.question = qIndex;
            
            if (!question.completed && myTurn) {
                cell.addEventListener('click', () => selectQuestion(catIndex, qIndex));
            }
            
            column.appendChild(cell);
        });
        
        gameBoard.appendChild(column);
    });
}

function updateBoard(board) {
    const cells = document.querySelectorAll('.question-cell');
    
    board.categories.forEach((category, catIndex) => {
        category.questions.forEach((question, qIndex) => {
            const cell = Array.from(cells).find(c => 
                c.dataset.category === catIndex.toString() && 
                c.dataset.question === qIndex.toString()
            );
            
            if (cell && question.completed) {
                cell.classList.add('completed');
                cell.onclick = null;
            } else if (cell && myTurn) {
                cell.onclick = () => selectQuestion(catIndex, qIndex);
            } else if (cell) {
                cell.onclick = null;
            }
        });
    });
}

function updateScoreboard(scores) {
    const scoresList = document.getElementById('scoresList');
    scoresList.innerHTML = '';
    
    scores.forEach((score, index) => {
        const item = document.createElement('div');
        item.className = 'score-item';
        if (index === 0) item.classList.add('leader');
        
        item.innerHTML = `
            <span class="score-name">${score.name}</span>
            <span class="score-points">${score.score}</span>
        `;
        
        scoresList.appendChild(item);
    });
}

function updateCurrentPlayer(player) {
    document.getElementById('currentPlayerName').textContent = player.name;
    
    const display = document.getElementById('currentPlayerDisplay');
    if (player.id === playerId) {
        display.style.background = '#4caf50';
    } else {
        display.style.background = '#667eea';
    }
}

function selectQuestion(categoryIndex, questionIndex) {
    if (!myTurn) return;
    
    socket.emit('select-question', { categoryIndex, questionIndex });
}

function showQuestion(data) {
    const modal = document.getElementById('questionModal');
    modal.classList.add('active');
    
    document.getElementById('questionPoints').textContent = data.question.points;
    document.getElementById('questionText').textContent = data.question.text;
    
    document.getElementById('waitingForBuzz').style.display = 'block';
    document.getElementById('answerInput').style.display = 'none';
    document.getElementById('resultDisplay').style.display = 'none';
}

function hideQuestion() {
    const modal = document.getElementById('questionModal');
    modal.classList.remove('active');
}

function buzz() {
    socket.emit('buzz');
}

function showAnswerInput() {
    document.getElementById('waitingForBuzz').style.display = 'none';
    document.getElementById('answerInput').style.display = 'block';
    document.getElementById('answerField').focus();
}

function showPlayerBuzzed(playerName) {
    const waiting = document.getElementById('waitingForBuzz');
    waiting.querySelector('p').textContent = `${playerName} hat gebuzzert...`;
    waiting.querySelector('button').style.display = 'none';
}

function submitAnswer() {
    const answer = document.getElementById('answerField').value.trim();
    
    if (!answer) {
        alert('Bitte gib eine Antwort ein');
        return;
    }
    
    socket.emit('submit-answer', answer);
    document.getElementById('answerInput').style.display = 'none';
}

function showResult(data) {
    document.getElementById('resultDisplay').style.display = 'block';
    
    const resultText = document.getElementById('resultText');
    const correctAnswerText = document.getElementById('correctAnswerText');
    
    if (data.correct) {
        resultText.textContent = `✓ Richtig! ${data.player.name} erhält ${data.answer} Punkte`;
        resultText.className = 'result-correct';
        correctAnswerText.textContent = '';
    } else {
        resultText.textContent = `✗ Falsch! ${data.player.name} verliert Punkte`;
        resultText.className = 'result-incorrect';
        if (data.correctAnswer) {
            correctAnswerText.textContent = `Richtige Antwort: ${data.correctAnswer}`;
        }
    }
    
    updateScoreboard(data.scores);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        hideQuestion();
    }, 3000);
}

function showGameEnd(finalScores) {
    const modal = document.getElementById('gameEndModal');
    const scoresDiv = document.getElementById('finalScores');
    
    scoresDiv.innerHTML = '';
    
    finalScores.forEach((score, index) => {
        const item = document.createElement('div');
        item.className = 'final-score-item';
        if (index === 0) item.classList.add('winner');
        
        const place = index === 0 ? '🏆' : `${index + 1}.`;
        
        item.innerHTML = `
            <span>${place} ${score.name}</span>
            <span>${score.score} Punkte</span>
        `;
        
        scoresDiv.appendChild(item);
    });
    
    modal.classList.add('active');
}

function backToHome() {
    sessionStorage.clear();
    socket.disconnect();
    window.location.href = 'index.html';
}

// Enter key for answer submission
window.addEventListener('DOMContentLoaded', () => {
    initSocket();
    
    document.getElementById('answerField')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitAnswer();
    });
});
