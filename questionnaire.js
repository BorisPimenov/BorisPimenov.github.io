class QuestionnaireManager {
    constructor() {
        this.questionnaire = document.getElementById('questionnaire');
        this.questionsForm = document.getElementById('questionsForm');
        this.hasSubmitted = false;
        
        this.initEvents();
    }
    
    initEvents() {
        this.questionsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }
    
    handleSubmit() {
        if (this.hasSubmitted) return;
        
        const formData = new FormData(this.questionsForm);
        const answers = {
            emotion: this.sanitizeInput(formData.get('emotion')),
            color: this.sanitizeInput(formData.get('color')),
            element: this.sanitizeInput(formData.get('element')),
            expectation: this.sanitizeInput(formData.get('expectation'))
        };
        
        if (this.validateAnswers(answers)) {
            this.sendAnswers(answers);
            this.completeQuestionnaire();
        } else {
            this.showError('Per favore, compila tutte le domande con risposte valide (almeno 2 caratteri)');
        }
    }
    
    sanitizeInput(text) {
        return text.trim().replace(/[<>]/g, '').substring(0, 50);
    }
    
    validateAnswers(answers) {
        return Object.values(answers).every(answer => 
            answer && answer.length >= 2 && answer.length <= 50
        );
    }
    
    sendAnswers(answers) {
        const message = {
            type: "questionnaire",
            answers: answers,
            timestamp: Date.now(),
            sessionId: this.generateSessionId()
        };
        
        // Usa la funzione utility globale
        if (window.sendToTouchDesigner) {
            sendToTouchDesigner(message);
        } else {
            console.log('Funzione sendToTouchDesigner non disponibile');
        }
        
        // Salva anche localmente per backup
        localStorage.setItem('userQuestionnaire', JSON.stringify(answers));
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    completeQuestionnaire() {
        this.hasSubmitted = true;
        this.hideQuestionnaire();
        
        // Segna come completato
        localStorage.setItem('questionnaireCompleted', 'true');
        if (window.appState) {
            window.appState.questionnaireCompleted = true;
        }
        
        // Mostra contenuto principale
        const container = document.querySelector('.container');
        const touchPanel = document.querySelector('.touch-panel');
        
        if (container) container.style.display = 'block';
        if (touchPanel) touchPanel.style.display = 'block';
        
        console.log('✅ Questionario completato e nascosto');
    }
    
    hideQuestionnaire() {
        if (this.questionnaire) {
            this.questionnaire.classList.add('hidden');
            console.log('🎭 Questionario nascosto');
        } else {
            console.error('❌ Elemento questionario non trovato');
        }
    }
    
    showQuestionnaire() {
        if (this.questionnaire) {
            this.questionnaire.classList.remove('hidden');
            const container = document.querySelector('.container');
            const touchPanel = document.querySelector('.touch-panel');
            if (container) container.style.display = 'none';
            if (touchPanel) touchPanel.style.display = 'none';
        }
    }
    
    showError(message) {
        // Creare un messaggio di errore più elegante
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            z-index: 10001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        // Rimuovi dopo 5 secondi
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    resetQuestionnaire() {
        if (this.questionsForm) {
            this.questionsForm.reset();
        }
        this.hasSubmitted = false;
        localStorage.removeItem('questionnaireCompleted');
        localStorage.removeItem('userQuestionnaire');
        this.showQuestionnaire();
    }
}

// Inizializza quando il DOM è pronto
let questionnaireManager;

document.addEventListener('DOMContentLoaded', () => {
    questionnaireManager = new QuestionnaireManager();
    console.log('✅ QuestionnaireManager inizializzato');
});

// Debug: rendi globale per testing
window.questionnaireManager = questionnaireManager;
