
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
import CodeBlock from '@/component/ui/CodeBlock';
import ResultBlock from '@/component/ui/ResultBlock';

interface Message {
    role: 'user' | 'assistant';
    content: string | Array<{
        type: 'text' | 'image_url';
        text?: string;
        image_url?: { url: string };
    }>;
    type?: 'text' | 'image' | 'image_url'; //| 'text-pdf' | 'text-image-pdf' | 'pdf' |
    proof?: any;
}

const HomeContent: FC = () => {
    const wallet = useWallet();
    const { data: session, status } = useSession();
    const [files, setFiles] = useState<Array<{ file: File, preview: string }>>([]);
    const [fileInput, setFileInput] = useState<File | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    // const [messages, setMessages] = useState<Message[]>([]);
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


    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject(new Error('Failed to convert file to base64'));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            if (files.length + selectedFiles.length <= 4) {
                const newFiles = await Promise.all(
                    selectedFiles.map(async (file) => ({
                        file,
                        preview: await fileToBase64(file)
                    }))
                );
                setFiles([...files, ...newFiles]);
            } else {
                alert('You can only upload up to 4 files');
            }
        }
    };

    const removeFile = (index: number) => {
        const newFiles = [...files];
        URL.revokeObjectURL(newFiles[index].preview);
        newFiles.splice(index, 1);
        setFiles(newFiles);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let messageContent: any[] = [];

        if (files.length > 0) {
            // Handle case when files are present
            if (inputMessage.trim()) {
                messageContent.push({
                    type: "text",
                    text: inputMessage.trim()
                });
            }


            // Add all image files
            for (const fileObj of files) {
                messageContent.push({
                    type: "image_url",
                    image_url: {
                        url: fileObj.preview
                    }
                });
            }

            const userMessage: Message = {
                role: 'user',
                content: messageContent
            };

            setDisplayMessages(prev => [...prev, userMessage]);

            setApiMessages(prev => [...prev, userMessage]);

            setInputMessage('');
            setFiles([]); // Clear all files
            setIsLoading(true);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120000);

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: [...apiMessages, userMessage],
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) throw new Error('Failed to get response');

                const data = await response.json();
                setProofData(data.proof);

                let assistantMessageForDisplay: Message;
                let assistantMessageForAPI: Message;

                if (data.type === 'image' || (typeof data.content === 'string' && data.content.startsWith('/'))) {
                    setResultType('image');
                    assistantMessageForDisplay = {
                        role: 'assistant',
                        content: data.content,
                        // type: 'image'
                    };
                    assistantMessageForAPI = {
                        role: 'assistant',
                        content: data.prompt || data.content,
                        // type: 'text'
                    };
                } else {
                    assistantMessageForDisplay = {
                        role: 'assistant',
                        content: data.content,
                        // type: 'text'
                    };
                    assistantMessageForAPI = assistantMessageForDisplay;
                }

                setDisplayMessages(prev => [...prev, assistantMessageForDisplay]);
                setApiMessages(prev => [...prev, assistantMessageForAPI]);

            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        } else {
            // Existing text-only handling
            const userMessage: Message = { role: 'user', content: inputMessage };

            setDisplayMessages((prev) => [...prev, userMessage]);

            const apiMessage: Message = { role: 'user', content: inputMessage };
            setApiMessages((prev) => [...prev, apiMessage]);

            setInputMessage('');
            setIsLoading(true);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120000);

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: [...apiMessages, apiMessage],
                    }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!response.ok) throw new Error('Failed to get response');

                const data = await response.json();

                let assistantMessageForDisplay: Message;
                let assistantMessageForAPI: Message;

                setProofData(data.proof);

                if (data.type === 'img') {
                    setResultType(data.type)
                    assistantMessageForDisplay = {
                        role: 'assistant',
                        content: data.content,
                    };
                    assistantMessageForAPI = {
                        role: 'assistant',
                        content: data.prompt,
                    };
                } else {
                    assistantMessageForDisplay = {
                        role: 'assistant',
                        content: data.content,
                    };
                    assistantMessageForAPI = assistantMessageForDisplay;
                }

                setDisplayMessages((prev) => [...prev, assistantMessageForDisplay]);
                setApiMessages((prev) => [...prev, assistantMessageForAPI]);

            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
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
    // const [nftResponse, setNftResponse] = useState<string | null>(null);  // Store the NFT response
    const [loading, setLoading] = useState(false);  // Loading state
    //both are hardcoded values
    const name = "car";
    const image = "0x1";


    const handleMintNFT = async (base64Image: string) => {
        setLoading(true);
        try {
            const { signature, assetPublicKey } = await createNft(wallet, base64Image, wallet.publicKey?.toString() || '');
            const metaplexUrl = `https://core.metaplex.com/explorer/${assetPublicKey}?env=devnet`;
            window.open(metaplexUrl, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error("Failed to mint NFT:", error);
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

    const renderMessageContent = (message: Message) => {
        if (Array.isArray(message.content)) {
            return (
                <div className="flex flex-col gap-2">
                    {message.content.map((content, index) => {
                        if (content.type === 'text') {
                            return (
                                <div key={index} className="text-white">
                                    {renderTextContent(content.text || '')}
                                </div>
                            );
                        } else if (content.type === 'image_url') {
                            return (
                                <div key={index} className="max-w-sm">
                                    <img
                                        src={content.image_url?.url}
                                        alt="Uploaded content"
                                        className="rounded-lg"
                                    />
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            );
        } else if (typeof message.content === 'string') {
            if (message.type === 'image' || message.content.startsWith('/')) {
                return (
                    <ResultBlock
                        content={message.content}
                        type="image"
                        onMintNFT={handleMintNFT}
                        onDownloadProof={handleDownload}
                    />
                );
            } else {
                return renderTextContent(message.content);
            }
        }
        return null;
    };

    const renderTextContent = (content: string) => {
        const parts = content.split('```');
        return parts.map((part, index) => {
            if (index % 2 === 0) {
                // This is regular text
                return (
                    <div key={index} className="mb-4">
                        {part.trim()}
                    </div>
                );
            } else {
                // This is a code block
                return (
                    <ResultBlock
                        key={index}
                        content={part.trim().split('\n').slice(1).join('\n')}
                        language={part.trim().split('\n')[0]}
                        type="code"
                        onDownloadProof={handleDownload}
                    />
                );
            }
        });
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
                        {/* <button onClick={handleMintNFT} disabled={loading}>
                            {loading ? 'Minting NFT...' : 'Mint NFT'}
                        </button> */}
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
                    <div className="text-lg font-semibold flex-1 flex justify-center items-center gap-2">
                        <div><Image
                            src="images/tiger.svg"
                            alt="logo"
                            width={30}
                            height={30}
                        /></div>
                        <div className='font-ttfirs text-xl'>ZkSurfer</div>
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
                        <div key={index} className="mb-4 flex justify-start w-full">
                            <div className="flex-shrink-0 mr-3">
                                <div className="w-10 h-10 rounded-full bg-[#171D3D] border flex items-center justify-center">
                                    {message.role === 'user' ? (
                                        userEmail.charAt(0).toUpperCase()
                                    ) : (
                                        <Image
                                            src="images/tiger.svg"
                                            alt="logo"
                                            width={40}
                                            height={40}
                                            className='p-2'
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-start">
                                <div className="flex items-center justify-between w-full mt-2">

                                    <span
                                        className={`flex justify-between items-center text-md text-gray-400 font-sourceCode ${message.role !== 'user' &&
                                            'bg-gradient-to-br from-zkIndigo via-zkLightPurple to-zkPurple bg-clip-text text-transparent'
                                            } ${!isMobile ? `mt-0.5` : ``}`}
                                    >
                                        {message.role === 'user' ? userEmail : 'ZkSurfer'}

                                    </span>
                                    {message.role !== 'user' && (
                                        <div className="flex space-x-2">
                                            <button className="text-white rounded-lg">
                                                <Image
                                                    src="images/Download.svg"
                                                    alt="logo"
                                                    width={20}
                                                    height={20}
                                                />
                                            </button>
                                            <button className="text-white rounded-lg">
                                                <Image
                                                    src="images/share.svg"
                                                    alt="logo"
                                                    width={20}
                                                    height={20}
                                                />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {message.role === 'assistant' &&

                                    (typeof message.content === 'string' && message.content.startsWith('/')) ? (
                                    <ResultBlock
                                        content={message.content}
                                        type="image"
                                        onMintNFT={handleMintNFT}
                                        onDownloadProof={handleDownload}
                                    />
                                ) : (
                                    <div className="inline-block p-1 rounded-lg text-white">
                                        {renderMessageContent(message)}
                                    </div>
                                )}

                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="text-center">
                            <span className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></span>
                        </div>
                    )}
                </div>

                <footer className="w-full py-4 flex justify-center px-4">
                    <div className={`bg-gradient-to-tr from-[#000D33] via-[#9A9A9A] to-[#000D33] p-0.5 rounded-lg ${!isMobile ? 'w-2/5' : 'w-full'}`}>
                        <form onSubmit={handleSubmit} className="w-full flex flex-col bg-[#08121f] rounded-lg">
                            {files.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-2">
                                    {files.map((file, index) => (
                                        <div key={index} className="relative w-20 h-20">
                                            <img
                                                src={file.preview}
                                                alt={`Preview ${index}`}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                                                type="button"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                    id="fileInput"
                                    multiple
                                />
                                <label htmlFor="fileInput" className="cursor-pointer mx-2">
                                    <Image
                                        src="/images/attachment.svg"
                                        alt="Attach file"
                                        width={20}
                                        height={20}
                                    />
                                </label>
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
                            </div>
                        </form>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default HomeContent;

