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
