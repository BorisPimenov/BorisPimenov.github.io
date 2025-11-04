class HandSignalController {
    constructor() {
        console.log('🎯 HandSignalController inizializzato');
        this.signalCount = 0;
        this.isInitialized = false;
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        console.log('🔍 Cercando bottone mano...');
        this.setupButtonListener();
        this.isInitialized = true;
    }
    
    setupButtonListener() {
        // Usa event delegation sul document per essere sicuro
        document.addEventListener('click', (event) => {
            if (event.target && event.target.id === 'handSignalButton') {
                console.log('🖱️ CLICK RILEVATO tramite event delegation!');
                this.handleHandSignal();
                event.preventDefault();
                event.stopPropagation();
            }
        });
        
        // Anche per touch
        document.addEventListener('touchstart', (event) => {
            if (event.target && event.target.id === 'handSignalButton') {
                console.log('👆 TOUCH RILEVATO tramite event delegation!');
                this.handleHandSignal();
                event.preventDefault();
                event.stopPropagation();
            }
        });
        
        console.log('✅ Event delegation configurato');
    }
    
    handleHandSignal() {
        console.log('🔄 Gestione segnale mano...');
        
        if (!window.ws || window.ws.readyState !== WebSocket.OPEN) {
            console.log('❌ WebSocket non pronto');
            this.showButtonFeedback('❌ Non connesso', '#f44336');
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
        
        console.log('📤 Invio messaggio:', message);
        
        try {
            window.ws.send(JSON.stringify(message));
            console.log('✅ Segnale mano inviato con successo!');
            this.showButtonFeedback('✓ Inviato!', '#4CAF50');
            
        } catch (error) {
            console.error('❌ Errore invio:', error);
            this.showButtonFeedback('❌ Errore', '#f44336');
        }
    }
    
    showButtonFeedback(text, color) {
        const button = document.getElementById('handSignalButton');
        if (!button) return;
        
        const originalHTML = button.innerHTML;
        const originalBackground = button.style.background;
        
        button.style.background = color || originalBackground;
        button.innerHTML = text;
        button.disabled = true;
        
        setTimeout(() => {
            button.style.background = originalBackground;
            button.innerHTML = originalHTML;
            button.disabled = false;
        }, 1500);
    }
    
    getSessionId() {
        let sessionId = localStorage.getItem('userSessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userSessionId', sessionId);
        }
        return sessionId;
    }
}

// Inizializzazione RAPIDA e AGGGRESSIVA
console.log('🚀 Caricamento HandSignalController...');

// Method 1: DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 DOMContentLoaded - Inizializzo controller');
    window.handSignalController = new HandSignalController();
});

// Method 2: window.load
window.addEventListener('load', () => {
    console.log('📄 Window loaded - Verifico controller');
    if (!window.handSignalController) {
        window.handSignalController = new HandSignalController();
    }
});

// Method 3: Timeout di sicurezza
setTimeout(() => {
    console.log('⏰ Timeout sicurezza - Forzo inizializzazione');
    if (!window.handSignalController) {
        window.handSignalController = new HandSignalController();
    }
}, 2000);

// Method 4: Controllo continuo per bottone
setInterval(() => {
    const button = document.getElementById('handSignalButton');
    if (button && !window.handSignalController) {
        console.log('🔍 Bottone trovato in ritardo - Inizializzo');
        window.handSignalController = new HandSignalController();
    }
}, 1000);
