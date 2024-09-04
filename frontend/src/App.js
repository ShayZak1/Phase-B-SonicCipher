import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import ContactUs from "./components/ContactUs";
import Hero from "./components/Hero";
import Sonicintro from "./components/Sonicintro";
import NavBar from "./components/NavBar";
import TranslatorApp from "./components/Translator/TranslatorApp";
import videoFile from './assets/img/TranslateBg.mp4';
import VideoChat from './components/VideoChat/VideoChat';
import ShimmerButton from './components/ShimmerButton/ShimmerButton';
import Ripple from './components/RippleEffect/RippleEffect';

const App = () => {
  const [currentPage, setCurrentPage] = useState('/');
  const videoRef = useRef(null); // Create a ref for the video element

  useEffect(() => {
    setCurrentPage(window.location.pathname);
  }, []);

  const handleNavigate = (path) => {
    window.location.href = path; // Forces full page reload
  };

  useEffect(() => {
    // Ensure the video element is not null before accessing its style
    if (videoRef.current) {
      videoRef.current.style.filter = 'brightness(70%) blur(5px)';
    } else {
      console.error('Video element is not yet available');
    }
  }, [currentPage]); // Re-run when currentPage changes

  return (
    <div className="relative w-full h-screen">
      {currentPage === '/translator' ? (
        <div className="translator-bg">
          <video
            ref={videoRef} // Assign the ref to the video element
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
            ref={videoRef} // Assign the ref to the video element
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
          <Hero onStart={() => handleNavigate('/translator')} onStartVideoChat={() => handleNavigate('/videochat')}/>
          <Sonicintro onStart={() => handleNavigate('/translator')} />
          <ContactUs onStart={() => handleNavigate('/translator')} />
        </>
      )}
    </div>
  );
};

export default App;
