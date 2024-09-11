// src/api/MicRecordApi.js

import axios from "axios";

// Function to send audio data to the backend for transcription
export const sendAudioToBackend = async (audioBase64, languageCode) => {
  if (!audioBase64 || audioBase64.length < 10) {
    // Do nothing if there's no audio data or it's too short
    return;
  }

  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/speech-to-text`,
      {
        audioBase64,
        languageCode,
      }
    );
    // Extract and return the transcript
    return response.data.results
      .map((result) => result.alternatives[0].transcript)
      .join("\n");
  } catch (error) {
    console.error("Error transcribing audio:", error);
    // Throw error message for handling in the component
    throw new Error("Error transcribing audio");
  }
};
