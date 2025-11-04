class PanelController {
    constructor() {
        this.panel = document.getElementById('parametersPanel');
        this.toggleButton = document.getElementById('togglePanel');
        this.panelHeader = document.getElementById('panelHeader');
        this.minimizeBtn = document.getElementById('minimizePanel');
        this.closeBtn = document.getElementById('closePanel');
        
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.isMinimized = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadPanelState();
    }
    
    setupEventListeners() {
        // Drag and drop
        this.panelHeader.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDrag());
        
        // Touch events per mobile
        this.panelHeader.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]));
        document.addEventListener('touchmove', (e) => this.drag(e.touches[0]));
        document.addEventListener('touchend', () => this.stopDrag());
        
        // Controlli pannello
        this.minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        this.closeBtn.addEventListener('click', () => this.closePanel());
        this.toggleButton.addEventListener('click', () => this.togglePanel());
    }
    
    startDrag(e) {
        this.isDragging = true;
        
        const panelRect = this.panel.getBoundingClientRect();
        this.dragOffset.x = e.clientX - panelRect.left;
        this.dragOffset.y = e.clientY - panelRect.top;
        
        this.panel.style.transition = 'none';
        this.panel.style.cursor = 'grabbing';
    }
    
    drag(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        
        // Limita il movimento entro i bordi della finestra
        const maxX = window.innerWidth - this.panel.offsetWidth;
        const maxY = window.innerHeight - this.panel.offsetHeight;
        
        const boundedX = Math.max(0, Math.min(x, maxX));
        const boundedY = Math.max(0, Math.min(y, maxY));
        
        this.panel.style.left = boundedX + 'px';
        this.panel.style.top = boundedY + 'px';
        this.panel.style.right = 'auto';
        this.panel.style.transform = 'none';
    }
    
    stopDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.panel.style.transition = 'all 0.3s ease';
        this.panel.style.cursor = 'grab';
        
        this.savePanelPosition();
    }
    
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        
        if (this.isMinimized) {
            this.panel.classList.add('collapsed');
            this.minimizeBtn.textContent = '+';
            this.minimizeBtn.title = 'Espandi pannello';
        } else {
            this.panel.classList.remove('collapsed');
            this.minimizeBtn.textContent = '−';
            this.minimizeBtn.title = 'Riduci a icona';
        }
        
        this.savePanelState();
    }
    
    closePanel() {
        this.panel.style.display = 'none';
        this.toggleButton.style.display = 'flex';
        this.savePanelState();
    }
    
    togglePanel() {
        if (this.panel.style.display === 'none') {
            this.panel.style.display = 'block';
            this.toggleButton.style.display = 'none';
        } else {
            this.closePanel();
        }
        this.savePanelState();
    }
    
    savePanelPosition() {
        const position = {
            left: this.panel.style.left,
            top: this.panel.style.top
        };
        localStorage.setItem('panelPosition', JSON.stringify(position));
    }
    
    savePanelState() {
        const state = {
            minimized: this.isMinimized,
            visible: this.panel.style.display !== 'none',
            position: {
                left: this.panel.style.left,
                top: this.panel.style.top
            }
        };
        localStorage.setItem('panelState', JSON.stringify(state));
    }
    
    loadPanelState() {
        const savedState = localStorage.getItem('panelState');
        
        if (savedState) {
            const state = JSON.parse(savedState);
            
            if (state.position && state.position.left && state.position.top) {
                this.panel.style.left = state.position.left;
                this.panel.style.top = state.position.top;
                this.panel.style.right = 'auto';
                this.panel.style.transform = 'none';
            }
            
            if (state.minimized) {
                this.isMinimized = true;
                this.panel.classList.add('collapsed');
                this.minimizeBtn.textContent = '+';
            }
            
            if (!state.visible) {
                this.panel.style.display = 'none';
                this.toggleButton.style.display = 'flex';
            } else {
                this.toggleButton.style.display = 'none';
            }
        }
    }
}

// Inizializza quando il DOM è pronto
let panelController;

document.addEventListener('DOMContentLoaded', () => {
    panelController = new PanelController();
});

// Rendi globale per debug
window.panelController = panelController;
