// 'use client'

// import React, { useEffect, useMemo, useState } from 'react'
// import useSWR from 'swr'
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   AreaChart,
//   Area,
// } from 'recharts'
// import { TrendingDown, TrendingUp, Maximize2, X } from 'lucide-react'

// // -------------------------------------------------------------
// // Types
// // -------------------------------------------------------------
// type TimeFrame = 'daily' | 'monthly' | 'all-time'

// interface PnLData {
//   timestamp: string
//   value: number
//   percentage?: number
// }

// interface TokenTradeData {
//   day: number
//   date: string
//   trades: number
//   dailyPnLPercent: number
//   startBalance: number
//   endBalance: number
//   dailyGain: number
//   cumulativeReturn: number
// }

// interface TokenData {
//   symbol: string
//   price: number
//   cumulativePnL: number
//   cumulativePercent: number
//   volume: number
//   trades: TokenTradeData[]
//   totalCumulativePnL?: number // Total cumulative from API
// }

// // Prediction API types
// interface HourlyForecast {
//   time: string
//   signal: 'LONG' | 'SHORT'
//   entry_price: number
//   stop_loss: number
//   take_profit: number
//   forecast_price: number
//   current_price: number
//   deviation_percent: number
//   accuracy_percent: number
//   risk_reward_ratio: number
//   sentiment_score: number
//   confidence_50: [number, number]
//   confidence_80: [number, number]
//   confidence_90: [number, number]
// }

// interface PredictionAPIResponse {
//   forecast_today_hourly: Record<string, HourlyForecast[]>
// }

// // -------------------------------------------------------------
// // External DB endpoints
// // -------------------------------------------------------------
// const DB_BASE = 'https://zynapse.zkagi.ai/daily-cumulative'
// const DB_ALL_URL = `${DB_BASE}/all`
// const DB_MONTH_URL = `${DB_BASE}/month`
// const DB_GET_URL = `${DB_BASE}/get`
// const DB_API_KEY = 'zk-123321'

// // -------------------------------------------------------------
// // Helpers (IST date/time, normalizers, pivot)
// // -------------------------------------------------------------
// const IST = 'Asia/Kolkata'

// const istNow = () => new Date(new Date().toLocaleString('en-US', { timeZone: IST }))
// const istYYYYMMDD = (d: Date) => {
//   const y = d.getFullYear()
//   const m = String(d.getMonth() + 1).padStart(2, '0')
//   const day = String(d.getDate()).padStart(2, '0')
//   return `${y}-${m}-${day}`
// }
// const istMonthMM = (d = istNow()) => String(d.getMonth() + 1).padStart(2, '0')

// type RawRow = Record<string, any>

// const numberish = (...c: any[]) => {
//   for (const x of c) {
//     if (typeof x === 'number' && !Number.isNaN(x)) return x
//     if (typeof x === 'string' && x.trim() !== '' && !Number.isNaN(+x)) return +x
//   }
//   return undefined
// }

// const TOKENS_DEF = [
//   { key: 'btc', sym: 'BTC' },
//   { key: 'eth', sym: 'ETH' },
//   { key: 'sol', sym: 'SOL' },
// ]

// // Turn API records into TokenData[] with proper starting balances
// function pivotPortfolioRecordsToTokens(
//   rows: RawRow[], 
//   startBalances?: Record<'BTC'|'ETH'|'SOL', number>
// ): TokenData[] {
//   const sorted = [...rows].sort(
//     (a, b) => new Date(a.date ?? a.timestamp ?? 0).getTime() - new Date(b.date ?? b.timestamp ?? 0).getTime(),
//   )

//   return TOKENS_DEF.map(({ key, sym }) => {
//     const trades: TokenTradeData[] = sorted.map((r, idx) => {
//       const endBalance = numberish(r[`${key}_ending_balance`]) ?? 100
//       const tokenCumulative = numberish(r[`${key}_cumulative`]) ?? 0
      
//       // Calculate start balance
//       let startBalance: number
//       if (idx === 0) {
//         // First record: use provided start balance or default to 100
//         startBalance = startBalances?.[sym as 'BTC'|'ETH'|'SOL'] ?? 100
//       } else {
//         // Subsequent records: use previous day's end balance
//         const prevRecord = sorted[idx - 1]
//         startBalance = numberish(prevRecord[`${key}_ending_balance`]) ?? 100
//       }
      
//       const dailyGain = endBalance - startBalance
//       const dailyPct = startBalance !== 0 ? (dailyGain / startBalance) * 100 : 0
      
//       // For monthly/all-time, cumulative return is based on original 100 investment
//       // For this period's calculation, it's based on the period start
//       const periodStartBalance = startBalances?.[sym as 'BTC'|'ETH'|'SOL'] ?? 100
//       const cumulativeReturn = ((endBalance - periodStartBalance) / periodStartBalance) * 100

//       const t = new Date(r.date ?? r.timestamp ?? new Date())
//       const label = t.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: IST })

//       return {
//         day: idx + 1,
//         date: label,
//         trades: Math.max(1, Math.floor(numberish(r.total_trades) ?? 1)),
//         dailyPnLPercent: dailyPct,
//         startBalance: startBalance,
//         endBalance: endBalance,
//         dailyGain: dailyGain,
//         cumulativeReturn: cumulativeReturn,
//       }
//     })

//     const last = trades[trades.length - 1]
//     const lastRow = sorted[sorted.length - 1]
//     const periodStartBalance = startBalances?.[sym as 'BTC'|'ETH'|'SOL'] ?? 100
    
//     // Get total cumulative PnL from API
//     const totalCumulativePnL = numberish(lastRow?.[`${key}_cumulative`]) ?? 0
    
//     return {
//       symbol: sym,
//       price: 0,
//       cumulativePnL: last ? last.endBalance - periodStartBalance : 0,
//       cumulativePercent: last ? ((last.endBalance - periodStartBalance) / periodStartBalance) * 100 : 0,
//       volume: 0,
//       trades,
//       totalCumulativePnL, // Total cumulative from start of trading
//     }
//   })
// }

// // Aggregate chart from per-token trades (sum daily gains)
// function aggregateChartFromTokens(tokens: TokenData[], from?: Date, to?: Date): PnLData[] {
//   const sums = new Map<string, number>()
//   tokens.forEach((t) =>
//     t.trades.forEach((tr) => {
//       sums.set(tr.date, (sums.get(tr.date) || 0) + tr.dailyGain)
//     }),
//   )

//   // If a fixed day range is given, iterate day-by-day in IST
//   if (from && to) {
//     const out: PnLData[] = []
//     const d = new Date(from)
//     while (d <= to) {
//       const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: IST })
//       const ts = new Date(
//         new Date(d.toLocaleString('en-US', { timeZone: IST })).toISOString(),
//       ).toISOString()
//       out.push({ timestamp: ts, value: sums.get(label) ?? 0 })
//       d.setDate(d.getDate() + 1)
//     }
//     return out
//   }

//   // Otherwise just map known labels to a rough timestamp (this year)
//   const year = istNow().getFullYear()
//   return Array.from(sums.entries()).map(([label, v]) => {
//     const parsed = new Date(`${label} ${year}`)
//     return { timestamp: isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString(), value: v }
//   })
// }

// // Convert forecast data to hourly trades with proper chaining of balances
// function convertForecastToHourlyTrades(
//   fth: Record<string, HourlyForecast[]>,
//   prevBalances: Record<'BTC'|'ETH'|'SOL', number>
// ): TokenData[] {
//   const symbols = ['BTC', 'ETH', 'SOL'] as const
  
//   return symbols.map((sym) => {
//     const rows = fth[sym] ?? []
//     const dayStartBalance = prevBalances[sym] ?? 100 // Yesterday's final balance
    
//     // FIXED: Build trades array iteratively to avoid scope issues
//     const trades: TokenTradeData[] = []
//     let currentBalance = dayStartBalance // Track balance as we go
    
//     rows.forEach((row, idx) => {
//       // Calculate hourly return
//       const ret = (row.forecast_price - row.entry_price) / (row.entry_price || 1)
      
//       // Start balance is the current running balance
//       const startBalance = currentBalance
//       const end = startBalance * (1 + ret)
//       const gain = end - startBalance
      
//       // Update current balance for next iteration
//       currentBalance = end
      
//       // Cumulative return is relative to day's starting point
//       const cumulativeReturn = ((end - dayStartBalance) / dayStartBalance) * 100
      
//       const t = new Date(row.time)
//       const label = t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      
//       trades.push({
//         day: idx + 1,
//         date: label,
//         trades: 1,
//         dailyPnLPercent: ret * 100, // This hour's return percentage
//         startBalance: startBalance,
//         endBalance: end,
//         dailyGain: gain, // This hour's gain/loss in dollars
//         cumulativeReturn, // Cumulative return since start of day
//       })
//     })
    
//     const lastPrice = rows.length ? rows[rows.length - 1].current_price : 0
//     const last = trades[trades.length - 1]
    
//     return {
//       symbol: sym,
//       price: lastPrice,
//       cumulativePnL: last ? last.endBalance - dayStartBalance : 0,
//       cumulativePercent: last ? last.cumulativeReturn : 0,
//       volume: 0,
//       trades,
//     }
//   })
// }

// // -------------------------------------------------------------
// // External DB fetchers (updated to use real API)
// // -------------------------------------------------------------
// async function fetchAllTimeFromDB(): Promise<{ tokens: TokenData[]; chart: PnLData[] }> {
//   try {
//     const r = await fetch(DB_ALL_URL, {
//       method: 'GET',
//       cache: 'no-store',
//       headers: { 'api-key': DB_API_KEY },
//     })
//     if (!r.ok) throw new Error(`HTTP ${r.status}`)
//     const json = await r.json()
//     const rows: RawRow[] = Array.isArray(json) ? json : (json?.records || json?.data || json?.items || [])
    
//     if (!Array.isArray(rows) || rows.length === 0) {
//       throw new Error('No data received from API')
//     }
    
//     const tokens = pivotPortfolioRecordsToTokens(rows)
//     const chart = aggregateChartFromTokens(tokens)
//     return { tokens, chart }
//   } catch (e) {
//     console.error('fetchAllTimeFromDB error:', e)
//     throw e
//   }
// }

// // Get the last day of previous month's ending balances
// async function fetchPrevMonthEndBalances(): Promise<Record<'BTC'|'ETH'|'SOL', number>> {
//   const now = istNow()
//   const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
//   const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
//   const date = istYYYYMMDD(lastDayOfPrevMonth)
  
//   try {
//     const r = await fetch(`${DB_GET_URL}?date=${encodeURIComponent(date)}`, {
//       method: 'GET',
//       cache: 'no-store',
//       headers: { 'api-key': DB_API_KEY },
//     })
//     if (!r.ok) throw new Error(`HTTP ${r.status}`)
//     const row = await r.json() as RawRow
//     return {
//       BTC: numberish(row.btc_ending_balance) ?? 100,
//       ETH: numberish(row.eth_ending_balance) ?? 100,
//       SOL: numberish(row.sol_ending_balance) ?? 100,
//     }
//   } catch (e) {
//     console.error('fetchPrevMonthEndBalances error:', e)
//     return { BTC: 100, ETH: 100, SOL: 100 }
//   }
// }

// async function fetchMonthlyFromDB(): Promise<{ tokens: TokenData[]; chart: PnLData[] }> {
//   const mm = istMonthMM()
//   const monthUrl = `${DB_MONTH_URL}?month=${encodeURIComponent(mm)}`
//   const nowI = istNow()
//   const start = new Date(nowI.getFullYear(), nowI.getMonth(), 1)
//   const end = new Date(nowI.getFullYear(), nowI.getMonth(), nowI.getDate())

//   try {
//     // Get previous month's ending balances first
//     const prevMonthBalances = await fetchPrevMonthEndBalances()
//     console.log('Previous month ending balances:', prevMonthBalances)

//     const r = await fetch(monthUrl, {
//       method: 'GET',
//       cache: 'no-store',
//       headers: { 'api-key': DB_API_KEY },
//     })
//     if (!r.ok) throw new Error(`HTTP ${r.status}`)
//     const json = await r.json()
//     const rows: RawRow[] = Array.isArray(json) ? json : (json?.records || json?.data || json?.items || [])
    
//     if (!Array.isArray(rows) || rows.length === 0) {
//       // Fallback: filter /all to the current IST month
//       const allData = await fetchAllTimeFromDB()
//       const currentMonth = istMonthMM()
//       const filteredRows = allData.tokens.length > 0 ? 
//         (allData.tokens[0]?.trades || [])
//           .map((_, i) => {
//             const anyToken = allData.tokens[0]
//             const tradeData = anyToken?.trades[i]
//             if (!tradeData) return null
            
//             // Parse the date from the trade to check if it's current month
//             const label = tradeData.date
//             const parsed = new Date(`${label} ${istNow().getFullYear()}`)
//             const m = String(parsed.getMonth() + 1).padStart(2, '0')
            
//             if (m !== currentMonth) return null
            
//             // Create synthetic row from trade data
//             const row: RawRow = {
//               date: parsed.toISOString(),
//               btc_ending_balance: allData.tokens.find(t => t.symbol === 'BTC')?.trades[i]?.endBalance,
//               eth_ending_balance: allData.tokens.find(t => t.symbol === 'ETH')?.trades[i]?.endBalance,
//               sol_ending_balance: allData.tokens.find(t => t.symbol === 'SOL')?.trades[i]?.endBalance,
//               total_trades: tradeData.trades,
//             }
//             return row
//           })
//           .filter(Boolean) as RawRow[]
//         : []
        
//       if (filteredRows.length === 0) {
//         throw new Error('No monthly data available')
//       }
      
//       const tokens = pivotPortfolioRecordsToTokens(filteredRows, prevMonthBalances)
//       const chart = aggregateChartFromTokens(tokens, start, end)
//       return { tokens, chart }
//     }
    
//     const tokens = pivotPortfolioRecordsToTokens(rows, prevMonthBalances)
//     const chart = aggregateChartFromTokens(tokens, start, end)
//     return { tokens, chart }
//   } catch (e) {
//     console.error('fetchMonthlyFromDB error:', e)
//     throw e
//   }
// }

// // Daily: fetch yesterday's ending balances (IST) for BTC/ETH/SOL
// async function fetchPrevDayStartBalances(): Promise<Record<'BTC'|'ETH'|'SOL', number>> {
//   const y = istNow()
//   y.setDate(y.getDate() - 1)
//   const date = istYYYYMMDD(y)
//   try {
//     const r = await fetch(`${DB_GET_URL}?date=${encodeURIComponent(date)}`, {
//       method: 'GET',
//       cache: 'no-store',
//       headers: { 'api-key': DB_API_KEY },
//     })
//     if (!r.ok) throw new Error(`HTTP ${r.status}`)
//     const row = await r.json() as RawRow
//     return {
//       BTC: numberish(row.btc_ending_balance) ?? 100,
//       ETH: numberish(row.eth_ending_balance) ?? 100,
//       SOL: numberish(row.sol_ending_balance) ?? 100,
//     }
//   } catch (e) {
//     console.error('fetchPrevDayStartBalances error:', e)
//     return { BTC: 100, ETH: 100, SOL: 100 }
//   }
// }

// // Get latest data for cumulative totals
// // async function fetchLatestCumulativeTotals(): Promise<Record<'BTC'|'ETH'|'SOL', number> & { portfolio: number }> {
// //   const yesterday = istNow()
// //   yesterday.setDate(yesterday.getDate() - 1)
// //   const date = istYYYYMMDD(yesterday)
  
// //   try {
// //     const r = await fetch(`${DB_GET_URL}?date=${encodeURIComponent(date)}`, {
// //       method: 'GET',
// //       cache: 'no-store',
// //       headers: { 'api-key': DB_API_KEY },
// //     })
// //     if (!r.ok) throw new Error(`HTTP ${r.status}`)
// //     const row = await r.json() as RawRow
// //     return {
// //       BTC: numberish(row.btc_cumulative) ?? 0,
// //       ETH: numberish(row.eth_cumulative) ?? 0,
// //       SOL: numberish(row.sol_cumulative) ?? 0,
// //       portfolio: numberish(row.portfolio_cumulative_pnl) ?? 0,
// //     }
// //   } catch (e) {
// //     console.error('fetchLatestCumulativeTotals error:', e)
// //     return { BTC: 0, ETH: 0, SOL: 0, portfolio: 0 }
// //   }
// // }

// // Find the latest non-empty ending balance for a given key across all rows
// function latestEndingBalance(rows: RawRow[], key: 'btc'|'eth'|'sol'): number {
//   for (let i = rows.length - 1; i >= 0; i--) {
//     const v = numberish(rows[i]?.[`${key}_ending_balance`]);
//     if (typeof v === 'number' && !Number.isNaN(v)) return v;
//   }
//   return 100; // fallback if missing
// }

// // All-time = latest ending balance - 100, portfolio = sum
// async function fetchAllTimeTotalsFromAll(): Promise<Record<'BTC'|'ETH'|'SOL', number> & { portfolio: number }> {
//   const r = await fetch(DB_ALL_URL, {
//     method: 'GET',
//     cache: 'no-store',
//     headers: { 'api-key': DB_API_KEY },
//   });
//   if (!r.ok) throw new Error(`HTTP ${r.status}`);
//   const json = await r.json();
//   const rows: RawRow[] = Array.isArray(json) ? json : (json?.records || json?.data || json?.items || []);

//   const sorted = [...rows].sort(
//     (a, b) => new Date(a.date ?? a.timestamp ?? 0).getTime() - new Date(b.date ?? b.timestamp ?? 0).getTime(),
//   );

//   const lastBTC = latestEndingBalance(sorted, 'btc');
//   const lastETH = latestEndingBalance(sorted, 'eth');
//   const lastSOL = latestEndingBalance(sorted, 'sol');

//   const BTC = lastBTC - 100;
//   const ETH = lastETH - 100;
//   const SOL = lastSOL - 100;

//   return { BTC, ETH, SOL, portfolio: BTC + ETH + SOL };
// }


// // Get latest data for cumulative totals — computed from /all ending balances
// async function fetchLatestCumulativeTotals(): Promise<Record<'BTC'|'ETH'|'SOL', number> & { portfolio: number }> {
//   return fetchAllTimeTotalsFromAll();
// }


// // SWR fetcher for prediction API
// const swrFetcher = (url: string) =>
//   fetch(url, {
//     method: 'GET',
//     cache: 'no-store',
//     headers: {
//       'Cache-Control': 'no-cache, no-store, must-revalidate',
//       Pragma: 'no-cache',
//       Expires: '0',
//     },
//   }).then((r) => {
//     if (!r.ok) throw new Error(`HTTP ${r.status}`)
//     return r.json()
//   })

// // -------------------------------------------------------------
// // UI Components
// // -------------------------------------------------------------
// const tokenColors: Record<string, string> = { BTC: '#F7931A', ETH: '#627EEA', SOL: '#14F195' }

// const TimeFrameToggle: React.FC<{ timeFrame: TimeFrame; onChange: (t: TimeFrame) => void }> = ({ timeFrame, onChange }) => (
//   <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
//     {(['daily', 'monthly', 'all-time'] as TimeFrame[]).map((v) => (
//       <button
//         key={v}
//         onClick={() => onChange(v)}
//         className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
//           timeFrame === v ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-300 hover:text-white hover:bg-gray-700'
//         }`}
//       >
//         {v === 'all-time' ? 'All-time' : v.charAt(0).toUpperCase() + v.slice(1)}
//       </button>
//     ))}
//   </div>
// )

// // const CumulativePnLCard: React.FC<{ 
// //   timeFrame: TimeFrame; 
// //   tokenData?: TokenData[]; 
// //   value?: number;
// //   cumulativeTotals?: Record<'BTC'|'ETH'|'SOL', number> & { portfolio: number };
// // }> = ({
// //   timeFrame,
// //   tokenData = [],
// //   value = 0,
// //   cumulativeTotals,
// // }) => {
// //   // FIXED: Always show all-time cumulative totals and current period's performance
// //   const periodTotal = tokenData.length ? tokenData.reduce((s, t) => s + (t?.cumulativePnL || 0), 0) : value
// //   const allTimeTotalPnL = cumulativeTotals?.portfolio ?? 0
  
// //   // For display, use all-time total + current period changes for daily/monthly
// //   const displayTotal = timeFrame === 'all-time' ? allTimeTotalPnL : allTimeTotalPnL + periodTotal

// //   // Calculate percentage for current period
// //   const { aggPct } = useMemo(() => {
// //     if (timeFrame === 'daily') {
// //       // Daily: calculate percentage based on yesterday's vs current balances
// //       const baseSum = tokenData.reduce((s, t) => s + (t.trades?.[0]?.startBalance ?? 100), 0)
// //       const endSum = tokenData.reduce((s, t) => {
// //         const last = t.trades?.[t.trades.length - 1]
// //         return s + (last ? last.endBalance : 100)
// //       }, 0)
// //       return { aggPct: tokenData.length && baseSum > 0 ? ((endSum - baseSum) / baseSum) * 100 : 0 }
// //     } else if (timeFrame === 'monthly') {
// //       // Monthly: percentage of the current month's gains
// //       const totalInvested = 300 // 3 tokens × $100 initial each
// //       return { aggPct: totalInvested > 0 ? (periodTotal / totalInvested) * 100 : 0 }
// //     } else {
// //       // All-time: percentage of total cumulative
// //       const totalInvested = 300 // 3 tokens × $100 initial each
// //       return { aggPct: totalInvested > 0 ? (allTimeTotalPnL / totalInvested) * 100 : 0 }
// //     }
// //   }, [tokenData, timeFrame, periodTotal, allTimeTotalPnL])

// //   const isPositive = displayTotal >= 0
// //   const fmtMoney = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(n))
// //   const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`

// //   const spark = (t?: TokenData) =>
// //     t?.trades?.map((tr, i) => ({ x: i, y: timeFrame === 'daily' ? tr.cumulativeReturn : tr.cumulativeReturn })) ?? []

// //   return (
// //     <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 h-full">
// //       <h3 className="text-sm font-medium text-gray-400">
// //         All-Time Cumulative PnL
// //         <span className="ml-2 text-xs text-blue-400">
// //           ({timeFrame} view)
// //         </span>
// //       </h3>
      
// //       {/* FIXED: Show all-time total prominently */}
// //       <div className="flex items-end mt-3 space-x-3">
// //         {isPositive ? <TrendingUp className="w-6 h-6 text-green-500" /> : <TrendingDown className="w-6 h-6 text-red-500" />}
// //         <span className={`text-4xl font-extrabold tracking-tight ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
// //           {isPositive ? '+' : '-'}
// //           {fmtMoney(displayTotal)}
// //         </span>
// //         <span className={`text-lg font-semibold ${aggPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmtPct(aggPct)}</span>
// //       </div>

// //       {/* Show period-specific info if not all-time */}
// //       {timeFrame !== 'all-time' && (
// //         <div className="mt-2 text-sm text-gray-400">
// //           Period {timeFrame}: {periodTotal >= 0 ? '+' : ''}${Math.abs(periodTotal).toFixed(2)}
// //         </div>
// //       )}

// //       <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
// //         {(['BTC', 'ETH', 'SOL'] as const).map((sym) => {
// //           const t = tokenData.find((x) => x.symbol.toUpperCase() === sym)
// //           const periodVal = t?.cumulativePnL ?? 0
// //           const allTimeVal = cumulativeTotals?.[sym] ?? 0
          
// //           // FIXED: Always show all-time cumulative + current period
// //           const displayVal = timeFrame === 'all-time' ? allTimeVal : allTimeVal + periodVal
// //           const pct = timeFrame === 'daily' ? (t?.cumulativePercent ?? 0) : 
// //                      timeFrame === 'monthly' ? periodVal : 
// //                      (allTimeVal / 100) * 100 // All-time percentage relative to $100 start
          
// //           const pos = displayVal >= 0
// //           const gid = `grad-${sym}-${timeFrame}`

// //           return (
// //             <div key={sym} className="rounded-xl border border-gray-700 bg-gray-900/40 p-4 flex flex-col justify-between min-h-[120px]">
// //               <div className="flex items-center justify-between">
// //                 <span className="text-xs uppercase tracking-widest text-gray-400">{sym}</span>
// //                 <span className={`text-sm font-semibold ${pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
// //                   {timeFrame === 'daily' ? `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%` : 
// //                    timeFrame === 'monthly' ? `${periodVal >= 0 ? '+' : ''}${periodVal.toFixed(2)}` :
// //                    `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`}
// //                 </span>
// //               </div>
// //               <div className={`mt-2 text-xl font-bold ${pos ? 'text-green-400' : 'text-red-400'}`}>
// //                 {pos ? '+' : ''}${Math.abs(displayVal).toFixed(2)}
// //               </div>
// //               <div className="text-xs text-gray-500">
// //                 {timeFrame !== 'all-time' && (
// //                   <>Period: ${Math.abs(periodVal).toFixed(2)}<br/></>
// //                 )}
// //                 All-time: ${allTimeVal.toFixed(2)}
// //               </div>
// //               <div className="mt-3 h-10">
// //                 <ResponsiveContainer width="100%" height="100%">
// //                   <AreaChart data={spark(t)} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
// //                     <defs>
// //                       <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
// //                         <stop offset="0%" stopColor={tokenColors[sym]} stopOpacity={0.6} />
// //                         <stop offset="100%" stopColor={tokenColors[sym]} stopOpacity={0.05} />
// //                       </linearGradient>
// //                     </defs>
// //                     <Area type="monotone" dataKey="y" stroke={tokenColors[sym]} strokeWidth={1.5} fill={`url(#${gid})`} />
// //                   </AreaChart>
// //                 </ResponsiveContainer>
// //               </div>
// //             </div>
// //           )
// //         })}
// //       </div>
// //     </div>
// //   )
// // }

// const CumulativePnLCard: React.FC<{ 
//   timeFrame: TimeFrame; 
//   tokenData?: TokenData[]; 
//   value?: number;
//   cumulativeTotals?: Record<'BTC'|'ETH'|'SOL', number> & { portfolio: number };
// }> = ({
//   timeFrame,
//   tokenData = [],
//   value = 0,
//   cumulativeTotals,
// }) => {
//   // Always show all-time totals on the card
//   const allTimeTotalPnL = cumulativeTotals?.portfolio ?? 0;
//   const totalInvested = 300; // $100 each for BTC/ETH/SOL

//   const aggPct = totalInvested > 0 ? (allTimeTotalPnL / totalInvested) * 100 : 0;
//   const isPositive = allTimeTotalPnL >= 0;
//   const fmtMoney = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(n));
//   const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

//   const spark = (t?: TokenData) =>
//     t?.trades?.map((tr, i) => ({ x: i, y: tr.cumulativeReturn })) ?? [];

//   return (
//     <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 h-full">
//       <h3 className="text-sm font-medium text-gray-400">
//         All-Time Cumulative PnL
//         {/* <span className="ml-2 text-xs text-blue-400">({timeFrame} view)</span> */}
//       </h3>

//       <div className="flex items-end mt-3 space-x-3">
//         {isPositive ? <TrendingUp className="w-6 h-6 text-green-500" /> : <TrendingDown className="w-6 h-6 text-red-500" />}
//         <span className={`text-4xl font-extrabold tracking-tight ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
//           {isPositive ? '+' : '-'}{fmtMoney(allTimeTotalPnL)}
//         </span>
//         <span className={`text-lg font-semibold ${aggPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//           {fmtPct(aggPct)}
//         </span>
//       </div>

//       {/* Per-token all-time blocks */}
//       <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {(['BTC', 'ETH', 'SOL'] as const).map((sym) => {
//           const t = tokenData.find((x) => x.symbol.toUpperCase() === sym);
//           const allTimeVal = cumulativeTotals?.[sym] ?? 0;        // $ PnL all-time
//           const pct = (allTimeVal / 100) * 100;                   // % vs $100 start
//           const pos = allTimeVal >= 0;
//           const gid = `grad-${sym}-${timeFrame}`;

//           return (
//             <div key={sym} className="rounded-xl border border-gray-700 bg-gray-900/40 p-4 flex flex-col justify-between min-h-[120px]">
//               <div className="flex items-center justify-between">
//                 <span className="text-xs uppercase tracking-widest text-gray-400">{sym}</span>
//                 <span className={`text-sm font-semibold ${pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                   {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
//                 </span>
//               </div>

//               <div className={`mt-2 text-xl font-bold ${pos ? 'text-green-400' : 'text-red-400'}`}>
//                 {pos ? '+' : ''}${Math.abs(allTimeVal).toFixed(2)}
//               </div>

//               <div className="text-xs text-gray-500">
//                 All-time: ${allTimeVal.toFixed(2)}
//               </div>

//               <div className="mt-3 h-10">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <AreaChart data={spark(t)} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
//                     <defs>
//                       <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="0%" stopColor={tokenColors[sym]} stopOpacity={0.6} />
//                         <stop offset="100%" stopColor={tokenColors[sym]} stopOpacity={0.05} />
//                       </linearGradient>
//                     </defs>
//                     <Area type="monotone" dataKey="y" stroke={tokenColors[sym]} strokeWidth={1.5} fill={`url(#${gid})`} />
//                   </AreaChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };


// const PnLChart: React.FC<{ data: PnLData[]; timeFrame: TimeFrame }> = ({ data, timeFrame }) => {
//   const fmtX = (ts: string) => {
//     const d = new Date(ts)
//     if (timeFrame === 'daily') return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
//     if (timeFrame === 'monthly') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
//     return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
//   }

//   return (
//     <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 h-full">
//       <h3 className="text-lg font-semibold text-white mb-4">PnL Trend ({timeFrame})</h3>
//       <div className="h-64 md:h-80">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//             <XAxis dataKey="timestamp" tickFormatter={fmtX} className="text-xs" stroke="#9CA3AF" />
//             <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} className="text-xs" stroke="#9CA3AF" />
//             <Tooltip
//               labelFormatter={(ts) => new Date(ts as string).toLocaleString('en-US')}
//               formatter={(v: number) => [
//                 new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v),
//                 'PnL',
//               ]}
//               contentStyle={{
//                 backgroundColor: '#1F2937',
//                 border: '1px solid #374151',
//                 borderRadius: 8,
//                 color: 'white',
//               }}
//             />
//             <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#7C3AED' }} />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   )
// }

// const TokenTableModal: React.FC<{ tokenData: TokenData; timeFrame: TimeFrame; onClose: () => void }> = ({
//   tokenData,
//   timeFrame,
//   onClose,
// }) => {
//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
//         <div className="flex justify-between items-center p-6 border-b border-gray-700">
//           <h2 className="text-xl font-bold text-white">
//             {tokenData.symbol} - {timeFrame} Details
//           </h2>
//           <button onClick={onClose} className="text-gray-400 hover:text-white">
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead className="sticky top-0 bg-gray-800">
//                 <tr className="border-b border-gray-700 text-gray-400">
//                   <th className="text-left py-3">Step</th>
//                   <th className="text-left py-3">Time</th>
//                   <th className="text-left py-3">Trades</th>
//                   <th className="text-left py-3">Return %</th>
//                   <th className="text-left py-3">Start Balance</th>
//                   <th className="text-left py-3">End Balance</th>
//                   <th className="text-left py-3">Gain $</th>
//                   <th className="text-left py-3">Cumulative %</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {tokenData.trades.map((tr, i) => (
//                   <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/50">
//                     <td className="py-3 text-gray-300">{tr.day}</td>
//                     <td className="py-3 text-gray-300">{tr.date}</td>
//                     <td className="py-3 text-gray-300">{tr.trades}</td>
//                     <td className={`py-3 font-semibold ${tr.dailyPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                       {tr.dailyPnLPercent >= 0 ? '+' : ''}{tr.dailyPnLPercent.toFixed(3)}%
//                     </td>
//                     <td className="py-3 text-gray-300">${tr.startBalance.toFixed(2)}</td>
//                     <td className="py-3 text-gray-300">${tr.endBalance.toFixed(2)}</td>
//                     <td className={`py-3 font-semibold ${tr.dailyGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                       {tr.dailyGain >= 0 ? '+' : ''}${tr.dailyGain.toFixed(2)}
//                     </td>
//                     <td className={`py-3 font-semibold ${tr.cumulativeReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                       {tr.cumulativeReturn >= 0 ? '+' : ''}{tr.cumulativeReturn.toFixed(2)}%
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// const TokenTable: React.FC<{ tokenData: TokenData; timeFrame: TimeFrame }> = ({ tokenData, timeFrame }) => {
//   const [isMaximized, setIsMaximized] = useState(false)
//   const showMaximize = timeFrame === 'monthly' || timeFrame === 'all-time'

//   return (
//     <>
//       <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 flex flex-col h-[500px]">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-white">{tokenData.symbol}</h3>
//           <div className="flex items-center space-x-2">
//             <span className="text-sm text-gray-400">${tokenData.price.toLocaleString()}</span>
//             {showMaximize && (
//               <button onClick={() => setIsMaximized(true)} className="text-gray-400 hover:text-white p-1" title="Maximize">
//                 <Maximize2 className="w-4 h-4" />
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="flex-1 overflow-y-auto">
//           <table className="w-full text-xs table-fixed">
//             <thead className="sticky top-0 bg-gray-800">
//               <tr className="border-b border-gray-700 text-gray-400">
//                 <th className="text-left py-2 w-12">Step</th>
//                 <th className="text-left py-2 w-24">Time</th>
//                 <th className="text-left py-2 w-16">Trades</th>
//                 <th className="text-left py-2 w-20">Return %</th>
//                 <th className="text-left py-2 hidden sm:table-cell w-24">Start Bal</th>
//                 <th className="text-left py-2 hidden sm:table-cell w-24">End Bal</th>
//                 <th className="text-left py-2 w-20">Gain $</th>
//                 <th className="text-left py-2 hidden md:table-cell w-24">Cum. %</th>
//               </tr>
//             </thead>
//             <tbody>
//               {tokenData.trades.map((tr, i) => (
//                 <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/50">
//                   <td className="py-2 text-gray-300">{tr.day}</td>
//                   <td className="py-2 text-gray-300">{tr.date}</td>
//                   <td className="py-2 text-gray-300">{tr.trades}</td>
//                   <td className={`py-2 font-semibold ${tr.dailyPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                     {tr.dailyPnLPercent >= 0 ? '+' : ''}{tr.dailyPnLPercent.toFixed(3)}%
//                   </td>
//                   <td className="py-2 text-gray-300 hidden sm:table-cell">${tr.startBalance.toFixed(2)}</td>
//                   <td className="py-2 text-gray-300 hidden sm:table-cell">${tr.endBalance.toFixed(2)}</td>
//                   <td className={`py-2 font-semibold ${tr.dailyGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                     {tr.dailyGain >= 0 ? '+' : ''}${tr.dailyGain.toFixed(2)}
//                   </td>
//                   <td className={`py-2 font-semibold hidden md:table-cell ${tr.cumulativeReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                     {tr.cumulativeReturn >= 0 ? '+' : ''}{tr.cumulativeReturn.toFixed(2)}%
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {isMaximized && (
//         <TokenTableModal tokenData={tokenData} timeFrame={timeFrame} onClose={() => setIsMaximized(false)} />
//       )}
//     </>
//   )
// }

// // -------------------------------------------------------------
// // Main Dashboard
// // -------------------------------------------------------------
// const PnLDashboard: React.FC = () => {
//   const [timeFrame, setTimeFrame] = useState<TimeFrame>('all-time')
//   const [cumulativePnL, setCumulativePnL] = useState<number>(0)
//   const [chartData, setChartData] = useState<PnLData[]>([])
//   const [tokenData, setTokenData] = useState<TokenData[]>([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [cumulativeTotals, setCumulativeTotals] = useState<Record<'BTC'|'ETH'|'SOL', number> & { portfolio: number }>()

//   // Fetch prediction data for daily view
//   const { data: prediction, error: predictionError, isLoading: predictionLoading } = useSWR<PredictionAPIResponse>(
//     timeFrame === 'daily' ? '/api/today-prediction' : null,
//     swrFetcher,
//     { revalidateOnFocus: false, revalidateOnReconnect: true, shouldRetryOnError: true }
//   )

//   // Load cumulative totals for display
//   useEffect(() => {
//     fetchLatestCumulativeTotals().then(setCumulativeTotals).catch(console.error)
//   }, [])

//   const loadData = async (frame: TimeFrame) => {
//     setLoading(true)
//     setError(null)
//     try {
//       if (frame === 'monthly') {
//         const { tokens, chart } = await fetchMonthlyFromDB()
//         setTokenData(tokens)
//         setChartData(chart)
//         setCumulativePnL(tokens.reduce((s, t) => s + (t?.cumulativePnL || 0), 0))
//       } else if (frame === 'all-time') {
//         const { tokens, chart } = await fetchAllTimeFromDB()
//         setTokenData(tokens)
//         setChartData(chart)
//         setCumulativePnL(tokens.reduce((s, t) => s + (t?.cumulativePnL || 0), 0))
//       } else {
//         // Daily view handled by useEffect below
//         setTokenData([])
//         setChartData([])
//         setCumulativePnL(0)
//       }
//     } catch (e) {
//       console.error('Error loading data:', e)
//       setError(e instanceof Error ? e.message : 'Failed to load data')
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     loadData(timeFrame)
//   }, [timeFrame])

//   // Handle daily prediction data
//   useEffect(() => {
//     if (timeFrame !== 'daily') return
//     if (!prediction?.forecast_today_hourly) return

//     let cancelled = false
    
//     ;(async () => {
//       try {
//         // Get yesterday's final balances
//         const prevBalances = await fetchPrevDayStartBalances()
//         console.log('Previous day balances:', prevBalances)
        
//         // Convert forecast to hourly trades
//         const newTokens = convertForecastToHourlyTrades(
//           prediction.forecast_today_hourly,
//           prevBalances
//         )
        
//         // Create chart data from forecasts
//         const syntheticChart: PnLData[] = (prediction.forecast_today_hourly['BTC'] ?? []).map((r) => ({
//           timestamp: r.time,
//           value: (r.forecast_price - r.entry_price) * 100, // Scaled for visualization
//         }))
        
//         if (cancelled) return
        
//         setTokenData(newTokens)
//         setChartData(syntheticChart)
//         setCumulativePnL(newTokens.reduce((s, t) => s + (t?.cumulativePnL || 0), 0))
//       } catch (e) {
//         console.error('Error processing daily prediction data:', e)
//         setError('Failed to process daily prediction data')
//       }
//     })()

//     return () => { cancelled = true }
//   }, [prediction, timeFrame])

//   return (
//     <div className="min-h-screen bg-gray-900">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
//           <h1 className="text-3xl font-bold text-white">PnL Dashboard</h1>
//           <TimeFrameToggle timeFrame={timeFrame} onChange={setTimeFrame} />
//         </div>

//         {(loading || (timeFrame === 'daily' && predictionLoading)) && (
//           <div className="text-center py-4">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//             <p className="text-gray-400 mt-2">
//               {timeFrame === 'daily' ? 'Loading hourly predictions...' : 'Loading real data...'}
//             </p>
//           </div>
//         )}

//         {(error || (timeFrame === 'daily' && predictionError)) && (
//           <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
//             <div className="text-red-400 text-sm">
//               Error: {error || (predictionError instanceof Error ? predictionError.message : 'Failed to load predictions')}
//             </div>
//           </div>
//         )}

//         {!loading && !error && !(timeFrame === 'daily' && predictionLoading) && (
//           <>
//             {/* Top Row */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//               <CumulativePnLCard 
//                 timeFrame={timeFrame} 
//                 tokenData={tokenData} 
//                 value={cumulativePnL} 
//                 cumulativeTotals={cumulativeTotals}
//               />
//               <PnLChart data={chartData} timeFrame={timeFrame} />
//             </div>

//             {/* Bottom Row */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//               {tokenData.map((t) => (
//                 <TokenTable key={t.symbol} tokenData={t} timeFrame={timeFrame} />
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   )
// }

// export default PnLDashboard

'use client'

import React, { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { TrendingDown, TrendingUp, Maximize2, X } from 'lucide-react'

// -------------------------------------------------------------
// Types
// -------------------------------------------------------------
type TimeFrame = 'daily' | 'monthly' | 'all-time'

interface PnLData {
  timestamp: string
  value: number
  percentage?: number
}

interface TokenTradeData {
  day: number
  date: string
  trades: number
  dailyPnLPercent: number
  startBalance: number
  endBalance: number
  dailyGain: number
  cumulativeReturn: number
}

interface TokenData {
  symbol: string
  price: number
  cumulativePnL: number
  cumulativePercent: number
  volume: number
  trades: TokenTradeData[]
  totalCumulativePnL?: number // Total cumulative from API
}

// Prediction API types
interface HourlyForecast {
  time: string
  signal: 'LONG' | 'SHORT'
  entry_price: number
  stop_loss: number
  take_profit: number
  forecast_price: number
  current_price: number
  deviation_percent: number
  accuracy_percent: number
  risk_reward_ratio: number
  sentiment_score: number
  confidence_50: [number, number]
  confidence_80: [number, number]
  confidence_90: [number, number]
}

interface PredictionAPIResponse {
  forecast_today_hourly: Record<string, HourlyForecast[]>
}

// -------------------------------------------------------------
// External DB endpoints
// -------------------------------------------------------------
const DB_BASE = 'https://zynapse.zkagi.ai/daily-cumulative'
const DB_ALL_URL = `${DB_BASE}/all`
const DB_MONTH_URL = `${DB_BASE}/month`
const DB_GET_URL = `${DB_BASE}/get`
const DB_API_KEY = 'zk-123321'

// -------------------------------------------------------------
// Helpers (IST date/time, normalizers, pivot)
// -------------------------------------------------------------
const IST = 'Asia/Kolkata'

const istNow = () => new Date(new Date().toLocaleString('en-US', { timeZone: IST }))
const istYYYYMMDD = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const istMonthMM = (d = istNow()) => String(d.getMonth() + 1).padStart(2, '0')

type RawRow = Record<string, any>

const numberish = (...c: any[]) => {
  for (const x of c) {
    if (typeof x === 'number' && !Number.isNaN(x)) return x
    if (typeof x === 'string' && x.trim() !== '' && !Number.isNaN(+x)) return +x
  }
  return undefined
}

const TOKENS_DEF = [
  { key: 'btc', sym: 'BTC' },
  { key: 'eth', sym: 'ETH' },
  { key: 'sol', sym: 'SOL' },
]

// Turn API records into TokenData[] with proper starting balances
function pivotPortfolioRecordsToTokens(
  rows: RawRow[], 
  startBalances?: Record<'BTC'|'ETH'|'SOL', number>
): TokenData[] {
  const sorted = [...rows].sort(
    (a, b) => new Date(a.date ?? a.timestamp ?? 0).getTime() - new Date(b.date ?? b.timestamp ?? 0).getTime(),
  )

  return TOKENS_DEF.map(({ key, sym }) => {
    const trades: TokenTradeData[] = sorted.map((r, idx) => {
      const endBalance = numberish(r[`${key}_ending_balance`]) ?? 100
      const tokenCumulative = numberish(r[`${key}_cumulative`]) ?? 0
      
      // Calculate start balance
      let startBalance: number
      if (idx === 0) {
        // First record: use provided start balance or default to 100
        startBalance = startBalances?.[sym as 'BTC'|'ETH'|'SOL'] ?? 100
      } else {
        // Subsequent records: use previous day's end balance
        const prevRecord = sorted[idx - 1]
        startBalance = numberish(prevRecord[`${key}_ending_balance`]) ?? 100
      }
      
      const dailyGain = endBalance - startBalance
      const dailyPct = startBalance !== 0 ? (dailyGain / startBalance) * 100 : 0
      
      // For monthly/all-time, cumulative return is based on original 100 investment
      // For this period's calculation, it's based on the period start
      const periodStartBalance = startBalances?.[sym as 'BTC'|'ETH'|'SOL'] ?? 100
      const cumulativeReturn = ((endBalance - periodStartBalance) / periodStartBalance) * 100

      const t = new Date(r.date ?? r.timestamp ?? new Date())
      const label = t.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: IST })

      return {
        day: idx + 1,
        date: label,
        trades: Math.max(1, Math.floor(numberish(r.total_trades) ?? 1)),
        dailyPnLPercent: dailyPct,
        startBalance: startBalance,
        endBalance: endBalance,
        dailyGain: dailyGain,
        cumulativeReturn: cumulativeReturn,
      }
    })

    const last = trades[trades.length - 1]
    const lastRow = sorted[sorted.length - 1]
    const periodStartBalance = startBalances?.[sym as 'BTC'|'ETH'|'SOL'] ?? 100
    
    // Get total cumulative PnL from API
    const totalCumulativePnL = numberish(lastRow?.[`${key}_cumulative`]) ?? 0
    
    return {
      symbol: sym,
      price: 0,
      cumulativePnL: last ? last.endBalance - periodStartBalance : 0,
      cumulativePercent: last ? ((last.endBalance - periodStartBalance) / periodStartBalance) * 100 : 0,
      volume: 0,
      trades,
      totalCumulativePnL, // Total cumulative from start of trading
    }
  })
}

// Aggregate chart from per-token trades (sum daily gains as percentages)
function aggregateChartFromTokens(tokens: TokenData[], from?: Date, to?: Date): PnLData[] {
  const sums = new Map<string, number>()
  tokens.forEach((t) =>
    t.trades.forEach((tr) => {
      sums.set(tr.date, (sums.get(tr.date) || 0) + tr.dailyPnLPercent)
    }),
  )

  // If a fixed day range is given, iterate day-by-day in IST
  if (from && to) {
    const out: PnLData[] = []
    const d = new Date(from)
    while (d <= to) {
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: IST })
      const ts = new Date(
        new Date(d.toLocaleString('en-US', { timeZone: IST })).toISOString(),
      ).toISOString()
      out.push({ timestamp: ts, value: sums.get(label) ?? 0 })
      d.setDate(d.getDate() + 1)
    }
    return out
  }

  // Otherwise just map known labels to a rough timestamp (this year)
  const year = istNow().getFullYear()
  return Array.from(sums.entries()).map(([label, v]) => {
    const parsed = new Date(`${label} ${year}`)
    return { timestamp: isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString(), value: v }
  })
}

// Convert forecast data to hourly trades with proper chaining of balances
function convertForecastToHourlyTrades(
  fth: Record<string, HourlyForecast[]>,
  prevBalances: Record<'BTC'|'ETH'|'SOL', number>
): TokenData[] {
  const symbols = ['BTC', 'ETH', 'SOL'] as const
  
  return symbols.map((sym) => {
    const rows = fth[sym] ?? []
    const dayStartBalance = prevBalances[sym] ?? 100 // Yesterday's final balance
    
    // FIXED: Build trades array iteratively to avoid scope issues
    const trades: TokenTradeData[] = []
    let currentBalance = dayStartBalance // Track balance as we go
    
    rows.forEach((row, idx) => {
      // Calculate hourly return
      const ret = (row.forecast_price - row.entry_price) / (row.entry_price || 1)
      
      // Start balance is the current running balance
      const startBalance = currentBalance
      const end = startBalance * (1 + ret)
      const gain = end - startBalance
      
      // Update current balance for next iteration
      currentBalance = end
      
      // Cumulative return is relative to day's starting point
      const cumulativeReturn = ((end - dayStartBalance) / dayStartBalance) * 100
      
      const t = new Date(row.time)
      const label = t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      
      trades.push({
        day: idx + 1,
        date: label,
        trades: 1,
        dailyPnLPercent: ret * 100, // This hour's return percentage
        startBalance: startBalance,
        endBalance: end,
        dailyGain: gain, // This hour's gain/loss in dollars
        cumulativeReturn, // Cumulative return since start of day
      })
    })
    
    const lastPrice = rows.length ? rows[rows.length - 1].current_price : 0
    const last = trades[trades.length - 1]
    
    return {
      symbol: sym,
      price: lastPrice,
      cumulativePnL: last ? last.endBalance - dayStartBalance : 0,
      cumulativePercent: last ? last.cumulativeReturn : 0,
      volume: 0,
      trades,
    }
  })
}

// -------------------------------------------------------------
// External DB fetchers (updated to use real API)
// -------------------------------------------------------------
async function fetchAllTimeFromDB(): Promise<{ tokens: TokenData[]; chart: PnLData[] }> {
  try {
    const r = await fetch(DB_ALL_URL, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'api-key': DB_API_KEY },
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const json = await r.json()
    const rows: RawRow[] = Array.isArray(json) ? json : (json?.records || json?.data || json?.items || [])
    
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('No data received from API')
    }
    
    const tokens = pivotPortfolioRecordsToTokens(rows)
    const chart = aggregateChartFromTokens(tokens)
    return { tokens, chart }
  } catch (e) {
    console.error('fetchAllTimeFromDB error:', e)
    throw e
  }
}

// Get the last day of previous month's ending balances
async function fetchPrevMonthEndBalances(): Promise<Record<'BTC'|'ETH'|'SOL', number>> {
  const now = istNow()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  const date = istYYYYMMDD(lastDayOfPrevMonth)
  
  try {
    const r = await fetch(`${DB_GET_URL}?date=${encodeURIComponent(date)}`, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'api-key': DB_API_KEY },
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const row = await r.json() as RawRow
    return {
      BTC: numberish(row.btc_ending_balance) ?? 100,
      ETH: numberish(row.eth_ending_balance) ?? 100,
      SOL: numberish(row.sol_ending_balance) ?? 100,
    }
  } catch (e) {
    console.error('fetchPrevMonthEndBalances error:', e)
    return { BTC: 100, ETH: 100, SOL: 100 }
  }
}

async function fetchMonthlyFromDB(): Promise<{ tokens: TokenData[]; chart: PnLData[] }> {
  const mm = istMonthMM()
  const monthUrl = `${DB_MONTH_URL}?month=${encodeURIComponent(mm)}`
  const nowI = istNow()
  const start = new Date(nowI.getFullYear(), nowI.getMonth(), 1)
  const end = new Date(nowI.getFullYear(), nowI.getMonth(), nowI.getDate())

  try {
    // Get previous month's ending balances first
    const prevMonthBalances = await fetchPrevMonthEndBalances()
    console.log('Previous month ending balances:', prevMonthBalances)

    const r = await fetch(monthUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'api-key': DB_API_KEY },
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const json = await r.json()
    const rows: RawRow[] = Array.isArray(json) ? json : (json?.records || json?.data || json?.items || [])
    
    if (!Array.isArray(rows) || rows.length === 0) {
      // Fallback: filter /all to the current IST month
      const allData = await fetchAllTimeFromDB()
      const currentMonth = istMonthMM()
      const filteredRows = allData.tokens.length > 0 ? 
        (allData.tokens[0]?.trades || [])
          .map((_, i) => {
            const anyToken = allData.tokens[0]
            const tradeData = anyToken?.trades[i]
            if (!tradeData) return null
            
            // Parse the date from the trade to check if it's current month
            const label = tradeData.date
            const parsed = new Date(`${label} ${istNow().getFullYear()}`)
            const m = String(parsed.getMonth() + 1).padStart(2, '0')
            
            if (m !== currentMonth) return null
            
            // Create synthetic row from trade data
            const row: RawRow = {
              date: parsed.toISOString(),
              btc_ending_balance: allData.tokens.find(t => t.symbol === 'BTC')?.trades[i]?.endBalance,
              eth_ending_balance: allData.tokens.find(t => t.symbol === 'ETH')?.trades[i]?.endBalance,
              sol_ending_balance: allData.tokens.find(t => t.symbol === 'SOL')?.trades[i]?.endBalance,
              total_trades: tradeData.trades,
            }
            return row
          })
          .filter(Boolean) as RawRow[]
        : []
        
      if (filteredRows.length === 0) {
        throw new Error('No monthly data available')
      }
      
      const tokens = pivotPortfolioRecordsToTokens(filteredRows, prevMonthBalances)
      const chart = aggregateChartFromTokens(tokens, start, end)
      return { tokens, chart }
    }
    
    const tokens = pivotPortfolioRecordsToTokens(rows, prevMonthBalances)
    const chart = aggregateChartFromTokens(tokens, start, end)
    return { tokens, chart }
  } catch (e) {
    console.error('fetchMonthlyFromDB error:', e)
    throw e
  }
}

// Daily: fetch yesterday's ending balances (IST) for BTC/ETH/SOL
async function fetchPrevDayStartBalances(): Promise<Record<'BTC'|'ETH'|'SOL', number>> {
  const y = istNow()
  y.setDate(y.getDate() - 1)
  const date = istYYYYMMDD(y)
  try {
    const r = await fetch(`${DB_GET_URL}?date=${encodeURIComponent(date)}`, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'api-key': DB_API_KEY },
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const row = await r.json() as RawRow
    return {
      BTC: numberish(row.btc_ending_balance) ?? 100,
      ETH: numberish(row.eth_ending_balance) ?? 100,
      SOL: numberish(row.sol_ending_balance) ?? 100,
    }
  } catch (e) {
    console.error('fetchPrevDayStartBalances error:', e)
    return { BTC: 100, ETH: 100, SOL: 100 }
  }
}

// Find the latest non-empty ending balance for a given key across all rows
function latestEndingBalance(rows: RawRow[], key: 'btc'|'eth'|'sol'): number {
  for (let i = rows.length - 1; i >= 0; i--) {
    const v = numberish(rows[i]?.[`${key}_ending_balance`]);
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
  }
  return 100; // fallback if missing
}

// All-time = latest ending balance - 100, portfolio = sum
async function fetchAllTimeTotalsFromAll(): Promise<Record<'BTC'|'ETH'|'SOL', number> & { portfolio: number }> {
  const r = await fetch(DB_ALL_URL, {
    method: 'GET',
    cache: 'no-store',
    headers: { 'api-key': DB_API_KEY },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const json = await r.json();
  const rows: RawRow[] = Array.isArray(json) ? json : (json?.records || json?.data || json?.items || []);

  const sorted = [...rows].sort(
    (a, b) => new Date(a.date ?? a.timestamp ?? 0).getTime() - new Date(b.date ?? b.timestamp ?? 0).getTime(),
  );

  const lastBTC = latestEndingBalance(sorted, 'btc');
  const lastETH = latestEndingBalance(sorted, 'eth');
  const lastSOL = latestEndingBalance(sorted, 'sol');

  const BTC = lastBTC - 100;
  const ETH = lastETH - 100;
  const SOL = lastSOL - 100;

  return { BTC, ETH, SOL, portfolio: BTC + ETH + SOL };
}

// Get latest data for cumulative totals — computed from /all ending balances
async function fetchLatestCumulativeTotals(): Promise<Record<'BTC'|'ETH'|'SOL', number> & { portfolio: number }> {
  return fetchAllTimeTotalsFromAll();
}

// SWR fetcher for prediction API
const swrFetcher = (url: string) =>
  fetch(url, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  }).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  })

// -------------------------------------------------------------
// UI Components
// -------------------------------------------------------------
const tokenColors: Record<string, string> = { BTC: '#F7931A', ETH: '#627EEA', SOL: '#14F195' }

const TimeFrameToggle: React.FC<{ timeFrame: TimeFrame; onChange: (t: TimeFrame) => void }> = ({ timeFrame, onChange }) => (
  <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
    {(['daily', 'monthly', 'all-time'] as TimeFrame[]).map((v) => (
      <button
        key={v}
        onClick={() => onChange(v)}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          timeFrame === v ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-300 hover:text-white hover:bg-gray-700'
        }`}
      >
        {v === 'all-time' ? 'All-time' : v.charAt(0).toUpperCase() + v.slice(1)}
      </button>
    ))}
  </div>
)

const CumulativePnLCard: React.FC<{ 
  timeFrame: TimeFrame; 
  tokenData?: TokenData[]; 
  value?: number;
  cumulativeTotals?: Record<'BTC'|'ETH'|'SOL', number> & { portfolio: number };
}> = ({
  timeFrame,
  tokenData = [],
  value = 0,
  cumulativeTotals,
}) => {
  // Always show all-time totals on the card
  const allTimeTotalPnL = cumulativeTotals?.portfolio ?? 0;
  const totalInvested = 300; // $100 each for BTC/ETH/SOL

  const aggPct = totalInvested > 0 ? (allTimeTotalPnL / totalInvested) * 100 : 0;
  const isPositive = aggPct >= 0;
  const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

  const spark = (t?: TokenData) =>
    t?.trades?.map((tr, i) => ({ x: i, y: tr.cumulativeReturn })) ?? [];

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 h-full">
      <h3 className="text-sm font-medium text-gray-400">
        Portfolio Performance
      </h3>

      <div className="flex items-end mt-3 space-x-3">
        {isPositive ? <TrendingUp className="w-8 h-8 text-green-500" /> : <TrendingDown className="w-8 h-8 text-red-500" />}
        <span className={`text-6xl font-extrabold tracking-tight ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {fmtPct(aggPct)}
        </span>
      </div>

      <div className="mt-2 text-sm text-gray-400">
        Portfolio cumulative return
      </div>

      {/* Per-token all-time blocks */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(['BTC', 'ETH', 'SOL'] as const).map((sym) => {
          const t = tokenData.find((x) => x.symbol.toUpperCase() === sym);
          const allTimeVal = cumulativeTotals?.[sym] ?? 0;        // $ PnL all-time
          const pct = (allTimeVal / 100) * 100;                   // % vs $100 start
          const pos = pct >= 0;
          const gid = `grad-${sym}-${timeFrame}`;

          return (
            <div key={sym} className="rounded-xl border border-gray-700 bg-gray-900/40 p-4 flex flex-col justify-between min-h-[120px]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{sym}</span>
                <span className={`text-lg font-bold ${pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                </span>
              </div>

              <div className="text-xs text-gray-500 mt-1">
                All-time return
              </div>

              <div className="mt-3 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spark(t)} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={tokenColors[sym]} stopOpacity={0.6} />
                        <stop offset="100%" stopColor={tokenColors[sym]} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="y" stroke={tokenColors[sym]} strokeWidth={1.5} fill={`url(#${gid})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PnLChart: React.FC<{ data: PnLData[]; timeFrame: TimeFrame }> = ({ data, timeFrame }) => {
  const fmtX = (ts: string) => {
    const d = new Date(ts)
    if (timeFrame === 'daily') return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    if (timeFrame === 'monthly') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 h-full">
      <h3 className="text-lg font-semibold text-white mb-4">Return Trend ({timeFrame})</h3>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" tickFormatter={fmtX} className="text-xs" stroke="#9CA3AF" />
            <YAxis tickFormatter={(v) => `${v.toFixed(1)}%`} className="text-xs" stroke="#9CA3AF" />
            <Tooltip
              labelFormatter={(ts) => new Date(ts as string).toLocaleString('en-US')}
              formatter={(v: number) => [`${v >= 0 ? '+' : ''}${v.toFixed(2)}%`, 'Return']}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: 8,
                color: 'white',
              }}
            />
            <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#7C3AED' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const TokenTableModal: React.FC<{ tokenData: TokenData; timeFrame: TimeFrame; onClose: () => void }> = ({
  tokenData,
  timeFrame,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {tokenData.symbol} - {timeFrame} Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-800">
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="text-left py-3">Step</th>
                  <th className="text-left py-3">Time</th>
                  <th className="text-left py-3">Trades</th>
                  <th className="text-left py-3">Period Return %</th>
                  <th className="text-left py-3">Cumulative Return %</th>
                </tr>
              </thead>
              <tbody>
                {tokenData.trades.map((tr, i) => (
                  <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="py-3 text-gray-300">{tr.day}</td>
                    <td className="py-3 text-gray-300">{tr.date}</td>
                    <td className="py-3 text-gray-300">{tr.trades}</td>
                    <td className={`py-3 font-bold text-lg ${tr.dailyPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tr.dailyPnLPercent >= 0 ? '+' : ''}{tr.dailyPnLPercent.toFixed(3)}%
                    </td>
                    <td className={`py-3 font-bold text-lg ${tr.cumulativeReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tr.cumulativeReturn >= 0 ? '+' : ''}{tr.cumulativeReturn.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const TokenTable: React.FC<{ tokenData: TokenData; timeFrame: TimeFrame }> = ({ tokenData, timeFrame }) => {
  const [isMaximized, setIsMaximized] = useState(false)
  const showMaximize = timeFrame === 'monthly' || timeFrame === 'all-time'

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 flex flex-col h-[500px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{tokenData.symbol}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Performance</span>
            {showMaximize && (
              <button onClick={() => setIsMaximized(true)} className="text-gray-400 hover:text-white p-1" title="Maximize">
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs table-fixed">
            <thead className="sticky top-0 bg-gray-800">
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left py-2 w-12">Step</th>
                <th className="text-left py-2 w-20">Time</th>
                <th className="text-left py-2 w-16">Trades</th>
                <th className="text-left py-2 w-24">Period Return %</th>
                <th className="text-left py-2 w-24">Cumulative %</th>
              </tr>
            </thead>
            <tbody>
              {tokenData.trades.map((tr, i) => (
                <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="py-2 text-gray-300">{tr.day}</td>
                  <td className="py-2 text-gray-300">{tr.date}</td>
                  <td className="py-2 text-gray-300">{tr.trades}</td>
                  <td className={`py-2 font-bold text-base ${tr.dailyPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tr.dailyPnLPercent >= 0 ? '+' : ''}{tr.dailyPnLPercent.toFixed(3)}%
                  </td>
                  <td className={`py-2 font-bold text-base ${tr.cumulativeReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tr.cumulativeReturn >= 0 ? '+' : ''}{tr.cumulativeReturn.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isMaximized && (
        <TokenTableModal tokenData={tokenData} timeFrame={timeFrame} onClose={() => setIsMaximized(false)} />
      )}
    </>
  )
}

// -------------------------------------------------------------
// Main Dashboard
// -------------------------------------------------------------
const PnLDashboard: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('all-time')
  const [cumulativePnL, setCumulativePnL] = useState<number>(0)
  const [chartData, setChartData] = useState<PnLData[]>([])
  const [tokenData, setTokenData] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cumulativeTotals, setCumulativeTotals] = useState<Record<'BTC'|'ETH'|'SOL', number> & { portfolio: number }>()

  // Fetch prediction data for daily view
  const { data: prediction, error: predictionError, isLoading: predictionLoading } = useSWR<PredictionAPIResponse>(
    timeFrame === 'daily' ? '/api/today-prediction' : null,
    swrFetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true, shouldRetryOnError: true }
  )

  // Load cumulative totals for display
  useEffect(() => {
    fetchLatestCumulativeTotals().then(setCumulativeTotals).catch(console.error)
  }, [])

  const loadData = async (frame: TimeFrame) => {
    setLoading(true)
    setError(null)
    try {
      if (frame === 'monthly') {
        const { tokens, chart } = await fetchMonthlyFromDB()
        setTokenData(tokens)
        setChartData(chart)
        setCumulativePnL(tokens.reduce((s, t) => s + (t?.cumulativePnL || 0), 0))
      } else if (frame === 'all-time') {
        const { tokens, chart } = await fetchAllTimeFromDB()
        setTokenData(tokens)
        setChartData(chart)
        setCumulativePnL(tokens.reduce((s, t) => s + (t?.cumulativePnL || 0), 0))
      } else {
        // Daily view handled by useEffect below
        setTokenData([])
        setChartData([])
        setCumulativePnL(0)
      }
    } catch (e) {
      console.error('Error loading data:', e)
      setError(e instanceof Error ? e.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(timeFrame)
  }, [timeFrame])

  // Handle daily prediction data
  useEffect(() => {
    if (timeFrame !== 'daily') return
    if (!prediction?.forecast_today_hourly) return

    let cancelled = false
    
    ;(async () => {
      try {
        // Get yesterday's final balances
        const prevBalances = await fetchPrevDayStartBalances()
        console.log('Previous day balances:', prevBalances)
        
        // Convert forecast to hourly trades
        const newTokens = convertForecastToHourlyTrades(
          prediction.forecast_today_hourly,
          prevBalances
        )
        
        // Create chart data from forecasts (use percentage returns)
        const syntheticChart: PnLData[] = (prediction.forecast_today_hourly['BTC'] ?? []).map((r) => ({
          timestamp: r.time,
          value: ((r.forecast_price - r.entry_price) / r.entry_price) * 100, // Percentage return
        }))
        
        if (cancelled) return
        
        setTokenData(newTokens)
        setChartData(syntheticChart)
        setCumulativePnL(newTokens.reduce((s, t) => s + (t?.cumulativePnL || 0), 0))
      } catch (e) {
        console.error('Error processing daily prediction data:', e)
        setError('Failed to process daily prediction data')
      }
    })()

    return () => { cancelled = true }
  }, [prediction, timeFrame])

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-3xl font-bold text-white">Performance Dashboard</h1>
          <TimeFrameToggle timeFrame={timeFrame} onChange={setTimeFrame} />
        </div>

        {(loading || (timeFrame === 'daily' && predictionLoading)) && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-400 mt-2">
              {timeFrame === 'daily' ? 'Loading hourly predictions...' : 'Loading performance data...'}
            </p>
          </div>
        )}

        {(error || (timeFrame === 'daily' && predictionError)) && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <div className="text-red-400 text-sm">
              Error: {error || (predictionError instanceof Error ? predictionError.message : 'Failed to load predictions')}
            </div>
          </div>
        )}

        {!loading && !error && !(timeFrame === 'daily' && predictionLoading) && (
          <>
            {/* Top Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <CumulativePnLCard 
                timeFrame={timeFrame} 
                tokenData={tokenData} 
                value={cumulativePnL} 
                cumulativeTotals={cumulativeTotals}
              />
              <PnLChart data={chartData} timeFrame={timeFrame} />
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {tokenData.map((t) => (
                <TokenTable key={t.symbol} tokenData={t} timeFrame={timeFrame} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PnLDashboard