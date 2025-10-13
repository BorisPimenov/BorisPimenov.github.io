const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', function connection(ws) {
  console.log('Un client si è connesso');

  ws.on('message', function incoming(message) {
    console.log('Messaggio ricevuto:', message.toString());
    // Invia il messaggio a tutti i client connessi (broadcast)
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', function() {
    console.log('Un client si è disconnesso');
  });

  ws.send('WebSocket server connesso!');
});

console.log(`WebSocket server in ascolto sulla porta ${PORT}`);
