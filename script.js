// CONNESSIONE WEBSOCKET CON DEBUG ESTESO
console.log('🔄 Tentativo di connessione WebSocket...');
const ws = new WebSocket('wss://eburnea-fixed-f2da05b9b297.herokuapp.com');
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
// BOTTONE RESET PARAMETRI
document.getElementById('resetButton').addEventListener('click', function() {
    console.log('🔄 Bottone reset premuto');
    
    // Invia messaggio WebSocket
    sendToTouchDesigner({
        type: "reset",
        button: "reset_parameters",
        timestamp: Date.now(),
        message: "Reset parametri richiesto"
    });
    
    // Reset valori slider a valori predefiniti
    const defaultValues = {
        slider1: 50,
        slider2: 25, 
        slider3: 75,
        slider4: 10,
        slider5: 50,
        slider6: 50,
        slider7: 50
    };
    
    // Aggiorna slider visivamente
    Object.keys(defaultValues).forEach(sliderId => {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(sliderId + 'Value');
        
        if (slider && valueDisplay) {
            slider.value = defaultValues[sliderId];
            valueDisplay.textContent = defaultValues[sliderId];
            
            // Trigger change event per aggiornare WebSocket
            slider.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    
    // Feedback visivo
    this.style.background = '#2e7d32';
    this.textContent = 'Reset Completato!';
    
    setTimeout(() => {
        this.style.background = '#333';
        this.textContent = 'Reset Parametri';
    }, 1500);
});
    // Aggiungi questo codice in fondo a script (1).js

document.addEventListener('DOMContentLoaded', function() {
    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            console.log('🔄 Bottone reset premuto');
            
            // Invia messaggio WebSocket
            sendToTouchDesigner({
                type: "reset",
                button: "reset_parameters",
                timestamp: Date.now(),
                message: "Reset parametri richiesto"
            });
            
            // Opzionale: feedback visivo
            this.style.background = '#2e7d32';
            this.textContent = 'Reset Inviato!';
            
            setTimeout(() => {
                this.style.background = '#333';
                this.textContent = 'Reset Parametri';
            }, 1500);
        });
    } else {
        console.error('❌ Bottone reset non trovato');
    }
});
// DEBUG - Verifica che il bottone esista
console.log('🔍 Ricerca bottone reset...');
const resetButton = document.getElementById('resetButton');
console.log('Bottone trovato:', resetButton);

if (resetButton) {
    console.log('✅ Bottone reset trovato nel DOM');
    resetButton.addEventListener('click', function() {
        console.log('🔄 CLICK RILEVATO sul bottone reset!');
    });
} else {
    console.error('❌ Bottone reset NON TROVATO nel DOM');
}
}
<script>
document.addEventListener('DOMContentLoaded', function() {
  const videoOverlay = document.getElementById('videoOverlay');
  const playButton = document.getElementById('playButton');
  const backgroundVideo = document.getElementById('backgroundVideo');
  
  playButton.addEventListener('click', function() {
    // Cambia l'URL per rimuovere il mute e forzare il play
    const currentSrc = backgroundVideo.src;
    const newSrc = currentSrc.replace('&mute=1', '&autoplay=1') + '&autoplay=1';
    backgroundVideo.src = newSrc;
    
    // Nascondi l'overlay
    videoOverlay.classList.add('hidden');
  });
});
</script>

