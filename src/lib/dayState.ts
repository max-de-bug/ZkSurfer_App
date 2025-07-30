// // lib/dayState.ts
// type TradeRec = { id: string; pnl: number };
// interface DayState {
//     realizedPnl: number;
//     realizedLoss: number;
//     trades: TradeRec[];
// }
// let state: DayState = { realizedPnl: 0, realizedLoss: 0, trades: [] };

// /** Call when a trade is filled; pnl positive or negative */
// export function pushTrade(trade: TradeRec) {
//     if (state.trades.find(t => t.id === trade.id)) return;
//     state.trades.push(trade);
//     state.realizedPnl += trade.pnl;
//     if (trade.pnl < 0) state.realizedLoss += Math.abs(trade.pnl);
// }

// /** Get current day state */
// export function getDayState(): DayState {
//     return state;
// }

// lib/dayState.ts

// Updated TradeRec type with all the properties you want to track
type TradeRec = {
    id: string;
    pnl: number;
    side?: string;        // "LONG" | "SHORT" 
    size?: number;        // Position size
    avgPrice?: number;    // Average fill price
    leverage?: number;    // Leverage used
    timestamp?: number;   // When trade occurred
};

interface DayState {
    realizedPnl: number;
    realizedLoss: number;
    trades: TradeRec[];
}

let state: DayState = { realizedPnl: 0, realizedLoss: 0, trades: [] };

/** Call when a trade is filled; pnl positive or negative */
export function pushTrade(trade: TradeRec) {
    if (state.trades.find(t => t.id === trade.id)) return;
    state.trades.push(trade);
    state.realizedPnl += trade.pnl;
    if (trade.pnl < 0) state.realizedLoss += Math.abs(trade.pnl);
}

/** Get current day state */
export function getDayState(): DayState {
    return state;
}

/** Reset daily state (call at start of new day) */
export function resetDayState() {
    state = { realizedPnl: 0, realizedLoss: 0, trades: [] };
}

/** Get daily profit (positive PnL only) */
export function getDailyProfit(): number {
    return Math.max(0, state.realizedPnl);
}

/** Get daily loss (absolute value of negative PnL) */
export function getDailyLoss(): number {
    return state.realizedLoss;
}