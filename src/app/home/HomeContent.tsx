'use client';

import { FC, useState, useEffect } from 'react';
import { BiMenuAltLeft, BiMenuAltRight } from 'react-icons/bi';
import { BsArrowReturnLeft } from 'react-icons/bs';
import { FaPen } from 'react-icons/fa';
import { HiDotsVertical } from 'react-icons/hi';
import Image from 'next/image';

const HomeContent: FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const menuItems = [
        'ZkSurfer',
        'Explore ZkSurfer',
        'Fill registration forms',
        'Create blog and registration forms',
        'Create top performing stock in Nifty 50',
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
            {/* Sidebar for large screens and mobile when open */}
            <div
                className={`
                    ${isMobile ? (isMenuOpen ? 'block' : 'hidden') : 'block'} 
                    ${isMobile ? 'w-3/4' : 'w-64'} 
                    bg-[#08121f] h-screen overflow-y-auto fixed left-0 top-0 z-20
                `}
            >
                <div className="p-4">
                    <div className="flex items-center justify-between mb-10">
                        <div className="relative bg-gradient-to-tr from-[#000D33] via-[#9A9A9A] to-[#000D33] p-0.5 rounded-lg w-full mr-4">
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-full bg-[#08121f] text-white p-2 rounded-lg"
                            />
                        </div>
                        {isMobile && (
                            <button onClick={toggleMenu} className="text-white flex justify-center items-center font-sourceCode">
                                <BiMenuAltRight size={32} />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <div className="mb-4">ZkSurfer</div>
                        <div className="mb-4">Explore</div>
                    </div>
                    <Image
                        src="images/Line.svg"
                        alt="Welcome Line"
                        width={550}
                        height={50}
                        className='my-2'
                    />
                    <nav>
                        {menuItems.map((item, index) => (
                            <div key={index} className="py-2 px-4 hover:bg-gray-700 cursor-pointer">
                                {item}
                            </div>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className={`flex-1 flex flex-col bg-[#08121f] ${!isMobile ? 'ml-64' : ''}`}>
                <header className="w-full py-4 bg-[#08121f] flex justify-between items-center px-4">
                    {isMobile && (
                        <button onClick={toggleMenu} className="text-white">
                            <BiMenuAltLeft size={28} />
                        </button>
                    )}
                    <div className="text-lg font-bold flex-1 flex justify-center items-center">
                        <span>ZkSurfer</span>
                    </div>
                    <div className="flex space-x-4">
                        <button className="text-black bg-white p-1 rounded-lg"><FaPen /></button>
                        <button className="text-white"><HiDotsVertical /></button>
                    </div>
                </header>

                <Image
                    src="images/Line.svg"
                    alt="Welcome Line"
                    width={550}
                    height={50}
                    className={`my-2 ${!isMobile ? 'hidden' : 'visible'}`}
                />

                <div className="flex-grow flex items-center justify-center px-4 py-8">
                    <div className="flex flex-col space-y-4 items-center max-w-2xl w-full text-center">
                        <div className="bg-[#121626] p-4 rounded-lg shadow-md text-[#A0A0A5] w-full">
                            Fill out the registration form on zkagi.com and join the telegram community.
                        </div>
                        <div className="bg-[#121626] p-4 rounded-lg shadow-md text-[#A0A0A5] w-full">
                            Navigate to tech.com, search for latest tech news, and click on the first result.
                        </div>
                        <div className="bg-[#121626] p-4 rounded-lg shadow-md text-[#A0A0A5] w-full">
                            Look for best GPU, extract the names and prices of the first 10 products.
                        </div>
                        <div className="bg-[#121626] p-4 rounded-lg shadow-md text-[#A0A0A5] w-full">
                            Download the finance report for current finance year from share market app.
                        </div>
                        <div className="bg-[#121626] p-4 rounded-lg shadow-md text-[#A0A0A5] w-full">
                            Write a medium blog about Crypto Future using AI.
                        </div>
                    </div>
                </div>

                <footer className="w-full py-4 flex justify-center px-4">
                    <div className={`bg-gradient-to-tr from-[#000D33] via-[#9A9A9A] to-[#000D33] p-0.5 rounded-lg ${!isMobile ? 'w-2/5' : 'w-full'}`}>
                        <form action="/api/message" method="POST" className="w-full max-w-lg flex justify-center items-center bg-[#08121f] rounded-lg">
                            <input
                                type="text"
                                name="message"
                                placeholder="Message ZkSurfer"
                                className="bg-transparent flex-grow py-2 px-4 rounded-l-full outline-none text-white placeholder-[#A0AEC0] font-ttfirs"
                            />
                            <button type="submit" className="bg-white text-black p-1 m-1 rounded-md font-bold">
                                <BsArrowReturnLeft />
                            </button>
                        </form>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default HomeContent;