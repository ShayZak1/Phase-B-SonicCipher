import { useRef, useEffect } from 'react';
import axios from 'axios';

const WebRTCAudioCapture = () => {
  const audioStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    // Function to start capturing audio with WebRTC
    const startAudioCapture = async () => {
      try {
        // Request access to the user's microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;

        // Set up MediaRecorder to capture audio chunks
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
        mediaRecorderRef.current = mediaRecorder;

        // Event listener for data available from the MediaRecorder
        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            const audioBlob = new Blob([event.data], { type: 'audio/webm' });
            const audioBase64 = await convertBlobToBase64(audioBlob);
            sendAudioToBackend(audioBase64, 'en-US'); // Change language code as needed
          }
        };

        // Start recording audio chunks at intervals
        mediaRecorder.start(1000); // Adjust interval (in milliseconds) as needed
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    // Utility function to convert audio Blob to Base64 string
    const convertBlobToBase64 = (blob) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    // Function to send audio data to the backend
    const sendAudioToBackend = async (audioBase64, languageCode) => {
      try {
        const response = await axios.post('/api/speech-to-text', {
          audioBase64,
          languageCode,
        });

        if (response.data.results) {
          const transcript = response.data.results
            .map((result) => result.alternatives[0].transcript)
            .join('\n');
          console.log('Transcript:', transcript); // Display transcript or update the UI
        } else {
          console.error('Unexpected response format:', response.data);
        }
      } catch (error) {
        console.error('Error transcribing audio:', error);
      }
    };

    // Start audio capture on component mount
    startAudioCapture();

    // Cleanup function to stop the audio stream
    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return <div>Recording Audio with WebRTC...</div>;
};

export default WebRTCAudioCapture;
