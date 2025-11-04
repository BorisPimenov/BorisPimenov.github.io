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
        // Usa event delegation ma previeni specificamente il comportamento del form
        document.addEventListener('click', (event) => {
            const handButton = event.target.closest('#handSignalButton');
            if (handButton) {
                console.log('🖱️ CLICK RILEVATO sul bottone mano!');
                event.preventDefault();
                event.stopImmediatePropagation();
                event.stopPropagation();
                this.handleHandSignal();
            }
        });
        
        // Anche per touch
        document.addEventListener('touchstart', (event) => {
            const handButton = event.target.closest('#handSignalButton');
            if (handButton) {
                console.log('👆 TOUCH RILEVATO sul bottone mano!');
                event.preventDefault();
                event.stopImmediatePropagation();
                event.stopPropagation();
                this.handleHandSignal();
            }
        });
        
        console.log('✅ Event listener configurato');
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

// Inizializzazione
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 DOMContentLoaded - Inizializzo HandSignalController');
    window.handSignalController = new HandSignalController();
});

window.addEventListener('load', () => {
    console.log('📄 Window loaded - Verifico HandSignalController');
    if (!window.handSignalController) {
        window.handSignalController = new HandSignalController();
    }
});
