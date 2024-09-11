import { h } from "preact";
import { useTranslator } from "../../hooks/useTranslator";
import { translateText, convertTextToSpeech } from "../../api/TranslatorAppApi";
import MicRecord from "../MicRecord/MicRecord";
import PremiumTranslator from "../PremiumTranslator/PremiumTransltor";
import TextToSpeech from "../TextToSpeech/TextToSpeech";
import LanguageSelector from "../LanguageSelector/LanguageSelector";
import { useState, useEffect } from "preact/hooks";
import { languages } from "../../LanguageData";
import ShareButton from "../ShareButton/ShareButton";
import TranslationHistory from "./TranslationHistory";
import SettingsCog from "./SettingsCog";
import PremiumSettingsCog from "../PremiumTranslator/PremiumSettingsCog";
import { ShimmerButton } from "../ShimmerButton/ShimmerButton";
import RephraseSuggestions from "../PremiumTranslator/RephraseSuggestions";

const TranslatorApp = ({ onClose }) => {
  const {
    inputText, setInputText, translatedText, setTranslatedText, sourceLang, setSourceLang,
    targetLang, setTargetLang, showLanguages, setShowLanguages, charCount, setCharCount,
    currentLanguageSelection, setCurrentLanguageSelection, audioUrl, setAudioUrl, plan, setPlan,
    dropdownRef, textareaRef, audioRef, handleMaxChar, handleLanguageClick, handleLanguageSelect,
    handleSwapLanguage, history: translationHistory, handleSaveTranslation
  } = useTranslator();

  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [triggerTranslate, setTriggerTranslate] = useState(false);
  const [currentProfileSettings, setCurrentProfileSettings] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleTranslate = () => {
    plan === "Free" ? translateText({ inputText, sourceLang, targetLang, plan, setTranslatedText,
      convertTextToSpeech: (text, lang) => convertTextToSpeech(text, lang, setAudioUrl, voiceGender) }) 
    : setTriggerTranslate(true);
  };

  const handleCopy = (text) => navigator.clipboard.writeText(text);
  const handleKeyDown = (e) => e.key === "Enter" && (e.preventDefault(), handleTranslate());
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
      textareaRef.current && textareaRef.current.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    }, 100);
  };

  useEffect(() => inputText && translatedText && handleSaveTranslation(inputText, translatedText), [translatedText]);
  useEffect(() => triggerTranslate && setTriggerTranslate(false), [triggerTranslate, translatedText]);
  const toggleHistory = () => setIsHistoryVisible(!isHistoryVisible);
  const handlePlanChange = (selectedPlan) => plan !== selectedPlan && setPlan(selectedPlan);
  const handleApplyProfile = (settings) => setCurrentProfileSettings(settings);

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
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
        <img src="/Soniccipherlogo1.png" alt="Sonic Cipher Logo" className="h-12 w-auto object-contain" />
      </div>
      <div className="flex justify-center gap-4 my-4">
        <ShimmerButton buttonColor="#3b82f6" buttonTextColor="#1f2937" isActive={plan === "Free"}
          initialText="Free" changeText="Free" onClick={() => handlePlanChange("Free")} />
        <ShimmerButton buttonColor="#3b82f6" buttonTextColor="#1f2937" isActive={plan === "Premium"}
          initialText="Premium" changeText="Premium" onClick={() => handlePlanChange("Premium")} />
      </div>
      <LanguageSelector sourceLang={sourceLang} targetLang={targetLang} handleLanguageClick={handleLanguageClick}
        handleSwapLanguage={handleSwapLanguage} />
      {showLanguages && (
        <div className="w-[calc(100%-4rem)] h-[calc(100%-9rem)] text-white bg-gray-700 border border-gray-600 absolute top-32 left-8 z-10 rounded shadow-lg p-4 overflow-y-scroll" ref={dropdownRef}>
          <ul>
            {Object.entries(languages).map(([code, name]) => (
              <li className="cursor-pointer hover:bg-[#10646b] transition duration-200 p-2 rounded"
                key={code} onClick={() => handleLanguageSelect(code)}>{name}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="w-full relative flex-1">
        <textarea className="textarea w-full p-2 text-white border rounded-lg h-full"
          value={inputText} onChange={handleMaxChar} onKeyDown={handleKeyDown} ref={textareaRef} />
        <div className="absolute bottom-2 right-4 text-gray-400">{inputText.length}/200</div>
      </div>
      {plan === "Premium" && (
        <PremiumTranslator inputText={inputText} sourceLang={sourceLang} targetLang={targetLang}
          onTranslate={setTranslatedText} convertTextToSpeech={(text, lang) => convertTextToSpeech(text, lang, setAudioUrl, voiceGender)}
          triggerTranslate={triggerTranslate} profileSettings={currentProfileSettings} />
      )}
      <div className="w-full flex justify-center items-center gap-2 bg-[#3A3F44] bg-opacity-30 px-4 py-2 rounded-lg shadow-md">
        <MicRecord onTranscript={handleTranscript} sourceLang={sourceLang}
          onStartRecording={handleStartRecording} onStopRecording={handleStopRecording} />
        <button className="w-12 h-12 bg-gradient-to-r from-[#4A90E2] to-[#50B3A2] rounded-full text-2xl text-gray-600 flex justify-center items-center active:translate-y-[1px]"
          onClick={handleTranslate}>
          <i className="fa-solid fa-chevron-down"></i>
        </button>
        {plan === "Premium" ? (
    <>
      <PremiumSettingsCog
        voiceGender={voiceGender}
        onVoiceSelection={setVoiceGender}
        onApplyProfile={handleApplyProfile}
      />
            <RephraseSuggestions
              translatedText={translatedText}
              onApplySuggestion={(translatedText) => {
                setTranslatedText(translatedText); // Update translated text with the suggestion
              }}
            />
            
    </>
  ) : (
    <SettingsCog
      voiceGender={voiceGender}
      onVoiceSelection={setVoiceGender}
    />
  )}
      </div>
      <div className="w-full relative flex-1">
        <textarea className="textarea w-full p-2 border border-gray-300 rounded-lg h-full"
          value={translatedText} readOnly />
        <div className="absolute bottom-2 left-2">
          <ShareButton code={translatedText} isTranslatorApp />
        </div>
        <div className="absolute bottom-2 right-4 text-gray-400">{translatedText.length}/200</div>
      </div>
      <TextToSpeech text={translatedText} languageCode={targetLang} voiceGender={voiceGender} />
      {isHistoryVisible && (
        <TranslationHistory translationHistory={translationHistory}
          handleCopy={handleCopy} onClose={toggleHistory} />
      )}
    </div>
  );
};

export default TranslatorApp;