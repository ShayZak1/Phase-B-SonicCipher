import { h } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import Peer from 'peerjs';
import axios from 'axios';
import { peerConfig1 } from '../../config';

const VideoChat = ({ onClose, userLanguage }) => {
  const [myId, setMyId] = useState('');
  const [recId, setRecId] = useState('');
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [subtitles, setSubtitles] = useState('');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const connRef = useRef(null);
  const callRef = useRef(null);
  const localStreamRef = useRef(null);
  const chatMessageRef = useRef(null);
  const isProcessingRef = useRef(false);

  const init = async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = localStream;
      localStreamRef.current = localStream;

      const peer = new Peer(undefined, peerConfig1);
      peerRef.current = peer;

      peer.on('open', (id) => {
        setMyId(id);
      });

      peer.on('call', (incomingCall) => {
        console.log("Receiving call...");
        incomingCall.answer(localStream);
        incomingCall.on('stream', (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          handleRemoteAudioStream(remoteStream);
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

  const handleRemoteAudioStream = (remoteStream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const mediaStreamSource = audioContext.createMediaStreamSource(remoteStream);
    const processor = audioContext.createScriptProcessor(2048, 1, 1);
    mediaStreamSource.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = async (event) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      const inputData = event.inputBuffer.getChannelData(0);
      const audioBlob = new Blob([new Float32Array(inputData)], { type: 'audio/webm' });
      const audioBase64 = await convertBlobToBase64(audioBlob);
      const transcript = await transcribeAudio(audioBase64);
      if (transcript) {
        const translatedText = await translateText(transcript, userLanguage);
        setSubtitles(translatedText);
      }

      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1000); // Add a delay to avoid overwhelming the server
    };
  };

  const transcribeAudio = async (audioBase64) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/speech-to-text`, {
        audioBase64,
        languageCode: 'en-US', // Assuming the speech-to-text API requires a language code
      });
      if (response.data && response.data.results) {
        return response.data.results.map(result => result.alternatives[0].transcript).join('\n');
      } else {
        console.error('Unexpected response format:', response.data);
        return '';
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      return '';
    }
  };

  const translateText = async (text, targetLanguage) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/translate`, {
        q: text,
        source: 'en', // Assuming the source language is English
        target: targetLanguage,
        format: 'text',
      });
      if (response.data && response.data.data && response.data.data.translations) {
        return response.data.data.translations[0].translatedText;
      } else {
        console.error('Unexpected response format:', response.data);
        return '';
      }
    } catch (error) {
      console.error('Error translating text:', error);
      return '';
    }
  };

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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
        handleRemoteAudioStream(remoteStream);
      });
    });

    connection.on('error', (err) => {
      console.error('Connection error:', err);
    });
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
    <div className="relative w-full h-full max-w-[680px] bg-gray-800 bg-opacity-70 rounded-3xl p-6 mx-auto my-12 text-white">
      <button className="absolute top-4 right-4 text-2xl" onClick={onClose}>
        <i className="fa-solid fa-xmark text-white"></i>
      </button>
      <h1 className="text-3xl text-center py-4">Communicator</h1>
      <form onSubmit={connect}>
        <div className="mb-4">
          <label htmlFor="myId" className="block text-sm font-medium text-gray-300">My Nickname</label>
          <input
            type="text"
            id="myId"
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-200"
            value={myId}
            readOnly
            onClick={(e) => e.target.select()}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="recId" className="block text-sm font-medium text-gray-300">Recipient</label>
          <input
            type="text"
            id="recId"
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-200"
            value={recId}
            onChange={(e) => setRecId(e.target.value)}
            readOnly={connected}
          />
        </div>
        <div className="py-2">
          <button
            type="submit"
            className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${connected ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {connected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </form>
      <div className="flex justify-center gap-4 mt-4">
        <video ref={localVideoRef} autoPlay muted className="w-1/2 border border-gray-600 rounded-md"></video>
        <video ref={remoteVideoRef} autoPlay className="w-1/2 border border-gray-600 rounded-md"></video>
      </div>
      {subtitles && (
        <div className="mt-4 bg-gray-900 p-4 rounded-md text-center">
          {subtitles}
        </div>
      )}
      {connected && (
        <div className="mt-4">
          <div className="mb-4 bg-gray-700 p-4 rounded-md overflow-y-auto h-32">
            {messages.map((msg, index) => (
              <div key={index} className={`${msg.isMine ? 'text-right text-blue-400' : 'text-left text-gray-400'}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage}>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-200"
                ref={chatMessageRef}
              />
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
      <div id="statusBar" className="text-center text-gray-300 mt-2">{connected ? 'connected' : 'not connected'}</div>
    </div>
  );
};

export default VideoChat;
