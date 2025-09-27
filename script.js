// Funziona sia per index che per admin: il reset è attivo solo se esiste #resetVotes

const db = firebase.database();
const votesRef = db.ref('votes');

const voteAButton = document.getElementById('voteA');
const voteBButton = document.getElementById('voteB');
const percA = document.getElementById('percentage-A');
const percB = document.getElementById('percentage-B');
const totalClicks = document.getElementById('totalClicks');
const votedMsg = document.getElementById('votedMessage');

// Aggiorna la UI con i dati
function updateUI(a, b) {
  const total = a + b;
  percA.textContent = total > 0 ? Math.round(a / total * 100) + '%' : '0%';
  percB.textContent = total > 0 ? Math.round(b / total * 100) + '%' : '0%';
  totalClicks.textContent = `${total} voti totali`;
}

// Ascolta cambiamenti in tempo reale
votesRef.on('value', (snapshot) => {
  let data = snapshot.val();
  if (!data) data = {A: 0, B: 0};
  updateUI(data.A, data.B);
});

// Blocca doppio voto da sessione utente
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

// Bottone reset (solo admin)
const resetBtn = document.getElementById('resetVotes');
if (resetBtn) {
  resetBtn.onclick = function() {
    if (confirm("Sei sicuro di voler resettare la votazione?")) {
      votesRef.set({A:0, B:0});
      // L'admin può votare di nuovo dopo il reset
      localStorage.removeItem('hasVoted');
      updateUI(0, 0);
      voteAButton.disabled = false;
      voteBButton.disabled = false;
      votedMsg.style.display = 'none';
    }
  };
}
