// src/components/MicRecord.jsx
import { h } from "preact";
import { useMicRecord } from "../../hooks/useMicRecord"; // Import the new hook

const MicRecord = ({
  onTranscript,
  sourceLang,
  onStartRecording,
  onStopRecording,
}) => {
  const {
    isRecording,
    startRecording,
    stopRecording,
    recordingMessage,
    canvasRef,
  } = useMicRecord(onTranscript, sourceLang, onStartRecording, onStopRecording);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row items-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`bg-gradient-to-r from-[#4A90E2] to-[#50B3A2] hover:bg-blue-700 text-[#2d2d2d] text-opacity-50 font-bold py-2 px-4 rounded-full ${
            isRecording ? "bg-red-500" : ""
          }`}
        >
          <i
            className={`fa-solid ${
              isRecording ? "fa-microphone-slash" : "fa-microphone"
            } text-2xl`}
          />
        </button>
        {isRecording && (
          <canvas
            ref={canvasRef}
            width="150"
            height="50"
            className="ml-4"
          ></canvas>
        )}
        {recordingMessage && (
          <p className="text-gray-500 ml-4">{recordingMessage}</p>
        )}
      </div>
    </div>
  );
};

export default MicRecord;
