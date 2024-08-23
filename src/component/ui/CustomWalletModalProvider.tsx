"use client";
import React, { FC, useState } from 'react';
import { WalletModalContext } from '@solana/wallet-adapter-react-ui';
import { CustomWalletModal } from './CustomWalletModal';

export interface CustomWalletModalProviderProps {
    children: React.ReactNode;
}

export const CustomWalletModalProvider: FC<CustomWalletModalProviderProps> = ({ children }) => {
    const [visible, setVisible] = useState(false);

    return (
        <WalletModalContext.Provider
            value={{
                visible,
                setVisible,
            }}
        >
            {children}
            {visible && <CustomWalletModal />}
        </WalletModalContext.Provider>
    );
};
