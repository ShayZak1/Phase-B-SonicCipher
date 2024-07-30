import { h } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import Peer from 'peerjs';
import { peerConfig1 } from '../../config'; // Import the configuration
import videoFile from '../../assets/img/TranslateBg.mp4';

const VideoChat = () => {
  const [myId, setMyId] = useState('');
  const [recId, setRecId] = useState('');
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const connRef = useRef(null);
  const callRef = useRef(null);
  const localStreamRef = useRef(null);
  const chatMessageRef = useRef(null);

  const init = async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = localStream;
      localStreamRef.current = localStream;

      const peer = new Peer(undefined, peerConfig1); // Use the imported configuration
      peerRef.current = peer;

      peer.on('open', (id) => {
        setMyId(id); // Set the generated ID if no nickname is provided
      });

      peer.on('call', (incomingCall) => {
        console.log("Receiving call...");
        incomingCall.answer(localStream);
        incomingCall.on('stream', (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });
      });

      peer.on('connection', (connection) => {
        connRef.current = connection;
        connection.on('data', (data) => {
          setMessages((msgs) => [...msgs, { text: data, isMine: false }]);
        });
        connection.on('open', () => {
          setConnected(true);
          setRecId(connection.peer);
        });
      });
    } catch (error) {
      console.error('Error accessing media devices.', error);
    }
  };

  useEffect(() => {
    init();

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  const connect = (e) => {
    e.preventDefault();

    if (!connected) {
      const connection = peerRef.current.connect(recId);
      connRef.current = connection;

      connection.on('open', () => {
        setConnected(true);
        connection.on('data', (data) => {
          setMessages((msgs) => [...msgs, { text: data, isMine: false }]);
        });

        const call = peerRef.current.call(recId, localStreamRef.current);
        callRef.current = call;

        call.on('stream', (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });
      });

      connection.on('error', (err) => {
        console.error('Connection error:', err);
      });
    } else {
      disconnect();
    }
  };

  const disconnect = () => {
    if (callRef.current) callRef.current.close();
    if (connRef.current) connRef.current.close();
    if (peerRef.current) peerRef.current.destroy();

    setConnected(false);
    setRecId('');
    localVideoRef.current.srcObject = null;
    remoteVideoRef.current.srcObject = null;

    init();
  };

  const sendMessage = (e) => {
    e.preventDefault();

    const message = chatMessageRef.current.value;
    if (connRef.current && connRef.current.open) {
      connRef.current.send(message);
      setMessages((msgs) => [...msgs, { text: message, isMine: true }]);
      chatMessageRef.current.value = '';
    } else {
      console.log('Connection is not open.');
    }
  };

  return (
    <div className="relative w-full h-full max-h-screen flex flex-col gap-4 justify-center items-center px-4 sm:px-2 pt-12 pb-6 relative overflow-hidden video-chat-bg">
      <video
        style={{ filter: 'brightness(70%) blur(5px)' }}
        autoPlay
        muted
        loop
        playsInline
        id="bg-video"
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src={videoFile} type="video/mp4" />
      </video>
      <div className="relative z-10 w-full h-full flex flex-col items-center px-4 py-6 bg-gray-800 bg-opacity-70 rounded-lg">
        <h1 className="text-2xl text-white font-bold mb-4">Communicator</h1>
        <form onSubmit={connect} className="w-full max-w-sm">
          <div className="mb-4">
            <label className="block text-white mb-2">My Nickname</label>
            <input
              type="text"
              className="border border-gray-400 p-2 rounded w-full"
              value={myId}
              readOnly
              onClick={(e) => e.target.select()}
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Recipient</label>
            <input
              type="text"
              className="border border-gray-400 p-2 rounded w-full"
              value={recId}
              onChange={(e) => setRecId(e.target.value)}
              readOnly={connected}
            />
          </div>
          <div className="mb-4">
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </form>
        <div className="flex flex-col sm:flex-row justify-center gap-2 py-4 px-1 w-full">
          <video ref={localVideoRef} autoPlay muted className="w-full sm:w-1/2 border border-gray-400 p-2 rounded"></video>
          <video ref={remoteVideoRef} autoPlay className="w-full sm:w-1/2 border border-gray-400 p-2 rounded"></video>
        </div>
        {connected && (
          <div className="flex flex-col w-full max-w-sm">
            <div className="grow border border-gray-400 w-full h-60 mb-4 rounded overflow-y-auto overflow-x-hidden px-4 py-2 bg-gray-900 text-white">
              {messages.map((msg, index) => (
                <div key={index} className={`${msg.isMine ? 'text-right pl-12' : 'text-left pr-12'}`}>
                  {msg.text}
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="w-full flex gap-2">
              <input
                type="text"
                className="border border-gray-400 p-2 rounded grow"
                ref={chatMessageRef}
              />
              <button
                type="submit"
                className="h-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Send
              </button>
            </form>
          </div>
        )}
        <div id="statusBar" className="text-center text-white mt-4">{connected ? 'connected' : 'not connected'}</div>
      </div>
    </div>
  );
};

export default VideoChat;
