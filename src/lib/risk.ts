// lib/risk.ts
export interface RiskCfg {
    dailyStartEquity: number; // e.g. 1000
    maxPerTradeUsd: number;   // 0.35 * equity
    maxTradeLossUsd: number;  // 30
    maxDayLossUsd: number;    // 150
}

/** cap notional to 35% of equity */
export function calcSizeUSD(equityUsd: number, cfg: RiskCfg): number {
    return Math.min(cfg.maxPerTradeUsd, 0.35 * equityUsd);
}

/** convert $ notional → coin size, rounding to lot */
export function calcCoinSize(
    notionalUsd: number,
    px: number,
    lotSize: number,
    minLot: number
): string {
    const raw = notionalUsd / px;
    const lots = Math.max(
        Math.floor(raw / lotSize),
        Math.ceil(minLot / lotSize)
    );
    return (lots * lotSize).toFixed(5);
}

/** compute SL price so that max $ loss = lossUsd */
export function stopFromDollarLoss(
    entry: number,
    size: number,
    lossUsd: number,
    isLong: boolean
): number {
    const move = lossUsd / size; // dollars per coin
    return isLong ? entry - move : entry + move;
}
