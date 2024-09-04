import { h } from 'preact';
import Globe from '../Globe/Globe'; // Adjust the path as necessary

const Hero = ({ onStart, onStartVideoChat }) => {
  return (
    <div id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Shared Container for Globe and Text */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Globe */}
        <div className="absolute flex items-center justify-center" style={{ width: '100%',height: '100%',maxHeight:'1000px', maxWidth: '1000px', aspectRatio: '1.5', margin: 'auto' }}>
          <Globe style={{ width: '100%', height: '100%', borderRadius: '60%', cursor: 'grab' }} />
        </div>

        {/* Text Content - Centered inside the Globe */}
        <div className="relative z-10 text-center px-4 py-8">
          <p className="font-bold p-2 text-4xl sm:text-6xl md:text-7xl text-mainColor">SonicCipher</p>
          <h1 className="text-4xl sm:text-4xl md:text-5xl">
            <span className="text-white">Break the gap </span><span className="text-mainColor">between languages</span>
          </h1>
          <p className="text-xl md:text-2xl font-bold pb-6 text-gray-300">
            Translate to different languages by speech, fast and specified
          </p>
          <div className="block">
            <button className="button button-main mr-4" onClick={onStart}>Start Translating</button>
            <button className="button button-main mr-4" onClick={onStartVideoChat}>Video Translation</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
