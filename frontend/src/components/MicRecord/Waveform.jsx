// src/components/Waveform.jsx

import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";

const Waveform = ({ audioRef, isActive }) => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  useEffect(() => {
    if (isActive && audioRef.current) {
      startAnalyzing();
    } else {
      stopAnalyzing();
    }
    return () => stopAnalyzing(); // Cleanup when the component is unmounted
  }, [isActive]);

  const startAnalyzing = () => {
    // Create AudioContext and AnalyserNode if not already created
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      const bufferLength = analyserRef.current.fftSize;
      dataArrayRef.current = new Uint8Array(bufferLength);

      // Connect the audio element to the analyser node
      sourceRef.current = audioContextRef.current.createMediaElementSource(
        audioRef.current
      );
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }

    draw();
  };

  const stopAnalyzing = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext("2d");

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

    const sliceWidth = (canvas.width * 1.0) / dataArrayRef.current.length;
    let x = 0;

    for (let i = 0; i < dataArrayRef.current.length; i++) {
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

  return <canvas ref={canvasRef} width="120" height="50" className="ml-4" />;
};

export default Waveform;
