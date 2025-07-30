// pages/api/hl/cron-order.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge'; // for Vercel cron

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
    const forecastRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/past-prediction`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });

    const { latest_forecast } = await forecastRes.json();
    const slot = latest_forecast?.[latest_forecast.length - 1]; // latest hour forecast

    if (!slot || slot.signal === 'HOLD') {
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

    return NextResponse.json({ success: true, trade: json });
  } catch (e: any) {
    console.error('❌ Cron Error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
