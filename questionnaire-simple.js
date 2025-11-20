class SimpleQuestionnaire {
    constructor() {
        console.log('🔧 Inizializzazione SimpleQuestionnaire...');
        
        this.questionnaire = document.getElementById('questionnaire');
        this.questionsForm = document.getElementById('questionsForm');
        this.hasSubmitted = false;
        this.submitCount = 0;
        
        console.log('📋 Elementi DOM trovati:', {
            questionnaire: this.questionnaire,
            questionsForm: this.questionsForm
        });
        
        if (!this.questionnaire) {
            console.error('❌ Elemento #questionnaire non trovato!');
            return;
        }
        
        if (!this.questionsForm) {
            console.error('❌ Elemento #questionsForm non trovato!');
            return;
        }
        
        this.initEvents();
        console.log('✅ SimpleQuestionnaire inizializzato correttamente');
    }
    
    initEvents() {
        console.log('🎯 Inizializzazione event listeners...');
        
        // Event listener per il form submit
        this.questionsForm.addEventListener('submit', (e) => {
            console.log('🔄 Evento submit catturato');
            e.preventDefault();
            this.handleSubmit();
        });

        // Event listener per il tasto Invio
        const input = document.querySelector('.question-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                console.log('⌨️ Tasto premuto:', e.key);
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    console.log('✅ Invio con Enter catturato');
                    this.handleSubmit();
                }
            });
            
            input.addEventListener('input', () => {
                console.log('📝 Input cambiato:', input.value);
            });
        } else {
            console.error('❌ Input .question-input non trovato');
        }
        
        // Event listener per il click sul bottone
        const submitButton = document.querySelector('.submit-arrow');
        if (submitButton) {
            submitButton.addEventListener('click', (e) => {
                console.log('🖱️ Click sul bottone catturato');
                e.preventDefault();
                this.handleSubmit();
            });
        } else {
            console.error('❌ Bottone .submit-arrow non trovato');
        }
        
        console.log('✅ Event listeners configurati');
    }
    
    handleSubmit() {
        console.log('🚀 HandleSubmit chiamato');
        
        const input = document.querySelector('.question-input');
        if (!input) {
            console.error('❌ Input non trovato in handleSubmit');
            return;
        }
        
        const message = this.sanitizeInput(input.value);
        console.log('📨 Messaggio da inviare:', message);
        
        if (this.validateMessage(message)) {
            console.log('✅ Validazione superata');
            this.sendMessage(message);
            this.showSuccess();
            input.value = '';
            this.submitCount++;
            console.log('📊 Conteggio invii:', this.submitCount);
        } else {
            console.log('❌ Validazione fallita');
            this.showError('Per favore, scrivi almeno 2 caratteri');
        }
    }
    
    sanitizeInput(text) {
        if (!text) return '';
        const sanitized = text.trim().replace(/[<>]/g, '').substring(0, 500);
        console.log('🧹 Testo sanificato:', sanitized);
        return sanitized;
    }
    
    validateMessage(message) {
        const isValid = message && message.length >= 2;
        console.log('✓ Validazione messaggio:', { message, length: message?.length, isValid });
        return isValid;
    }
    
    sendMessage(message) {
        console.log('📤 Invio messaggio via WebSocket...');
        
        // Verifica che il WebSocket esista e sia connesso
        if (!window.ws) {
            console.error('❌ WebSocket non definito (window.ws non esiste)');
            this.showError('Connessione non inizializzata');
            return;
        }
        
        console.log('🔌 Stato WebSocket:', {
            readyState: window.ws.readyState,
            readyStateText: this.getWebSocketStateText(window.ws.readyState)
        });
        
        if (window.ws.readyState !== WebSocket.OPEN) {
            console.error('❌ WebSocket non connesso');
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
        
        console.log('📦 Dati da inviare:', data);
        
        try {
            window.ws.send(JSON.stringify(data));
            console.log('✅ Messaggio inviato con successo');
        } catch (error) {
            console.error('❌ Errore nell\'invio del messaggio:', error);
            this.showError('Errore nell\'invio. Riprova.');
        }
    }
    
    getWebSocketStateText(state) {
        const states = {
            0: 'CONNECTING',
            1: 'OPEN',
            2: 'CLOSING',
            3: 'CLOSED'
        };
        return states[state] || 'UNKNOWN';
    }
    
    generateSessionId() {
        try {
            let sessionId = localStorage.getItem('spectatorSessionId');
            if (!sessionId) {
                sessionId = 'spectator_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('spectatorSessionId', sessionId);
                console.log('🆕 Nuovo sessionId creato:', sessionId);
            } else {
                console.log('🆔 SessionId esistente:', sessionId);
            }
            return sessionId;
        } catch (error) {
            console.warn('⚠️ localStorage non disponibile, uso sessionId temporaneo');
            return 'temp_' + Date.now();
        }
    }
    
    showSuccess() {
        console.log('✅ Mostro messaggio di successo');
        this.showNotification('Messaggio inviato ✓', '#4CAF50');
    }
    
    showError(message) {
        console.log('❌ Mostro messaggio di errore:', message);
        this.showNotification(message, '#f44336');
    }
    
    showNotification(message, color) {
        console.log('💬 Creazione notifica:', message);
        
        // Rimuovi notifiche precedenti
        const existingNotifications = document.querySelectorAll('.questionnaire-notification');
        existingNotifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        
        const notification = document.createElement('div');
        notification.className = 'questionnaire-notification';
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
        
        console.log('📢 Notifica visualizzata');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
                console.log('🗑️ Notifica rimossa');
            }
        }, 3000);
    }
}

// Inizializzazione con controllo errori
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM caricato, inizializzo SimpleQuestionnaire...');
    
    // Piccolo delay per assicurarsi che tutti gli elementi siano pronti
    setTimeout(() => {
        try {
            window.simpleQuestionnaire = new SimpleQuestionnaire();
            console.log('🎉 SimpleQuestionnaire inizializzato con successo');
            
            // Test: verifica che gli event listener funzionino
            console.log('🧪 Test inizializzazione completato');
            
        } catch (error) {
            console.error('💥 Errore critico nell\'inizializzazione:', error);
        }
    }, 100);
});

// Rendi disponibile globalmente per debug
window.SimpleQuestionnaire = SimpleQuestionnaire;
