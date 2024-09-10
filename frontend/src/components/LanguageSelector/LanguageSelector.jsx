import { h } from 'preact';
import { languages } from '../../LanguageData';

const LanguageSelector = ({ sourceLang, targetLang, handleLanguageClick, handleSwapLanguage }) => (
  <div className="w-full flex justify-center items-center gap-2 bg-[#3A3F44] bg-opacity-30 px-4 py-2 rounded-lg shadow-md">
    <div
      className="w-32 bg-gradient-to-r from-[#4A90E2] to-[#50B3A2] text-black py-2 px-4 rounded-lg cursor-pointer text-center hover:bg-green-300 flex-shrink-0"
      onClick={() => handleLanguageClick('from')}
    >
      {languages[sourceLang] || sourceLang}
    </div>
    <i
      className="fa-solid fa-arrows-rotate text-xl cursor-pointer text-white mx-2"
      onClick={handleSwapLanguage}
    ></i>
    <div
      className="w-32 bg-gradient-to-r from-[#4A90E2] to-[#50B3A2] text-black py-2 px-4 rounded-lg cursor-pointer text-center hover:bg-green-300 flex-shrink-0"
      onClick={() => handleLanguageClick('to')}
    >
      {languages[targetLang] || targetLang}
    </div>
  </div>
);

export default LanguageSelector;
