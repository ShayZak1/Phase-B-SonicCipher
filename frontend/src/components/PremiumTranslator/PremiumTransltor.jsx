import { h } from 'preact';
import { useState } from 'preact/hooks';
import axios from 'axios';

const PremiumTranslator = ({ inputText, sourceLang, targetLang, onTranslate, convertTextToSpeech }) => {
  const [additionalText, setAdditionalText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  const handleAdditionalTextChange = (e) => {
    setAdditionalText(e.target.value);
  };

  const translateText = async () => {
    try {
      const response = await axios.post('http://localhost:5000/openai-translate', {
        q: inputText,
        source: sourceLang,
        target: targetLang,
        format: "text",
        additionalText: additionalText
      });
      const translated = response.data.data.translations[0].translatedText;
      onTranslate(translated);
      convertTextToSpeech(translated, targetLang);
    } catch (error) {
      console.error("Error translating text:", error);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <textarea
        className="textarea w-full p-2 border border-gray-300 rounded-lg h-32"
        placeholder="Additional specifications for premium translation"
        value={additionalText}
        onChange={handleAdditionalTextChange}
      ></textarea>
      <div className="flex flex-col justify-center items-center gap-4">
        <button
          className="w-12 h-12 bg-gradient-to-r from-[#b6f492] to-[#338b93] rounded-full text-2xl text-gray-600 flex justify-center items-center active:translate-y-[1px]"
          onClick={translateText}
        >
          <i className="fa-solid fa-chevron-down"></i>
        </button>
      </div>
      {audioUrl && <audio controls src={`data:audio/mp3;base64,${audioUrl}`} />}
    </div>
  );
};

export default PremiumTranslator;
