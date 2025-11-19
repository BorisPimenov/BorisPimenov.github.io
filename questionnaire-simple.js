class SimpleQuestionnaire {
    constructor() {
        this.questionnaire = document.getElementById('questionnaire');
        this.questionsForm = document.getElementById('questionsForm');
        this.hasSubmitted = false;
        this.submitCount = 0;
        
        // SOLUZIONE FULLSCREEN - Sposta il questionario nel body
        this.moveQuestionnaireToBody();
        
        console.log('🔍 Questionnaire element:', this.questionnaire);
        
        if (!this.questionnaire || !this.questionsForm) {
            console.error('❌ Elementi del questionario non trovati!');
            return;
        }
        
        this.setupFullscreenSolution();
        this.initEvents();
    }
    
    // SOLUZIONE CRITICA: Sposta il questionario come figlio diretto del body
    moveQuestionnaireToBody() {
        if (this.questionnaire && this.questionnaire.parentNode !== document.body) {
            document.body.appendChild(this.questionnaire);
            console.log('🔧 Questionario spostato come figlio diretto del body');
        }
    }
    
    // Nuovo approccio per il fullscreen
    setupFullscreenSolution() {
        // Forza lo stile iniziale
        this.applyFullscreenStyles();
        
        // Monitora i cambiamenti fullscreen
        document.addEventListener('fullscreenchange', this.handleFullscreen.bind(this));
        document.addEventListener('webkitfullscreenchange', this.handleFullscreen.bind(this));
        document.addEventListener('mozfullscreenchange', this.handleFullscreen.bind(this));
        
        // Monitora anche il resize per catturare i cambiamenti
        window.addEventListener('resize', this.handleFullscreen.bind(this));
        
        // Check periodico di sicurezza
        this.safetyCheckInterval = setInterval(() => {
            this.ensureQuestionnaireVisibility();
        }, 2000);
    }
    
    handleFullscreen() {
        const isFullscreen = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
        
        console.log(`🖥️ Fullscreen: ${isFullscreen ? 'ON' : 'OFF'}`);
        this.applyFullscreenStyles();
        
        // Force reflow e visibilità
        setTimeout(() => {
            this.ensureQuestionnaireVisibility();
        }, 100);
    }
    
    applyFullscreenStyles() {
        if (!this.questionnaire) return;
        
        // STILI UNIVERSALI per garantire la visibilità
        this.questionnaire.style.cssText = `
            position: fixed !important;
            bottom: 20px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%) !important;
            padding: 20px !important;
            z-index: 2147483647 !important;
            font-family: 'Poppins', sans-serif !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
            border-radius: 15px !important;
            box-sizing: border-box !important;
            backdrop-filter: blur(10px) !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
            width: auto !important;
            max-width: 500px !important;
            min-width: 300px !important;
            visibility: visible !important;
            opacity: 1 !important;
            display: block !important;
        `;
    }
    
    ensureQuestionnaireVisibility() {
        if (!this.questionnaire) return;
        
        // Controlla se è visibile
        const rect = this.questionnaire.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0 && 
                         this.questionnaire.style.visibility !== 'hidden' && 
                         this.questionnaire.style.display !== 'none';
        
        if (!isVisible) {
            console.warn('⚠️ Questionario non visibile, riapplicando stili...');
            this.applyFullscreenStyles();
            
            // Ultima risorsa: ricrea l'elemento
            setTimeout(() => {
                if (!this.isElementVisible(this.questionnaire)) {
                    this.recreateQuestionnaire();
                }
            }, 500);
        }
    }
    
    isElementVisible(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return !(rect.width === 0 && rect.height === 0);
    }
    
    recreateQuestionnaire() {
        console.log('🔄 Ricreazione del questionario...');
        
        const originalHTML = this.questionnaire.outerHTML;
        const parent = this.questionnaire.parentNode;
        
        // Rimuovi e ricrea
        parent.removeChild(this.questionnaire);
        
        // Crea un nuovo elemento
        const newQuestionnaire = document.createElement('div');
        newQuestionnaire.innerHTML = originalHTML;
        newQuestionnaire.id = 'questionnaire';
        newQuestionnaire.className = 'questionnaire-overlay';
        
        parent.appendChild(newQuestionnaire);
        
        // Aggiorna i riferimenti
        this.questionnaire = newQuestionnaire;
        this.questionsForm = document.getElementById('questionsForm');
        
        // Re-inizializza gli eventi
        this.initEvents();
        this.applyFullscreenStyles();
    }
    
    initEvents() {
        if (!this.questionsForm) return;
        
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
    
    // ... il resto dei metodi handleSubmit, sendMessage, etc. rimane uguale ...
    
    destroy() {
        if (this.safetyCheckInterval) {
            clearInterval(this.safetyCheckInterval);
        }
    }
}

// Inizializzazione rinforzata
document.addEventListener('DOMContentLoaded', () => {
    // Piccolo delay per assicurarsi che tutto sia caricato
    setTimeout(() => {
        try {
            window.simpleQuestionnaire = new SimpleQuestionnaire();
            console.log('✅ SimpleQuestionnaire inizializzato con protezione fullscreen');
            
            // Doppio check dopo il loading completo
            setTimeout(() => {
                if (window.simpleQuestionnaire) {
                    window.simpleQuestionnaire.ensureQuestionnaireVisibility();
                }
            }, 1000);
            
        } catch (error) {
            console.error('❌ Errore critico nell\'inizializzazione:', error);
        }
    }, 100);
});

// Cleanup
window.addEventListener('beforeunload', () => {
    if (window.simpleQuestionnaire && window.simpleQuestionnaire.destroy) {
        window.simpleQuestionnaire.destroy();
    }
});
