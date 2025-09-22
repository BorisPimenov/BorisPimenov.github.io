<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Poll Interface</title>
    <style>
        :root {
            --bg-color: #121212;
            --card-bg: #1e1e1e;
            --text-color: #e0e0e0;
            --accent-color: #bb86fc;
            --button-hover: #373737;
            --border-color: #333333;
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
        }

        .container {
            width: 100%;
            max-width: 900px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .video-container {
            position: relative;
            width: 100%;
            padding-top: 56.25%; /* Rapporto 16:9 */
            background-color: #000;
            border-radius: 8px;
            overflow: hidden;
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
            background-color: var(--card-bg);
            padding: 20px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            text-align: center;
        }

        .buttons-container {
            display: flex;
            justify-content: space-around;
            gap: 20px;
            margin-top: 15px;
        }

        .option-button {
            flex: 1;
            padding: 15px 10px;
            font-size: 1rem;
            font-weight: bold;
            color: var(--text-color);
            background-color: var(--card-bg);
            border: 2px solid var(--accent-color);
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.1s;
        }

        .option-button:hover {
            background-color: var(--button-hover);
        }

        .option-button:active {
            transform: scale(0.98);
        }

        .percentage-display {
            margin-top: 10px;
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--accent-color);
        }

        .reset-button {
            margin-top: 20px;
            padding: 10px 20px;
            font-size: 0.9rem;
            font-weight: bold;
            color: #fff;
            background-color: #cf6679;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .reset-button:hover {
            background-color: #a63f53;
        }

        .total-clicks {
            margin-top: 15px;
            font-size: 0.9rem;
            color: #999;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="video-container">
        <iframe
            src="URL_DEL_TUO_STREAM_OBS"
            allow="autoplay; encrypted-media"
            allowfullscreen
        ></iframe>
    </div>

    <div class="interaction-panel">
        <h2>Vota l'Opzione</h2>
        <div class="buttons-container">
            <div>
                <button class="option-button" data-option="1">Opzione 1</button>
                <div class="percentage-display" id="percent-1">0%</div>
            </div>
            <div>
                <button class="option-button" data-option="2">Opzione 2</button>
                <div class="percentage-display" id="percent-2">0%</div>
            </div>
        </div>
        <div class="total-clicks" id="total-clicks">Voti totali: 0</div>
        <button class="reset-button" id="reset-button">Resetta Votazione</button>
    </div>
</div>

<script>
    // Configurazione WebSockets
    const websocket = new WebSocket('ws://localhost:8080'); // Sostituisci con l'URL del tuo server TouchDesigner

    let clicks = {
        option1: 0,
        option2: 0
    };

    const option1Btn = document.querySelector('[data-option="1"]');
    const option2Btn = document.querySelector('[data-option="2"]');
    const percent1El = document.getElementById('percent-1');
    const percent2El = document.getElementById('percent-2');
    const totalClicksEl = document.getElementById('total-clicks');
    const resetButton = document.getElementById('reset-button');

    // Funzione per aggiornare la visualizzazione delle percentuali
    function updatePercentages() {
        const total = clicks.option1 + clicks.option2;
        if (total === 0) {
            percent1El.textContent = '0%';
            percent2El.textContent = '0%';
        } else {
            const percent1 = ((clicks.option1 / total) * 100).toFixed(0);
            const percent2 = ((clicks.option2 / total) * 100).toFixed(0);
            percent1El.textContent = `${percent1}%`;
            percent2El.textContent = `${percent2}%`;
        }
        totalClicksEl.textContent = `Voti totali: ${total}`;
    }

    // Listener per i click sui bottoni
    option1Btn.addEventListener('click', () => {
        clicks.option1++;
        updatePercentages();
        // Invia il comando a TouchDesigner tramite WebSocket
        if (websocket.readyState === WebSocket.OPEN) {
            websocket.send('VOTO_1');
        }
    });

    option2Btn.addEventListener('click', () => {
        clicks.option2++;
        updatePercentages();
        // Invia il comando a TouchDesigner tramite WebSocket
        if (websocket.readyState === WebSocket.OPEN) {
            websocket.send('VOTO_2');
        }
    });

    // Listener per il pulsante di reset
    resetButton.addEventListener('click', () => {
        clicks.option1 = 0;
        clicks.option2 = 0;
        updatePercentages();
        // Invia il comando di reset a TouchDesigner
        if (websocket.readyState === WebSocket.OPEN) {
            websocket.send('RESET');
        }
    });

    // Gestione della connessione WebSocket
    websocket.onopen = () => {
        console.log('Connessione WebSocket stabilita con TouchDesigner.');
    };

    websocket.onmessage = (event) => {
        // Opzionale: gestire messaggi in arrivo da TouchDesigner (es. per aggiornare i dati da remoto)
        const message = event.data;
        console.log('Messaggio ricevuto da TouchDesigner:', message);
        // Esempio: se TouchDesigner invia "RESET", puoi resettare anche qui
        if (message === 'RESET_POLL') {
            clicks.option1 = 0;
            clicks.option2 = 0;
            updatePercentages();
        }
    };

    websocket.onclose = () => {
        console.log('Connessione WebSocket chiusa.');
    };

    websocket.onerror = (error) => {
        console.error('Errore WebSocket:', error);
    };

</script>

</body>
</html>
