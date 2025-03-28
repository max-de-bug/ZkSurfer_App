// 'use client';
// import React from 'react';
// import Image from 'next/image';

// interface DownloadButtonProps {
//   message: {
//     content: string | any;
//   };
// }

// const DownloadButton: React.FC<DownloadButtonProps> = ({ message }) => {
//   const downloadFile = () => {
//     if (typeof message.content !== 'string') {
//       console.error('Unexpected content format');
//       return;
//     }

//     try {
//       // Detect mobile devices
//       const isMobile = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

//       if (message.content.startsWith('data:image/')) {
//         downloadImage(message.content, isMobile);
//       } else {
//         downloadTextContent(message.content, isMobile);
//       }
//     } catch (error) {
//       console.error('Download failed:', error);
//     }
//   };

//   const downloadImage = (dataUrl: string, isMobile: boolean) => {
//     if (isMobile) {
//       // Mobile: open in new tab and instruct the user to long-press the image to save it.
//       window.open(dataUrl, '_blank');
//       alert('Tap and hold the image to save it to your device.');
//     } else {
//       // Desktop: attempt direct download
//       const link = document.createElement('a');
//       link.href = dataUrl;
//       link.download = 'downloaded-image.png';

//       if ('download' in link) {
//         link.click();
//       } else {
//         window.open(dataUrl, '_blank');
//       }
//     }
//   };

//   const downloadTextContent = (content: string, isMobile: boolean) => {
//     const blob = new Blob([content], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);

//     if (isMobile) {
//       // Mobile: open in new tab and instruct the user on saving the file.
//       window.open(url, '_blank');
//       alert("Tap the share icon and then select 'Save to Files' (or a similar option) to save the file.");
//     } else {
//       // Desktop: simulate a download
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = 'downloaded-content.txt';

//       if ('download' in link) {
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//       } else {
//         window.open(url, '_blank');
//       }
//     }
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <button className="text-white rounded-lg" onClick={downloadFile}>
//       <Image
//         src="images/Download.svg"
//         alt="Download"
//         width={20}
//         height={20}
//       />
//     </button>
//   );
// };

// export default DownloadButton;


'use client';
import React from 'react';
import Image from 'next/image';

interface DownloadButtonProps {
    message: {
        content: string | any;
    };
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ message }) => {
    const downloadFile = async () => {
        if (typeof message.content !== 'string') {
            console.error('Unexpected content format');
            return;
        }

        try {
            // Detect mobile devices
            const isMobile = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (message.content.startsWith('data:image/')) {
                await downloadImage(message.content, isMobile);
            } else {
                await downloadTextContent(message.content, isMobile);
            }
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const downloadImage = async (dataUrl: string, isMobile: boolean) => {
        // Use Web Share API on mobile if available
        if (isMobile && navigator.share) {
            try {
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const file = new File([blob], 'downloaded-image.png', { type: blob.type });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Download Image',
                        text: 'Share to save the image',
                    });
                    return;
                }
            } catch (error) {
                console.error('Web Share API error:', error);
            }
        }
        // Fallback: open in new tab and instruct the user to long-press the image.
        window.open(dataUrl, '_blank');
        alert('Tap and hold the image to save it to your device.');
    };

    const downloadTextContent = async (content: string, isMobile: boolean) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        // Use Web Share API on mobile if available
        if (isMobile && navigator.share) {
            try {
                const file = new File([blob], 'downloaded-content.txt', { type: blob.type });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Download Text File',
                        text: 'Share to save the file',
                    });
                    return;
                }
            } catch (error) {
                console.error('Web Share API error:', error);
            }
        }
        // Fallback: open in new tab and instruct the user how to save the file.
        window.open(url, '_blank');
        alert("Tap the share icon and then select 'Save to Files' (or a similar option) to save the file.");
        URL.revokeObjectURL(url);
    };

    return (
        <button className="text-white rounded-lg" onClick={downloadFile}>
            <Image src="images/Download.svg" alt="Download" width={20} height={20} />
        </button>
    );
};

export default DownloadButton;
