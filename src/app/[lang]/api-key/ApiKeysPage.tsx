"use client";
import { useEffect, useState } from "react";
import { RiDeleteBin5Fill, RiAddCircleFill } from "react-icons/ri";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import ButtonV1New from "@/component/ui/buttonV1";
import { toast } from 'sonner';

const API_KEYS_URL = "https://zynapse.zkagi.ai/get-api-keys-by-wallet";
const DELETE_API_KEY_URL = "https://zynapse.zkagi.ai/delete-api-key";
const BALANCE_API_URL = "https://zynapse.zkagi.ai/check-balance";
const CREATE_API_KEY_URL = "https://zynapse.zkagi.ai/generate-api-key";
const API_KEY = "zk-123321";

interface ApiKeysPageProps {
    dictionary: any;
}


export default function ApiKeysPage({ dictionary }: ApiKeysPageProps) {
    const { publicKey } = useWallet();
    const router = useRouter();
    const [apiKeys, setApiKeys] = useState<string[]>([]);
    const [credits, setCredits] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(null);

    useEffect(() => {
        if (publicKey) {
            fetchApiKeys();
        }
    }, [publicKey]);

    const fetchApiKeys = async () => {
        if (!publicKey) return;
        setLoading(true);
        try {
            const response = await fetch(API_KEYS_URL, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "Thunder Client",
                    "api-key": API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ wallet_address: publicKey.toString() }),
            });

            if (!response.ok) throw new Error("Failed to fetch API keys");

            const data = await response.json();
            const keys = data.api_keys || [];
            setApiKeys(keys);

            if (keys.length > 0) {
                setAuthToken(keys[0]);
                fetchCredits(keys[0]);
            }
        } catch (error) {
            console.error("Error fetching API keys:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCredits = async (token: string) => {
        try {
            const response = await fetch(BALANCE_API_URL, {
                method: "GET",
                headers: {
                    "Accept": "/",
                    "User-Agent": "Thunder Client",
                    "Authorization": `Bearer ${token}`,
                    "api-key": API_KEY,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Failed to fetch balance");

            const data = await response.json();
            setCredits(data.credit_balance || 0);
        } catch (error) {
            console.error("Error fetching credits:", error);
            setCredits(null);
        }
    };

    const deleteApiKey = async (apiKey: string) => {
        if (!publicKey) return;

        try {
            const response = await fetch(DELETE_API_KEY_URL, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "Thunder Client",
                    "api-key": API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    wallet_address: publicKey.toString(),
                    api_key: apiKey,
                }),
            });

            if (!response.ok) throw new Error("Failed to delete API key");

            // Remove the deleted API key from state
            const updatedKeys = apiKeys.filter((key) => key !== apiKey);
            setApiKeys(updatedKeys);

            // Update authToken if the deleted key was being used
            if (apiKey === authToken) {
                setAuthToken(updatedKeys.length > 0 ? updatedKeys[0] : null);
                if (updatedKeys.length > 0) {
                    fetchCredits(updatedKeys[0]);
                } else {
                    setCredits(null);
                }
            }

            toast.error("API Key deleted successfully!");
        } catch (error) {
            console.error("Error deleting API key:", error);
        }
    };

    const createApiKey = async () => {
        if (!publicKey) return;

        try {
            const response = await fetch(CREATE_API_KEY_URL, {
                method: "POST",
                headers: {
                    "Accept": "/",
                    "User-Agent": "Thunder Client",
                    "api-key": API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    wallet_address: publicKey.toString(),
                }),
            });

            if (!response.ok) throw new Error("Failed to create API key");

            const generateKeyData = await response.json();
            if (generateKeyData.api_key) {
                setApiKeys((prevKeys) => [...prevKeys, generateKeyData.api_key]);
            }
            toast.success("API Key added successfully!");
        } catch (error) {
            console.error("Error creating API key:", error);
        }
    };

    const purchase = async () => {
        toast.info('Coming Soon, you cannot purchase token at this moment')
    }

    return (
        <div className="pt-3 p-6 bg-[#000A19] text-white h-screen">
            {/* Back and Create Buttons */}
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => router.push("/")}
                    className="text-lg font-semibold text-white"
                >
                    ←
                </button>
                <ButtonV1New
                    onClick={createApiKey}
                >
                    <div className="flex items-center gap-2">
                        <div>Create</div>
                        <div>
                            <RiAddCircleFill className="text-xl" />
                        </div>
                    </div>
                </ButtonV1New>
            </div>

            {/* Credits & Purchase Button */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold">API Keys</h1>
                </div>
                <div className="flex gap-2 justify-end items-center mb-4">
                    <div className="text-lg font-semibold bg-gray-800 text-white px-4 py-1 rounded">
                        {credits !== null ? `Credits: ${credits}` : "Fetching Credits..."}
                    </div>
                    <ButtonV1New onClick={purchase}>
                        Purchase
                    </ButtonV1New>
                </div>
            </div>

            <p className="mb-1 text-gray-400">View and Manage your API keys.</p>
            <p className="mb-5 italic text-gray-500">
                Do not share your API key with others or expose it in the browser or other client-side code.
            </p>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-900 border-b-2 border-gray-600">
                            <th className=" px-4 py-2 text-start">API Key</th>
                            <th className=" px-4 py-2 text-start">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {apiKeys.length > 0 ? (
                            apiKeys.map((api_key) => (
                                <tr key={api_key} className="">
                                    <td className=" px-4 py-2 ">{api_key}</td>
                                    <td className=" px-4 py-2 text-center">
                                        <RiDeleteBin5Fill
                                            className="text-red-500 cursor-pointer hover:text-red-700"
                                            onClick={() => deleteApiKey(api_key)}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2} className="text-center text-gray-500 py-4">
                                    No API keys found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}
