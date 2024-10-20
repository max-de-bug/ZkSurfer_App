import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEthereumWallet } from './EthereumWalletProvider';

export default function WalletConnection() {
    const { publicKey: solanaPublicKey } = useWallet();
    const { isActive, account, connect, disconnect } = useEthereumWallet();

    return (
        <div>
            <h2>Solana Wallet</h2>
            <WalletMultiButton />
            {solanaPublicKey && <p>Connected: {solanaPublicKey.toString()}</p>}

            <h2>Ethereum Wallet</h2>
            {!isActive ? (
                <button onClick={connect}>Connect to MetaMask</button>
            ) : (
                <div>
                    <p>Connected: {account}</p>
                    <button onClick={disconnect}>Disconnect</button>
                </div>
            )}
        </div>
    );
}