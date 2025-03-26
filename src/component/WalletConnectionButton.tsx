import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const WalletConnectionButton: React.FC = () => {
    return (
        <ConnectButton
            label="Connect Wallet"
            accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full'
            }}
            showBalance={{
                smallScreen: false,
                largeScreen: true
            }}
        />
    );
};

export default WalletConnectionButton;