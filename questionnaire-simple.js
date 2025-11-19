class SimpleQuestionnaire {
    constructor() {
        this.questionnaire = document.getElementById('questionnaire');
        this.questionsForm = document.getElementById('questionsForm');
        this.hasSubmitted = false;
        this.submitCount = 0;
        
        console.log('🔍 Questionnaire element:', this.questionnaire);
        console.log('🔍 Questions form:', this.questionsForm);
        
        if (!this.questionnaire) {
            console.error('❌ QUESTIONNAIRE ELEMENT NOT FOUND!');
            return;
        }
        
        if (!this.questionsForm) {
            console.error('❌ QUESTIONS FORM NOT FOUND!');
            return;
        }
        
        this.initEvents();
    }
    
    initEvents() {
        this.questionsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Enter per inviare
        const input = document.querySelector('.question-input');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSubmit();
            }
        });
    }
    
    handleSubmit() {
        const input = document.querySelector('.question-input');
        const message = this.sanitizeInput(input.value);
        
        if (this.validateMessage(message)) {
            this.sendMessage(message);
            this.showSuccess();
            input.value = ''; // Pulisci l'input
            this.submitCount++;
        } else {
            this.showError('Per favore, scrivi almeno 2 caratteri');
        }
    }
    
    sanitizeInput(text) {
        return text.trim().replace(/[<>]/g, '').substring(0, 500);
    }
    
    validateMessage(message) {
        return message && message.length >= 2;
    }
    
    sendMessage(message) {
        const data = {
            type: "spectator_message",
            message: message,
            timestamp: Date.now(),
            sessionId: this.generateSessionId(),
            submissionCount: this.submitCount
        };
        
        if (window.ws && window.ws.readyState === WebSocket.OPEN) {
            window.ws.send(JSON.stringify(data));
            console.log('📤 Messaggio spettatore inviato:', message);
        } else {
            console.log('⚠️ WebSocket non connesso, messaggio non inviato');
        }
    }
    
    generateSessionId() {
        let sessionId = localStorage.getItem('spectatorSessionId');
        if (!sessionId) {
            sessionId = 'spectator_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('spectatorSessionId', sessionId);
        }
        return sessionId;
    }
    
    showSuccess() {
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            position: fixed;
            bottom: 120px;
            left: 50%;
            transform: translateX(-50%);
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            z-index: 10001;
            font-size: 0.9em;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        `;
        successMsg.textContent = 'Messaggio inviato ✓';
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.parentNode.removeChild(successMsg);
            }
        }, 2000);
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            bottom: 120px;
            left: 50%;
            transform: translateX(-50%);
            background: #f44336;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            z-index: 10001;
            font-size: 0.9em;
            box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
}

// Inizializza quando il DOM è pronto
let simpleQuestionnaire;

document.addEventListener('DOMContentLoaded', () => {
    simpleQuestionnaire = new SimpleQuestionnaire();
    console.log('✅ SimpleQuestionnaire inizializzato');
});

window.simpleQuestionnaire = simpleQuestionnaire;
