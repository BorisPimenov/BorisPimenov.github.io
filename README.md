<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sondaggio Interattivo</title>
    <style>
        /* CSS Fornito dall'utente + variabili di base */
        :root {
            --bg-color: #121212;
            --text-color: #e0e0e0;
            --card-bg: #1e1e1e;
            --border-color: #333;
            --accent-color: #03dac6;
            --button-hover: #2a2a2a;
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

        .interaction-panel {
            background-color: var(--card-bg);
            padding: 20px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            text-align: center;
        }

        .buttons-container {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 15px;
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
            /* Aggiunta transizione per un effetto più fluido */
            transition: all 0.3s ease;
        }

        .total-clicks {
            margin-top: 10px;
            font-size: 0.9rem;
            color: #999;
        }
    </style>
</head>
<body>

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
    </div>
</div>

<script>
    // 1. Selezioniamo gli elementi HTML con cui interagire
    const buttonA = document.getElementById('buttonA');
    const buttonB = document.getElementById('buttonB');
    const percentageA_display = document.getElementById('percentageA');
    const percentageB_display = document.getElementById('percentageB');
    const totalClicks_display = document.getElementById('totalClicks');

    // 2. Inizializziamo le variabili per tenere traccia dei voti
    let clicksA = 0;
    let clicksB = 0;
    let totalClicks = 0;

    // 3. Aggiungiamo gli "ascoltatori di eventi" ai pulsanti
    buttonA.addEventListener('click', () => {
        // Quando il pulsante A viene cliccato:
        clicksA++; // Incrementa il contatore per A
        totalClicks++; // Incrementa il contatore totale
        updateDisplay(); // Chiama la funzione per aggiornare la visualizzazione
    });

    buttonB.addEventListener('click', () => {
        // Quando il pulsante B viene cliccato:
        clicksB++; // Incrementa il contatore per B
        totalClicks++; // Incrementa il contatore totale
        updateDisplay(); // Chiama la funzione per aggiornare la visualizzazione
    });

    // 4. Creiamo la funzione che aggiorna l'interfaccia
    function updateDisplay() {
        let percentA = 0;
        let percentB = 0;

        // Calcoliamo le percentuali solo se ci sono voti, per evitare divisione per zero
        if (totalClicks > 0) {
            percentA = (clicksA / totalClicks) * 100;
            percentB = (clicksB / totalClicks) * 100;
        }

        // Aggiorniamo il testo degli elementi HTML
        // .toFixed(1) limita il numero a una cifra decimale (es. 33.3%)
        percentageA_display.textContent = `${percentA.toFixed(1)}%`;
        percentageB_display.textContent = `${percentB.toFixed(1)}%`;
        totalClicks_display.textContent = `Totale voti: ${totalClicks}`;
    }
</script>

</body>
</html>
