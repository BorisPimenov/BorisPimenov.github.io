<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Poll Interface</title>
   
<style>
    html, body {
        height: 100%;
        margin: 0;
        padding: 0;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        background-color: var(--bg-color);
    }

    .container {
        width: 100vw;
        height: 100vh;
        position: relative;
        padding: 0;
        margin: 0;
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
        width: 100vw;
        height: 100vh;
        border: none;
    }

    .interaction-panel {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100vw;
        z-index: 2;
        background: rgba(30,30,30,0.95);
        border-top: 1px solid var(--border-color);
        border-radius: 0;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
        padding: 20px 0 10px 0;
        text-align: center;
    }

    .buttons-container {
        display: flex;
        justify-content: center;
        gap: 40px;
        margin-top: 10px;
    }

    .option-button {
        min-width: 120px;
        font-size: 1.2rem;
    }

    .percentage-display {
        font-size: 1.3rem;
    }

    .reset-button {
        display: none; /* Nascondi il pulsante di reset */
    }
</style>

<iframe width="1920" 
    height="1080"
    src="https://www.youtube.com/embed/razZmhRchDQ?si=lG_VMosdokAauq-t" 
    title="YouTube video player" 
    frameborder="0"
    allow="accelerometer; 
    autoplay;
    clipboard-write; 
    encrypted-media;
    gyroscope; 
    picture-in-picture; 
    web-share" 
    referrerpolicy="strict-origin-when-cross-origin" 
    allowfullscreen>
    
    </iframe>

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
    // ...existing code...

    // Mostra il pulsante di reset solo se sei admin
    const isAdmin = false; // Cambia in true solo per te
    if (isAdmin) {
        resetButton.style.display = 'inline-block';
    }

    // Listener per il pulsante di reset (solo admin)
    resetButton.addEventListener('click', () => {
        if (!isAdmin) return;
        clicks.option1 = 0;
        clicks.option2 = 0;
        updatePercentages();
        if (websocket.readyState === WebSocket.OPEN) {
            websocket.send('RESET');
        }
    });

    // ...existing code...
</script>
