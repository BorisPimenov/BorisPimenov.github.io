// Assicurati che sia inserito nel tuo repo (BorisPimenov.github.io)

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
  if (total === 0) {
    percA.textContent = '0%';
    percB.textContent = '0%';
  } else {
    percA.textContent = Math.round(a / total * 100) + '%';
    percB.textContent = Math.round(b / total * 100) + '%';
  }
  totalClicks.textContent = `${total} voti totali`;
}

// Aggiorna in tempo reale
votesRef.on('value', (snapshot) => {
  const data = snapshot.val() || {A:0,B:0};
  updateUI(data.A, data.B);
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

if (hasVoted()) {
  setVoted();
}

// Gestione voto
voteAButton.onclick = function() {
  if (hasVoted()) return;
  votesRef.transaction(current => {
    return {
      A: (current?.A || 0) + 1,
      B: current?.B || 0
    };
  });
  setVoted();
};
voteBButton.onclick = function() {
  if (hasVoted()) return;
  votesRef.transaction(current => {
    return {
      A: current?.A || 0,
      B: (current?.B || 0) + 1
    };
  });
  setVoted();
};
