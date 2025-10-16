class TouchController {
    constructor() {
        this.area = document.getElementById('touchArea');
        this.cursor = document.getElementById('touchCursor');
        this.coordinates = document.getElementById('coordinates');
        this.info = document.getElementById('touchInfo');
        
        this.isTouching = false;
        this.lastSentTime = 0;
        this.sendInterval = 50; // 20fps
        
        this.initEvents();
    }
    
    initEvents() {
        // Mouse events
        this.area.addEventListener('mousedown', (e) => this.handleStart(e));
        this.area.addEventListener('mousemove', (e) => this.handleMove(e));
        this.area.addEventListener('mouseup', () => this.handleEnd());
        this.area.addEventListener('mouseleave', () => this.handleEnd());
        
        // Touch events
        this.area.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleStart(e.touches[0]);
        });
        this.area.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleMove(e.touches[0]);
        });
        this.area.addEventListener('touchend', () => this.handleEnd());
    }
    
    handleStart(e) {
        this.isTouching = true;
        this.updatePosition(e);
        this.sendTouchData('touch_start');
        this.info.textContent = 'Touch attivo - modifica la scenografia';
    }
    
    handleMove(e) {
        if (!this.isTouching) return;
        this.updatePosition(e);
        
        const now = Date.now();
        if (now - this.lastSentTime > this.sendInterval) {
            this.sendTouchData('touch_move');
            this.lastSentTime = now;
        }
    }
    
    handleEnd() {
        if (!this.isTouching) return;
        
        this.isTouching = false;
        this.cursor.style.display = 'none';
        this.info.textContent = 'Tocca per interagire con la scenografia';
        this.sendTouchData('touch_end');
    }
    
    updatePosition(e) {
        const rect = this.area.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        this.currentX = Math.max(0, Math.min(1, x));
        this.currentY = Math.max(0, Math.min(1, y));
        
        this.cursor.style.display = 'block';
        this.cursor.style.left = (this.currentX * 100) + '%';
        this.cursor.style.top = (this.currentY * 100) + '%';
        this.coordinates.textContent = `X:${this.currentX.toFixed(2)} Y:${this.currentY.toFixed(2)}`;
    }
    
    sendTouchData(eventType) {
        const message = {
            type: "touch",
            event: eventType,
            x: parseFloat(this.currentX.toFixed(3)),
            y: parseFloat(this.currentY.toFixed(3)),
            timestamp: Date.now()
        };
        
        sendToTouchDesigner(message);
    }
}

let touchController;

document.addEventListener('DOMContentLoaded', () => {
    touchController = new TouchController();
});
