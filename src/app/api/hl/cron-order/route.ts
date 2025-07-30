// pages/api/hl/cron-order.ts
import { NextResponse } from 'next/server';
import { Hyperliquid, Tif } from 'hyperliquid';
import { getDayState, pushTrade } from '@/lib/dayState';

export const runtime = 'nodejs';  // must be Node.js for the SDK

// ——— SDK Configuration ————————————————————————————————————————————————
const PK = process.env.NEXT_PUBLIC_HL_PRIVATE_KEY;
const MAIN_WALLET = process.env.NEXT_PUBLIC_HL_MAIN_WALLET;
if (!PK) throw new Error('HL_PRIVATE_KEY missing in env');
if (!MAIN_WALLET) throw new Error('HL_MAIN_WALLET missing in env');

const sdk = new Hyperliquid({
    privateKey: PK,
    walletAddress: MAIN_WALLET,
    testnet: false
});

// ——— Helpers ———————————————————————————————————————————————————————————
const BASE_USD_CAP = 500;
const LOT_SIZE = 0.00001;
const MIN_ORDER_SIZE = 0.0001;

function roundLot(x: number) {
    const lots = Math.max(
        Math.floor(x / LOT_SIZE),
        Math.ceil(MIN_ORDER_SIZE / LOT_SIZE)
    );
    return lots * LOT_SIZE;
}

function calcSize(price: number, leverage: number, availableMargin = 1000) {
    const maxNotional = availableMargin * leverage;
    const strategyNotional = Math.min(BASE_USD_CAP * leverage, maxNotional);
    return roundLot(strategyNotional / price).toFixed(5);
}

function calculateDynamicLeverage(profit: number, loss: number, confidence?: number) {
    const base = 10;
    if (profit >= 80) return 5;
    if (loss >= 100) return 3;
    if (profit >= 40 && loss <= 20) return 15;
    if (loss <= 30) return base;
    if (loss >= 50 && loss < 100) return 7;
    return base;
}

// ——— Cron Handler —————————————————————————————————————————————————————
export async function GET() {
    try {
        // 1️⃣ Fetch the forecast directly from your Python backend
        const apiKey = process.env.NEXT_PUBLIC_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'NEXT_PUBLIC_API_KEY not defined' },
                { status: 500 }
            );
        }

        const forecastRes = await fetch('https://zynapse.zkagi.ai/today', {
            method: 'GET',
            cache: 'no-store',
            headers: {
                accept: 'application/json',
                'api-key': apiKey
            }
        });
        if (!forecastRes.ok) {
            const txt = await forecastRes.text();
            console.error('Forecast API error:', txt);
            return NextResponse.json(
                { error: `Forecast API error (${forecastRes.status})` },
                { status: forecastRes.status }
            );
        }

        const { forecast_today_hourly } = await forecastRes.json();


        // 2️⃣ Pick the latest hourly slot
        const slot = Array.isArray(forecast_today_hourly) && forecast_today_hourly.length > 0
            ? forecast_today_hourly[forecast_today_hourly.length - 1]
            : null;
        console.log('📊 [Forecast Response]', JSON.stringify(slot, null, 2));

        if (
            !slot ||
            slot.signal === 'HOLD' ||
            slot.forecast_price == null ||
            typeof slot.signal !== 'string'
        ) {
            console.warn('⚠️ No valid trade signal. Skipping.');
            return NextResponse.json({ message: 'No trade signal' });
        }

        // 3️⃣ Compute size & leverage
        const dayState = getDayState();
        const price = Math.round(slot.forecast_price);
        const leverage = calculateDynamicLeverage(
            Math.max(0, dayState.realizedPnl),
            dayState.realizedLoss,
            slot.confidence_90?.[1]
        );
        const size = calcSize(price, leverage);

        // 4️⃣ Build the SDK order params
        const coin = 'BTC-PERP';
        const isBuy = slot.signal === 'LONG';
        const orderParams = {
            coin,
            is_buy: isBuy,
            sz: Number(size),
            limit_px: price,
            order_type: { limit: { tif: 'Gtc' as Tif } },
            reduce_only: false,
            ...(slot.take_profit != null && { tp: Number(slot.take_profit) }),
            ...(slot.stop_loss != null && { sl: Number(slot.stop_loss) })
        };

        console.log('📤 Placing order with params:', orderParams);

        // 5️⃣ Place the order via the Hyperliquid SDK
        const result = await sdk.exchange.placeOrder(orderParams);
        console.log('📥 [SDK Response]', JSON.stringify(result, null, 2));
        if (result.status === 'err') {
            throw new Error(`SDK order error: ${result.response}`);
        }

        // 6️⃣ Track any fills
        const statuses = result.response.data.statuses ?? [];
        statuses.forEach((s: { filled: { avgPx: any; totalSz: any; oid: any; }; }) => {
            if ('filled' in s && s.filled) {
                const { avgPx, totalSz, oid } = s.filled;
                const pnl = (isBuy ? avgPx - price : price - avgPx) * totalSz;
                pushTrade({
                    id: String(oid),
                    pnl,
                    side: slot.signal,
                    size: totalSz,
                    avgPrice: avgPx,
                    leverage,
                    timestamp: Date.now()
                });
            }
        });

        // 7️⃣ Return success
        // return NextResponse.json({
        const payload = {
            success: true,
            timestamp: new Date().toISOString(),
            forecastSlot: slot,
            payload: { asset: 0, side: slot.signal, price, size, leverage },
            sdkResponse: result
        };

        console.log('📤 [Returning Payload]', JSON.stringify(payload, null, 2));
        return NextResponse.json(payload);

    } catch (err: any) {
        console.error('❌ Cron order error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
