// ShareButton.jsx
import { h } from 'preact';

const ShareButton = ({ code }) => {
  // Function to copy the code to the clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  // Function to handle native sharing
  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join me',
        text: `Use this code to connect me in this website https://sonic-cipher-omega.vercel.app/videochat : ${code}`,
      });
    } else {
      alert('Sharing not supported on this device.');
    }
  };

  return (
    <div className="flex gap-1">
      <button
        className="text-gray-400 hover:text-gray-200"
        onClick={handleCopy}
        aria-label="Copy"
      >
        <i className="fa fa-copy" aria-hidden="true"></i>
      </button>
      <button
        className="text-gray-400 hover:text-gray-200"
        onClick={handleNativeShare}
        aria-label="Share"
      >
        <i className="fa fa-share-alt" aria-hidden="true"></i>
      </button>
    </div>
  );
};

export default ShareButton;
