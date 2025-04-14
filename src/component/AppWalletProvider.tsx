// "use client";

// import React, { useMemo } from "react";
// import {
//   ConnectionProvider,
//   WalletProvider,
// } from "@solana/wallet-adapter-react";
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
// import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
// import { clusterApiUrl } from "@solana/web3.js";
// import { PhantomWalletAdapter, SolflareWalletAdapter, CoinbaseWalletAdapter } from "@solana/wallet-adapter-wallets";
// import { CustomWalletModalProvider } from "./ui/CustomWalletModalProvider";

// require("@solana/wallet-adapter-react-ui/styles.css");

// export default function AppWalletProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const network = WalletAdapterNetwork.Devnet;
//   const endpoint = useMemo(() => clusterApiUrl(network), [network]);
//   const wallets = useMemo(
//     () => [
//       new PhantomWalletAdapter(),
//       // new SolflareWalletAdapter(),
//       // new CoinbaseWalletAdapter()
//     ],
//     [network],
//   );

//   return (
//     <ConnectionProvider endpoint={endpoint}>
//       <WalletProvider wallets={wallets} autoConnect>
//         <CustomWalletModalProvider>{children}</CustomWalletModalProvider>
//       </WalletProvider>
//     </ConnectionProvider>
//   );
// }

"use client";

import React, { useMemo, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { CustomWalletModalProvider } from "./ui/CustomWalletModalProvider";
import { MagicWalletAdapter, MagicWalletName } from "./MagicWalletAdapter";

require("@solana/wallet-adapter-react-ui/styles.css");

// Make MagicWalletName globally available for debugging
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.MagicWalletName = MagicWalletName;
}

export default function AppWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Initialize the Magic adapter separately for better debugging
  const magicAdapter = useMemo(() => {
    const apiKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || '';
    console.log("Initializing Magic adapter with API key:", apiKey ? "[PRESENT]" : "[MISSING]");

    try {
      const adapter = new MagicWalletAdapter(apiKey, endpoint);
      console.log("Magic adapter initialized with name:", adapter.name);
      return adapter;
    } catch (error) {
      console.error("Failed to initialize Magic adapter:", error);
      return null;
    }
  }, [endpoint]);

  // Create the wallet list with the Magic adapter - create a generic wallet array
  const wallets = useMemo(() => {
    // Use a more generic type for the array to allow different wallet types
    const adapters: any[] = [new PhantomWalletAdapter()];

    if (magicAdapter) {
      // Now we can push without type errors
      adapters.push(magicAdapter);
      console.log("Added Magic adapter to wallet list");
    }

    console.log("Final wallet list:", adapters.map(a => a.name));
    return adapters;
  }, [magicAdapter]);

  // Log wallets after component mount
  useEffect(() => {
    console.log("AppWalletProvider mounted with wallets:",
      wallets.map(w => ({
        name: w.name,
        readyState: w.readyState,
        icon: w.icon ? "present" : "missing"
      }))
    );
  }, [wallets]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <CustomWalletModalProvider>{children}</CustomWalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}