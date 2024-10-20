// "use client";

// import React, { useMemo } from "react";
// import {
//   ConnectionProvider,
//   WalletProvider,
// } from "@solana/wallet-adapter-react";
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
// import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
// import { clusterApiUrl } from "@solana/web3.js";
//  import { PhantomWalletAdapter,SolflareWalletAdapter, CoinbaseWalletAdapter } from "@solana/wallet-adapter-wallets";
// import { CustomWalletModalProvider } from "./ui/CustomWalletModalProvider";

// require("@solana/wallet-adapter-react-ui/styles.css");

// export default function AppWalletProvider({
//     children,
//   }: {
//     children: React.ReactNode;
//   }) {
//     const network = WalletAdapterNetwork.Devnet;
//     const endpoint = useMemo(() => clusterApiUrl(network), [network]);
//     const wallets = useMemo(
//       () => [
//         new PhantomWalletAdapter(),
//         new SolflareWalletAdapter(),
//         new CoinbaseWalletAdapter()
//       ],
//       [network],
//     );

//     return (
//       <ConnectionProvider endpoint={endpoint}>
//         <WalletProvider wallets={wallets} autoConnect>
//           <CustomWalletModalProvider>{children}</CustomWalletModalProvider>
//         </WalletProvider>
//       </ConnectionProvider>
//     );
//   }

'use client';

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";
import { EthereumWalletProvider } from "./EthereumWalletProvider";

export default function AppWalletProvider({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <EthereumWalletProvider>
            {children}
          </EthereumWalletProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}