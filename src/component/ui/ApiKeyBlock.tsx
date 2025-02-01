import React from 'react';
import Image from "next/image"

interface ApiKeyBlockProps {
    apiKey: string;
}

const ApiKeyBlock: React.FC<ApiKeyBlockProps> = ({ apiKey }) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(apiKey).then(() => alert('Copied!'));
    };

    return (
        <div
            className="w-full bg-gray-700"
            style={{
                padding: '10px',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '10px'
            }}>
            <span style={{ fontWeight: 'bold' }}>API Key:</span>
            <span className="bg-gray-900 p-1 rounded" style={{ marginLeft: '10px', fontFamily: 'monospace' }}>{apiKey}</span>
            <button
                onClick={copyToClipboard}
                className="flex items-center justify-end space-x-2 text-[#A0AEC0] rounded ml-2"
            >
                <Image
                    src="images/Copy.svg"
                    alt="Copy Code"
                    width={20}
                    height={20}
                />
            </button>
        </div>
    );
};

export default ApiKeyBlock;
