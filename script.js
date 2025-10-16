// UNICA CONNESSIONE WEBSOCKET
window.appWs = new WebSocket('wss://eburnea-socket-8cd5fa7cffe8.herokuapp.com');

// STATO APPLICAZIONE
window.appState = {
    questionnaireCompleted: false,
    websocketConnected: false
};

function initializeApp() {
    console.log('🚀 Inizializzazione applicazione');
    setupWebSocket();
    document.querySelector('.container').style.display = 'none';
    document.querySelector('.touch-panel').style.display = 'none';
    checkPreviousSession();
}

function setupWebSocket() {
    appWs.onopen = function() {
        console.log('✅ WebSocket connesso');
        window.appState.websocketConnected = true;
        updateConnectionStatus();
        sendPendingData();
    };

    appWs.onclose = function() {
        console.log('❌ WebSocket disconnesso');
        window.appState.websocketConnected = false;
        updateConnectionStatus();
    };

    appWs.onerror = function(error) {
        console.error('💥 Errore WebSocket:', error);
        window.appState.websocketConnected = false;
        updateConnectionStatus();
    };
}

function updateConnectionStatus() {
    const statusElement = document.getElementById('connectionStatus');
    if (!statusElement) return;
    
    if (window.appState.websocketConnected) {
        statusElement.textContent = 'Connesso';
        statusElement.className = 'connection-status connected';
    } else {
        statusElement.textContent = 'Disconnesso';
        statusElement.className = 'connection-status disconnected';
    }
}

// FUNZIONE UNICA PER INVIO DATI
function sendToTouchDesigner(data) {
    if (window.appState.websocketConnected && appWs.readyState === WebSocket.OPEN) {
        appWs.send(JSON.stringify(data));
        console.log('📤 Inviati:', data.type);
    } else {
        // Salva in localStorage
        const pendingKey = data.type === 'questionnaire' ? 'pendingQuestionnaire' : 'pendingControl';
        localStorage.setItem(pendingKey, JSON.stringify(data));
        console.log('💾 Dati salvati:', data.type);
    }
}
