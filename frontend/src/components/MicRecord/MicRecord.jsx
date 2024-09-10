import { h } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import axios from 'axios';

const MicRecord = ({ onTranscript, sourceLang, onStartRecording, onStopRecording }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingMessage, setRecordingMessage] = useState('');
  const [stream, setStream] = useState(null);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const recognitionRef = useRef(null);

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
        stopAnalyzing();
      };

      startAnalyzing(stream);

      // Start real-time transcription
      if (!('webkitSpeechRecognition' in window)) {
        setRecordingMessage('Speech recognition not supported in this browser.');
        return;
      }

      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = sourceLang;

      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          interimTranscript += event.results[i][0].transcript;
        }
        onTranscript(interimTranscript);
      };

      recognition.onerror = (event) => {
        setRecordingMessage(`Error occurred in recognition: ${event.error}`);
      };

      recognitionRef.current = recognition;
      recognition.start();

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
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    stopAnalyzing();
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
      if (onTranscript) {
        onTranscript(transcript);
      }
    } catch (error) {
      setRecordingMessage(`Error transcribing audio: ${error.response ? error.response.data.error.message : error.message}`);
    }
  };

  const startAnalyzing = (stream) => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
    sourceRef.current.connect(analyserRef.current);
    analyserRef.current.fftSize = 2048;
    const bufferLength = analyserRef.current.fftSize;
    dataArrayRef.current = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    if (!canvas) return; // Ensure canvas is available
    const canvasCtx = canvas.getContext('2d');

    const draw = () => {
      if (!canvasCtx) return; // Ensure canvas context is available

      analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      canvasCtx.fillStyle = 'rgba(255, 255, 255, 0)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(0, 0, 255)'; // Change the color of the waveform here

      canvasCtx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArrayRef.current[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();

      animationFrameIdRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const stopAnalyzing = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    const canvas = canvasRef.current;
    if (!canvas) return; // Ensure canvas is available
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return; // Ensure canvas context is available
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row items-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`bg-gradient-to-r from-[#4A90E2] to-[#50B3A2] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full ${isRecording ? 'bg-red-500' : ''}`}
        >
          <i className={`fa-solid ${isRecording ? 'fa-microphone-slash' : 'fa-microphone'} text-2xl`} />
        </button>
        {recordingMessage && <p className="text-gray-500 ml-4">{recordingMessage}</p>}
      </div>
      {isRecording && (
        <canvas ref={canvasRef} width="200" height="50" className="mt-4"></canvas>
      )}
    </div>
  );
};

export default MicRecord;
