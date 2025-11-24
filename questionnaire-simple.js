class SimpleQuestionnaire {
    constructor() {
        this.questionnaire = document.getElementById('questionnaire');
        this.questionsForm = document.getElementById('questionsForm');
        this.hasSubmitted = false;
        this.submitCount = 0;
        
        console.log('🔍 Questionnaire element:', this.questionnaire);
        console.log('🔍 Questions form:', this.questionsForm);
        
        if (!this.questionnaire || !this.questionsForm) {
            console.error('❌ Elementi del questionario non trovati!');
            return;
        }
        
        this.initEvents();
    }
    
    initEvents() {
        this.questionsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        const input = document.querySelector('.question-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSubmit();
                }
            });
        }
    }
    
    handleSubmit() {
        const input = document.querySelector('.question-input');
        if (!input) return;
        
        const message = this.sanitizeInput(input.value);
        
        if (this.validateMessage(message)) {
            this.sendMessage(message);
            this.showSuccess();
            input.value = '';
            this.submitCount++;
        } else {
            this.showError('Per favore, scrivi almeno 2 caratteri');
        }
    }
    
    sanitizeInput(text) {
        if (!text) return '';
        return text.trim().replace(/[<>]/g, '').substring(0, 98);
    }
    
    validateMessage(message) {
        return message && message.length >= 2;
    }
    
    sendMessage(message) {
        // Assicurati che window.ws esista
        if (!window.ws || window.ws.readyState !== WebSocket.OPEN) {
            console.error('❌ WebSocket non disponibile');
            this.showError('Connessione non disponibile. Riprova.');
            return;
        }
        
        const data = {
            type: "spectator_message",
            message: message,
            timestamp: Date.now(),
            sessionId: this.generateSessionId(),
            submissionCount: this.submitCount
        };
        
        try {
            window.ws.send(JSON.stringify(data));
            console.log('📤 Messaggio spettatore inviato:', message);
        } catch (error) {
            console.error('❌ Errore nell\'invio del messaggio:', error);
            this.showError('Errore nell\'invio. Riprova.');
        }
    }
    
    generateSessionId() {
        try {
            let sessionId = localStorage.getItem('spectatorSessionId');
            if (!sessionId) {
                sessionId = 'spectator_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('spectatorSessionId', sessionId);
            }
            return sessionId;
        } catch (error) {
            console.warn('⚠️ localStorage non disponibile, uso sessionId temporaneo');
            return 'temp_' + Date.now();
        }
    }
    
    showSuccess() {
        this.showNotification('Messaggio inviato ✓', '#4CAF50');
    }
    
    showError(message) {
        this.showNotification(message, '#f44336');
    }
    
    showNotification(message, color) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 120px;
            left: 50%;
            transform: translateX(-50%);
            background: ${color};
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            z-index: 10001;
            font-size: 0.9em;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 80%;
            text-align: center;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Inizializzazione sicura
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.simpleQuestionnaire = new SimpleQuestionnaire();
        console.log('✅ SimpleQuestionnaire inizializzato con successo');
    } catch (error) {
        console.error('❌ Errore nell\'inizializzazione del questionario:', error);
    }
});
