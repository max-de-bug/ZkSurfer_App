import { useState } from 'react';
import { useTwitterStore } from '@/stores/twitter-store';

const TokenSetup = () => {
    const [step, setStep] = useState(1);
    const [token, setToken] = useState('');
    const [secret, setSecret] = useState('');
    const { setAccessToken, setAccessSecret } = useTwitterStore();

    const handleTokenSubmit = () => {
        if (!token.trim()) return;
        setAccessToken(token);
        setStep(2);
    };

    const handleSecretSubmit = () => {
        if (!secret.trim()) return;
        setAccessSecret(secret);
        setStep(3);
    };

    return (
        <div className="w-full max-w-2xl bg-[#171D3D] rounded-lg p-4 shadow-lg">
            {step === 1 && (
                <div className="space-y-4">
                    <div className="text-white">Please enter your Twitter Access Token:</div>
                    <input
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="w-full p-2 bg-[#24284E] text-white rounded border border-gray-700"
                        placeholder="Access Token"
                    />
                    <button
                        onClick={handleTokenSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Submit Token
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <div className="text-white">Please enter your Twitter Access Secret:</div>
                    <input
                        type="text"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        className="w-full p-2 bg-[#24284E] text-white rounded border border-gray-700"
                        placeholder="Access Secret"
                    />
                    <button
                        onClick={handleSecretSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Submit Secret
                    </button>
                </div>
            )}

            {step === 3 && (
                <div className="text-green-400">
                    Token and Secret set successfully! You can now use the /post command.
                </div>
            )}
        </div>
    );
};

export default TokenSetup;