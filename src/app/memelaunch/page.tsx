'use client';
import React, { useState } from 'react';
import Image from 'next/image';

interface FormData {
    name: string;
    symbol: string;
    supply: string;
    description: string;
}

const MemeLaunch = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        symbol: '',
        supply: '',
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Add your meme coin launch logic here
        console.log('Launching meme coin with data:', formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-[#08121f] text-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Launch Your Meme Coin</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2">Token Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-gray-800 rounded-lg p-3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Token Symbol</label>
                        <input
                            type="text"
                            name="symbol"
                            value={formData.symbol}
                            onChange={handleChange}
                            className="w-full bg-gray-800 rounded-lg p-3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Initial Supply</label>
                        <input
                            type="number"
                            name="supply"
                            value={formData.supply}
                            onChange={handleChange}
                            className="w-full bg-gray-800 rounded-lg p-3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full bg-gray-800 rounded-lg p-3 h-32"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#BDA0FF] to-[#00FF89] text-black font-bold py-3 rounded-lg"
                    >
                        Launch Meme Coin
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MemeLaunch;