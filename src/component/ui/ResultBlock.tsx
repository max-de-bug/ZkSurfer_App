"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface ResultBlockProps {
    content?: string;
    type: 'image' | 'code';
    imageResultType?: 'create-agent' | 'image-gen' | null | string;
    language?: string;
    processing?: boolean;
    onMintNFT?: (content: string) => void;
    onDownloadProof?: () => void;
    onLaunchMemeCoin?: () => void;
    loading?: boolean;
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
    processing = false,
}) => {
    const [isCopied, setIsCopied] = useState(false)
    const router = useRouter()

    const copyToClipboard = () => {
        if (!content) {
            console.warn('No content to copy.');
            return;
        }
        const codeWithoutLanguage = content.split("\n").slice(1).join("\n")
        navigator.clipboard.writeText(codeWithoutLanguage).then(() => {
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        })
    }

    return (
        <div className="bg-gray-800 rounded-lg p-4 my-2 max-w-lg w-full">
            {type === "image" ? (
                <div>
                    {/* Buttons Section */}
                    <div className="mt-2 flex space-x-4 justify-between mb-4">
                        {onDownloadProof && (
                            <button
                                onClick={onDownloadProof}
                                className="flex items-center space-x-2 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={processing}
                            >
                                <span className="text-[#A0AEC0] hover:text-[#00FF89] font-abeezee">Download Proof</span>
                                <Image
                                    src="images/downloadProof.svg"
                                    alt="Download Proof"
                                    width={26}
                                    height={26}
                                />
                            </button>
                        )}
                        {imageResultType === "create-agent" && onLaunchMemeCoin && (
                            <button
                                onClick={onLaunchMemeCoin}
                                className="flex items-center space-x-2 text-white rounded"
                                disabled={loading || processing}
                            >
                                <span className="text-[#A0AEC0] hover:text-[#00FF89] font-abeezee">Launch Agent</span>
                                <Image
                                    src="images/meme.svg"
                                    alt="launch"
                                    width={26}
                                    height={26}
                                />
                            </button>
                        )}
                        {imageResultType === "image-gen" && onMintNFT && (
                            <button
                                onClick={() => onMintNFT(`data:image/jpeg;base64,${content}`)}
                                disabled={loading || processing}
                                className="flex items-center space-x-2 rounded text-[#A0AEC0] hover:text-[#00FF89] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="font-abeezee">Mint NFT</span>
                                <Image
                                    src="images/nft.svg"
                                    alt="Mint NFT"
                                    width={26}
                                    height={26}
                                />
                            </button>
                        )}
                    </div>

                    {/* Image Section */}
                    <div className="relative min-h-64 rounded-lg bg-gray-700 flex overflow-hidden">
                        {processing ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-75">
                                <p className="text-gray-400">Processing... This may take up to 5 minutes.</p>
                                <span className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mt-4"></span>
                            </div>
                        ) : loading ? (
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
                        ) : (
                            <img
                                src={content ? `data:image/jpeg;base64,${content}` : ""}
                                alt="Generated content"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="">
                    <div className="flex space-x-2 justify-between mb-1">
                        <div>
                            <button
                                onClick={onDownloadProof}
                                className="flex items-center space-x-2 text-white rounded"
                            >
                                <span className="text-[#A0AEC0]">Download Proof</span>
                                <Image
                                    src="images/downloadProof.svg"
                                    alt="Download Proof"
                                    width={30}
                                    height={30}
                                />
                            </button>
                        </div>
                        <div>
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center space-x-2 text-[#A0AEC0] rounded"
                            >
                                {isCopied ? "Copied!" : "Copy Code"}
                                <Image
                                    src="images/Copy.svg"
                                    alt="Copy Code"
                                    width={30}
                                    height={30}
                                />
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

export default ResultBlock;

// "use client";

// import type React from "react";
// import { useState } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { Loader2 } from "lucide-react";

// interface ResultBlockProps {
//   content?: string;
//   type: "image" | "code";
//   imageResultType?: "create-agent" | "image-gen" | null | string;
//   language?: string;
//   processing?: boolean;
//   onMintNFT?: (content: string) => void;
//   onDownloadProof?: () => void;
//   /**
//    *  We'll reuse onLaunchMemeCoin as a generic "onCreateAgent" callback
//    *  and pass it the agent type, e.g. "micro" | "super" | "secret"
//    */
//   onLaunchMemeCoin?: (agentType?: string) => void;
//   loading?: boolean;
// }

// /**
//  * ResultBlock Component
//  */
// const ResultBlock: React.FC<ResultBlockProps> = ({
//   content,
//   type,
//   imageResultType,
//   language,
//   onMintNFT,
//   onDownloadProof,
//   onLaunchMemeCoin,
//   loading,
//   processing = false,
// }) => {
//   const [isCopied, setIsCopied] = useState(false);
//   const router = useRouter();

//   const copyToClipboard = () => {
//     if (!content) {
//       console.warn("No content to copy.");
//       return;
//     }
//     const codeWithoutLanguage = content.split("\n").slice(1).join("\n");
//     navigator.clipboard.writeText(codeWithoutLanguage).then(() => {
//       setIsCopied(true);
//       setTimeout(() => setIsCopied(false), 2000);
//     });
//   };

//   // Helper to pass the agent type up
//   const handleCreateAgent = (agentType: string) => {
//     if (onLaunchMemeCoin) {
//       onLaunchMemeCoin(agentType);
//     }
//   };

//   return (
//     <div className="bg-gray-800 rounded-lg p-4 my-2 max-w-lg w-full">
//       {type === "image" ? (
//         imageResultType === "create-agent" ? (
//           // ------------------ CREATE-AGENT MODE ------------------
//           <div>
//             {/* We intentionally omit the "Download Proof" button here */}
//             <div className="flex flex-col md:flex-row md:space-x-4 space-y-6 md:space-y-0 mt-8">
//               {/* MICRO AGENT CARD */}
//               <div className="bg-gray-700 rounded-lg p-6 w-full md:w-1/3 flex flex-col justify-between">
//                 <div>
//                   {/* Same base64 image for all three */}
//                   <div className="relative w-full h-52 mb-4 overflow-hidden rounded-md">
//                     {processing ? (
//                       <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
//                         <span className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></span>
//                       </div>
//                     ) : (
//                       <img
//                         src={content ? `data:image/jpeg;base64,${content}` : ""}
//                         alt="Generated Agent"
//                         className="object-contain w-full h-full"
//                       />
//                     )}
//                   </div>

//                   <h2 className="text-white text-xl font-bold mb-2">MICRO AGENT</h2>
//                   <p className="text-gray-400 text-sm mb-4">
//                     Lorem ipsum dolor sit amet consectetur. Gravida metus sed in vitae et at. 
//                     Massa sed ipsum risus id interdum ut.
//                   </p>
//                   <ul className="space-y-2 text-sm">
//                     <li className="flex items-center text-green-400">
//                       <span className="mr-2">✔</span> Lorem ipsum
//                     </li>
//                     <li className="flex items-center text-green-400">
//                       <span className="mr-2">✔</span> Lorem ipsum dolor
//                     </li>
//                     <li className="flex items-center text-green-400">
//                       <span className="mr-2">✔</span> Lorem ipsum dolor
//                     </li>
//                     <li className="flex items-center text-gray-500 line-through">
//                       <span className="mr-2">✘</span> Lorem ipsum
//                     </li>
//                     <li className="flex items-center text-gray-500 line-through">
//                       <span className="mr-2">✘</span> Gravida metus sed in vitae
//                     </li>
//                     <li className="flex items-center text-gray-500 line-through">
//                       <span className="mr-2">✘</span> Lorem ipsum sed risus
//                     </li>
//                   </ul>
//                 </div>
//                 <button
//                   onClick={() => handleCreateAgent("micro")}
//                   disabled={processing}
//                   className="mt-6 w-full py-2 bg-white text-gray-900 font-semibold rounded-md
//                              hover:bg-gray-200 transition-colors disabled:opacity-50"
//                 >
//                   Create Micro Agent
//                 </button>
//               </div>

//               {/* SUPER AGENT CARD */}
//               <div className="bg-gray-700 rounded-lg p-6 w-full md:w-1/3 flex flex-col justify-between">
//                 <div>
//                   <div className="relative w-full h-52 mb-4 overflow-hidden rounded-md">
//                     {processing ? (
//                       <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
//                         <span className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></span>
//                       </div>
//                     ) : (
//                       <img
//                         src={content ? `data:image/jpeg;base64,${content}` : ""}
//                         alt="Generated Agent"
//                         className="object-contain w-full h-full"
//                       />
//                     )}
//                   </div>
//                   <h2 className="text-white text-xl font-bold mb-2">SUPER AGENT</h2>
//                   <p className="text-gray-400 text-sm mb-4">
//                     Lorem ipsum dolor sit amet consectetur. Gravida metus sed in vitae et at. 
//                     Massa sed ipsum risus id interdum ut.
//                   </p>
//                   <ul className="space-y-2 text-sm">
//                     <li className="flex items-center text-green-400">
//                       <span className="mr-2">✔</span> Lorem ipsum
//                     </li>
//                     <li className="flex items-center text-green-400">
//                       <span className="mr-2">✔</span> Lorem ipsum dolor
//                     </li>
//                     <li className="flex items-center text-green-400">
//                       <span className="mr-2">✔</span> Lorem ipsum dolor
//                     </li>
//                     <li className="flex items-center text-green-400">
//                       <span className="mr-2">✔</span> Lorem ipsum dolor
//                     </li>
//                     <li className="flex items-center text-gray-500 line-through">
//                       <span className="mr-2">✘</span> Gravida metus sed in vitae
//                     </li>
//                     <li className="flex items-center text-gray-500 line-through">
//                       <span className="mr-2">✘</span> Lorem ipsum sed risus
//                     </li>
//                   </ul>
//                 </div>
//                 <button
//                   onClick={() => handleCreateAgent("super")}
//                   disabled={processing}
//                   className="mt-6 w-full py-2 bg-white text-gray-900 font-semibold rounded-md
//                              hover:bg-gray-200 transition-colors disabled:opacity-50"
//                 >
//                   Create Super Agent
//                 </button>
//               </div>

//               {/* SECRET AGENT CARD */}
//               <div className="bg-gray-700 rounded-lg p-6 w-full md:w-1/3 flex flex-col justify-between">
//                 <div>
//                   <div className="relative w-full h-52 mb-4 overflow-hidden rounded-md">
//                     {processing ? (
//                       <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
//                         <span className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></span>
//                       </div>
//                     ) : (
//                       <img
//                         src={content ? `data:image/jpeg;base64,${content}` : ""}
//                         alt="Generated Agent"
//                         className="object-contain w-full h-full"
//                       />
//                     )}
//                   </div>
//                   <h2 className="text-white text-xl font-bold mb-2">SECRET AGENT</h2>
//                   <p className="text-gray-400 text-sm mb-4">
//                     Lorem ipsum dolor sit amet consectetur. Gravida metus sed in vitae et at. 
//                     Massa sed ipsum risus id interdum ut.
//                   </p>
//                   <ul className="space-y-2 text-sm">
//                     <li className="flex items-center text-green-400">
//                       <span className="mr-2">✔</span> Lorem ipsum
//                     </li>
//                     <li className="flex items-center text-green-400">
//                       <span className="mr-2">✔</span> Lorem ipsum
//                     </li>
//                     <li className="flex items-center text-green-400">
//                       <span className="mr-2">✔</span> Lorem ipsum
//                     </li>
//                     <li className="flex items-center text-green-400">
//                       <span className="mr-2">✔</span> Lorem ipsum dolor
//                     </li>
//                     <li className="flex items-center text-green-400">
//                       <span className="mr-2">✔</span> Gravida metus sed in vitae
//                     </li>
//                     <li className="flex items-center text-gray-500 line-through">
//                       <span className="mr-2">✘</span> Lorem ipsum sed risus
//                     </li>
//                   </ul>
//                 </div>
//                 <button
//                   onClick={() => handleCreateAgent("secret")}
//                   disabled={processing}
//                   className="mt-6 w-full py-2 bg-white text-gray-900 font-semibold rounded-md
//                              hover:bg-gray-200 transition-colors disabled:opacity-50"
//                 >
//                   Create Secret Agent
//                 </button>
//               </div>
//             </div>
//           </div>
//         ) : (
//           // ------------------ NORMAL IMAGE MODE (image-gen or otherwise) ------------------
//           <div>
//             {/* Buttons Section */}
//             <div className="mt-2 flex space-x-4 justify-between mb-4">
//               {onDownloadProof && (
//                 <button
//                   onClick={onDownloadProof}
//                   className="flex items-center space-x-2 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
//                   disabled={processing}
//                 >
//                   <span className="text-[#A0AEC0] hover:text-[#00FF89] font-abeezee">
//                     Download Proof
//                   </span>
//                   <Image
//                     src="images/downloadProof.svg"
//                     alt="Download Proof"
//                     width={26}
//                     height={26}
//                   />
//                 </button>
//               )}
//               {imageResultType === "image-gen" && onMintNFT && (
//                 <button
//                   onClick={() => onMintNFT(`data:image/jpeg;base64,${content}`)}
//                   disabled={loading || processing}
//                   className="flex items-center space-x-2 rounded text-[#A0AEC0] hover:text-[#00FF89] disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <span className="font-abeezee">Mint NFT</span>
//                   <Image
//                     src="images/nft.svg"
//                     alt="Mint NFT"
//                     width={26}
//                     height={26}
//                   />
//                 </button>
//               )}
//             </div>
//             {/* Image Section */}
//             <div className="relative min-h-64 rounded-lg bg-gray-700 flex overflow-hidden">
//               {processing ? (
//                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-75">
//                   <p className="text-gray-400">
//                     Processing... This may take up to 5 minutes.
//                   </p>
//                   <span className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mt-4"></span>
//                 </div>
//               ) : loading ? (
//                 <div className="relative">
//                   <img
//                     src={`data:image/jpeg;base64,${content}`}
//                     alt="Generated content"
//                     className="w-full rounded-lg"
//                   />
//                   {loading && (
//                     <div
//                       className="absolute inset-0 bg-black/70 rounded-lg flex flex-col items-center justify-center"
//                       role="status"
//                       aria-label="Minting NFT"
//                     >
//                       <Loader2 className="w-12 h-12 text-white animate-spin mb-2" />
//                       <span className="text-white text-lg font-semibold">
//                         Minting NFT...
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <img
//                   src={content ? `data:image/jpeg;base64,${content}` : ""}
//                   alt="Generated content"
//                   className="w-full h-full object-cover"
//                 />
//               )}
//             </div>
//           </div>
//         )
//       ) : (
//         // ------------------ CODE MODE ------------------
//         <div className="">
//           <div className="flex space-x-2 justify-between mb-1">
//             <div>
//               {onDownloadProof && (
//                 <button
//                   onClick={onDownloadProof}
//                   className="flex items-center space-x-2 text-white rounded"
//                 >
//                   <span className="text-[#A0AEC0]">Download Proof</span>
//                   <Image
//                     src="images/downloadProof.svg"
//                     alt="Download Proof"
//                     width={30}
//                     height={30}
//                   />
//                 </button>
//               )}
//             </div>
//             <div>
//               <button
//                 onClick={copyToClipboard}
//                 className="flex items-center space-x-2 text-[#A0AEC0] rounded"
//               >
//                 {isCopied ? "Copied!" : "Copy Code"}
//                 <Image
//                   src="images/Copy.svg"
//                   alt="Copy Code"
//                   width={30}
//                   height={30}
//                 />
//               </button>
//             </div>
//           </div>
//           {language && (
//             <div className="text-sm text-gray-400 mb-1">{language}</div>
//           )}
//           <pre className="bg-gray-900 p-4 rounded-lg max-w-3xl whitespace-pre-wrap">
//             <code>{content}</code>
//           </pre>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ResultBlock;
