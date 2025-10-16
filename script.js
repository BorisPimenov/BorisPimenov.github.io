// CONNESSIONE WEBSOCKET 
const ws = new WebSocket('wss://eburnea-socket-8cd5fa7cffe8.herokuapp.com');
const connectionStatus = document.getElementById('connectionStatus');

ws.onopen = function() {
    console.log('✅ WebSocket connected');
    connectionStatus.textContent = 'Connected';
    connectionStatus.className = 'connection-status connected';
};

ws.onclose = function() {
    console.log('❌ WebSocket disconnected');
    connectionStatus.textContent = 'Disconnected';
    connectionStatus.className = 'connection-status disconnected';
};

ws.onerror = function(error) {
    console.log('💥 WebSocket error:', error);
    connectionStatus.textContent = 'Connection error';
    connectionStatus.className = 'connection-status disconnected';
};

// FUNZIONE SLIDER SEMPLICE
function handleSlider(sliderId, index) {
    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(sliderId + 'Value');

    slider.addEventListener('input', function() {
        valueDisplay.textContent = slider.value;
        
        if (ws.readyState === WebSocket.OPEN) {
            const message = {
                type: "slider",
                index: index,
                value: parseFloat(slider.value) / 100
            };
            ws.send(JSON.stringify(message));
            console.log('📤 Sent:', message);
        }
    });
}

// INIZIALIZZA SLIDER
handleSlider('slider1', 0);
handleSlider('slider2', 1);
handleSlider('slider3', 2);
handleSlider('slider4', 3);

// FIREBASE VOTING (mantieni questo)
const db = firebase.database();
const votesRef = db.ref('votes');

const voteAButton = document.getElementById('voteA');
const voteBButton = document.getElementById('voteB');
const percA = document.getElementById('percentage-A');
const percB = document.getElementById('percentage-B');
const totalClicks = document.getElementById('totalClicks');
const votedMsg = document.getElementById('votedMessage');

function updateUI(a, b) {
    const total = a + b;
    percA.textContent = total > 0 ? Math.round(a / total * 100) + '%' : '0%';
    percB.textContent = total > 0 ? Math.round(b / total * 100) + '%' : '0%';
    totalClicks.textContent = `${total} voti totali`;
}

votesRef.on('value', (snapshot) => {
    let data = snapshot.val();
    if (!data) data = {A: 0, B: 0};
    updateUI(data.A, data.B);

    if (data.A === 0 && data.B === 0) {
        localStorage.removeItem('hasVoted');
        voteAButton.disabled = false;
        voteBButton.disabled = false;
        votedMsg.style.display = 'none';
    }
});

function hasVoted() {
    return localStorage.getItem('hasVoted') === 'yes';
}

function setVoted() {
    localStorage.setItem('hasVoted', 'yes');
    votedMsg.style.display = 'block';
    voteAButton.disabled = true;
    voteBButton.disabled = true;
}

if (hasVoted()) setVoted();

voteAButton.onclick = function() {
    if (hasVoted()) return;
    votesRef.transaction(current => {
        return {
            A: (current && current.A ? current.A : 0) + 1,
            B: (current && current.B ? current.B : 0)
        };
    });
    setVoted();
};

voteBButton.onclick = function() {
    if (hasVoted()) return;
    votesRef.transaction(current => {
        return {
            A: (current && current.A ? current.A : 0),
            B: (current && current.B ? current.B : 0) + 1
        };
    });
    setVoted();
};
