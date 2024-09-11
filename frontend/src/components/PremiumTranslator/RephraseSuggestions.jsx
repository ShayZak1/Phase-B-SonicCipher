import { useState } from "preact/hooks";

const RephraseSuggestions = ({ text, onRephrase }) => {
  const [suggestions, setSuggestions] = useState([]);

  const fetchRephrases = async () => {
    // Call GPT-4 to generate rephrasing suggestions
    const rephrases = await getRephraseSuggestions(text);
    setSuggestions(rephrases);
  };

  return (
    <div>
      <h3>Rephrase Suggestions</h3>
      <button onClick={fetchRephrases}>Get Suggestions</button>
      <ul>
        {suggestions.map((suggestion, index) => (
          <li key={index}>
            {suggestion}
            <button onClick={() => onRephrase(suggestion)}>Apply</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RephraseSuggestions;
