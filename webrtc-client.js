class WebRTCClient {
    constructor() {
        this.peerConnection = null;
        this.websocket = null;
        this.isConnected = false;
        this.currentRoom = 'live'; // Stessa stanza del server
        
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ],
            iceCandidatePoolSize: 10
        };

        this.initializeElements();
        this.log('✅ Client WebRTC inizializzato');
    }

    initializeElements() {
        this.videoElement = document.getElementById('videoElement');
        this.statusElement = document.getElementById('status');
        this.connectBtn = document.getElementById('connectBtn');
        this.disconnectBtn = document.getElementById('disconnectBtn');
        this.joinRoomBtn = document.getElementById('joinRoomBtn');
        this.logElement = document.getElementById('log');
        this.connectionInfoElement = document.getElementById('connectionInfo');
        this.videoInfoElement = document.getElementById('videoInfo');
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `<strong>[${timestamp}]</strong> ${message}`;
        this.logElement.appendChild(logEntry);
        this.logElement.scrollTop = this.logElement.scrollHeight;
        console.log(`[${type}] ${message}`);
    }

    updateStatus(status, message) {
        this.statusElement.className = 'status ' + status;
        this.statusElement.textContent = message;
        
        switch (status) {
            case 'connected':
                this.connectBtn.disabled = true;
                this.disconnectBtn.disabled = false;
                this.joinRoomBtn.disabled = false;
                break;
            case 'disconnected':
                this.connectBtn.disabled = false;
                this.disconnectBtn.disabled = true;
                this.joinRoomBtn.disabled = true;
                break;
            case 'connecting':
                this.connectBtn.disabled = true;
                this.disconnectBtn.disabled = true;
                this.joinRoomBtn.disabled = true;
                break;
        }
    }

    updateConnectionInfo(info) {
        this.connectionInfoElement.innerHTML = info;
    }

    updateVideoInfo(info) {
        this.videoInfoElement.innerHTML = info;
    }

    async connect() {
        try {
            this.log('🔄 Tentativo di connessione al server WebSocket...', 'info');
            this.updateStatus('connecting', '🔄 Connessione in corso...');

            // Usa l'URL del tuo server Heroku - importante: usa wss:// per HTTPS
            const websocketUrl = `wss://${window.location.hostname}` || 'wss://tuo-app-heroku.herokuapp.com';
            this.websocket = new WebSocket(websocketUrl);

            this.websocket.onopen = () => {
                this.log('✅ Connesso al server di signaling', 'success');
                this.updateStatus('connected', '✅ Connesso al server');
                this.isConnected = true;
                
                // Aggiorna informazioni connessione
                this.updateConnectionInfo(`
                    <strong>Stato:</strong> Connesso al server<br>
                    <strong>Protocollo:</strong> WebSocket (wss)<br>
                    <strong>Server:</strong> ${websocketUrl}
                `);
            };

            this.websocket.onmessage = (event) => {
                this.handleSignalingMessage(event);
            };

            this.websocket.onclose = (event) => {
                this.log(`❌ Disconnesso dal server: ${event.code} - ${event.reason}`, 'error');
                this.updateStatus('disconnected', '❌ Disconnesso');
                this.isConnected = false;
                this.cleanup();
            };

            this.websocket.onerror = (error) => {
                this.log('❌ Errore WebSocket: ' + error, 'error');
                this.updateStatus('disconnected', '❌ Errore di connessione');
            };

        } catch (error) {
            this.log('❌ Errore durante la connessione: ' + error, 'error');
            this.updateStatus('disconnected', '❌ Errore di connessione');
        }
    }

    joinRoom() {
        if (!this.isConnected || !this.websocket) {
            this.log('❌ Non connesso al server', 'error');
            return;
        }

        this.log(`🎯 Entrando nella stanza: ${this.currentRoom}`, 'info');
        
        // Invia messaggio per entrare nella stanza (formato del tuo server)
        this.sendSignalingMessage({
            type: 'webrtc-join',
            room: this.currentRoom
        });

        // Inizializza la connessione WebRTC dopo l'ingresso nella stanza
        this.setupWebRTC();
    }

    setupWebRTC() {
        try {
            this.log('🔄 Inizializzazione connessione WebRTC...', 'info');
            
            this.peerConnection = new RTCPeerConnection(this.rtcConfig);

            // Gestione stream video in arrivo
            this.peerConnection.ontrack = (event) => {
                this.log('🎥 Stream video ricevuto da TouchDesigner', 'success');
                if (event.streams && event.streams[0]) {
                    this.videoElement.srcObject = event.streams[0];
                    
                    // Aggiorna informazioni video
                    const stream = event.streams[0];
                    this.updateVideoInfo(`
                        <strong>Stream attivo:</strong> Sì<br>
                        <strong>Tracce video:</strong> ${stream.getVideoTracks().length}<br>
                        <strong>Tracce audio:</strong> ${stream.getAudioTracks().length}
                    `);
                }
            };

            // Gestione ICE candidates
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.log('📨 Invio ICE candidate', 'info');
                    this.sendSignalingMessage({
                        type: 'webrtc-candidate',
                        candidate: event.candidate
                    });
                }
            };

            // Gestione cambiamenti stato connessione
            this.peerConnection.onconnectionstatechange = () => {
                const state = this.peerConnection.connectionState;
                this.log(`🔄 Stato connessione WebRTC: ${state}`, 'info');
                
                switch (state) {
                    case 'connected':
                        this.updateStatus('connected', '✅ Connesso - Video attivo');
                        this.log('🎉 Connessione WebRTC stabilita con TouchDesigner!', 'success');
                        break;
                    case 'disconnected':
                    case 'failed':
                        this.updateStatus('disconnected', '❌ Connessione persa');
                        this.log('❌ Connessione WebRTC interrotta', 'error');
                        break;
                    case 'connecting':
                        this.updateStatus('connecting', '🔄 Connessione WebRTC in corso...');
                        break;
                }
            };

            this.peerConnection.oniceconnectionstatechange = () => {
                this.log(`🔄 Stato ICE: ${this.peerConnection.iceConnectionState}`, 'info');
            };

            this.log('✅ WebRTC inizializzato, in attesa di offerta da TouchDesigner...', 'success');

        } catch (error) {
            this.log('❌ Errore nell\'inizializzazione WebRTC: ' + error, 'error');
        }
    }

    async handleSignalingMessage(event) {
        try {
            const message = JSON.parse(event.data);
            this.log(`📨 Messaggio ricevuto: ${message.type}`, 'info');

            if (!this.peerConnection) {
                this.log('⚠️ Connessione WebRTC non inizializzata', 'error');
                return;
            }

            switch (message.type) {
                case 'webrtc-offer':
                    this.log('📥 Offerta WebRTC ricevuta da TouchDesigner', 'success');
                    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message));
                    const answer = await this.peerConnection.createAnswer();
                    await this.peerConnection.setLocalDescription(answer);
                    
                    this.sendSignalingMessage({
                        type: 'webrtc-answer',
                        ...answer
                    });
                    this.log('📤 Risposta WebRTC inviata', 'success');
                    break;

                case 'webrtc-answer':
                    this.log('📥 Risposta WebRTC ricevuta', 'success');
                    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message));
                    break;

                case 'webrtc-candidate':
                    this.log('📥 ICE candidate ricevuto', 'info');
                    await this.peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
                    break;

                case 'webrtc-joined':
                    this.log(`✅ Entrato nella stanza: ${message.room}`, 'success');
                    break;

                case 'connected':
                    this.log('✅ Connessione signaling stabilita', 'success');
                    break;

                case 'keepalive':
                    // Ignora i messaggi keepalive nel log per ridurre il rumore
                    break;

                default:
                    this.log(`❓ Tipo di messaggio sconosciuto: ${message.type}`, 'error');
            }
        } catch (error) {
            this.log('❌ Errore nella gestione del messaggio: ' + error, 'error');
        }
    }

    sendSignalingMessage(message) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(message));
        } else {
            this.log('❌ WebSocket non connesso, impossibile inviare messaggio', 'error');
        }
    }

    disconnect() {
        this.log('🔄 Disconnessione in corso...', 'info');
        
        // Invia messaggio di leave se siamo in una stanza
        if (this.currentRoom) {
            this.sendSignalingMessage({
                type: 'webrtc-leave',
                room: this.currentRoom
            });
        }
        
        this.cleanup();
        this.updateStatus('disconnected', '❌ Disconnesso');
        this.updateConnectionInfo('<strong>Stato:</strong> Disconnesso');
        this.updateVideoInfo('<strong>Stream attivo:</strong> No');
    }

    cleanup() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }

        if (this.videoElement.srcObject) {
            this.videoElement.srcObject = null;
        }

        this.isConnected = false;
        this.log('🧹 Risorse pulite', 'info');
    }
}

// Inizializzazione globale
let webrtcClient;

function connect() {
    if (!webrtcClient) {
        webrtcClient = new WebRTCClient();
    }
    webrtcClient.connect();
}

function disconnect() {
    if (webrtcClient) {
        webrtcClient.disconnect();
    }
}

function joinRoom() {
    if (webrtcClient) {
        webrtcClient.joinRoom();
    }
}

// Inizializzazione automatica
document.addEventListener('DOMContentLoaded', function() {
    webrtcClient = new WebRTCClient();
});
