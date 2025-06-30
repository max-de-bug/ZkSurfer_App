// "use client";
// import { useState } from 'react';
// import { AarcFundKitModal } from '@aarc-xyz/fundkit-web-sdk';
// import { createAarcConfig, type PaymentIntent } from '@/lib/aarcConfig';
// import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

// const SUPPORTED_CHAINS = [
//   { value: 'Ethereum', label: 'Ethereum', logo: '⟠' },
//   { value: 'Polygon', label: 'Polygon', logo: '⬟' },
//   { value: 'Arbitrum', label: 'Arbitrum', logo: '🔵' },
//   { value: 'Optimism', label: 'Optimism', logo: '🔴' },
// ] as const;

// export default function USDCPaymentForm() {
//   const [amount, setAmount] = useState<string>('');
//   const [fromChain, setFromChain] = useState<string>('Ethereum');
//   const [isLoading, setIsLoading] = useState(false);
//   const [errors, setErrors] = useState<{amount?: string}>({});
  
//   const { primaryWallet, user } = useDynamicContext();
//   const apiKey = process.env.NEXT_PUBLIC_AARC_API_KEY || '';

//   const DESTINATION_ADDRESS = '0xeDa8Dec60B6C2055B61939dDA41E9173Bab372b2';
//   const TO_CHAIN = 'Base';
//   const TOKEN = 'USDC';

//   const validateForm = (): boolean => {
//     const newErrors: {amount?: string} = {};

//     if (!amount.trim()) {
//       newErrors.amount = 'Amount is required';
//     } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
//       newErrors.amount = 'Please enter a valid amount greater than 0';
//     } else if (Number(amount) < 0.01) {
//       newErrors.amount = 'Minimum amount is 0.01 USDC';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handlePayment = async () => {
//     if (!primaryWallet?.address) {
//       alert('Please connect your wallet first');
//       return;
//     }

//     if (!validateForm()) {
//       return;
//     }

//     try {
//       setIsLoading(true);

//       const paymentIntent: PaymentIntent = {
//         token: TOKEN,
//         amount: amount,
//         fromChain: fromChain,
//         toChain: TO_CHAIN,
//         destination: DESTINATION_ADDRESS
//       };

//       const config = createAarcConfig(
//         apiKey,
//         paymentIntent,
//         user?.userId || primaryWallet.address
//       );

//       const aarcModal = new AarcFundKitModal(config);
//       aarcModal.openModal();

//     } catch (error) {
//       console.error('Error opening Aarc payment:', error);
//       alert('Failed to open payment widget');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const isConnected = !!primaryWallet?.address;
//   const isFormValid = amount && fromChain && !errors.amount;

//   return (
//     <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-gray-900">Send USDC to Base</h2>
//         <p className="text-gray-600 mt-1">
//           Send USDC from any supported chain to Base network
//         </p>
//       </div>

//       <div className="space-y-4">
//         {/* Amount Input */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Amount (USDC)
//           </label>
//           <div className="relative">
//             <input
//               type="number"
//               step="0.01"
//               min="0.01"
//               value={amount}
//               onChange={(e) => {
//                 setAmount(e.target.value);
//                 if (errors.amount) {
//                   setErrors({});
//                 }
//               }}
//               className={`
//                 w-full px-4 py-3 border rounded-lg text-lg
//                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
//                 ${errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-300'}
//               `}
//               placeholder="100.00"
//             />
//             <div className="absolute inset-y-0 right-0 flex items-center pr-3">
//               <span className="text-gray-500 font-medium">USDC</span>
//             </div>
//           </div>
//           {errors.amount && (
//             <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
//           )}
//         </div>

//         {/* From Chain Selection */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             From Chain
//           </label>
//           <select
//             value={fromChain}
//             onChange={(e) => setFromChain(e.target.value)}
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             {SUPPORTED_CHAINS.map((chain) => (
//               <option key={chain.value} value={chain.value}>
//                 {chain.logo} {chain.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Submit Button */}
//         <button
//           onClick={handlePayment}
//           disabled={isLoading || !isConnected || !isFormValid}
//           className={`
//             w-full flex items-center justify-center px-6 py-4 text-lg font-medium rounded-lg
//             transition-colors duration-200 ease-in-out
//             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
//             ${isConnected && isFormValid && !isLoading
//               ? 'bg-blue-600 hover:bg-blue-700 text-white'
//               : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//             }
//           `}
//         >
//           {isLoading ? 'Processing...' : !isConnected ? 'Connect Wallet' : `Send ${amount || '0'} USDC to Base`}
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from 'react';
import { AarcFundKitModal } from '@aarc-xyz/fundkit-web-sdk';

// PaymentIntent interface
export interface PaymentIntent {
  token: string;
  amount: string;
  fromChain: string;
  toChain: string;
  destination: string;
}

// Create Aarc config function
const createAarcConfig = (
  apiKey: string,
  intent?: PaymentIntent,
  customerId?: string
) => {
  return {
    appName: "ZkTerminal",
    
    apiKeys: {
      aarcSDK: apiKey,
    },

    module: {
      exchange: {
        enabled: false,
      },
      onRamp: {
        enabled: true,
        onRampConfig: {
          customerId: customerId || "unique-user-id",
          exchangeScreenTitle: intent 
            ? `Deposit ${intent.amount} ${intent.token}` 
            : "Deposit funds in your wallet",
        },
      },
      bridgeAndSwap: {
        enabled: true,
        fetchOnlyDestinationBalance: false,
        routeType: "Value" as const,
      },
    },

    destination: {
      walletAddress: intent?.destination || "0xeDa8Dec60B6C2055B61939dDA41E9173Bab372b2",
    },

    appearance: {
      roundness: 42,
      theme: "DARK" as const,
    },

    events: {
      onTransactionSuccess: (data: any) => {
        console.log("Transaction successful:", data);
        alert("Payment successful!");
      },
      onTransactionError: (data: any) => {
        console.error("Transaction failed:", data);
        alert("Payment failed: " + data.message);
      },
      onWidgetClose: () => {
        console.log("Widget closed");
      },
      onWidgetOpen: () => {
        console.log("Widget opened");
      },
    },

    origin: typeof window !== "undefined" ? window.location.origin : "",
  };
};

const SUPPORTED_CHAINS = [
  { value: 'Ethereum', label: 'Ethereum', logo: '⟠' },
  { value: 'Polygon', label: 'Polygon', logo: '⬟' },
  { value: 'Arbitrum', label: 'Arbitrum', logo: '🔵' },
  { value: 'Optimism', label: 'Optimism', logo: '🔴' },
] as const;

export default function USDCPaymentForm() {
  const [amount, setAmount] = useState<string>('');
  const [fromChain, setFromChain] = useState<string>('Ethereum');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{amount?: string}>({});
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  
  const apiKey = process.env.NEXT_PUBLIC_AARC_API_KEY || '';

  // Fixed destination details
  const DESTINATION_ADDRESS = '0xeDa8Dec60B6C2055B61939dDA41E9173Bab372b2';
  const TO_CHAIN = 'Base';
  const TOKEN = 'USDC';

  // Check for wallet connection (MetaMask, etc.)
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          });
          if (accounts.length > 0) {
            setWalletConnected(true);
            setWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.log('No wallet connected');
        }
      }
    };

    checkWalletConnection();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        alert('Failed to connect wallet. Please try again.');
      }
    } else {
      alert('Please install MetaMask or another Web3 wallet to continue.');
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
  };

  const validateForm = (): boolean => {
    const newErrors: {amount?: string} = {};

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    } else if (Number(amount) < 0.01) {
      newErrors.amount = 'Minimum amount is 0.01 USDC';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!walletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (!apiKey) {
      alert('API key not configured. Please add NEXT_PUBLIC_AARC_API_KEY to your .env.local file');
      return;
    }

    try {
      setIsLoading(true);

      // Create the payment intent
      const paymentIntent: PaymentIntent = {
        token: TOKEN,
        amount: amount,
        fromChain: fromChain,
        toChain: TO_CHAIN,
        destination: DESTINATION_ADDRESS
      };

      // Create Aarc config
      const config = createAarcConfig(
        apiKey,
        paymentIntent,
        walletAddress
      );

      // Create and open modal
      const aarcModal = new AarcFundKitModal(config);
      aarcModal.openModal();

    } catch (error) {
      console.error('Error opening Aarc payment:', error);
      alert('Failed to open payment widget: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = amount && fromChain && !errors.amount;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto overflow-y-scroll">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Send USDC to Base</h2>
        <p className="text-gray-600 mt-1">
          Send USDC from any supported chain to Base network
        </p>
      </div>

      {/* Wallet Connection */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Wallet Connection</h3>
        {!walletConnected ? (
          <button
            onClick={connectWallet}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Connected:</span>
              <span className="text-sm font-mono text-gray-900">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
            <button
              onClick={disconnectWallet}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Destination Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">Payment Destination</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700">To Chain:</span>
            <span className="font-medium text-blue-900">Base Network</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Recipient:</span>
            <span className="font-mono text-xs text-blue-900 break-all">
              {DESTINATION_ADDRESS}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (USDC)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) {
                  setErrors({});
                }
              }}
              className={`
                w-full px-4 py-3 border rounded-lg text-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
              placeholder="100.00"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 font-medium">USDC</span>
            </div>
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        {/* From Chain Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Chain
          </label>
          <select
            value={fromChain}
            onChange={(e) => setFromChain(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SUPPORTED_CHAINS.map((chain) => (
              <option key={chain.value} value={chain.value}>
                {chain.logo} {chain.label}
              </option>
            ))}
          </select>
        </div>

        {/* Transaction Summary */}
        {amount && fromChain && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Transaction Summary</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">{amount} USDC</span>
              </div>
              <div className="flex justify-between">
                <span>From:</span>
                <span className="font-medium">{fromChain}</span>
              </div>
              <div className="flex justify-between">
                <span>To:</span>
                <span className="font-medium">Base Network</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handlePayment}
          disabled={isLoading || !walletConnected || !isFormValid}
          className={`
            w-full flex items-center justify-center px-6 py-4 text-lg font-medium rounded-lg
            transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${walletConnected && isFormValid && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Payment...
            </>
          ) : !walletConnected ? (
            'Connect Wallet to Continue'
          ) : !amount ? (
            'Enter Amount'
          ) : (
            `Send ${amount} USDC to Base`
          )}
        </button>

        {/* API Key Warning */}
        {!apiKey && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ API key not configured. Add NEXT_PUBLIC_AARC_API_KEY to your .env.local file.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}