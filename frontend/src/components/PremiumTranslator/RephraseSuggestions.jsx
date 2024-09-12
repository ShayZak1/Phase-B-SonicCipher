// RephraseSuggestions.jsx
import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import axios from "axios";

const RephraseSuggestions = ({ translatedText, onApplySuggestion }) => {
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleSuggestions = () => {
    if (!translatedText || translatedText.trim() === "") {
      alert("No translated text available to rephrase. Please translate text first.");
      return;
    }
    setIsSuggestionsVisible(!isSuggestionsVisible);
    if (!isSuggestionsVisible) {
      fetchSuggestions(translatedText);
    }
  };

  const fetchSuggestions = async (text) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/generate-suggestions`,
        { text }
      );
      const validSuggestions = response.data.suggestions.filter(
        (suggestion) => suggestion.trim() !== ""
      );
      setSuggestions(validSuggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onApplySuggestion(suggestion);
    setIsSuggestionsVisible(false);
  };

  return (
    <div className="relative">
      <button
        className="w-12 h-12 bg-gradient-to-r from-[#4A90E2] to-[#50B3A2] rounded-full text-2xl text-gray-600 flex justify-center items-center active:translate-y-[1px]"
        onClick={toggleSuggestions}
        aria-label="Rephrase Suggestions"
      >
        <i className="fa-solid fa-lightbulb"></i>
      </button>

      {isSuggestionsVisible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setIsSuggestionsVisible(false)}
        >
          <div
            className="bg-[#2d2d2d] p-6 rounded-lg shadow-lg z-60 w-80 max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white text-lg font-semibold mb-4">Rephrase Suggestions</h3>
            {loading ? (
              <p className="text-white">Loading suggestions...</p>
            ) : suggestions.length > 0 ? (
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full h-auto px-4 py-2 mb-2 rounded bg-blue-500 text-white overflow-visible whitespace-pre-line break-words" // Adjustments for expanding height and proper text display
                      title={suggestion} // Tooltip for full text visibility
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white">No suggestions available.</p>
            )}
            <button
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
              onClick={() => setIsSuggestionsVisible(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RephraseSuggestions;
