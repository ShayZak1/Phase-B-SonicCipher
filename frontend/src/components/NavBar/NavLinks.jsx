import { h } from 'preact';

const NavLinks = ({ links, type, onStartVideoChat }) => {
    const handleClick = (e, link) => {
        e.preventDefault();
        if (link.name === 'VideoTranslation') {
            onStartVideoChat();
        } else {
            const id = e.target.attributes.getNamedItem('href').value;
            document.querySelector(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    return (
        <>
            {
                links.map((link, index) => {
                    return (
                        <li className={`p-4 ${type === 'mobile' ? '' : 'border-b border-b-gray-50'}`} key={index}>
                            <a onClick={(e) => handleClick(e, link)} href={link.link}> {link.name} </a>
                        </li>
                    )
                })
            }
        </>
    );
};

export default NavLinks;
