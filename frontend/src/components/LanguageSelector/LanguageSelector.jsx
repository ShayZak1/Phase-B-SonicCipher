import { h } from 'preact';
import { languages } from '../../LanguageData';

const LanguageSelector = ({ sourceLang, targetLang, handleLanguageClick, handleSwapLanguage }) => (
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
);

export default LanguageSelector;
