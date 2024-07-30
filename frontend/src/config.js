// config.js

// Configuration for PeerJS connection
const peerConfig = {
    host: 'wss2.mtw-testnet.com',
    path: '/peerjs/myapp'
};

const peerConfig1 = {
    host: 'wss2.mtw-testnet.com',
    path: '/peerjs/myapp',
    config: {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
        ],
    },
};

export { peerConfig, peerConfig1 };
