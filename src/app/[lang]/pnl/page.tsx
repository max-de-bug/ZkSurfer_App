// 'use client'

// import React, { useEffect, useState } from 'react'
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
// import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Maximize2, X } from 'lucide-react'

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
// }

// interface ApiConfig {
//   baseUrl: string
//   endpoints: {
//     cumulativePnL: string
//     chartData: string
//     tokenData: string
//   }
// }

// // -------------------------------------------------------------
// // API config (ready for backend integration)
// // -------------------------------------------------------------
// const apiConfig: ApiConfig = {
//   baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yourapp.com',
//   endpoints: {
//     cumulativePnL: '/api/pnl/cumulative',
//     chartData: '/api/pnl/chart',
//     tokenData: '/api/tokens/pnl',
//   },
// }

// // -------------------------------------------------------------
// // Dummy generators (used as fallback)
// // -------------------------------------------------------------
// const generateDummyChartData = (timeFrame: TimeFrame): PnLData[] => {
//   const now = new Date()
//   const data: PnLData[] = []

//   if (timeFrame === 'daily') {
//     for (let i = 23; i >= 0; i--) {
//       data.push({
//         timestamp: new Date(now.getTime() - i * 3600_000).toISOString(),
//         value: Math.random() * 1000 - 500,
//       })
//     }
//   } else if (timeFrame === 'monthly') {
//     for (let i = 29; i >= 0; i--) {
//       data.push({
//         timestamp: new Date(now.getTime() - i * 86_400_000).toISOString(),
//         value: Math.random() * 5000 - 2500,
//       })
//     }
//   } else {
//     for (let i = 364; i >= 0; i--) {
//       data.push({
//         timestamp: new Date(now.getTime() - i * 86_400_000).toISOString(),
//         value: Math.random() * 10000 - 5000,
//       })
//     }
//   }
//   return data
// }

// const generateDummyTokenTrades = (timeFrame: TimeFrame): TokenTradeData[] => {
//   const days = timeFrame === 'daily' ? 1 : timeFrame === 'monthly' ? 30 : 90
//   const trades: TokenTradeData[] = []
//   let bal = 100
//   for (let i = 0; i < days; i++) {
//     const r = (Math.random() - 0.5) * 0.1 // -5%..+5%
//     const startBalance = bal
//     const endBalance = startBalance * (1 + r)
//     const dailyGain = endBalance - startBalance
//     const cumulativeReturn = ((endBalance - 100) / 100) * 100
//     const d = new Date()
//     d.setDate(d.getDate() - (days - 1 - i))
//     trades.push({
//       day: i + 1,
//       date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
//       trades: Math.floor(Math.random() * 30) + 10,
//       dailyPnLPercent: r * 100,
//       startBalance,
//       endBalance,
//       dailyGain,
//       cumulativeReturn,
//     })
//     bal = endBalance
//   }
//   return trades
// }

// const generateDummyTokenData = (timeFrame: TimeFrame): TokenData[] => {
//   return [
//     { symbol: 'BTC', price: 68_027.84 } as const,
//     { symbol: 'ETH', price: 8_238.17 } as const,
//     { symbol: 'SOL', price: 44_201.47 } as const,
//   ].map((t) => {
//     const trades = generateDummyTokenTrades(timeFrame)
//     const last = trades[trades.length - 1]
//     return {
//       ...t,
//       trades,
//       volume: Math.random() * 1_000_000,
//       cumulativePnL: last ? last.dailyGain * 1000 : Math.random() * 10_000 - 5000,
//       cumulativePercent: last ? last.cumulativeReturn : Math.random() * 20 - 10,
//     }
//   })
// }

// // -------------------------------------------------------------
// // API functions (fallback to dummy on failure)
// // -------------------------------------------------------------
// const fetchCumulativePnL = async (timeFrame: TimeFrame): Promise<number> => {
//   try {
//     const r = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.cumulativePnL}?timeFrame=${timeFrame}`)
//     const data = await r.json()
//     return data.cumulative
//   } catch {
//     return Math.random() * 50_000 - 25_000
//   }
// }

// const fetchChartData = async (timeFrame: TimeFrame, page = 1, limit = 100): Promise<PnLData[]> => {
//   try {
//     const r = await fetch(
//       `${apiConfig.baseUrl}${apiConfig.endpoints.chartData}?timeFrame=${timeFrame}&page=${page}&limit=${limit}`,
//     )
//     const data = await r.json()
//     return data.chartData
//   } catch {
//     return generateDummyChartData(timeFrame)
//   }
// }

// const fetchTokenData = async (
//   timeFrame: TimeFrame,
//   page = 1,
//   limit = 10,
// ): Promise<{ data: TokenData[]; total: number }> => {
//   try {
//     const r = await fetch(
//       `${apiConfig.baseUrl}${apiConfig.endpoints.tokenData}?timeFrame=${timeFrame}&page=${page}&limit=${limit}`,
//     )
//     const data = await r.json()
//     return { data: data.tokens, total: data.total }
//   } catch {
//     return { data: generateDummyTokenData(timeFrame), total: 3 }
//   }
// }

// // -------------------------------------------------------------
// // Small UI bits
// // -------------------------------------------------------------
// const TimeFrameToggle: React.FC<{ timeFrame: TimeFrame; onChange: (t: TimeFrame) => void }> = ({
//   timeFrame,
//   onChange,
// }) => (
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

// // -------------------------------------------------------------
// // Pretty cumulative card (3 tiles, no donut)
// // -------------------------------------------------------------
// const tokenColors: Record<string, string> = { BTC: '#F7931A', ETH: '#627EEA', SOL: '#14F195' }

// const CumulativePnLCard: React.FC<{ timeFrame: TimeFrame; tokenData?: TokenData[]; value?: number }> = ({
//   timeFrame,
//   tokenData = [],
//   value = 0,
// }) => {
//   // Total = sum of token cumulative if available; else use provided value
//   const total = tokenData.length ? tokenData.reduce((s, t) => s + (t?.cumulativePnL || 0), 0) : value

//   // Aggregate % from balances (fallback to avg of token %s)
//   const baseSum = tokenData.reduce((s, t) => s + (t.trades?.[0]?.startBalance ?? 100), 0)
//   const endSum = tokenData.reduce((s, t) => {
//     const last = t.trades?.[t.trades.length - 1]
//     return s + (last ? last.endBalance : 100 * (1 + (t.cumulativePercent ?? 0) / 100))
//   }, 0)
//   const aggPct = tokenData.length ? ((endSum - baseSum) / baseSum) * 100 : 0

//   const isPositive = total >= 0
//   const fmtMoney = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(n))
//   const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`

//   // sparkline data for each token
//   const spark = (t?: TokenData) =>
//     t?.trades?.map((tr, i) => ({ x: i, y: tr.cumulativeReturn })) ??
//     Array.from({ length: 20 }, (_, i) => ({ x: i, y: (Math.random() - 0.5) * 10 }))

//   return (
//     <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 h-full">
//       {/* Headline */}
//       <h3 className="text-sm font-medium text-gray-400">Cumulative PnL ({timeFrame})</h3>
//       <div className="flex items-end mt-3 space-x-3">
//         {isPositive ? <TrendingUp className="w-6 h-6 text-green-500" /> : <TrendingDown className="w-6 h-6 text-red-500" />}
//         <span className={`text-4xl font-extrabold tracking-tight ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
//           {isPositive ? '+' : '-'}
//           {fmtMoney(total)}
//         </span>
//         <span className={`text-lg font-semibold ${aggPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmtPct(aggPct)}</span>
//       </div>

//       {/* 3 evenly spaced tiles */}
//       <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {(['BTC', 'ETH', 'SOL'] as const).map((sym) => {
//           const t = tokenData.find((x) => x.symbol.toUpperCase() === sym)
//           const val = t?.cumulativePnL ?? 0
//           const pct = t?.cumulativePercent ?? 0
//           const pos = val >= 0
//           const gid = `grad-${sym}-${timeFrame}`

//           return (
//             <div key={sym} className="rounded-xl border border-gray-700 bg-gray-900/40 p-4 flex flex-col justify-between min-h-[120px]">
//               <div className="flex items-center justify-between">
//                 <span className="text-xs uppercase tracking-widest text-gray-400">{sym}</span>
//                 <span className={`text-sm font-semibold ${pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmtPct(pct)}</span>
//               </div>

//               <div className={`mt-2 text-xl font-bold ${pos ? 'text-green-400' : 'text-red-400'}`}>
//                 {pos ? '+' : ''}
//                 {fmtMoney(val)}
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
//           )
//         })}
//       </div>
//     </div>
//   )
// }

// // -------------------------------------------------------------
// // Chart card
// // -------------------------------------------------------------
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
//                 border: '1px solid #374151',   // ✅ fixed string
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

// // -------------------------------------------------------------
// // Token table (mini summary cards removed)
// // -------------------------------------------------------------
// const TokenTableModal: React.FC<{
//   tokenData: TokenData
//   timeFrame: TimeFrame
//   onClose: () => void
// }> = ({ tokenData, timeFrame, onClose }) => {
//   const [displayPage, setDisplayPage] = useState(1)
//   const itemsPerPage = 10
//   const totalItems = tokenData.trades.length
//   const totalDisplayPages = Math.ceil(totalItems / itemsPerPage)
//   const currentTrades = tokenData.trades.slice((displayPage - 1) * itemsPerPage, displayPage * itemsPerPage)

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
//               <thead>
//                 <tr className="border-b border-gray-700 text-gray-400">
//                   <th className="text-left py-3">Day</th>
//                   <th className="text-left py-3">Date</th>
//                   <th className="text-left py-3">Trades</th>
//                   <th className="text-left py-3">Daily P&amp;L %</th>
//                   <th className="text-left py-3">Start Balance</th>
//                   <th className="text-left py-3">End Balance</th>
//                   <th className="text-left py-3">Daily Gain $</th>
//                   <th className="text-left py-3">Cumulative Return %</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentTrades.map((tr, i) => (
//                   <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/50">
//                     <td className="py-3 text-gray-300">{tr.day}</td>
//                     <td className="py-3 text-gray-300">{tr.date}</td>
//                     <td className="py-3 text-gray-300">{tr.trades}</td>
//                     <td className={`py-3 font-semibold ${tr.dailyPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                       {tr.dailyPnLPercent >= 0 ? '+' : ''}
//                       {tr.dailyPnLPercent.toFixed(3)}%
//                     </td>
//                     <td className="py-3 text-gray-300">${tr.startBalance.toFixed(2)}</td>
//                     <td className="py-3 text-gray-300">${tr.endBalance.toFixed(2)}</td>
//                     <td className={`py-3 font-semibold ${tr.dailyGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                       {tr.dailyGain >= 0 ? '+' : ''}
//                       ${tr.dailyGain.toFixed(2)}
//                     </td>
//                     <td className={`py-3 font-semibold ${tr.cumulativeReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                       {tr.cumulativeReturn >= 0 ? '+' : ''}
//                       {tr.cumulativeReturn.toFixed(2)}%
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {totalDisplayPages > 1 && (
//             <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
//               <button
//                 onClick={() => setDisplayPage(displayPage - 1)}
//                 disabled={displayPage === 1}
//                 className="flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <ChevronLeft className="w-4 h-4 mr-1" />
//                 Previous
//               </button>
//               <span className="text-sm text-gray-400">
//                 Page {displayPage} of {totalDisplayPages}
//               </span>
//               <button
//                 onClick={() => setDisplayPage(displayPage + 1)}
//                 disabled={displayPage === totalDisplayPages}
//                 className="flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Next
//                 <ChevronRight className="w-4 h-4 ml-1" />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// const TokenTable: React.FC<{
//   tokenData: TokenData
//   timeFrame: TimeFrame
//   currentPage: number
//   totalPages: number
//   onPageChange: (p: number) => void
// }> = ({ tokenData, timeFrame }) => {
//   const [displayPage, setDisplayPage] = useState(1)
//   const [isMaximized, setIsMaximized] = useState(false)
//   const itemsPerPage = 3
//   const totalItems = tokenData.trades.length
//   const totalDisplayPages = Math.ceil(totalItems / itemsPerPage)
//   const showMaximize = timeFrame === 'monthly' || timeFrame === 'all-time'
//   const currentTrades = tokenData.trades.slice((displayPage - 1) * itemsPerPage, displayPage * itemsPerPage)

//   return (
//     <>
//       <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 flex flex-col h-[500px]">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-white">{tokenData.symbol}</h3>
//           <div className="flex items-center space-x-2">
//             <span className="text-sm text-gray-400">${tokenData.price.toLocaleString()}</span>
//             {showMaximize && (
//               <button
//                 onClick={() => setIsMaximized(true)}
//                 className="text-gray-400 hover:text-white p-1"
//                 title="Maximize"
//               >
//                 <Maximize2 className="w-4 h-4" />
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="flex-1 overflow-y-auto">
//           <table className="w-full text-xs">
//             <thead className="sticky top-0 bg-gray-800">
//               <tr className="border-b border-gray-700 text-gray-400">
//                 <th className="text-left py-2">Day</th>
//                 <th className="text-left py-2">Date</th>
//                 <th className="text-left py-2">Trades</th>
//                 <th className="text-left py-2">Daily P&amp;L %</th>
//                 <th className="text-left py-2 hidden sm:table-cell">Start Balance</th>
//                 <th className="text-left py-2 hidden sm:table-cell">End Balance</th>
//                 <th className="text-left py-2">Daily Gain $</th>
//                 <th className="text-left py-2 hidden md:table-cell">Cumulative Return %</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentTrades.map((tr, i) => (
//                 <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/50">
//                   <td className="py-2 text-gray-300">{tr.day}</td>
//                   <td className="py-2 text-gray-300">{tr.date}</td>
//                   <td className="py-2 text-gray-300">{tr.trades}</td>
//                   <td className={`py-2 font-semibold ${tr.dailyPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                     {tr.dailyPnLPercent >= 0 ? '+' : ''}
//                     {tr.dailyPnLPercent.toFixed(3)}%
//                   </td>
//                   <td className="py-2 text-gray-300 hidden sm:table-cell">${tr.startBalance.toFixed(2)}</td>
//                   <td className="py-2 text-gray-300 hidden sm:table-cell">${tr.endBalance.toFixed(2)}</td>
//                   <td className={`py-2 font-semibold ${tr.dailyGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                     {tr.dailyGain >= 0 ? '+' : ''}
//                     ${tr.dailyGain.toFixed(2)}
//                   </td>
//                   <td
//                     className={`py-2 font-semibold hidden md:table-cell ${
//                       tr.cumulativeReturn >= 0 ? 'text-green-400' : 'text-red-400'
//                     }`}
//                   >
//                     {tr.cumulativeReturn >= 0 ? '+' : ''}
//                     {tr.cumulativeReturn.toFixed(2)}%
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {totalDisplayPages > 1 && (
//           <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
//             <button
//               onClick={() => setDisplayPage(displayPage - 1)}
//               disabled={displayPage === 1}
//               className="flex items-center px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <ChevronLeft className="w-4 h-4 mr-1" />
//               Prev
//             </button>
//             <span className="text-sm text-gray-400">Page {displayPage} of {totalDisplayPages}</span>
//             <button
//               onClick={() => setDisplayPage(displayPage + 1)}
//               disabled={displayPage === totalDisplayPages}
//               className="flex items-center px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Next
//               <ChevronRight className="w-4 h-4 ml-1" />
//             </button>
//           </div>
//         )}
//       </div>

//       {isMaximized && (
//         <TokenTableModal tokenData={tokenData} timeFrame={timeFrame} onClose={() => setIsMaximized(false)} />
//       )}
//     </>
//   )
// }

// // -------------------------------------------------------------
// // Main page
// // -------------------------------------------------------------
// const PnLDashboard: React.FC = () => {
//   const [timeFrame, setTimeFrame] = useState<TimeFrame>('daily')
//   const [cumulativePnL, setCumulativePnL] = useState<number>(0)
//   const [chartData, setChartData] = useState<PnLData[]>([])
//   const [tokenData, setTokenData] = useState<TokenData[]>([])
//   const [currentPage, setCurrentPage] = useState(1)
//   const [totalPages, setTotalPages] = useState(1)
//   const [loading, setLoading] = useState(false)

//   const loadData = async (newTimeFrame: TimeFrame, page = 1) => {
//     setLoading(true)
//     try {
//       const [cum, chart, tokens] = await Promise.all([
//         fetchCumulativePnL(newTimeFrame),
//         fetchChartData(newTimeFrame, page),
//         fetchTokenData(newTimeFrame, page),
//       ])
//       setCumulativePnL(cum)
//       setChartData(chart)
//       setTokenData(tokens.data)
//       setTotalPages(Math.ceil(tokens.total / 10))
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     loadData(timeFrame)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [timeFrame])

//   return (
//     <div className="min-h-screen bg-gray-900">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
//           <h1 className="text-3xl font-bold text-white">PnL Dashboard</h1>
//           <TimeFrameToggle timeFrame={timeFrame} onChange={setTimeFrame} />
//         </div>

//         {/* Loading */}
//         {loading && (
//           <div className="text-center py-4">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//           </div>
//         )}

//         {/* Top Row (no fixed heights so no dead space) */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//           <CumulativePnLCard timeFrame={timeFrame} tokenData={tokenData} value={cumulativePnL} />
//           <PnLChart data={chartData} timeFrame={timeFrame} />
//         </div>

//         {/* Bottom Row */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//           {tokenData.map((t) => (
//             <TokenTable
//               key={t.symbol}
//               tokenData={t}
//               timeFrame={timeFrame}
//               currentPage={currentPage}
//               totalPages={totalPages}
//               onPageChange={setCurrentPage}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default PnLDashboard


'use client'

import React, { useEffect, useState } from 'react'
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
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Maximize2, X } from 'lucide-react'

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
}

interface ApiConfig {
  baseUrl: string
  endpoints: {
    cumulativePnL: string
    chartData: string
    tokenData: string
  }
}

/** ---- Today-prediction API minimal typing (we only use forecast_today_hourly) ---- */
type Signal = 'LONG' | 'SHORT'
interface HourlyForecast {
  time: string
  signal: Signal
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
// API config (ready for backend integration)
// -------------------------------------------------------------
const apiConfig: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yourapp.com',
  endpoints: {
    cumulativePnL: '/api/pnl/cumulative',
    chartData: '/api/pnl/chart',
    tokenData: '/api/tokens/pnl',
  },
}

// -------------------------------------------------------------
// Dummy generators (used as fallback)
// -------------------------------------------------------------
const generateDummyChartData = (timeFrame: TimeFrame): PnLData[] => {
  const now = new Date()
  const data: PnLData[] = []

  if (timeFrame === 'daily') {
    for (let i = 23; i >= 0; i--) {
      data.push({
        timestamp: new Date(now.getTime() - i * 3600_000).toISOString(),
        value: Math.random() * 1000 - 500,
      })
    }
  } else if (timeFrame === 'monthly') {
    for (let i = 29; i >= 0; i--) {
      data.push({
        timestamp: new Date(now.getTime() - i * 86_400_000).toISOString(),
        value: Math.random() * 5000 - 2500,
      })
    }
  } else {
    for (let i = 364; i >= 0; i--) {
      data.push({
        timestamp: new Date(now.getTime() - i * 86_400_000).toISOString(),
        value: Math.random() * 10000 - 5000,
      })
    }
  }
  return data
}

const generateDummyTokenTrades = (timeFrame: TimeFrame): TokenTradeData[] => {
  const days = timeFrame === 'daily' ? 1 : timeFrame === 'monthly' ? 30 : 90
  const trades: TokenTradeData[] = []
  let bal = 100
  for (let i = 0; i < days; i++) {
    const r = (Math.random() - 0.5) * 0.1 // -5%..+5%
    const startBalance = bal
    const endBalance = startBalance * (1 + r)
    const dailyGain = endBalance - startBalance
    const cumulativeReturn = ((endBalance - 100) / 100) * 100
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    trades.push({
      day: i + 1,
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      trades: Math.floor(Math.random() * 30) + 10,
      dailyPnLPercent: r * 100,
      startBalance,
      endBalance,
      dailyGain,
      cumulativeReturn,
    })
    bal = endBalance
  }
  return trades
}

const generateDummyTokenData = (timeFrame: TimeFrame): TokenData[] => {
  return [
    { symbol: 'BTC', price: 68_027.84 } as const,
    { symbol: 'ETH', price: 8_238.17 } as const,
    { symbol: 'SOL', price: 44_201.47 } as const,
  ].map((t) => {
    const trades = generateDummyTokenTrades(timeFrame)
    const last = trades[trades.length - 1]
    return {
      ...t,
      trades,
      volume: Math.random() * 1_000_000,
      cumulativePnL: last ? last.dailyGain * 1000 : Math.random() * 10_000 - 5000,
      cumulativePercent: last ? last.cumulativeReturn : Math.random() * 20 - 10,
    }
  })
}

// -------------------------------------------------------------
// API functions (fallback to dummy on failure)
// -------------------------------------------------------------
const fetchCumulativePnL = async (timeFrame: TimeFrame): Promise<number> => {
  try {
    const r = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.cumulativePnL}?timeFrame=${timeFrame}`)
    const data = await r.json()
    return data.cumulative
  } catch {
    return Math.random() * 50_000 - 25_000
  }
}

const fetchChartData = async (timeFrame: TimeFrame, page = 1, limit = 100): Promise<PnLData[]> => {
  try {
    const r = await fetch(
      `${apiConfig.baseUrl}${apiConfig.endpoints.chartData}?timeFrame=${timeFrame}&page=${page}&limit=${limit}`,
    )
    const data = await r.json()
    return data.chartData
  } catch {
    return generateDummyChartData(timeFrame)
  }
}

const fetchTokenData = async (
  timeFrame: TimeFrame,
  page = 1,
  limit = 10,
): Promise<{ data: TokenData[]; total: number }> => {
  try {
    const r = await fetch(
      `${apiConfig.baseUrl}${apiConfig.endpoints.tokenData}?timeFrame=${timeFrame}&page=${page}&limit=${limit}`,
    )
    const data = await r.json()
    return { data: data.tokens, total: data.total }
  } catch {
    return { data: generateDummyTokenData(timeFrame), total: 3 }
  }
}

// -------------------------------------------------------------
// Small UI bits
// -------------------------------------------------------------
const TimeFrameToggle: React.FC<{ timeFrame: TimeFrame; onChange: (t: TimeFrame) => void }> = ({
  timeFrame,
  onChange,
}) => (
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

// -------------------------------------------------------------
// Pretty cumulative card (3 tiles, no donut)
// -------------------------------------------------------------
const tokenColors: Record<string, string> = { BTC: '#F7931A', ETH: '#627EEA', SOL: '#14F195' }

const CumulativePnLCard: React.FC<{ timeFrame: TimeFrame; tokenData?: TokenData[]; value?: number }> = ({
  timeFrame,
  tokenData = [],
  value = 0,
}) => {
  // Total = sum of token cumulative if available; else use provided value
  const total = tokenData.length ? tokenData.reduce((s, t) => s + (t?.cumulativePnL || 0), 0) : value

  // Aggregate % from balances (fallback to avg of token %s)
  const baseSum = tokenData.reduce((s, t) => s + (t.trades?.[0]?.startBalance ?? 100), 0)
  const endSum = tokenData.reduce((s, t) => {
    const last = t.trades?.[t.trades.length - 1]
    return s + (last ? last.endBalance : 100 * (1 + (t.cumulativePercent ?? 0) / 100))
  }, 0)
  const aggPct = tokenData.length ? ((endSum - baseSum) / baseSum) * 100 : 0

  const isPositive = total >= 0
  const fmtMoney = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(n))
  const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`

  // sparkline data for each token
  const spark = (t?: TokenData) =>
    t?.trades?.map((tr, i) => ({ x: i, y: tr.cumulativeReturn })) ??
    Array.from({ length: 20 }, (_, i) => ({ x: i, y: (Math.random() - 0.5) * 10 }))

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 h-full">
      {/* Headline */}
      <h3 className="text-sm font-medium text-gray-400">Cumulative PnL ({timeFrame})</h3>
      <div className="flex items-end mt-3 space-x-3">
        {isPositive ? <TrendingUp className="w-6 h-6 text-green-500" /> : <TrendingDown className="w-6 h-6 text-red-500" />}
        <span className={`text-4xl font-extrabold tracking-tight ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '+' : '-'}
          {fmtMoney(total)}
        </span>
        <span className={`text-lg font-semibold ${aggPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmtPct(aggPct)}</span>
      </div>

      {/* 3 evenly spaced tiles */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(['BTC', 'ETH', 'SOL'] as const).map((sym) => {
          const t = tokenData.find((x) => x.symbol.toUpperCase() === sym)
          const val = t?.cumulativePnL ?? 0
          const pct = t?.cumulativePercent ?? 0
          const pos = val >= 0
          const gid = `grad-${sym}-${timeFrame}`

          return (
            <div key={sym} className="rounded-xl border border-gray-700 bg-gray-900/40 p-4 flex flex-col justify-between min-h-[120px]">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-gray-400">{sym}</span>
                <span className={`text-sm font-semibold ${pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmtPct(pct)}</span>
              </div>

              <div className={`mt-2 text-xl font-bold ${pos ? 'text-green-400' : 'text-red-400'}`}>
                {pos ? '+' : ''}
                {fmtMoney(val)}
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
          )
        })}
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// Chart card
// -------------------------------------------------------------
const PnLChart: React.FC<{ data: PnLData[]; timeFrame: TimeFrame }> = ({ data, timeFrame }) => {
  const fmtX = (ts: string) => {
    const d = new Date(ts)
    if (timeFrame === 'daily') return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    if (timeFrame === 'monthly') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 h-full">
      <h3 className="text-lg font-semibold text-white mb-4">PnL Trend ({timeFrame})</h3>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" tickFormatter={fmtX} className="text-xs" stroke="#9CA3AF" />
            <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} className="text-xs" stroke="#9CA3AF" />
            <Tooltip
              labelFormatter={(ts) => new Date(ts as string).toLocaleString('en-US')}
              formatter={(v: number) => [
                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v),
                'PnL',
              ]}
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

// -------------------------------------------------------------
// Token table (modal)
// -------------------------------------------------------------
const TokenTableModal: React.FC<{
  tokenData: TokenData
  timeFrame: TimeFrame
  onClose: () => void
}> = ({ tokenData, timeFrame, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
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
                  <th className="text-left py-3">Return %</th>
                  <th className="text-left py-3">Start Balance</th>
                  <th className="text-left py-3">End Balance</th>
                  <th className="text-left py-3">Gain $</th>
                  <th className="text-left py-3">Cumulative %</th>
                </tr>
              </thead>
              <tbody>
                {tokenData.trades.map((tr, i) => (
                  <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="py-3 text-gray-300">{tr.day}</td>
                    <td className="py-3 text-gray-300">{tr.date}</td>
                    <td className="py-3 text-gray-300">{tr.trades}</td>
                    <td className={`py-3 font-semibold ${tr.dailyPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tr.dailyPnLPercent >= 0 ? '+' : ''}{tr.dailyPnLPercent.toFixed(3)}%
                    </td>
                    <td className="py-3 text-gray-300">${tr.startBalance.toFixed(2)}</td>
                    <td className="py-3 text-gray-300">${tr.endBalance.toFixed(2)}</td>
                    <td className={`py-3 font-semibold ${tr.dailyGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tr.dailyGain >= 0 ? '+' : ''}${tr.dailyGain.toFixed(2)}
                    </td>
                    <td className={`py-3 font-semibold ${tr.cumulativeReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tr.cumulativeReturn >= 0 ? '+' : ''}{tr.cumulativeReturn.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* no pagination */}
        </div>
      </div>
    </div>
  )
}


const TokenTable: React.FC<{
  tokenData: TokenData
  timeFrame: TimeFrame
}> = ({ tokenData, timeFrame }) => {
  const [isMaximized, setIsMaximized] = useState(false)
  const showMaximize = timeFrame === 'monthly' || timeFrame === 'all-time'

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 flex flex-col h-[500px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{tokenData.symbol}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">${tokenData.price.toLocaleString()}</span>
            {showMaximize && (
              <button
                onClick={() => setIsMaximized(true)}
                className="text-gray-400 hover:text-white p-1"
                title="Maximize"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Fixed-height scroll area */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs table-fixed">
            <thead className="sticky top-0 bg-gray-800">
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left py-2 w-12">Step</th>
                <th className="text-left py-2 w-24">Time</th>
                <th className="text-left py-2 w-16">Trades</th>
                <th className="text-left py-2 w-20">Return %</th>
                <th className="text-left py-2 hidden sm:table-cell w-24">Start Bal</th>
                <th className="text-left py-2 hidden sm:table-cell w-24">End Bal</th>
                <th className="text-left py-2 w-20">Gain $</th>
                <th className="text-left py-2 hidden md:table-cell w-24">Cum. %</th>
              </tr>
            </thead>
            <tbody>
              {tokenData.trades.map((tr, i) => (
                <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="py-2 text-gray-300">{tr.day}</td>
                  <td className="py-2 text-gray-300">{tr.date}</td>
                  <td className="py-2 text-gray-300">{tr.trades}</td>
                  <td className={`py-2 font-semibold ${tr.dailyPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tr.dailyPnLPercent >= 0 ? '+' : ''}{tr.dailyPnLPercent.toFixed(3)}%
                  </td>
                  <td className="py-2 text-gray-300 hidden sm:table-cell">${tr.startBalance.toFixed(2)}</td>
                  <td className="py-2 text-gray-300 hidden sm:table-cell">${tr.endBalance.toFixed(2)}</td>
                  <td className={`py-2 font-semibold ${tr.dailyGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tr.dailyGain >= 0 ? '+' : ''}${tr.dailyGain.toFixed(2)}
                  </td>
                  <td className={`py-2 font-semibold hidden md:table-cell ${tr.cumulativeReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tr.cumulativeReturn >= 0 ? '+' : ''}{tr.cumulativeReturn.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* no pagination footer */}
      </div>

      {isMaximized && (
        <TokenTableModal tokenData={tokenData} timeFrame={timeFrame} onClose={() => setIsMaximized(false)} />
      )}
    </>
  )
}


// -------------------------------------------------------------
// Main page
// -------------------------------------------------------------
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

const PnLDashboard: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('daily')
  const [cumulativePnL, setCumulativePnL] = useState<number>(0)
  const [chartData, setChartData] = useState<PnLData[]>([])
  const [tokenData, setTokenData] = useState<TokenData[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  // ---- Call /api/today-prediction on page load (SWR) ----
  const {
    data: prediction,
    error: predictionError,
    isLoading: predictionLoading,
  } = useSWR<PredictionAPIResponse>('/api/today-prediction', swrFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    shouldRetryOnError: true,
  })

  const loadData = async (newTimeFrame: TimeFrame, page = 1) => {
    setLoading(true)
    try {
      const [cum, chart, tokens] = await Promise.all([
        fetchCumulativePnL(newTimeFrame),
        fetchChartData(newTimeFrame, page),
        fetchTokenData(newTimeFrame, page),
      ])
      setCumulativePnL(cum)
      setChartData(chart)
      setTokenData(tokens.data) // will be overridden by prediction for "daily" below
      setTotalPages(Math.ceil(tokens.total / 10))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(timeFrame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFrame])

  // ---- Use the prediction ONLY for 'daily' timeframe ----
  useEffect(() => {
    if (timeFrame !== 'daily') return
    const fth = prediction?.forecast_today_hourly
    if (!fth) return

    const symbols = ['BTC', 'ETH', 'SOL']

    const toTradesFromForecast = (sym: string): { trades: TokenTradeData[]; lastPrice: number } => {
      const rows = fth[sym] ?? []
      let balance = 100
      const trades: TokenTradeData[] = rows.map((row, idx) => {
        // Approx hourly return based on forecast vs entry
        const ret = (row.forecast_price - row.entry_price) / (row.entry_price || 1)
        const start = balance
        const end = start * (1 + ret)
        const gain = end - start
        const cumulativeReturn = ((end - 100) / 100) * 100
        const t = new Date(row.time)
        const label = t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        balance = end
        return {
          day: idx + 1,
          date: label,
          trades: 1,
          dailyPnLPercent: ret * 100,
          startBalance: start,
          endBalance: end,
          dailyGain: gain,
          cumulativeReturn,
        }
      })

      const lastPrice = rows.length ? rows[rows.length - 1].current_price : 0
      return { trades, lastPrice }
    }

    const newTokens: TokenData[] = symbols.map((sym) => {
      const { trades, lastPrice } = toTradesFromForecast(sym)
      const last = trades[trades.length - 1]
      const cumulativePercent = last ? last.cumulativeReturn : 0
      const cumulativePnL = last ? last.endBalance - 100 : 0
      return {
        symbol: sym,
        price: lastPrice,
        cumulativePnL,
        cumulativePercent,
        volume: 0,
        trades,
      }
    })

    setTokenData(newTokens)
    // Optional: set chart from aggregated hourly PnL signal
    const syntheticChart: PnLData[] = (fth['BTC'] ?? []).map((r) => ({
      timestamp: r.time,
      value: (r.forecast_price - r.entry_price) * 10, // simple scaled delta for visual
    }))
    setChartData(syntheticChart)
  }, [prediction, timeFrame])

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-3xl font-bold text-white">PnL Dashboard</h1>
          <TimeFrameToggle timeFrame={timeFrame} onChange={setTimeFrame} />
        </div>

        {/* Loading (either local loads or SWR) */}
        {(loading || predictionLoading) && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}
        {predictionError && (
          <div className="text-sm text-red-400 mb-4">Failed to load /api/today-prediction</div>
        )}

        {/* Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CumulativePnLCard timeFrame={timeFrame} tokenData={tokenData} value={cumulativePnL} />
          <PnLChart data={chartData} timeFrame={timeFrame} />
        </div>

        {/* Bottom Row */}

<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
  {tokenData.map((t) => (
    <TokenTable
      key={t.symbol}
      tokenData={t}
      timeFrame={timeFrame}
    />
  ))}
</div>


      </div>
    </div>
  )
}

export default PnLDashboard
