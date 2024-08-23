import { h } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import Peer from 'peerjs';
import axios from 'axios';
import { peerConfig1 } from '../../config';
import { languages } from '../../LanguageData';
import PopupMessage from '../PopupMessage/PopupMessage'; 

// Global variables to store language settings
let globalSourceLang = 'en-GB';
let globalTargetLang = 'he-IL';
let globalChangeCount = 0;

const VideoChat = ({ onClose }) => {
  const [myId, setMyId] = useState('');
  const [recId, setRecId] = useState('');
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [subtitle, setSubtitle] = useState('');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const connRef = useRef(null);
  const callRef = useRef(null);
  const localStreamRef = useRef(null);
  const chatMessageRef = useRef(null);
  const recognitionRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showPopup, setShowPopup] = useState(true); // To control the popup visibility

  useEffect(() => {
    // Dynamically load Eruda and assign it to a variable
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/eruda';
    script.onload = () => {
      const eruda = window.eruda; // Assign to a variable
      eruda.init();
    };
    document.body.appendChild(script);

    return () => {
      // Clean up the script when the component is unmounted
      document.body.removeChild(script);
    };
  }, []);


  const toggleMute = () => {
    if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsMuted(!isMuted);

        if (!isMuted) {
            // If unmuting, restart speech recognition
            if (recognitionRef.current) {
                console.log('Restarting recognition after unmuting...');
                recognitionRef.current.stop();
                setTimeout(() => recognitionRef.current.start(), 500); // Small delay before restarting
            }
        } else {
            // If muting, stop speech recognition
            if (recognitionRef.current) {
                console.log('Stopping recognition due to mute...');
                recognitionRef.current.stop();
            }
        }
    }
};


  // Function to handle language change
  const handleLanguageChange = (source, target) => {
    globalSourceLang = source;
    globalTargetLang = target;
    globalChangeCount += 1;
    console.log(`Language change count: ${globalChangeCount}`);
    console.log(`Source Language set to: ${globalSourceLang}`);
    console.log(`Target Language set to: ${globalTargetLang}`);
  };

  useEffect(() => {
    console.log(`Initial sourceLang: ${globalSourceLang}, targetLang: ${globalTargetLang}`);
  }, []);

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
          if (data.type === 'message') {
            setMessages((msgs) => [...msgs, { text: data.text, isMine: false }]);
          } else if (data.type === 'transcript') {
            // Directly set the subtitle with the translated text received from the peer
            setSubtitle(data.text);
          }
        });
        connection.on('open', () => {
          setConnected(true);
          setRecId(connection.peer);
          console.log(`Peer 1 language settings after connection:`);
          console.log(`Source Language: ${globalSourceLang}`);
          console.log(`Target Language: ${globalTargetLang}`);
          startRealTimeTranscription(); // Start transcription after connection
        });
      });

    } catch (error) {
      console.error('Error accessing media devices.', error);
    }
  };

  const sendTranscriptToPeer = async (transcript) => {
    console.log(`Sending transcript: ${transcript}`);
    console.log(`Using source language: ${globalSourceLang} and target language: ${globalTargetLang}`);

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/translate`, {
        q: transcript,
        source: globalSourceLang,
        target: globalTargetLang,
        format: 'text',
      });

      const translatedText = response.data.data.translations[0].translatedText;
      console.log(`Translated text: ${translatedText}`);

      // Send the translated text to the peer
      if (connRef.current && connRef.current.open) {
        connRef.current.send({ type: 'transcript', text: translatedText });
      }
    } catch (error) {
      console.error('Error translating and sending transcript:', error);
    }
  };

  const startRealTimeTranscription = () => {
    if (!('webkitSpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = globalSourceLang; // Use the global source language

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        interimTranscript += event.results[i][0].transcript;
      }

      // Translate the transcript and send it to the peer
      sendTranscriptToPeer(interimTranscript);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'network') {
          console.error('Error: ', event.error);
          recognitionRef.current.stop();
          setTimeout(() => {
              if (!isMuted) {  // Only restart if the mic is not muted
                  console.log('Restarting speech recognition after error...');
                  recognitionRef.current.start();
              }
          }, 1000);
      } else {
          console.error(`Error occurred in recognition: ${event.error}`);
      }
  };
  
  recognition.onend = () => {
      console.log("Speech recognition ended, checking if restart is needed...");
      if (!isMuted) {  // Only restart if the mic is not muted
          setTimeout(() => {
              console.log('Restarting speech recognition...');
              recognitionRef.current.start();
          }, 1000);
      }
  };
  

    recognitionRef.current = recognition;
    recognition.start();
    console.log(`Starting real-time transcription with source language: ${recognition.lang}`);
  };

  const connect = (e) => {
    e.preventDefault();

    if (!connected) {
        const connection = peerRef.current.connect(recId);
        connRef.current = connection;
        console.log('hello');
        
        connection.on('open', () => {
            setConnected(true);
            connection.on('data', (data) => {
                if (data.type === 'message') {
                    setMessages((msgs) => [...msgs, { text: data.text, isMine: false }]);
                } else if (data.type === 'transcript') {
                    // Display the translated text received from the peer
                    setSubtitle(data.text);
                } else if (data.type === 'disconnect') {
                    // Handle the disconnect message from the peer
                    console.log('Peer has disconnected');
                    disconnect(); // Automatically disconnect the other peer
                }
            });

            const call = peerRef.current.call(recId, localStreamRef.current);
            callRef.current = call;

            call.on('stream', (remoteStream) => {
                remoteVideoRef.current.srcObject = remoteStream;
            });

            startRealTimeTranscription(); // Start transcription after connection
        });

        connection.on('error', (err) => {
            console.error('Connection error:', err);
        });
    } else {
        disconnect();
    }
};


const disconnect = () => {
  if (connRef.current && connRef.current.open) {
      connRef.current.send({ type: 'disconnect' }); // Notify the other peer
  }

  if (callRef.current) callRef.current.close();
  if (connRef.current) connRef.current.close();
  if (peerRef.current) peerRef.current.destroy();

  if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
  }

  if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      remoteVideoRef.current.srcObject = null;
  }

  if (recognitionRef.current) {
      recognitionRef.current.onend = null; // Prevent auto-restart on 'end'
      recognitionRef.current.stop();       // Stop the recognition
      recognitionRef.current = null;       // Clear the reference
  }

  setConnected(false);
  setRecId('');
  localVideoRef.current.srcObject = null;
  remoteVideoRef.current.srcObject = null;
};




  const sendMessage = (e) => {
    e.preventDefault();

    const message = chatMessageRef.current.value;
    if (connRef.current && connRef.current.open) {
      connRef.current.send({ type: 'message', text: message });
      setMessages((msgs) => [...msgs, { text: message, isMine: true }]);
      chatMessageRef.current.value = '';
    } else {
      console.log('Connection is not open.');
    }
  };

  useEffect(() => {
    init();

    return () => {
      disconnect();
    };
  }, []);

  return (
    <div id="videot" className="relative w-full h-full max-w-[680px] bg-gray-800 bg-opacity-70 rounded-3xl p-6 mx-auto my-12 text-white">
    {showPopup && (
    <PopupMessage 
          message={
            <>
              Follow these steps to start your video chat:<br />
              1. Copy your Nickname (click the box to copy).<br />
              2. Share your Nickname ID with the other person.<br />
              3. Set your Source Language to the language you speak,<br />
                and Target Language to the language the other person speaks.<br />
              4. The person who received the ID should click 'Connect' to start.
            </>
          }
    
        onClose={() => setShowPopup(false)}
        nickname={myId} // Pass the nickname to the PopupMessage component
          />
          )}  
      <button className="absolute top-4 right-4 text-2xl" onClick={() => { disconnect(); onClose(); }}>
        <i className="fa-solid fa-xmark text-white"></i>
      </button>
      <button className="absolute top-4 right-12 text-2xl" onClick={toggleMute}>
       <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-white`}></i>
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
            value={globalSourceLang}
            onChange={(e) => handleLanguageChange(e.target.value, globalTargetLang)}
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
            value={globalTargetLang}
            onChange={(e) => handleLanguageChange(globalSourceLang, e.target.value)}
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
        <video ref={localVideoRef} autoPlay muted playsInline className="w-1/2 border border-gray-600 rounded-md"></video>
        <video ref={remoteVideoRef} autoPlay playsInline className="w-1/2 border border-gray-600 rounded-md"></video>
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
