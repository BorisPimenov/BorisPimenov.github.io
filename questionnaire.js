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
            this.showError('Per favore, compila tutte le domande con risposte valide');
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
        sendToTouchDesigner(message);
        
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
        window.appState.questionnaireCompleted = true;
        
        // Mostra contenuto principale
        document.querySelector('.container').style.display = 'block';
        
        console.log('✅ Questionario completato');
    }
    
    hideQuestionnaire() {
        this.questionnaire.classList.add('hidden');
    }
    
    showQuestionnaire() {
        this.questionnaire.classList.remove('hidden');
        document.querySelector('.container').style.display = 'none';
    }
    
    showError(message) {
        alert(message); // Puoi sostituire con un modal più elegante
    }
    
    resetQuestionnaire() {
        this.questionsForm.reset();
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
});
