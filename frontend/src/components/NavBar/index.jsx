import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Bars3BottomRightIcon, XMarkIcon } from "@heroicons/react/24/solid";
import NavLinks from './NavLinks';

const NavBar = ({ onStart, onStartVideoChat }) => {
    const [nav, setNav] = useState(false);

    const navLinks = [
        { name: 'Home', link: '#hero' },
        { name: 'About', link: '#soniclogo' },
        { name: 'Contact', link: '#contact-us' },
        
    ];

    const handleNav = () => {
        setNav(!nav);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setNav(false);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <nav className="sticky top-0 left-0 bg-navBg z-50">
            <div className="max-w-screen-xl text-white flex justify-between items-center h-24 m-auto px-4">
                <h3 className="w-full text-3xl font-bold text-mainColor">Sonic<span className="text-white">C</span>ipher</h3>
                <ul className='hidden md:flex'>
                    <NavLinks links={navLinks} onStartVideoChat={onStartVideoChat} />
                </ul>
                <div className="block md:hidden">
                    <button onClick={handleNav} aria-label="Toggle Navigation">
                        {nav ? (
                            <XMarkIcon className="h-8 w-8 text-mainColor" />
                        ) : (
                            <Bars3BottomRightIcon className="h-8 w-8 text-mainColor" />
                        )}
                    </button>
                </div>
            </div>
            <div className={`fixed left-0 top-0 w-[60%] h-full border-r border-r-gray-900 bg-bgColor duration-500 ${nav ? 'left-0' : 'left-[-100%]'}`}>
                <ul className='pt-10 uppercase text-white'>
                    <NavLinks links={navLinks} type="mobile" onStartVideoChat={onStartVideoChat} />
                </ul>
            </div>
        </nav>
    );
}

export default NavBar;
