import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import axios from 'axios';

const PremiumTranslator = ({ inputText, sourceLang, targetLang, onTranslate, convertTextToSpeech, triggerTranslate }) => {
  const [additionalText, setAdditionalText] = useState("");

  const handleAdditionalTextChange = (e) => {
    setAdditionalText(e.target.value);
  };

  const translateText = async () => {
    if (!triggerTranslate) return;
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/openai-translate`, {
        q: inputText,
        source: sourceLang,
        target: targetLang,
        format: "text",
        additionalText: additionalText,
      });
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
