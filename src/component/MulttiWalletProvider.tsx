//"use client";
// import React from 'react';
// import { WagmiProvider } from 'wagmi';
// import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
// import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
// import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
// import { clusterApiUrl } from '@solana/web3.js';
// import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink';
// import { arbitrum, avalanche, base, berachain, bsc, mainnet, optimism, polygon } from 'viem/chains';

// // Wagmi Configuration for Ethereum Wallets
// const config = getDefaultConfig({
//   appName: 'ZkAGI',
//   projectId: '003076b15a7ec01e7a1929b1468c23ec',
//   chains: [
//     // Add your desired chains here, e.g.:
//     // mainnet, sepolia, etc.
//     mainnet, base, arbitrum, optimism, polygon, berachain, avalanche, bsc
//   ],
//   ssr: true,
// });

// // Create a query client
// const queryClient = new QueryClient();

// // Multi-Wallet Provider Component
// const MultiWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   // Solana Network Configuration
//   const network = WalletAdapterNetwork.Mainnet;
//   const endpoint = clusterApiUrl(network);

//   // Solana Wallet Adapters
//   const solanaWallets = [
//     new PhantomWalletAdapter(),
//     // Add more Solana wallets as needed
//   ];

//   // Tron Wallet Adapters
//   const tronWallets = [
//     new TronLinkAdapter(),
//     // Add more Tron wallets if needed
//   ];

//   return (
//     <WagmiProvider config={config}>
//       <QueryClientProvider client={queryClient}>
//         <RainbowKitProvider>
//           <ConnectionProvider endpoint={endpoint}>
//             <SolanaWalletProvider
//               wallets={solanaWallets}
//               autoConnect
//             >
//               {/* You can add Tron wallet context here if needed */}
//               {children}
//             </SolanaWalletProvider>
//           </ConnectionProvider>
//         </RainbowKitProvider>
//       </QueryClientProvider>
//     </WagmiProvider>
//   );
// };

// export default MultiWalletProvider;

"use client";
import React from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ConnectionProvider as SolanaConnectionProvider,
  WalletProvider as SolanaWalletProvider
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink';
import {
  arbitrum,
  avalanche,
  base,
  berachain,
  bsc,
  mainnet,
  optimism,
  polygon
} from 'viem/chains';

// Wagmi Configuration for Ethereum Wallets
const config = getDefaultConfig({
  appName: 'ZkAGI',
  projectId: '003076b15a7ec01e7a1929b1468c23ec',
  chains: [
    mainnet,
    base,
    arbitrum,
    optimism,
    polygon,
    berachain,
    avalanche,
    bsc
  ],
  ssr: true,
});

// Create a query client
const queryClient = new QueryClient();

// Multi-Wallet Provider Component
const MultiWalletProvider = ({ children }: { children: React.ReactNode }) => {
  // Solana Network Configuration
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = clusterApiUrl(network);

  // Solana Wallet Adapters
  const solanaWallets = React.useMemo(() => [
    new PhantomWalletAdapter(),
    // Add more Solana wallets as needed
  ], []);

  // Tron Wallet Adapters
  const tronWallets = React.useMemo(() => [
    new TronLinkAdapter(),
    // Add more Tron wallets if needed
  ], []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <SolanaConnectionProvider endpoint={endpoint}>
            <SolanaWalletProvider
              wallets={solanaWallets}
              autoConnect
            >
              {children}
            </SolanaWalletProvider>
          </SolanaConnectionProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default MultiWalletProvider;