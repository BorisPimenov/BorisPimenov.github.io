class SliderController {
    constructor() {
        this.sliders = [];
        this.slidersEnabled = true;
        this.individualSliderStates = {};
        
        // Configurazione moltiplicatori
        this.sliderMultipliers = {
            0: 10,  // Posizione Luce: ×10
            1: 1,   // Ricordi: ×1
            2: 1,   // Posizione Sfera: ×1
            3: 1,   // Contrai_Separa: ×1
            4: 1,   // Rosso (R): ×1
            5: 1,   // Verde (G): ×1
            6: 1    // Blu (B): ×1
        };
        
        this.initSliders();
        this.setupWebSocketListener();
        this.addResetButton(); // Aggiunto il pulsante di reset
        console.log('🎛️ SliderController inizializzato con nuovo server');
    }
    
    initSliders() {
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
        
        valueDisplay.textContent = slider.value;
        
        const eventListener = () => {
            if (!this.isSliderEnabled(config.index)) {
                this.revertSliderValue(slider, config.index);
                this.showBlockedFeedback(slider);
                return;
            }
            
            valueDisplay.textContent = slider.value;
            this.sendSliderValue(config.index, parseFloat(slider.value));
        };
        
        slider.addEventListener('input', eventListener);
        
        this.sliders.push({
            id: config.id,
            index: config.index,
            element: slider,
            valueDisplay: valueDisplay,
            eventListener: eventListener,
            lastValue: slider.value
        });
    }
    
    revertSliderValue(sliderElement, sliderIndex) {
        const slider = this.sliders.find(s => s.index === sliderIndex);
        if (slider) {
            sliderElement.value = slider.lastValue;
            slider.valueDisplay.textContent = slider.lastValue;
        }
    }
    
    showBlockedFeedback(sliderElement) {
        const originalStyle = sliderElement.style.cssText;
        sliderElement.style.background = '#ff4757';
        sliderElement.style.transform = 'scale(0.98)';
        
        setTimeout(() => {
            sliderElement.style.cssText = originalStyle;
        }, 300);
    }
    
    isSliderEnabled(index) {
        return this.slidersEnabled && this.individualSliderStates[index];
    }
    
    updateSlidersBehavior() {
        this.sliders.forEach(slider => {
            const isEnabled = this.isSliderEnabled(slider.index);
            
            if (isEnabled) {
                slider.element.style.opacity = '1';
                slider.element.style.cursor = 'pointer';
                slider.element.style.pointerEvents = 'auto';
                if (slider.element.parentElement) {
                    slider.element.parentElement.style.opacity = '1';
                }
            } else {
                slider.element.style.opacity = '0.4';
                slider.element.style.cursor = 'not-allowed';
                slider.element.style.pointerEvents = 'none';
                if (slider.element.parentElement) {
                    slider.element.parentElement.style.opacity = '0.6';
                }
            }
        });
    }
    
    setSlidersEnabled(enabled) {
        this.slidersEnabled = enabled;
        console.log(`🎛️ Slider ${enabled ? 'abilitati' : 'disabilitati'} globalmente`);
        this.updateSlidersBehavior();
        this.showGlobalStatusNotification(enabled);
    }
    
    setSliderEnabled(sliderIndex, enabled) {
        this.individualSliderStates[sliderIndex] = enabled;
        console.log(`🎛️ Slider ${sliderIndex} ${enabled ? 'abilitato' : 'disabilitato'}`);
        this.updateSlidersBehavior();
    }
    
    // NUOVO: Reset di tutti gli slider ai valori di default
    resetAllSliders() {
        console.log('🔄 Reset di tutti gli slider ai valori default');
        
        this.sliders.forEach(slider => {
            const defaultValue = 50; // Valore di default
            slider.element.value = defaultValue;
            slider.valueDisplay.textContent = defaultValue;
            slider.lastValue = defaultValue;
            
            // Invia il valore di reset al server
            this.sendSliderValue(slider.index, defaultValue);
        });
        
        this.showGlobalStatusNotification('reset');
    }
    
   
    showGlobalStatusNotification(status) {
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
        
        if (status === true) {
            notification.textContent = '✅ Slider abilitati';
            notification.style.background = '#2ed573';
        } else if (status === false) {
            notification.textContent = '❌ Slider disabilitati';
            notification.style.background = '#ff4757';
        } else if (status === 'reset') {
            notification.textContent = '🔄 Slider resettati';
            notification.style.background = '#3498db';
        }
        
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);
        
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
        let normalizedValue = value / 100;
        
        // Applica il moltiplicatore
        const multiplier = this.sliderMultipliers[index] || 1;
        normalizedValue = normalizedValue * multiplier;
        
        if (multiplier !== 1) {
            console.log(`🎛️ Slider ${index} - Valore moltiplicato per ${multiplier}: ${normalizedValue}`);
        }
        
        const slider = this.sliders.find(s => s.index === index);
        if (slider) {
            slider.lastValue = value;
        }
        
        const message = {
            type: "slider",
            index: index,
            value: normalizedValue,
            timestamp: Date.now()
        };
        
        if (window.ws && window.ws.readyState === WebSocket.OPEN) {
            window.ws.send(JSON.stringify(message));
            console.log(`📤 Slider ${index} inviato:`, normalizedValue);
        } else {
            console.log('⚠️ WebSocket non connesso, messaggio non inviato');
        }
    }
    
    setupWebSocketListener() {
        if (window.ws) {
            this.wsMessageHandler = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('📩 Messaggio ricevuto in SliderController:', data);
                    
                    if (data.type === 'slider_control') {
                        console.log('🎛️ Comando controllo slider:', data);
                        this.setSlidersEnabled(data.enabled);
                    } 
                    else if (data.type === 'slider_control_individual') {
                        console.log('🎛️ Comando controllo slider individuale:', data);
                        this.setSliderEnabled(data.sliderId, data.enabled);
                    }
                    else if (data.type === 'slider_reset') {
                        console.log('🔄 Comando reset slider ricevuto');
                        this.resetAllSliders();
                    }
                    else if (data.type === 'broadcast') {
                        console.log('📢 Broadcast:', data.message);
                        this.showBroadcastMessage(data.message);
                    }
                    
                } catch (e) {
                    console.error('Errore nel parsing del messaggio:', e);
                }
            };
            
            window.ws.addEventListener('message', this.wsMessageHandler);
        } else {
            console.error('WebSocket non trovato');
            setTimeout(() => this.setupWebSocketListener(), 1000);
        }
    }
    
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
        
        broadcastDiv.style.opacity = '0';
        broadcastDiv.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        setTimeout(() => {
            broadcastDiv.style.opacity = '1';
            broadcastDiv.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);
        
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
    
    // Metodi per debug
    enableAllSliders() {
        this.setSlidersEnabled(true);
    }
    
    disableAllSliders() {
        this.setSlidersEnabled(false);
    }
    
    resetSliders() {
        this.resetAllSliders();
    }
    
    setSliderMultiplier(sliderIndex, multiplier) {
        this.sliderMultipliers[sliderIndex] = multiplier;
        console.log(`🔧 Moltiplicatore slider ${sliderIndex} impostato a: ${multiplier}`);
    }
}

let sliderController;

document.addEventListener('DOMContentLoaded', () => {
    sliderController = new SliderController();
});

window.sliderController = sliderController;
