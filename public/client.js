let socket;

// Initialize socket connection
function initSocket() {
    socket = io();
    
    socket.on('game-created', (data) => {
        sessionStorage.setItem('roomCode', data.roomCode);
        sessionStorage.setItem('playerId', data.hostId);
        sessionStorage.setItem('isHost', 'true');
        window.location.href = 'lobby.html';
    });
    
    socket.on('joined-game', (data) => {
        sessionStorage.setItem('roomCode', data.roomCode);
        sessionStorage.setItem('playerId', data.playerId);
        sessionStorage.setItem('isHost', 'false');
        window.location.href = 'lobby.html';
    });
    
    socket.on('error', (message) => {
        showError(message);
    });
}

function showCreateGame() {
    document.getElementById('createGameModal').classList.add('active');
}

function showJoinGame() {
    document.getElementById('joinGameModal').classList.add('active');
}

function hideModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

function createGame() {
    const hostName = document.getElementById('hostName').value.trim();
    
    if (!hostName) {
        showError('Bitte gib einen Namen ein');
        return;
    }
    
    socket.emit('create-game', hostName);
}

function joinGame() {
    const roomCode = document.getElementById('roomCode').value.trim().toUpperCase();
    const playerName = document.getElementById('playerName').value.trim();
    
    if (!roomCode || !playerName) {
        showError('Bitte fülle alle Felder aus');
        return;
    }
    
    if (roomCode.length !== 6) {
        showError('Ungültiger Raumcode');
        return;
    }
    
    socket.emit('join-game', { roomCode, playerName });
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.add('active');
    
    setTimeout(() => {
        errorDiv.classList.remove('active');
    }, 3000);
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    initSocket();
    
    // Add Enter key listeners
    document.getElementById('hostName')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') createGame();
    });
    
    document.getElementById('roomCode')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') document.getElementById('playerName').focus();
    });
    
    document.getElementById('playerName')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') joinGame();
    });
});
