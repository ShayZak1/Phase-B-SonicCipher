// src/api/TextToSpeechApi.js

import axios from "axios";

// Function to convert text to speech using the backend API
export const convertTextToSpeech = async (text, languageCode, voiceGender) => {
  if (!text) return null;

  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/text-to-speech`,
      {
        ssml: `<speak><voice gender="${voiceGender}">${text}</voice></speak>`,
        languageCode,
      }
    );
    return response.data.audioContent;
  } catch (error) {
    console.error("Error converting text to speech:", error);
    throw new Error("Error converting text to speech. Please try again later.");
  }
};
