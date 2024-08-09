import { h } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import Peer from 'peerjs';
import axios from 'axios';
import { peerConfig1 } from '../../config';
import { languages } from '../../LanguageData';

const VideoChat = ({ onClose }) => {
  const [myId, setMyId] = useState('');
  const [recId, setRecId] = useState('');
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [subtitle, setSubtitle] = useState('');
  const [sourceLang, setSourceLang] = useState('en-GB');
  const [targetLang, setTargetLang] = useState('he-IL');
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

  const startRecording = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 2048;

    microphone.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);

    scriptProcessor.onaudioprocess = async () => {
      const array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);

      const audioBlob = new Blob([array.buffer], { type: 'audio/webm' });
      const audioBase64 = await convertBlobToBase64(audioBlob);
      transcribeAudio(audioBase64);
    };
  };

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const transcribeAudio = async (audioBase64) => {
    try {
      const response = await axios.post('/speech-to-text', {
        audioBase64,
        languageCode: sourceLang,
      });

      const transcript = response.data.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      handleTranscript(transcript);
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  };

  const handleTranscript = async (transcript) => {
    try {
      const response = await axios.post('/translate', {
        q: transcript,
        source: sourceLang,
        target: targetLang,
        format: 'text',
      });

      const translatedText = response.data.data.translations[0].translatedText;
      setSubtitle(translatedText);
    } catch (error) {
      console.error('Error translating text:', error);
    }
  };

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

        startRecording(localStreamRef.current); // Start recording when connected
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

  useEffect(() => {
    init();

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div id="videot" className="relative w-full h-full max-w-[680px] bg-gray-800 bg-opacity-70 rounded-3xl p-6 mx-auto my-12 text-white">
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
        <div className="mb-4">
          <label htmlFor="sourceLang" className="block text-sm font-medium text-gray-300">Source Language</label>
          <select
            id="sourceLang"
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-200"
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
          >
            {Object.entries(languages).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="targetLang" className="block text-sm font-medium text-gray-300">Target Language</label>
          <select
            id="targetLang"
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-200"
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
          >
            {Object.entries(languages).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
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
      {connected && <div className="absolute bottom-4 w-full text-center text-white bg-gray-900 bg-opacity-75 p-2 rounded-md">{subtitle}</div>}
    </div>
  );
};

export default VideoChat;
