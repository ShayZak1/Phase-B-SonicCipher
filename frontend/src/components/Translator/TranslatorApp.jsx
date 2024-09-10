import { h } from 'preact';
import { useTranslator } from '../../hooks/useTranslator';
import { translateText, convertTextToSpeech } from '../../api/TranslatorAppApi';
import MicRecord from '../MicRecord/MicRecord';
import PremiumTranslator from '../PremiumTranslator/PremiumTransltor';
import TextToSpeech from '../TextToSpeech/TextToSpeech';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import { useState, useEffect } from 'preact/hooks';
import { languages } from '../../LanguageData';
import ShareButton from '../ShareButton/ShareButton';
import TranslationHistory from './TranslationHistory';
import SettingsCog from './SettingsCog';

const TranslatorApp = ({ onClose }) => {
  const {
    inputText, setInputText, translatedText, setTranslatedText,
    sourceLang, setSourceLang, targetLang, setTargetLang,
    showLanguages, setShowLanguages, charCount, setCharCount,
    currentLanguageSelection, setCurrentLanguageSelection,
    audioUrl, setAudioUrl, plan, setPlan,
    dropdownRef, textareaRef, audioRef,
    handleMaxChar, handleLanguageClick, handleLanguageSelect, handleSwapLanguage,
    history: translationHistory, handleSaveTranslation
  } = useTranslator();

  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [voiceGender, setVoiceGender] = useState('female');
  const [triggerTranslate, setTriggerTranslate] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTranslate();
    }
  };

  const handleTranslate = () => {
    if (plan === 'Free') {
      translateText({ inputText, sourceLang, targetLang, plan, setTranslatedText, convertTextToSpeech: (text, lang) => convertTextToSpeech(text, lang, setAudioUrl, voiceGender) });
    } else if (plan === 'Premium') {
      setTriggerTranslate(true); // Trigger translation in PremiumTranslator
    }
  };

  const handleCopy = (text) => navigator.clipboard.writeText(text);

  const handleTranscript = (transcript) => {
    if (transcript.length + inputText.length <= 200) {
      setInputText(transcript);
      setCharCount(transcript.length);
    }
  };

  const handleStartRecording = () => {
    setInputText(""); setCharCount(0); setTranslatedText("");
  };

  const handleStopRecording = () => {
    setTimeout(() => {
      if (textareaRef.current) {
        const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        textareaRef.current.dispatchEvent(event);
      }
    }, 100);
  };

  const toggleHistory = () => setIsHistoryVisible(!isHistoryVisible);

  useEffect(() => {
    if (inputText && translatedText) handleSaveTranslation(inputText, translatedText);
  }, [translatedText]);

  return (
    <div className="w-full h-full max-h-screen flex flex-col gap-4 justify-center items-center px-6 sm:px-2 pt-12 pb-6 relative overflow-hidden translator-upbg">
      <div className="absolute top-4 left-4 flex gap-2">
        <button onClick={toggleHistory} aria-label="Toggle history">
          <i className="fa-solid fa-clock text-xl text-white"></i>
        </button>
      </div>
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={onClose} aria-label="Close">
          <i className="fa-solid fa-xmark text-xl text-white"></i>
        </button>
      </div>
      <div className="flex justify-center gap-4 my-4">
        <button className={`px-4 py-2 w-32 rounded ${plan === "Free" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`} onClick={() => setPlan("Free")}>Free</button>
        <button className={`px-4 py-2 w-32 rounded ${plan === "Premium" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`} onClick={() => setPlan("Premium")}>Premium</button>
      </div>
      <LanguageSelector sourceLang={sourceLang} targetLang={targetLang} handleLanguageClick={handleLanguageClick} handleSwapLanguage={handleSwapLanguage} />
      {showLanguages && (
        <div className="w-[calc(100%-4rem)] h-[calc(100%-9rem)] bg-white absolute top-32 left-8 z-10 rounded shadow-lg p-4 overflow-y-scroll" ref={dropdownRef}>
          <ul>
            {Object.entries(languages).map(([code, name]) => (
              <li className="cursor-pointer hover:bg-[#10646b] transition duration-200 p-2 rounded" key={code} onClick={() => handleLanguageSelect(code)}>{name}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="w-full relative flex-1">
        <textarea className="textarea w-full p-2 border border-gray-300 rounded-lg h-full" value={inputText} onChange={handleMaxChar} onKeyDown={handleKeyDown} ref={textareaRef}></textarea>
        <div className="absolute bottom-2 right-4 text-gray-400">{inputText.length}/200</div>
      </div>
      {plan === 'Premium' && (
        <PremiumTranslator
          inputText={inputText}
          sourceLang={sourceLang}
          targetLang={targetLang}
          onTranslate={setTranslatedText}
          convertTextToSpeech={(text, lang) => convertTextToSpeech(text, lang, setAudioUrl, voiceGender)}
          triggerTranslate={triggerTranslate}
        />
      )}
      <div className="flex justify-center items-center gap-4 mt-4">
        <MicRecord onTranscript={handleTranscript} sourceLang={sourceLang} onStartRecording={handleStartRecording} onStopRecording={handleStopRecording} />
        <button className="w-12 h-12 bg-gradient-to-r from-[#b6f492] to-[#338b93] rounded-full text-2xl text-gray-600 flex justify-center items-center active:translate-y-[1px]" onClick={handleTranslate}>
          <i className="fa-solid fa-chevron-down"></i>
        </button>
        <SettingsCog voiceGender={voiceGender} onVoiceSelection={setVoiceGender} />
      </div>
      <div className="w-full relative flex-1">
        <textarea className="textarea w-full p-2 border border-gray-300 rounded-lg h-full" value={translatedText} readOnly></textarea>
        <div className="absolute bottom-2 left-2">
          <ShareButton code={translatedText} isTranslatorApp={true} />
        </div>
        <div className="absolute bottom-2 right-4 text-gray-400">{translatedText.length}/200</div>
      </div>
      <TextToSpeech text={translatedText} languageCode={targetLang} voiceGender={voiceGender} />
      {isHistoryVisible && (
        <TranslationHistory translationHistory={translationHistory} handleCopy={handleCopy} onClose={toggleHistory} />
      )}
    </div>
  );
};

export default TranslatorApp;
