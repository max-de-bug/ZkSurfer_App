'use client';
import { FC, useState, useEffect, useRef } from 'react';
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
import { useRouter } from 'next/navigation';
// import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useMemeStore } from '@/stores/meme-store';
import { ApifyClient } from 'apify-client';

type Command = 'image-gen' | 'meme-coin' | 'content';

interface TickerPopupProps {
    tickers: string[];
    onSelect: (ticker: string) => void;
}

interface CommandPopupProps {
    onSelect: (command: Command, option?: string) => void;
}


interface TickerOption {
    name: string;
}

// interface CommandPopupProps {
//     onSelect: (command: Command) => void;
// }

interface FileSystemFileHandle {
    createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream {
    write(data: any): Promise<void>;
    close(): Promise<void>;
}

interface ShowSaveFilePickerOptions {
    suggestedName?: string;
    types?: Array<{
        description: string;
        accept: Record<string, string[]>;
    }>;
}

// Extend the window interface
declare global {
    interface Window {
        showSaveFilePicker?: (options?: ShowSaveFilePickerOptions) => Promise<FileSystemFileHandle>;
    }
}

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
    type?: 'text' | 'image' | 'image_url' | 'command';
    proof?: any;
    command?: string;
    seed?: string;
}


const apifyClient = new ApifyClient({
    token: 'apify_api_mdt6tlhZErHAe9WPbgUGhYGfeFugLd17oXzO'
});


// const CommandPopup: React.FC<CommandPopupProps> = ({ onSelect }) => (
//     <div className="absolute bottom-full left-0 bg-[#171D3D] rounded-lg shadow-lg">
//         <button onClick={() => onSelect('image-gen')} className="block w-full text-left px-4 py-2 hover:bg-[#24284E]">
//             /image-gen
//         </button>
//         <button onClick={() => onSelect('meme-coin')} className="block w-full text-left px-4 py-2 hover:bg-[#24284E]">
//             /meme-coin
//         </button>
//     </div>
// );

const CommandPopup: React.FC<CommandPopupProps> = ({ onSelect }) => (
    <div className="absolute bottom-full left-0 bg-[#171D3D] rounded-lg shadow-lg">
        <button onClick={() => onSelect('image-gen')} className="block w-full text-left px-4 py-2 hover:bg-[#24284E]">
            /image-gen
        </button>
        <button onClick={() => onSelect('meme-coin')} className="block w-full text-left px-4 py-2 hover:bg-[#24284E]">
            /meme-coin
        </button>
        <button onClick={() => onSelect('content')} className="block w-full text-left px-4 py-2 hover:bg-[#24284E]">
            /content
        </button>
    </div>
);


const TickerPopup: React.FC<TickerPopupProps> = ({ tickers, onSelect }) => (
    <div className="absolute bottom-full left-0 bg-[#171D3D] rounded-lg shadow-lg">
        {tickers.map((ticker, index) => (
            <button
                key={index}
                onClick={() => onSelect(ticker)}
                className="block w-full text-left px-4 py-2 hover:bg-[#24284E]"
            >
                {ticker}
            </button>
        ))}
    </div>
);



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
    const [showCommandPopup, setShowCommandPopup] = useState(false);
    const [commandPart, setCommandPart] = useState('');
    const [normalPart, setNormalPart] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const [currentCommand, setCurrentCommand] = useState<'image-gen' | 'meme-coin' | null>(null);

    // const { address } = useAccount();
    // const { data: walletClient } = useWalletClient();
    // const publicClient = usePublicClient();

    const [displayMessages, setDisplayMessages] = useState<Message[]>([]); // Array for messages to be displayed
    const [apiMessages, setApiMessages] = useState<Message[]>([]);

    const [currentSeed, setCurrentSeed] = useState<string | null>(null);
    const [tickerOptions, setTickerOptions] = useState<TickerOption[]>([]);
    const [showTickerPicker, setShowTickerPicker] = useState(false);
    const [showTickerPopup, setShowTickerPopup] = useState(false);
    const [tickers, setTickers] = useState<string[]>([]);

    const [memeGenerationData, setMemeGenerationData] = useState<{
        name: string;
        description: string;
        prompt: string;
        base64Image: string;
        seed: number;
    } | null>(null);

    useEffect(() => {
        const fetchTickerOptions = async () => {
            if (wallet.publicKey) {
                try {
                    const response = await fetch(`https://zynapse.zkagi.ai/getTickersByWallet/${wallet.publicKey.toString()}`, {
                        headers: {
                            'api-key': 'zk-123321'
                        }
                    });
                    if (!response.ok) throw new Error('Failed to fetch tickers');
                    const data = await response.json();
                    setTickers(data.tickers); // Only set the tickers array
                } catch (error) {
                    console.error('Error fetching tickers:', error);
                }
            }
        };

        fetchTickerOptions();
    }, [wallet.publicKey]);

    const compressImage = async (base64String: string, targetSizeKB: number = 450): Promise<string> => {
        // Create an image element
        const img = new window.Image();
        await new Promise((resolve) => {
            img.onload = resolve;
            img.src = base64String;
        });

        const canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let quality = 1.0;
        let compressed = base64String;

        // Start with original dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Function to get file size in KB
        const getFileSizeKB = (base64String: string): number => {
            const base64Length = base64String.split(',')[1].length;
            const fileSizeBytes = (base64Length * 3) / 4;
            return fileSizeBytes / 1024;
        };

        // Compress until size is under target
        while (getFileSizeKB(compressed) > targetSizeKB && quality > 0.1) {
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                compressed = canvas.toDataURL('image/jpeg', quality);
            }
            quality -= 0.1;
        }

        // If still too large, reduce dimensions
        if (getFileSizeKB(compressed) > targetSizeKB) {
            let scale = 0.9;
            while (getFileSizeKB(compressed) > targetSizeKB && scale > 0.1) {
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                if (ctx) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    compressed = canvas.toDataURL('image/jpeg', quality);
                }
                scale -= 0.1;
            }
        }

        return compressed;
    };

    // const processTwitterData = async (twitterUrl: any) => {
    //     const client = new ApifyClient({
    //         token: 'apify_api_mdt6tlhZErHAe9WPbgUGhYGfeFugLd17oXzO'
    //     });

    //     try {
    //         const run = await client.actor('quacker/twitter-scraper').call({
    //             input: {
    //                 searchMode: 'user',
    //                 user: twitterUrl,
    //                 maxTweets: 10
    //             }
    //         });

    //         const { output } = await run.waitForFinish();
    //         return output;
    //     } catch (error) {
    //         console.error('Error fetching tweets:', error);
    //         return null;
    //     }
    // };

    const processTwitterData = async (twitterUrl: string) => {
        const client = new ApifyClient({
            token: 'apify_api_mdt6tlhZErHAe9WPbgUGhYGfeFugLd17oXzO',
        });

        try {
            // Start the actor run
            const run = await client.actor('quacker/twitter-scraper').call({
                input: {
                    searchMode: 'user',
                    user: twitterUrl,
                    maxTweets: 10,
                },
            });

            // Wait for the run to finish
            await client.run(run.id).waitForFinish();

            // Get the output from the dataset (if the actor stores results in a dataset)
            const { items } = await client.dataset(run.defaultDatasetId).listItems();

            return items; // Return the tweets or other data fetched
        } catch (error) {
            console.error('Error fetching tweets:', error);
            return null;
        }
    };



    // Function to format base64 image properly
    const formatBase64Image = (base64String: string): string => {
        if (!base64String.startsWith('data:image/')) {
            return `data:image/png;base64,${base64String}`;
        }
        return base64String;
    };

    const handleMemeImageGeneration = async (imageData: string, prompt: string) => {
        try {
            // Format and compress the image here instead of in the message handling
            let formattedImage = imageData;
            if (!imageData.startsWith('data:image/')) {
                formattedImage = `data:image/png;base64,${imageData}`;
            }
            const compressedImage = await compressImage(formattedImage);

            const imageUploadResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: [{
                            type: 'text',
                            text: 'Analyze the given image and suggest a creative name and description that fit the theme and appearance of the image. Ensure the output is always in the format: {"name":<generated_name>, "description":<generated_description>}.Return only a JSON response in the following format: {"name":<generated_name>, "description":<generated_description>}.'
                        }, {
                            type: 'image_url',
                            image_url: {
                                url: compressedImage
                            }
                        }]
                    }]
                })
            });

            if (!imageUploadResponse.ok) {
                throw new Error('Failed to process image');
            }

            const data = await imageUploadResponse.json();

            try {
                const jsonMatch = data.content.match(/\{.*\}/);
                console.log('jsonMatch', jsonMatch)
                console.log('jsonMatch[0]', jsonMatch[0])
                if (jsonMatch && jsonMatch[0]) {
                    const parsedData = JSON.parse(jsonMatch[0]);
                    console.log('parsedData', parsedData)
                    setMemeGenerationData({
                        ...parsedData,
                        prompt,
                        base64Image: compressedImage,
                        seed: data.proof?.seed || -1
                    });
                } else {
                    throw new Error('No JSON object found in response');
                }
            } catch (e) {
                console.error('Failed to parse meme data:', e);
            }
        } catch (error) {
            console.error('Error in meme image generation:', error);
        }
    };

    useEffect(() => {
        const handleMarketClick = () => {
            router.push('/marketplace');
        };

        // Attach the handler to your marketplace button
        const marketplaceButton = document.querySelector('[data-marketplace-button]');
        if (marketplaceButton) {
            marketplaceButton.addEventListener('click', handleMarketClick);
        }

        return () => {
            if (marketplaceButton) {
                marketplaceButton.removeEventListener('click', handleMarketClick);
            }
        };
    }, [router]);

    // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const value = e.target.value;
    //     setInputMessage(value);

    //     if (value === '/') {
    //         setShowCommandPopup(true);
    //     } else if (!value.startsWith('/')) {
    //         setShowCommandPopup(false);
    //     }
    // };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputMessage(value);

        if (value === '/') {
            setShowCommandPopup(true);
            setShowTickerPopup(false);
        } else if (!value) {
            setShowCommandPopup(false);
            setShowTickerPopup(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setShowCommandPopup(false);
        }
    };

    // const handleCommandSelect = (command: Command) => {
    //     setInputMessage(`/${command} `);
    //     setShowCommandPopup(false);
    //     inputRef.current?.focus();
    // };

    const getStyledInputContent = () => {
        const parts = inputMessage.split(' ');
        if (parts[0].startsWith('/')) {
            return (
                <>
                    <span className="text-blue-400 font-bold">{parts[0]}</span>
                    <span>{' ' + parts.slice(1).join(' ')}</span>
                </>
            );
        }
        return inputMessage;
    };

    const handleCommandSelect = (command: Command) => {
        if (command === 'content') {
            setInputMessage('/content ');
            setShowCommandPopup(false);
            setShowTickerPopup(true);
        } else {
            setInputMessage(`/${command} `);
            setShowCommandPopup(false);
        }
        inputRef.current?.focus();
    };

    const handleTickerSelect = (ticker: string) => {
        setInputMessage(`/content ${ticker}`);
        setShowTickerPopup(false);
        inputRef.current?.focus();
    };


    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (session && session.user) {
            setUserEmail('User');
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
        const fullMessage = inputMessage.trim();

        // Check if message starts with a command
        const isImageGen = fullMessage.startsWith('/image-gen');
        const isMemeGen = fullMessage.startsWith('/meme-coin');
        const isContent = fullMessage.startsWith('/content');

        if (isImageGen || isMemeGen || isContent) {


            if (fullMessage.startsWith('/content')) {
                // const ticker = fullMessage.replace('/content', '').trim();
                const ticker = fullMessage.split('content')[1]?.split('tweet')[0]?.trim() || '';

                try {
                    const response = await fetch(`https://zynapse.zkagi.ai/contentengine_knowledgebase/${ticker}`, {
                        headers: {
                            'api-key': 'zk-123321'
                        }
                    });

                    if (!response.ok) throw new Error('Failed to fetch content');
                    const data = await response.json();
                    console.log('data', data)

                    // Extract training data and Twitter URL
                    const trainingData = data.training_data || [];
                    let twitterUrl = '';

                    // Look for Twitter URL in the urls array
                    if (data.urls && Array.isArray(data.urls)) {
                        twitterUrl = data.urls.find((url: string) => url.includes('twitter.com')) || '';
                    }

                    let twitterData = null;
                    if (twitterUrl) {
                        // Extract username from Twitter URL
                        const username = twitterUrl.split('twitter.com/').pop()?.split('/')[0] || '';
                        if (username) {
                            twitterData = await processTwitterData(username);
                        }
                    }

                    // Combine data for text generation
                    const combinedData = {
                        training_data: trainingData,
                        twitter_data: twitterData
                    };

                    // Make the text generation API call using existing chat endpoint
                    const textGenResponse = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            messages: [
                                ...apiMessages,
                                {
                                    role: 'user',
                                    content: JSON.stringify(combinedData)
                                }
                            ]
                        })
                    });

                    if (!textGenResponse.ok) throw new Error('Failed to generate text');
                    const textGenData = await textGenResponse.json();


                    const displayMessage: Message = {
                        role: 'user',
                        content: fullMessage
                    };

                    setDisplayMessages(prev => [...prev, displayMessage]);

                    const assistantMessage: Message = {
                        role: 'assistant',
                        content: data.content || 'No content available',
                        type: 'text'
                    };
                    setDisplayMessages(prev => [...prev, assistantMessage]);

                } catch (error) {
                    console.error('Error fetching content:', error);
                }
            }

            const commandType = isImageGen ? 'image-gen' : 'meme-coin';
            setCurrentCommand(commandType);
            // Extract the prompt part after the command
            const promptText = fullMessage.replace(isImageGen ? '/image-gen' : '/meme-coin', '').trim();


            // Create message objects
            const displayMessage: Message = {
                role: 'user',
                content: fullMessage
            };
            const apiMessage: Message = {
                role: 'user',
                content: fullMessage,
                type: 'command',
                command: isMemeGen ? 'meme-coin' : 'image-gen'
            };

            setDisplayMessages(prev => [...prev, displayMessage]);
            setApiMessages(prev => [...prev, apiMessage]);
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
                        directCommand: {
                            type: commandType,
                            prompt: promptText
                        }
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) throw new Error('Failed to get response');

                const data = await response.json();
                if (data.seed) {
                    setCurrentSeed(data.seed);
                }
                setProofData(data.proof);

                if (isMemeGen) {
                    if (data.content && typeof data.content === 'string') {
                        await handleMemeImageGeneration(data.content, promptText);
                    }
                }

                const assistantMessage: Message = {
                    role: 'assistant',
                    content: data.content,
                    type: 'image',
                    command: isMemeGen ? 'meme-coin' : 'image-gen'
                };

                setDisplayMessages(prev => [...prev, assistantMessage]);
                setApiMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.prompt || data.content,
                    type: 'image',
                    command: isMemeGen ? 'meme-coin' : 'image-gen'
                }]);

            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
                setCurrentCommand(null);
            }
        }
        else {
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
                    setCurrentCommand(null);
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
        }
        setCommandPart('');
        setNormalPart('');
    };

    const setMemeData = useMemeStore((state) => state.setMemeData);

    const handleLaunchMemeCoin = () => {
        if (memeGenerationData && currentSeed && wallet) {
            setMemeData({
                name: memeGenerationData.name,
                description: memeGenerationData.description,
                prompt: memeGenerationData.prompt,
                base64Image: memeGenerationData.base64Image,
                seed: currentSeed,
                wallet: wallet.publicKey ? wallet.publicKey.toString() : ''
            });
            router.push('/memelaunch');
        } else {
            console.error('No meme generation data available');
            router.push('/memelaunch');
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


    // const handleMintNFT = async (base64Image: string) => {
    //     if (!address || !walletClient || !publicClient) {
    //         console.error("Wallet not connected");
    //         return;
    //     }

    //     setLoading(true);
    //     try {
    //         const result = await createNft({
    //             walletClient,
    //             publicClient,
    //             base64Image,
    //             contractAddress: '0xYourNFTContractAddress' // Replace with your actual NFT contract address
    //         });

    //         // Open transaction in block explorer
    //         window.open(`https://etherscan.io/tx/${result.hash}`, '_blank', 'noopener,noreferrer');
    //     } catch (error) {
    //         console.error("Failed to mint NFT:", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

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

        const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: 'application/json' });

        if (window.showSaveFilePicker) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: 'proof.json',
                    types: [{
                        description: 'JSON File',
                        accept: { 'application/json': ['.json'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
            } catch (err) {
                console.error('Failed to save file:', err);
                // Fall back to the alternative method
                fallbackDownload(blob);
            }
        } else {
            fallbackDownload(blob);
        }
    };

    const fallbackDownload = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'proof.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
                                <Image
                                    key={index}
                                    src={content.image_url?.url || ''}
                                    alt="Uploaded content"
                                    width={80}
                                    height={80}
                                    className="object-cover rounded-lg"
                                    layout="fixed"
                                    quality={75}
                                />
                            ))}
                    </div>
                </div>

            );
        }
        else if (typeof message.content === 'string') {
            // Check if it's a user message with a command
            if (message.role === 'user') {
                let displayedContent = message.content;

                // Handle '/image-gen' and '/meme-coin'
                if (displayedContent.startsWith('/image-gen')) {
                    // Remove '/image-gen' and show "Generate image of"
                    const prompt = displayedContent.replace('/image-gen', '').trim();
                    displayedContent = `Generate image of: ${prompt}`;
                } else if (displayedContent.startsWith('/meme-coin')) {
                    // Remove '/meme-coin' and show "Generate a meme for"
                    const prompt = displayedContent.replace('/meme-coin', '').trim();
                    displayedContent = `Generate a meme for: ${prompt}`;
                }

                // Render the modified content
                return <div className="text-white">{displayedContent}</div>;
            }

            // For assistant responses that are images
            if (message.role === 'assistant' && message.type === 'image') {
                return (
                    <ResultBlock
                        content={message.content}
                        type="image"
                        onMintNFT={handleMintNFT}
                        onDownloadProof={handleDownload}
                    />
                );
            } else {
                // For other assistant responses (text)
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
                        <div className="mb-4 flex flex-row items-center justify-start gap-2" data-marketplace-button
                            role="button"
                            tabIndex={0}><span> <Image
                                src="images/marketplace.svg"
                                alt="explore marketplace"
                                width={15}
                                height={15}
                                className='my-2'
                            /></span>Meme Coin Playground</div>
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
                                        imageResultType={message.command}
                                        // onLaunchMemeCoin={message.command === 'meme-coin' ? () => router.push('/memelaunch') : undefined}
                                        onLaunchMemeCoin={message.command === 'meme-coin' ? handleLaunchMemeCoin : undefined}
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
                                                <Image
                                                    src={file.preview}
                                                    alt={`Preview ${index}`}
                                                    width={500}
                                                    height={500}
                                                    className="w-full h-full object-cover rounded-lg"
                                                    layout="responsive"
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
                                <div className="relative w-full flex items-center bg-transparent py-2 px-4 rounded-l-full">
                                    <div className="absolute left-4 right-4 pointer-events-none whitespace-pre">
                                        {getStyledInputContent()}
                                    </div>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputMessage}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Message ZkSurfer"
                                        className="bg-transparent flex-grow outline-none text-white placeholder-[#A0AEC0] font-ttfirs w-full opacity-0"
                                    />
                                    {/* {showCommandPopup && (
                                        <CommandPopup onSelect={handleCommandSelect} />
                                    )} */}
                                    {showCommandPopup && (
                                        <CommandPopup
                                            onSelect={handleCommandSelect}
                                        />
                                    )}
                                    {showTickerPopup && (
                                        <TickerPopup
                                            tickers={tickers}
                                            onSelect={handleTickerSelect}
                                        />
                                    )}
                                </div>
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