import { FC, useState } from 'react';
import { VersionedTransaction, Connection } from '@solana/web3.js';
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/components/ui/use-toast";

interface TransactionHandlerProps {
    coin: {
        address: string;
        name: string;
    };
    action: 'buy' | 'sell';
    amount: string;
    selectedToken: string;
}

export const useTransactionHandler = () => {
    const { publicKey } = useWallet();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=c2c41dbf-5595-41fe-8a91-0aa78afba298";
    const connection = new Connection(RPC_ENDPOINT, 'confirmed');

    const handleTransaction = async ({
        coin,
        action,
        amount,
        selectedToken
    }: TransactionHandlerProps) => {
        if (!publicKey) {
            toast({
                title: "Wallet not connected",
                description: "Please connect your wallet to continue",
                variant: "destructive",
            });
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            toast({
                title: "Invalid amount",
                description: "Please enter a valid amount",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('https://pumpportal.fun/api/trade-local', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    publicKey: publicKey.toString(),
                    action: action,
                    mint: coin.address,
                    denominatedInSol: "false",
                    amount: 1000,
                    slippage: 10,
                    priorityFee: 0.00001,
                    pool: "pump"
                })
            });

            console.log('response', response)
            if (!response.ok) {
                throw new Error(`Transaction failed: ${response.statusText}`);
            }

            const data = await response.arrayBuffer();
            const tx = VersionedTransaction.deserialize(new Uint8Array(data));

            const signature = await connection.sendTransaction(tx);

            toast({
                title: "Transaction Successful",
                description: `View on Solscan: https://solscan.io/tx/${signature}`,
            });

            return signature;

        } catch (error) {
            console.error('Transaction error:', error);
            toast({
                title: "Transaction Failed",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        handleTransaction,
        isLoading
    };
};