import { useState, useRef, useEffect } from 'preact/hooks';

export const useTranslator = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en-GB");
  const [targetLang, setTargetLang] = useState("he-IL");
  const [showLanguages, setShowLanguages] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [currentLanguageSelection, setCurrentLanguageSelection] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [plan, setPlan] = useState("Free");
  const dropdownRef = useRef(null);
  const textareaRef = useRef(null);
  const audioRef = useRef(null);
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  return {
    inputText, setInputText, translatedText, setTranslatedText,
    sourceLang, setSourceLang, targetLang, setTargetLang,
    showLanguages, setShowLanguages, charCount, setCharCount,
    currentLanguageSelection, setCurrentLanguageSelection,
    audioUrl, setAudioUrl, plan, setPlan,
    dropdownRef, textareaRef, audioRef,
    handleMaxChar, handleLanguageClick, handleLanguageSelect, handleSwapLanguage
  };
};
