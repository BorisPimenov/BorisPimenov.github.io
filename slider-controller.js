class SliderController {
    constructor() {
        this.sliders = [];
        this.initSliders();
    }
    
    initSliders() {
        // Configurazione slider
        const sliderConfig = [
            { id: 'slider1', index: 0, label: 'Colore Ambiente' },
            { id: 'slider2', index: 1, label: 'Attrai/Respingi' },
            { id: 'slider3', index: 2, label: 'Saturazione' },
            { id: 'slider4', index: 3, label: 'Tonalità' }
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
        
        sendToTouchDesigner(message);
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
});
