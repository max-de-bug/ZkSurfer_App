// hooks/useWalletSubscription.ts

import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react'; // or your wallet hook
import { useSubscriptionStore } from '@/stores/subscription-store';

export const useWalletSubscription = () => {
    const { publicKey, connected } = useWallet(); // Adjust based on your wallet setup
    const { checkSubscription, clearSubscription, isSubscribed, subscriptionType, isLoading } = useSubscriptionStore();

    useEffect(() => {
        if (connected && publicKey) {
            const walletAddress = publicKey.toString(); // Adjust based on your wallet type
            console.log('👛 Wallet connected:', walletAddress);

            // Check subscription status when wallet connects
            checkSubscription(walletAddress);
        } else {
            console.log('👛 Wallet disconnected');
            // Clear subscription state when wallet disconnects
            clearSubscription();
        }
    }, [connected, publicKey, checkSubscription, clearSubscription]);

    return {
        isSubscribed,
        subscriptionType,
        isLoading,
        walletAddress: publicKey?.toString() || null,
    };
};
