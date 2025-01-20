// import React, { useState } from 'react';
// import Image from 'next/image';

// interface ResultBlockProps {
//     content: string;
//     type: 'image' | 'code';
//     language?: string;
//     onMintNFT?: (content: string) => void;
//     onDownloadProof: () => void;
//     imageResultType?: any
// }

// const ResultBlock: React.FC<ResultBlockProps> = ({ content, type, language, imageResultType, onMintNFT, onDownloadProof }) => {
//     const [isCopied, setIsCopied] = useState(false);

//     const copyToClipboard = () => {
//         const codeWithoutLanguage = content.split('\n').slice(1).join('\n'); // Skips the first line (language line)
//         navigator.clipboard.writeText(codeWithoutLanguage).then(() => {
//             setIsCopied(true);
//             setTimeout(() => setIsCopied(false), 2000);
//         });
//     };
//     console.log('img', imageResultType)

//     return (
//         <div className="bg-gray-800 rounded-lg p-4 my-2">
//             {type === 'image' ? (
//                 <div>
//                     <div className="mt-2 flex space-x-2 justify-between mb-1">
//                         <div>
//                             <button
//                                 onClick={onDownloadProof}
//                                 className="flex items-center space-x-2  text-white  rounded"
//                             >
//                                 <span className='text-[#A0AEC0] hover:text-[#00FF89]'>Download Proof</span>
//                                 <Image
//                                     src="images/downloadProof.svg"
//                                     alt="logo"
//                                     width={30}
//                                     height={30}
//                                     className='hover:text-[#00FF89]'
//                                 />
//                             </button>
//                         </div>
//                         {onMintNFT && (
//                             <div>
//                                 <button
//                                     onClick={() => onMintNFT(`data:image/jpeg;base64,${content}`)}
//                                     className="flex items-center space-x-2  text-white rounded"
//                                 >
//                                     <span className='text-[#A0AEC0] hover:text-[#00FF89]'>Mint Nft</span>
//                                     <Image
//                                         src="images/nft.svg"
//                                         alt="logo"
//                                         width={30}
//                                         height={30}
//                                         className='hover:text-[#00FF89]'
//                                     />
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                     <img src={`data:image/jpeg;base64,${content}`} alt="Generated content" className="w-full rounded-lg" />
//                 </div>
//             ) : (
//                 <div>
//                     <div className="flex space-x-2 justify-between mb-1">
//                         <div>
//                             <button
//                                 onClick={onDownloadProof}
//                                 className="flex items-center space-x-2  text-white rounded"
//                             >
//                                 <span className='text-[#A0AEC0]'>Download Proof</span>
//                                 <Image
//                                     src="images/downloadProof.svg"
//                                     alt="logo"
//                                     width={30}
//                                     height={30}
//                                 />
//                             </button>
//                         </div>
//                         <div>
//                             <button
//                                 onClick={copyToClipboard}
//                                 className="flex items-center space-x-2  text-[#A0AEC0] rounded "
//                             >
//                                 {isCopied ? 'Copied!' : 'Copy Code'}
//                                 <Image
//                                     src="images/Copy.svg"
//                                     alt="logo"
//                                     width={30}
//                                     height={30}
//                                 />
//                             </button>
//                         </div>
//                     </div>
//                     {language && <div className="text-sm text-gray-400 mb-1">{language}</div>} {/* Language line displayed outside */}
//                     <pre className="bg-gray-900 p-4 rounded-lg overflow-x-fit">
//                         <code>{content}</code>
//                     </pre>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ResultBlock;


"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface ResultBlockProps {
    content: string
    type: "image" | "code"
    imageResultType?: "create-agent" | "image-gen" | null | string
    language?: string
    onMintNFT?: (content: string) => void
    onDownloadProof: () => void
    onLaunchMemeCoin?: () => void
    loading?: boolean
}

const ResultBlock: React.FC<ResultBlockProps> = ({
    content,
    type,
    imageResultType,
    language,
    onMintNFT,
    onDownloadProof,
    onLaunchMemeCoin,
    loading,
}) => {
    const [isCopied, setIsCopied] = useState(false)
    const router = useRouter()

    const copyToClipboard = () => {
        const codeWithoutLanguage = content.split("\n").slice(1).join("\n")
        navigator.clipboard.writeText(codeWithoutLanguage).then(() => {
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        })
    }

    return (
        <div className="bg-gray-800 rounded-lg p-4 my-2">
            {type === "image" ? (
                <div>
                    <div className="mt-2 flex space-x-2 justify-between mb-1">
                        <div>
                            <button onClick={onDownloadProof} className="flex items-center space-x-2 text-white rounded">
                                <span className="text-[#A0AEC0] hover:text-[#00FF89]">Download Proof</span>
                                <Image
                                    src="images/downloadProof.svg"
                                    alt="logo"
                                    width={30}
                                    height={30}
                                    className="hover:text-[#00FF89]"
                                />
                            </button>
                        </div>
                        {imageResultType === "create-agent" ? (
                            <div>
                                <button onClick={onLaunchMemeCoin} className="flex items-center space-x-2 text-white rounded">
                                    <span className="text-[#A0AEC0] hover:text-[#00FF89]">Launch Agent</span>
                                    <Image src="images/meme.svg" alt="launch" width={30} height={30} className="hover:text-[#00FF89]" />
                                </button>
                            </div>
                        ) : (
                            imageResultType === "image-gen" &&
                            onMintNFT && (
                                <div>
                                    <button
                                        onClick={() => onMintNFT(`data:image/jpeg;base64,${content}`)}
                                        disabled={loading}
                                        className="flex items-center space-x-2 rounded px-4 py-2 text-[#A0AEC0] hover:text-[#00FF89] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span>Mint NFT</span>
                                        <Image src="images/nft.svg" alt="logo" width={30} height={30} className="hover:text-[#00FF89]" />
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                    <div className="relative">
                        <img src={`data:image/jpeg;base64,${content}`} alt="Generated content" className="w-full rounded-lg" />
                        {loading && (
                            <div
                                className="absolute inset-0 bg-black/70 rounded-lg flex flex-col items-center justify-center"
                                role="status"
                                aria-label="Minting NFT"
                            >
                                <Loader2 className="w-12 h-12 text-white animate-spin mb-2" />
                                <span className="text-white text-lg font-semibold">Minting NFT...</span>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex space-x-2 justify-between mb-1">
                        <div>
                            <button onClick={onDownloadProof} className="flex items-center space-x-2 text-white rounded">
                                <span className="text-[#A0AEC0]">Download Proof</span>
                                <Image src="images/downloadProof.svg" alt="logo" width={30} height={30} />
                            </button>
                        </div>
                        <div>
                            <button onClick={copyToClipboard} className="flex items-center space-x-2 text-[#A0AEC0] rounded">
                                {isCopied ? "Copied!" : "Copy Code"}
                                <Image src="images/Copy.svg" alt="logo" width={30} height={30} />
                            </button>
                        </div>
                    </div>
                    {language && <div className="text-sm text-gray-400 mb-1">{language}</div>}
                    <pre className="bg-gray-900 p-4 rounded-lg max-w-3xl whitespace-pre-wrap">
                        <code>{content}</code>
                    </pre>
                </div>
            )}
        </div>
    )
}

export default ResultBlock