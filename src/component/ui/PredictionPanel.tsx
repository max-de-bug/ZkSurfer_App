'use client'
import React, { useState } from 'react'
import { useTradingStore } from '@/stores/trading-store';
import { ChevronDown } from 'lucide-react'

const assets = ['Bitcoin', 'Ethereum', 'Solana', 'Cardano'] as const;
type Asset = typeof assets[number];

interface PredictionPanelProps {
    className?: string;
}

const PredictionPanel: React.FC<PredictionPanelProps> = ({ className }) => {
    const {
        currentAsset,
        currentPrice,
        prediction,
        setDirection,
        setEntryPrice,
        setStopLoss,
        setTakeProfit,
        placePrediction,
        resetPrediction
    } = useTradingStore()

    const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState<boolean>(false)

    const handleInputChange = (field: 'entryPrice' | 'stopLoss' | 'takeProfit', value: string): void => {
        switch (field) {
            case 'entryPrice':
                setEntryPrice(value)
                break
            case 'stopLoss':
                setStopLoss(value)
                break
            case 'takeProfit':
                setTakeProfit(value)
                break
        }
    }

    const handleAssetSelect = (asset: Asset): void => {
        setIsAssetDropdownOpen(false)
        // You can add asset switching logic here
        console.log(`Selected asset: ${asset}`)
    }

    return (
        <div className={`bg-gray-900 text-white p-6 rounded-lg w-80 h-full space-y-4 ${className || ''}`}>
            <h2 className="text-xl font-semibold">New Prediction</h2>

            {/* Asset Selector */}
            <div className="space-y-2">
                <label className="text-sm text-gray-400">Asset</label>
                <div className="relative">
                    <button
                        onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-left flex items-center justify-between hover:bg-gray-750 transition-colors"
                        type="button"
                    >
                        <span>{currentAsset}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isAssetDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isAssetDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                            {assets.map((asset) => (
                                <button
                                    key={asset}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                                    onClick={() => handleAssetSelect(asset)}
                                    type="button"
                                >
                                    {asset}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Direction Buttons */}
            <div className="flex space-x-2">
                <button
                    onClick={() => setDirection('Long')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${prediction.direction === 'Long'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                    type="button"
                >
                    Long
                </button>
                <button
                    onClick={() => setDirection('Short')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${prediction.direction === 'Short'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                    type="button"
                >
                    Short
                </button>
            </div>

            {/* Entry Price */}
            <div className="space-y-2">
                <label className="text-sm text-gray-400">Entry Price</label>
                <input
                    type="number"
                    value={prediction.entryPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('entryPrice', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="38,500"
                />
            </div>

            {/* Stop Loss and Take Profit */}
            <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                    <label className="text-sm text-gray-400">Stop Loss</label>
                    <input
                        type="number"
                        value={prediction.stopLoss}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('stopLoss', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                        placeholder="38,000"
                    />
                </div>
                <div className="flex-1 space-y-2">
                    <label className="text-sm text-gray-400">Take Profit</label>
                    <input
                        type="number"
                        value={prediction.takeProfit}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('takeProfit', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                        placeholder="41,500"
                    />
                </div>
            </div>

            {/* Place Prediction Button */}
            <button
                onClick={placePrediction}
                disabled={prediction.isActive}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${prediction.isActive
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                type="button"
            >
                {prediction.isActive ? 'Prediction Active' : 'Place Prediction'}
            </button>

            {/* Reset Button (when prediction is active) */}
            {prediction.isActive && (
                <button
                    onClick={resetPrediction}
                    className="w-full py-2 px-4 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                    type="button"
                >
                    Reset Prediction
                </button>
            )}
        </div>
    )
}

export default PredictionPanel