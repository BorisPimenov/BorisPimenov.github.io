class SliderController {
    constructor() {
        this.sliders = [];
        this.slidersEnabled = true;
        this.individualSliderStates = {};
        this.initSliders();
        this.setupWebSocketListener();
    }
    
    initSliders() {
        // Configurazione slider
        const sliderConfig = [
            { id: 'slider1', index: 0, label: 'Posizione Luce' },
            { id: 'slider2', index: 1, label: 'Ricordi' },
            { id: 'slider3', index: 2, label: 'Posizione Sfera' },
            { id: 'slider4', index: 3, label: 'Contrai_Separa' },
            { id: 'slider5', index: 4, label: 'Rosso (R)' },
            { id: 'slider6', index: 5, label: 'Verde (G)' },
            { id: 'slider7', index: 6, label: 'Blu (B)' }
        ];
        
        sliderConfig.forEach(config => {
            this.setupSlider(config);
            // Inizializza tutti gli slider come abilitati
            this.individualSliderStates[config.index] = true;
        });
    }
    
    setupSlider(config) {
        const slider = document.getElementById(config.id);
        const valueDisplay = document.getElementById(config.id + 'Value');
        
        if (!slider || !valueDisplay) {
            console.warn(`Slider ${config.id} non trovato`);
            return;
        }
        
        // Inizializza il valore display
        valueDisplay.textContent = slider.value;
        
        // Memorizza la funzione di event listener per poterla rimuovere
        const eventListener = () => {
            if (!this.isSliderEnabled(config.index)) {
                // Blocca completamente l'input
                this.revertSliderValue(slider, config.index);
                return;
            }
            
            valueDisplay.textContent = slider.value;
            this.sendSliderValue(config.index, parseFloat(slider.value));
        };
        
        // Aggiungi l'event listener
        slider.addEventListener('input', eventListener);
        
        this.sliders.push({
            id: config.id,
            index: config.index,
            element: slider,
            valueDisplay: valueDisplay,
            eventListener: eventListener,
            lastValue: slider.value // Memorizza l'ultimo valore valido
        });
    }
    
    // Ripristina il valore precedente dello slider
    revertSliderValue(sliderElement, sliderIndex) {
        const slider = this.sliders.find(s => s.index === sliderIndex);
        if (slider) {
            sliderElement.value = slider.lastValue;
            slider.valueDisplay.textContent = slider.lastValue;
            
            // Feedback visivo di blocco
            this.showBlockedFeedback(sliderElement);
        }
    }
    
    // Feedback visivo quando lo slider è bloccato
    showBlockedFeedback(sliderElement) {
        const originalStyle = sliderElement.style.cssText;
        sliderElement.style.background = '#ff4757';
        sliderElement.style.transform = 'scale(0.98)';
        
        setTimeout(() => {
            sliderElement.style.cssText = originalStyle;
        }, 300);
    }
    
    // Verifica se uno slider specifico è abilitato
    isSliderEnabled(index) {
        return this.slidersEnabled && this.individualSliderStates[index];
    }
    
    // Aggiorna lo stile e il comportamento degli slider
    updateSlidersBehavior() {
        this.sliders.forEach(slider => {
            const isEnabled = this.isSliderEnabled(slider.index);
            
            if (isEnabled) {
                // Slider abilitato - stile normale
                slider.element.style.opacity = '1';
                slider.element.style.cursor = 'pointer';
                slider.element.style.pointerEvents = 'auto';
                slider.element.parentElement.style.opacity = '1';
            } else {
                // Slider disabilitato - stile bloccato
                slider.element.style.opacity = '0.4';
                slider.element.style.cursor = 'not-allowed';
                slider.element.style.pointerEvents = 'none';
                slider.element.parentElement.style.opacity = '0.6';
            }
        });
    }
    
    // Abilita/disabilita tutti gli slider
    setSlidersEnabled(enabled) {
        this.slidersEnabled = enabled;
        console.log(`🎚️ Slider ${enabled ? 'abilitati' : 'disabilitati'} globalmente`);
        this.updateSlidersBehavior();
        this.showGlobalStatusNotification(enabled);
    }
    
    // Abilita/disabilita uno slider specifico
    setSliderEnabled(sliderIndex, enabled) {
        this.individualSliderStates[sliderIndex] = enabled;
        console.log(`🎚️ Slider ${sliderIndex} ${enabled ? 'abilitato' : 'disabilitato'}`);
        this.updateSlidersBehavior();
    }
    
    // Mostra notifica globale dello stato
    showGlobalStatusNotification(enabled) {
        // Crea o aggiorna la notifica
        let notification = document.getElementById('sliderGlobalNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'sliderGlobalNotification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                padding: 15px 25px;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                font-size: 16px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(notification);
        }
        
        if (enabled) {
            notification.textContent = '✅ Slider abilitati';
            notification.style.background = '#2ed573';
        } else {
            notification.textContent = '❌ Slider disabilitati';
            notification.style.background = '#ff4757';
        }
        
        // Animazione di entrata
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);
        
        // Rimuovi la notifica dopo 3 secondi
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(-50%) translateY(-20px)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }
    
    sendSliderValue(index, value) {
        // Aggiorna l'ultimo valore valido
        const slider = this.sliders.find(s => s.index === index);
        if (slider) {
            slider.lastValue = value * 100; // Converti da 0-1 a 0-100
        }
        
        const message = {
            type: "slider",
            index: index,
            value: value,
            timestamp: Date.now()
        };
        
        // Usa la connessione WebSocket esistente
        if (window.ws && window.ws.readyState === WebSocket.OPEN) {
            window.ws.send(JSON.stringify(message));
            console.log(`📤 Slider ${index} inviato:`, value);
        } else {
            console.log('⚠️ WebSocket non connesso, messaggio non inviato');
        }
    }
    
    // Configura l'ascolto dei messaggi WebSocket per il controllo
    setupWebSocketListener() {
        if (window.ws) {
            // Rimuovi eventuali listener precedenti
            window.ws.removeEventListener('message', this.wsMessageHandler);
            
            // Aggiungi nuovo listener
            this.wsMessageHandler = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    // Gestione comandi di controllo slider
                    if (data.type === 'slider_control') {
                        console.log('🎛️ Ricevuto comando controllo slider:', data);
                        this.setSlidersEnabled(data.enabled);
                    } 
                    else if (data.type === 'slider_control_individual') {
                        console.log('🎛️ Ricevuto comando controllo slider individuale:', data);
                        this.setSliderEnabled(data.sliderId, data.enabled);
                    }
                    // Gestione messaggi broadcast
                    else if (data.type === 'broadcast') {
                        console.log('📢 Ricevuto messaggio broadcast:', data.message);
                        this.showBroadcastMessage(data.message);
                    }
                    
                } catch (e) {
                    console.error('Errore nel parsing del messaggio di controllo:', e);
                }
            };
            
            window.ws.addEventListener('message', this.wsMessageHandler);
        } else {
            console.error('WebSocket non trovato per SliderController');
            // Riprova dopo un po'
            setTimeout(() => this.setupWebSocketListener(), 1000);
        }
    }
    
    // Mostra messaggi broadcast
    showBroadcastMessage(message) {
        const broadcastDiv = document.createElement('div');
        broadcastDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(52, 152, 219, 0.95);
            color: white;
            padding: 25px 35px;
            border-radius: 12px;
            font-size: 1.3em;
            font-weight: bold;
            text-align: center;
            z-index: 10001;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            max-width: 80%;
            word-wrap: break-word;
            border: 3px solid white;
        `;
        broadcastDiv.innerHTML = `📢 <br>${message}`;
        
        document.body.appendChild(broadcastDiv);
        
        // Animazione di entrata
        broadcastDiv.style.opacity = '0';
        broadcastDiv.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        setTimeout(() => {
            broadcastDiv.style.opacity = '1';
            broadcastDiv.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);
        
        // Rimuovi dopo 5 secondi
        setTimeout(() => {
            broadcastDiv.style.opacity = '0';
            broadcastDiv.style.transform = 'translate(-50%, -50%) scale(0.8)';
            setTimeout(() => {
                if (broadcastDiv.parentNode) {
                    broadcastDiv.parentNode.removeChild(broadcastDiv);
                }
            }, 300);
        }, 5000);
    }
    
    // Metodi per controllo manuale (utili per debug)
    enableAllSliders() {
        this.setSlidersEnabled(true);
    }
    
    disableAllSliders() {
        this.setSlidersEnabled(false);
    }
    
    enableSlider(index) {
        this.setSliderEnabled(index, true);
    }
    
    disableSlider(index) {
        this.setSliderEnabled(index, false);
    }
}

let sliderController;

document.addEventListener('DOMContentLoaded', () => {
    sliderController = new SliderController();
});

// Rendi globale per accesso da console
window.sliderController = sliderController;
