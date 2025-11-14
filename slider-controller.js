class SliderController {
    constructor() {
        this.sliders = [];
        this.initSliders();
    }
    
    initSliders() {
        // Configurazione COMPLETA per 7 slider
        const sliderConfig = [
            { id: 'slider1', index: 0, label: 'Colore Ambiente' },
            { id: 'slider2', index: 1, label: 'Attrai/Respingi' },
            { id: 'slider3', index: 2, label: 'Saturazione' },
            { id: 'slider4', index: 3, label: 'Tonalità' },
            { id: 'slider5', index: 4, label: 'Velocità Particelle' },
            { id: 'slider6', index: 5, label: 'Dimensione Particelle' },
            { id: 'slider7', index: 6, label: 'Forza Campo' }
        ];
        
        sliderConfig.forEach(config => {
            this.setupSlider(config);
        });
    }
    
    setupSlider(config) {
        const slider = document.getElementById(config.id);
        const valueDisplay = document.getElementById(config.id + 'Value');
        
        if (!slider || !valueDisplay) {
            console.warn(`Slider ${config.id} non trovato`);
            return;
        }
        
        // AGGIUNGI QUESTO: Inizializza il valore display
        valueDisplay.textContent = slider.value;
        
        slider.addEventListener('input', () => {
            valueDisplay.textContent = slider.value;
            this.sendSliderValue(config.index, parseFloat(slider.value));
        });
        
        this.sliders.push({
            id: config.id,
            index: config.index,
            element: slider,
            valueDisplay: valueDisplay
        });
    }
    
    sendSliderValue(index, value) {
        const normalizedValue = value / 100; // Normalizza a 0-1
        
        const message = {
            type: "slider",
            index: index,
            value: normalizedValue,
            timestamp: Date.now()
        };
        
        // USA LA CONNESSIONE WEBSOCKET ESISTENTE
        if (window.ws && window.ws.readyState === WebSocket.OPEN) {
            window.ws.send(JSON.stringify(message));
            console.log(`📤 Slider ${index} inviato:`, message);
        } else {
            console.log('⚠️ WebSocket non connesso, messaggio non inviato');
        }
    }
    
    getSliderValue(index) {
        const slider = this.sliders.find(s => s.index === index);
        return slider ? parseFloat(slider.element.value) : 0;
    }
    
    setSliderValue(index, value) {
        const slider = this.sliders.find(s => s.index === index);
        if (slider) {
            slider.element.value = value;
            slider.valueDisplay.textContent = value;
        }
    }
}

let sliderController;

document.addEventListener('DOMContentLoaded', () => {
    sliderController = new SliderController();
    // BOTTONE RESET PARAMETRI - VERSIONE ROBUSTA
function initResetButton() {
    console.log('🔄 Inizializzazione bottone reset...');
    
    // Aspetta che il DOM sia completamente caricato
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setupResetButton();
        });
    } else {
        setupResetButton();
    }
}

function setupResetButton() {
    console.log('🔍 Setup bottone reset...');
    
    // Prova a trovare il bottone
    let resetButton = document.getElementById('resetButton');
    
    // Se non lo trova immediatamente, aspetta un po'
    if (!resetButton) {
        console.log('⏳ Bottone non trovato, riprovo tra 1 secondo...');
        setTimeout(() => {
            resetButton = document.getElementById('resetButton');
            if (resetButton) {
                attachResetListener(resetButton);
            } else {
                console.error('❌ Bottone reset non trovato dopo attesa');
            }
        }, 1000);
        return;
    }
    
    attachResetListener(resetButton);
}

function attachResetListener(button) {
    console.log('✅ Collegamento event listener al bottone...');
    
    // Rimuovi eventuali listener precedenti
    button.replaceWith(button.cloneNode(true));
    const newButton = document.getElementById('resetButton');
    
    // Aggiungi il listener
    newButton.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('🔄 BOTTONE RESET CLICCATO!');
        console.log('Stato WebSocket:', window.ws ? window.ws.readyState : 'non definito');
        
        // Invia messaggio WebSocket
        if (window.ws && window.ws.readyState === WebSocket.OPEN) {
            const message = {
                type: "reset",
                button: "reset_parameters", 
                timestamp: Date.now(),
                message: "Reset parametri richiesto"
            };
            
            console.log('📤 Invio messaggio WebSocket:', message);
            window.ws.send(JSON.stringify(message));
            
            // Feedback visivo
            const originalText = this.textContent;
            this.textContent = '✅ Inviati!';
            this.style.background = '#2e7d32';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = '';
            }, 2000);
            
        } else {
            console.error('❌ WebSocket non connesso!');
            this.textContent = '❌ Non connesso';
            this.style.background = '#c62828';
            
            setTimeout(() => {
                this.textContent = 'Reset Parametri';
                this.style.background = '';
            }, 2000);
        }
    });
    
    console.log('✅ Bottone reset inizializzato correttamente');
}

// Avvia l'inizializzazione
initResetButton();
});
