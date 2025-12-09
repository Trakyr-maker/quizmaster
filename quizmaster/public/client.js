let socket;

// Initialize socket connection
function initSocket() {
    console.log('🔌 Initialisiere Socket-Verbindung zu:', window.location.origin);
    
    // WICHTIG: Keine URL angeben, dann nutzt Socket.io automatisch die richtige
    socket = io({
        transports: ['polling', 'websocket'],
        upgrade: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
        timeout: 20000
    });
    
    socket.on('connect', () => {
        console.log('✅ Socket verbunden! ID:', socket.id);
        console.log('✅ Transport:', socket.io.engine.transport.name);
    });
    
    socket.on('disconnect', (reason) => {
        console.log('❌ Socket getrennt! Grund:', reason);
    });
    
    socket.on('connect_error', (error) => {
        console.error('❌ Verbindungsfehler:', error.message);
        showError('Verbindung zum Server fehlgeschlagen: ' + error.message);
    });
    
    socket.on('game-created', (data) => {
        console.log('✅ Spiel erstellt:', data);
        sessionStorage.setItem('roomCode', data.roomCode);
        sessionStorage.setItem('playerId', data.hostId);
        sessionStorage.setItem('isHost', 'true');
        window.location.href = 'lobby.html';
    });
    
    socket.on('joined-game', (data) => {
        console.log('✅ Spiel beigetreten:', data);
        sessionStorage.setItem('roomCode', data.roomCode);
        sessionStorage.setItem('playerId', data.playerId);
        sessionStorage.setItem('isHost', 'false');
        window.location.href = 'lobby.html';
    });
    
    socket.on('error', (message) => {
        console.error('❌ Server-Fehler:', message);
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
        showError('Ungültiger Raumcode (muss 6 Zeichen sein)');
        return;
    }
    
    console.log('Versuche beizutreten:', { roomCode, playerName });
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
