// "use client";

// import React, { useMemo, useEffect, useState, useCallback } from "react";
// import {
//   ConnectionProvider,
//   WalletProvider,
//   useWallet,
//   Wallet
// } from "@solana/wallet-adapter-react";
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
// import { clusterApiUrl } from "@solana/web3.js";
// import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
// import { CustomWalletModalProvider } from "./ui/CustomWalletModalProvider";
// import { MagicWalletAdapter, MagicWalletName } from "./MagicWalletAdapter";
// import { PublicKey } from "@solana/web3.js";

// require("@solana/wallet-adapter-react-ui/styles.css");

// // Create a context to share the Magic adapter instance
// export const MagicAdapterContext = React.createContext<MagicWalletAdapter | null>(null);

// // Make MagicWalletName globally available 
// if (typeof window !== 'undefined') {
//   window.MagicWalletName = MagicWalletName;
// }

// // Helper component to handle wallet reconnection after mount
// const WalletInitializer = () => {
//   const { publicKey, wallet, select, wallets, connecting, connected } = useWallet();
//   const [attempted, setAttempted] = useState(false);

//   // Get Magic adapter from context
//   const magicAdapter = React.useContext(MagicAdapterContext);

//   // Log wallet state when it changes
//   useEffect(() => {
//     if (wallets && wallets.length > 0) {
//       console.log("Available wallets:", wallets.map(w => (w as any)?.name || 'unnamed'));
//     }

//     if (publicKey) {
//       console.log("Connected with public key:", publicKey.toString());
//     }
//   }, [wallets, publicKey]);

//   useEffect(() => {
//     if (attempted || connecting || connected || !wallets.length || !magicAdapter) return;

//     const initializeWallet = async () => {
//       const storedAddress = localStorage.getItem('connectedWalletAddress');
//       const storedWalletName = localStorage.getItem('walletName');

//       if (storedAddress && storedWalletName === MagicWalletName) {
//         try {
//           console.log("Found stored Magic wallet address, attempting to reconnect");

//           // Find the Magic adapter in the wallet list (by name)
//           const magicWalletInList = wallets.find(
//             wallet => (wallet as any)?.name === MagicWalletName
//           );

//           if (magicWalletInList) {
//             console.log("Found Magic adapter in wallet list, selecting it");
//             select(MagicWalletName);
//           } else if (magicAdapter) {
//             // Direct initialization if the adapter isn't in the wallet list yet
//             console.log("Magic adapter not in wallet list, initializing directly");

//             try {
//               // Use type assertion to access private properties for debugging
//               const isLoggedIn = await (magicAdapter as any)._magic?.user.isLoggedIn();

//               if (isLoggedIn) {
//                 console.log("User is logged in with Magic, setting public key");
//                 magicAdapter.setPublicKey(storedAddress);

//                 // Force select after a delay to ensure the adapter is ready
//                 setTimeout(() => {
//                   select(MagicWalletName);
//                 }, 500);
//               }
//             } catch (err) {
//               console.error("Error checking Magic login:", err);
//             }
//           }
//         } catch (error) {
//           console.error("Error reconnecting wallet:", error);
//         }
//       }

//       setAttempted(true);
//     };

//     initializeWallet();
//   }, [wallets, magicAdapter, select, attempted, connecting, connected]);

//   return null;
// };

// export default function AppWalletProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const network = WalletAdapterNetwork.Devnet;
//   const endpoint = useMemo(() => clusterApiUrl(network), [network]);
//   const [magicAdapter, setMagicAdapter] = useState<MagicWalletAdapter | null>(null);

//   // Initialize the Magic adapter
//   useEffect(() => {
//     const initMagic = async () => {
//       try {
//         const apiKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || '';
//         console.log("Initializing Magic adapter with API key:", apiKey ? "[PRESENT]" : "[MISSING]");

//         const adapter = new MagicWalletAdapter(apiKey, endpoint);
//         console.log("Magic adapter initialized with name:", adapter.name);

//         // Store reference to adapter
//         setMagicAdapter(adapter);

//         // Try to auto-reconnect if needed
//         const storedAddress = localStorage.getItem('connectedWalletAddress');
//         const storedWalletName = localStorage.getItem('walletName');

//         if (storedAddress && storedWalletName === MagicWalletName) {
//           try {
//             // Use type assertion to access private property safely
//             const isLoggedIn = await (adapter as any)._magic?.user.isLoggedIn();
//             if (isLoggedIn) {
//               console.log("User already logged in with Magic, setting public key");
//               adapter.setPublicKey(storedAddress);
//             }
//           } catch (err) {
//             console.error("Error checking Magic login status:", err);
//           }
//         }
//       } catch (error) {
//         console.error("Failed to initialize Magic adapter:", error);
//       }
//     };

//     initMagic();
//   }, [endpoint]);

//   // Create the wallet list with the Magic adapter
//   const wallets = useMemo(() => {
//     // Use a more generic type or Wallet interface from @solana/wallet-adapter-base
//     const adapters: any[] = [new PhantomWalletAdapter()];

//     if (magicAdapter) {
//       adapters.push(magicAdapter);
//       console.log("Added Magic adapter to wallet list:", magicAdapter.name);
//     }

//     return adapters;
//   }, [magicAdapter]);

//   // Enable autoConnect only after wallets are properly initialized
//   const [shouldAutoConnect, setShouldAutoConnect] = useState(false);

//   useEffect(() => {
//     // Short delay to ensure wallets are registered properly
//     const timer = setTimeout(() => {
//       setShouldAutoConnect(true);
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [wallets]);

//   return (
//     <ConnectionProvider endpoint={endpoint}>
//       <MagicAdapterContext.Provider value={magicAdapter}>
//         <WalletProvider wallets={wallets} autoConnect={shouldAutoConnect}>
//           <WalletInitializer />
//           <CustomWalletModalProvider>
//             {children}
//           </CustomWalletModalProvider>
//         </WalletProvider>
//       </MagicAdapterContext.Provider>
//     </ConnectionProvider>
//   );
// }

// "use client";

// import React, { useMemo, useEffect, useState, useCallback } from "react";
// import {
//   ConnectionProvider,
//   WalletProvider,
//   useWallet,
//   Wallet
// } from "@solana/wallet-adapter-react";
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
// import { clusterApiUrl } from "@solana/web3.js";
// import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
// import { CustomWalletModalProvider } from "./ui/CustomWalletModalProvider";
// import { MagicWalletAdapter, MagicWalletName } from "./MagicWalletAdapter";
// import { PublicKey } from "@solana/web3.js";
// import { CivicAuthProvider } from "@civic/auth-web3/react";

// require("@solana/wallet-adapter-react-ui/styles.css");

// // Create a context to share the Magic adapter instance
// export const MagicAdapterContext = React.createContext<MagicWalletAdapter | null>(null);

// // Make MagicWalletName globally available 
// if (typeof window !== 'undefined') {
//   window.MagicWalletName = MagicWalletName;
// }

// // Helper component to handle wallet reconnection after mount
// const WalletInitializer = () => {
//   const { publicKey, wallet, select, wallets, connecting, connected } = useWallet();
//   const [retryCount, setRetryCount] = useState(0);
//   const [initialized, setInitialized] = useState(false);
//   const magicAdapter = React.useContext(MagicAdapterContext);

//   const CIVIC_WALLET_NAME = "Civic";
// const isCivicName = (name?: string) => !!name && /civic/i.test(name);

//   // Log wallet state when it changes
//   useEffect(() => {
//     console.log("WalletInitializer - Wallet state:", {
//       publicKey: publicKey?.toString(),
//       connected,
//       connecting,
//       walletCount: wallets.length,
//       walletNames: wallets.map(w => (w as any)?.name || 'unnamed'),
//       retryCount
//     });
//   }, [wallets, publicKey, connected, connecting, retryCount]);

//   // Use an interval to persistently check connection
//   useEffect(() => {
//     if (publicKey) {
//       console.log("Already connected with public key:", publicKey.toString());
//       setInitialized(true);
//       return; // Already connected, no need to do anything
//     }

//     const storedAddress = localStorage.getItem('connectedWalletAddress');
//     const storedWalletName = localStorage.getItem('walletName');

//     // Only proceed if we have stored credentials
//     if (!storedAddress || storedWalletName !== MagicWalletName) {
//       setInitialized(true);
//       return;
//     }

//     // If not connected yet but should be, set up an interval to keep trying
//     console.log("Setting up persistent reconnection check for Magic wallet");

//     const reconnectionInterval = setInterval(() => {
//       // Stop after too many retries
//       if (retryCount > 15) {
//         console.log("Max retry count reached, stopping reconnection attempts");
//         clearInterval(reconnectionInterval);
//         return;
//       }

//       // If already connected, stop interval
//       if (publicKey) {
//         console.log("Connection established, stopping reconnection interval");
//         clearInterval(reconnectionInterval);
//         setInitialized(true);
//         return;
//       }

//       // Find Magic adapter in wallet list
//       const hasMagicWallet = wallets.some(w => (w as any)?.name === MagicWalletName);

//       if (hasMagicWallet) {
//         console.log(`Retry ${retryCount}: Selecting Magic wallet adapter`);
//         select(MagicWalletName);

//         // If we have the context adapter and it has a setPublicKey method, use it
//         if (magicAdapter && typeof magicAdapter.setPublicKey === 'function') {
//           console.log("Using magicAdapter.setPublicKey to force reconnection");
//           magicAdapter.setPublicKey(storedAddress);
//         }

//         setRetryCount(prev => prev + 1);
//       } else {
//         console.log(`Retry ${retryCount}: Magic wallet not found in wallet list yet`);
//         setRetryCount(prev => prev + 1);
//       }
//     }, 1000); // Try every second

//     return () => clearInterval(reconnectionInterval);
//   }, [publicKey, wallets, select, magicAdapter, retryCount]);

//   return null;
// };

// // This component ensures the wallet remains connected even after many refreshes
// const PersistentConnectionManager = () => {
//   const { publicKey, connecting, connected } = useWallet();
//   const [checkCount, setCheckCount] = useState(0);

//   // Periodically verify connection state even after initial connection
//   useEffect(() => {
//     // If we're connected, schedule periodic checks to ensure connection persists
//     if (publicKey) {
//       console.log("Setting up periodic connection verification");

//       const verificationInterval = setInterval(() => {
//         const storedAddress = localStorage.getItem('connectedWalletAddress');
//         const storedWalletName = localStorage.getItem('walletName');

//         if (publicKey) {
//           console.log(`Connection verification #${checkCount}: Connection still active`);

//           // Update localStorage just to be safe
//           if (storedAddress !== publicKey.toString()) {
//             console.log("Updating localStorage with current public key");
//             localStorage.setItem('connectedWalletAddress', publicKey.toString());
//             localStorage.setItem('walletName', MagicWalletName);
//           }
//         } else if (storedAddress && storedWalletName === MagicWalletName) {
//           console.log(`Connection verification #${checkCount}: Connection lost but credentials exist`);
//           // We would trigger re-connection here, but the WalletInitializer will handle this
//         }

//         setCheckCount(prev => prev + 1);
//       }, 5000); // Check every 5 seconds

//       return () => clearInterval(verificationInterval);
//     }
//   }, [publicKey, checkCount]);

//   return null;
// };

// export default function AppWalletProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const network = WalletAdapterNetwork.Devnet;
//   const endpoint = useMemo(() => clusterApiUrl(network), [network]);
//   const [magicAdapter, setMagicAdapter] = useState<MagicWalletAdapter | null>(null);
//   const [adapterInitialized, setAdapterInitialized] = useState(false);

//   // Initialize the Magic adapter
//   useEffect(() => {
//     if (adapterInitialized) return;

//     const initMagic = async () => {
//       try {
//         const apiKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || '';
//         console.log("Initializing Magic adapter with API key:", apiKey ? "[PRESENT]" : "[MISSING]");

//         if (!apiKey) {
//           console.error("Missing Magic API key. Please check your environment variables.");
//           return;
//         }

//         const adapter = new MagicWalletAdapter(apiKey, endpoint);
//         console.log("Magic adapter initialized with name:", adapter.name);

//         // Store reference to adapter
//         setMagicAdapter(adapter);
//         setAdapterInitialized(true);

//         // Make adapter globally available
//         if (typeof window !== 'undefined') {
//           window.magicAdapter = adapter;
//         }

//         // Check if we need to reconnect immediately
//         const storedAddress = localStorage.getItem('connectedWalletAddress');
//         const storedWalletName = localStorage.getItem('walletName');

//         if (storedAddress && storedWalletName === MagicWalletName) {
//           console.log("Found stored Magic wallet, setting public key:", storedAddress);
//           try {
//             adapter.setPublicKey(storedAddress);
//           } catch (err) {
//             console.error("Failed to set public key during initialization:", err);
//           }
//         }
//       } catch (error) {
//         console.error("Failed to initialize Magic adapter:", error);
//       }
//     };

//     initMagic();
//   }, [endpoint, adapterInitialized]);

//   // Create the wallet list with the Magic adapter
//   // const wallets = useMemo(() => {
//   //   const adapters: any[] = [new PhantomWalletAdapter()];

//   //   if (magicAdapter) {
//   //     adapters.push(magicAdapter);
//   //     console.log("Added Magic adapter to wallet list");
//   //   }

//   //   return adapters;
//   // }, [magicAdapter]);

//   const wallets = useMemo(() => {
//   const adapters: any[] = [new PhantomWalletAdapter()];
//   if (magicAdapter) adapters.push(magicAdapter);
//   return adapters; // Civic gets injected by CivicAuthProvider
// }, [magicAdapter]);


//   return (
//     <ConnectionProvider endpoint={endpoint}>
//       <MagicAdapterContext.Provider value={magicAdapter}>
//         <WalletProvider wallets={wallets} autoConnect={true}>
//           <WalletInitializer />
//           <PersistentConnectionManager />
//           <CustomWalletModalProvider>
//            <CivicAuthProvider
//         clientId={process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID!}
//         enableSolanaWalletAdapter={true} 
//       >
//             {children}
//              </CivicAuthProvider>
//           </CustomWalletModalProvider>
//         </WalletProvider>
//       </MagicAdapterContext.Provider>
//     </ConnectionProvider>
//   );
// }

"use client";

import React, { useMemo, useEffect, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { CustomWalletModalProvider } from "./ui/CustomWalletModalProvider";
import { MagicWalletAdapter, MagicWalletName } from "./MagicWalletAdapter";
import { CivicAuthProvider } from "@civic/auth-web3/react";
import type { WalletName } from "@solana/wallet-adapter-base";


require("@solana/wallet-adapter-react-ui/styles.css");

/** ---------- constants ---------- */
const CIVIC_WALLET_NAME = "Civic";
const isCivicName = (name?: string) => !!name && /civic/i.test(name);

// Our namespaced keys (so extensions won’t touch them)
const ZK_ADDR_KEY = "zk:connectedWalletAddress";
const ZK_LAST_KEY = "zk:lastWallet"; // stores JSON: { name: string }

/** ---------- contexts ---------- */
export const MagicAdapterContext =
  React.createContext<MagicWalletAdapter | null>(null);

if (typeof window !== "undefined") {
  (window as any).MagicWalletName = MagicWalletName;
}

/** ---------- helpers ---------- */
const readZkLast = (): string | null => {
  try {
    const raw = localStorage.getItem(ZK_LAST_KEY);
    if (!raw) return null;
    const { name } = JSON.parse(raw);
    return typeof name === "string" ? name : null;
  } catch {
    return null;
  }
};

/** ---------- WalletInitializer ---------- */
/** Tries to reselect Civic/Magic based on wallet-adapter’s own key OR our fallback. */
const WalletInitializer = () => {
  const { publicKey, select, wallets, connected, connecting } = useWallet();
  const [retryCount, setRetryCount] = useState(0);
  const magicAdapter = React.useContext(MagicAdapterContext);

  useEffect(() => {
    console.log("WalletInitializer state:", {
      pk: publicKey?.toString(),
      connected,
      connecting,
      wallets: wallets.map((w) => (w as any)?.name),
      retryCount,
    });
  }, [publicKey, connected, connecting, wallets, retryCount]);

  useEffect(() => {
    if (publicKey) return; // already connected

    // Primary source: wallet-adapter’s own selection (we DO NOT write this key)
    const adapterWalletName = localStorage.getItem("walletName"); // plain string
    // Fallback: our namespaced record
    const zkLast = readZkLast();

    const desired = adapterWalletName || zkLast;
    if (!desired) return;

    const asWalletName = (name: string) => name as unknown as WalletName;

    const interval = setInterval(() => {
      if (retryCount > 15) {
        clearInterval(interval);
        return;
      }
      if (publicKey) {
        clearInterval(interval);
        return;
      }

      const list = wallets.map((w) => ((w as any)?.name ?? "").toString());
      const hasDesired = list.some((n) =>
        desired === MagicWalletName ? n === MagicWalletName : isCivicName(desired) ? isCivicName(n) : n === desired
      );

      if (hasDesired) {
        const toSelect = isCivicName(desired)
          ? CIVIC_WALLET_NAME
          : desired;

        console.log(`Auto-selecting ${toSelect}`);
      select(toSelect === MagicWalletName ? MagicWalletName : asWalletName(toSelect));


        // If Magic, seed its public key fast (optional)
        if (toSelect === MagicWalletName) {
          const addr = localStorage.getItem(ZK_ADDR_KEY);
          if (addr && magicAdapter && typeof (magicAdapter as any).setPublicKey === "function") {
            try {
              (magicAdapter as any).setPublicKey(addr);
            } catch (e) {
              console.warn("magicAdapter.setPublicKey failed:", e);
            }
          }
        }
      } else {
        console.log(`Waiting for ${desired} to appear in wallet list...`);
      }

      setRetryCount((x) => x + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [publicKey, wallets, select, magicAdapter, retryCount]);

  return null;
};

/** ---------- PersistentConnectionManager ---------- */
/** Keeps our namespaced keys in sync. Never touches wallet-adapter’s 'walletName'. */
const PersistentConnectionManager = () => {
  const { publicKey, wallet } = useWallet();

  useEffect(() => {
    if (!publicKey) return;

    const tick = setInterval(() => {
      const pk = publicKey?.toString();
      const name = ((wallet as any)?.adapter?.name ?? "") as string;

      if (pk) {
        localStorage.setItem(ZK_ADDR_KEY, pk);
      }
      if (name) {
        // Store JSON so accidental JSON.parse() by other scripts never crashes
        localStorage.setItem(ZK_LAST_KEY, JSON.stringify({ name }));
      }
    }, 5000);

    return () => clearInterval(tick);
  }, [publicKey, wallet]);

  return null;
};

/** ---------- AppWalletProvider ---------- */
export default function AppWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const [magicAdapter, setMagicAdapter] =
    useState<MagicWalletAdapter | null>(null);
  const [adapterInitialized, setAdapterInitialized] = useState(false);

  // Init Magic once
  useEffect(() => {
    if (adapterInitialized) return;

    (async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || "";
        if (!apiKey) {
          console.error("Missing Magic API key");
          return;
        }
        const adapter = new MagicWalletAdapter(apiKey, endpoint);
        setMagicAdapter(adapter);
        setAdapterInitialized(true);
        if (typeof window !== "undefined") {
          (window as any).magicAdapter = adapter;
        }

        // Optional: seed pk if last wallet was Magic
        const last = readZkLast();
        const addr = localStorage.getItem(ZK_ADDR_KEY);
        if (last === MagicWalletName && addr) {
          (adapter as any).setPublicKey?.(addr);
        }
      } catch (e) {
        console.error("Magic init failed:", e);
      }
    })();
  }, [endpoint, adapterInitialized]);

  // Wallet list (Civic is discovered via CivicAuthProvider + Wallet Standard)
  const wallets = useMemo(() => {
    const arr: any[] = [new PhantomWalletAdapter()];
    if (magicAdapter) arr.push(magicAdapter);
    return arr;
  }, [magicAdapter]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <MagicAdapterContext.Provider value={magicAdapter}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletInitializer />
          <PersistentConnectionManager />
          <CustomWalletModalProvider>
            <CivicAuthProvider
              clientId={process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID || ""}
            >
              {children}
            </CivicAuthProvider>
          </CustomWalletModalProvider>
        </WalletProvider>
      </MagicAdapterContext.Provider>
    </ConnectionProvider>
  );
}
