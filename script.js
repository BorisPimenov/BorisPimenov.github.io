// CONNESSIONE WEBSOCKET GLOBALE
window.controlWs = new WebSocket('wss://eburnea-socket-8cd5fa7cffe8.herokuapp.com');

// STATO APPLICAZIONE
window.appState = {
    questionnaireCompleted: false,
    websocketConnected: false,
    currentUser: null
};

// INIZIALIZZAZIONE
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('🚀 Inizializzazione applicazione');
    
    // Configura WebSocket
    setupWebSocket();
    
    // Nascondi contenuto principale inizialmente
    document.querySelector('.container').style.display = 'none';
    document.querySelector('.touch-panel').style.display = 'none';
    
    // Controlla se l'utente ha già completato il questionario
    checkPreviousSession();
}

function setupWebSocket() {
    controlWs.onopen = function() {
        console.log('✅ WebSocket connesso');
        window.appState.websocketConnected = true;
        if (document.getElementById('connectionStatus')) {
            document.getElementById('connectionStatus').textContent = 'Connesso';
            document.getElementById('connectionStatus').className = 'connection-status connected';
        }
        
        // Invia dati pendenti
        sendPendingData();
    };

    controlWs.onclose = function() {
        console.log('❌ WebSocket disconnesso');
        window.appState.websocketConnected = false;
        if (document.getElementById('connectionStatus')) {
            document.getElementById('connectionStatus').textContent = 'Disconnesso';
            document.getElementById('connectionStatus').className = 'connection-status disconnected';
        }
    };

    controlWs.onerror = function(error) {
        console.error('💥 Errore WebSocket:', error);
        if (document.getElementById('connectionStatus')) {
            document.getElementById('connectionStatus').textContent = 'Errore di connessione';
            document.getElementById('connectionStatus').className = 'connection-status disconnected';
        }
    };
}

function checkPreviousSession() {
    const hasCompleted = localStorage.getItem('questionnaireCompleted');
    if (hasCompleted) {
        // Se ha già completato, nascondi questionario
        const questionnaire = document.getElementById('questionnaire');
        if (questionnaire) {
            questionnaire.classList.add('hidden');
        }
        document.querySelector('.container').style.display = 'block';
        document.querySelector('.touch-panel').style.display = 'block';
        window.appState.questionnaireCompleted = true;
    }
}

function sendPendingData() {
    // Invia questionario pendente
    const pendingQuestionnaire = localStorage.getItem('pendingQuestionnaire');
    if (pendingQuestionnaire && window.appState.websocketConnected) {
        const data = JSON.parse(pendingQuestionnaire);
        controlWs.send(JSON.stringify(data));
        localStorage.removeItem('pendingQuestionnaire');
        console.log('📤 Dati pendenti inviati');
    }
    
    // Invia altri dati pendenti
    const pendingData = localStorage.getItem('pendingData');
    if (pendingData && window.appState.websocketConnected) {
        const data = JSON.parse(pendingData);
        controlWs.send(JSON.stringify(data));
        localStorage.removeItem('pendingData');
        console.log('📤 Altri dati pendenti inviati');
    }
}

// Utility per inviare dati
function sendToTouchDesigner(data) {
    if (window.appState.websocketConnected && controlWs.readyState === WebSocket.OPEN) {
        controlWs.send(JSON.stringify(data));
        console.log('📤 Inviati a TD:', data);
    } else {
        // Salva in localStorage e ritenta dopo
        localStorage.setItem('pendingData', JSON.stringify(data));
        console.log('💾 Dati salvati localmente, in attesa di connessione');
    }
}

// FIREBASE VOTING SYSTEM
const db = firebase.database();
const votesRef = db.ref('votes');

const voteAButton = document.getElementById('voteA');
const voteBButton = document.getElementById('voteB');
const percA = document.getElementById('percentage-A');
const percB = document.getElementById('percentage-B');
const totalClicks = document.getElementById('totalClicks');
const votedMsg = document.getElementById('votedMessage');

// Funzione per aggiornare le percentuali
function updateUI(a, b) {
  const total = a + b;
  percA.textContent = total > 0 ? Math.round(a / total * 100) + '%' : '0%';
  percB.textContent = total > 0 ? Math.round(b / total * 100) + '%' : '0%';
  totalClicks.textContent = `${total} voti totali`;
}

// Aggiorna in tempo reale
if (votesRef) {
    votesRef.on('value', (snapshot) => {
      let data = snapshot.val();
      if (!data) data = {A: 0, B: 0}; // fallback se non esiste la chiave
      updateUI(data.A, data.B);

      // Se la votazione è stata resettata, riabilita il voto per tutti
      if (data.A === 0 && data.B === 0) {
        localStorage.removeItem('hasVoted');
        if (voteAButton) voteAButton.disabled = false;
        if (voteBButton) voteBButton.disabled = false;
        if (votedMsg) votedMsg.style.display = 'none';
      }
    });
}

// Blocca doppio voto da sessione utente (locale)
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

// Gestione voto
if (voteAButton) {
    voteAButton.onclick = function() {
      if (hasVoted()) return;
      votesRef.transaction(current => {
        return {
          A: (current && typeof current.A === 'number' ? current.A : 0) + 1,
          B: (current && typeof current.B === 'number' ? current.B : 0)
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
          A: (current && typeof current.A === 'number' ? current.A : 0),
          B: (current && typeof current.B === 'number' ? current.B : 0) + 1
        };
      });
      setVoted();
    };
}
