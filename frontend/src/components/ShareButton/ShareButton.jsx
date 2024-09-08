// ShareButton.jsx
import { h } from 'preact';

const ShareButton = ({ code }) => {
  // Generate the share URL with the correct path to the video chat page
  const shareUrl = `${window.location.origin}/videochat?peerId=${encodeURIComponent(code)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('URL copied to clipboard! You can share it.');
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Join me on the video chat',
          // Combine both the message and the URL into the `text` field only
          text: `Use this link to connect with me:\n${shareUrl}`, 
        })
        .catch((error) => console.error('Error sharing:', error));
    } else {
      alert('Sharing not supported on this device.');
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Copy Icon */}
      <button
        className="text-white p-2 rounded-md hover:bg-gray-600"
        onClick={handleCopy}
        aria-label="Copy URL"
      >
        <i className="fa fa-copy" aria-hidden="true"></i>
      </button>

      {/* Share Icon */}
      <button
        className="text-white p-2 rounded-md hover:bg-blue-700"
        onClick={handleNativeShare}
        aria-label="Share URL"
      >
        <i className="fa fa-share-alt" aria-hidden="true"></i>
      </button>
    </div>
  );
};

export default ShareButton;
