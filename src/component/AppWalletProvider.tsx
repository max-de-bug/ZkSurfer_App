"use client";

import React, { useMemo, useEffect, useState, useCallback } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
  Wallet
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { CustomWalletModalProvider } from "./ui/CustomWalletModalProvider";
import { MagicWalletAdapter, MagicWalletName } from "./MagicWalletAdapter";
import { PublicKey } from "@solana/web3.js";

require("@solana/wallet-adapter-react-ui/styles.css");

// Create a context to share the Magic adapter instance
export const MagicAdapterContext = React.createContext<MagicWalletAdapter | null>(null);

// Make MagicWalletName globally available 
if (typeof window !== 'undefined') {
  window.MagicWalletName = MagicWalletName;
}

// Helper component to handle wallet reconnection after mount
const WalletInitializer = () => {
  const { publicKey, wallet, select, wallets, connecting, connected } = useWallet();
  const [attempted, setAttempted] = useState(false);

  // Get Magic adapter from context
  const magicAdapter = React.useContext(MagicAdapterContext);

  // Log wallet state when it changes
  useEffect(() => {
    if (wallets && wallets.length > 0) {
      console.log("Available wallets:", wallets.map(w => (w as any)?.name || 'unnamed'));
    }

    if (publicKey) {
      console.log("Connected with public key:", publicKey.toString());
    }
  }, [wallets, publicKey]);

  useEffect(() => {
    if (attempted || connecting || connected || !wallets.length || !magicAdapter) return;

    const initializeWallet = async () => {
      const storedAddress = localStorage.getItem('connectedWalletAddress');
      const storedWalletName = localStorage.getItem('walletName');

      if (storedAddress && storedWalletName === MagicWalletName) {
        try {
          console.log("Found stored Magic wallet address, attempting to reconnect");

          // Find the Magic adapter in the wallet list (by name)
          const magicWalletInList = wallets.find(
            wallet => (wallet as any)?.name === MagicWalletName
          );

          if (magicWalletInList) {
            console.log("Found Magic adapter in wallet list, selecting it");
            select(MagicWalletName);
          } else if (magicAdapter) {
            // Direct initialization if the adapter isn't in the wallet list yet
            console.log("Magic adapter not in wallet list, initializing directly");

            try {
              // Use type assertion to access private properties for debugging
              const isLoggedIn = await (magicAdapter as any)._magic?.user.isLoggedIn();

              if (isLoggedIn) {
                console.log("User is logged in with Magic, setting public key");
                magicAdapter.setPublicKey(storedAddress);

                // Force select after a delay to ensure the adapter is ready
                setTimeout(() => {
                  select(MagicWalletName);
                }, 500);
              }
            } catch (err) {
              console.error("Error checking Magic login:", err);
            }
          }
        } catch (error) {
          console.error("Error reconnecting wallet:", error);
        }
      }

      setAttempted(true);
    };

    initializeWallet();
  }, [wallets, magicAdapter, select, attempted, connecting, connected]);

  return null;
};

export default function AppWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const [magicAdapter, setMagicAdapter] = useState<MagicWalletAdapter | null>(null);

  // Initialize the Magic adapter
  useEffect(() => {
    const initMagic = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || '';
        console.log("Initializing Magic adapter with API key:", apiKey ? "[PRESENT]" : "[MISSING]");

        const adapter = new MagicWalletAdapter(apiKey, endpoint);
        console.log("Magic adapter initialized with name:", adapter.name);

        // Store reference to adapter
        setMagicAdapter(adapter);

        // Try to auto-reconnect if needed
        const storedAddress = localStorage.getItem('connectedWalletAddress');
        const storedWalletName = localStorage.getItem('walletName');

        if (storedAddress && storedWalletName === MagicWalletName) {
          try {
            // Use type assertion to access private property safely
            const isLoggedIn = await (adapter as any)._magic?.user.isLoggedIn();
            if (isLoggedIn) {
              console.log("User already logged in with Magic, setting public key");
              adapter.setPublicKey(storedAddress);
            }
          } catch (err) {
            console.error("Error checking Magic login status:", err);
          }
        }
      } catch (error) {
        console.error("Failed to initialize Magic adapter:", error);
      }
    };

    initMagic();
  }, [endpoint]);

  // Create the wallet list with the Magic adapter
  const wallets = useMemo(() => {
    // Use a more generic type or Wallet interface from @solana/wallet-adapter-base
    const adapters: any[] = [new PhantomWalletAdapter()];

    if (magicAdapter) {
      adapters.push(magicAdapter);
      console.log("Added Magic adapter to wallet list:", magicAdapter.name);
    }

    return adapters;
  }, [magicAdapter]);

  // Enable autoConnect only after wallets are properly initialized
  const [shouldAutoConnect, setShouldAutoConnect] = useState(false);

  useEffect(() => {
    // Short delay to ensure wallets are registered properly
    const timer = setTimeout(() => {
      setShouldAutoConnect(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [wallets]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <MagicAdapterContext.Provider value={magicAdapter}>
        <WalletProvider wallets={wallets} autoConnect={shouldAutoConnect}>
          <WalletInitializer />
          <CustomWalletModalProvider>
            {children}
          </CustomWalletModalProvider>
        </WalletProvider>
      </MagicAdapterContext.Provider>
    </ConnectionProvider>
  );
}