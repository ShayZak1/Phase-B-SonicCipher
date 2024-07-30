import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import axios from 'axios';

const TextToSpeech = ({ text, languageCode }) => {
  const [audioUrl, setAudioUrl] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    const convertTextToSpeech = async () => {
      if (!text) return;

      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/text-to-speech`, {
          text,
          languageCode,
        });
        setAudioUrl(response.data.audioContent);
      } catch (error) {
        console.error('Error converting text to speech:', error);
      }
    };

    convertTextToSpeech();
  }, [text, languageCode]);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      // Try to play the audio
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  }, [audioUrl]);

  return (
    <div className="text-to-speech">
      {audioUrl && <audio ref={audioRef} controls src={`data:audio/mp3;base64,${audioUrl}`}></audio>}
    </div>
  );
};

export default TextToSpeech;
