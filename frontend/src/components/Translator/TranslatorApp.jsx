import { h } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import axios from 'axios';
import { languages } from '../../LanguageData';
import MicRecord from '../MicRecord/MicRecord';
import PremiumTranslator from '../PremiumTranslator/PremiumTransltor';

const TranslatorApp = ({ onClose }) => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en-GB");
  const [targetLang, setTargetLang] = useState("he-IL");
  const [showLanguages, setShowLanguages] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [currentLanguageSelection, setCurrentLanguageSelection] = useState(null);
  const [audioUrl, setAudioUrl] = useState(''); // To store the audio URL
  const [plan, setPlan] = useState("Free"); // State to manage the selected plan
  const dropdownRef = useRef(null);
  const textareaRef = useRef(null); // Ref for textarea
  const maxChars = 200;

  const handleMaxChar = (e) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setInputText(value);
      setCharCount(value.length);
    }
  };

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setShowLanguages(false);
    }
  };

  useEffect(() => {
    if (showLanguages) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showLanguages]);

  const handleLanguageClick = (type) => {
    setCurrentLanguageSelection(type);
    setShowLanguages(true);
  };

  const handleLanguageSelect = (LanguageCode) => {
    if (currentLanguageSelection === 'from') {
      setSourceLang(LanguageCode);
    } else {
      setTargetLang(LanguageCode);
    }
    setShowLanguages(false);
  };

  const handleSwapLanguage = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  const translateText = async () => {
    if (plan === "Free") {
      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/translate`, {
          q: inputText,
          source: sourceLang,
          target: targetLang,
          format: "text",
        });
        const translated = response.data.data.translations[0].translatedText;
        setTranslatedText(translated);
        convertTextToSpeech(translated, targetLang);
      } catch (error) {
        console.error("Error translating text:", error);
      }
    } else {
      // Premium plan translation handled in PremiumTranslator component
    }
  };

  const convertTextToSpeech = async (text, languageCode) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/text-to-speech`, {
        text,
        languageCode,
      });
      setAudioUrl(response.data.audioContent);
    } catch (error) {
      console.error('Error converting text to speech:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      translateText();
    }
  };

  const handleTranscript = (transcript) => {
    if (transcript.length + inputText.length <= maxChars) {
      setInputText(prevText => prevText + transcript);
      setCharCount(prevCount => prevCount + transcript.length);
    }
  };

  const handleStartRecording = () => {
    setInputText(""); // Clear the text box when recording starts
    setCharCount(0); // Reset the character count
    setTranslatedText("");
  };

  const handleStopRecording = () => {
    // Programmatically press the Enter key
    setTimeout(() => {
      if (textareaRef.current) {
        const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        textareaRef.current.dispatchEvent(event);
      }
    }, 100); // Slight delay to ensure state is updated
  };

  return (
    <div className="w-full h-full max-h-screen flex flex-col gap-4 justify-center items-center px-6 sm:px-2 pt-12 pb-6 relative overflow-hidden translator-upbg">
      <button className="absolute top-4 right-4" onClick={onClose}>
        <i className="fa-solid fa-xmark text-xl text-white"></i>
      </button>

      <div className="flex justify-center gap-4 my-4">
        <button
          className={`px-4 py-2 w-32 rounded ${plan === "Free" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}
          onClick={() => setPlan("Free")}
        >
          Free
        </button>
        <button
          className={`px-4 py-2 w-32 rounded ${plan === "Premium" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}
          onClick={() => setPlan("Premium")}
        >
          Premium
        </button>
      </div>

      <div className="w-full flex justify-center items-center gap-4">
        <div
          className="flex-1 bg-gradient-to-r from-[#b6f492] to-[#338b93] text-gray-700 py-2 px-4 rounded-lg cursor-pointer text-center hover:bg-green-300"
          onClick={() => handleLanguageClick('from')}
        >
          {languages[sourceLang] || sourceLang}
        </div>
        <i
          className="fa-solid fa-arrows-rotate text-2xl cursor-pointer mx-2 text-white"
          onClick={handleSwapLanguage}
        ></i>
        <div
          className="flex-1 bg-gradient-to-r from-[#b6f492] to-[#338b93] text-gray-700 py-2 px-4 rounded-lg cursor-pointer text-center hover:bg-green-300"
          onClick={() => handleLanguageClick('to')}
        >
          {languages[targetLang] || targetLang}
        </div>
      </div>

      {showLanguages && (
        <div
          className="w-[calc(100%-4rem)] h-[calc(100%-9rem)] bg-white absolute top-32 left-8 z-10 rounded shadow-lg p-4 overflow-y-scroll"
          ref={dropdownRef}
        >
          <ul>
            {Object.entries(languages).map(([code, name]) => (
              <li
                className="cursor-pointer hover:bg-[#10646b] transition duration-200 p-2 rounded"
                key={code}
                onClick={() => handleLanguageSelect(code)}
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="w-full relative flex-1">
        <textarea
          className="textarea w-full p-2 border border-gray-300 rounded-lg h-full"
          value={inputText}
          onChange={handleMaxChar}
          onKeyDown={handleKeyDown}
          ref={textareaRef}
        ></textarea>
        <div className="absolute bottom-2 right-4 text-gray-400">{inputText.length}/200</div>
      </div>

      {plan === "Premium" && (
        <PremiumTranslator
          inputText={inputText}
          sourceLang={sourceLang}
          targetLang={targetLang}
          onTranslate={setTranslatedText}
          convertTextToSpeech={convertTextToSpeech}
        />
      )}

      <div className="flex justify-center items-center gap-4 mt-4">
        <MicRecord
          onTranscript={handleTranscript}
          sourceLang={sourceLang}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
        />
        {plan !== "Premium" && (
          <button
            className="w-12 h-12 bg-gradient-to-r from-[#b6f492] to-[#338b93] rounded-full text-2xl text-gray-600 flex justify-center items-center active:translate-y-[1px]"
            onClick={translateText}
          >
            <i className="fa-solid fa-chevron-down"></i>
          </button>
        )}
      </div>

      <div className="w-full relative flex-1">
        <textarea className="textarea w-full p-2 border border-gray-300 rounded-lg h-full" value={translatedText} readOnly></textarea>
        <div className="absolute bottom-2 right-4 text-gray-400">{translatedText.length}/200</div>
      </div>

      {audioUrl && <audio controls src={`data:audio/mp3;base64,${audioUrl}`} />}
    </div>
  );
};

export default TranslatorApp;
