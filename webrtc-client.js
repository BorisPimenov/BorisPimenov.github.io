async connect() {
    try {
        this.log('🔄 Connessione in corso...', 'info');
        this.updateStatus('connecting', '🔄 Connessione in corso...');

        // ✅ SOSTITUISCI 'tuo-app-heroku' con il nome vero della tua app Heroku
        const websocketUrl = 'wss://eburnea-socket-8cd5fa7cffe8.herokuapp.com';
        
        this.log(`🔗 Connessione a: ${websocketUrl}`, 'info');
        console.log('DEBUG - WebSocket URL:', websocketUrl);

        this.websocket = new WebSocket(websocketUrl);

        this.websocket.onopen = () => {
            console.log('✅ WebSocket connesso!');
            this.log('✅ Connesso al server!', 'success');
            this.updateStatus('connected', '✅ Connesso - Pronto per WebRTC');
            this.isConnected = true;
        };

        this.websocket.onmessage = (event) => {
            this.handleSignalingMessage(event);
        };

        this.websocket.onclose = (event) => {
            console.log('WebSocket chiuso:', event);
            this.log('❌ Disconnesso dal server', 'error');
            this.updateStatus('disconnected', '❌ Disconnesso');
        };

        this.websocket.onerror = (error) => {
            console.log('WebSocket error:', error);
            this.log('❌ Errore di connessione', 'error');
            this.updateStatus('disconnected', '❌ Errore di connessione');
        };

    } catch (error) {
        console.log('Errore:', error);
        this.log('❌ Errore: ' + error, 'error');
    }
}
