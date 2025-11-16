class WebRTCClient {
    constructor() {
        this.peerConnection = null;
        this.websocket = null;
        this.isConnected = false;
        this.currentRoom = 'live';
        this.videoStats = {
            width: 0,
            height: 0,
            fps: 0,
            lastTime: 0,
            frames: 0
        };

        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ],
            iceCandidatePoolSize: 10
        };

        // Inizializza subito
        this.initializeElements();
        this.setupEventListeners();
        this.log('🚀 Client WebRTC inizializzato', 'info');
    }

    initializeElements() {
        console.log('🔧 Inizializzando elementi DOM...');
        
        this.videoElement = document.getElementById('videoElement');
        this.videoPlaceholder = document.getElementById('videoPlaceholder');
        this.statusElement = document.getElementById('status');
        this.statusText = document.getElementById('status-text');
        this.connectBtn = document.getElementById('connectBtn');
        this.disconnectBtn = document.getElementById('disconnectBtn');
        this.joinRoomBtn = document.getElementById('joinRoomBtn');
        this.logElement = document.getElementById('log');
        this.connectionInfoElement = document.getElementById('connectionInfo');
        this.videoInfoElement = document.getElementById('videoInfo');
        this.webrtcStateElement = document.getElementById('webrtcState');
        this.iceStateElement = document.getElementById('iceState');
        this.videoResolutionElement = document.getElementById('videoResolution');
        this.videoFPSElement = document.getElementById('videoFPS');

        console.log('✅ Elementi DOM inizializzati');
    }

    setupEventListeners() {
        console.log('🔧 Configurando event listeners...');
        
        // Stats per FPS
        this.statsInterval = setInterval(() => this.updateVideoStats(), 1000);
        
        // Cleanup quando la pagina viene chiusa
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        console.log('✅ Event listeners configurati');
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.innerHTML = `<strong>[${timestamp}]</strong> ${message}`;
        
        if (this.logElement) {
            this.logElement.appendChild(logEntry);
            this.logElement.scrollTop = this.logElement.scrollHeight;
        }
        
        console.log(`[${type}] ${message}`);
    }

    updateStatus(status, message) {
        if (!this.statusElement || !this.statusText) return;
        
        this.statusElement.className = status;
        this.statusText.textContent = message;
        
        const indicator = this.statusElement.querySelector('.status-indicator');
        if (indicator) {
            indicator.className = 'status-indicator ' + status;
        }

        // Aggiorna stati pulsanti
        switch (status) {
            case 'status-connected':
                if (this.connectBtn) this.connectBtn.disabled = true;
                if (this.disconnectBtn) this.disconnectBtn.disabled = false;
                if (this.joinRoomBtn) this.joinRoomBtn.disabled = false;
                break;
            case 'status-disconnected':
                if (this.connectBtn) this.connectBtn.disabled = false;
                if (this.disconnectBtn) this.disconnectBtn.disabled = true;
                if (this.joinRoomBtn) this.joinRoomBtn.disabled = true;
                break;
            case 'status-connecting':
                if (this.connectBtn) this.connectBtn.disabled = true;
                if (this.disconnectBtn) this.disconnectBtn.disabled = true;
                if (this.joinRoomBtn) this.joinRoomBtn.disabled = true;
                break;
        }
    }

    updateConnectionInfo(info) {
        if (this.connectionInfoElement) {
            this.connectionInfoElement.innerHTML = info;
        }
    }

    updateVideoInfo(info) {
        if (this.videoInfoElement) {
            this.videoInfoElement.innerHTML = info;
        }
    }

    updateWebRTCState(state) {
        if (this.webrtcStateElement) {
            this.webrtcStateElement.textContent = state;
        }
    }

    updateICEState(state) {
        if (this.iceStateElement) {
            this.iceStateElement.textContent = state;
        }
    }

    updateVideoStats() {
        if (this.videoElement && this.videoElement.videoWidth > 0) {
            this.videoStats.width = this.videoElement.videoWidth;
            this.videoStats.height = this.videoElement.videoHeight;
            
            // Calcola FPS
            const now = performance.now();
            if (this.videoStats.lastTime) {
                this.videoStats.frames++;
                if (now - this.videoStats.lastTime >= 1000) {
                    this.videoStats.fps = this.videoStats.frames;
                    this.videoStats.frames = 0;
                    this.videoStats.lastTime = now;
                }
            } else {
                this.videoStats.lastTime = now;
            }

            if (this.videoResolutionElement) {
                this.videoResolutionElement.textContent = `${this.videoStats.width}×${this.videoStats.height}`;
            }
            if (this.videoFPSElement) {
                this.videoFPSElement.textContent = this.videoStats.fps;
            }
        }
    }

    async connect() {
        try {
            this.log('🔄 Tentativo di connessione al server WebSocket...', 'info');
            this.updateStatus('status-connecting', 'Connessione in corso...');

            // Usa l'URL corrente (si adatterà automaticamente a Heroku)
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const websocketUrl = `${protocol}//${window.location.host}`;
            
            this.log(`🔗 Tentativo connessione a: ${websocketUrl}`, 'info');
            console.log('WebSocket URL:', websocketUrl);
            
            this.websocket = new WebSocket(websocketUrl);

            this.websocket.onopen = () => {
                this.log('✅ Connesso al server di signaling!', 'success');
                this.updateStatus('status-connected', 'Connesso al server');
                this.isConnected = true;
                
                this.updateConnectionInfo(`
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                        <div style="padding: 8px; background: white; border-radius: 5px; border-left: 3px solid #3498db;">
                            <strong>Stato:</strong> Connesso
                        </div>
                        <div style="padding: 8px; background: white; border-radius: 5px; border-left: 3px solid #3498db;">
                            <strong>Protocollo:</strong> WebSocket
                        </div>
                        <div style="padding: 8px; background: white; border-radius: 5px; border-left: 3px solid #3498db;">
                            <strong>Server:</strong> ${window.location.host}
                        </div>
                        <div style="padding: 8px; background: white; border-radius: 5px; border-left: 3px solid #3498db;">
                            <strong>Tempo:</strong> ${new Date().toLocaleTimeString()}
                        </div>
                    </div>
                `);
            };

            this.websocket.onmessage = (event) => {
                console.log('📨 Messaggio ricevuto:', event.data);
                this.handleSignalingMessage(event);
            };

            this.websocket.onclose = (event) => {
                this.log(`❌ Disconnesso dal server: ${event.code}`, 'error');
                this.updateStatus('status-disconnected', 'Disconnesso');
                this.isConnected = false;
                this.cleanup();
            };

            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.log('❌ Errore WebSocket', 'error');
                this.updateStatus('status-disconnected', 'Errore di connessione');
            };

        } catch (error) {
            console.error('Connection error:', error);
            this.log(`❌ Errore durante la connessione: ${error}`, 'error');
            this.updateStatus('status-disconnected', 'Errore di connessione');
        }
    }

    joinRoom() {
        if (!this.isConnected || !this.websocket) {
            this.log('❌ Non connesso al server', 'error');
            return;
        }

        this.log(`🎯 Entrando nella stanza: ${this.currentRoom}`, 'info');
        this.updateStatus('status-connecting', 'Connessione WebRTC...');
        
        this.sendSignalingMessage({
            type: 'webrtc-join',
            room: this.currentRoom
        });

        this.setupWebRTC();
    }

    setupWebRTC() {
        try {
            this.log('🔄 Inizializzazione connessione WebRTC...', 'info');
            
            this.peerConnection = new RTCPeerConnection(this.rtcConfig);

            // Gestione stream video in arrivo
            this.peerConnection.ontrack = (event) => {
                this.log('🎥 Stream video ricevuto!', 'success');
                if (event.streams && event.streams[0]) {
                    this.videoElement.srcObject = event.streams[0];
                    this.videoPlaceholder.style.display = 'none';
                    
                    const stream = event.streams[0];
                    const videoTrack = stream.getVideoTracks()[0];
                    
                    this.updateVideoInfo(`
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                            <div style="padding: 8px; background: white; border-radius: 5px; border-left: 3px solid #2ecc71;">
                                <strong>Stream:</strong> Attivo
                            </div>
                            <div style="padding: 8px; background: white; border-radius: 5px; border-left: 3px solid #2ecc71;">
                                <strong>Video Tracks:</strong> ${stream.getVideoTracks().length}
                            </div>
                            <div style="padding: 8px; background: white; border-radius: 5px; border-left: 3px solid #2ecc71;">
                                <strong>Audio Tracks:</strong> ${stream.getAudioTracks().length}
                            </div>
                            <div style="padding: 8px; background: white; border-radius: 5px; border-left: 3px solid #2ecc71;">
                                <strong>Codec:</strong> ${videoTrack ? videoTrack.label : 'N/A'}
                            </div>
                        </div>
                    `);

                    this.log('✅ Video stream attivo e funzionante', 'success');
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
                this.updateWebRTCState(state);
                this.log(`🔄 Stato WebRTC: ${state}`, 'info');
                
                switch (state) {
                    case 'connected':
                        this.updateStatus('status-connected', 'Video attivo!');
                        this.log('🎉 Connessione WebRTC stabilita con TouchDesigner!', 'success');
                        break;
                    case 'disconnected':
                    case 'failed':
                        this.updateStatus('status-disconnected', 'Connessione persa');
                        this.log('❌ Connessione WebRTC interrotta', 'error');
                        if (this.videoPlaceholder) {
                            this.videoPlaceholder.style.display = 'flex';
                        }
                        break;
                    case 'connecting':
                        this.updateStatus('status-connecting', 'Connessione WebRTC...');
                        break;
                }
            };

            this.peerConnection.oniceconnectionstatechange = () => {
                const state = this.peerConnection.iceConnectionState;
                this.updateICEState(state);
                this.log(`🔄 Stato ICE: ${state}`, 'info');
            };

            this.log('✅ WebRTC inizializzato, pronto per ricevere video', 'success');

        } catch (error) {
            console.error('WebRTC setup error:', error);
            this.log(`❌ Errore nell'inizializzazione WebRTC: ${error}`, 'error');
        }
    }

    async handleSignalingMessage(event) {
        try {
            const message = JSON.parse(event.data);
            console.log('📨 Messaggio JSON ricevuto:', message);

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

                case 'echo':
                    this.log(`📨 Echo: ${message.received}`, 'info');
                    break;

                default:
                    this.log(`📨 Messaggio sconosciuto: ${message.type}`, 'warning');
            }
        } catch (error) {
            console.error('Message handling error:', error);
            this.log(`❌ Errore nella gestione del messaggio: ${error}`, 'error');
        }
    }

    sendSignalingMessage(message) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            try {
                this.websocket.send(JSON.stringify(message));
                console.log('📤 Messaggio inviato:', message.type);
            } catch (error) {
                console.error('Error sending message:', error);
                this.log('❌ Errore nell\'invio del messaggio', 'error');
            }
        } else {
            this.log('❌ WebSocket non connesso', 'error');
        }
    }

    disconnect() {
        this.log('🔄 Disconnessione in corso...', 'info');
        
        if (this.currentRoom) {
            this.sendSignalingMessage({
                type: 'webrtc-leave',
                room: this.currentRoom
            });
        }
        
        this.cleanup();
        this.updateStatus('status-disconnected', 'Disconnesso');
        this.updateConnectionInfo('<p>Disconnesso dal server</p>');
        this.updateVideoInfo('<p>Nessun stream attivo</p>');
        if (this.videoPlaceholder) {
            this.videoPlaceholder.style.display = 'flex';
        }
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

        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject = null;
        }

        this.isConnected = false;
        this.log('🧹 Risorse pulite', 'info');
    }
}

// Variabile globale
let webrtcClient = null;

// Funzioni globali per i pulsanti
function connect() {
    console.log('🔄 Connect button clicked');
    if (!webrtcClient) {
        webrtcClient = new WebRTCClient();
    }
    webrtcClient.connect();
}

function disconnect() {
    console.log('🔄 Disconnect button clicked');
    if (webrtcClient) {
        webrtcClient.disconnect();
    }
}

function joinRoom() {
    console.log('🔄 Join Room button clicked');
    if (webrtcClient) {
        webrtcClient.joinRoom();
    }
}

// Inizializzazione quando la pagina è caricata
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM completamente caricato');
    webrtcClient = new WebRTCClient();
    
    // Test: verifica che i pulsanti siano collegati
    const connectBtn = document.getElementById('connectBtn');
    const disconnectBtn = document.getElementById('disconnectBtn');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    
    if (connectBtn) {
        connectBtn.onclick = connect;
        console.log('✅ Pulsante Connect collegato');
    }
    if (disconnectBtn) {
        disconnectBtn.onclick = disconnect;
        console.log('✅ Pulsante Disconnect collegato');
    }
    if (joinRoomBtn) {
        joinRoomBtn.onclick = joinRoom;
        console.log('✅ Pulsante Join Room collegato');
    }
    
    console.log('🎬 WebRTC Client pronto per TouchDesigner');
});
