import React, { useState } from 'react';

interface CodeBlockProps {
    code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="relative bg-gray-800 rounded-lg p-4 mt-2">
            <pre className="text-white overflow-x-auto">
                <code>{code}</code>
            </pre>
            <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm"
            >
                {isCopied ? 'Copied!' : 'Copy'}
            </button>
        </div>
    );
};

export default CodeBlock;
