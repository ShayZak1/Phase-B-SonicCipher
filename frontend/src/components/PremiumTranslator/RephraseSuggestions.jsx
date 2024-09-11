import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import axios from 'axios';

const RephraseSuggestions = ({ originalText, onApplySuggestion }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (originalText) {
      fetchSuggestions(originalText);
    }
  }, [originalText]);

  const fetchSuggestions = async (text) => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/generate-suggestions`, {
        text,
      });
      setSuggestions(response.data.suggestions);
      console.log('Suggestions fetched:', response.data.suggestions); // Debug log to check if suggestions are fetched
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="suggestions-container">
      {loading && <p>Loading suggestions...</p>}
      {!loading && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          <p>Suggestions:</p>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button onClick={() => onApplySuggestion(suggestion)}>
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RephraseSuggestions;
