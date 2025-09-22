'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        // Appearance settings for Solana
        appearance: {
          theme: 'dark',
          accentColor: '#676FFF',
          showWalletLoginFirst: false,
          walletChainType: 'solana-only' // Forces Solana-only mode
        },
        
        // Login methods
        loginMethods: ['email', 'wallet'],
        
        // External wallet support for Solana
        externalWallets: {
          solana: {
            connectors: toSolanaWalletConnectors() // Detects Phantom, Solflare, etc.
          }
        },
        
        // Embedded wallet creation - properly nested under 'solana'
        embeddedWallets: {
          solana: {
            createOnLogin: 'all-users' // Creates embedded Solana wallet for all users
          }
        }
        
        // NOTE: We're NOT using solana.rpcs for now to avoid the error
        // You can add it later once basic connection works
      }}
    >
      <SessionProvider>
        {children}
      </SessionProvider>
    </PrivyProvider>
  );
}