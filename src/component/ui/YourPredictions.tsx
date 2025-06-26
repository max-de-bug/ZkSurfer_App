'use client'
import React from 'react';
import { PredictionHistory } from '@/types/predictions';

const mockPredictions: PredictionHistory[] = [
    {
        id: '1',
        asset: 'Bitcoin',
        direction: 'Long',
        entryPrice: 38214,
        exitPrice: 37500,
        targetPrice: 41500,
        status: 'Win',
        timestamp: new Date('2024-06-13T10:00:00'),
        pnl: 1286
    },
    {
        id: '2',
        asset: 'Bitcoin',
        direction: 'Short',
        entryPrice: 39298,
        exitPrice: 41000,
        targetPrice: 58500,
        status: 'Loss',
        timestamp: new Date('2024-06-13T11:30:00'),
        pnl: -1702
    },
    {
        id: '3',
        asset: 'Bitcoin',
        direction: 'Long',
        entryPrice: 39491,
        exitPrice: 41300,
        targetPrice: 38100,
        status: 'Win',
        timestamp: new Date('2024-06-13T14:15:00'),
        pnl: 1809
    },
    {
        id: '4',
        asset: 'Ethereum',
        direction: 'Short',
        entryPrice: 51238,
        exitPrice: 38400,
        targetPrice: 48500,
        status: 'Loss',
        timestamp: new Date('2024-06-13T16:45:00'),
        pnl: -12838
    }
];

interface AssetIconProps {
    asset: string;
}

const AssetIcon: React.FC<AssetIconProps> = ({ asset }) => {
    const getAssetColor = (asset: string): string => {
        switch (asset) {
            case 'Bitcoin':
                return 'bg-orange-500';
            case 'Ethereum':
                return 'bg-gray-400';
            case 'Solana':
                return 'bg-purple-500';
            case 'Cardano':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getAssetSymbol = (asset: string): string => {
        switch (asset) {
            case 'Bitcoin':
                return '₿';
            case 'Ethereum':
                return 'Ξ';
            case 'Solana':
                return 'S';
            case 'Cardano':
                return '₳';
            default:
                return '?';
        }
    };

    return (
        <div className={`w-10 h-10 rounded-full ${getAssetColor(asset)} flex items-center justify-center text-white font-bold text-lg`}>
            {getAssetSymbol(asset)}
        </div>
    );
};

interface PredictionItemProps {
    prediction: PredictionHistory;
}

const PredictionItem: React.FC<PredictionItemProps> = ({ prediction }) => {
    const isWin = prediction.status === 'Win';
    const isActive = prediction.status === 'Active';

    const statusColor = isActive
        ? 'text-yellow-400'
        : isWin
            ? 'text-green-400'
            : 'text-red-400';

    const directionColor = prediction.direction === 'Long'
        ? 'text-green-400'
        : 'text-red-400';

    return (
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
            <div className="flex items-center space-x-3">
                <AssetIcon asset={prediction.asset} />

                <div className="flex flex-col">
                    <span className="text-white font-medium">{prediction.asset}</span>
                    <div className="text-sm text-gray-400">
                        <span>{prediction.entryPrice.toLocaleString()}</span>
                        <br />
                        <span>{prediction.exitPrice.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="text-right">
                <div className={`font-medium ${directionColor}`}>
                    {prediction.direction}
                </div>
                <div className="text-sm text-gray-400">
                    {prediction.targetPrice.toLocaleString()}
                </div>
                <div className={`text-sm font-medium ${statusColor}`}>
                    {prediction.status}
                </div>
            </div>
        </div>
    );
};

interface YourPredictionsProps {
    className?: string;
    predictions?: PredictionHistory[];
}

const YourPredictions: React.FC<YourPredictionsProps> = ({
    className,
    predictions = mockPredictions
}) => {
    const activePredictions = predictions.filter(p => p.status === 'Active');
    const completedPredictions = predictions.filter(p => p.status !== 'Active');
    const winRate = completedPredictions.length > 0
        ? (completedPredictions.filter(p => p.status === 'Win').length / completedPredictions.length * 100).toFixed(1)
        : '0';

    return (
        <div className={`bg-gray-900 rounded-lg p-6 ${className || ''}`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Your Predictions</h2>
                <div className="text-right">
                    <div className="text-xs text-gray-400">Win Rate</div>
                    <div className="text-sm font-bold text-green-400">{winRate}%</div>
                </div>
            </div>

            {/* Active Predictions */}
            {activePredictions.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-300 mb-3">Active</h3>
                    <div className="space-y-3">
                        {activePredictions.map((prediction) => (
                            <PredictionItem key={prediction.id} prediction={prediction} />
                        ))}
                    </div>
                </div>
            )}

            {/* Completed Predictions */}
            {completedPredictions.length > 0 && (
                <div>
                    <h3 className="text-md font-medium text-gray-300 mb-3">History</h3>
                    <div className="space-y-3 max-h-20 overflow-y-auto custom-scrollbar">
                        {completedPredictions
                            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                            .map((prediction) => (
                                <PredictionItem key={prediction.id} prediction={prediction} />
                            ))}
                    </div>
                </div>
            )}

            {predictions.length === 0 && (
                <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">No predictions yet</div>
                    <div className="text-sm text-gray-500">
                        Place your first prediction to see it here
                    </div>
                </div>
            )}
        </div>
    );
};

export default YourPredictions;