import { h } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import axios from "axios";
import { FaPlay, FaPause } from "react-icons/fa";

const TextToSpeech = ({ text, languageCode, voiceGender }) => {
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const convertTextToSpeech = async () => {
      if (!text) return;

      setLoading(true);
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/text-to-speech`,
          {
            ssml: `<speak><voice gender="${voiceGender}">${text}</voice></speak>`,
            languageCode,
          }
        );
        setAudioUrl(response.data.audioContent);
      } catch (error) {
        alert("Error converting text to speech. Please try again later.");
        console.error("Error converting text to speech:", error);
      } finally {
        setLoading(false);
      }
    };

    convertTextToSpeech();
  }, [text, languageCode, voiceGender]);

  const togglePlay = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  }, [audioUrl]);

  return (
    <div className="text-to-speech flex flex-col items-center">
      {loading && <p>Loading audio...</p>}
      {audioUrl && (
        <div className="flex items-center">
          <button
            onClick={togglePlay}
            className="relative flex items-center bg-[#2d2d2d] rounded-full w-56 p-2 shadow-md overflow-hidden transition duration-300 hover:bg-opacity-80"
          >
            {/* Play/Pause Button */}
            <div className="flex items-center justify-center w-10 h-10 bg-yellow-500 rounded-full mr-2">
              {isPlaying ? (
                <FaPause className="text-white" />
              ) : (
                <FaPlay className="text-white" />
              )}
            </div>
            {/* Animated Waveform Effect */}
            <div
              className="absolute left-14 top-1/2 transform -translate-y-1/2 w-full h-2"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, #FFD700, #FFD700 2px, transparent 2px, transparent 4px)",
                animation: "waveMove 2s linear infinite", // Directly add animation here
                backgroundSize: "200% 100%", // Ensure it scrolls properly
              }}
            ></div>
          </button>
          <audio
            ref={audioRef}
            src={`data:audio/mp3;base64,${audioUrl}`}
            hidden
          ></audio>
        </div>
      )}
    </div>
  );
};

export default TextToSpeech;
