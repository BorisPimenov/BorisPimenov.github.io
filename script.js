// CONNESSIONE WEBSOCKET CON DEBUG ESTESO
console.log('🔄 Tentativo di connessione WebSocket...');
const ws = new WebSocket('wss://eburnea-socket-8cd5fa7cffe8.herokuapp.com');
// Rendi il WebSocket globale per l'accesso da altri file
window.ws = ws;
const connectionStatus = document.getElementById('connectionStatus');

// FUNZIONE GLOBALE PER INVIO MESSAGGI - AGGIUNGI QUESTO
function sendToTouchDesigner(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
        console.log('📤 Messaggio inviato:', message);
    } else {
        console.log('⚠️ WebSocket non connesso, messaggio non inviato:', message);
        // Opzionale: metti in coda i messaggi per quando si riconnette
        if (!window.pendingMessages) window.pendingMessages = [];
        window.pendingMessages.push(message);
    }
}

// Funzione per inviare messaggi in sospeso quando si ricollega
function sendPendingMessages() {
    if (window.pendingMessages && window.pendingMessages.length > 0) {
        console.log('📦 Invio messaggi in sospeso:', window.pendingMessages.length);
        window.pendingMessages.forEach(message => {
            sendToTouchDesigner(message);
        });
        window.pendingMessages = [];
    }
}

// Aggiorna l'evento onopen per inviare i messaggi in sospeso
ws.onopen = function(event) {
    console.log('✅✅✅ WEB SOCKET CONNESSO!');
    connectionStatus.textContent = 'Connected';
    connectionStatus.className = 'connection-status connected';
    
    // Invia messaggi in sospeso se ce ne sono
    sendPendingMessages();
    
    // Test invio immediato
    sendToTouchDesigner({
        type: "test",
        message: "Connessione test",
        timestamp: Date.now()
    });
};


ws.onopen = function(event) {
    console.log('✅✅✅ WEB SOCKET CONNESSO!');
    console.log('Event:', event);
    connectionStatus.textContent = 'Connected';
    connectionStatus.className = 'connection-status connected';
    
    // Test invio immediato
    ws.send(JSON.stringify({
        type: "test",
        message: "Connessione test",
        timestamp: Date.now()
    }));
};

ws.onclose = function(event) {
    console.log('❌❌❌ WEB SOCKET DISCONNESSO');
    console.log('Event:', event);
    connectionStatus.textContent = 'Disconnected - Code: ' + event.code;
    connectionStatus.className = 'connection-status disconnected';
    
    // Tentativo riconnessione dopo 5 secondi
    setTimeout(() => {
        console.log('🔄 Tentativo riconnessione...');
        location.reload();
    }, 5000);
};

ws.onerror = function(error) {
    console.log('💥💥💥 WEB SOCKET ERROR');
    console.log('Error:', error);
    connectionStatus.textContent = 'Connection Error';
    connectionStatus.className = 'connection-status disconnected';
};

ws.onmessage = function(event) {
    console.log('📩 Messaggio dal server:', event.data);
};



// FIREBASE (mantieni questo)
const db = firebase.database();
const votesRef = db.ref('votes');

const voteAButton = document.getElementById('voteA');
const voteBButton = document.getElementById('voteB');
const percA = document.getElementById('percentage-A');
const percB = document.getElementById('percentage-B');
const totalClicks = document.getElementById('totalClicks');
const votedMsg = document.getElementById('votedMessage');

function updateUI(a, b) {
    const total = a + b;
    percA.textContent = total > 0 ? Math.round(a / total * 100) + '%' : '0%';
    percB.textContent = total > 0 ? Math.round(b / total * 100) + '%' : '0%';
    totalClicks.textContent = `${total} voti totali`;
}

if (votesRef) {
    votesRef.on('value', (snapshot) => {
        let data = snapshot.val();
        if (!data) data = {A: 0, B: 0};
        updateUI(data.A, data.B);

        if (data.A === 0 && data.B === 0) {
            localStorage.removeItem('hasVoted');
            if (voteAButton) voteAButton.disabled = false;
            if (voteBButton) voteBButton.disabled = false;
            if (votedMsg) votedMsg.style.display = 'none';
        }
    });
}

function hasVoted() {
    return localStorage.getItem('hasVoted') === 'yes';
}

function setVoted() {
    localStorage.setItem('hasVoted', 'yes');
    if (votedMsg) votedMsg.style.display = 'block';
    if (voteAButton) voteAButton.disabled = true;
    if (voteBButton) voteBButton.disabled = true;
}

if (hasVoted()) setVoted();

if (voteAButton) {
    voteAButton.onclick = function() {
        if (hasVoted()) return;
        votesRef.transaction(current => {
            return {
                A: (current && current.A ? current.A : 0) + 1,
                B: (current && current.B ? current.B : 0)
            };
        });
        setVoted();
    };
}

if (voteBButton) {
    voteBButton.onclick = function() {
        if (hasVoted()) return;
        votesRef.transaction(current => {
            return {
                A: (current && current.A ? current.A : 0),
                B: (current && current.B ? current.B : 0) + 1
            };
        });
        setVoted();
    };
}
