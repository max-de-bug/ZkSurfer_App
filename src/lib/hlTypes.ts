// src/lib/hlTypes.ts
export type PlaceOrderBody = {
  asset: number;
  side: 'LONG' | 'SHORT' | 'HOLD';
  price: number;      // entry limit price
  size: string;       // "0.1"
  takeProfit?: number | null; // TP trigger price
  stopLoss?: number | null;   // SL trigger price
};
