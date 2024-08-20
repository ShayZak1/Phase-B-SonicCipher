import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import ContactUs from "./components/ContactUs";
import Hero from "./components/Hero";
import Sonicintro from "./components/Sonicintro";
import NavBar from "./components/NavBar";
import TranslatorApp from "./components/Translator/TranslatorApp";
import videoFile from './assets/img/TranslateBg.mp4';
import VideoChat from './components/VideoChat/VideoChat";

const App = () => {
  const [currentPage, setCurrentPage] = useState('/');

  useEffect(() => {
    // Set the current page based on the URL path
    setCurrentPage(window.location.pathname);
  }, []);

  const handleNavigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPage(path);
  };

  return (
    <div className="relative w-full h-screen">
      {currentPage === '/translator' ? (
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
            <TranslatorApp onClose={() => handleNavigate('/')} />
          </div>
        </div>
      ) : currentPage === '/videochat' ? (
        <div className="video-chat-bg">
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
            <VideoChat onClose={() => handleNavigate('/')} />
          </div>
        </div>
      ) : (
        <>
          <NavBar onStart={() => handleNavigate('/translator')} onStartVideoChat={() => handleNavigate('/videochat')} />
          <Hero onStart={() => handleNavigate('/translator')} />
          <Sonicintro onStart={() => handleNavigate('/translator')} />
          <ContactUs onStart={() => handleNavigate('/translator')} />
        </>
      )}
    </div>
  );
};

export default App;
