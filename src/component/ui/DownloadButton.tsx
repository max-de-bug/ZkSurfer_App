'use client';
import React from 'react';
import Image from 'next/image';

interface DownloadButtonProps {
    message: {
        content: string | any;
    };
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ message }) => {
    const downloadFile = () => {
        if (typeof message.content !== 'string') {
            console.error('Unexpected content format');
            return;
        }

        try {
            // Detect mobile devices more comprehensively
            const isMobile = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (message.content.startsWith('data:image/')) {
                // Image download logic
                downloadImage(message.content);
            } else {
                // Text content download logic
                downloadTextContent(message.content);
            }
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const downloadImage = (dataUrl: string) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'downloaded-image.png';

        // Fallback for mobile browsers with limited download support
        if ('download' in link) {
            link.click();
        } else {
            // Alternative approach for problematic mobile browsers
            window.open(dataUrl, '_blank');
        }
    };

    const downloadTextContent = (content: string) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'downloaded-content.txt';

        // Attempt multiple download strategies
        if ('download' in link) {
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // Fallback for browsers with limited download support
            window.open(url, '_blank');
        }

        URL.revokeObjectURL(url);
    };

    return (
        <button
            className="text-white rounded-lg"
            onClick={downloadFile}
        >
            <Image
                src="images/Download.svg"
                alt="Download"
                width={20}
                height={20}
            />
        </button>
    );
};

export default DownloadButton;