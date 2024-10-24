'use client';

import React, { createContext, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Web3ReactProvider, useWeb3React, initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';

const [metaMask, hooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions }))

interface EthereumWalletContextType {
    isActive: boolean;
    account: string | null | undefined;
    connect: () => Promise<void>;
    disconnect: () => void;
}

const EthereumWalletContext = createContext<EthereumWalletContextType | undefined>(undefined);

function EthereumWalletProviderInner({ children }: { children: ReactNode }) {
    const { account, isActive } = useWeb3React();

    const connect = useCallback(async () => {
        try {
            await metaMask.activate();
        } catch (ex) {
            console.error('Failed to connect to Ethereum wallet:', ex);
        }
    }, []);

    const disconnect = useCallback(() => {
        if (metaMask?.deactivate) {
            void metaMask.deactivate();
        } else {
            void metaMask.resetState();
        }
    }, []);

    // Try to eagerly connect
    useEffect(() => {
        void metaMask.connectEagerly();
    }, []);

    const value = {
        isActive: isActive,
        account,
        connect,
        disconnect,
    };

    return (
        <EthereumWalletContext.Provider value={value}>
            {children}
        </EthereumWalletContext.Provider>
    );
}

export function EthereumWalletProvider({ children }: { children: ReactNode }) {
    return (
        <Web3ReactProvider connectors={[[metaMask, hooks]]}>
            <EthereumWalletProviderInner>{children}</EthereumWalletProviderInner>
        </Web3ReactProvider>
    );
}

export function useEthereumWallet() {
    const context = useContext(EthereumWalletContext);
    if (context === undefined) {
        throw new Error('useEthereumWallet must be used within an EthereumWalletProvider');
    }
    return context;
}