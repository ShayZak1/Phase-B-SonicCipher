const WebSocket = require('ws');
const Peer = require('peer');

const initializeWebSocket = (app) => {
  const server = require('http').createServer(app);
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
      console.log('Received:', message);
      ws.send(`Echo: ${message}`);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  const peerServer = Peer.Server({ port: 9000, path: '/peerjs' });

  server.listen(8080, () => {
    console.log('WebSocket server is running on port 8080');
  });
};

module.exports = { initializeWebSocket };
