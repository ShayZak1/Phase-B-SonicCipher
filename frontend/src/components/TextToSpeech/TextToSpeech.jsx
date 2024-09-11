import { h } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import { FaPlay, FaPause } from "react-icons/fa";
import { convertTextToSpeech } from "../../api/TextToSpeechApi";
import Waveform from "../MicRecord/Waveform";

const TextToSpeech = ({ text, languageCode, voiceGender }) => {
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchAudio = async () => {
      setLoading(true);
      try {
        const audioContent = await convertTextToSpeech(
          text,
          languageCode,
          voiceGender
        );
        setAudioUrl(audioContent);
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAudio();
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
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [audioUrl]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    const handleEnded = () => setIsPlaying(false);
    audioElement.addEventListener("ended", handleEnded);
    return () => audioElement.removeEventListener("ended", handleEnded);
  }, [audioRef, isPlaying]);

  return (
    <div className="text-to-speech flex flex-col items-center">
      {loading && <p>Loading audio...</p>}
      {audioUrl && (
        <div className="flex items-center">
          <button
            onClick={togglePlay}
            className="relative flex items-center bg-[#2d2d2d] rounded-full w-56 p-2 shadow-md overflow-hidden transition duration-300 hover:bg-opacity-80"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#4A90E2] to-[#50B3A2] rounded-full mr-2">
              {isPlaying ? (
                <FaPause className="text-white" />
              ) : (
                <FaPlay className="text-white" />
              )}
            </div>
            <Waveform
              audioRef={audioRef}
              isActive={isPlaying}
              className="absolute left-14 top-1/2 transform -translate-y-1/2 w-[calc(100%-3.5rem)] h-2"
            />
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
