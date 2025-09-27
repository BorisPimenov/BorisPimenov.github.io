// Import Firebase compat per Realtime Database
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, runTransaction } from "firebase/database";

// Configurazione corretta
const firebaseConfig = {
  apiKey: "AIzaSyADP0DV2JbMa6mrofsjkZJRF7Lj6Aq1LC4",
  authDomain: "eburnea-fd632.firebaseapp.com",
  projectId: "eburnea-fd632",
  storageBucket: "eburnea-fd632.appspot.com", // <--- CORRETTO
  messagingSenderId: "560492313221",
  appId: "1:560492313221:web:e8bd91b5c384c57fe187ec",
  measurementId: "G-CH43LTYK55"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const votesRef = ref(db, 'votes');

const voteAButton = document.getElementById('voteA');
const voteBButton = document.getElementById('voteB');
const percA = document.getElementById('percentage-A');
const percB = document.getElementById('percentage-B');
const totalClicks = document.getElementById('totalClicks');
const votedMsg = document.getElementById('votedMessage');

// Aggiorna UI
function updateUI(a, b) {
  const total = a + b;
  percA.textContent = total > 0 ? Math.round(a / total * 100) + '%' : '0%';
  percB.textContent = total > 0 ? Math.round(b / total * 100) + '%' : '0%';
  totalClicks.textContent = `${total} voti totali`;
}

// Sincronizzazione in tempo reale
onValue(votesRef, (snapshot) => {
  const data = snapshot.val() || {A: 0, B: 0};
  updateUI(data.A, data.B);
});

// Blocca doppio voto (localStorage)
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

// Voto A
voteAButton.onclick = function() {
  if (hasVoted()) return;
  runTransaction(votesRef, (current) => {
    return {
      A: (current?.A || 0) + 1,
      B: current?.B || 0
    };
  });
  setVoted();
};
// Voto B
voteBButton.onclick = function() {
  if (hasVoted()) return;
  runTransaction(votesRef, (current) => {
    return {
      A: current?.A || 0,
      B: (current?.B || 0) + 1
    };
  });
  setVoted();
};
