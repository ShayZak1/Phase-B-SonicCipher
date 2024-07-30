import { h } from 'preact';
import { useState } from 'preact/hooks';
import axios from 'axios';

const MicRecord = ({ onTranscript, sourceLang, onStartRecording, onStopRecording }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingMessage, setRecordingMessage] = useState('');
  const [stream, setStream] = useState(null);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      onStartRecording(); // Notify that recording has started
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(stream);
      
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/ogg;codecs=opus';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/ogg';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = '';
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      setMediaRecorder(recorder);
      recorder.start();

      const audioChunks = [];
      recorder.ondataavailable = event => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType || 'audio/webm' });
        const audioBase64 = await convertBlobToBase64(audioBlob);
        await sendAudioToBackend(audioBase64);
        onStopRecording(); // Notify that recording has stopped
      };
    } catch (error) {
      setIsRecording(false);
      setRecordingMessage(`Error accessing microphone: ${error.message}`);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
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

  const sendAudioToBackend = async (audioBase64) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/speech-to-text`, {
        audioBase64,
        languageCode: sourceLang,
      });
      const transcript = response.data.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      console.log('Transcript: ', transcript);
      if (onTranscript) {
        onTranscript(transcript);
      }
    } catch (error) {
      console.error('Error transcribing audio:', error.response ? error.response.data : error.message);
      setRecordingMessage(`Error transcribing audio: ${error.response ? error.response.data.error.message : error.message}`);
    }
  };

  return (
    <div className="flex flex-row justify-center items-center">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mb-2 ${isRecording ? 'bg-red-500' : ''}`}
      >
        <i className={`fa-solid ${isRecording ? 'fa-microphone-slash' : 'fa-microphone'} text-2xl`} />
      </button>
      {isRecording && <p className="text-red-500 font-bold">Recording...</p>}
      {recordingMessage && <p className="text-gray-500">{recordingMessage}</p>}
    </div>
  );
};

export default MicRecord;
