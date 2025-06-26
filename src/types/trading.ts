export interface CandlestickData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface ChartData {
    time: string;
    price: number;
}

export interface Prediction {
    direction: 'Long' | 'Short';
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    isActive: boolean;
}

export interface TradingState {
    currentAsset: string;
    currentPrice: number;
    prediction: Prediction;
    chartData: ChartData[];
    candlestickData: CandlestickData[];
}

export interface TradingActions {
    setPrediction: (prediction: Prediction) => void;
    setDirection: (direction: 'Long' | 'Short') => void;
    setEntryPrice: (entryPrice: string) => void;
    setStopLoss: (stopLoss: string) => void;
    setTakeProfit: (takeProfit: string) => void;
    placePrediction: () => void;
    resetPrediction: () => void;
}

export type TradingStore = TradingState & TradingActions;