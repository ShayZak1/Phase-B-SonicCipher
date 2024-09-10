import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import axios from 'axios';
import { FaPlay, FaPause } from 'react-icons/fa'; // Import Play and Pause icons

const TextToSpeech = ({ text, languageCode }) => {
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [voice, setVoice] = useState('female');
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const convertTextToSpeech = async () => {
      if (!text) return;

      setLoading(true);
      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/text-to-speech`, {
          text,
          languageCode,
          voice,
        });
        setAudioUrl(response.data.audioContent);
      } catch (error) {
        alert('Error converting text to speech. Please try again later.');
        console.error('Error converting text to speech:', error);
      } finally {
        setLoading(false);
      }
    };

    convertTextToSpeech();
  }, [text, languageCode, voice]);

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
        console.error('Error playing audio:', error);
      });
    }
  }, [audioUrl]);

  return (
    <div className="text-to-speech flex flex-col items-center">
      <div className="flex gap-2 mb-2 justify-center">
        <button
          className={`px-4 py-1 rounded ${voice === 'male' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
          onClick={() => setVoice('male')}
        >
          Male Voice
        </button>
        <button
          className={`px-4 py-1 rounded ${voice === 'female' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
          onClick={() => setVoice('female')}
        >
          Female Voice
        </button>
      </div>
      {loading && <p>Loading audio...</p>}
      {audioUrl && (
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className={`play-pause-btn ${isPlaying ? 'bg-red-500' : 'bg-green-500'} text-white rounded-full p-2 transition-colors duration-300 hover:bg-opacity-80 flex items-center justify-center`}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <audio ref={audioRef} src={`data:audio/mp3;base64,${audioUrl}`} hidden></audio>
        </div>
      )}
    </div>
  );
};

export default TextToSpeech;
