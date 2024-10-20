// "use client";

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useWalletModal } from "@solana/wallet-adapter-react-ui";
// import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useConnection, useWallet } from "@solana/wallet-adapter-react";

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
//   const { publicKey, wallet, connecting } = useWallet();

//   const handleClick = () => {
//     setVisible(true);
//   };

//   useEffect(() => {
//     if (publicKey && !connecting) {
//       router.push('/congratulations');
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

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEthereumWallet } from '../EthereumWalletProvider';

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
  const { publicKey, wallet, connecting } = useWallet();
  const { isActive: isEthereumActive, account: ethereumAccount, connect: connectEthereum, disconnect: disconnectEthereum } = useEthereumWallet();
  const [walletType, setWalletType] = useState<'solana' | 'ethereum' | null>(null);

  const handleClick = async () => {
    if (!walletType) {
      // If no wallet is connected, show options to connect
      setVisible(true);
    } else if (walletType === 'solana') {
      // If Solana wallet is connected, use the BaseWalletMultiButton's default behavior
    } else if (walletType === 'ethereum') {
      // If Ethereum wallet is connected, disconnect
      await disconnectEthereum();
      setWalletType(null);
    }
  };

  const handleEthereumConnection = async () => {
    try {
      await connectEthereum();
    } catch (error) {
      console.error('Failed to connect Ethereum wallet:', error);
    }
  };

  useEffect(() => {
    if (publicKey && !connecting) {
      setWalletType('solana');
      router.push('/congratulations');
    } else if (isEthereumActive && ethereumAccount) {
      setWalletType('ethereum');
      router.push('/congratulations');
    } else {
      setWalletType(null);
    }
  }, [publicKey, connecting, isEthereumActive, ethereumAccount, router]);

  const getButtonText = () => {
    if (walletType === 'solana') {
      return `Solana: ${publicKey?.toString().slice(0, 4)}...${publicKey?.toString().slice(-4)}`;
    } else if (walletType === 'ethereum') {
      return `Ethereum: ${ethereumAccount?.slice(0, 4)}...${ethereumAccount?.slice(-4)}`;
    } else {
      return "GET STARTED";
    }
  };

  return (
    <div className="flex items-center justify-center relative">
      {walletType === 'solana' ? (
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
          onClick={walletType === 'ethereum' ? handleClick : handleEthereumConnection}
        >
          <div
            className="transition-all ease-out relative duration-500 active:bg-opacity-80 block w-full overflow-hidden custom-gradient hover:bg-gradient-to-r hover:from-zkPurple hover:to-zkIndigo60 active:from-zkPurple60 hover:p-[1px]"
            style={{
              clipPath:
                "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
            }}
          >
            <div className="transition-all ease-out duration-500 px-10 lg:px-12 py-4 text-center bg-clip-text text-transparent hover:text-white bg-gradient-to-l from-zkIndigo to-zkPurple font-bold tracking-wider">
              {getButtonText()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};