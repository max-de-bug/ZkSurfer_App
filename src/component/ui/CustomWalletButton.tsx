"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { toast } from "sonner";
import { WalletModal } from './WalletModal';

// Add TypeScript declarations for wallet browser properties
declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
      };
    };
  }
}

const LABELS = {
  "change-wallet": "Change wallet",
  connecting: "Connecting ...",
  "copy-address": "Copy address",
  copied: "Copied",
  disconnect: "Disconnect",
  "has-wallet": "Connect",
  "no-wallet": "Select Wallet",
};

export const CustomWalletButton = () => {
  const router = useRouter();
  const { setVisible } = useWalletModal();
  const { publicKey, wallet, connecting, disconnecting, wallets } = useWallet();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // IMPORTANT: Monitor localStorage for walletName and refresh immediately when it changes
  useEffect(() => {
    // Create variables to track original localStorage methods
    const originalSetItem = localStorage.setItem.bind(localStorage);
    const originalRemoveItem = localStorage.removeItem.bind(localStorage);

    // Override localStorage.setItem with proper TypeScript typing
    localStorage.setItem = function (key: string, value: string) {
      const oldValue = localStorage.getItem(key);

      // Call original function with proper arguments
      originalSetItem(key, value);

      // Only refresh if walletName is being set for the first time or being changed to a different value
      if (key === 'walletName' && oldValue !== value) {
        console.log('walletName was changed in localStorage, refreshing immediately!');
        window.location.href = window.location.href;
      }
    };

    // Override localStorage.removeItem with proper TypeScript typing
    localStorage.removeItem = function (key: string) {
      const hadValue = localStorage.getItem(key) !== null;

      // Call original function with proper arguments
      originalRemoveItem(key);

      // Only refresh if walletName actually existed and is being removed
      if (key === 'walletName' && hadValue) {
        console.log('walletName was removed from localStorage, refreshing immediately!');
        window.location.href = window.location.href;
      }
    };

    // Clean up on unmount
    return () => {
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
    };
  }, []);

  // Track first load and wallet state
  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
      console.log("First load completed");

      // If we have a public key on first load, set connectedWalletAddress only
      if (publicKey) {
        const originalSetItem = localStorage.setItem.bind(localStorage);
        originalSetItem('connectedWalletAddress', publicKey.toString());
        console.log("Set connectedWalletAddress on first load");
      }
    }
  }, [isFirstLoad, publicKey]);

  // Handle wallet disconnection
  useEffect(() => {
    if (disconnecting || (!publicKey && !connecting && !isFirstLoad)) {
      const hasWalletName = localStorage.getItem('walletName');
      if (hasWalletName) {
        console.log("Wallet disconnected, removing walletName");
        localStorage.removeItem('walletName');

        // Also remove connectedWalletAddress without triggering refresh
        const originalRemoveItem = localStorage.removeItem.bind(localStorage);
        originalRemoveItem('connectedWalletAddress');
      }
    }
  }, [publicKey, disconnecting, connecting, isFirstLoad]);

  const handleClick = () => {
    // Only show our custom modal
    setModalVisible(true);

    // Check if wallets are installed
    const hasPhantom = wallets.some(
      (w) =>
        w.adapter.name === 'Phantom' &&
        (w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable)
    );

    // If no wallets are detected, show the installation prompt
    if (!hasPhantom) {
      toast.error('No available Solana wallets found. Please install a wallet to continue.', {
        action: {
          label: 'Install Phantom',
          onClick: () => window.open('https://phantom.app/', '_blank'),
        },
      });
    }
  };

  return (
    <div className="flex items-center justify-center relative">
      {publicKey ? (
        <BaseWalletMultiButton
          labels={LABELS}
          className="transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
          style={{
            clipPath:
              "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
            backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
            backgroundSize: "200% 200%",
            animation: "spinGradient 3s linear infinite",
          }}
        />
      ) : (
        <div
          className="transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
          style={{
            clipPath:
              "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
            backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
            backgroundSize: "200% 200%",
            animation: "spinGradient 3s linear infinite",
          }}
          onClick={handleClick}
        >
          <div
            className="transition-all ease-out relative duration-500 active:bg-opacity-80 block w-full overflow-hidden custom-gradient hover:bg-gradient-to-r hover:from-zkPurple hover:to-zkIndigo60 active:from-zkPurple60 hover:p-[1px]"
            style={{
              clipPath:
                "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
            }}
          >
            <div className="transition-all ease-out duration-500 px-10 lg:px-12 py-4 text-center bg-clip-text text-transparent hover:text-white bg-gradient-to-l from-zkIndigo to-zkPurple font-bold tracking-wider">
              Connect Wallet
            </div>
          </div>
        </div>
      )}
      <WalletModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};