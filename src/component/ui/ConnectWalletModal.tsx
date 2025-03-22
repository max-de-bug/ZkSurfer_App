import React from "react";
import { CustomWalletButton } from './CustomWalletButton';
import ButtonV1New from './buttonV1New';

interface ConnectWalletModalProps {
    onClose: () => void;
}

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 px-4">
            <div className="bg-[#171D3D] rounded-lg shadow-lg w-full sm:w-2/6 p-6 text-center">
                <h2 className="text-xl font-bold text-white">Connect Your Wallet</h2>
                <p className="text-gray-300 mt-2">
                    You need to connect your wallet to access ZkTerminal features.
                </p>

                {/* Buttons Section */}
                <div className="flex flex-col sm:flex-row justify-center sm:space-x-4 mt-4 space-y-4 sm:space-y-0">
                    {/* Wallet Connect Button */}
                    <CustomWalletButton />

                    {/* Close Button using ButtonV1New */}
                    <ButtonV1New onClick={onClose} width="w-auto">
                        Close
                    </ButtonV1New>
                </div>
            </div>
        </div>
    );
};

export default ConnectWalletModal;

