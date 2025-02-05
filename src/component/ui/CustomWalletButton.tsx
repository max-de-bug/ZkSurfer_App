// "use client";

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useWalletModal } from "@solana/wallet-adapter-react-ui";
// import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useConnection, useWallet } from "@solana/wallet-adapter-react";
// import { WalletReadyState } from '@solana/wallet-adapter-base';
// import { toast } from "sonner";

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
//   const { publicKey, wallet, connecting, wallets } = useWallet();

//   const handleClick = () => {
//     // Check if any wallet is installed
//     const hasInstalledWallet = wallets.some((w) => w.readyState === WalletReadyState.Installed);
//     if (!hasInstalledWallet) {
//       // No wallet installed, show a toast prompting the user to install a wallet
//       toast.error('No installed Solana wallets found. Please install a wallet to continue.', {
//         action: {
//           label: 'Install Phantom',
//           onClick: () => window.open('https://phantom.app/', '_blank'),
//         },
//         cancel: {
//           label: 'Install Solflare',
//           onClick: () => window.open('https://solflare.com/', '_blank')
//         }
//       });
//       return;
//     }

//     // If at least one wallet is installed, show the default wallet modal
//     setVisible(true);
//   };

//   useEffect(() => {
//     if (publicKey && !connecting) {
//       router.push('/');
//     }
//   }, [publicKey, connecting, router]);

//   return (
//     <div className="flex items-center justify-center relative">
//       {publicKey ? (
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
//               GET STARTED
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };



"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { toast } from "sonner";

// Add TypeScript declarations for wallet browser properties
declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
      };
    };
    // solflare?: {
    //   isSolflare?: boolean;
    // };
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
  const { publicKey, wallet, connecting, wallets } = useWallet();

  const handleClick = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Improved wallet detection logic
    const hasPhantom = wallets.some(
      (w) =>
        w.adapter.name === 'Phantom' &&
        (w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable)
    );

    // const hasSolflare = wallets.some(
    //   (w) =>
    //     w.adapter.name === 'Solflare' &&
    //     (w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable)
    // );

    // If we're on mobile, check if we're inside a wallet browser
    if (isMobile) {
      const isInPhantomBrowser = typeof window !== 'undefined' && window.phantom?.solana?.isPhantom;
      // const isInSolflareBrowser = typeof window !== 'undefined' && window.solflare?.isSolflare;

      if (isInPhantomBrowser) { //isInSolflareBrowser
        // We're inside a wallet's browser, show the connect modal directly
        setVisible(true);
        return;
      }
    }

    // If at least one wallet is detected, show the connect modal
    if (hasPhantom) {//hasSolflare
      setVisible(true);
      return;
    }

    // If no wallets are detected, show the installation prompt
    toast.error('No available Solana wallets found. Please install a wallet to continue.', {
      action: {
        label: 'Install Phantom',
        onClick: () => window.open('https://phantom.app/', '_blank'),
      },
      // cancel: {
      //   label: 'Install Solflare',
      //   onClick: () => window.open('https://solflare.com/', '_blank'),
      // },
    });
  };

  useEffect(() => {
    if (publicKey && !connecting) {
      router.push('/');
    }
  }, [publicKey, connecting, router]);

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
              GET STARTED
            </div>
          </div>
        </div>
      )}
    </div>
  );
};