import { h } from 'preact';
import { useState } from 'preact/hooks';

const PopupMessage = ({ message, onClose, nickname }) => {
    const [copied, setCopied] = useState(false);

    const copyNickname = () => {
        navigator.clipboard.writeText(nickname).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset the copied state after 2 seconds
        });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gray-800  p-6 rounded-lg shadow-lg max-w-lg mx-auto">
                <h2 className="text-2xl font-bold text-white mb-4">Instructions</h2>
                <p className="text-gray-200 mb-6">{message}</p>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">Your Nickname:</label>
                    <input
                        type="text"
                        readOnly
                        value={nickname}
                        className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-200"
                        onClick={copyNickname}
                    />
                    {copied && <span className="text-green-400 text-sm">Copied!</span>}
                </div>

                <button
                    onClick={onClose}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Got it!
                </button>
            </div>
        </div>
    );
};

export default PopupMessage;
