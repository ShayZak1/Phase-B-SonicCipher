import { h } from 'preact';
import si from '../../assets/img/sonicIcon.png';

const Sonicintro = () => {
  return (
    <div id="soniclogo" className="w-full bg-white py-16 px-4">
      <div className="grid md:grid-cols-2 mx-auto max-w-screen-xl">
        <img className="w-[250] mx-auto my-4" src={si} alt="Sonic Icon" />
        <div className="flex flex-col justify-center">
          <p className="text-mainColor font-bold">Explore New Method</p>
          <h2 className="text-2xl font-bold md:text-4xl sm:text-3xl py-2">SonicCiper</h2>
          <p>Sonic Cipher makes talking across languages easy and fast. Our app turns your voice into text and translates it in real-time, ensuring smooth conversations. It’s secure, so your chats stay private, and it works on both phones and computers. Connect with people around the world effortlessly with Sonic Cipher!</p>
        </div>
      </div>
    </div>
  );
}

export default Sonicintro;
