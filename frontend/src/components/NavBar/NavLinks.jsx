import { h } from 'preact';

const NavLinks = ({ links, type }) => {
    const handleClick = (e) => {
        e.preventDefault();
        const id = e.target.attributes.getNamedItem('href').value;
        document.querySelector(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return (
        <>
            {
                links.map((link, index) => {
                    return (
                        <li className={`p-4 ${type === 'mobile' ? '' : 'border-b border-b-gray-50'}`} key={index}>
                            <a onClick={handleClick} href={link.link}> {link.name} </a>
                        </li>
                    )
                })
            }
        </>
    );
};

export default NavLinks;
