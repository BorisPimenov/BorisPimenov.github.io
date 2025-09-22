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

        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: var(--bg-color);
        }

        .container {
            width: 100vw;
            height: 100vh;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
        }

        .video-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 1;
            background: #000;
        }

        .video-container iframe {
            width: 100%;
            height: 100%;
            border: none;
        }

        .interaction-panel {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            z-index: 2;
            background: rgba(30, 30, 30, 0.95);
            border-top: 1px solid var(--border-color);
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
            padding: 20px 0 10px 0;
            text-align: center;
        }

        .buttons-container {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-top: 10px;
        }

        .option-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 120px;
        }

        .option-button {
            padding: 15px 30px;
            font-size: 1.2rem;
            font-weight: bold;
            color: var(--text-color);
            background-color: var(--card-bg);
            border: 2px solid var(--accent-color);
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.1s;
            text-decoration: none;
        }

        .option-button:hover {
            background-color: var(--button-hover);
        }

        .option-button:active {
            transform: scale(0.98);
        }

        .percentage-display {
            margin-top: 10px;
            font-size: 1.3rem;
            font-weight: bold;
            color: var(--accent-color);
        }

        .total-clicks {
            margin-top: 15px;
            font-size: 0.9rem;
            color: #999;
        }

        .reset-button {
            display: none;
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
    </style>
</head>
<body>

<div class="container">
    <div class="video-container">
        <iframe
            src="https://www.youtube.com/embed/razZmhRchDQ?si=lG_VMosdokAauq-t&autoplay=1&mute=1"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
        </iframe>
    </div>

    <div class="interaction-panel">
        <h2>Vota l'Opzione</h2>
        <div class="buttons-container">
            <div class="option-group">
                <button class="option-button" data-option="1">Opzione 1</button>
                <div class="percentage-display" id="percent-1">0%</div>
            </div>
            <div class="option-group">
                <button class="option-button" data-option="2">Opzione 2</button>
                <div class="percentage-display" id="percent-2">0%</div>
            </div>
        </div>
        <div class="total-clicks" id="total-clicks">Voti totali: 0</div>
        <button class="reset-button" id="reset-button">Resetta Votazione</button>
    </div>
</div>

<script>
    // Inserisci qui l'URL del tuo server TouchDesigner
    const websocket = new WebSocket('ws://localhost:8080');

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
    const isAdmin = false; // Imposta su 'true' per mostrare il pulsante di reset

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

    // Event listener per i pulsanti di voto
    option1Btn.addEventListener('click', () => {
        clicks.option1++;
        updatePercentages();
        if (websocket.readyState === WebSocket.OPEN) {
            websocket.send('VOTO_1');
        }
    });

    option2Btn.addEventListener('click', () => {
        clicks.option2++;
        updatePercentages();
        if (websocket.readyState === WebSocket.OPEN) {
            websocket.send('VOTO_2');
        }
    });

    // Listener per il pulsante di reset (mostrato solo se isAdmin è true)
    if (isAdmin) {
        resetButton.style.display = 'inline-block';
        resetButton.addEventListener('click', () => {
            clicks.option1 = 0;
            clicks.option2 = 0;
            updatePercentages();
            if (websocket.readyState === WebSocket.OPEN) {
                websocket.send('RESET');
            }
        });
    }

    // Gestione della connessione WebSocket
    websocket.onopen = () => {
        console.log('Connessione WebSocket stabilita con TouchDesigner.');
    };

    websocket.onmessage = (event) => {
        console.log('Messaggio ricevuto da TouchDesigner:', event.data);
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
