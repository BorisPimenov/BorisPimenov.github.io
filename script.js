// DUE CONNESSIONI WEBSOCKET SEPARATE
window.controlWs = new WebSocket('wss://eburnea-socket-8cd5fa7cffe8.herokuapp.com:8080');
window.questionnaireWs = new WebSocket('wss://eburnea-socket-8cd5fa7cffe8.herokuapp.com:8081');

// STATO APPLICAZIONE
window.appState = {
    questionnaireCompleted: false,
    controlConnected: false,
    questionnaireConnected: false
};

function initializeApp() {
    console.log('🚀 Inizializzazione applicazione');
    
    // Configura entrambi i WebSocket
    setupControlWebSocket();
    setupQuestionnaireWebSocket();
    
    // Nascondi contenuto principale inizialmente
    document.querySelector('.container').style.display = 'none';
    document.querySelector('.touch-panel').style.display = 'none';
    
    checkPreviousSession();
}

function setupControlWebSocket() {
    controlWs.onopen = function() {
        console.log('✅ WebSocket Controlli connesso');
        window.appState.controlConnected = true;
        updateConnectionStatus();
    };

    controlWs.onclose = function() {
        console.log('❌ WebSocket Controlli disconnesso');
        window.appState.controlConnected = false;
        updateConnectionStatus();
    };

    controlWs.onerror = function(error) {
        console.error('💥 Errore WebSocket Controlli:', error);
        window.appState.controlConnected = false;
        updateConnectionStatus();
    };
}

function setupQuestionnaireWebSocket() {
    questionnaireWs.onopen = function() {
        console.log('✅ WebSocket Questionario connesso');
        window.appState.questionnaireConnected = true;
        updateConnectionStatus();
    };

    questionnaireWs.onclose = function() {
        console.log('❌ WebSocket Questionario disconnesso');
        window.appState.questionnaireConnected = false;
        updateConnectionStatus();
    };

    questionnaireWs.onerror = function(error) {
        console.error('💥 Errore WebSocket Questionario:', error);
        window.appState.questionnaireConnected = false;
        updateConnectionStatus();
    };
}

function updateConnectionStatus() {
    const statusElement = document.getElementById('connectionStatus');
    if (!statusElement) return;
    
    if (window.appState.controlConnected && window.appState.questionnaireConnected) {
        statusElement.textContent = 'Tutto connesso';
        statusElement.className = 'connection-status connected';
    } else if (window.appState.controlConnected) {
        statusElement.textContent = 'Controlli connessi - Questionario offline';
        statusElement.className = 'connection-status disconnected';
    } else if (window.appState.questionnaireConnected) {
        statusElement.textContent = 'Questionario connesso - Controlli offline';
        statusElement.className = 'connection-status disconnected';
    } else {
        statusElement.textContent = 'Tutto disconnesso';
        statusElement.className = 'connection-status disconnected';
    }
}

// Utility per inviare dati - USA IL WEB SOCKET CORRETTO
function sendToTouchDesigner(data) {
    if (data.type === 'questionnaire') {
        // Usa questionnaire WebSocket
        if (window.appState.questionnaireConnected && questionnaireWs.readyState === WebSocket.OPEN) {
            questionnaireWs.send(JSON.stringify(data));
            console.log('📤 Questionario inviato:', data);
        } else {
            localStorage.setItem('pendingQuestionnaire', JSON.stringify(data));
            console.log('💾 Questionario salvato localmente');
        }
    } else {
        // Usa control WebSocket per slider/touch
        if (window.appState.controlConnected && controlWs.readyState === WebSocket.OPEN) {
            controlWs.send(JSON.stringify(data));
            console.log('📤 Controllo inviato:', data);
        } else {
            localStorage.setItem('pendingControl', JSON.stringify(data));
            console.log('💾 Controllo salvato localmente');
        }
    }
}
