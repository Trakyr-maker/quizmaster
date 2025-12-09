let socket;
let roomCode;
let playerId;
let isHost;

function initSocket() {
    socket = io({
        transports: ['polling', 'websocket'],
        upgrade: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
        timeout: 20000
    });
    
    roomCode = sessionStorage.getItem('roomCode');
    playerId = sessionStorage.getItem('playerId');
    isHost = sessionStorage.getItem('isHost') === 'true';
    
    if (!roomCode || !playerId) {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('roomCodeDisplay').textContent = roomCode;
    
    // Show/hide host controls
    if (!isHost) {
        document.getElementById('hostControls').style.display = 'none';
    }
    
    socket.on('player-list-update', (data) => {
        updatePlayersList(data.players, data.host);
    });
    
    socket.on('settings-updated', (settings) => {
        // Update UI if needed
        console.log('Settings updated:', settings);
    });
    
    socket.on('game-started', (data) => {
        sessionStorage.setItem('gameData', JSON.stringify(data));
        window.location.href = 'game.html';
    });
    
    socket.on('host-left', () => {
        alert('Der Host hat die Lobby verlassen');
        window.location.href = 'index.html';
    });
    
    socket.on('error', (message) => {
        alert(message);
    });
}

function updatePlayersList(players, host) {
    const playersList = document.getElementById('playersList');
    const playerCount = document.getElementById('playerCount');
    
    playerCount.textContent = players.length;
    playersList.innerHTML = '';
    
    // Add host first
    const hostCard = document.createElement('div');
    hostCard.className = 'player-card host';
    hostCard.innerHTML = `
        <span class="player-icon">👑</span>
        <span class="player-name">${host.name} (Host)</span>
    `;
    playersList.appendChild(hostCard);
    
    // Add other players
    players.forEach(player => {
        if (player.id === host.id) return;
        
        const card = document.createElement('div');
        card.className = 'player-card';
        card.innerHTML = `
            <span class="player-icon">👤</span>
            <span class="player-name">${player.name}</span>
        `;
        playersList.appendChild(card);
    });
}

function copyRoomCode() {
    navigator.clipboard.writeText(roomCode).then(() => {
        alert('Raumcode kopiert!');
    });
}

function updateSettings() {
    if (!isHost) return;
    
    const settings = {
        teamMode: document.getElementById('teamMode').checked,
        timerEnabled: document.getElementById('timerEnabled').checked,
        questionTime: parseInt(document.getElementById('questionTime').value)
    };
    
    socket.emit('update-settings', settings);
}

function startGame() {
    socket.emit('start-game');
}

function leaveLobby() {
    sessionStorage.clear();
    socket.disconnect();
    window.location.href = 'index.html';
}

window.addEventListener('DOMContentLoaded', () => {
    initSocket();
});
