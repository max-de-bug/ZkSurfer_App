// "use client";

// import { useEffect, useState, useCallback, useContext } from 'react';
// import { useRouter } from 'next/navigation';
// import { useWalletModal } from "@solana/wallet-adapter-react-ui";
// import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useConnection, useWallet } from "@solana/wallet-adapter-react";
// import { WalletReadyState } from '@solana/wallet-adapter-base';
// import { toast } from "sonner";
// import { WalletModal } from './WalletModal';
// import { MagicWalletName } from '../MagicWalletAdapter';
// import { PublicKey } from '@solana/web3.js';
// import { MagicAdapterContext } from '../AppWalletProvider';
// import { WalletName } from '@solana/wallet-adapter-base';

// // Add TypeScript declarations for wallet browser properties
// declare global {
//   interface Window {
//     phantom?: {
//       solana?: {
//         isPhantom?: boolean;
//       };
//     };
//     magic?: any;
//     magicAdapter?: any;
//     MagicWalletName?: WalletName<'Magic'>;  // Must match the type from earlier declaration
//   }
// }
// const LABELS = {
//   "change-wallet": "Change wallet",
//   connecting: "Connecting ...",
//   "copy-address": "Copy address",
//   copied: "Copied",
//   disconnect: "Disconnect",
//   "has-wallet": "Connect",
//   "no-wallet": "Select Wallet",
// };

// export const CustomWalletButton = () => {
//   const router = useRouter();
//   const { setVisible } = useWalletModal();
//   const { publicKey, wallet, connecting, disconnecting, wallets, select } = useWallet();
//   const [isModalVisible, setModalVisible] = useState(false);
//   const [isFirstLoad, setIsFirstLoad] = useState(true);
//   const [storedWalletAddress, setStoredWalletAddress] = useState<string | null>(null);

//   // Get Magic adapter from context
//   const magicAdapter = useContext(MagicAdapterContext);

//   // Debug available wallets on mount
//   useEffect(() => {
//     if (wallets && wallets.length > 0) {
//       console.log("CustomWalletButton - Available wallets:",
//         wallets.map(w => ({
//           name: (w as any)?.name || 'unnamed',
//           ready: (w as any)?.readyState
//         }))
//       );
//     }
//   }, [wallets]);

//   // Remove refresh logic by eliminating the overrides that trigger page reloads
//   useEffect(() => {
//     if (typeof window === 'undefined') return;

//     // Create variables to track original localStorage methods
//     const originalSetItem = localStorage.setItem.bind(localStorage);
//     const originalRemoveItem = localStorage.removeItem.bind(localStorage);

//     // Override localStorage.setItem without refresh
//     localStorage.setItem = function (key: string, value: string) {
//       // Call original function with proper arguments
//       originalSetItem(key, value);
//     };

//     // Override localStorage.removeItem without refresh
//     localStorage.removeItem = function (key: string) {
//       originalRemoveItem(key);
//     };

//     // Clean up on unmount by restoring original methods
//     return () => {
//       localStorage.setItem = originalSetItem;
//       localStorage.removeItem = originalRemoveItem;
//     };
//   }, []);

//   // Initialization logic: check localStorage and try to connect Magic wallet if necessary
//   useEffect(() => {
//     if (!isFirstLoad) return;

//     setIsFirstLoad(false);
//     console.log("First load completed");

//     const storedAddress = localStorage.getItem('connectedWalletAddress');
//     const storedWalletName = localStorage.getItem('walletName');

//     if (storedAddress) {
//       setStoredWalletAddress(storedAddress);

//       // If no publicKey yet but we have stored address from Magic, try to connect
//       if (!publicKey && storedWalletName === MagicWalletName) {
//         console.log("Found stored Magic wallet address:", storedAddress);

//         // Try to trigger a wallet selection after a delay
//         setTimeout(() => {
//           if (!publicKey && wallets.some(w => (w as any)?.name === MagicWalletName)) {
//             console.log("Selecting Magic wallet");
//             select(MagicWalletName);
//           }
//         }, 1000);
//       }
//     }
//   }, [isFirstLoad, publicKey, wallets, select]);

//   // Update stored address when public key changes
//   useEffect(() => {
//     if (publicKey) {
//       const publicKeyString = publicKey.toString();
//       setStoredWalletAddress(publicKeyString);
//       localStorage.setItem('connectedWalletAddress', publicKeyString);
//       console.log("Public key updated:", publicKeyString);
//     }
//   }, [publicKey]);

//   // Handle wallet disconnection without triggering a refresh
//   useEffect(() => {
//     if (disconnecting || (!publicKey && !connecting && !isFirstLoad)) {
//       const hasWalletName = localStorage.getItem('walletName');
//       if (hasWalletName) {
//         console.log("Wallet disconnected, removing walletName");
//         localStorage.removeItem('walletName');
//         localStorage.removeItem('connectedWalletAddress');
//         setStoredWalletAddress(null);
//       }
//     }
//   }, [publicKey, disconnecting, connecting, isFirstLoad]);

//   // Check both publicKey and storedWalletAddress for display
//   const walletAddress = publicKey?.toString() || storedWalletAddress;

//   // Check connection status
//   const isConnected = !!publicKey || (!!storedWalletAddress && localStorage.getItem('walletName') === MagicWalletName);

//   // Create a custom wallet button component for Magic Link wallets
//   const CustomConnectedButton = ({ address }: { address: string }) => {
//     // Format address for display
//     const displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

//     const handleDisconnect = () => {
//       console.log("Disconnecting wallet...");

//       // Try to find the Magic adapter
//       if (magicAdapter) {
//         console.log("Disconnecting using Magic adapter from context");
//         magicAdapter.disconnect().catch(console.error);
//         return;
//       }

//       // Find the Magic adapter in wallet list
//       const adapterFromList = wallets.find(w =>
//         (w as any)?.name === MagicWalletName
//       );

//       if (adapterFromList) {
//         // Disconnect using the adapter - use type assertion for disconnect method
//         console.log("Disconnecting using Magic adapter from wallet list");
//         (adapterFromList as any).disconnect().catch(console.error);
//       } else {
//         // Fallback to localStorage removal
//         console.log("Magic adapter not found, using localStorage fallback");
//         localStorage.removeItem('walletName');
//         localStorage.removeItem('connectedWalletAddress');
//         setStoredWalletAddress(null);

//         // Force reload to clear the wallet state completely
//         window.location.reload();
//       }
//     };

//     return (
//       <div
//         className="transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
//         style={{
//           clipPath:
//             "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
//           backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
//           backgroundSize: "200% 200%",
//           animation: "spinGradient 3s linear infinite",
//         }}
//       >
//         <div className="flex items-center justify-between px-4 py-2 text-white">
//           <span className="font-mono">{displayAddress}</span>
//           <button
//             onClick={handleDisconnect}
//             className="ml-4 text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
//           >
//             Disconnect
//           </button>
//         </div>
//       </div>
//     );
//   };

//   const handleClick = () => {
//     // Only show our custom modal
//     setModalVisible(true);

//     // Check if wallets are installed
//     const hasPhantom = wallets.some(
//       (w) =>
//         (w as any)?.name === 'Phantom' &&
//         ((w as any)?.readyState === WalletReadyState.Installed || (w as any)?.readyState === WalletReadyState.Loadable)
//     );

//     // If no wallets are detected, show the installation prompt
//     if (!hasPhantom) {
//       toast.error('No available Solana wallets found. Please install a wallet to continue.', {
//         action: {
//           label: 'Install Phantom',
//           onClick: () => window.open('https://phantom.app/', '_blank'),
//         },
//       });
//     }
//   };

//   return (
//     <div className="flex items-center justify-center relative">
//       {publicKey ? (
//         // Show standard Solana wallet button if publicKey exists
//         <BaseWalletMultiButton
//           labels={LABELS}
//           className="transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
//           style={{
//             clipPath:
//               "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
//             backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
//             backgroundSize: "200% 200%",
//             animation: "spinGradient 3s linear infinite",
//           }}
//         />
//       ) : walletAddress && !publicKey ? (
//         // Show custom button for Magic Link wallet if we have a walletAddress but no publicKey
//         <CustomConnectedButton address={walletAddress} />
//       ) : (
//         <div
//           className="transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
//           style={{
//             clipPath:
//               "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
//             backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
//             backgroundSize: "200% 200%",
//             animation: "spinGradient 3s linear infinite",
//           }}
//           onClick={handleClick}
//         >
//           <div
//             className="transition-all ease-out relative duration-500 active:bg-opacity-80 block w-full overflow-hidden custom-gradient hover:bg-gradient-to-r hover:from-zkPurple hover:to-zkIndigo60 active:from-zkPurple60 hover:p-[1px]"
//             style={{
//               clipPath:
//                 "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
//             }}
//           >
//             <div className="transition-all ease-out duration-500 px-10 lg:px-12 py-4 text-center bg-clip-text text-transparent hover:text-white bg-gradient-to-l from-zkIndigo to-zkPurple font-bold tracking-wider">
//               Connect Wallet
//             </div>
//           </div>
//         </div>
//       )}
//       <WalletModal
//         isVisible={isModalVisible}
//         onClose={() => setModalVisible(false)}
//       />
//     </div>
//   );
// };


"use client";

import { useEffect, useState, useCallback, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { toast } from "sonner";
import { WalletModal } from "./WalletModal";
import { MagicWalletName } from "../MagicWalletAdapter";
import { PublicKey } from "@solana/web3.js";
import { MagicAdapterContext } from "../AppWalletProvider";
import { WalletName } from "@solana/wallet-adapter-base";
import { useModelStore } from "@/stores/useModel-store";

// Add TypeScript declarations for wallet browser properties
declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
      };
    };
    magic?: any;
    magicAdapter?: any;
    MagicWalletName?: WalletName<"Magic">; // Must match the type from earlier declaration
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
  const { publicKey, wallet, connecting, disconnecting, wallets, select } =
    useWallet();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [storedWalletAddress, setStoredWalletAddress] = useState<string | null>(
    null
  );
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [hasCalledAddUser, setHasCalledAddUser] = useState(false);

  // Get Magic adapter from context
  const magicAdapter = useContext(MagicAdapterContext);
  const [revealing, setRevealing] = useState(false);

  const handleReveal = async () => {
    if (!magicAdapter) return;
    setRevealing(true);
    try {
      await magicAdapter.revealPrivateKey();
    } catch {
      /* error already logged */
    } finally {
      setRevealing(false);
    }
  };

  //Set credits and keys
  const { setCredits, setApiKey } = useModelStore();

  // Debug available wallets on mount
  useEffect(() => {
    if (wallets && wallets.length > 0) {
      console.log(
        "CustomWalletButton - Available wallets:",
        wallets.map((w) => ({
          name: (w as any)?.name || "unnamed",
          ready: (w as any)?.readyState,
        }))
      );
    }
  }, [wallets]);

  // Initialization logic: check localStorage and try to connect Magic wallet if necessary
  useEffect(() => {
    if (!isFirstLoad) return;

    setIsFirstLoad(false);
    console.log("First load completed");

    const storedAddress = localStorage.getItem("connectedWalletAddress");
    const storedWalletName = localStorage.getItem("walletName");

    if (storedAddress) {
      setStoredWalletAddress(storedAddress);

      // If no publicKey yet but we have stored address from Magic, try to connect
      if (!publicKey && storedWalletName === MagicWalletName) {
        console.log("Found stored Magic wallet address:", storedAddress);

        // Try to trigger a wallet selection after a delay
        setTimeout(() => {
          if (
            !publicKey &&
            wallets.some((w) => (w as any)?.name === MagicWalletName)
          ) {
            console.log("Selecting Magic wallet");
            select(MagicWalletName);
          }
        }, 1000);
      }
    }
  }, [isFirstLoad, publicKey, wallets, select]);

  // Update stored address when public key changes
  useEffect(() => {
    if (publicKey) {
      const publicKeyString = publicKey.toString();
      setStoredWalletAddress(publicKeyString);
      localStorage.setItem("connectedWalletAddress", publicKeyString);
      console.log("Public key updated:", publicKeyString);
    }
  }, [publicKey]);

  // Handle wallet disconnection without triggering a refresh
  useEffect(() => {
    if (disconnecting || (!publicKey && !connecting && !isFirstLoad)) {
      const hasWalletName = localStorage.getItem("walletName");
      if (hasWalletName) {
        console.log("Wallet disconnected, removing walletName");
        localStorage.removeItem("walletName");
        localStorage.removeItem("connectedWalletAddress");
        setStoredWalletAddress(null);
      }
    }
  }, [publicKey, disconnecting, connecting, isFirstLoad]);

  // Check both publicKey and storedWalletAddress for display
  const walletAddress = publicKey?.toString() || storedWalletAddress;

  // Check connection status
  const isConnected =
    !!publicKey ||
    (!!storedWalletAddress &&
      localStorage.getItem("walletName") === MagicWalletName);

  useEffect(() => {
    if (
      isConnected && // we’re connected
      walletAddress && // we have an address
      !hasCalledAddUser // and haven’t called yet
    ) {
      setHasCalledAddUser(true);

      fetch("https://zynapse.zkagi.ai/add-user", {
        method: "POST",
        headers: {
          "api-key": "zk-123321",
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
        }),
      })
        .then(async (res) => {
          const json = await res.json();
          console.log("add-user response:", json);

          // Update the store with the response data
          if (json.credit_balance !== undefined) {
            setCredits(json.credit_balance);
            console.log("Updated credits:", json.credit_balance);
          }

          if (json.api_keys && json.api_keys.length > 0) {
            const firstApiKey = json.api_keys[0];
            setApiKey(firstApiKey);
            console.log("Updated API key:", firstApiKey);
          }
        })
        .catch((err) => {
          console.error("Error calling add-user:", err);
        });
    }
  }, [isConnected, walletAddress, hasCalledAddUser]);

  // Create a custom wallet button component for Magic Link wallets
  const CustomConnectedButton = ({ address }: { address: string }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef<HTMLUListElement>(null);

    const displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

    useEffect(() => {
      const listener = (event: MouseEvent | TouchEvent) => {
        const node = menuRef.current;
        if (!node || node.contains(event.target as Node)) return;
        setMenuOpen(false);
      };

      document.addEventListener('mousedown', listener);
      document.addEventListener('touchstart', listener);

      return () => {
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
      };
    }, []);

    const handleCopyAddress = async () => {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 400);
        toast.success('Address copied to clipboard');
      } catch (error) {
        console.error('Failed to copy address:', error);
        toast.error('Failed to copy address');
      }
    };

    const handleRevealKey = async () => {
      console.log('🔑 Reveal Private Key clicked', { magicAdapter: !!magicAdapter });

      if (!magicAdapter) {
        console.error('No magic adapter available');
        toast.error('Magic adapter not available');
        return;
      }

      setRevealing(true);
      try {
        console.log('Attempting to reveal private key...');

        if (typeof magicAdapter.revealPrivateKey === 'function') {
          await magicAdapter.revealPrivateKey();
          toast.success('Private key revealed successfully');
        }
        //  else if (typeof magicAdapter.reveal === 'function') {
        //   await magicAdapter.reveal();
        //   toast.success('Private key revealed successfully');
        // }
        else {
          console.error('revealPrivateKey method not found on magic adapter');
          console.log('Available methods:', Object.getOwnPropertyNames(magicAdapter));
          toast.error('Reveal private key method not available');
        }
      } catch (error) {
        console.error('Error revealing private key:', error);
        toast.error('Failed to reveal private key: ' + error);
      } finally {
        setRevealing(false);
      }
      setMenuOpen(false);
    };

    const handleDisconnect = async () => {
      console.log("Disconnecting wallet...");
      setIsDisconnecting(true);

      try {
        if (magicAdapter) {
          console.log("Disconnecting using Magic adapter from context");
          await magicAdapter.disconnect();
          return;
        }

        const adapterFromList = wallets.find(
          (w) => (w as any)?.name === MagicWalletName
        );

        if (adapterFromList) {
          console.log("Disconnecting using Magic adapter from wallet list");
          await (adapterFromList as any).disconnect();
        } else {
          console.log("Magic adapter not found, using localStorage fallback");
          localStorage.removeItem("walletName");
          localStorage.removeItem("connectedWalletAddress");
          setStoredWalletAddress(null);
          window.location.reload();
        }
      } catch (error) {
        console.error("Error during disconnect:", error);
        toast.error("Failed to disconnect wallet. Please try again.");
        window.location.reload();
      } finally {
        setIsDisconnecting(false);
      }
      setMenuOpen(false);
    };

    const handleChangeWallet = () => {
      setModalVisible(true);
      setMenuOpen(false);
    };

    return (
      <div className="wallet-adapter-dropdown relative">
        <div
          className="transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
          style={{
            clipPath:
              "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
            backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
            backgroundSize: "200% 200%",
            animation: "spinGradient 3s linear infinite",
          }}
          onClick={() => setMenuOpen(true)}
        >
          <div className="flex items-center justify-center px-4 py-2 text-white">
            <span className="font-mono">{displayAddress}</span>
          </div>
        </div>

        <ul
          ref={menuRef}
          className={`absolute top-full left-0 mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 ${menuOpen ? 'block' : 'hidden'
            }`}
          role="menu"
        >
          <li
            className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer border-b border-gray-600"
            onClick={handleCopyAddress}
            role="menuitem"
          >
            {copied ? '✓ Copied' : '📋 Copy address'}
          </li>

          <li
            className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer border-b border-gray-600"
            onClick={handleChangeWallet}
            role="menuitem"
          >
            🔄 Change wallet
          </li>

          <li
            className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer border-b border-gray-600"
            onClick={handleRevealKey}
            role="menuitem"
          >
            {revealing ? '🔄 Revealing...' : '🔑 Reveal Private Key'}
          </li>

          <li
            className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer"
            onClick={handleDisconnect}
            role="menuitem"
          >
            {isDisconnecting ? '⏳ Disconnecting...' : '🚪 Disconnect'}
          </li>
        </ul>
      </div>
    );
  };


  // const CustomConnectedButton = ({ address }: { address: string }) => {
  //   // Format address for display
  //   const displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  //   const handleDisconnect = async () => {
  //     console.log("Disconnecting wallet...");
  //     setIsDisconnecting(true);

  //     try {
  //       // Try to find the Magic adapter
  //       if (magicAdapter) {
  //         console.log("Disconnecting using Magic adapter from context");
  //         await magicAdapter.disconnect();
  //         return; // This will trigger a page reload in the adapter
  //       }

  //       // Find the Magic adapter in wallet list
  //       const adapterFromList = wallets.find(
  //         (w) => (w as any)?.name === MagicWalletName
  //       );

  //       if (adapterFromList) {
  //         // Disconnect using the adapter - use type assertion for disconnect method
  //         console.log("Disconnecting using Magic adapter from wallet list");
  //         await (adapterFromList as any).disconnect();
  //       } else {
  //         // Fallback to localStorage removal
  //         console.log("Magic adapter not found, using localStorage fallback");
  //         localStorage.removeItem("walletName");
  //         localStorage.removeItem("connectedWalletAddress");
  //         setStoredWalletAddress(null);

  //         // Force reload to clear the wallet state completely
  //         window.location.reload();
  //       }
  //     } catch (error) {
  //       console.error("Error during disconnect:", error);
  //       toast.error("Failed to disconnect wallet. Please try again.");

  //       // Force reload as last resort
  //       window.location.reload();
  //     } finally {
  //       setIsDisconnecting(false);
  //     }
  //   };

  //   return (
  //     <div
  //       className="transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
  //       style={{
  //         clipPath:
  //           "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
  //         backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
  //         backgroundSize: "200% 200%",
  //         animation: "spinGradient 3s linear infinite",
  //       }}
  //     >
  //       {/* <div className="flex items-center justify-between p-4 bg-gray-800 rounded">
  //         <span className="font-mono">{address.slice(0, 6)}…{address.slice(-4)}</span>
  //         <button onClick={handleReveal}
  //           disabled={revealing}
  //           className="ml-4 text-sm underline">
  //           {revealing ? 'Revealing…' : 'Reveal Private Key'}
  //         </button>
  //       </div> */}
  //       <div className="flex items-center justify-between px-4 py-2 text-white">
  //         <span className="font-mono">{displayAddress}</span>
  //         <button
  //           onClick={handleDisconnect}
  //           disabled={isDisconnecting}
  //           className="ml-4 text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
  //         >
  //           {isDisconnecting ? "Disconnecting..." : "Disconnect"}
  //         </button>
  //       </div>
  //     </div>
  //   );
  // };

  const handleClick = () => {
    // Only show our custom modal
    setModalVisible(true);

    // Check if wallets are installed
    const hasPhantom = wallets.some(
      (w) =>
        (w as any)?.name === "Phantom" &&
        ((w as any)?.readyState === WalletReadyState.Installed ||
          (w as any)?.readyState === WalletReadyState.Loadable)
    );

    // If no wallets are detected, show the installation prompt
    if (!hasPhantom) {
      toast.error(
        "No available Solana wallets found. Please install a wallet to continue.",
        {
          action: {
            label: "Install Phantom",
            onClick: () => window.open("https://phantom.app/", "_blank"),
          },
        }
      );
    }
  };

  // const adapterName = (wallet as any)?.adapter?.name;
  const adapterName = (wallet as any)?.adapter?.name;
  const isMagicWallet = adapterName === MagicWalletName ||
    localStorage.getItem("walletName") === MagicWalletName;

  return (
    <div className="flex items-center justify-center relative">
      {isMagicWallet && (publicKey || walletAddress) && walletAddress ? (
        <CustomConnectedButton address={walletAddress} />
      ) : publicKey ? (
        // Show standard Solana wallet button if publicKey exists
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
      )
        // : walletAddress ? (
        //   //&& !publicKey
        //   // Show custom button for Magic Link wallet if we have a walletAddress but no publicKey
        //   <CustomConnectedButton address={walletAddress} />
        // )
        : (
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

