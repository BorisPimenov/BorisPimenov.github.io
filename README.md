<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sondaggio Interattivo</title>
    <style>
        :root {
            --bg-color: #121212;
            --text-color: #e0e0e0;
            --card-bg: #1e1e1e;
            --border-color: #333;
            --accent-color: #03dac6;
            --button-hover: #2a2a2a;
            --success-color: #4caf50;
            --error-color: #f44336;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            min-height: 100vh;
        }

        /* [Stile CSS precedente non modificato... ometto per brevità] */
        .container, .interaction-panel, .buttons-container, .option-group, .option-button, 
        .percentage-display, .total-clicks {
             /* Qui va il tuo CSS originale */
             width: 100%; max-width: 900px; display: flex; flex-direction: column; gap: 20px;
        }
        .interaction-panel { background-color: var(--card-bg); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color); text-align: center; }
        .buttons-container { display: flex; flex-direction: row; justify-content: center; gap: 20px; margin-top: 15px; }
        .option-group { display: flex; flex-direction: column; align-items: center; min-width: 120px; }
        .option-button { padding: 15px 30px; font-size: 1.2rem; font-weight: bold; color: var(--text-color); background-color: var(--card-bg); border: 2px solid var(--accent-color); border-radius: 8px; cursor: pointer; transition: background-color 0.3s, transform 0.1s; }
        .option-button:disabled { cursor: not-allowed; opacity: 0.5; }
        .option-button:hover:not(:disabled) { background-color: var(--button-hover); }
        .option-button:active:not(:disabled) { transform: scale(0.98); }
        .percentage-display { margin-top: 10px; font-size: 1.3rem; font-weight: bold; color: var(--accent-color); transition: all 0.3s ease; }
        .total-clicks { margin-top: 10px; font-size: 0.9rem; color: #999; }
        
        /* NUOVI STILI */
        .status-bar {
            position: absolute;
            top: 15px;
            right: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            background-color: var(--card-bg);
            padding: 8px 15px;
            border-radius: 20px;
            border: 1px solid var(--border-color);
            font-size: 0.9rem;
        }
        .online-dot {
            width: 10px;
            height: 10px;
            background-color: var(--success-color);
            border-radius: 50%;
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 var(--success-color); } 70% { box-shadow: 0 0 0 7px rgba(76, 175, 80, 0); } 100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); } }

        .voted-message {
            color: var(--accent-color);
            font-weight: bold;
            margin-top: 15px;
            display: none; /* Nascosto di default */
        }
        .reset-button {
            margin-top: 20px;
            padding: 8px 16px;
            font-size: 0.8rem;
            color: #fff;
            background-color: var(--error-color);
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
    </style>
</head>
<body>

<div class="status-bar">
    <div class="online-dot"></div>
    <span id="online-users">...</span> utenti online
</div>

<div class="container">
    <div class="interaction-panel">
        <h2>Quale opzione preferisci?</h2>
        <div class="buttons-container">
            <div class="option-group">
                <button class="option-button" id="buttonA">Opzione A</button>
                <div class="percentage-display" id="percentageA">0%</div>
            </div>
            <div class="option-group">
                <button class="option-button" id="buttonB">Opzione B</button>
                <div class="percentage-display" id="percentageB">0%</div>
            </div>
        </div>
        <div class="total-clicks" id="totalClicks">Totale voti: 0</div>
        <div class="voted-message" id="votedMessage">Grazie per aver votato!</div>
        <button class="reset-button" id="resetButton">Resetta voto (test)</button>
    </div>
</div>

<script>
    // Selezioniamo tutti gli elementi necessari
    const buttonA = document.getElementById('buttonA');
    const buttonB = document.getElementById('buttonB');
    const percentageA_display = document.getElementById('percentageA');
    const percentageB_display = document.getElementById('percentageB');
    const totalClicks_display = document.getElementById('totalClicks');
    const onlineUsers_display = document.getElementById('online-users');
    const votedMessage = document.getElementById('votedMessage');
    const resetButton = document.getElementById('resetButton');

    // Carichiamo i voti da localStorage o usiamo 0 se non esistono
    let clicksA = parseInt(localStorage.getItem('clicksA')) || 0;
    let clicksB = parseInt(localStorage.getItem('clicksB')) || 0;
    let totalClicks = clicksA + clicksB;

    // Funzione per gestire il click su un pulsante
    function handleVote(option) {
        if (option === 'A') {
            clicksA++;
        } else {
            clicksB++;
        }
        totalClicks++;
        
        // Salviamo il voto nella localStorage per renderlo persistente
        localStorage.setItem('clicksA', clicksA);
        localStorage.setItem('clicksB', clicksB);
        localStorage.setItem('hasVoted', 'true'); // Imposta il "flag" del voto

        updateDisplay();
        disableVoting();
    }
    
    // Funzione per aggiornare l'interfaccia
    function updateDisplay() {
        const percentA = (totalClicks > 0) ? (clicksA / totalClicks) * 100 : 0;
        const percentB = (totalClicks > 0) ? (clicksB / totalClicks) * 100 : 0;

        percentageA_display.textContent = `${percentA.toFixed(1)}%`;
        percentageB_display.textContent = `${percentB.toFixed(1)}%`;
        totalClicks_display.textContent = `Totale voti: ${totalClicks}`;
    }

    // NUOVO: Funzione per disabilitare i pulsanti e mostrare il messaggio
    function disableVoting() {
        buttonA.disabled = true;
        buttonB.disabled = true;
        votedMessage.style.display = 'block'; // Mostra il messaggio "Grazie per aver votato"
    }

    // Aggiungiamo gli ascoltatori di eventi ai pulsanti
    buttonA.addEventListener('click', () => handleVote('A'));
    buttonB.addEventListener('click', () => handleVote('B'));

    // NUOVO: Logica per resettare il voto (permette di testare di nuovo)
    resetButton.addEventListener('click', () => {
        localStorage.clear(); // Pulisce tutta la localStorage per questo sito
        location.reload();    // Ricarica la pagina per applicare le modifiche
    });


    // --- INIZIO BLOCCO PRINCIPALE ---

    // 1. Aggiorna subito la visualizzazione con i dati salvati
    updateDisplay();

    // 2. Controlla se l'utente ha già votato in passato
    if (localStorage.getItem('hasVoted') === 'true') {
        disableVoting(); // Se sì, disabilita subito i pulsanti
    }

    // 3. Simula il contatore degli utenti online
    function simulateOnlineUsers() {
        // Genera un numero base e aggiungi una piccola variazione casuale
        const baseUsers = 130;
        const variation = Math.floor(Math.random() * 10) - 5; // Varia da -5 a +4
        onlineUsers_display.textContent = baseUsers + variation;
    }
    
    setInterval(simulateOnlineUsers, 2500); // Aggiorna il numero ogni 2.5 secondi
    simulateOnlineUsers(); // Chiama la funzione una volta all'inizio
</script>

</body>
</html>
