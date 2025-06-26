export interface PredictionHistory {
    id: string;
    asset: 'Bitcoin' | 'Ethereum' | 'Solana' | 'Cardano';
    direction: 'Long' | 'Short';
    entryPrice: number;
    exitPrice: number;
    targetPrice: number;
    status: 'Win' | 'Loss' | 'Active';
    timestamp: Date;
    pnl?: number;
}
