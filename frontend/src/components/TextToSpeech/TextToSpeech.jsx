import { h } from 'preact';
import { useState } from 'preact/hooks';
import axios from 'axios';

const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const convertTextToSpeech = async () => {
    try {
      const response = await axios.post('http://localhost:5000/text-to-speech', {
        text,
        languageCode: 'en-US' // You can make this dynamic based on user input
      });
      setAudioUrl(response.data.audioContent);
    } catch (error) {
      console.error('Error converting text to speech:', error);
    }
  };

  return (
    <div className="text-to-speech">
      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder="Enter text to convert to speech"
      ></textarea>
      <button onClick={convertTextToSpeech}>Convert to Speech</button>
      {audioUrl && <audio controls src={`data:audio/mp3;base64,${audioUrl}`}></audio>}
    </div>
  );
};

export default TextToSpeech;
