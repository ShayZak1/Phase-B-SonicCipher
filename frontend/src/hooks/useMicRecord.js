// hooks/useMicRecord.js
import { useState, useRef } from 'preact/hooks';
import { sendAudioToBackend } from '../api/MicRecordApi';

export const useMicRecord = (onTranscript, sourceLang, onStartRecording, onStopRecording) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingMessage, setRecordingMessage] = useState("");
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
      setRecordingMessage("");
      setIsRecording(true);
      onStartRecording();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(stream);

      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "audio/ogg;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "audio/ogg";
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      setMediaRecorder(recorder);
      recorder.start();

      const audioChunks = [];
      recorder.ondataavailable = (event) => audioChunks.push(event.data);

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType || "audio/webm" });
        const audioBase64 = await convertBlobToBase64(audioBlob);

        try {
          const transcript = await sendAudioToBackend(audioBase64, sourceLang);
          onTranscript && onTranscript(transcript);
        } catch {
          setRecordingMessage("Error transcribing audio.");
        }

        onStopRecording();
        stopAnalyzing();
      };

      startAnalyzing(stream);

      if (!("webkitSpeechRecognition" in window)) {
        setRecordingMessage("Speech recognition not supported in this browser.");
        return;
      }

      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = sourceLang;

      recognition.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          interimTranscript += event.results[i][0].transcript;
        }
        onTranscript(interimTranscript);
      };

      recognition.onerror = (event) => {
        setRecordingMessage(event.error !== "no-speech" ? `Error in recognition: ${event.error}` : "");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      setRecordingMessage(`Error accessing microphone: ${error.message}`);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorder && mediaRecorder.stop();
    stream && stream.getTracks().forEach((track) => track.stop());
    recognitionRef.current && recognitionRef.current.stop();
    stopAnalyzing();
  };

  const convertBlobToBase64 = (blob) => 
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const startAnalyzing = (stream) => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
    sourceRef.current.connect(analyserRef.current);
    analyserRef.current.fftSize = 2048;
    dataArrayRef.current = new Uint8Array(analyserRef.current.fftSize);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext("2d");

    const draw = () => {
      if (!canvasCtx) return;
      analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      canvasCtx.fillStyle = "rgba(255, 255, 255, 0)";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      canvasCtx.lineWidth = 2;

      const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "#4A90E2");
      gradient.addColorStop(1, "#50B3A2");
      canvasCtx.strokeStyle = gradient;

      canvasCtx.beginPath();
      const sliceWidth = (canvas.width * 1.0) / analyserRef.current.fftSize;
      let x = 0;

      for (let i = 0; i < analyserRef.current.fftSize; i++) {
        const v = dataArrayRef.current[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();

      animationFrameIdRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const stopAnalyzing = () => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const canvasCtx = canvas.getContext("2d");
      if (canvasCtx) {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    recordingMessage,
    canvasRef,
  };
};
