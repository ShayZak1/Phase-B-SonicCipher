import { h } from 'preact';
import videoFile from '../../assets/img/video2.mp4'; // Correct path to your video file

const Hero = ({ onStart }) => {
  return (
    <div id="hero" className="relative bg-fixed bg-no-repeat bg-center py-16 px-4">
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(70%) blur(2px)' }}
      >
        <source src={videoFile} type="video/mp4" />
      </video>
      <div className="relative text-black flex flex-col justify-center">
        <div className="max-w-[680px] w-full h-screen mx-auto flex flex-col justify-center">
          <p className="font-bold p-2 text-4xl sm:text-6xl md:text-7xl text-mainColor">SonicCipher</p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl">
            <span className="text-white">Break the gap </span><span className="text-mainColor">between languages</span>
          </h1>
          <p className="text-xl md:text-2xl font-bold pb-6 text-gray-300">
            Translate to different languages by speech, fast and specified
          </p>

          <div className="block">
            <button className="button button-main mr-4 uppercase" onClick={onStart}>Start Translating</button>
            <button className="button button-main mr-4">Learn More</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
