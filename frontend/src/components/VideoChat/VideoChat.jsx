import { h } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";
import Peer from "peerjs";
import axios from "axios";
import { peerConfig1 } from "../../config";
import { languages } from "../../LanguageData";
import PopupMessage from "../PopupMessage/PopupMessage";
import ShareButton from "../ShareButton/ShareButton"; // Import the new ShareButton component

// Global variables to store language settings
let globalSourceLang = "en-GB";
let globalTargetLang = "he-IL";
let globalChangeCount = 0;
let isRecognitionRunning = false; // Define globally
let isStopping = false; // New flag to track if recognition is stopping
let restartAttemptTimeout; // To manage delayed restart attempts

const VideoChat = ({ onClose }) => {
  const [myId, setMyId] = useState("");
  const [recId, setRecId] = useState("");
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [subtitle, setSubtitle] = useState("");
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
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/eruda";
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
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search); // Parse URL query parameters
    const peerId = urlParams.get("peerId"); // Get the value of the `peerId` parameter

    if (peerId) {
      setRecId(peerId); // Automatically fill the Recipient input box with the peerId
    }
  }, []);

  // Function to toggle mute and control subtitle display
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled; // Toggle audio track enabled state
      });

      const newMutedState = !isMuted;
      setIsMuted(newMutedState);

      if (!newMutedState && !isRecognitionRunning && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          isRecognitionRunning = true; // Update state after starting
          console.log("Recognition started after unmuting...");
        } catch (error) {
          console.error("Error starting recognition after unmute:", error);
        }
      } else if (
        newMutedState &&
        isRecognitionRunning &&
        recognitionRef.current
      ) {
        try {
          isStopping = true; // Set stopping state to manage restart attempts
          recognitionRef.current.stop();
          isRecognitionRunning = false; // Update state after stopping
          console.log("Recognition stopped due to mute...");
        } catch (error) {
          console.error("Error stopping recognition:", error);
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
    console.log(
      `Initial sourceLang: ${globalSourceLang}, targetLang: ${globalTargetLang}`
    );
  }, []);

  const init = async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = localStream;
      localStreamRef.current = localStream;

      const peer = new Peer(undefined, peerConfig1);
      peerRef.current = peer;

      peer.on("open", (id) => {
        setMyId(id);
      });

      peer.on("call", (incomingCall) => {
        console.log("Receiving call...");
        incomingCall.answer(localStream);
        incomingCall.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });
      });

      peer.on("connection", (connection) => {
        connRef.current = connection;
        connection.on("data", (data) => {
          if (data.type === "message") {
            setMessages((msgs) => [
              ...msgs,
              { text: data.text, isMine: false },
            ]);
          } else if (data.type === "transcript") {
            // Directly set the subtitle with the translated text received from the peer
            setSubtitle(data.text);
          } else if (data.type === "disconnect") {
            // Handle the incoming disconnect message
            console.log("Peer has disconnected");
            disconnect(); // Clean up and update the state on receiving side
          }
        });
        connection.on("open", () => {
          setConnected(true);
          setRecId(connection.peer);
          console.log(`Peer 1 language settings after connection:`);
          console.log(`Source Language: ${globalSourceLang}`);
          console.log(`Target Language: ${globalTargetLang}`);
          startRealTimeTranscription(); // Start transcription after connection
        });
      });
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  const sendTranscriptToPeer = async (transcript) => {
    console.log(`Sending transcript: ${transcript}`);
    console.log(
      `Using source language: ${globalSourceLang} and target language: ${globalTargetLang}`
    );

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/translate`,
        {
          q: transcript,
          source: globalSourceLang,
          target: globalTargetLang,
          format: "text",
        }
      );

      const translatedText = response.data.data.translations[0].translatedText;
      console.log(`Translated text: ${translatedText}`);

      // Send the translated text to the peer
      if (connRef.current && connRef.current.open) {
        connRef.current.send({ type: "transcript", text: translatedText });
      }
    } catch (error) {
      console.error("Error translating and sending transcript:", error);
    }
  };
  const startRealTimeTranscription = () => {
    // Check if MediaRecorder is supported
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      console.error('MediaRecorder not supported on this browser.');
      return;
    }
  
    // Start capturing audio from the user's microphone
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
  
        const audioChunks = [];
  
        // Handle data available event to collect audio chunks
        recorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
  
          // When a chunk is available, convert it to Base64 and send it to the backend
          if (recorder.state === 'recording') {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            convertBlobToBase64(audioBlob).then((audioBase64) => {
              sendAudioToBackend(audioBase64, globalSourceLang);
            });
          }
        };
  
        recorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());
        };
  
        // Start recording audio
        recorder.start(3000); // Adjust the interval as needed to send chunks frequently
        console.log('Audio recording started');
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });
  };
  

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  
  const sendAudioToBackend = async (audioBase64, languageCode) => {
    const maxRetries = 3; // Set a maximum number of retry attempts
    let attempt = 0;
  
    while (attempt < maxRetries) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/speech-to-text`,
          {
            audioBase64,
            languageCode,
          },
          { timeout: 10000 } // Increase timeout to handle slow responses
        );
  
        if (response.data.results) {
          const transcript = response.data.results
            .map((result) => result.alternatives[0].transcript)
            .join('\n');
          sendTranscriptToPeer(transcript); // Send transcript to the peer for display
          break; // Exit the loop on successful transcription
        } else {
          console.error('Unexpected response format:', response.data);
          break; // Exit the loop if the response format is unexpected
        }
      } catch (error) {
        attempt++;
        console.error(`Error transcribing audio (Attempt ${attempt}):`, error);
  
        // Check if it's a network error and retry if needed
        if (attempt >= maxRetries || !error.isAxiosError || error.code !== 'ERR_NETWORK') {
          console.error('Failed to transcribe audio after multiple attempts.');
          break;
        }
  
        // Optional: Add a delay before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  };
  
  
  const connect = (e) => {
    e.preventDefault();

    // Ensure the peer object is initialized before connecting
    if (
      !peerRef.current ||
      peerRef.current.disconnected ||
      peerRef.current.destroyed
    ) {
      // If the peer object is not initialized or has been destroyed, reinitialize it
      peerRef.current = new Peer(undefined, peerConfig1);

      // Set up basic event handlers for the newly initialized peer object
      peerRef.current.on("open", (id) => {
        setMyId(id);
        console.log("Peer connection opened with ID:", id);
      });

      peerRef.current.on("error", (err) => {
        console.error("Peer error:", err);
        disconnect(); // Ensure proper cleanup on errors
      });
    }

    // Proceed with connection only if peerRef.current is properly initialized
    if (!connected) {
      try {
        const connection = peerRef.current.connect(recId);
        connRef.current = connection;
        console.log("Attempting to connect to peer with ID:", recId);

        // Set up event handlers for the connection
        connection.on("open", () => {
          setConnected(true);
          console.log("Connection opened with peer:", recId);

          connection.on("data", (data) => {
            if (data.type === "message") {
              setMessages((msgs) => [
                ...msgs,
                { text: data.text, isMine: false },
              ]);
            } else if (data.type === "transcript") {
              setSubtitle(data.text); // Display the translated text received from the peer
            } else if (data.type === "disconnect") {
              console.log("Peer has disconnected");
              disconnect(); // Handle the disconnect message from the peer
            }
          });

          // Make a call to the peer
          const call = peerRef.current.call(recId, localStreamRef.current);
          callRef.current = call;

          call.on("stream", (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream; // Set the remote video stream
          });

          startRealTimeTranscription(); // Start transcription after the connection is established
        });

        connection.on("error", (err) => {
          console.error("Connection error:", err);
          disconnect(); // Handle connection errors by disconnecting safely
        });
      } catch (error) {
        console.error("Error during connection attempt:", error);
        disconnect();
      }
    } else {
      disconnect(); // Handle disconnection if already connected
    }
  };

  const disconnect = () => {
    // Notify the other peer if connected
    if (connRef.current && connRef.current.open) {
      connRef.current.send({ type: "disconnect" }); // Notify the peer of the disconnection
    }

    // Close the call and peer connection safely
    if (callRef.current) callRef.current.close();
    if (connRef.current) connRef.current.close();
    if (peerRef.current) peerRef.current.destroy();

    // Stop local and remote streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
      remoteVideoRef.current.srcObject = null;
    }

    // Safely stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // Prevent restarting on end event
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.warn("Error stopping recognition:", error);
      }
      recognitionRef.current = null;
    }

    // Update state to reflect disconnection
    setConnected(false);
    setRecId("");
    localVideoRef.current.srcObject = null;
    remoteVideoRef.current.srcObject = null;
  };

  const sendMessage = (e) => {
    e.preventDefault();

    const message = chatMessageRef.current.value;
    if (connRef.current && connRef.current.open) {
      connRef.current.send({ type: "message", text: message });
      setMessages((msgs) => [...msgs, { text: message, isMine: true }]);
      chatMessageRef.current.value = "";
    } else {
      console.log("Connection is not open.");
    }
  };

  useEffect(() => {
    init();

    return () => {
      disconnect();
    };
  }, []);

  return (
    <div
      id="videot"
      className="relative w-full h-full max-w-[680px] bg-gray-800 bg-opacity-70 rounded-3xl p-6 mx-auto my-12 text-white"
    >
      {showPopup && (
        <PopupMessage
          message={
            <>
              Follow these steps to start your video chat:
              <br />
              1. Copy your Nickname (click the box to copy).
              <br />
              2. Share your Nickname ID with the other person.
              <br />
              3. Set your Source Language to the language you speak,
              <br />
              and Target Language to the language the other person speaks.
              <br />
              4. The person who received the ID should click 'Connect' to start.
            </>
          }
          onClose={() => setShowPopup(false)}
          nickname={myId} // Pass the nickname to the PopupMessage component
        />
      )}
      <button
        className="absolute top-4 right-4 text-2xl"
        onClick={() => {
          disconnect();
          onClose();
        }}
      >
        <i className="fa-solid fa-xmark text-white"></i>
      </button>
      <button className="absolute top-4 right-12 text-2xl" onClick={toggleMute}>
        <i
          className={`fa-solid ${
            isMuted ? "fa-microphone-slash" : "fa-microphone"
          } text-white`}
        ></i>
      </button>

      <h1 className="text-3xl text-center py-4">Video Translation</h1>
      <form onSubmit={connect}>
        <div className="mb-4 relative">
          <label
            htmlFor="myId"
            className="block text-sm font-medium text-gray-300"
          >
            My Nickname
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              id="myId"
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-200 pr-10"
              value={myId}
              readOnly
              onClick={(e) => e.target.select()}
            />
            {/* Position the ShareButton inside the text box */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <ShareButton code={myId} />{" "}
              {/* This is where the ShareButton is placed */}
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="recId"
            className="block text-sm font-medium text-gray-300"
          >
            Recipient
          </label>
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
          <label
            htmlFor="sourceLang"
            className="block text-sm font-medium text-gray-300"
          >
            Source Language
          </label>
          <select
            id="sourceLang"
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-200"
            value={globalSourceLang}
            onChange={(e) =>
              handleLanguageChange(e.target.value, globalTargetLang)
            }
          >
            {Object.entries(languages).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="targetLang"
            className="block text-sm font-medium text-gray-300"
          >
            Target Language
          </label>
          <select
            id="targetLang"
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-200"
            value={globalTargetLang}
            onChange={(e) =>
              handleLanguageChange(globalSourceLang, e.target.value)
            }
          >
            {Object.entries(languages).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="py-2">
          <button
            type="submit"
            className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              connected
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {connected ? "Disconnect" : "Connect"}
          </button>
        </div>
      </form>
      <div className="flex justify-center gap-4 mt-4">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-1/2 border border-gray-600 rounded-md"
        ></video>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-1/2 border border-gray-600 rounded-md"
        ></video>
      </div>
      {connected && (
        <div className="mt-4">
          <div className="mb-4 bg-gray-700 p-4 rounded-md overflow-y-auto h-32">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg.isMine
                    ? "text-right text-blue-400"
                    : "text-left text-gray-400"
                }`}
              >
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
      <div id="statusBar" className="text-center text-gray-300 mt-2">
        {connected ? "connected" : "not connected"}
      </div>
      {connected && (
        <div className="absolute bottom-4 w-full text-center text-white bg-gray-900 bg-opacity-75 p-2 rounded-md">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default VideoChat;