"use client";

import { useState, useEffect } from 'react';
import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { toast } from "sonner";
import { Magic } from 'magic-sdk';
import { SolanaExtension } from '@magic-ext/solana';
import { useWallet } from "@solana/wallet-adapter-react";

// Initialize Magic with your publishable key and a Solana configuration
const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY as string, {
    extensions: [
        new SolanaExtension({
            rpcUrl: "https://api.devnet.solana.com",
        }),
    ],
});

interface WalletModalProps {
    isVisible: boolean;
    onClose: () => void;
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

export const WalletModal = ({ isVisible, onClose }: WalletModalProps) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { publicKey, connecting, disconnecting } = useWallet();
    const [wasConnecting, setWasConnecting] = useState(false);
    const [prevPublicKey, setPrevPublicKey] = useState<string | null>(null);

    // Track connection state changes for standard wallet connection
    useEffect(() => {
        if (isVisible) {
            // If we were connecting and now we have a public key that's different from before
            if (wasConnecting && !connecting && publicKey) {
                const currentPublicKey = publicKey.toString();

                // Check if this is a new connection
                if (prevPublicKey !== currentPublicKey) {
                    console.log("Wallet connected with address:", currentPublicKey);

                    // Close the modal
                    onClose();

                    // Only set walletName if it doesn't exist yet (first connection)
                    if (!localStorage.getItem('walletName')) {
                        console.log("First wallet connection, setting walletName to trigger refresh");
                        localStorage.setItem('walletName', 'connected');
                    } else {
                        // If walletName already exists, just update connectedWalletAddress without refresh
                        console.log("Updating connectedWalletAddress only");
                        const originalSetItem = localStorage.setItem.bind(localStorage);
                        originalSetItem('connectedWalletAddress', currentPublicKey);
                    }
                }
            }

            // Update the wasConnecting state
            if (connecting) {
                setWasConnecting(true);
            }
        }
    }, [connecting, publicKey, wasConnecting, onClose, isVisible, prevPublicKey]);

    // Reset wasConnecting when modal opens
    useEffect(() => {
        if (isVisible) {
            setWasConnecting(false);
        }
    }, [isVisible]);

    // Update prevPublicKey when publicKey changes
    useEffect(() => {
        if (publicKey) {
            setPrevPublicKey(publicKey.toString());

            // Update connectedWalletAddress whenever publicKey changes
            const originalSetItem = localStorage.setItem.bind(localStorage);
            originalSetItem('connectedWalletAddress', publicKey.toString());
        }
    }, [publicKey]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // First show a message that we're sending the OTP
            toast.success("Sending Magic Link to your email...");

            // This sends an OTP via email and handles authentication
            const didToken = await magic.auth.loginWithEmailOTP({ email });

            // At this point, authentication is successful
            toast.success("Successfully authenticated with Magic Link!");

            // Try to get and log the magic wallet info if possible
            try {
                // These logs might help identify the correct methods
                console.log("Magic object:", magic);
                console.log("Magic user:", magic.user);
                console.log("Magic auth:", magic.auth);
                console.log("Magic solana:", magic.solana);

                // Try different potential methods to get the user's address
                if (magic.user && typeof magic.user.getInfo === 'function') {
                    const userInfo = await magic.user.getInfo();
                    console.log("User info:", userInfo);

                    // If we can get the wallet address from Magic
                    if (userInfo && userInfo.publicAddress) {
                        // Only set walletName if it doesn't exist yet (first connection)
                        if (!localStorage.getItem('walletName')) {
                            console.log("First Magic Link connection, setting walletName to trigger refresh");
                            localStorage.setItem('walletName', 'connected');
                        }

                        // Always update connectedWalletAddress
                        const originalSetItem = localStorage.setItem.bind(localStorage);
                        originalSetItem('connectedWalletAddress', userInfo.publicAddress);
                    }
                }
            } catch (infoError) {
                console.log("Error getting wallet info:", infoError);
                // This is non-critical, so we continue
            }

            // Close the modal
            onClose();

        } catch (error: any) {
            console.error("Magic Link error:", error);
            toast.error("Error with Magic Link. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Modal overlay */}
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
            {/* Modal content */}
            <div className="bg-[#171D3D] rounded-lg p-6 z-10 w-11/12 max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Connect or Create Wallet</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-800">X</button>
                </div>

                {/* "Have a Wallet" Section */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-2">Have a Wallet</h3>
                    <p className="mb-4">Connect your existing wallet.</p>
                    <BaseWalletMultiButton labels={LABELS} />
                </div>

                {/* "Don't Have a Wallet" Section */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">Don't Have a Wallet</h3>
                    <p className="mb-4 text-xs">
                        Enter your email address to receive a Magic link for an OTP. A new Solana wallet will be automatically created for you upon successful authentication.
                    </p>
                    <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder="your-email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="border border-gray-300 rounded px-3 py-2"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                        >
                            {loading ? "Sending OTP..." : "Send Magic Link"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};