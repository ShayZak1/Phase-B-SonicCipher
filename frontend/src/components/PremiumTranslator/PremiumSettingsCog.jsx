import { h } from "preact";
import { useState } from "preact/hooks";
import TranslationProfileManager from "./TranslationProfileManager"; // Ensure correct import path

const PremiumSettingsCog = ({
  voiceGender,
  onVoiceSelection,
  onApplyProfile,
}) => {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  // Toggle the settings visibility
  const toggleSettings = () => {
    setIsSettingsVisible(!isSettingsVisible);
  };

  return (
    <div className="relative">
      <button
        className="w-12 h-12 bg-gradient-to-r from-[#4A90E2] to-[#50B3A2] rounded-full text-2xl text-gray-600 flex justify-center items-center active:translate-y-[1px]"
        onClick={toggleSettings}
        aria-label="Settings"
      >
        <i className="fa-solid fa-cog"></i>
      </button>

      {isSettingsVisible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={toggleSettings} // Closes the menu when clicking outside
        >
          <div
            className="bg-[#2d2d2d] p-6 rounded-lg shadow-lg z-60 w-80"
            onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the menu
          >
            <h3 className="text-white text-lg font-semibold mb-4">
              Premium Settings
            </h3>

            {/* Voice Selection Options */}
            <button
              className={`w-full px-4 py-2 mb-2 rounded ${
                voiceGender === "female"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => onVoiceSelection("female")}
            >
              Female Voice
            </button>
            <button
              className={`w-full px-4 py-2 rounded ${
                voiceGender === "male"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => onVoiceSelection("male")}
            >
              Male Voice
            </button>

            {/* Personalized Translation Profiles Section */}
            <TranslationProfileManager onApplyProfile={onApplyProfile} />

            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={toggleSettings}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumSettingsCog;
