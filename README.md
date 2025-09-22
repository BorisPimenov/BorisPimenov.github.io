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
        }

        .video-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
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
            display: flex;
            flex-direction: column;
            align-items: center;
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
        }

        .option-button:disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }

        .option-button:hover:not(:disabled) {
            background-color: var(--button-hover);
        }

        .option-button:active:not(:disabled) {
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

        .voted-message {
            color: #cf6679;
            font-weight: bold;
            margin-top: 10px;
            display: none;
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
        <div class="voted-message" id="voted-message">Hai già votato!</div>
    </div>
</div>

<script>
    const websocket = new WebSocket('ws://localhost:8080');

    let clicks = { option1: 0, option2: 0 };

    const option1Btn = document.querySelector('[data-option="1"]');
    const option2Btn = document.querySelector('[data-option="2"]');
    const percent1El = document.getElementById('percent-1');
    const percent2El = document.getElementById('percent-2');
    const totalClicksEl = document.getElementById('total-clicks');
    const votedMessageEl = document.getElementById('voted-message');
    const allButtons = document.querySelectorAll('.option-button');

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

    function checkAndDisableButtons() {
        const hasVoted = localStorage.getItem('hasVoted');
        if (hasVoted) {
            allButtons.forEach(button => button.disabled = true);
            votedMessageEl.style.display = 'block';
        }
    }

    allButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (localStorage.getItem('hasVoted')) {
                return;
            }

            const option = button.dataset.option;
            if (option === '1') {
                clicks.option1++;
            } else if (option === '2') {
                clicks.option2++;
            }
            updatePercentages();

            localStorage.setItem('hasVoted', 'true');
            checkAndDisableButtons();

            if (websocket.readyState === WebSocket.OPEN) {
                websocket.send(`VOTO_${option}`);
            }
        });
    });

    websocket.onmessage = (event) => {
        const message = event.data;
        try {
            const data = JSON.parse(message);
            if (data.type === 'update_counts') {
                clicks.option1 = data.option1;
                clicks.option2 = data.option2;
                updatePercentages();
            } else if (data.type === 'reset_poll') {
                localStorage.removeItem('hasVoted');
                clicks.option1 = 0;
                clicks.option2 = 0;
                updatePercentages();
                allButtons.forEach(button => button.disabled = false);
                votedMessageEl.style.display = 'none';
            }
        } catch (e) {
            console.log("Messaggio non JSON o sconosciuto:", message);
        }
    };

    websocket.onopen = () => {
        console.log('Connessione WebSocket stabilita con TouchDesigner.');
    };

    websocket.onclose = () => {
        console.log('Connessione WebSocket chiusa.');
    };

    websocket.onerror = (error) => {
        console.error('Errore WebSocket:', error);
    };

    document.addEventListener('DOMContentLoaded', checkAndDisableButtons);
</script>

</body>
</html>
