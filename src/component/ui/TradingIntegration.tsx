// src/components/TradingIntegration.tsx
import React, { useEffect } from 'react';
import { placeTestOrder, getOrderStatus } from '@/lib/hyperLiquidClient';

export interface Trade {
    id: string;
    timestamp: number;
    signal: 'LONG' | 'SHORT' | 'HOLD';
    entryPrice: number;
    exitPrice?: number;
    pnl?: number;
    pnlPercentage?: number;
    status: 'open' | 'closed';
}

interface Props {
    hourlyForecast: Array<{ time: string; signal: 'LONG' | 'SHORT' | 'HOLD'; forecast_price: number }>;
    onTradesUpdate: (trades: Trade[]) => void;
}

export const TradingIntegration: React.FC<Props> = ({ hourlyForecast, onTradesUpdate }) => {
    const [trades, setTrades] = React.useState<Trade[]>([]);

    // 2.1 Schedule at top of every UTC hour
    useEffect(() => {
        let timer: NodeJS.Timeout;

        const scheduleNextUTC = () => {
            const now = new Date();
            const msLeft =
                (60 - now.getUTCMinutes()) * 60_000 -
                now.getUTCSeconds() * 1_000 -
                now.getUTCMilliseconds();

            timer = setTimeout(async () => {
                // pick forecast for the next UTC hour
                const targetHour = (now.getUTCHours() + 1) % 24;
                const slot = hourlyForecast.find(h =>
                    new Date(h.time).getUTCHours() === targetHour
                );

                if (slot && slot.signal !== 'HOLD') {
                    try {
                        const { response } = await placeTestOrder(
              /* asset=10000 */ 10000,
                            slot.signal === 'LONG',
                            slot.forecast_price.toString(),
              /* size=0.1 */ '0.1'
                        );
                        const oid = response.response.data.statuses[0].resting.oid;
                        const newTrade: Trade = {
                            id: String(oid),
                            timestamp: Date.now(),
                            signal: slot.signal,
                            entryPrice: slot.forecast_price,
                            status: 'open'
                        };
                        setTrades(ts => [...ts, newTrade]);
                    } catch (e) {
                        console.error('Order error', e);
                    }
                }

                scheduleNextUTC();
            }, msLeft);
        };

        scheduleNextUTC();
        return () => clearTimeout(timer);
    }, [hourlyForecast]);

    // 2.2 Poll for fills every minute
    useEffect(() => {
        const iv = setInterval(() => {
            trades
                .filter(t => t.status === 'open')
                .forEach(async t => {
                    try {
                        const upd = await getOrderStatus(Number(t.id));
                        if (upd.filled) {
                            const exit = upd.fillPrice!;
                            const pnl = t.signal === 'LONG'
                                ? exit - t.entryPrice
                                : t.entryPrice - exit;
                            const pct = (pnl / t.entryPrice) * 100;

                            setTrades(ts => ts.map(x =>
                                x.id === t.id
                                    ? { ...x, exitPrice: exit, pnl, pnlPercentage: pct, status: 'closed' }
                                    : x
                            ));
                        }
                    } catch {/* timeout or ws error */ }
                });
        }, 60_000);

        return () => clearInterval(iv);
    }, [trades]);

    // 2.3 Lift trades up
    useEffect(() => {
        onTradesUpdate(trades);
    }, [trades, onTradesUpdate]);

    return null; // purely logic—no UI
};
