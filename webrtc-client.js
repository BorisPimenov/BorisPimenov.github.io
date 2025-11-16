class WebRTCClient {
    constructor() {
        this.peerConnection = null;
        this.dataChannel = null;
        this.websocket = null;
        this.isInitiator = false;
        
        // Configurazione STUN servers
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };

        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.videoElement = document.getElementById('videoElement');
        this.statusElement = document.getElementById('status');
        this.connectBtn = document.getElementById('connectBtn');
        this.disconnectBtn = document.getElementById('disconnectBtn');
        this.logElement = document.getElementById('log');
    }

    setupEventListeners() {
        // Eventi per cambiamenti di stato della connessione
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        this.logElement.innerHTML += logEntry + '<br>';
        this.logElement.scrollTop = this.logElement.scrollHeight;
        console.log(message);
    }

    updateStatus(status, message) {
        this.statusElement.className = 'status ' + status;
        this.statusElement.textContent = message;
        
        // Abilita/disabilita pulsanti in base allo stato
        if (status === 'connected') {
            this.connectBtn.disabled = true;
            this.disconnectBtn.disabled = false;
        } else if (status === 'disconnected') {
            this.connectBtn.disabled = false;
            this.disconnectBtn.disabled = true;
        } else {
            this.connectBtn.disabled = true;
            this.disconnectBtn.disabled = true;
        }
    }

    async connect() {
        try {
            this.log('Tentativo di connessione al signaling server...');
            this.updateStatus('connecting', 'Connessione in corso...');

            // Sostituisci con l'URL del tuo server WebSocket Heroku
            const websocketUrl = 'wss://eburnea-socket-8cd5fa7cffe8.herokuapp.com';
            this.websocket = new WebSocket(websocketUrl);

            this.websocket.onopen = () => {
                this.log('Connesso al signaling server');
                this.setupWebRTC();
            };

            this.websocket.onmessage = (event) => {
                this.handleSignalingMessage(event);
            };

            this.websocket.onclose = () => {
                this.log('Disconnesso dal signaling server');
                this.updateStatus('disconnected', 'Disconnesso');
            };

            this.websocket.onerror = (error) => {
                this.log('Errore WebSocket: ' + error);
                this.updateStatus('disconnected', 'Errore di connessione');
            };

        } catch (error) {
            this.log('Errore durante la connessione: ' + error);
            this.updateStatus('disconnected', 'Errore di connessione');
        }
    }

    setupWebRTC() {
        try {
            this.log('Inizializzazione connessione WebRTC...');
            
            this.peerConnection = new RTCPeerConnection(this.rtcConfig);

            // Gestione stream video in arrivo
            this.peerConnection.ontrack = (event) => {
                this.log('Stream video ricevuto');
                if (event.streams && event.streams[0]) {
                    this.videoElement.srcObject = event.streams[0];
                }
            };

            // Gestione ICE candidates
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.sendSignalingMessage({
                        type: 'candidate',
                        candidate: event.candidate
                    });
                }
            };

            // Gestione cambiamenti stato connessione
            this.peerConnection.onconnectionstatechange = () => {
                this.log('Stato connessione: ' + this.peerConnection.connectionState);
                
                switch (this.peerConnection.connectionState) {
                    case 'connected':
                        this.updateStatus('connected', 'Connesso - Video attivo');
                        break;
                    case 'disconnected':
                    case 'failed':
                        this.updateStatus('disconnected', 'Connessione persa');
                        break;
                    case 'connecting':
                        this.updateStatus('connecting', 'Connessione in corso...');
                        break;
                }
            };

            this.log('WebRTC inizializzato, in attesa di offerta...');

        } catch (error) {
            this.log('Errore nell\'inizializzazione WebRTC: ' + error);
        }
    }

    async handleSignalingMessage(event) {
        try {
            const message = JSON.parse(event.data);
            this.log('Messaggio ricevuto: ' + message.type);

            if (!this.peerConnection) {
                this.log('Connessione WebRTC non inizializzata');
                return;
            }

            switch (message.type) {
                case 'offer':
                    this.log('Offerta ricevuta, creazione risposta...');
                    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message));
                    const answer = await this.peerConnection.createAnswer();
                    await this.peerConnection.setLocalDescription(answer);
                    this.sendSignalingMessage(answer);
                    break;

                case 'answer':
                    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message));
                    break;

                case 'candidate':
                    await this.peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
                    break;

                case 'ready':
                    this.log('Peer pronto per la connessione');
                    break;

                default:
                    this.log('Tipo di messaggio sconosciuto: ' + message.type);
            }
        } catch (error) {
            this.log('Errore nella gestione del messaggio: ' + error);
        }
    }

    sendSignalingMessage(message) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(message));
            this.log('Messaggio inviato: ' + message.type);
        } else {
            this.log('WebSocket non connesso, impossibile inviare messaggio');
        }
    }

    disconnect() {
        this.log('Disconnessione in corso...');
        this.cleanup();
        this.updateStatus('disconnected', 'Disconnesso');
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

        this.log('Risorse pulite');
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

// Inizializzazione automatica quando la pagina è caricata
document.addEventListener('DOMContentLoaded', function() {
    webrtcClient = new WebRTCClient();
});
