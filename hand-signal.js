// hand-signal.js
class HandSignalController {
    constructor() {
        this.handButton = document.getElementById('handSignalButton');
        this.isConnected = false;
        this.signalCount = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkWebSocketConnection();
    }
    
    setupEventListeners() {
        if (this.handButton) {
            this.handButton.addEventListener('click', () => {
                this.sendHandSignal();
            });
        }
        
        // Controlla lo stato della connessione WebSocket
        this.checkConnectionInterval = setInterval(() => {
            this.checkWebSocketConnection();
        }, 2000);
    }
    
    checkWebSocketConnection() {
        if (window.ws) {
            this.isConnected = window.ws.readyState === WebSocket.OPEN;
        } else {
            this.isConnected = false;
        }
        
        // Aggiorna lo stato del bottone
        if (this.handButton) {
            if (this.isConnected) {
                this.handButton.disabled = false;
                this.handButton.title = "Clicca per alzare la mano";
            } else {
                this.handButton.disabled = true;
                this.handButton.title = "In attesa di connessione...";
            }
        }
    }
    
    sendHandSignal() {
        if (!this.isConnected) {
            console.log('⚠️ WebSocket non connesso, segnale mano non inviato');
            return;
        }
        
        this.signalCount++;
        
        const message = {
            type: "hand_signal",
            value: 1,
            count: this.signalCount,
            timestamp: Date.now(),
            sessionId: this.getSessionId()
        };
        
        try {
            window.ws.send(JSON.stringify(message));
            console.log('✋ Segnale mano inviato:', message);
            
            // Feedback visivo
            this.showButtonFeedback();
            
        } catch (error) {
            console.error('❌ Errore nell\'invio del segnale mano:', error);
        }
    }
    
    showButtonFeedback() {
        if (!this.handButton) return;
        
        // Animazione di feedback
        this.handButton.style.transform = 'scale(0.95)';
        this.handButton.innerHTML = '✋ Mano alzata!';
        
        setTimeout(() => {
            this.handButton.style.transform = '';
            this.handButton.innerHTML = '✋ Alza la mano';
        }, 500);
    }
    
    getSessionId() {
        return localStorage.getItem('userSessionId') || 'unknown_session';
    }
    
    // Reset contatore (opzionale)
    resetCounter() {
        this.signalCount = 0;
    }
}

// Inizializza quando il DOM è pronto
let handSignalController;

document.addEventListener('DOMContentLoaded', () => {
    handSignalController = new HandSignalController();
});

// Rendi globale per debug
window.handSignalController = handSignalController;
