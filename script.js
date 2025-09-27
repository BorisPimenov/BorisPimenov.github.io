// --- INCOLLA QUI IL TUO FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyD*******",
  authDomain: "nome-progetto.firebaseapp.com",
  databaseURL: "https://nome-progetto-default-rtdb.firebaseio.com",
  projectId: "nome-progetto",
  storageBucket: "nome-progetto.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};


if (typeof firebase === 'undefined') {
  console.error("Firebase non è definito. Controlla che i CDN siano inclusi prima di script.js");
}

// inizializza Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const votesRef = db.ref('votes'); // struttura: { A:, B:, total:, resetAt: <timestamp> }

function formatPercent(val, total) {
  return total > 0 ? Math.round((val / total) * 100) + "%" : "0%";
}

function updateUIFromVotes(votes) {
  const A = votes.A || 0;
  const B = votes.B || 0;
  const total = votes.total || (A + B);
  const resetAt = votes.resetAt || 0;

  // Aggiorna elementi pubblici (se presenti)
  const elA = document.getElementById("percentage-A");
  const elB = document.getElementById("percentage-B");
  const elTotal = document.getElementById("totalClicks");
  const elAdmin = document.getElementById("adminStats");

  if (elA) elA.textContent = formatPercent(A, total);
  if (elB) elB.textContent = formatPercent(B, total);
  if (elTotal) elTotal.textContent = `${total} voti totali`;

  if (elAdmin) {
    elAdmin.innerHTML = `
      <p>Opzione A: ${A} voti (${formatPercent(A,total)})</p>
      <p>Opzione B: ${B} voti (${formatPercent(B,total)})</p>
      <p>Totale voti: ${total}</p>
      <p>Ultimo reset: ${resetAt ? new Date(resetAt).toLocaleString() : "mai"}</p>
    `;
  }

  // Gestione 'hasVoted' vs reset:
  // Se c'è stato un reset (resetAt più grande di quanto salvato nel browser), allora rimuoviamo il blocco hasVoted locale così l'utente può votare di nuovo.
  try {
    const localLastReset = Number(localStorage.getItem('lastResetAt') || 0);
    if (resetAt > localLastReset) {
      localStorage.removeItem('hasVoted');
      localStorage.setItem('lastResetAt', String(resetAt));
      const votedMsg = document.getElementById('votedMessage');
      if (votedMsg) votedMsg.style.display = 'none';
    }
  } catch (e) {
    // ignore localStorage errors
  }

  // Se l'utente aveva già votato (localStorage), mostriamo il messaggio
  try {
    if (localStorage.getItem('hasVoted') && document.getElementById('votedMessage')) {
      document.getElementById('votedMessage').style.display = 'block';
    }
  } catch (e) {}
}

// listener realtime: tutti i client si aggiornano quando cambia 'votes'
votesRef.on('value', snapshot => {
  const votes = snapshot.val() || { A:0, B:0, total:0, resetAt:0 };
  updateUIFromVotes(votes);
});

// Funzione vote con transaction per evitare race
function vote(option) {
  try {
    if (localStorage.getItem('hasVoted')) {
      const votedMsg = document.getElementById('votedMessage');
      if (votedMsg) votedMsg.style.display = 'block';
      return;
    }
  } catch (e) {}

  votesRef.transaction(current => {
    if (current === null) current = { A:0, B:0, total:0, resetAt: 0 };
    current[option] = (current[option] || 0) + 1;
    current.total = (current.total || 0) + 1;
    // preserva current.resetAt se presente
    return current;
  }, (error, committed, snapshot) => {
    if (error) {
      console.error("Transaction fallita:", error);
    } else if (!committed) {
      console.warn("Transaction non committata");
    } else {
      try {
        localStorage.setItem('hasVoted', 'true');
        // salva anche il resetAt corrente così, se admin resetta dopo, il listener lo rileverà
        const votes = snapshot.val() || {};
        localStorage.setItem('lastResetAt', String(votes.resetAt || 0));
      } catch (e) {}
      const votedMsg = document.getElementById('votedMessage');
      if (votedMsg) votedMsg.style.display = 'block';
    }
  });
}

// Per i pulsanti nella pagina (se esistono)
document.addEventListener('DOMContentLoaded', () => {
  const btnA = document.getElementById('voteA');
  const btnB = document.getElementById('voteB');
  if (btnA) btnA.addEventListener('click', () => vote('A'));
  if (btnB) btnB.addEventListener('click', () => vote('B'));
});

// Funzione di reset (usata da admin). Aggiorna anche resetAt per sbloccare i browser remoti.
function resetVotes() {
  const now = Date.now();
  return votesRef.set({ A:0, B:0, total:0, resetAt: now });
}

function confirmAndReset() {
  if (!confirm("Sei sicuro di azzerare tutti i voti?")) return;
  resetVotes()
    .then(() => {
      // togli hasVoted dalla macchina ADMIN locale (gli altri browser saranno sbloccati automaticamente tramite resetAt)
      try { localStorage.removeItem('hasVoted'); localStorage.setItem('lastResetAt', String(Date.now())); } catch(e){}
      alert("Reset OK. I client si aggiorneranno automaticamente.");
    })
    .catch(err => {
      console.error("Errore durante il reset:", err);
      alert("Reset fallito (guarda console per dettagli).");
    });
}
