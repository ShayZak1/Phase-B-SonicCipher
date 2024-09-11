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
  profileSettings, // Prop to get profile settings from the parent component
}) => {
  const [additionalText, setAdditionalText] = useState("");

  const handleAdditionalTextChange = (e) => {
    setAdditionalText(e.target.value);
  };

  const translateText = async () => {
    if (!triggerTranslate) return;

    // Combine additional specifications from profile and the current textarea
    const combinedAdditionalText = `${
      profileSettings?.additionalText || ""
    } ${additionalText}`.trim();

    try {
      // Send the combined specifications to the backend
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/openai-translate`,
        {
          q: inputText,
          source: sourceLang,
          target: targetLang,
          format: "text",
          additionalText: combinedAdditionalText, // Send combined additional text
          tone: profileSettings?.tone || "neutral",
          formality: profileSettings?.formality || "formal",
        }
      );

      const translated = response.data.data.translations[0].translatedText;
      onTranslate(translated);
      convertTextToSpeech(translated, targetLang);
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