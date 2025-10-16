// CONNESSIONE WEBSOCKET GLOBALE
window.controlWs = new WebSocket('wss://eburnea-socket-8cd5fa7cffe8.herokuapp.com:443');

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
    
    // Controlla se l'utente ha già completato il questionario
    checkPreviousSession();
}

function setupWebSocket() {
    controlWs.onopen = function() {
        console.log('✅ WebSocket connesso');
        window.appState.websocketConnected = true;
        document.getElementById('connectionStatus').textContent = 'Connesso';
        
        // Invia dati pendenti
        sendPendingData();
    };

    controlWs.onclose = function() {
        console.log('❌ WebSocket disconnesso');
        window.appState.websocketConnected = false;
        document.getElementById('connectionStatus').textContent = 'Disconnesso';
    };

    controlWs.onerror = function(error) {
        console.error('💥 Errore WebSocket:', error);
    };
}

function checkPreviousSession() {
    const hasCompleted = localStorage.getItem('questionnaireCompleted');
    if (hasCompleted) {
        // Se ha già completato, nascondi questionario
        document.getElementById('questionnaire').classList.add('hidden');
        document.querySelector('.container').style.display = 'block';
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
}

// Utility per inviare dati
function sendToTouchDesigner(data) {
    if (window.appState.websocketConnected && controlWs.readyState === WebSocket.OPEN) {
        controlWs.send(JSON.stringify(data));
    } else {
        // Salva in localStorage e ritenta dopo
        localStorage.setItem('pendingData', JSON.stringify(data));
        console.log('💾 Dati salvati localmente, in attesa di connessione');
    }
}




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
votesRef.on('value', (snapshot) => {
  let data = snapshot.val();
  if (!data) data = {A: 0, B: 0}; // fallback se non esiste la chiave
  updateUI(data.A, data.B);

  // Se la votazione è stata resettata, riabilita il voto per tutti
  if (data.A === 0 && data.B === 0) {
    localStorage.removeItem('hasVoted');
    voteAButton.disabled = false;
    voteBButton.disabled = false;
    votedMsg.style.display = 'none';
  }
});

// Blocca doppio voto da sessione utente (locale)
function hasVoted() {
  return localStorage.getItem('hasVoted') === 'yes';
}
function setVoted() {
  localStorage.setItem('hasVoted', 'yes');
  votedMsg.style.display = 'block';
  voteAButton.disabled = true;
  voteBButton.disabled = true;
}

if (hasVoted()) setVoted();

// Gestione voto
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

// Bottone reset (solo admin.html)
const resetBtn = document.getElementById('resetVotes');
if (resetBtn) {
  resetBtn.onclick = function() {
    if (confirm("Sei sicuro di voler resettare la votazione?")) {
      votesRef.set({A:0, B:0});
      // Anche l'admin può votare di nuovo dopo il reset
      localStorage.removeItem('hasVoted');
      updateUI(0, 0);
      voteAButton.disabled = false;
      voteBButton.disabled = false;
      votedMsg.style.display = 'none';
    }
  };
}
