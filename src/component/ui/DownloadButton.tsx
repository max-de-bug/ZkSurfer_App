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
      // Detect mobile devices
      const isMobile = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (message.content.startsWith('data:image/')) {
        downloadImage(message.content, isMobile);
      } else {
        downloadTextContent(message.content, isMobile);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const downloadImage = (dataUrl: string, isMobile: boolean) => {
    if (isMobile) {
      // Mobile: open in new tab and instruct the user to long-press the image to save it.
      window.open(dataUrl, '_blank');
      alert('Tap and hold the image to save it to your device.');
    } else {
      // Desktop: attempt direct download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'downloaded-image.png';

      if ('download' in link) {
        link.click();
      } else {
        window.open(dataUrl, '_blank');
      }
    }
  };

  const downloadTextContent = (content: string, isMobile: boolean) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    if (isMobile) {
      // Mobile: open in new tab and instruct the user on saving the file.
      window.open(url, '_blank');
      alert("Tap the share icon and then select 'Save to Files' (or a similar option) to save the file.");
    } else {
      // Desktop: simulate a download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'downloaded-content.txt';

      if ('download' in link) {
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(url, '_blank');
      }
    }
    URL.revokeObjectURL(url);
  };

  return (
    <button className="text-white rounded-lg" onClick={downloadFile}>
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
