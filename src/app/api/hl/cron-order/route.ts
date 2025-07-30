import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Required for Vercel cron jobs

const BASE_USD_CAP = 500;
const LOT_SIZE = 0.00001;
const MIN_ORDER_SIZE = 0.0001;

function roundLot(x: number) {
    const lots = Math.max(Math.floor(x / LOT_SIZE), Math.ceil(MIN_ORDER_SIZE / LOT_SIZE));
    return lots * LOT_SIZE;
}

function calcSize(price: number, leverage: number, availableMargin: number = 1000) {
    const maxNotional = availableMargin * leverage;
    const strategyNotional = Math.min(BASE_USD_CAP * leverage, maxNotional);
    return roundLot(strategyNotional / price).toFixed(5);
}

function calculateDynamicLeverage(profit: number, loss: number, confidence?: number) {
    const baseLeverage = 10;
    if (profit >= 80) return 5;
    if (loss >= 100) return 3;
    if (profit >= 40 && loss <= 20) return 15;
    if (loss <= 30) return baseLeverage;
    if (loss >= 50 && loss < 100) return 7;
    return baseLeverage;
}

export async function GET() {
    try {
        // ✅ Fetch today's hourly prediction
        const forecastRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/today-prediction`, {
            method: "GET",
            cache: 'no-store',
            headers: {
                'Cache-Control': "no-cache,no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0"
            }
        });

        const forecastJson = await forecastRes.json();
        console.log('📊 [Forecast Response]', JSON.stringify(forecastJson, null, 2));

        const { forecast_today_hourly } = forecastJson;

        // ✅ Get latest forecast (last entry)
        const slot = Array.isArray(forecast_today_hourly) && forecast_today_hourly.length > 0
            ? forecast_today_hourly[forecast_today_hourly.length - 1]
            : null;

        console.log('🕐 [Latest Hourly Forecast Slot]', JSON.stringify(slot, null, 2));

        // ✅ Validate signal
        if (
            !slot ||
            slot.signal === 'HOLD' ||
            !slot.entry_price ||
            !slot.forecast_price ||
            typeof slot.signal !== 'string'
        ) {
            console.warn('⚠️ No valid trade signal found. Skipping...');
            return NextResponse.json({ message: 'No trade signal' });
        }

        const price = Math.round(slot.forecast_price);
        const leverage = calculateDynamicLeverage(0, 0, slot.confidence_90?.[1]);
        const size = calcSize(price, leverage);

        const payload = {
            asset: 0,
            side: slot.signal,
            price,
            size,
            leverage,
            takeProfit: slot.take_profit ? Math.round(Number(slot.take_profit)) : undefined,
            stopLoss: slot.stop_loss ? Math.round(Number(slot.stop_loss)) : undefined
        };

        // ✅ Place the trade
        const orderRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/hl/order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const json = await orderRes.json();

        if (!orderRes.ok) {
            console.error('❌ Order failed', json);
            return NextResponse.json({ error: json.error }, { status: 500 });
        }

        // ✅ Return full detail
        return NextResponse.json({
            success: true,
            message: 'Trade successfully placed',
            timestamp: new Date().toISOString(),
            payload,
            orderResponse: json
        });

    } catch (e: any) {
        console.error('❌ Cron Error:', e.message);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
