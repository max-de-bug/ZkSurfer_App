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
import ResultBlock from '@/component/ui/ResultBlock';
import * as pdfjs from 'pdfjs-dist';

interface FileObject {
    file: File;
    preview: string;
    isPdf: boolean;
}

interface Message {
    role: 'user' | 'assistant';
    content: string | Array<{
        type: 'text' | 'image_url';
        text?: string;
        image_url?: { url: string };
    }>;
    type?: 'text' | 'image' | 'image_url';
    proof?: any;
}


const HomeContent: FC = () => {
    const wallet = useWallet();
    const { data: session, status } = useSession();
    const [files, setFiles] = useState<FileObject[]>([]);
    const [fileInput, setFileInput] = useState<File | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [proofData, setProofData] = useState(null);
    const [resultType, setResultType] = useState('');
    const [pdfContent, setPdfContent] = useState<string | null>(null);
    const [currentPdfName, setCurrentPdfName] = useState<string | null>(null);

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

    useEffect(() => {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
    }, []);

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

    const extractTextFromPdf = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        const textPromises = Array.from({ length: pdf.numPages }, async (_, i) => {
            const page = await pdf.getPage(i + 1);
            const content = await page.getTextContent();
            return content.items.map((item: any) => item.str).join(' ');
        });

        const texts = await Promise.all(textPromises);
        return texts.join('\n');
    };


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            if (files.length + selectedFiles.length <= 4) {
                const newFiles = await Promise.all(
                    selectedFiles.map(async (file) => {
                        if (file.type === 'application/pdf') {
                            const pdfText = await extractTextFromPdf(file);
                            setPdfContent(pdfText);
                            setCurrentPdfName(file.name);
                            return {
                                file,
                                preview: URL.createObjectURL(file),
                                isPdf: true,
                            };
                        } else {
                            return {
                                file,
                                preview: await fileToBase64(file),
                                isPdf: false,
                            };
                        }
                    })
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

        let displayMessageContent: any[] = [];
        let apiMessageContent: any[] = [];

        if (files.length > 0) {
            // Handle case when files are present
            if (inputMessage.trim()) {
                displayMessageContent.push({
                    type: "text",
                    text: inputMessage.trim()
                });
                apiMessageContent.push({
                    type: "text",
                    text: inputMessage.trim()
                });
            }



            for (const fileObj of files) {
                if (fileObj.isPdf) {
                    // For display message: only add filename
                    displayMessageContent.push({
                        type: "text",
                        text: `[PDF: ${fileObj.file.name}]`
                    });

                    // For API message: add extracted text if available
                    if (pdfContent && fileObj.file.name === currentPdfName) {
                        apiMessageContent.push({
                            type: "text",
                            text: pdfContent
                        });
                    }
                } else {
                    // For images, add to both display and API messages
                    const imageContent = {
                        type: "image_url",
                        image_url: {
                            url: fileObj.preview
                        }
                    };
                    displayMessageContent.push(imageContent);
                    apiMessageContent.push(imageContent);
                }
            }
            const displayMessage: Message = {
                role: 'user',
                content: displayMessageContent
            };

            const apiMessage: Message = {
                role: 'user',
                content: apiMessageContent
            };

            setDisplayMessages(prev => [...prev, displayMessage]);
            setApiMessages(prev => [...prev, apiMessage]);

            setInputMessage('');
            setFiles([]);
            setPdfContent(null);
            setCurrentPdfName(null);
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
                setProofData(data.proof);

                let assistantMessageForDisplay: Message;
                let assistantMessageForAPI: Message;

                if (data.type === 'image' || (typeof data.content === 'string' && data.content.startsWith('/'))) {
                    setResultType('image');
                    assistantMessageForDisplay = {
                        role: 'assistant',
                        content: data.content,
                    };
                    assistantMessageForAPI = {
                        role: 'assistant',
                        content: data.prompt || data.content,
                    };
                } else {
                    assistantMessageForDisplay = {
                        role: 'assistant',
                        content: data.content,
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

    const [loading, setLoading] = useState(false);


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
                <div className="flex flex-col space-y-2">
                    {message.content.map((content, index) => {
                        if (content.type === 'text') {
                            if (content.text?.startsWith('[PDF:')) {
                                const pdfName = content.text.match(/\[PDF: (.*?)\]/)?.[1] || 'Unnamed PDF';
                                return (
                                    <div key={index} className="flex items-center space-x-2 bg-[#24284E] rounded-lg p-2 border border-[#BDA0FF]">
                                        <Image
                                            src="/images/pdf.svg"
                                            alt="PDF icon"
                                            width={20}
                                            height={20}
                                        />
                                        <span className="text-[#BDA0FF] text-xs">{pdfName}</span>
                                    </div>
                                );
                            }
                            return (
                                <div key={index} className="text-white">
                                    {renderTextContent(content.text || '')}
                                </div>
                            );
                        }
                        return null;
                    })}
                    {/* New wrapper for images */}
                    <div className="flex flex-row space-x-2">
                        {message.content
                            .filter(content => content.type === 'image_url')
                            .map((content, index) => (
                                <img
                                    key={index}
                                    src={content.image_url?.url}
                                    alt="Uploaded content"
                                    className="w-20 h-20 object-cover rounded-lg"
                                />
                            ))}
                    </div>
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
                                            {file.isPdf ? (
                                                <div className="w-full h-full flex items-center justify-center bg-[#24284E] rounded-lg text-xs text-[#BDA0FF] text-center overflow-hidden p-1 border border-[#BDA0FF]">
                                                    {file.file.name}
                                                </div>
                                            ) : (
                                                <img
                                                    src={file.preview}
                                                    alt={`Preview ${index}`}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            )}
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
                                    accept="image/*,.pdf"
                                    className="hidden"
                                    id="fileInput"
                                    multiple
                                />
                                <label htmlFor="fileInput" className="cursor-pointer mx-2">
                                    <Image
                                        src="/images/Attach.svg"
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

