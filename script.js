const firebaseConfig = {
  apiKey: "AIzaSyADP0DV2JbMa6mrofsjkZJRF7Lj6Aq1LC4",
  authDomain: "eburnea-fd632.firebaseapp.com",
  databaseURL: "https://eburnea-fd632-default-rtdb.firebaseio.com", 
  projectId: "eburnea-fd632",
  storageBucket: "eburnea-fd632.firebasestorage.app",
  messagingSenderId: "560492313221",
  appId: "1:560492313221:web:e8bd91b5c384c57fe187ec",
  measurementId: "G-CH43LTYK55"
};

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const votesUrl = "https://borispimenov.github.io/votes.json";
const resetUrl = "https://borispimenov.github.io/reset-votes"; 
// (oppure un endpoint appropriato che tu configurerai)

function fetchVotes() {
  fetch(votesUrl)
    .then(response => {
      if (!response.ok) throw new Error("Errore caricando votes.json");
      return response.json();
    })
    .then(votes => {
      updateAdminUI(votes);
    })
    .catch(err => {
      console.error("Impossibile ottenere voti:", err);
    });
}

function updateAdminUI(votes) {
  const A = votes.A || 0;
  const B = votes.B || 0;
  const total = votes.total || (A + B);

  const percA = total > 0 ? Math.round((A / total) * 100) : 0;
  const percB = total > 0 ? Math.round((B / total) * 100) : 0;

  document.getElementById("adminStats").innerHTML = `
    <p>Opzione A: ${A} voti (${percA}%)</p>
    <p>Opzione B: ${B} voti (${percB}%)</p>
    <p>Totale voti: ${total}</p>
  `;
}

function resetVotes() {
  // fai la richiesta POST/PUT a resetUrl per azzerare i voti
  fetch(resetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ A: 0, B: 0, total: 0 })
  })
  .then(response => {
    if (!response.ok) throw new Error("Errore reset voti");
    return response.json();
  })
  .then(data => {
    console.log("Reset avvenuto:", data);
    fetchVotes();  // aggiorna subito la UI
  })
  .catch(err => {
    console.error("Reset fallito:", err);
  });
}

// Ogni 2 secondi aggiorna i dati (per “in tempo reale”)
setInterval(fetchVotes, 2000);
fetchVotes();
