// 'use client';
// import { useTransak, TransakUser } from '@/hooks/useTransak';
// import { useWallet } from '@solana/wallet-adapter-react';
// import { toast } from 'sonner';

// interface TransakWidgetProps {
//     className?: string;
//     buttonText?: string;
//     buttonClassName?: string;
//     defaultCryptoCurrency?: string;
//     defaultFiatCurrency?: string;
//     defaultFiatAmount?: number;
//     userData?: TransakUser; // Must be complete if provided
// }

// export default function TransakWidget({
//     className = '',
//     buttonText = 'Buy Crypto',
//     buttonClassName = '',
//     defaultCryptoCurrency = 'SOL',
//     defaultFiatCurrency = 'USD',
//     defaultFiatAmount = 100,
//     userData,
// }: TransakWidgetProps) {
//     const { publicKey } = useWallet();

//     const { openTransak, closeTransak } = useTransak({
//         apiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY!,
//         environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'STAGING',
//         walletAddress: publicKey?.toString(),
//         userData, // Will be undefined or a complete TransakUser object
//         defaultCryptoCurrency,
//         defaultFiatCurrency,
//         defaultFiatAmount,
//         onOrderCreated: (orderData) => {
//             toast.success('Order created successfully!');
//             console.log('Order created:', orderData);
//         },
//         onOrderSuccessful: (orderData) => {
//             toast.success('Payment successful! Your crypto will arrive shortly.');
//             console.log('Order successful:', orderData);
//             closeTransak();
//         },
//         onWidgetClose: () => {
//             console.log('Transak widget closed');
//         },
//     });

//     const handleBuyClick = () => {
//         if (!publicKey) {
//             toast.error('Please connect your wallet first');
//             return;
//         }
//         openTransak();
//     };

//     const defaultButtonStyles = `
//     bg-gradient-to-r from-indigo-500 to-purple-600 
//     hover:from-indigo-600 hover:to-purple-700 
//     text-white font-semibold py-3 px-6 rounded-lg 
//     transition-all duration-200 
//     shadow-lg hover:shadow-xl 
//     transform hover:scale-105
//     disabled:opacity-50 disabled:cursor-not-allowed
//     disabled:transform-none disabled:shadow-none
//   `;

//     return (
//         <div className={`transak-widget ${className}`}>
//             <button
//                 onClick={handleBuyClick}
//                 disabled={!publicKey}
//                 className={buttonClassName || defaultButtonStyles}
//             >
//                 {buttonText}
//             </button>

//             {!publicKey && (
//                 <p className="text-sm text-gray-400 mt-2 text-center">
//                     Connect your wallet to buy crypto
//                 </p>
//             )}
//         </div>
//     );
// }

'use client';
import { useTransak, TransakUser } from '@/hooks/useTransak';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';

interface TransakWidgetProps {
    className?: string;
    buttonText?: string;
    buttonClassName?: string;
    defaultCryptoCurrency?: string;
    defaultFiatCurrency?: string;
    defaultFiatAmount?: number;
    userData?: TransakUser;
    disabled?: boolean;
    showLoadingState?: boolean;
}

export default function TransakWidget({
    className = '',
    buttonText = 'Buy Crypto',
    buttonClassName = '',
    defaultCryptoCurrency = 'SOL',
    defaultFiatCurrency = 'USD',
    defaultFiatAmount = 100,
    userData,
    disabled = false,
    showLoadingState = true,
}: TransakWidgetProps) {
    const { publicKey } = useWallet();

    // Get the correct API key based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    const apiKey = isProduction
        ? process.env.NEXT_PUBLIC_TRANSAK_API_KEY_PRODUCTION
        : process.env.NEXT_PUBLIC_TRANSAK_API_KEY_STAGING;

    const { isLoaded, isLoading, openTransak, closeTransak } = useTransak({
        apiKey: apiKey!,
        environment: isProduction ? 'PRODUCTION' : 'STAGING',
        walletAddress: publicKey?.toString(),
        userData,
        defaultCryptoCurrency,
        defaultFiatCurrency,
        defaultFiatAmount,
        onOrderCreated: (orderData) => {
            toast.success('Order created successfully!', {
                description: 'Your crypto purchase order has been created.',
            });
            console.log('Order created:', orderData);
        },
        onOrderSuccessful: (orderData) => {
            toast.success('Payment successful!', {
                description: 'Your crypto will arrive in your wallet shortly.',
            });
            console.log('Order successful:', orderData);
            closeTransak();
        },
        onWidgetClose: () => {
            console.log('Transak widget closed');
        },
    });

    const handleBuyClick = () => {
        if (!apiKey) {
            toast.error('Transak API key not configured');
            console.error(`NEXT_PUBLIC_TRANSAK_API_KEY_${isProduction ? 'PRODUCTION' : 'STAGING'} is not set`);
            return;
        }

        if (!publicKey) {
            toast.error('Please connect your wallet first', {
                description: 'You need to connect a Solana wallet to purchase crypto.',
            });
            return;
        }

        if (!isLoaded) {
            toast.error('Payment system is loading', {
                description: 'Please wait for the payment system to load and try again.',
            });
            return;
        }

        try {
            openTransak();
        } catch (error) {
            console.error('Error opening Transak:', error);
            toast.error('Failed to open payment widget', {
                description: 'Please try again or contact support if the issue persists.',
            });
        }
    };

    const defaultButtonStyles = `
    bg-gradient-to-r from-indigo-500 to-purple-600 
    hover:from-indigo-600 hover:to-purple-700 
    text-white font-semibold py-3 px-6 rounded-lg 
    transition-all duration-200 
    shadow-lg hover:shadow-xl 
    transform hover:scale-105
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:transform-none disabled:shadow-none
    disabled:hover:from-indigo-500 disabled:hover:to-purple-600
  `;

    const isDisabled = disabled || !publicKey || !isLoaded || isLoading;

    // Determine button text based on state
    const getButtonText = () => {
        if (isLoading && showLoadingState) return 'Loading Payment System...';
        if (!isLoaded && showLoadingState) return 'Initializing...';
        return buttonText;
    };

    return (
        <div className={`transak-widget ${className}`}>
            <button
                onClick={handleBuyClick}
                disabled={isDisabled}
                className={buttonClassName || defaultButtonStyles}
                title={
                    !publicKey
                        ? 'Connect wallet to buy crypto'
                        : !isLoaded
                            ? 'Loading payment system...'
                            : 'Buy cryptocurrency with Transak'
                }
            >
                {getButtonText()}
            </button>

            {/* Status messages */}
            <div className="mt-2 text-sm text-center">
                {!publicKey && (
                    <p className="text-gray-400">
                        Connect your wallet to buy crypto
                    </p>
                )}

                {publicKey && isLoading && showLoadingState && (
                    <p className="text-gray-400">
                        Loading payment system...
                    </p>
                )}

                {publicKey && !isLoaded && !isLoading && (
                    <p className="text-red-400">
                        Failed to load payment system
                    </p>
                )}

                {publicKey && isLoaded && !isLoading && (
                    <p className="text-green-400">
                        Ready to purchase crypto
                    </p>
                )}
            </div>
        </div>
    );
}