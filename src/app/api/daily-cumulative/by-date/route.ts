import { NextRequest, NextResponse } from 'next/server';

type Sym = 'BTC' | 'ETH' | 'SOL';
interface HourlyForecast {
  time: string;
  signal: 'LONG' | 'SHORT' | 'HOLD';
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  forecast_price: number;
  current_price: number;
}
interface BalanceSet { btc: number; eth: number; sol: number }
interface TradePnLResult { pnl?: number; pnlPercentage?: number; status: 'calculated' | 'pending' }
interface CumulativeResult {
  btc_ending_balance: number; eth_ending_balance: number; sol_ending_balance: number;
  btc_cumulative: number;     eth_cumulative: number;     sol_cumulative: number;
  portfolio_cumulative_pnl: number;
  total_trades: number; total_winning_trades: number; win_rate: number;
}
interface DatabasePayload extends CumulativeResult {
  date: string; timestamp: string;
}

const DC_BASE = 'https://zynapse.zkagi.ai/daily-cumulative';
const DC_GET  = `${DC_BASE}/get`;
const DC_API_KEY = process.env.DC_API_KEY || 'zk-123321';
const INTERNAL_API  = process.env.INTERNAL_API_URL!;          // your server that serves /api/past-prediction
const PUBLIC_API_KEY = process.env.NEXT_PUBLIC_API_KEY!;      // key for internal fetch

// ---- utils ----
const prevDate = (d: string) => {
  const dt = new Date(`${d}T00:00:00Z`); dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
};
const toISTDate = (iso: string) => {
  const nd = new Date(iso);
  const ist = new Date(nd.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const y = ist.getFullYear(), m = String(ist.getMonth() + 1).padStart(2, '0'), dd = String(ist.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

// ---- DB helpers ----
async function getRow(date: string) {
  const r = await fetch(`${DC_GET}?date=${encodeURIComponent(date)}`, {
    headers: { 'api-key': DC_API_KEY }, cache: 'no-store'
  });
  if (!r.ok) return null;
  const row = await r.json().catch(() => null);
  return row && typeof row === 'object' ? row : null;
}

async function postRow(payload: DatabasePayload) {
  const r = await fetch(DC_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': DC_API_KEY },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`DB write failed ${r.status}: ${await r.text()}`);
}

// ---- Forecasts (filter for the requested IST date only) ----
async function fetchForecastsForDate(date: string): Promise<Record<Sym, HourlyForecast[]>> {
  const r = await fetch(`${INTERNAL_API}/api/past-prediction`, {
    headers: { 'api-key': PUBLIC_API_KEY, 'Content-Type': 'application/json' }, cache: 'no-store'
  });
  if (!r.ok) throw new Error(`past-prediction failed: ${r.status}`);
  const data = await r.json();
  const all: Record<Sym, HourlyForecast[]> = {
    BTC: data?.forecast_hourly_last_30_days?.BTC ?? [],
    ETH: data?.forecast_hourly_last_30_days?.ETH ?? [],
    SOL: data?.forecast_hourly_last_30_days?.SOL ?? [],
  };
  const sameDay = (f: HourlyForecast) => toISTDate(f.time) === date;
  return { BTC: all.BTC.filter(sameDay), ETH: all.ETH.filter(sameDay), SOL: all.SOL.filter(sameDay) };
}

// ---- PnL math ----
function tradePnL(arr: HourlyForecast[], i: number): TradePnLResult {
  const cur = arr[i], next = arr[i + 1];
  if (!cur || !cur.entry_price) return { status: 'pending' };

  let exit = next?.current_price ?? cur.current_price;
  if (cur.signal === 'LONG') {
    if (cur.stop_loss && next && next.current_price <= cur.stop_loss) exit = cur.stop_loss;
    if (cur.take_profit && next && next.current_price >= cur.take_profit) exit = cur.take_profit;
  } else if (cur.signal === 'SHORT') {
    if (cur.stop_loss && next && next.current_price >= cur.stop_loss) exit = cur.stop_loss;
    if (cur.take_profit && next && next.current_price <= cur.take_profit) exit = cur.take_profit;
  }

  const pnl = cur.signal === 'LONG' ? (exit - cur.entry_price) : (cur.entry_price - exit);
  const pct = (pnl / cur.entry_price) * 100;
  return { pnl, pnlPercentage: pct, status: 'calculated' };
}

function calcDay(forecasts: Record<Sym, HourlyForecast[]>, date: string, start: BalanceSet): CumulativeResult {
  const syms: Sym[] = ['BTC', 'ETH', 'SOL'];
  let totalPnL = 0, trades = 0, wins = 0;

  const res: CumulativeResult = {
    btc_ending_balance: start.btc, eth_ending_balance: start.eth, sol_ending_balance: start.sol,
    btc_cumulative: 0, eth_cumulative: 0, sol_cumulative: 0,
    portfolio_cumulative_pnl: 0, total_trades: 0, total_winning_trades: 0, win_rate: 0,
  };

  for (const sym of syms) {
    const hours = forecasts[sym] || [];
    let bal = start[sym.toLowerCase() as keyof BalanceSet] as number;
    let symPnL = 0;

    for (let i = 0; i < hours.length; i++) {
      const f = hours[i];
      if (f.signal === 'HOLD' || !f.entry_price) continue;
      const t = tradePnL(hours, i);
      if (t.status === 'calculated' && t.pnlPercentage !== undefined && t.pnl !== undefined) {
        trades++;
        const delta = bal * (t.pnlPercentage / 100);
        bal += delta;
        symPnL += t.pnl;
        if (t.pnl > 0) wins++;
      }
    }

    (res as any)[`${sym.toLowerCase()}_ending_balance`] = bal;
    (res as any)[`${sym.toLowerCase()}_cumulative`] = symPnL;
    totalPnL += symPnL;
  }

  res.portfolio_cumulative_pnl = totalPnL;
  res.total_trades = trades;
  res.total_winning_trades = wins;
  res.win_rate = trades ? (wins / trades) * 100 : 0;
  return res;
}

// ---- Route: POST /api/daily-cumulative/by-date ----
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { date, overwrite }: { date?: string; overwrite?: boolean } = await req.json().catch(() => ({}));
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ success: false, message: 'Provide { "date": "YYYY-MM-DD" }' }, { status: 400 });
    }

    // Idempotency
    if (!overwrite) {
      const existing = await getRow(date);
      if (existing) {
        return NextResponse.json({ success: true, message: `Row for ${date} already exists`, skipped: true });
      }
    }

    // 1) Get previous day's row and use *_ending_balance as starting balances
    const prev = await getRow(prevDate(date));
    const start: BalanceSet = {
      btc: Number(prev?.btc_ending_balance) || 100,
      eth: Number(prev?.eth_ending_balance) || 100,
      sol: Number(prev?.sol_ending_balance) || 100,
    };

    // 2) Fetch forecasts for that exact IST day
    const forecasts = await fetchForecastsForDate(date);
    if (!forecasts.BTC.length && !forecasts.ETH.length && !forecasts.SOL.length) {
      return NextResponse.json({ success: false, message: `No forecasts for ${date}` }, { status: 404 });
    }

    // 3) Compute and 4) Write to DB
    const res = calcDay(forecasts, date, start);
    const payload: DatabasePayload = {
      date,
      timestamp: `${date}T12:30:00.000Z`, // keep your convention
      ...res,
    };

    await postRow(payload);
    return NextResponse.json({ success: true, date, startBalances: start, payload });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'by-date failed', error: e?.message || String(e) }, { status: 500 });
  }
}
