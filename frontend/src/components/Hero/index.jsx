import { h } from 'preact';
import Globe from '../Globe/Globe'; // Adjust the path as necessary
import TypingAnimation from '../HyperText/Animation'; // Ensure the correct path to HyperText

const Hero = ({ onStart, onStartVideoChat }) => {
  return (
    <div id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Shared Container for Globe and Text */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Globe */}
        <div className="absolute flex items-center justify-center" style={{ width: '100%', height: '100%', maxHeight: '1000px', maxWidth: '1000px', aspectRatio: '1.5', margin: 'auto' }}>
          <Globe style={{ width: '100%', height: '100%', borderRadius: '60%', cursor: 'grab' }} />
        </div>


   {/* Text Content - Centered inside the Globe */}
   <div className="relative z-10 text-center px-4 py-8 max-w-full overflow-hidden">
          {/* Title Text with Effect */}
          <TypingAnimation
            text="Sonic Cipher"
            duration={100} // Adjust typing speed as needed
            className="font-bold p-2 text-4xl sm:text-6xl md:text-7xl text-mainColor"
          />

          {/* Subtitle Text with Typing Animation */}
          <h1 className="text-4xl sm:text-4xl md:text-5xl">
            <TypingAnimation
              text="Break the gap"
              duration={100} // Adjust typing speed as needed
              className="text-white"
            />
            <TypingAnimation
              text=" between languages"
              duration={100} // Adjust typing speed as needed
              className="text-mainColor"
            />
          </h1>

          {/* Description Text with Typing Animation */}
          <TypingAnimation
            text="Translate to different languages by speech, fast and specified"
            duration={50} // Adjust typing speed as needed
            className="text-xl md:text-2xl font-bold pb-6 text-gray-300"
          />


          {/* Buttons */}
          <div className="block mt-4">
            <button
              className="button button-main mr-2"
              onClick={onStart}
            >
              Start Translating
            </button>
            <button
              className="button button-main"
              onClick={onStartVideoChat}
            >
              Video Translation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;