// RephraseSuggestions.jsx
import { h } from "preact";
import { useState } from "preact/hooks";
import axios from "axios";

const RephraseSuggestions = ({ translatedText, onApplySuggestion }) => {
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Toggle the visibility of the suggestions popup
  const toggleSuggestions = () => {
    console.log("Toggle Suggestions Triggered"); // Debugging line to check if function is called
    console.log("Translated Text in RephraseSuggestions:", translatedText); // Debugging line

    // Ensure translatedText has content before fetching suggestions
    if (!translatedText || translatedText.trim() === "") {
      console.warn("No translated text available to rephrase. Please translate text first.");
      alert("No translated text available to rephrase. Please translate text first.");
      return;
    }

    setIsSuggestionsVisible(!isSuggestionsVisible);
    if (!isSuggestionsVisible) {
        console.log("the text the is translated:", translatedText); // Debugging line
      fetchSuggestions(translatedText); // Fetch suggestions when opening
    }
  };

  // Fetch rephrasing suggestions from the backend
  const fetchSuggestions = async (text) => {
    console.log("Fetching suggestions for:", text); // Debugging line
    if (!text || text.trim() === "") {
      console.error("Cannot fetch suggestions for empty text.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/generate-suggestions`,
        { text }
      );
      setSuggestions(response.data.suggestions);
      console.log("Suggestions fetched:", response.data.suggestions); // Debugging line
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Button with lightbulb icon to toggle suggestions */}
      <button
        className="w-12 h-12 bg-gradient-to-r from-[#4A90E2] to-[#50B3A2] rounded-full text-2xl text-gray-600 flex justify-center items-center active:translate-y-[1px]"
        onClick={toggleSuggestions}
        aria-label="Rephrase Suggestions"
      >
        <i className="fa-solid fa-lightbulb"></i>
      </button>

      {/* Popup window for showing suggestions */}
      {isSuggestionsVisible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={toggleSuggestions}
        >
          <div
            className="bg-[#2d2d2d] p-6 rounded-lg shadow-lg z-60 w-80"
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
                      onClick={() => onApplySuggestion(suggestion)}
                      className="w-full px-4 py-2 mb-2 rounded bg-blue-500 text-white"
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
              onClick={toggleSuggestions}
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
