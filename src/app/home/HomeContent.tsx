'use client';

import { FC, useState, useEffect } from 'react';
import { BiMenuAltLeft, BiMenuAltRight } from 'react-icons/bi';
import { BsArrowReturnLeft } from 'react-icons/bs';
import { FaPen } from 'react-icons/fa';
import { HiDotsVertical } from 'react-icons/hi';
import Image from 'next/image';
import createNft from '../../component/MintNFT';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSession } from 'next-auth/react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    type?: 'img' | 'text';
    proof?: any;
}

const HomeContent: FC = () => {
    const wallet = useWallet();
    const { data: session, status } = useSession();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [proofData, setProofData] = useState(null);
    const [resultType, setResultType] = useState('');

    const [displayMessages, setDisplayMessages] = useState<Message[]>([]); // Array for messages to be displayed
    const [apiMessages, setApiMessages] = useState<Message[]>([]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (session && session.user && session.user.email) {
            setUserEmail(session.user.email);
        }
    }, [session]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     if (!inputMessage.trim()) return;

    //     const userMessage: Message = { role: 'user', content: inputMessage };
    //     setMessages((prev) => [...prev, userMessage]);
    //     setInputMessage('');
    //     setIsLoading(true);

    //     try {
    //         const response = await fetch('/api/chat', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({
    //                 messages: [...messages, userMessage],
    //             }),
    //         });

    //         if (!response.ok) throw new Error('Failed to get response');

    //         const data = await response.json();
    //         console.log('api', data)

    //         if (data.type === 'img') {
    //             setResultType(data.type);
    //         }

    //         setProofData(data.proof);

    //         const assistantMessage: Message = {
    //             role: 'assistant',
    //             content: data.content,
    //         };
    //         setMessages((prev) => [...prev, assistantMessage]);
    //     } catch (error) {
    //         console.error('Error:', error);
    //         // Handle error (e.g., show an error message to the user)
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMessage: Message = { role: 'user', content: inputMessage };

        // Update the displayMessages array
        setDisplayMessages((prev) => [...prev, userMessage]);

        // Update the apiMessages array
        const apiMessage: Message = { role: 'user', content: inputMessage };
        setApiMessages((prev) => [...prev, apiMessage]);

        setInputMessage('');
        setIsLoading(true);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        try {
            // Make the API call with the apiMessages array
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...apiMessages, apiMessage], // Send only relevant API messages
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();
            console.log('api', data);

            let assistantMessageForDisplay: Message;
            let assistantMessageForAPI: Message;

            if (data.type === 'img') {
                setResultType(data.type)
                // If the data is of type 'img', set different content for display and API message
                assistantMessageForDisplay = {
                    role: 'assistant',
                    content: data.content, // This will be the actual content (image or text) to display
                };
                assistantMessageForAPI = {
                    role: 'assistant',
                    content: data.prompt, // Message sent to API
                };
            } else {
                // For non-image responses, keep the same content for both display and API
                assistantMessageForDisplay = {
                    role: 'assistant',
                    content: data.content, // Display the actual content
                };
                assistantMessageForAPI = {
                    role: 'assistant',
                    content: data.content, // Send the actual content to API as well
                };
            }

            // Update displayMessages with the actual content (including images)
            setDisplayMessages((prev) => [...prev, assistantMessageForDisplay]);

            // Update apiMessages with the API-friendly message
            setApiMessages((prev) => [...prev, assistantMessageForAPI]);

        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };


    const menuItems = [
        'ZkSurfer',
        'Explore ZkSurfer',
        'Fill registration forms',
        'Create blog and registration forms',
        'Create top performing stock in Nifty 50',
    ];

    const [count, setCount] = useState(0);
    const [nftResponse, setNftResponse] = useState<string | null>(null);  // Store the NFT response
    const [loading, setLoading] = useState(false);  // Loading state
    //both are hardcoded values
    const name = "car";
    const image = "0x1";

    // handles minting of nft
    const handleMintNFT = async () => {
        setLoading(true);
        setNftResponse(null);
        try {
            const response = await createNft(wallet, name, image);
            setNftResponse(`Transaction Signature: ${response}`);
        } catch (error) {
            console.error("Failed to mint NFT:", error);
            setNftResponse("Minting failed! Please check the console for details.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!proofData) {
            console.log('No proof data to download');
            return;
        }

        let file: any;
        try {
            file = await (window as any).showSaveFilePicker({
                suggestedName: 'proof.json',
                types: [
                    {
                        description: 'JSON file',
                        accept: {
                            'application/json': ['.json'],
                        },
                    },
                ],
            });
        } catch {
            return console.log('User aborted file');
        }
        const writeStream = await file.createWritable();
        await writeStream.write(JSON.stringify(proofData, null, 4));
        await writeStream.close();
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
            {/* Sidebar code remains the same */}

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
                        <button onClick={handleMintNFT} disabled={loading}>
                            {loading ? 'Minting NFT...' : 'Mint NFT'}
                        </button>
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
                {/* Header code remains the same */}

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

                {/* Chat messages */}
                <div className="flex-grow overflow-y-auto px-4 py-8">
                    {displayMessages.map((message, index) => (
                        <div
                            key={index}
                            className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.role === 'assistant' && (
                                <div className="flex-shrink-0 mr-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                                        🐯
                                    </div>
                                </div>
                            )}
                            <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div>
                                    <span className="text-sm text-gray-400 mb-1">
                                        {message.role === 'user' ? userEmail : 'ZkSurfer 🐯'}
                                    </span>
                                    {message.role === 'assistant' && (
                                        <button onClick={handleDownload}>Download Proof</button>
                                    )}
                                </div>

                                {message.role === 'assistant' && message.content.startsWith('/') ? (
                                    <div>
                                        <img src={`data:image/jpeg;base64,${message.content}`} alt="Generated content" />
                                    </div>
                                ) : (
                                    <div
                                        className={`inline-block p-3 rounded-lg ${message.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-white'
                                            }`}
                                    >
                                        {message.content}
                                    </div>
                                )}

                            </div>
                            {message.role === 'user' && (
                                <div className="flex-shrink-0 ml-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center">
                                        {userEmail.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="text-center">
                            <span className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></span>
                        </div>
                    )}
                </div>

                {/* Input form */}
                <footer className="w-full py-4 flex justify-center px-4">
                    <div className={`bg-gradient-to-tr from-[#000D33] via-[#9A9A9A] to-[#000D33] p-0.5 rounded-lg ${!isMobile ? 'w-2/5' : 'w-full'}`}>
                        <form onSubmit={handleSubmit} className="w-full max-w-lg flex justify-center items-center bg-[#08121f] rounded-lg">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Message ZkSurfer"
                                className="bg-transparent flex-grow py-2 px-4 rounded-l-full outline-none text-white placeholder-[#A0AEC0] font-ttfirs"
                            />
                            <button type="submit" className="bg-white text-black p-1 m-1 rounded-md font-bold" disabled={isLoading}>
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

