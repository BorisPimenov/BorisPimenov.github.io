<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sondaggio Interattivo con Live</title>
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

        .container {
            width: 100%;
            max-width: 900px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        /* NUOVO: Stile per il contenitore del video */
        .video-container {
            position: relative;
            width: 100%;
            padding-top: 56.25%; /* Per un rapporto 16:9 */
            background-color: #000;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid var(--border-color);
        }

        .video-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
        }

        .interaction-panel {
            background-color: var(--card-bg); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color); text-align: center;
        }
        .buttons-container {
            display: flex; flex-direction: row; justify-content: center; gap: 20px; margin-top: 15px;
        }
        .option-group {
            display: flex; flex-direction: column; align-items: center; min-width: 120px;
        }
        .option-button {
            padding: 15px 30px; font-size: 1.2rem; font-weight: bold; color: var(--text-color); background-color: var(--card-bg); border: 2px solid var(--accent-color); border-radius: 8px; cursor: pointer; transition: background-color 0.3s, transform 0.1s;
        }
        .option-button:disabled { cursor: not-allowed; opacity: 0.5; }
        .option-button:hover:not(:disabled) { background-color: var(--button-hover); }
        .percentage-display {
            margin-top: 10px; font-size: 1.3rem; font-weight: bold; color: var(--accent-color);
        }
        .total-clicks {
            margin-top: 10px; font-size: 0.9rem; color: #999;
        }
        
        .status-bar {
            position: absolute; top: 15px; right: 20px; display: flex; align-items: center; gap: 8px; background-color: var(--card-bg); padding: 8px 15px; border-radius: 20px; border: 1px solid var(--border-color); font-size: 0.9rem;
        }
        .online-dot {
            width: 10px; height: 10px; background-color: var(--success-color); border-radius: 50%;
        }
        .voted-message {
            color: var(--accent-color); font-weight: bold; margin-top: 15px; display: none;
        }
        .reset-button {
            margin-top: 20px; padding: 8px 16px; font-size: 0.8rem; color: #fff; background-color: var(--error-color); border: none; border-radius: 5px; cursor: pointer;
            display: none; /* Nascosto di default */
        }
    </style>
</head>
<body>

<div class="status-bar">
    <div class="online-dot"></div>
    <span id="visits-counter">...</span> visite totali
</div>

<div class="container">
    <div class="video-container">
        <iframe 
            src="https://www.youtube.com/embed/jfKfPfyJRdk" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    </div>

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
        <button class="reset-button" id="resetButton">Resetta tutti i voti (Admin)</button>
    </div>
</div>

<script>
    // Seleziona tutti gli elementi
    const buttonA = document.getElementById('buttonA');
    const buttonB = document.getElementById('buttonB');
    const percentageA_display = document.getElementById('percentageA');
    const percentageB_display = document.getElementById('percentageB');
    const totalClicks_display = document.getElementById('totalClicks');
    const visitsCounter_display = document.getElementById('visits-counter');
    const votedMessage = document.getElementById('votedMessage');
    const resetButton = document.getElementById('resetButton');

    // Carica i voti da localStorage o usa 0
    let clicksA = parseInt(localStorage.getItem('clicksA')) || 0;
    let clicksB = parseInt(localStorage.getItem('clicksB')) || 0;

    // Funzione per gestire un voto
    function handleVote(option) {
        if (localStorage.getItem('hasVoted') === 'true') return; // Non fare nulla se ha già votato

        if (option === 'A') clicksA++;
        else clicksB++;
        
        localStorage.setItem('clicksA', clicksA);
        localStorage.setItem('clicksB', clicksB);
        localStorage.setItem('hasVoted', 'true');

        updateDisplay();
        disableVoting();
    }
    
    // Funzione per aggiornare l'interfaccia
    function updateDisplay() {
        const totalVotes = clicksA + clicksB;
        const percentA = (totalVotes > 0) ? (clicksA / totalVotes) * 100 : 0;
        const percentB = (totalVotes > 0) ? (clicksB / totalVotes) * 100 : 0;

        percentageA_display.textContent = `${percentA.toFixed(1)}%`;
        percentageB_display.textContent = `${percentB.toFixed(1)}%`;
        totalClicks_display.textContent = `Totale voti: ${totalVotes}`;
    }

    function disableVoting() {
        buttonA.disabled = true;
        buttonB.disabled = true;
        votedMessage.style.display = 'block';
    }

    buttonA.addEventListener('click', () => handleVote('A'));
    buttonB.addEventListener('click', () => handleVote('B'));
    resetButton.addEventListener('click', () => {
        // Questa funzione ora resetta i voti globali, non solo il voto locale
        localStorage.clear();
        // NOTA: Per un reset reale dei voti di tutti, servirebbe un database.
        // Questo resetta solo il browser dell'admin, permettendogli di votare di nuovo.
        // Per simulare un reset totale, impostiamo i contatori a 0 e ricarichiamo.
        localStorage.setItem('clicksA', '0');
        localStorage.setItem('clicksB', '0');
        location.reload();
    });

    // --- LOGICA ESEGUITA AL CARICAMENTO DELLA PAGINA ---

    // 1. Controlla se l'utente è un admin tramite parametro URL
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === 'true';

    if (isAdmin) {
        resetButton.style.display = 'block'; // Mostra il pulsante di reset
    }

    // 2. Aggiorna la visualizzazione dei voti
    updateDisplay();

    // 3. Controlla se l'utente ha già votato
    if (localStorage.getItem('hasVoted') === 'true') {
        disableVoting();
    }

    // 4. NUOVO: Ottieni il numero di visite reali
    function getVisitorCount() {
        const namespace = 'il-mio-sito-sondaggio-123'; // Cambia questo per avere un contatore unico
        fetch(`https://api.countapi.xyz/hit/${namespace}/visits`)
            .then(res => res.json())
            .then(data => {
                visitsCounter_display.textContent = data.value;
            })
            .catch(error => {
                console.error("Errore nel recupero del contatore visite:", error);
                visitsCounter_display.textContent = 'N/A';
            });
    }
    
    getVisitorCount();

</script>

</body>
</html>
