// config.js

// Configuration for PeerJS connection
const peerConfig = {
    host: 'wss2.mtw-testnet.com',
    path: '/peerjs/myapp',
  };
  
  const peerConfig1 = {
    host: 'wss2.mtw-testnet.com',
    path: '/peerjs/myapp',
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    },
  };
  
  // Configuration for Backend API
  const config = {
    apiBaseUrl: process.env.REACT_APP_BACKEND_URL, // Use the environment variable to access the backend URL
  };
  
  export { peerConfig, peerConfig1, config };
  