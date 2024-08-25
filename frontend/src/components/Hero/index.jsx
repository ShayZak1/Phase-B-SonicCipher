import { h } from 'preact';
import Globe from '../Globe/Globe'; // Adjust the path as necessary

const Hero = ({ onStart }) => {
  return (
    <div id="hero" className="relative bg-fixed bg-center h-screen flex items-center justify-center overflow-hidden">
      {/* Globe as a background */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <Globe className=" w-[80vmin] h-[80vmin] sm:w-[100vmin] sm:h-[100vmin] md:w-[95vmin] md:h-[95vmin] max-w-full max-h-full" />
      </div>

      {/* Text content - centrally aligned */}
      <div className="relative z-10 text-center px-4 py-8">
        <p className="font-bold p-2 text-4xl sm:text-6xl md:text-7xl text-mainColor">SonicCipher</p>
        <h1 className="text-4xl sm:text-4xl md:text-5xl">
          <span className="text-white">Break the gap </span><span className="text-mainColor">between languages</span>
        </h1>
        <p className="text-xl md:text-2xl font-bold pb-6 text-gray-300">
          Translate to different languages by speech, fast and specified
        </p>

        <div className="block">
          <button className="button button-main mr-4 " onClick={onStart}>Start Translating</button>
          <button className="button button-main mr-4">Video Translation</button>
        </div>
      </div>
    </div>
  );
}

export default Hero;
