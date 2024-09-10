import axios from 'axios';

export const translateText = async ({ inputText, sourceLang, targetLang, plan, setTranslatedText, convertTextToSpeech }) => {
  const url = plan === "Free" ? '/translate' : '/openai-translate';
  const payload = {
    q: inputText,
    source: sourceLang,
    target: targetLang,
    format: "text",
  };

  if (plan !== "Free") {
    payload.additionalText = "Please use Hebrew slang.";
  }

  try {
    const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}${url}`, payload);
    const translated = response.data.data.translations[0].translatedText;
    setTranslatedText(translated);
    convertTextToSpeech(translated, targetLang);
  } catch (error) {
    console.error(`Error translating text:`, error);
  }
};

export const convertTextToSpeech = async (text, languageCode, setAudioUrl) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/text-to-speech`, { text, languageCode });
    setAudioUrl(response.data.audioContent);
  } catch (error) {
    console.error('Error converting text to speech:', error);
  }
};
