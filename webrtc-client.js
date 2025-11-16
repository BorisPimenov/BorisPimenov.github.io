
async connect() {
    try {
        this.log('🔄 Connessione in corso...', 'info');
        this.updateStatus('connecting', '🔄 Connessione in corso...');

        // ✅ SOSTITUISCI 'tuo-app-heroku' con il nome vero della tua app Heroku
        const websocketUrl = 'wss://eburnea-fixed-f2da05b9b297.herokuapp.com';
        
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
// ... (mantieni tutto il codice precedente del client)

async handleSignalingMessage(event) {
    try {
        // ✅ ASSICURATI che sia JSON valido
        const messageText = event.data.toString().trim();
        
        if (!messageText) {
            this.log('📨 Received empty message', 'warning');
            return;
        }

        const message = JSON.parse(messageText);
        this.log(`📨 Messaggio: ${message.type}`, 'info');

        if (!this.peerConnection) {
            this.log('⚠️ Connessione WebRTC non inizializzata', 'warning');
            return;
        }

        switch (message.type) {
            case 'webrtc-offer':
                this.log('📥 Offerta WebRTC ricevuta da TouchDesigner', 'success');
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message));
                const answer = await this.peerConnection.createAnswer();
                await this.peerConnection.setLocalDescription(answer);
                
                // ✅ Invia risposta in formato corretto
                this.sendSignalingMessage({
                    type: 'webrtc-answer',
                    sdp: answer.sdp,
                    type: answer.type
                });
                this.log('📤 Risposta WebRTC inviata', 'success');
                break;

            case 'webrtc-answer':
                this.log('📥 Risposta WebRTC ricevuta', 'success');
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message));
                break;

            case 'webrtc-candidate':
                this.log('📥 ICE candidate ricevuto', 'info');
                if (message.candidate) {
                    await this.peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
                }
                break;

            case 'webrtc-joined':
                this.log(`✅ Entrato nella stanza: ${message.room}`, 'success');
                break;

            case 'connected':
                this.log('✅ Connessione signaling stabilita', 'success');
                break;

            case 'keepalive':
                // Ignora i keepalive silenziosamente
                break;

            default:
                this.log(`📨 Messaggio sconosciuto: ${message.type}`, 'warning');
        }
    } catch (error) {
        this.log(`❌ Errore JSON nel messaggio: ${error}`, 'error');
        this.log(`📨 Messaggio ricevuto: ${event.data.toString().substring(0, 100)}`, 'error');
    }
}

// ... (resto del codice)
