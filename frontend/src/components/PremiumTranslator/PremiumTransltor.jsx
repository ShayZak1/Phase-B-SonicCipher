import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import axios from "axios";

const PremiumTranslator = ({
  inputText,
  sourceLang,
  targetLang,
  onTranslate,
  convertTextToSpeech,
  triggerTranslate,
  profileSettings, // New prop to accept profile settings
}) => {
  const [additionalText, setAdditionalText] = useState(
    profileSettings?.additionalText || ""
  ); // Initialize with profile additionalText if available

  const handleAdditionalTextChange = (e) => {
    setAdditionalText(e.target.value);
  };

  const translateText = async () => {
    if (!triggerTranslate) return;
    try {
      // Prepare the data to send to the backend, including profile settings
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/openai-translate`,
        {
          q: inputText,
          source: sourceLang,
          target: targetLang,
          format: "text",
          additionalText: additionalText, // Include additional text entered by the user
          tone: profileSettings?.tone || "neutral", // Include tone from profile settings
          formality: profileSettings?.formality || "formal", // Include formality from profile settings
        }
      );

      // Extract the translated text from the response
      const translated = response.data.data.translations[0].translatedText;
      onTranslate(translated); // Pass the translated text to the parent
      convertTextToSpeech(translated, targetLang); // Convert the translated text to speech
    } catch (error) {
      console.error("Error translating text:", error);
    }
  };

  useEffect(() => {
    if (triggerTranslate) {
      translateText();
    }
  }, [triggerTranslate]);

  return (
    <textarea
      className="textarea w-full p-2 border border-gray-300 rounded-lg h-20"
      placeholder="Additional specifications for premium translation"
      value={additionalText}
      onChange={handleAdditionalTextChange}
    ></textarea>
  );
};

export default PremiumTranslator;
