import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Clock, Target, Shield, Zap } from 'lucide-react';

interface LeveragePosition {
    id: string;
    leverage: number;
    direction: 'LONG' | 'SHORT';
    entryPrice: number;
    currentPrice: number;
    positionSize: number;
    pnl: number;
    pnlPercent: number;
    liquidationPrice: number;
    recommendedExit?: number;
    timeframe: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
    createdAt: Date;
    status: 'ACTIVE' | 'CLOSED' | 'LIQUIDATED';
}

interface LeverageRecommendation {
    leverage: number;
    direction: 'LONG' | 'SHORT';
    entryPrice: number;
    positionSize: number;
    stopLoss: number;
    takeProfit: number;
    liquidationPrice: number;
    timeframe: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
    confidence: number;
    reasonsToEnter: string[];
    reasonsToAvoid: string[];
}

const LeverageTradingAssistant: React.FC = () => {
    const [selectedLeverage, setSelectedLeverage] = useState<number>(10);
    const [accountBalance, setAccountBalance] = useState<number>(1000);
    const [activePositions, setActivePositions] = useState<LeveragePosition[]>([]);
    const [currentRecommendation, setCurrentRecommendation] = useState<LeverageRecommendation | null>(null);
    const [isLiveTracking, setIsLiveTracking] = useState(false);
    const [riskTolerance, setRiskTolerance] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');

    // Mock current Bitcoin price and data
    const [currentPrice, setCurrentPrice] = useState(119000);
    const [priceChange, setPriceChange] = useState(0.5);
    const [volatility, setVolatility] = useState(0.023);
    const [volume, setVolume] = useState(1200000);

    // Calculate dynamic risk management
    const calculateLeverageRisk = (leverage: number, volatility: number) => {
        const riskScore = leverage * volatility * 100;

        if (riskScore < 20) return 'LOW';
        if (riskScore < 50) return 'MEDIUM';
        if (riskScore < 100) return 'HIGH';
        return 'EXTREME';
    };

    // Calculate recommended timeframe based on leverage
    const getRecommendedTimeframe = (leverage: number, riskLevel: string) => {
        if (leverage >= 50) return '5-15 minutes';
        if (leverage >= 20) return '15-60 minutes';
        if (leverage >= 10) return '1-4 hours';
        if (leverage >= 5) return '4-12 hours';
        return '12+ hours';
    };

    // Calculate position size with dynamic risk management
    const calculatePositionSize = (leverage: number, balance: number, riskTolerance: string) => {
        const baseRisk = riskTolerance === 'Conservative' ? 0.01 :
            riskTolerance === 'Moderate' ? 0.02 : 0.03;

        const leverageAdjustment = Math.max(0.005, baseRisk / Math.sqrt(leverage));
        const volatilityAdjustment = 1 / (1 + volatility * 10);

        return balance * leverageAdjustment * volatilityAdjustment * leverage;
    };

    // Calculate liquidation price
    const calculateLiquidationPrice = (entryPrice: number, leverage: number, direction: 'LONG' | 'SHORT') => {
        const liquidationBuffer = 0.95; // 5% buffer for fees

        if (direction === 'LONG') {
            return entryPrice * (1 - (liquidationBuffer / leverage));
        } else {
            return entryPrice * (1 + (liquidationBuffer / leverage));
        }
    };

    // Generate leverage recommendation
    const generateRecommendation = () => {
        const riskLevel = calculateLeverageRisk(selectedLeverage, volatility);
        const timeframe = getRecommendedTimeframe(selectedLeverage, riskLevel);
        const positionSize = calculatePositionSize(selectedLeverage, accountBalance, riskTolerance);

        // Mock signal direction (in real app, this would come from your AI)
        const direction: 'LONG' | 'SHORT' = priceChange > 0 ? 'LONG' : 'SHORT';
        const entryPrice = currentPrice * (direction === 'LONG' ? 1.001 : 0.999);

        const stopLoss = direction === 'LONG' ?
            entryPrice * (1 - (0.5 / selectedLeverage)) :
            entryPrice * (1 + (0.5 / selectedLeverage));

        const takeProfit = direction === 'LONG' ?
            entryPrice * (1 + (1.5 / selectedLeverage)) :
            entryPrice * (1 - (1.5 / selectedLeverage));

        const liquidationPrice = calculateLiquidationPrice(entryPrice, selectedLeverage, direction);

        const confidence = Math.max(50, Math.min(95, 85 - (selectedLeverage * 0.5) + (priceChange * 10)));

        const reasonsToEnter = [
            `${selectedLeverage}x leverage optimized for ${timeframe} timeframe`,
            `Current volatility (${(volatility * 100).toFixed(1)}%) suits ${riskLevel.toLowerCase()} risk`,
            `Price momentum favors ${direction} direction`,
            `Volume confirmation: ${(volume / 1000000).toFixed(1)}M BTC`
        ];

        const reasonsToAvoid = [
            riskLevel === 'EXTREME' ? 'Extremely high risk due to leverage + volatility' : null,
            selectedLeverage > 25 ? 'High leverage requires precise timing' : null,
            Math.abs(priceChange) < 0.1 ? 'Low momentum may reduce profit potential' : null
        ].filter(Boolean) as string[];

        setCurrentRecommendation({
            leverage: selectedLeverage,
            direction,
            entryPrice,
            positionSize,
            stopLoss,
            takeProfit,
            liquidationPrice,
            timeframe,
            riskLevel,
            confidence,
            reasonsToEnter,
            reasonsToAvoid
        });
    };

    // Execute trade based on recommendation
    const executeTrade = () => {
        if (!currentRecommendation) return;

        const newPosition: LeveragePosition = {
            id: Date.now().toString(),
            leverage: currentRecommendation.leverage,
            direction: currentRecommendation.direction,
            entryPrice: currentRecommendation.entryPrice,
            currentPrice: currentPrice,
            positionSize: currentRecommendation.positionSize,
            pnl: 0,
            pnlPercent: 0,
            liquidationPrice: currentRecommendation.liquidationPrice,
            timeframe: currentRecommendation.timeframe,
            riskLevel: currentRecommendation.riskLevel,
            createdAt: new Date(),
            status: 'ACTIVE'
        };

        setActivePositions(prev => [...prev, newPosition]);
        setIsLiveTracking(true);
    };

    // Update active positions with live data
    useEffect(() => {
        if (!isLiveTracking || activePositions.length === 0) return;

        const interval = setInterval(() => {
            // Mock price updates (in real app, this would be live data)
            const newPrice = currentPrice + (Math.random() - 0.5) * 100;
            setCurrentPrice(newPrice);

            setActivePositions(prev => prev.map(position => {
                if (position.status !== 'ACTIVE') return position;

                const priceDiff = newPrice - position.entryPrice;
                const pnl = position.direction === 'LONG' ?
                    (priceDiff / position.entryPrice) * position.positionSize :
                    (-priceDiff / position.entryPrice) * position.positionSize;

                const pnlPercent = (pnl / (position.positionSize / position.leverage)) * 100;

                // Check for liquidation
                const isLiquidated = position.direction === 'LONG' ?
                    newPrice <= position.liquidationPrice :
                    newPrice >= position.liquidationPrice;

                return {
                    ...position,
                    currentPrice: newPrice,
                    pnl,
                    pnlPercent,
                    status: isLiquidated ? 'LIQUIDATED' : 'ACTIVE'
                };
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, [isLiveTracking, activePositions.length, currentPrice]);

    // Generate recommendation on component mount and lever change
    useEffect(() => {
        generateRecommendation();
    }, [selectedLeverage, riskTolerance, currentPrice]);

    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'LOW': return 'text-green-400 bg-green-400/20';
            case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/20';
            case 'HIGH': return 'text-orange-400 bg-orange-400/20';
            case 'EXTREME': return 'text-red-400 bg-red-400/20';
            default: return 'text-gray-400 bg-gray-400/20';
        }
    };

    const closePosition = (positionId: string) => {
        setActivePositions(prev => prev.map(pos =>
            pos.id === positionId ? { ...pos, status: 'CLOSED' } : pos
        ));
    };

    return (
        <div className="bg-[#0a1628] rounded-lg p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <Zap className="text-yellow-400" size={24} />
                    <h2 className="text-xl font-bold text-white">Leverage Trading Assistant</h2>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-400">Account Balance:</div>
                    <div className="text-lg font-bold text-white">${accountBalance.toLocaleString()}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Settings Panel */}
                <div className="bg-[#1a2332] rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Trading Setup</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Leverage</label>
                            <select
                                value={selectedLeverage}
                                onChange={(e) => setSelectedLeverage(Number(e.target.value))}
                                className="w-full bg-[#0a1628] text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500"
                            >
                                <option value={2}>2x - Ultra Safe</option>
                                <option value={5}>5x - Conservative</option>
                                <option value={10}>10x - Moderate</option>
                                <option value={20}>20x - Aggressive</option>
                                <option value={50}>50x - High Risk</option>
                                <option value={100}>100x - Extreme Risk</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Risk Tolerance</label>
                            <select
                                value={riskTolerance}
                                onChange={(e) => setRiskTolerance(e.target.value as any)}
                                className="w-full bg-[#0a1628] text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500"
                            >
                                <option value="Conservative">Conservative</option>
                                <option value="Moderate">Moderate</option>
                                <option value="Aggressive">Aggressive</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Account Balance</label>
                            <input
                                type="number"
                                value={accountBalance}
                                onChange={(e) => setAccountBalance(Number(e.target.value))}
                                className="w-full bg-[#0a1628] text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500"
                                min="100"
                                step="100"
                            />
                        </div>
                    </div>
                </div>

                {/* Recommendation Panel */}
                <div className="bg-[#1a2332] rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">AI Recommendation</h3>

                    {currentRecommendation ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    {currentRecommendation.direction === 'LONG' ?
                                        <TrendingUp className="text-green-400" size={20} /> :
                                        <TrendingDown className="text-red-400" size={20} />
                                    }
                                    <span className={`font-bold ${currentRecommendation.direction === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                                        {currentRecommendation.direction} {currentRecommendation.leverage}x
                                    </span>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs ${getRiskColor(currentRecommendation.riskLevel)}`}>
                                    {currentRecommendation.riskLevel} RISK
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-gray-400">Entry Price</div>
                                    <div className="text-white font-medium">${currentRecommendation.entryPrice.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400">Position Size</div>
                                    <div className="text-white font-medium">${currentRecommendation.positionSize.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400">Stop Loss</div>
                                    <div className="text-red-400 font-medium">${currentRecommendation.stopLoss.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400">Take Profit</div>
                                    <div className="text-green-400 font-medium">${currentRecommendation.takeProfit.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400">Liquidation</div>
                                    <div className="text-orange-400 font-medium">${currentRecommendation.liquidationPrice.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400">Timeframe</div>
                                    <div className="text-white font-medium">{currentRecommendation.timeframe}</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Target className="text-blue-400" size={16} />
                                    <span className="text-sm text-gray-400">Confidence: {currentRecommendation.confidence}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${currentRecommendation.confidence}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm text-green-400 font-medium">Reasons to Enter:</div>
                                <ul className="text-xs text-gray-300 space-y-1">
                                    {currentRecommendation.reasonsToEnter.map((reason, i) => (
                                        <li key={i}>• {reason}</li>
                                    ))}
                                </ul>

                                {currentRecommendation.reasonsToAvoid.length > 0 && (
                                    <>
                                        <div className="text-sm text-red-400 font-medium">Reasons to Avoid:</div>
                                        <ul className="text-xs text-gray-300 space-y-1">
                                            {currentRecommendation.reasonsToAvoid.map((reason, i) => (
                                                <li key={i}>• {reason}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={executeTrade}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                            >
                                Execute Trade
                            </button>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            Generating recommendation...
                        </div>
                    )}
                </div>

                {/* Live Positions Panel */}
                <div className="bg-[#1a2332] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Live Positions</h3>
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isLiveTracking ? 'bg-green-400' : 'bg-gray-400'}`} />
                            <span className="text-sm text-gray-400">
                                {isLiveTracking ? 'Live Tracking' : 'No Active Positions'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {activePositions.length === 0 ? (
                            <div className="text-center text-gray-400 py-8">
                                No active positions
                            </div>
                        ) : (
                            activePositions.map((position) => (
                                <div key={position.id} className="bg-[#0a1628] rounded-lg p-3 border border-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            {position.direction === 'LONG' ?
                                                <TrendingUp className="text-green-400" size={16} /> :
                                                <TrendingDown className="text-red-400" size={16} />
                                            }
                                            <span className={`font-medium ${position.direction === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                                                {position.direction} {position.leverage}x
                                            </span>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs ${position.status === 'ACTIVE' ? 'bg-green-400/20 text-green-400' :
                                            position.status === 'CLOSED' ? 'bg-gray-400/20 text-gray-400' :
                                                'bg-red-400/20 text-red-400'
                                            }`}>
                                            {position.status}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <div className="text-gray-400">Entry</div>
                                            <div className="text-white">${position.entryPrice.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400">Current</div>
                                            <div className="text-white">${position.currentPrice.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400">P&L</div>
                                            <div className={`font-medium ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                ${position.pnl.toFixed(2)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400">P&L %</div>
                                            <div className={`font-medium ${position.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {position.pnlPercent.toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-2 text-xs text-gray-400">
                                        Liquidation: ${position.liquidationPrice.toLocaleString()}
                                    </div>

                                    {position.status === 'ACTIVE' && (
                                        <button
                                            onClick={() => closePosition(position.id)}
                                            className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded transition-colors"
                                        >
                                            Close Position
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default LeverageTradingAssistant;