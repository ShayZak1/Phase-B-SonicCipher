import { h } from 'preact';
import { useState } from 'preact/hooks';
import ContactUs from "./components/ContactUs";
import Hero from "./components/Hero";
import Sonicintro from "./components/Sonicintro";
import NavBar from "./components/NavBar";
import TranslatorApp from "./components/Translator/TranslatorApp";
import videoFile from './assets/img/TranslateBg.mp4';
import VideoChat from './components/VideoChat/VideoChat';

const App = () => {
  const [showTranslatorApp, setTranslatorApp] = useState(false);
  const [showVideoChat, setShowVideoChat] = useState(false);

  const handleVideoChat = () => {
    setTranslatorApp(false);
    setShowVideoChat(true);
  };

  return (
    <div className="relative w-full h-screen">
      {showTranslatorApp ? (
        <div className="translator-bg">
          <video
            style={{ filter: 'brightness(70%) blur(5px)' }}
            autoPlay
            muted
            loop
            playsInline
            id="bg-video"
            className="absolute top-0 left-0 w-full h-full object-cover"
          >
            <source src={videoFile} type="video/mp4" />
          </video>
          <div className="relative z-10 w-full h-full flex justify-center items-center">
            <TranslatorApp onClose={() => setTranslatorApp(false)} />
          </div>
        </div>
      ) : showVideoChat ? (
        <div className="video-chat-bg">
          <div className="relative z-10 w-full h-full flex justify-center items-center">
            <VideoChat />
          </div>
        </div>
      ) : (
        <>
          <NavBar onStart={() => setTranslatorApp(true)} onStartVideoChat={handleVideoChat} />
          <Hero onStart={() => setTranslatorApp(true)} />
          <Sonicintro onStart={() => setTranslatorApp(true)} />
          <ContactUs onStart={() => setTranslatorApp(true)} />
        </>
      )}
    </div>
  );
};

export default App;
