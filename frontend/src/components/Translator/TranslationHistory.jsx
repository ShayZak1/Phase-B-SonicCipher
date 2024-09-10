// TranslationHistory.jsx
import { h } from 'preact';

const TranslationHistory = ({ translationHistory, handleCopy, onClose }) => {
  return (
    <div className="absolute top-16 right-4 w-80 bg-gray-100 p-4 rounded shadow-lg max-h-64 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-2">Translation History</h3>
      {translationHistory.length === 0 ? (
        <p className="text-gray-500">No history available.</p>
      ) : (
        <ul>
          {translationHistory.map((entry, index) => (
            <li key={index} className="mb-2 p-2 bg-white rounded shadow">
              <div className="flex justify-between items-center">
                <span>{entry.original} → {entry.translated}</span>
                <button className="text-blue-500 ml-2" onClick={() => handleCopy(entry.translated)}>
                  Copy
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button
        className="mt-2 text-sm text-blue-500 underline"
        onClick={onClose}
      >
        Close History
      </button>
    </div>
  );
};

export default TranslationHistory;
