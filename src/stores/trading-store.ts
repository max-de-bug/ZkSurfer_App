import { create } from 'zustand'
import { TradingStore, CandlestickData, ChartData } from '../types/trading'

const initialCandlestickData: CandlestickData[] = [
    { time: '12', open: 37800, high: 38000, low: 37600, close: 37900, volume: 1200 },
    { time: '13', open: 37900, high: 38300, low: 37800, close: 38200, volume: 1500 },
    { time: '16', open: 38200, high: 38600, low: 38100, close: 38500, volume: 1800 },
    { time: '17', open: 38500, high: 38700, low: 38200, close: 38300, volume: 1300 },
    { time: '21', open: 38300, high: 38800, low: 38200, close: 38700, volume: 1600 },
    { time: '23', open: 38700, high: 38900, low: 38400, close: 38500, volume: 1400 },
    { time: '25', open: 38500, high: 38500, low: 38500, close: 38500, volume: 1000 },
];

const initialChartData: ChartData[] = [
    { time: '09:00', price: 37800 },
    { time: '10:00', price: 38200 },
    { time: '11:00', price: 38500 },
    { time: '12:00', price: 38300 },
    { time: '13:00', price: 38700 },
    { time: '14:00', price: 38500 },
    { time: '15:00', price: 38500 },
];

export const useTradingStore = create<TradingStore>((set, get) => ({
    // Current asset data
    currentAsset: 'Bitcoin',
    currentPrice: 38500,

    // Prediction state
    prediction: {
        direction: 'Long',
        entryPrice: 38500,
        stopLoss: 38000,
        takeProfit: 41500,
        isActive: false
    },

    // Chart data
    chartData: initialChartData,
    candlestickData: initialCandlestickData,

    // Actions
    setPrediction: (prediction) => set({ prediction }),

    setDirection: (direction) => set((state) => ({
        prediction: { ...state.prediction, direction }
    })),

    setEntryPrice: (entryPrice) => set((state) => ({
        prediction: { ...state.prediction, entryPrice: parseFloat(entryPrice) || 0 }
    })),

    setStopLoss: (stopLoss) => set((state) => ({
        prediction: { ...state.prediction, stopLoss: parseFloat(stopLoss) || 0 }
    })),

    setTakeProfit: (takeProfit) => set((state) => ({
        prediction: { ...state.prediction, takeProfit: parseFloat(takeProfit) || 0 }
    })),

    placePrediction: () => set((state) => ({
        prediction: { ...state.prediction, isActive: true }
    })),

    resetPrediction: () => set((state) => ({
        prediction: {
            ...state.prediction,
            isActive: false,
            entryPrice: state.currentPrice,
            stopLoss: state.currentPrice * 0.95,
            takeProfit: state.currentPrice * 1.05
        }
    }))
}))