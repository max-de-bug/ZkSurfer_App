'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useWhitelistStore } from '../../stores/use-whitelist-store';

interface PresaleBannerProps {
  walletAddress: string | null;
  walletConnected: boolean;
}

const PresaleBanner: React.FC<PresaleBannerProps> = ({ walletAddress, walletConnected }) => {
  // Countdown state (48 hours in seconds)
  const [timeLeft, setTimeLeft] = useState(48 * 60 * 60);

  // Get whitelist state and the checker from our Zustand store
  const { isWhitelisted, checkWhitelist } = useWhitelistStore();

  // Countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prevTime => (prevTime <= 1 ? 0 : prevTime - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper: Format seconds into HH:MM:SS
  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // As soon as the wallet is connected and we have an address, trigger the whitelist check
  useEffect(() => {
    if (walletConnected && walletAddress) {
      checkWhitelist(walletAddress);
    }
  }, [walletConnected, walletAddress, checkWhitelist]);

  // Optionally, you can show a toast if not whitelisted
  useEffect(() => {
    if (walletConnected && isWhitelisted === false) {
      toast.error('Your wallet is not whitelisted. You cannot participate in presale now.');
    }
  }, [walletConnected, isWhitelisted]);

  return (
    <div className="fixed top-0 left-0 w-full bg-green-500 text-white py-2 text-center z-50 text-xs md:text-md">
      <span>
        🚀 Exclusive Pre-Sale is LIVE! Ends in {formatTime(timeLeft)}
      </span>
      {isWhitelisted ? (
        <Link href="/pre-sale" className="ml-1 underline font-bold md:ml-4">
          Join Pre-Sale Now
        </Link>
      ) : (
        <span className="ml-4 text-red-200">
          {isWhitelisted === null ? 'Checking whitelist...' : 'Not whitelisted'}
        </span>
      )}
    </div>
  );
};

export default PresaleBanner;
