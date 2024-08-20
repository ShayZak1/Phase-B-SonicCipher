import { h } from 'preact';
import { useState } from 'preact/hooks';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ContactUs from "./components/ContactUs";
import Hero from "./components/Hero";
import Sonicintro from "./components/Sonicintro";
import NavBar from "./components/NavBar";
import TranslatorApp from "./components/Translator/TranslatorApp";
import VideoChat from './components/VideoChat/VideoChat';
import videoFile from './assets/img/TranslateBg.mp4';

const App = () => {
  return (
    <Router>
      <div className="relative w-full h-screen">
        <Switch>
          <Route exact path="/">
            <NavBar />
            <Hero />
            <Sonicintro />
            <ContactUs />
          </Route>
          <Route path="/translatorapp">
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
                <TranslatorApp />
              </div>
            </div>
          </Route>
          <Route path="/videochat">
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
                <VideoChat />
              </div>
            </div>
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
