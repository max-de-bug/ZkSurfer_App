// import React from 'react';

// type Command = 'image-gen' | 'meme-coin' | 'content' | 'select' | 'post' | 'tokens' | 'tweet' | 'tweets' | 'generate-tweet' | 'generate-tweet-image' | 'generate-tweet-images' | 'save' | 'saves';

// interface CommandOption {
//     command: Command;
//     description: string;
//     additionalInfo?: string;
// }

// interface CommandPopupProps {
//     onSelect: (command: Command) => void;
//     className?: string;
// }

// const CommandPopup: React.FC<CommandPopupProps> = ({ onSelect }) => {
//     const commands: CommandOption[] = [
//         {
//             command: 'meme-coin',
//             description: 'Generate meme coin image and default data',
//             additionalInfo: 'Meme coin can be launch with the option provided along with generated image'
//         },
//         {
//             command: 'image-gen',
//             description: 'Image generation with or without ticker'
//         },
//         {
//             command: 'content',
//             description: 'Ticker based content generation'
//         },
//         {
//             command: 'select',
//             description: 'Select tickers'
//         },
//         {
//             command: 'post',
//             description: 'To post or schedule the tweet'
//         },
//         {
//             command: 'tokens',
//             description: 'To provide tweeter access token and its secret'
//         },
//         {
//             command: 'tweet',
//             description: 'To post and schedule the tweeter post',
//             additionalInfo: '(id)'
//         },
//         {
//             command: 'tweets',
//             description: 'To post and schedule the multiple tweeter post',
//             additionalInfo: '(id1, id2,...)'
//         },
//         {
//             command: 'generate-tweet',
//             description: 'Generates those many tweets',
//             additionalInfo: '(Number of tweets)'
//         },
//         {
//             command: 'generate-tweet-image',
//             description: 'Generates an image based on ticker for tweet'
//         },
//         {
//             command: 'generate-tweet-images',
//             description: 'Generates images based on ticker for tweet'
//         },
//         {
//             command: 'save',
//             description: 'Saves one generated tweet',
//             additionalInfo: '(id)'
//         },
//         {
//             command: 'saves',
//             description: 'Saves multiple generated tweets',
//             additionalInfo: '(id1, id2,...)'
//         }
//     ];

//     return (
//         <div className="absolute bottom-full left-0 bg-[#171D3D] rounded-lg shadow-lg w-96 max-h-96 overflow-y-auto">
//             <div className="sticky top-0 bg-[#171D3D] p-2 border-b border-gray-700">
//                 <div className="relative">
//                     <input
//                         type="text"
//                         placeholder="Search commands..."
//                         className="w-full bg-[#24284E] text-white rounded-md px-3 py-2 pl-8"
//                     />
//                     <svg
//                         className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                     >
//                         <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                         />
//                     </svg>
//                 </div>
//             </div>
//             <div className="divide-y divide-gray-700">
//                 {commands.map((cmd) => (
//                     <button
//                         key={cmd.command}
//                         onClick={() => onSelect(cmd.command)}
//                         className="block w-full text-left px-4 py-3 hover:bg-[#24284E] transition-colors"
//                     >
//                         <div className="flex items-start">
//                             <div className="flex-1">
//                                 <p className="text-purple-400 font-mono">
//                                     /{cmd.command}
//                                     {cmd.additionalInfo && (
//                                         <span className="text-gray-400 text-sm">{cmd.additionalInfo}</span>
//                                     )}
//                                 </p>
//                                 <p className="text-sm text-gray-400 mt-1">{cmd.description}</p>
//                             </div>
//                         </div>
//                     </button>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default CommandPopup;

import React from 'react';

type Command = 'image-gen' | 'meme-coin' | 'content' | 'select' | 'post' | 'tokens' | 'tweet' | 'tweets' | 'generate-tweet' | 'generate-tweet-image' | 'generate-tweet-images' | 'save' | 'saves';

interface CommandOption {
    command: Command;
    description: string;
    additionalInfo?: string;
}

interface CommandPopupProps {
    onSelect: (command: Command) => void;
    className?: string;
}

const CommandPopup: React.FC<CommandPopupProps> = ({ onSelect }) => {
    const commands: CommandOption[] = [
        {
            command: 'meme-coin',
            description: 'Generate meme coin image and default data',
            //additionalInfo: 'Meme coin can be launch with the option provided along with generated image'
        },
        {
            command: 'image-gen',
            description: 'Image generation with or without ticker'
        },
        {
            command: 'content',
            description: 'Ticker based content generation'
        },
        {
            command: 'select',
            description: 'Select tickers'
        },
        {
            command: 'post',
            description: 'To post or schedule the tweet'
        },
        {
            command: 'tokens',
            description: 'To provide tweeter access token and its secret'
        },
        {
            command: 'tweet',
            description: 'To post and schedule the tweeter post',
            additionalInfo: '(id)'
        },
        {
            command: 'tweets',
            description: 'To post and schedule the multiple tweeter post',
            additionalInfo: '(id1, id2,...)'
        },
        {
            command: 'generate-tweet',
            description: 'Generates those many tweets',
            additionalInfo: '(Number of tweets)'
        },
        {
            command: 'generate-tweet-image',
            description: 'Generates an image based on ticker for tweet'
        },
        {
            command: 'generate-tweet-images',
            description: 'Generates images based on ticker for tweet'
        },
        {
            command: 'save',
            description: 'Saves one generated tweet',
            additionalInfo: '(id)'
        },
        {
            command: 'saves',
            description: 'Saves multiple generated tweets',
            additionalInfo: '(id1, id2,...)'
        }
    ];

    // Split commands into pairs for 2-column layout
    const commandPairs = [];
    for (let i = 0; i < commands.length; i += 2) {
        commandPairs.push(commands.slice(i, i + 2));
    }

    return (
        <div className="absolute bottom-full left-0 bg-[#0A0F2C] rounded-lg shadow-lg w-[800px] max-h-[600px] overflow-y-auto">
            <div className="sticky top-0 bg-[#0A0F2C] p-3 border-b border-gray-800">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search commands..."
                        className="w-full bg-[#171D3D] text-white rounded-lg px-3 py-2 pl-10"
                    />
                    <svg
                        className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            <div className="p-3">
                {commandPairs.map((pair, index) => (
                    <div key={index} className="grid grid-cols-2 gap-3 mb-3">
                        {pair.map((cmd) => (
                            <button
                                key={cmd.command}
                                onClick={() => onSelect(cmd.command)}
                                className="block w-full text-left p-3 rounded-lg bg-[#171D3D] hover:bg-[#24284E] transition-colors"
                            >
                                <div className="flex flex-col">
                                    <p className="text-purple-400 font-mono">
                                        /{cmd.command}
                                        {cmd.additionalInfo && (
                                            <span className="text-blue-400 text-sm ml-1">
                                                {cmd.additionalInfo}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {cmd.description}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommandPopup;