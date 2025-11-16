async connect() {
    try {
        this.log('🔄 Tentativo di connessione al server WebSocket...', 'info');
        this.updateStatus('connecting', '🔄 Connessione in corso...');

        // ✅ Usa wss:// sempre su Heroku
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const protocol = isLocalhost ? 'ws:' : 'wss:';
        const websocketUrl = `${protocol}//${window.location.host}`;
        
        this.log(`🔗 Connessione a: ${websocketUrl}`, 'info');
        
        this.websocket = new WebSocket(websocketUrl);

        // ✅ Timeout di connessione
        const connectionTimeout = setTimeout(() => {
            if (this.websocket.readyState !== WebSocket.OPEN) {
                this.log('❌ Timeout connessione WebSocket', 'error');
                this.websocket.close();
            }
        }, 10000);

        this.websocket.onopen = () => {
            clearTimeout(connectionTimeout);
            this.log('✅ Connesso al server di signaling', 'success');
            this.updateStatus('connected', '✅ Connesso al server');
            this.isConnected = true;
            
            this.updateConnectionInfo(`
                <strong>Stato:</strong> Connesso al server<br>
                <strong>Protocollo:</strong> WebSocket (${protocol})<br>
                <strong>Server:</strong> ${websocketUrl}<br>
                <strong>Tempo:</strong> ${new Date().toLocaleTimeString()}
            `);
        };

        this.websocket.onmessage = (event) => {
            this.handleSignalingMessage(event);
        };

        this.websocket.onclose = (event) => {
            clearTimeout(connectionTimeout);
            this.log(`❌ Disconnesso dal server: ${event.code} - ${event.reason || 'Nessuna ragione'}`, 'error');
            this.updateStatus('disconnected', '❌ Disconnesso');
            this.isConnected = false;
            
            // ✅ Tentativo di riconnessione automatica dopo 5 secondi
            setTimeout(() => {
                if (!this.isConnected) {
                    this.log('🔄 Tentativo di riconnessione...', 'info');
                    this.connect();
                }
            }, 5000);
        };

        this.websocket.onerror = (error) => {
            clearTimeout(connectionTimeout);
            this.log('❌ Errore WebSocket: ' + error.type, 'error');
            this.updateStatus('disconnected', '❌ Errore di connessione');
        };

    } catch (error) {
        this.log('❌ Errore durante la connessione: ' + error, 'error');
        this.updateStatus('disconnected', '❌ Errore di connessione');
    }
}
