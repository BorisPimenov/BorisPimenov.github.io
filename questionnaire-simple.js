class SimpleQuestionnaire {
    constructor() {
        this.questionnaire = document.getElementById('questionnaire');
        this.questionsForm = document.getElementById('questionsForm');
        this.hasSubmitted = false;
        this.submitCount = 0;
        
        // Aggiungi questi
        this.isFullscreen = false;
        this.setupFullscreenListeners();
        
        console.log('🔍 Questionnaire element:', this.questionnaire);
        console.log('🔍 Questions form:', this.questionsForm);
        
        if (!this.questionnaire || !this.questionsForm) {
            console.error('❌ Elementi del questionario non trovati!');
            return;
        }
        
        this.initEvents();
    }
    
    // Aggiungi questi metodi per gestire il fullscreen
    setupFullscreenListeners() {
        // Rileva cambiamenti fullscreen
        document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('mozfullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('MSFullscreenChange', this.handleFullscreenChange.bind(this));
        
        // Forza il ridisegno del questionario periodicamente in fullscreen
        this.fullscreenCheckInterval = setInterval(() => {
            if (this.isFullscreen) {
                this.forceQuestionnaireRedraw();
            }
        }, 1000);
    }
    
    handleFullscreenChange() {
        this.isFullscreen = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
        
        console.log(`🖥️ Modalità fullscreen: ${this.isFullscreen ? 'ATTIVA' : 'DISATTIVATA'}`);
        
        if (this.isFullscreen) {
            this.forceQuestionnaireVisibility();
        }
    }
    
    forceQuestionnaireVisibility() {
        if (!this.questionnaire) return;
        
        // Forza lo stile per garantire la visibilità
        this.questionnaire.style.cssText = `
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #000000 100%) !important;
            padding: 15px 0 !important;
            z-index: 2147483647 !important;
            visibility: visible !important;
            opacity: 1 !important;
            display: block !important;
            border-top: 1px solid rgba(255,255,255,0.1) !important;
        `;
        
        console.log('🔧 Visibilità questionario forzata in fullscreen');
    }
    
    forceQuestionnaireRedraw() {
        if (!this.questionnaire || !this.isFullscreen) return;
        
        // Trucco per forzare il ridisegno del browser
        this.questionnaire.style.display = 'none';
        void this.questionnaire.offsetHeight; // Trigger reflow
        this.questionnaire.style.display = 'block';
    }
    
    // Ricorda di pulire l'intervallo quando non serve più
    destroy() {
        if (this.fullscreenCheckInterval) {
            clearInterval(this.fullscreenCheckInterval);
        }
    }
    
    // ... il resto dei metodi rimane invariato ...
}

// Inizializzazione
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.simpleQuestionnaire = new SimpleQuestionnaire();
        console.log('✅ SimpleQuestionnaire inizializzato con supporto fullscreen');
    } catch (error) {
        console.error('❌ Errore nell\'inizializzazione del questionario:', error);
    }
});

// Pulisci quando la pagina viene chiusa
window.addEventListener('beforeunload', () => {
    if (window.simpleQuestionnaire && window.simpleQuestionnaire.destroy) {
        window.simpleQuestionnaire.destroy();
    }
});
