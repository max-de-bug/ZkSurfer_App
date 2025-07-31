// import React, { useState, useRef, useEffect } from 'react';
// import { Maximize2, Minimize2, X } from 'lucide-react';
// import {
//   createChart,
//   CandlestickSeries,
//   HistogramSeries,
//   LineSeries,
//   UTCTimestamp,
// } from 'lightweight-charts';

// interface HourlyForecast {
//   time: string;
//   signal: 'LONG' | 'SHORT' | 'HOLD';
//   entry_price: number | null;
//   stop_loss: number | null;
//   take_profit: number | null;
//   forecast_price: number;
//   current_price: number;
//   deviation_percent: number | string;
//   accuracy_percent: number | string;
//   risk_reward_ratio: number;
//   sentiment_score: number;
//   confidence_50: [number, number];
//   confidence_80: [number, number];
//   confidence_90: [number, number];
// }

// interface PriceData {
//   date: string;
//   price: number;
// }

// interface CandlestickData {
//   timestamp: number;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
//   volume: number;
// }

// interface ForecastData {
//   date: string;
//   signal: 'LONG' | 'SHORT';
//   entry: number;
//   stop_loss: number;
//   take_profit: number;
//   confidence_intervals: {
//     50: [number, number];
//     80: [number, number];
//     90: [number, number];
//   };
//   deviation_percent?: number | string;
//   overall_accuracy_percent?: number | string;
// }

// interface PriceChartProps {
//   priceHistory?: PriceData[];
//   forecast?: ForecastData[];
//   hourlyForecast?: HourlyForecast[];
//   className?: string;
// }

// interface TooltipData {
//   x: number;
//   y: number;
//   data: any;
//   visible: boolean;
//   type?: 'chart' | 'info' | 'trade';
// }

// // Enhanced PnL calculation for trading markers
// const calculateTradePnL = (currentIndex: number, hourlyForecast: HourlyForecast[]) => {
//   if (currentIndex >= hourlyForecast.length - 1) {
//     return { pnl: 0, pnlPercentage: 0, exitPrice: 0, exitReason: 'pending' };
//   }

//   const currentForecast = hourlyForecast[currentIndex];
//   const nextForecast = hourlyForecast[currentIndex + 1];

//   if (!currentForecast || !nextForecast || 
//       currentForecast.signal === 'HOLD' || 
//       !currentForecast.entry_price) {
//     return { pnl: 0, pnlPercentage: 0, exitPrice: 0, exitReason: 'pending' };
//   }

//   const entryPrice = currentForecast.entry_price;
//   const stopLoss = currentForecast.stop_loss;
//   const takeProfit = currentForecast.take_profit;
//   const nextPrice = nextForecast.current_price;
  
//   let exitPrice = nextPrice;
//   let exitReason = 'next_hour';

//   // Determine exit price based on which level was hit first
//   if (currentForecast.signal === 'LONG') {
//     if (stopLoss && nextPrice <= stopLoss) {
//       exitPrice = stopLoss;
//       exitReason = 'stop_loss';
//     } else if (takeProfit && nextPrice >= takeProfit) {
//       exitPrice = takeProfit;
//       exitReason = 'take_profit';
//     }
//   } else if (currentForecast.signal === 'SHORT') {
//     if (stopLoss && nextPrice >= stopLoss) {
//       exitPrice = stopLoss;
//       exitReason = 'stop_loss';
//     } else if (takeProfit && nextPrice <= takeProfit) {
//       exitPrice = takeProfit;
//       exitReason = 'take_profit';
//     }
//   }

//   // Calculate PnL based on position type
//   let pnl = 0;
//   if (currentForecast.signal === 'LONG') {
//     pnl = exitPrice - entryPrice;
//   } else if (currentForecast.signal === 'SHORT') {
//     pnl = entryPrice - exitPrice;
//   }

//   const pnlPercentage = (pnl / entryPrice) * 100;

//   return { pnl, pnlPercentage, exitPrice, exitReason };
// };

// // Segmented Control Component
// const SegmentedControl = ({
//   options,
//   selected,
//   onChange,
//   className = ""
// }: {
//   options: { value: string; label: string }[];
//   selected: string;
//   onChange: (value: string) => void;
//   className?: string;
// }) => {
//   return (
//     <div className={`inline-flex bg-[#1a2332] rounded-lg p-1 ${className}`}>
//       {options.map((option) => (
//         <button
//           key={option.value}
//           onClick={() => onChange(option.value)}
//           className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded-md transition-all duration-200 whitespace-nowrap ${selected === option.value
//             ? 'bg-blue-600 text-white shadow-md'
//             : 'text-gray-400 hover:text-white hover:bg-[#2a3441]'
//             }`}
//         >
//           {option.label}
//         </button>
//       ))}
//     </div>
//   );
// };

// const fetchRealBitcoinData = async (
//   setDataSource?: (src: 'real' | 'fallback') => void
// ): Promise<CandlestickData[]> => {
//   try {
//     const res = await fetch(
//       'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=60'
//     );
//     if (!res.ok) throw new Error(`Binance returned ${res.status}`);
//     const raw = await res.json() as any[][];
//     setDataSource?.('real');
//     return raw.map(([ts, open, high, low, close, volume]) => ({
//       timestamp: ts,
//       open: +open,
//       high: +high,
//       low: +low,
//       close: +close,
//       volume: +volume,
//     }));
//   } catch (err) {
//     console.error('Failed to fetch real candles, falling back:', err);
//     setDataSource?.('fallback');
//     return generateFallbackData();
//   }
// };

// const fetchCurrentBitcoinPrice = async (): Promise<number> => {
//   try {
//     const res = await fetch(
//       'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
//     );
//     if (!res.ok) throw new Error(`Binance ticker returned ${res.status}`);
//     const json = await res.json() as { price: string };
//     return parseFloat(json.price);
//   } catch (err) {
//     console.error('Failed to fetch current price:', err);
//     return 0;
//   }
// };

// // Fallback data generator
// const generateFallbackData = (): CandlestickData[] => {
//   const data: CandlestickData[] = [];
//   let currentPrice = 118400; // More realistic current BTC price
//   const now = Date.now();

//   for (let i = 59; i >= 0; i--) {
//     const timestamp = now - (i * 60000);
//     const volatility = 0.002;

//     const open = currentPrice;
//     const change = (Math.random() - 0.5) * volatility * currentPrice;
//     const close = open + change;

//     const high = Math.max(open, close) + Math.random() * volatility * currentPrice * 0.5;
//     const low = Math.min(open, close) - Math.random() * volatility * currentPrice * 0.5;

//     const volume = Math.random() * 1000000 + 500000;

//     data.push({
//       timestamp,
//       open,
//       high,
//       low,
//       close,
//       volume
//     });

//     currentPrice = close + (118500 - 118400) / 60; // Slight upward trend
//   }

//   return data;
// };

// const PriceChart: React.FC<PriceChartProps> = ({
//   priceHistory = [
//     { date: "2025-07-02", price: 104639.48 },
//     { date: "2025-07-03", price: 104611.16 },
//     { date: "2025-07-04", price: 103296.19 },
//     { date: "2025-07-05", price: 101348.19 },
//     { date: "2025-07-06", price: 101987.11 },
//     { date: "2025-07-07", price: 105436.11 },
//     { date: "2025-07-08", price: 106371.09 }
//   ],
//   forecast = [
//     {
//       date: "2025-07-14",
//       signal: "LONG" as const,
//       entry: 118450,
//       stop_loss: 117936,
//       take_profit: 118864,
//       confidence_intervals: {
//         50: [118400, 118500],
//         80: [118350, 118550],
//         90: [118300, 118600]
//       },
//       deviation_percent: 1.5,
//       overall_accuracy_percent: 98.5
//     }
//   ],
//   className = "",
//   hourlyForecast = [
//     {
//       time: "2025-07-15T07:00:00+00:00",
//       signal: "LONG" as const,
//       entry_price: 118450,
//       stop_loss: 117936,
//       take_profit: 118864,
//       forecast_price: 118510,
//       current_price: 118450,
//       deviation_percent: "N/A",
//       accuracy_percent: "N/A",
//       risk_reward_ratio: 2.1,
//       sentiment_score: 27.39,
//       confidence_50: [118400, 118500],
//       confidence_80: [118350, 118550],
//       confidence_90: [118300, 118600]
//     },
//     {
//       time: "2025-07-15T08:00:00+00:00",
//       signal: "SHORT" as const,
//       entry_price: 118400,
//       stop_loss: 118800,
//       take_profit: 117800,
//       forecast_price: 118200,
//       current_price: 118200,
//       deviation_percent: -0.21,
//       accuracy_percent: 99.79,
//       risk_reward_ratio: 1.5,
//       sentiment_score: 32.27,
//       confidence_50: [118150, 118250],
//       confidence_80: [118100, 118300],
//       confidence_90: [118050, 118350]
//     },
//     {
//       time: "2025-07-15T09:00:00+00:00",
//       signal: "HOLD" as const,
//       entry_price: null,
//       stop_loss: null,
//       take_profit: null,
//       forecast_price: 118300,
//       current_price: 118300,
//       deviation_percent: -0.07,
//       accuracy_percent: 99.93,
//       risk_reward_ratio: 0.21,
//       sentiment_score: 43.16,
//       confidence_50: [118250, 118350],
//       confidence_80: [118200, 118400],
//       confidence_90: [118150, 118450]
//     },
//     {
//       time: "2025-07-15T10:00:00+00:00",
//       signal: "LONG" as const,
//       entry_price: 118350,
//       stop_loss: 118000,
//       take_profit: 118700,
//       forecast_price: 118400,
//       current_price: 118350,
//       deviation_percent: -0.03,
//       accuracy_percent: 99.97,
//       risk_reward_ratio: 1.0,
//       sentiment_score: 41.33,
//       confidence_50: [118320, 118380],
//       confidence_80: [118300, 118400],
//       confidence_90: [118280, 118420]
//     }
//   ],
// }) => {
//   const [selectedTimeframe, setSelectedTimeframe] = useState<'TODAY' | 'PAST_7D' | 'NEXT_3D'>('TODAY');
//   const [selectedSubTimeframe, setSelectedSubTimeframe] = useState<'3D' | '7D'>('3D');
//   const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'SOL' | 'ETH'>('BTC');
//   const [tooltip, setTooltip] = useState<TooltipData>({ x: 0, y: 0, data: null, visible: false, type: 'chart' });
//   const [isMobile, setIsMobile] = useState(false);
//   const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
//   const [currentPrice, setCurrentPrice] = useState<number>(0);
//   const [isLoadingData, setIsLoadingData] = useState(true);
//   const [dataSource, setDataSource] = useState<'real' | 'fallback'>('real');
//   const [isChartMaximized, setIsChartMaximized] = useState(false);
  
//   // Chart refs
//   const chartContainer = useRef<HTMLDivElement>(null);
//   const chartInstance = useRef<any>(null);
//   const fullScreenChartContainer = useRef<HTMLDivElement>(null);
//   const fullScreenChartInstance = useRef<any>(null);

//   const [latest, setLatest] = useState<{
//     deviation_percent?: number | string;
//     overall_accuracy_percent?: number | string;
//   } | null>(null);

//   useEffect(() => {
//     const mockLatest = {
//       deviation_percent: 1.5,
//       overall_accuracy_percent: 98.5
//     };
//     setLatest(mockLatest);
//   }, []);

//   useEffect(() => {
//     const initializeRealData = async () => {
//       setIsLoadingData(true);
//       const realData = await fetchRealBitcoinData(setDataSource);
//       setCandlestickData(realData);

//       if (realData.length > 0) {
//         setCurrentPrice(realData[realData.length - 1].close);
//       }

//       setIsLoadingData(false);
//     };

//     initializeRealData();
//   }, []);

//   useEffect(() => {
//     const id = setInterval(async () => {
//       try {
//         const live = await fetchCurrentBitcoinPrice();
//         if (live > 0) {
//           setCurrentPrice(live);
//         }
//       } catch {
//         // swallow or log
//       }
//     }, 10_000);
//     return () => clearInterval(id);
//   }, []);

//   // Mobile detection
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // Handle escape key to close maximized chart
//   useEffect(() => {
//     const handleEscape = (e: KeyboardEvent) => {
//       if (e.key === 'Escape' && isChartMaximized) {
//         setIsChartMaximized(false);
//       }
//     };

//     if (isChartMaximized) {
//       document.addEventListener('keydown', handleEscape);
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }

//     return () => {
//       document.removeEventListener('keydown', handleEscape);
//       document.body.style.overflow = 'unset';
//     };
//   }, [isChartMaximized]);

//   // Create SVG overlay for confidence areas and markers
//   const createSVGOverlay = (container: HTMLDivElement, isFullScreen = false) => {
//     const lastHourly = hourlyForecast && hourlyForecast.length > 0 
//       ? hourlyForecast[hourlyForecast.length - 1] 
//       : null;

//     if (!lastHourly || candlestickData.length === 0) return null;

//     const { clientWidth, clientHeight } = container;
//     const padding = isFullScreen ? 60 : (isMobile ? 20 : 35);
    
//     // Calculate price range for Y positioning
//     const prices = candlestickData.flatMap(d => [d.open, d.high, d.low, d.close]);
//     prices.push(
//       lastHourly.forecast_price,
//       lastHourly.confidence_50[0], lastHourly.confidence_50[1],
//       lastHourly.confidence_80[0], lastHourly.confidence_80[1],
//       lastHourly.confidence_90[0], lastHourly.confidence_90[1]
//     );
    
//     if (lastHourly.entry_price) prices.push(lastHourly.entry_price);
//     if (lastHourly.stop_loss) prices.push(lastHourly.stop_loss);
//     if (lastHourly.take_profit) prices.push(lastHourly.take_profit);

//     const minPrice = Math.min(...prices) * 0.998;
//     const maxPrice = Math.max(...prices) * 1.002;
//     const priceRange = maxPrice - minPrice;
//     const chartHeight = clientHeight - 120; // Account for volume area

//     const getY = (price: number) => padding + (1 - (price - minPrice) / priceRange) * chartHeight;
//     const getX = (ratio: number) => padding + ratio * (clientWidth - 2 * padding);

//     // Calculate positions
//     const currentX = getX(0.7); // Current time position
//     const futureX = getX(0.95); // Future projection end

//     // Create confidence areas
//     const createConfidencePath = (upper: number, lower: number) => {
//       const currentY = getY(candlestickData[candlestickData.length - 1]?.close || currentPrice);
//       const upperY = getY(upper);
//       const lowerY = getY(lower);
//       const midY = (upperY + lowerY) / 2;

//       return `
//         M ${currentX},${currentY}
//         Q ${currentX + 50},${currentY} ${futureX - 50},${midY}
//         L ${futureX},${upperY}
//         L ${futureX},${lowerY}
//         Q ${futureX - 50},${midY} ${currentX},${currentY}
//         Z
//       `;
//     };

//     // Create actual DOM SVG element
//     const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
//     svg.setAttribute('width', clientWidth.toString());
//     svg.setAttribute('height', clientHeight.toString());
//     svg.setAttribute('viewBox', `0 0 ${clientWidth} ${clientHeight}`);
//     svg.style.position = 'absolute';
//     svg.style.top = '0';
//     svg.style.left = '0';
//     svg.style.pointerEvents = 'none';
//     svg.style.zIndex = '10';

//     // Add 90% Confidence Area (if not mobile or is fullscreen)
//     if (!isMobile || isFullScreen) {
//       const path90 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
//       path90.setAttribute('d', createConfidencePath(lastHourly.confidence_90[1], lastHourly.confidence_90[0]));
//       path90.setAttribute('fill', '#22c55e');
//       path90.setAttribute('fill-opacity', '0.15');
//       path90.setAttribute('stroke', '#22c55e');
//       path90.setAttribute('stroke-opacity', '0.4');
//       path90.setAttribute('stroke-width', '1');
//       svg.appendChild(path90);
//     }

//     // Add 80% Confidence Area (if not mobile or is fullscreen)
//     if (!isMobile || isFullScreen) {
//       const path80 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
//       path80.setAttribute('d', createConfidencePath(lastHourly.confidence_80[1], lastHourly.confidence_80[0]));
//       path80.setAttribute('fill', '#f59e0b');
//       path80.setAttribute('fill-opacity', '0.2');
//       path80.setAttribute('stroke', '#f59e0b');
//       path80.setAttribute('stroke-opacity', '0.5');
//       path80.setAttribute('stroke-width', '1');
//       svg.appendChild(path80);
//     }

//     // Add 50% Confidence Area
//     const path50 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
//     path50.setAttribute('d', createConfidencePath(lastHourly.confidence_50[1], lastHourly.confidence_50[0]));
//     path50.setAttribute('fill', '#3b82f6');
//     path50.setAttribute('fill-opacity', '0.25');
//     path50.setAttribute('stroke', '#3b82f6');
//     path50.setAttribute('stroke-opacity', '0.6');
//     path50.setAttribute('stroke-width', '2');
//     svg.appendChild(path50);

//     // Add Support/Resistance Lines
//     const support = Math.min(...candlestickData.slice(-20).map(d => d.low));
//     const resistance = Math.max(...candlestickData.slice(-20).map(d => d.high));

//     // Support Line
//     const supportLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
//     supportLine.setAttribute('x1', padding.toString());
//     supportLine.setAttribute('y1', getY(support).toString());
//     supportLine.setAttribute('x2', (clientWidth - padding).toString());
//     supportLine.setAttribute('y2', getY(support).toString());
//     supportLine.setAttribute('stroke', '#ef4444');
//     supportLine.setAttribute('stroke-width', '2');
//     supportLine.setAttribute('stroke-dasharray', '5,5');
//     supportLine.setAttribute('opacity', '0.8');
//     svg.appendChild(supportLine);

//     // Support Label
//     const supportText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
//     supportText.setAttribute('x', (padding + 5).toString());
//     supportText.setAttribute('y', (getY(support) - 8).toString());
//     supportText.setAttribute('fill', '#ef4444');
//     supportText.setAttribute('font-size', isFullScreen ? "14" : isMobile ? "10" : "12");
//     supportText.setAttribute('font-weight', 'bold');
//     supportText.textContent = `SUPPORT ${Math.round(support).toLocaleString()}`;
//     svg.appendChild(supportText);

//     // Resistance Line
//     const resistanceLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
//     resistanceLine.setAttribute('x1', padding.toString());
//     resistanceLine.setAttribute('y1', getY(resistance).toString());
//     resistanceLine.setAttribute('x2', (clientWidth - padding).toString());
//     resistanceLine.setAttribute('y2', getY(resistance).toString());
//     resistanceLine.setAttribute('stroke', '#10b981');
//     resistanceLine.setAttribute('stroke-width', '2');
//     resistanceLine.setAttribute('stroke-dasharray', '5,5');
//     resistanceLine.setAttribute('opacity', '0.8');
//     svg.appendChild(resistanceLine);

//     // Resistance Label
//     const resistanceText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
//     resistanceText.setAttribute('x', (padding + 5).toString());
//     resistanceText.setAttribute('y', (getY(resistance) + 20).toString());
//     resistanceText.setAttribute('fill', '#10b981');
//     resistanceText.setAttribute('font-size', isFullScreen ? "14" : isMobile ? "10" : "12");
//     resistanceText.setAttribute('font-weight', 'bold');
//     resistanceText.textContent = `RESISTANCE ${Math.round(resistance).toLocaleString()}`;
//     svg.appendChild(resistanceText);

//     // Target Price Line
//     const targetLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
//     targetLine.setAttribute('x1', currentX.toString());
//     targetLine.setAttribute('y1', getY(lastHourly.forecast_price).toString());
//     targetLine.setAttribute('x2', futureX.toString());
//     targetLine.setAttribute('y2', getY(lastHourly.forecast_price).toString());
//     targetLine.setAttribute('stroke', '#fbbf24');
//     targetLine.setAttribute('stroke-width', '3');
//     targetLine.setAttribute('stroke-dasharray', '12,6');
//     targetLine.setAttribute('opacity', '0.9');
//     svg.appendChild(targetLine);

//     // Target Price Label
//     const targetText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
//     targetText.setAttribute('x', (futureX - 5).toString());
//     targetText.setAttribute('y', (getY(lastHourly.forecast_price) - 8).toString());
//     targetText.setAttribute('fill', '#fbbf24');
//     targetText.setAttribute('font-size', isFullScreen ? "14" : isMobile ? "10" : "12");
//     targetText.setAttribute('text-anchor', 'end');
//     targetText.setAttribute('font-weight', 'bold');
//     targetText.textContent = `TARGET ${lastHourly.forecast_price.toLocaleString()}`;
//     svg.appendChild(targetText);

//     // Add Trading Lines
//     if (lastHourly.entry_price && lastHourly.signal !== 'HOLD') {
//       const entryLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
//       entryLine.setAttribute('x1', currentX.toString());
//       entryLine.setAttribute('y1', getY(lastHourly.entry_price).toString());
//       entryLine.setAttribute('x2', futureX.toString());
//       entryLine.setAttribute('y2', getY(lastHourly.entry_price).toString());
//       entryLine.setAttribute('stroke', '#10b981');
//       entryLine.setAttribute('stroke-width', '2');
//       entryLine.setAttribute('stroke-dasharray', '8,4');
//       entryLine.setAttribute('opacity', '0.8');
//       svg.appendChild(entryLine);

//       const entryText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
//       entryText.setAttribute('x', (futureX - 5).toString());
//       entryText.setAttribute('y', (getY(lastHourly.entry_price) - 8).toString());
//       entryText.setAttribute('fill', '#10b981');
//       entryText.setAttribute('font-size', isFullScreen ? "12" : isMobile ? "9" : "11");
//       entryText.setAttribute('text-anchor', 'end');
//       entryText.setAttribute('font-weight', 'bold');
//       entryText.textContent = `ENTRY ZONE ${lastHourly.entry_price.toLocaleString()}`;
//       svg.appendChild(entryText);
//     }

//     if (lastHourly.stop_loss) {
//       const stopLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
//       stopLine.setAttribute('x1', currentX.toString());
//       stopLine.setAttribute('y1', getY(lastHourly.stop_loss).toString());
//       stopLine.setAttribute('x2', futureX.toString());
//       stopLine.setAttribute('y2', getY(lastHourly.stop_loss).toString());
//       stopLine.setAttribute('stroke', '#ef4444');
//       stopLine.setAttribute('stroke-width', '2');
//       stopLine.setAttribute('stroke-dasharray', '8,4');
//       stopLine.setAttribute('opacity', '0.8');
//       svg.appendChild(stopLine);

//       const stopText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
//       stopText.setAttribute('x', (futureX - 5).toString());
//       stopText.setAttribute('y', (getY(lastHourly.stop_loss) + 20).toString());
//       stopText.setAttribute('fill', '#ef4444');
//       stopText.setAttribute('font-size', isFullScreen ? "12" : isMobile ? "9" : "11");
//       stopText.setAttribute('text-anchor', 'end');
//       stopText.setAttribute('font-weight', 'bold');
//       stopText.textContent = `STOP LOSS ${lastHourly.stop_loss.toLocaleString()}`;
//       svg.appendChild(stopText);
//     }

//     if (lastHourly.take_profit) {
//       const profitLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
//       profitLine.setAttribute('x1', currentX.toString());
//       profitLine.setAttribute('y1', getY(lastHourly.take_profit).toString());
//       profitLine.setAttribute('x2', futureX.toString());
//       profitLine.setAttribute('y2', getY(lastHourly.take_profit).toString());
//       profitLine.setAttribute('stroke', '#8b5cf6');
//       profitLine.setAttribute('stroke-width', '2');
//       profitLine.setAttribute('stroke-dasharray', '8,4');
//       profitLine.setAttribute('opacity', '0.8');
//       svg.appendChild(profitLine);

//       const profitText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
//       profitText.setAttribute('x', (futureX - 5).toString());
//       profitText.setAttribute('y', (getY(lastHourly.take_profit) - 8).toString());
//       profitText.setAttribute('fill', '#8b5cf6');
//       profitText.setAttribute('font-size', isFullScreen ? "12" : isMobile ? "9" : "11");
//       profitText.setAttribute('text-anchor', 'end');
//       profitText.setAttribute('font-weight', 'bold');
//       profitText.textContent = `TAKE PROFIT ${lastHourly.take_profit.toLocaleString()}`;
//       svg.appendChild(profitText);
//     }

//     // Add Buy/Sell/Exit Markers
//     hourlyForecast.forEach((forecast, index) => {
//       if (forecast.signal === 'HOLD' || !forecast.entry_price) return;

//       const markerX = getX(0.2 + (index * 0.15));
//       const markerY = getY(forecast.entry_price);
//       const isLong = forecast.signal === 'LONG';
//       const tradePnL = calculateTradePnL(index, hourlyForecast);

//       // Entry Marker
//       const entryCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
//       entryCircle.setAttribute('cx', markerX.toString());
//       entryCircle.setAttribute('cy', markerY.toString());
//       entryCircle.setAttribute('r', (isFullScreen ? 12 : isMobile ? 8 : 10).toString());
//       entryCircle.setAttribute('fill', isLong ? '#10b981' : '#ef4444');
//       entryCircle.setAttribute('stroke', '#ffffff');
//       entryCircle.setAttribute('stroke-width', '2');
//       entryCircle.style.cursor = 'pointer';
//       entryCircle.style.pointerEvents = 'auto';
//       entryCircle.addEventListener('click', () => {
//         setTooltip({
//           x: markerX,
//           y: markerY,
//           data: {
//             type: 'entry',
//             signal: forecast.signal,
//             price: forecast.entry_price,
//             time: forecast.time,
//             forecast
//           },
//           visible: true,
//           type: 'trade'
//         });
//       });
//       svg.appendChild(entryCircle);

//       // B/S letter
//       const entryText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
//       entryText.setAttribute('x', markerX.toString());
//       entryText.setAttribute('y', (markerY + 2).toString());
//       entryText.setAttribute('text-anchor', 'middle');
//       entryText.setAttribute('dominant-baseline', 'central');
//       entryText.setAttribute('fill', 'white');
//       entryText.setAttribute('font-size', (isFullScreen ? 14 : isMobile ? 11 : 12).toString());
//       entryText.setAttribute('font-weight', 'bold');
//       entryText.style.pointerEvents = 'none';
//       entryText.textContent = isLong ? 'B' : 'S';
//       svg.appendChild(entryText);

//       // Exit Marker (if trade is completed)
//       if (index < hourlyForecast.length - 1 && tradePnL.exitPrice > 0) {
//         const exitX = getX(0.3 + (index * 0.15));
//         const exitY = getY(tradePnL.exitPrice);
//         const exitColor = tradePnL.pnl > 0 ? '#10b981' : '#ef4444';

//         // Exit Circle
//         const exitCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
//         exitCircle.setAttribute('cx', exitX.toString());
//         exitCircle.setAttribute('cy', exitY.toString());
//         exitCircle.setAttribute('r', (isFullScreen ? 12 : isMobile ? 8 : 10).toString());
//         exitCircle.setAttribute('fill', exitColor);
//         exitCircle.setAttribute('stroke', '#ffffff');
//         exitCircle.setAttribute('stroke-width', '2');
//         exitCircle.style.cursor = 'pointer';
//         exitCircle.style.pointerEvents = 'auto';
//         exitCircle.addEventListener('click', () => {
//           setTooltip({
//             x: exitX,
//             y: exitY,
//             data: {
//               type: 'exit',
//               signal: forecast.signal,
//               price: tradePnL.exitPrice,
//               time: hourlyForecast[index + 1]?.time,
//               exitReason: tradePnL.exitReason,
//               pnl: tradePnL.pnl,
//               pnlPercentage: tradePnL.pnlPercentage
//             },
//             visible: true,
//             type: 'trade'
//           });
//         });
//         svg.appendChild(exitCircle);

//         // X letter
//         const exitText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
//         exitText.setAttribute('x', exitX.toString());
//         exitText.setAttribute('y', (exitY + 2).toString());
//         exitText.setAttribute('text-anchor', 'middle');
//         exitText.setAttribute('dominant-baseline', 'central');
//         exitText.setAttribute('fill', 'white');
//         exitText.setAttribute('font-size', (isFullScreen ? 14 : isMobile ? 11 : 12).toString());
//         exitText.setAttribute('font-weight', 'bold');
//         exitText.style.pointerEvents = 'none';
//         exitText.textContent = 'X';
//         svg.appendChild(exitText);

//         // Connection line
//         const connectionLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
//         connectionLine.setAttribute('x1', markerX.toString());
//         connectionLine.setAttribute('y1', markerY.toString());
//         connectionLine.setAttribute('x2', exitX.toString());
//         connectionLine.setAttribute('y2', exitY.toString());
//         connectionLine.setAttribute('stroke', exitColor);
//         connectionLine.setAttribute('stroke-width', '2');
//         connectionLine.setAttribute('stroke-dasharray', '5,5');
//         connectionLine.setAttribute('opacity', '0.6');
//         svg.appendChild(connectionLine);
//       }
//     });

//     // Add Confidence Interval Labels
//     const conf50Text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
//     conf50Text.setAttribute('x', (futureX - 10).toString());
//     conf50Text.setAttribute('y', (getY(lastHourly.confidence_50[1]) - 5).toString());
//     conf50Text.setAttribute('fill', '#3b82f6');
//     conf50Text.setAttribute('font-size', isFullScreen ? "12" : isMobile ? "8" : "10");
//     conf50Text.setAttribute('text-anchor', 'end');
//     conf50Text.setAttribute('font-weight', 'bold');
//     conf50Text.textContent = '50% CONFIDENCE';
//     svg.appendChild(conf50Text);

//     if (!isMobile || isFullScreen) {
//       const conf80Text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
//       conf80Text.setAttribute('x', (futureX - 10).toString());
//       conf80Text.setAttribute('y', (getY(lastHourly.confidence_80[1]) - 5).toString());
//       conf80Text.setAttribute('fill', '#f59e0b');
//       conf80Text.setAttribute('font-size', isFullScreen ? "12" : "10");
//       conf80Text.setAttribute('text-anchor', 'end');
//       conf80Text.setAttribute('font-weight', 'bold');
//       conf80Text.textContent = '80% CONFIDENCE';
//       svg.appendChild(conf80Text);

//       const conf90Text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
//       conf90Text.setAttribute('x', (futureX - 10).toString());
//       conf90Text.setAttribute('y', (getY(lastHourly.confidence_90[1]) - 5).toString());
//       conf90Text.setAttribute('fill', '#22c55e');
//       conf90Text.setAttribute('font-size', isFullScreen ? "12" : "10");
//       conf90Text.setAttribute('text-anchor', 'end');
//       conf90Text.setAttribute('font-weight', 'bold');
//       conf90Text.textContent = '90% CONFIDENCE';
//       svg.appendChild(conf90Text);
//     }

//     // Add Breakout and Invalidation Lines
//     const breakoutLevel = Math.max(...candlestickData.slice(-20).map(d => d.high)) * 1.001;
//     const invalidationLevel = Math.min(...candlestickData.slice(-20).map(d => d.low)) * 0.999;

//     // Breakout Line
//     const breakoutLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
//     breakoutLine.setAttribute('x1', padding.toString());
//     breakoutLine.setAttribute('y1', getY(breakoutLevel).toString());
//     breakoutLine.setAttribute('x2', (clientWidth - padding).toString());
//     breakoutLine.setAttribute('y2', getY(breakoutLevel).toString());
//     breakoutLine.setAttribute('stroke', '#8b5cf6');
//     breakoutLine.setAttribute('stroke-width', '1');
//     breakoutLine.setAttribute('stroke-dasharray', '6,2');
//     breakoutLine.setAttribute('opacity', '0.6');
//     svg.appendChild(breakoutLine);

//     const breakoutText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
//     breakoutText.setAttribute('x', (clientWidth - padding - 5).toString());
//     breakoutText.setAttribute('y', (getY(breakoutLevel) - 5).toString());
//     breakoutText.setAttribute('fill', '#8b5cf6');
//     breakoutText.setAttribute('font-size', isFullScreen ? "11" : isMobile ? "8" : "9");
//     breakoutText.setAttribute('text-anchor', 'end');
//     breakoutText.textContent = `BREAKOUT ${Math.round(breakoutLevel).toLocaleString()}`;
//     svg.appendChild(breakoutText);

//     // Invalidation Line
//     const invalidationLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
//     invalidationLine.setAttribute('x1', padding.toString());
//     invalidationLine.setAttribute('y1', getY(invalidationLevel).toString());
//     invalidationLine.setAttribute('x2', (clientWidth - padding).toString());
//     invalidationLine.setAttribute('y2', getY(invalidationLevel).toString());
//     invalidationLine.setAttribute('stroke', '#f59e0b');
//     invalidationLine.setAttribute('stroke-width', '1');
//     invalidationLine.setAttribute('stroke-dasharray', '6,2');
//     invalidationLine.setAttribute('opacity', '0.6');
//     svg.appendChild(invalidationLine);

//     const invalidationText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
//     invalidationText.setAttribute('x', (clientWidth - padding - 5).toString());
//     invalidationText.setAttribute('y', (getY(invalidationLevel) + 15).toString());
//     invalidationText.setAttribute('fill', '#f59e0b');
//     invalidationText.setAttribute('font-size', isFullScreen ? "11" : isMobile ? "8" : "9");
//     invalidationText.setAttribute('text-anchor', 'end');
//     invalidationText.textContent = `INVALIDATION ${Math.round(invalidationLevel).toLocaleString()}`;
//     svg.appendChild(invalidationText);

//     return svg;
//   };

//   // Create TradingView-style chart
//   const createTradingViewChart = (container: HTMLDivElement, isFullScreen = false) => {
//     if (!container || candlestickData.length === 0) return null;

//     const { clientWidth, clientHeight } = container;
    
//     const chart = createChart(container, {
//       width: clientWidth,
//       height: clientHeight,
//       layout: { 
//         background: { color: '#0a1628' },
//         textColor: '#d1d5db' 
//       },
//       grid: {
//         vertLines: { color: '#374151' },
//         horzLines: { color: '#374151' },
//       },
//       crosshair: {
//         mode: 0,
//         vertLine: {
//           color: '#6b7280',
//           width: 1,
//           style: 0,
//         },
//         horzLine: {
//           color: '#6b7280',
//           width: 1,
//           style: 0,
//         },
//       },
//       timeScale: {
//         borderColor: '#4b5563',
//         timeVisible: true,
//         secondsVisible: false,
//       },
//       rightPriceScale: {
//         borderColor: '#4b5563',
//         autoScale: true,
//         scaleMargins: {
//           top: 0.1,
//           bottom: 0.3,
//         },
//       },
//     });

//     // Convert candlestick data to chart format
//     const chartData = candlestickData.map(candle => ({
//       time: (candle.timestamp / 1000) as UTCTimestamp,
//       open: candle.open,
//       high: candle.high,
//       low: candle.low,
//       close: candle.close,
//     }));

//     const volumeData = candlestickData.map((candle, i) => {
//       const prev = candlestickData[i - 1];
//       const color = !prev || candle.close >= prev.close ? '#26a69a' : '#ef5350';
//       return { 
//         time: (candle.timestamp / 1000) as UTCTimestamp, 
//         value: candle.volume, 
//         color 
//       };
//     });

//     // Add candlestick series
//     const priceSeries = chart.addSeries(CandlestickSeries, {
//       upColor: '#26a69a',
//       downColor: '#ef5350',
//       borderVisible: false,
//       wickUpColor: '#26a69a',
//       wickDownColor: '#ef5350',
//     });
//     priceSeries.setData(chartData);

//     // Add volume series
//     const volumeSeries = chart.addSeries(HistogramSeries, {
//       priceFormat: { type: 'volume' },
//       priceScaleId: '',
//     });
//     volumeSeries.priceScale().applyOptions({ 
//       scaleMargins: { top: 0.7, bottom: 0 },
//       autoScale: true
//     });
//     volumeSeries.setData(volumeData);

//     // Handle crosshair move for tooltips
//     chart.subscribeCrosshairMove(param => {
//       if (!param?.time || !param?.seriesData || !priceSeries || !container) return;

//       const data = param.seriesData.get(priceSeries);
//       if (!data || typeof data !== 'object') {
//         setTooltip(prev => ({ ...prev, visible: false }));
//         return;
//       }

//       const rect = container.getBoundingClientRect();
//       const { open, high, low, close } = data as any;
      
//       // Convert chart coordinates to screen coordinates
//       const x = param.point?.x || 0;
//       const y = param.point?.y || 0;

//       setTooltip({
//         x: x,
//         y: y,
//         data: {
//           time: param.time,
//           open,
//           high,
//           low,
//           close,
//           type: 'candlestick'
//         },
//         visible: true,
//         type: 'chart'
//       });
//     });

//     chart.timeScale().fitContent();

//     // Add the SVG overlay after chart is created
//     setTimeout(() => {
//       const overlay = createSVGOverlay(container, isFullScreen);
//       if (overlay) {
//         container.appendChild(overlay);
//       }
//     }, 100);

//     return chart;
//   };

//   // Initialize main chart
//   useEffect(() => {
//     if (!chartContainer.current || candlestickData.length === 0) return;

//     // Clean up existing chart
//     if (chartInstance.current) {
//       chartInstance.current.remove();
//       chartInstance.current = null;
//     }

//     // Remove any existing SVG overlays
//     const existingOverlays = chartContainer.current.querySelectorAll('svg');
//     existingOverlays.forEach(overlay => overlay.remove());

//     chartInstance.current = createTradingViewChart(chartContainer.current, false);

//     const handleResize = () => {
//       if (chartInstance.current && chartContainer.current) {
//         const { clientWidth, clientHeight } = chartContainer.current;
//         chartInstance.current.applyOptions({
//           width: clientWidth,
//           height: clientHeight,
//         });
        
//         // Recreate overlay on resize
//         const existingOverlays = chartContainer.current.querySelectorAll('svg');
//         existingOverlays.forEach(overlay => overlay.remove());
        
//         setTimeout(() => {
//           const overlay = createSVGOverlay(chartContainer.current!, false);
//           if (overlay) {
//             chartContainer.current!.appendChild(overlay);
//           }
//         }, 100);
//       }
//     };

//     window.addEventListener('resize', handleResize);

//     return () => {
//       window.removeEventListener('resize', handleResize);
//       if (chartInstance.current) {
//         chartInstance.current.remove();
//         chartInstance.current = null;
//       }
//     };
//   }, [candlestickData, hourlyForecast, isMobile]);

//   // Initialize full screen chart
//   useEffect(() => {
//     if (!isChartMaximized || candlestickData.length === 0) return;

//     // Add a small delay to ensure DOM is ready
//     const initFullScreenChart = () => {
//       if (!fullScreenChartContainer.current) return;

//       console.log('Initializing fullscreen chart...', {
//         container: fullScreenChartContainer.current,
//         dimensions: {
//           width: fullScreenChartContainer.current.clientWidth,
//           height: fullScreenChartContainer.current.clientHeight
//         },
//         candleDataLength: candlestickData.length
//       });

//       // Clean up existing full screen chart
//       if (fullScreenChartInstance.current) {
//         fullScreenChartInstance.current.remove();
//         fullScreenChartInstance.current = null;
//       }

//       // Remove any existing SVG overlays
//       const existingOverlays = fullScreenChartContainer.current.querySelectorAll('svg');
//       existingOverlays.forEach(overlay => overlay.remove());

//       // Ensure container has dimensions
//       if (fullScreenChartContainer.current.clientWidth === 0 || fullScreenChartContainer.current.clientHeight === 0) {
//         console.warn('Container has no dimensions, retrying...');
//         setTimeout(initFullScreenChart, 100);
//         return;
//       }

//       try {
//         fullScreenChartInstance.current = createTradingViewChart(fullScreenChartContainer.current, true);
//         console.log('Fullscreen chart created successfully:', fullScreenChartInstance.current);
//       } catch (error) {
//         console.error('Error creating fullscreen chart:', error);
//       }
//     };

//     // Use setTimeout to ensure the fullscreen modal is fully rendered
//     const timeoutId = setTimeout(initFullScreenChart, 150);

//     const handleResize = () => {
//       if (fullScreenChartInstance.current && fullScreenChartContainer.current) {
//         const { clientWidth, clientHeight } = fullScreenChartContainer.current;
//         fullScreenChartInstance.current.applyOptions({
//           width: clientWidth,
//           height: clientHeight,
//         });
        
//         // Recreate overlay on resize
//         const existingOverlays = fullScreenChartContainer.current.querySelectorAll('svg');
//         existingOverlays.forEach(overlay => overlay.remove());
        
//         setTimeout(() => {
//           const overlay = createSVGOverlay(fullScreenChartContainer.current!, true);
//           if (overlay) {
//             fullScreenChartContainer.current!.appendChild(overlay);
//           }
//         }, 100);
//       }
//     };

//     window.addEventListener('resize', handleResize);

//     return () => {
//       clearTimeout(timeoutId);
//       window.removeEventListener('resize', handleResize);
//       if (fullScreenChartInstance.current) {
//         fullScreenChartInstance.current.remove();
//         fullScreenChartInstance.current = null;
//       }
//     };
//   }, [isChartMaximized, candlestickData, hourlyForecast]);

//   // Get simplified date format (MM/DD)
//   const getSimpleDate = (dateStr: string) => {
//     const date = new Date(dateStr);
//     return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
//   };

//   // Calculate risk/reward ratio
//   const getRiskReward = (entry: number, stop: number, target: number, signal: 'LONG' | 'SHORT' = 'LONG') => {
//     let risk: number;
//     let reward: number;

//     if (signal === 'LONG') {
//       risk = entry - stop;
//       reward = target - entry;
//     } else {
//       risk = stop - entry;
//       reward = entry - target;
//     }

//     if (risk <= 0 || reward <= 0) {
//       return '0.0';
//     }

//     return (reward / risk).toFixed(1);
//   };

//   // Calculate key levels based on current price and recent data
//   const getKeyLevels = (price: number, recentData?: CandlestickData[]) => {
//     if (!recentData || recentData.length === 0) {
//       return {
//         support: price * 0.996,
//         resistance: price * 1.004,
//         breakoutLevel: price * 1.002,
//         invalidationLevel: price * 0.993
//       };
//     }

//     // Calculate support/resistance from recent highs/lows
//     const recentHighs = recentData.slice(-20).map(d => d.high);
//     const recentLows = recentData.slice(-20).map(d => d.low);

//     const resistance = Math.max(...recentHighs);
//     const support = Math.min(...recentLows);
//     const breakoutLevel = resistance * 1.001;
//     const invalidationLevel = support * 0.999;

//     return { support, resistance, breakoutLevel, invalidationLevel };
//   };

//   // Calculate market structure from actual price data
//   const getMarketStructure = (currentPrice: number, recentData?: CandlestickData[], signal?: string) => {
//     if (!recentData || recentData.length < 10) {
//       return {
//         trend: signal === 'LONG' ? 'Bullish' : signal === 'SHORT' ? 'Bearish' : 'Sideways',
//         shortTermTrend: 'Insufficient Data',
//         longTermTrend: 'Insufficient Data'
//       };
//     }

//     // Short term trend (last 10 candles)
//     const shortTermData = recentData.slice(-10);
//     const shortTermStart = shortTermData[0].close;
//     const shortTermEnd = shortTermData[shortTermData.length - 1].close;
//     const shortTermChange = (shortTermEnd - shortTermStart) / shortTermStart;

//     // Long term trend (last 30 candles)
//     const longTermData = recentData.slice(-30);
//     const longTermStart = longTermData[0].close;
//     const longTermEnd = longTermData[longTermData.length - 1].close;
//     const longTermChange = (longTermEnd - longTermStart) / longTermStart;

//     const getTrendLabel = (change: number) => {
//       if (change > 0.01) return 'Bullish';
//       if (change < -0.01) return 'Bearish';
//       return 'Sideways';
//     };

//     return {
//       trend: signal === 'LONG' ? 'Bullish' : signal === 'SHORT' ? 'Bearish' : 'Sideways',
//       shortTermTrend: getTrendLabel(shortTermChange),
//       longTermTrend: getTrendLabel(longTermChange)
//     };
//   };

//   // Calculate performance metrics from hourly forecast data
//   const calculatePerformanceMetrics = (hourlyData?: HourlyForecast[]) => {
//     if (!hourlyData || hourlyData.length === 0) {
//       return {
//         winRate: 0,
//         avgGain: 0,
//         avgLoss: 0,
//         profitFactor: 0,
//         winProbability: 0,
//         maxDrawdown: 0
//       };
//     }

//     const validData = hourlyData.filter(h =>
//       h.accuracy_percent !== 'N/A' &&
//       h.deviation_percent !== 'N/A' &&
//       typeof h.accuracy_percent === 'number' &&
//       typeof h.deviation_percent === 'number'
//     );

//     if (validData.length === 0) {
//       return {
//         winRate: 98.5, // fallback from latest data
//         avgGain: 1.8,
//         avgLoss: 0.9,
//         profitFactor: 2.0,
//         winProbability: 75,
//         maxDrawdown: 2.1
//       };
//     }

//     const accuracies = validData.map(h => Number(h.accuracy_percent));
//     const deviations = validData.map(h => Number(h.deviation_percent));

//     const winRate = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;

//     const gains = deviations.filter(d => d > 0);
//     const losses = deviations.filter(d => d < 0).map(d => Math.abs(d));

//     const avgGain = gains.length > 0 ? gains.reduce((sum, g) => sum + g, 0) / gains.length : 0;
//     const avgLoss = losses.length > 0 ? losses.reduce((sum, l) => sum + l, 0) / losses.length : 0;

//     const profitFactor = avgLoss > 0 ? avgGain / avgLoss : 0;
//     const winProbability = (gains.length / validData.length) * 100;
//     const maxDrawdown = Math.max(...losses, 0);

//     return {
//       winRate: Math.round(winRate * 100) / 100,
//       avgGain: Math.round(avgGain * 100) / 100,
//       avgLoss: Math.round(avgLoss * 100) / 100,
//       profitFactor: Math.round(profitFactor * 100) / 100,
//       winProbability: Math.round(winProbability),
//       maxDrawdown: Math.round(maxDrawdown * 100) / 100
//     };
//   };

//   // Calculate position size based on volatility and risk
//   const calculatePositionSize = (signal: string, riskReward: number, volatility: number) => {
//     if (signal === 'HOLD') return 'Conservative (1-2%)';

//     // Base position size on risk/reward and volatility
//     if (riskReward > 2 && volatility < 0.02) return 'Aggressive (3-5%)';
//     if (riskReward > 1.5 && volatility < 0.025) return 'Moderate (2-3%)';
//     return 'Conservative (1-2%)';
//   };

//   // Calculate market volatility from recent data
//   const calculateVolatility = (recentData?: CandlestickData[]) => {
//     if (!recentData || recentData.length < 10) return 0.02; // default

//     const returns = recentData.slice(-10).map((candle, i, arr) => {
//       if (i === 0) return 0;
//       return (candle.close - arr[i - 1].close) / arr[i - 1].close;
//     }).slice(1);

//     const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
//     const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;

//     return Math.sqrt(variance);
//   };

//   // Calculate market context from data
//   const getMarketContext = (recentData?: CandlestickData[], sentimentScore?: number) => {
//     if (!recentData || recentData.length === 0) {
//       return {
//         newsImpact: 'Unknown',
//         technicalSetup: 'Unknown',
//         volumeStatus: 'Unknown',
//         correlation: 'Unknown'
//       };
//     }

//     // Volume analysis
//     const recentVolumes = recentData.slice(-10).map(d => d.volume);
//     const avgVolume = recentVolumes.reduce((sum, v) => sum + v, 0) / recentVolumes.length;
//     const currentVolume = recentData[recentData.length - 1]?.volume || 0;

//     const volumeRatio = currentVolume / avgVolume;
//     let volumeStatus = 'Average';
//     if (volumeRatio > 1.2) volumeStatus = 'Above Average';
//     if (volumeRatio < 0.8) volumeStatus = 'Below Average';

//     // Technical setup based on price action
//     const recent5 = recentData.slice(-5);
//     const priceRange = Math.max(...recent5.map(d => d.high)) - Math.min(...recent5.map(d => d.low));
//     const avgPrice = recent5.reduce((sum, d) => sum + d.close, 0) / recent5.length;
//     const volatilityRatio = priceRange / avgPrice;

//     let technicalSetup = 'Consolidation';
//     if (volatilityRatio > 0.03) technicalSetup = 'Breakout Pending';
//     if (volatilityRatio > 0.05) technicalSetup = 'High Volatility';

//     // News impact based on sentiment score
//     let newsImpact = 'Low';
//     if (sentimentScore) {
//       if (sentimentScore > 60 || sentimentScore < 20) newsImpact = 'High';
//       else if (sentimentScore > 45 || sentimentScore < 35) newsImpact = 'Medium';
//     }

//     return {
//       newsImpact,
//       technicalSetup,
//       volumeStatus,
//       correlation: 'Following Crypto Market' // This would need external data to compute properly
//     };
//   };

//   // Show/hide tooltip
//   const showTooltip = (
//     event: React.MouseEvent,
//     data: any,
//     type: 'chart' | 'info' | 'trade' = 'chart'
//   ) => {
//     const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;

//     setTooltip({ x, y, data, visible: true, type });
//   };

//   const hideTooltip = () => {
//     setTooltip(prev => ({ ...prev, visible: false }));
//   };

//   // Tooltip content definitions
//   const tooltipContent = {
//     riskManagement: {
//       title: "Risk Management",
//       content: [
//         "Risk vs Reward: Calculated as (Take Profit - Entry) ÷ (Entry - Stop Loss). Higher ratios indicate better risk-adjusted returns.",
//         "Position Size: Recommended portfolio allocation based on volatility and R:R ratio. Conservative (1-2%), Moderate (2-3%), Aggressive (3-5%).",
//         "Win Probability: Percentage of positive price deviations from historical hourly forecasts.",
//         "Max Drawdown: Largest single loss percentage observed in recent trading signals."
//       ]
//     },
//     performanceMetrics: {
//       title: "Performance Metrics",
//       content: [
//         "Win Rate: Average accuracy percentage from the last 100 hourly predictions.",
//         "Avg Gain: Mean percentage gain from all profitable prediction periods.",
//         "Avg Loss: Mean percentage loss from all unprofitable prediction periods.",
//         "Profit Factor: Ratio of average gains to average losses. Values above 2.0 indicate strong performance."
//       ]
//     },
//     marketStructure: {
//       title: "Market Structure & Key Levels",
//       content: [
//         "Trend Direction: Short-term (10 candles) vs Long-term (30 candles) price movement analysis.",
//         "Key Pivot: Current price level acting as decision point for market direction.",
//         "Next Resistance: Calculated from recent 20-period highs, where selling pressure may increase.",
//         "Next Support: Calculated from recent 20-period lows, where buying interest typically emerges."
//       ]
//     }
//   };

//   if (!latest) {
//     return (
//       <div className="p-4 text-gray-400">
//         Loading data...
//       </div>
//     );
//   }

//   const firstForecast = latest;
//   const firstForecasts = forecast[0];

//   // Use hourly forecast data or fallback to forecast data
//   const lastHourly = hourlyForecast && hourlyForecast.length > 0
//     ? hourlyForecast[hourlyForecast.length - 1]
//     : null;

//   const displaySignal = lastHourly?.signal || firstForecasts?.signal || 'HOLD';
//   const displayEntry = lastHourly?.entry_price || firstForecasts?.entry;
//   const displayTakeProfit = lastHourly?.take_profit || firstForecasts?.take_profit;
//   const displayStopLoss = lastHourly?.stop_loss || firstForecasts?.stop_loss;
//   const performanceMetrics = calculatePerformanceMetrics(hourlyForecast);

//   const nextHourTarget = lastHourly?.forecast_price ||
//     (hourlyForecast && hourlyForecast.length > 0 ? hourlyForecast[0].forecast_price : null);

//   const confidenceProbability = lastHourly?.confidence_50 ?
//     Math.round(((lastHourly.confidence_50[1] - lastHourly.confidence_50[0]) / lastHourly.forecast_price) * 100 * 10) :
//     75; // Default fallback

//   const expectedTimeframe = displaySignal === 'LONG' || displaySignal === 'SHORT' ?
//     '30-60' : '45-90';

//   // Calculate minutes to next forecast (assuming hourly updates)
//   const minutesToNextForecast = (() => {
//     const now = new Date();
//     const nowUTC = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
//     const nextHourUTC = new Date(nowUTC);
//     nextHourUTC.setUTCHours(nowUTC.getUTCHours() + 1, 0, 0, 0);
//     return Math.ceil((nextHourUTC.getTime() - nowUTC.getTime()) / (1000 * 60));
//   })();

//   const formattedAccuracy = lastHourly?.accuracy_percent && lastHourly.accuracy_percent !== 'N/A'
//     ? `${lastHourly.accuracy_percent}%`
//     : firstForecast?.overall_accuracy_percent
//       ? `${firstForecast.overall_accuracy_percent}%`
//       : `${performanceMetrics.winRate}%`;

//   const formattedDeviation = lastHourly?.deviation_percent && lastHourly.deviation_percent !== 'N/A'
//     ? `${lastHourly.deviation_percent}%`
//     : firstForecast?.deviation_percent
//       ? `+${firstForecast.deviation_percent}%`
//       : '+1.50%';

//   // Calculate market structure
//   const marketStructure = getMarketStructure(currentPrice, candlestickData, displaySignal);
//   const keyLevels = getKeyLevels(currentPrice, candlestickData);
//   const volatility = calculateVolatility(candlestickData);
//   const marketContext = getMarketContext(candlestickData, lastHourly?.sentiment_score || 30);

//   // Calculate position size recommendation
//   const riskRewardValue = lastHourly?.risk_reward_ratio ||
//     (displayEntry && displayStopLoss && displayTakeProfit ?
//       parseFloat(getRiskReward(displayEntry, displayStopLoss, displayTakeProfit)) : 1.5);

//   const positionSize = calculatePositionSize(displaySignal, riskRewardValue, volatility);

//   // Full screen chart overlay
//   const FullScreenChart = () => (
//     <>
//       {/* Backdrop */}
//       <div className="fixed inset-0 bg-black bg-opacity-95 z-50" onClick={() => setIsChartMaximized(false)} />

//       {/* Full Screen Chart */}
//       <div className="fixed inset-0 z-50 flex flex-col p-4">
//         <div className="bg-[#0a1628] h-full rounded-lg flex flex-col relative border border-gray-600">
//           {/* Close button */}
//           <button
//             onClick={() => setIsChartMaximized(false)}
//             className="absolute top-4 right-4 z-10 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors duration-200"
//             title="Close (Esc)"
//           >
//             <X size={20} />
//           </button>

//           {/* Chart header */}
//           <div className="p-4 border-b border-gray-700">
//             <h3 className="text-white text-lg font-bold">
//               {selectedAsset} Price Chart - Full Screen
//             </h3>
//             <p className="text-gray-400 text-sm">
//               Real-time candlestick chart with AI predictions, confidence intervals, and trading markers
//             </p>
//           </div>

//           {/* Chart container */}
//           <div className="flex-1 p-4 relative" onMouseLeave={hideTooltip}>
//             <div ref={fullScreenChartContainer} className="w-full h-full" />

//             {/* Enhanced Tooltip for full screen */}
//             {tooltip.visible && tooltip.data && (
//               <div
//                 className={`absolute ${tooltip.type === 'info' ? 'bg-gray-800' : 'bg-gray-900'} border border-gray-600 rounded-lg p-3 text-white shadow-xl z-50 text-sm ${tooltip.type === 'info' ? 'max-w-md' : 'min-w-48'} break-words`}
//                 style={{
//                   left: tooltip.x + 10,
//                   top: tooltip.y - 10,
//                   transform: tooltip.x > 300 ? 'translateX(-100%)' : 'none'
//                 }}
//               >
//                 {tooltip.type === 'info' ? (
//                   // Info tooltip content
//                   <div className="space-y-2">
//                     <div className="font-bold text-blue-400 border-b border-gray-600 pb-1 break-words">
//                       {tooltip.data.title}
//                     </div>
//                     <div className="space-y-2">
//                       {tooltip.data.content.map((item: string, index: number) => (
//                         <div key={index} className="text-sm leading-relaxed">
//                           <span className="font-medium text-gray-300 break-words">
//                             {item.split(':')[0]}:
//                           </span>
//                           <span className="text-gray-400 ml-1 break-words">
//                             {item.split(':').slice(1).join(':')}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ) : tooltip.type === 'trade' ? (
//                   // Trade tooltip content
//                   <div className="space-y-2">
//                     <div className="font-bold text-blue-400 border-b border-gray-600 pb-1">
//                       {tooltip.data.type === 'entry' ? 'Trade Entry' : 'Trade Exit'}
//                     </div>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400">Signal:</span>
//                       <span className={tooltip.data.signal === 'LONG' ? 'text-green-400' : 'text-red-400'}>
//                         {tooltip.data.signal}
//                       </span>
//                     </div>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400">Price:</span>
//                       <span>${tooltip.data.price.toLocaleString()}</span>
//                     </div>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400">Time:</span>
//                       <span>{new Date(tooltip.data.time).toLocaleTimeString()}</span>
//                     </div>
//                     {tooltip.data.type === 'exit' && (
//                       <>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400">Exit Reason:</span>
//                           <span className={`${
//                             tooltip.data.exitReason === 'take_profit' ? 'text-green-400' :
//                             tooltip.data.exitReason === 'stop_loss' ? 'text-red-400' : 'text-blue-400'
//                           }`}>
//                             {tooltip.data.exitReason === 'take_profit' ? 'Take Profit' :
//                              tooltip.data.exitReason === 'stop_loss' ? 'Stop Loss' : 'Next Hour'}
//                           </span>
//                         </div>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400">PnL:</span>
//                           <span className={tooltip.data.pnl > 0 ? 'text-green-400' : 'text-red-400'}>
//                             ${tooltip.data.pnl?.toFixed(2)} ({tooltip.data.pnlPercentage?.toFixed(2)}%)
//                           </span>
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 ) : (
//                   // Chart tooltip content
//                   <div className="space-y-2">
//                     {tooltip.data.type === 'candlestick' && (
//                       <>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400 flex-shrink-0">Time:</span>
//                           <span className="break-words min-w-0">{new Date(tooltip.data.time * 1000).toLocaleTimeString()}</span>
//                         </div>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400 flex-shrink-0">OHLC:</span>
//                           <span className="break-all min-w-0">
//                             ${Math.round(tooltip.data.open).toLocaleString()} /
//                             ${Math.round(tooltip.data.high).toLocaleString()} /
//                             ${Math.round(tooltip.data.low).toLocaleString()} /
//                             ${Math.round(tooltip.data.close).toLocaleString()}
//                           </span>
//                         </div>
//                         <div className="flex justify-between gap-2">
//                           <span className="text-gray-400 flex-shrink-0">Change:</span>
//                           <span className={`flex-shrink-0 ${tooltip.data.close > tooltip.data.open ? 'text-green-400' : 'text-red-400'}`}>
//                             {((tooltip.data.close / tooltip.data.open - 1) * 100).toFixed(2)}%
//                           </span>
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Full screen legend */}
//           <div className="p-4 border-t border-gray-700">
//             <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
//               <div className="flex items-center space-x-2">
//                 <div className="w-4 h-0.5 bg-yellow-500"></div>
//                 <span className="text-gray-400">Target Price</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
//                   <span className="text-white text-xs font-bold">B</span>
//                 </div>
//                 <span className="text-gray-400">Long Entry</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
//                   <span className="text-white text-xs font-bold">S</span>
//                 </div>
//                 <span className="text-gray-400">Short Entry</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="w-3 h-3 bg-gray-500 rounded-full flex items-center justify-center">
//                   <span className="text-white text-xs font-bold">X</span>
//                 </div>
//                 <span className="text-gray-400">Exit</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="w-4 h-2 bg-blue-500" style={{ opacity: 0.3 }}></div>
//                 <span className="text-gray-400">50% Confidence</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="w-4 h-2 bg-yellow-600" style={{ opacity: 0.3 }}></div>
//                 <span className="text-gray-400">80% Confidence</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="w-4 h-2 bg-green-500" style={{ opacity: 0.3 }}></div>
//                 <span className="text-gray-400">90% Confidence</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="w-4 h-0.5 bg-red-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #ef4444 0, #ef4444 3px, transparent 3px, transparent 6px)' }}></div>
//                 <span className="text-gray-400">Support/Resistance</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="w-4 h-0.5 bg-purple-600" style={{ backgroundImage: 'repeating-linear-gradient(to right, #7c3aed 0, #7c3aed 4px, transparent 4px, transparent 6px)' }}></div>
//                 <span className="text-gray-400">Key Levels</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );

//   return (
//     <div className={`bg-[#0a1628] rounded-lg p-4 ${className}`}>
//       {/* Controls Section */}
//       <div className="flex justify-between items-center mb-4 gap-2">
//         <select
//           value={selectedAsset}
//           onChange={(e) => setSelectedAsset(e.target.value as 'BTC' | 'SOL' | 'ETH')}
//           className="bg-[#1a2332] text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm min-w-0 flex-shrink-0"
//         >
//           <option value="BTC">BTC</option>
//           <option value="SOL" disabled>SOL (Soon)</option>
//           <option value="ETH" disabled>ETH (Soon)</option>
//         </select>

//         <SegmentedControl
//           options={[
//             { value: 'TODAY', label: 'Today' },
//           ]}
//           selected={selectedTimeframe}
//           onChange={(value) => setSelectedTimeframe(value as 'TODAY')}
//           className="flex-shrink-0"
//         />
//       </div>

//       <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 mb-4 border border-blue-500/30">
//         <div className="flex items-center justify-between gap-4">
//           <div className="min-w-0 flex-1">
//             <div className="text-blue-400 text-sm font-medium mb-1">🎯 NEXT HOUR OUTLOOK</div>
//             <div className="text-white text-base md:text-lg font-bold break-words">
//               ZkAGI anticipates price to hit ${nextHourTarget?.toLocaleString()} over next hour
//             </div>
//           </div>
//           <div className="text-right flex-shrink-0">
//             <div className="text-gray-400 text-xs md:text-sm whitespace-nowrap">Next forecast in:</div>
//             <div className="text-yellow-400 text-lg md:text-xl font-bold">{minutesToNextForecast}m</div>
//           </div>
//         </div>
//       </div>

//       {/* Enhanced Key Metrics */}
//       <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4 mb-4`}>
//         {/* Trading Signal Panel */}
//         <div className={`bg-[#1a2332] rounded-lg p-4 border-l-4 overflow-hidden ${displaySignal === 'LONG' ? 'border-green-500' :
//           displaySignal === 'SHORT' ? 'border-red-500' :
//             'border-yellow-500'
//           }`}>
//           <div className="flex justify-between items-start mb-2 gap-2">
//             <span className="text-gray-400 text-sm flex-shrink-0">TRADING SIGNAL</span>
//             <span className={`font-bold text-lg flex-shrink-0 ${displaySignal === 'LONG' ? 'text-green-400' :
//               displaySignal === 'SHORT' ? 'text-red-400' :
//                 'text-yellow-400'
//               }`}>
//               {displaySignal}
//             </span>
//           </div>

//           <div className="space-y-1">
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Entry Zone:</span>
//               <span className="text-white font-medium text-right break-all min-w-0">
//                 {displayEntry ? `${(displayEntry * 0.999).toLocaleString()} - ${(displayEntry * 1.001).toLocaleString()}` : 'N/A'}
//               </span>
//             </div>
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Take Profit:</span>
//               <span className="text-green-400 text-right break-all min-w-0">
//                 {displayTakeProfit ? `${displayTakeProfit.toLocaleString()} (+${((displayTakeProfit / (displayEntry || 1) - 1) * 100).toFixed(1)}%)` : 'N/A'}
//               </span>
//             </div>
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Stop Loss:</span>
//               <span className="text-red-400 text-right break-all min-w-0">
//                 {displayStopLoss ? `${displayStopLoss.toLocaleString()} (-${((1 - displayStopLoss / (displayEntry || 1)) * 100).toFixed(1)}%)` : 'N/A'}
//               </span>
//             </div>
//           </div>

//           <div className="mb-1 mt-5 p-2 bg-gray-800/50 rounded text-[9px] text-gray-500 break-words">
//             <strong>Note:</strong> Position parameters display as N/A during HOLD signals.
//             Specific entry zones, profit targets, and stop levels are provided for actionable LONG/SHORT signals.
//           </div>
//         </div>

//         {/* Enhanced Risk Analysis */}
//         <div className="bg-[#1a2332] rounded-lg p-4 overflow-hidden">
//           <div
//             className="text-gray-400 text-sm mb-2 hover:text-blue-400 cursor-help transition-colors flex items-center space-x-1"
//             onMouseEnter={(e) => showTooltip(e, tooltipContent.riskManagement, 'info')}
//             onMouseLeave={hideTooltip}
//           >
//             <span className="break-words min-w-0">Risk Management</span>
//             <span className="text-xs flex-shrink-0">ⓘ</span>
//           </div>
//           <div className="space-y-2">
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Risk vs Reward:</span>
//               <span className="text-blue-400 font-bold flex-shrink-0">
//                 {lastHourly?.risk_reward_ratio ?
//                   `1:${lastHourly.risk_reward_ratio.toFixed(1)}` :
//                   displayEntry && displayStopLoss && displayTakeProfit ?
//                     `1:${getRiskReward(displayEntry, displayStopLoss, displayTakeProfit)}` :
//                     '1:1.5'
//                 }
//               </span>
//             </div>
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Position Size:</span>
//               <span className="text-green-400 text-right break-words min-w-0">{positionSize}</span>
//             </div>
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Win Probability:</span>
//               <span className="text-blue-400 flex-shrink-0">{performanceMetrics.winProbability}%</span>
//             </div>
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Max Drawdown:</span>
//               <span className="text-yellow-400 flex-shrink-0">-{performanceMetrics.maxDrawdown}%</span>
//             </div>
//           </div>
//         </div>

//         {/* Enhanced Performance Panel */}
//         <div className="bg-[#1a2332] rounded-lg p-4 overflow-hidden">
//           <div
//             className="text-gray-400 text-sm mb-2 hover:text-blue-400 cursor-help transition-colors flex items-center space-x-1"
//             onMouseEnter={(e) => showTooltip(e, tooltipContent.performanceMetrics, 'info')}
//             onMouseLeave={hideTooltip}
//           >
//             <span className="break-words min-w-0">Performance Metrics</span>
//             <span className="text-xs flex-shrink-0">ⓘ</span>
//           </div>
//           <div className="space-y-2">
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Win Rate (Last 100):</span>
//               <span className="text-green-400 flex-shrink-0">
//                 {formattedAccuracy}
//               </span>
//             </div>
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Avg Gain:</span>
//               <span className="text-green-400 flex-shrink-0">+{performanceMetrics.avgGain}%</span>
//             </div>
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Avg Loss:</span>
//               <span className="text-red-400 flex-shrink-0">-{performanceMetrics.avgLoss}%</span>
//             </div>
//             <div className="flex justify-between text-sm gap-2">
//               <span className="text-gray-400 flex-shrink-0">Profit Factor:</span>
//               <span className="text-blue-400 flex-shrink-0">{performanceMetrics.profitFactor}x</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Market Structure Panel */}
//       <div className="bg-[#1a2332] rounded-lg p-4 mb-4 overflow-visible">
//         <div
//           className="text-gray-400 text-sm mb-3 hover:text-blue-400 cursor-help transition-colors flex items-center space-x-1"
//           onMouseEnter={(e) => showTooltip(e, tooltipContent.marketStructure, 'info')}
//           onMouseLeave={hideTooltip}
//         >
//           <span className="break-words min-w-0">Market Structure & Key Levels</span>
//           <span className="text-xs flex-shrink-0">ⓘ</span>
//         </div>
//         <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
//           <div className="min-w-0">
//             <div className="text-xs text-gray-400">Trend Direction</div>
//             <div className={`text-sm font-medium break-words ${marketStructure.trend === 'Bullish' ? 'text-green-400' :
//               marketStructure.trend === 'Bearish' ? 'text-red-400' :
//                 'text-yellow-400'
//               }`}>
//               {marketStructure.shortTermTrend} / {marketStructure.longTermTrend}
//             </div>
//           </div>
//           <div className="min-w-0">
//             <div className="text-xs text-gray-400">Key Pivot</div>
//             <div className="text-sm font-medium text-white break-all">${Math.round(currentPrice || 0).toLocaleString()}</div>
//           </div>
//           <div className="min-w-0">
//             <div className="text-xs text-gray-400">Next Resistance</div>
//             <div className="text-sm font-medium text-green-400 break-all">${Math.round(keyLevels.resistance).toLocaleString()}</div>
//           </div>
//           <div className="min-w-0">
//             <div className="text-xs text-gray-400">Next Support</div>
//             <div className="text-sm font-medium text-red-400 break-all">${Math.round(keyLevels.support).toLocaleString()}</div>
//           </div>
//         </div>
//       </div>

//       {/* Chart Container with maximize button */}
//       <div className="w-full bg-[#1a2332] rounded-lg p-2 mb-4 relative overflow-visible"
//         style={{ height: isMobile ? '350px' : '550px' }}
//         onMouseLeave={hideTooltip}
//       >
//         {/* Loading indicator */}
//         {isLoadingData && (
//           <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-50 rounded-lg">
//             <div className="text-center">
//               <div className="text-white text-lg font-medium">Loading Bitcoin Data...</div>
//               <div className="text-gray-400 text-sm mt-1">Fetching live candles from Binance</div>
//             </div>
//           </div>
//         )}

//         {/* Chart maximize button */}
//         <button
//           onClick={() => setIsChartMaximized(true)}
//           className="absolute top-3 right-3 z-10 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white p-2 rounded-lg transition-colors duration-200 backdrop-blur-sm"
//           title="Maximize Chart"
//         >
//           <Maximize2 size={16} />
//         </button>

//         {/* Main chart container */}
//         <div ref={chartContainer} className="w-full h-full" />

//         {/* Enhanced Tooltip */}
//         {tooltip.visible && tooltip.data && (
//           <div
//             className={`absolute ${tooltip.type === 'info' ? 'bg-gray-800' : 'bg-gray-900'} border border-gray-600 rounded-lg p-3 text-white shadow-xl z-50 ${isMobile ? 'text-xs' : 'text-sm'
//               } ${tooltip.type === 'info' ? 'max-w-md' : 'min-w-48'} break-words`}
//             style={{
//               left: tooltip.x + 10,
//               top: tooltip.y - 10,
//               transform: tooltip.x > (isMobile ? 200 : 300) ? 'translateX(-100%)' : 'none'
//             }}
//           >
//             {tooltip.type === 'info' ? (
//               // Info tooltip content
//               <div className="space-y-2">
//                 <div className="font-bold text-blue-400 border-b border-gray-600 pb-1 break-words">
//                   {tooltip.data.title}
//                 </div>
//                 <div className="space-y-2">
//                   {tooltip.data.content.map((item: string, index: number) => (
//                     <div key={index} className="text-sm leading-relaxed">
//                       <span className="font-medium text-gray-300 break-words">
//                         {item.split(':')[0]}:
//                       </span>
//                       <span className="text-gray-400 ml-1 break-words">
//                         {item.split(':').slice(1).join(':')}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ) : tooltip.type === 'trade' ? (
//               // Trade tooltip content
//               <div className="space-y-2">
//                 <div className="font-bold text-blue-400 border-b border-gray-600 pb-1">
//                   {tooltip.data.type === 'entry' ? 'Trade Entry' : 'Trade Exit'}
//                 </div>
//                 <div className="flex justify-between gap-2">
//                   <span className="text-gray-400">Signal:</span>
//                   <span className={tooltip.data.signal === 'LONG' ? 'text-green-400' : 'text-red-400'}>
//                     {tooltip.data.signal}
//                   </span>
//                 </div>
//                 <div className="flex justify-between gap-2">
//                   <span className="text-gray-400">Price:</span>
//                   <span>${tooltip.data.price.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between gap-2">
//                   <span className="text-gray-400">Time:</span>
//                   <span>{new Date(tooltip.data.time).toLocaleTimeString()}</span>
//                 </div>
//                 {tooltip.data.type === 'exit' && (
//                   <>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400">Exit Reason:</span>
//                       <span className={`${
//                         tooltip.data.exitReason === 'take_profit' ? 'text-green-400' :
//                         tooltip.data.exitReason === 'stop_loss' ? 'text-red-400' : 'text-blue-400'
//                       }`}>
//                         {tooltip.data.exitReason === 'take_profit' ? 'Take Profit' :
//                          tooltip.data.exitReason === 'stop_loss' ? 'Stop Loss' : 'Next Hour'}
//                       </span>
//                     </div>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400">PnL:</span>
//                       <span className={tooltip.data.pnl > 0 ? 'text-green-400' : 'text-red-400'}>
//                         ${tooltip.data.pnl?.toFixed(2)} ({tooltip.data.pnlPercentage?.toFixed(2)}%)
//                       </span>
//                     </div>
//                   </>
//                 )}
//               </div>
//             ) : (
//               // Chart tooltip content
//               <div className="space-y-2">
//                 {tooltip.data.type === 'candlestick' && (
//                   <>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400 flex-shrink-0">Time:</span>
//                       <span className="break-words min-w-0">{new Date(tooltip.data.time * 1000).toLocaleTimeString()}</span>
//                     </div>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400 flex-shrink-0">OHLC:</span>
//                       <span className="break-all min-w-0">
//                         ${Math.round(tooltip.data.open).toLocaleString()} /
//                         ${Math.round(tooltip.data.high).toLocaleString()} /
//                         ${Math.round(tooltip.data.low).toLocaleString()} /
//                         ${Math.round(tooltip.data.close).toLocaleString()}
//                       </span>
//                     </div>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-400 flex-shrink-0">Change:</span>
//                       <span className={`flex-shrink-0 ${tooltip.data.close > tooltip.data.open ? 'text-green-400' : 'text-red-400'}`}>
//                         {((tooltip.data.close / tooltip.data.open - 1) * 100).toFixed(2)}%
//                       </span>
//                     </div>
//                   </>
//                 )}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Enhanced Legend */}
//       <div className="mb-4 overflow-x-auto">
//         <div className={`flex flex-wrap gap-x-6 gap-y-2 ${isMobile ? 'text-xs' : 'text-sm'} min-w-max`}>
//           <div className="flex items-center space-x-2 flex-shrink-0">
//             <div className="w-4 h-0.5 bg-yellow-500"></div>
//             <span className="text-gray-400 whitespace-nowrap">Target Price</span>
//           </div>
//           <div className="flex items-center space-x-2 flex-shrink-0">
//             <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
//               <span className="text-white text-xs font-bold">B</span>
//             </div>
//             <span className="text-gray-400 whitespace-nowrap">Long Entry</span>
//           </div>
//           <div className="flex items-center space-x-2 flex-shrink-0">
//             <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
//               <span className="text-white text-xs font-bold">S</span>
//             </div>
//             <span className="text-gray-400 whitespace-nowrap">Short Entry</span>
//           </div>
//           <div className="flex items-center space-x-2 flex-shrink-0">
//             <div className="w-3 h-3 bg-gray-500 rounded-full flex items-center justify-center">
//               <span className="text-white text-xs font-bold">X</span>
//             </div>
//             <span className="text-gray-400 whitespace-nowrap">Exit</span>
//           </div>
//           <div className="flex items-center space-x-2 flex-shrink-0">
//             <div className="w-4 h-2 bg-blue-500" style={{ opacity: 0.3 }}></div>
//             <span className="text-gray-400 whitespace-nowrap">50% Confidence</span>
//           </div>
//           <div className="flex items-center space-x-2 flex-shrink-0">
//             <div className="w-4 h-2 bg-yellow-600" style={{ opacity: 0.3 }}></div>
//             <span className="text-gray-400 whitespace-nowrap">80% Confidence</span>
//           </div>
//           <div className="flex items-center space-x-2 flex-shrink-0">
//             <div className="w-4 h-2 bg-green-500" style={{ opacity: 0.3 }}></div>
//             <span className="text-gray-400 whitespace-nowrap">90% Confidence</span>
//           </div>
//           <div className="flex items-center space-x-2 flex-shrink-0">
//             <div className="w-4 h-0.5 bg-red-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #ef4444 0, #ef4444 3px, transparent 3px, transparent 6px)' }}></div>
//             <span className="text-gray-400 whitespace-nowrap">Support/Resistance</span>
//           </div>
//           <div className="flex items-center space-x-2 flex-shrink-0">
//             <div className="w-4 h-0.5 bg-purple-600" style={{ backgroundImage: 'repeating-linear-gradient(to right, #7c3aed 0, #7c3aed 4px, transparent 4px, transparent 6px)' }}></div>
//             <span className="text-gray-400 whitespace-nowrap">Key Levels</span>
//           </div>
//         </div>
//       </div>

//       {/* Market Context Panel */}
//       <div className="bg-[#1a2332] rounded-lg p-4 overflow-hidden">
//         <div className="text-gray-400 text-sm mb-3 break-words">Market Context & Catalysts</div>
//         <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 text-sm`}>
//           <div className="min-w-0">
//             <div className="text-xs text-gray-400">News Impact</div>
//             <div className="text-white break-words">{marketContext.newsImpact}</div>
//           </div>
//           <div className="min-w-0">
//             <div className="text-xs text-gray-400">Technical Setup</div>
//             <div className="text-white break-words">{marketContext.technicalSetup}</div>
//           </div>
//           <div className="min-w-0">
//             <div className="text-xs text-gray-400">Volume</div>
//             <div className={`break-words ${marketContext.volumeStatus === 'Above Average' ? 'text-green-400' :
//               marketContext.volumeStatus === 'Below Average' ? 'text-red-400' : 'text-yellow-400'
//               }`}>{marketContext.volumeStatus}</div>
//           </div>
//           <div className="min-w-0">
//             <div className="text-xs text-gray-400">Correlation</div>
//             <div className="text-white break-words">{marketContext.correlation}</div>
//           </div>
//         </div>
//       </div>

//       {/* Full Screen Chart Overlay */}
//       {isChartMaximized && <FullScreenChart />}
//     </div>
//   );
// };

// export default PriceChart;

import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  UTCTimestamp,
} from 'lightweight-charts';

interface HourlyForecast {
  time: string;
  signal: 'LONG' | 'SHORT' | 'HOLD';
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  forecast_price: number;
  current_price: number;
  deviation_percent: number | string;
  accuracy_percent: number | string;
  risk_reward_ratio: number;
  sentiment_score: number;
  confidence_50: [number, number];
  confidence_80: [number, number];
  confidence_90: [number, number];
}

interface PriceData {
  date: string;
  price: number;
}

interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ForecastData {
  date: string;
  signal: 'LONG' | 'SHORT';
  entry: number;
  stop_loss: number;
  take_profit: number;
  confidence_intervals: {
    50: [number, number];
    80: [number, number];
    90: [number, number];
  };
  deviation_percent?: number | string;
  overall_accuracy_percent?: number | string;
}

interface PriceChartProps {
  priceHistory?: PriceData[];
  forecast?: ForecastData[];
  hourlyForecast?: HourlyForecast[];
  className?: string;
}

interface TooltipData {
  x: number;
  y: number;
  data: any;
  visible: boolean;
  type?: 'chart' | 'info' | 'trade';
}

// Enhanced PnL calculation for trading markers
const calculateTradePnL = (currentIndex: number, hourlyForecast: HourlyForecast[]) => {
  if (currentIndex >= hourlyForecast.length - 1) {
    return { pnl: 0, pnlPercentage: 0, exitPrice: 0, exitReason: 'pending' };
  }

  const currentForecast = hourlyForecast[currentIndex];
  const nextForecast = hourlyForecast[currentIndex + 1];

  if (!currentForecast || !nextForecast || 
      currentForecast.signal === 'HOLD' || 
      !currentForecast.entry_price) {
    return { pnl: 0, pnlPercentage: 0, exitPrice: 0, exitReason: 'pending' };
  }

  const entryPrice = currentForecast.entry_price;
  const stopLoss = currentForecast.stop_loss;
  const takeProfit = currentForecast.take_profit;
  const nextPrice = nextForecast.current_price;
  
  let exitPrice = nextPrice;
  let exitReason = 'next_hour';

  // Determine exit price based on which level was hit first
  if (currentForecast.signal === 'LONG') {
    if (stopLoss && nextPrice <= stopLoss) {
      exitPrice = stopLoss;
      exitReason = 'stop_loss';
    } else if (takeProfit && nextPrice >= takeProfit) {
      exitPrice = takeProfit;
      exitReason = 'take_profit';
    }
  } else if (currentForecast.signal === 'SHORT') {
    if (stopLoss && nextPrice >= stopLoss) {
      exitPrice = stopLoss;
      exitReason = 'stop_loss';
    } else if (takeProfit && nextPrice <= takeProfit) {
      exitPrice = takeProfit;
      exitReason = 'take_profit';
    }
  }

  // Calculate PnL based on position type
  let pnl = 0;
  if (currentForecast.signal === 'LONG') {
    pnl = exitPrice - entryPrice;
  } else if (currentForecast.signal === 'SHORT') {
    pnl = entryPrice - exitPrice;
  }

  const pnlPercentage = (pnl / entryPrice) * 100;

  return { pnl, pnlPercentage, exitPrice, exitReason };
};

// Segmented Control Component
const SegmentedControl = ({
  options,
  selected,
  onChange,
  className = ""
}: {
  options: { value: string; label: string }[];
  selected: string;
  onChange: (value: string) => void;
  className?: string;
}) => {
  return (
    <div className={`inline-flex bg-[#1a2332] rounded-lg p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded-md transition-all duration-200 whitespace-nowrap ${selected === option.value
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-400 hover:text-white hover:bg-[#2a3441]'
            }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

const fetchRealBitcoinData = async (
  setDataSource?: (src: 'real' | 'fallback') => void
): Promise<CandlestickData[]> => {
  try {
    const res = await fetch(
      'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=60'
    );
    if (!res.ok) throw new Error(`Binance returned ${res.status}`);
    const raw = await res.json() as any[][];
    setDataSource?.('real');
    return raw.map(([ts, open, high, low, close, volume]) => ({
      timestamp: ts,
      open: +open,
      high: +high,
      low: +low,
      close: +close,
      volume: +volume,
    }));
  } catch (err) {
    console.error('Failed to fetch real candles, falling back:', err);
    setDataSource?.('fallback');
    return generateFallbackData();
  }
};

const fetchCurrentBitcoinPrice = async (): Promise<number> => {
  try {
    const res = await fetch(
      'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
    );
    if (!res.ok) throw new Error(`Binance ticker returned ${res.status}`);
    const json = await res.json() as { price: string };
    return parseFloat(json.price);
  } catch (err) {
    console.error('Failed to fetch current price:', err);
    return 0;
  }
};

// Fallback data generator
const generateFallbackData = (): CandlestickData[] => {
  const data: CandlestickData[] = [];
  let currentPrice = 118400; // More realistic current BTC price
  const now = Date.now();

  for (let i = 59; i >= 0; i--) {
    const timestamp = now - (i * 60000);
    const volatility = 0.002;

    const open = currentPrice;
    const change = (Math.random() - 0.5) * volatility * currentPrice;
    const close = open + change;

    const high = Math.max(open, close) + Math.random() * volatility * currentPrice * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * currentPrice * 0.5;

    const volume = Math.random() * 1000000 + 500000;

    data.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume
    });

    currentPrice = close + (118500 - 118400) / 60; // Slight upward trend
  }

  return data;
};

const PriceChart: React.FC<PriceChartProps> = ({
  priceHistory = [
    { date: "2025-07-02", price: 104639.48 },
    { date: "2025-07-03", price: 104611.16 },
    { date: "2025-07-04", price: 103296.19 },
    { date: "2025-07-05", price: 101348.19 },
    { date: "2025-07-06", price: 101987.11 },
    { date: "2025-07-07", price: 105436.11 },
    { date: "2025-07-08", price: 106371.09 }
  ],
  forecast = [
    {
      date: "2025-07-14",
      signal: "LONG" as const,
      entry: 118450,
      stop_loss: 117936,
      take_profit: 118864,
      confidence_intervals: {
        50: [118400, 118500],
        80: [118350, 118550],
        90: [118300, 118600]
      },
      deviation_percent: 1.5,
      overall_accuracy_percent: 98.5
    }
  ],
  className = "",
  hourlyForecast = [
    {
      time: "2025-07-15T07:00:00+00:00",
      signal: "LONG" as const,
      entry_price: 118450,
      stop_loss: 117936,
      take_profit: 118864,
      forecast_price: 118510,
      current_price: 118450,
      deviation_percent: "N/A",
      accuracy_percent: "N/A",
      risk_reward_ratio: 2.1,
      sentiment_score: 27.39,
      confidence_50: [118400, 118500],
      confidence_80: [118350, 118550],
      confidence_90: [118300, 118600]
    },
    {
      time: "2025-07-15T08:00:00+00:00",
      signal: "SHORT" as const,
      entry_price: 118400,
      stop_loss: 118800,
      take_profit: 117800,
      forecast_price: 118200,
      current_price: 118200,
      deviation_percent: -0.21,
      accuracy_percent: 99.79,
      risk_reward_ratio: 1.5,
      sentiment_score: 32.27,
      confidence_50: [118150, 118250],
      confidence_80: [118100, 118300],
      confidence_90: [118050, 118350]
    },
    {
      time: "2025-07-15T09:00:00+00:00",
      signal: "HOLD" as const,
      entry_price: null,
      stop_loss: null,
      take_profit: null,
      forecast_price: 118300,
      current_price: 118300,
      deviation_percent: -0.07,
      accuracy_percent: 99.93,
      risk_reward_ratio: 0.21,
      sentiment_score: 43.16,
      confidence_50: [118250, 118350],
      confidence_80: [118200, 118400],
      confidence_90: [118150, 118450]
    },
    {
      time: "2025-07-15T10:00:00+00:00",
      signal: "LONG" as const,
      entry_price: 118350,
      stop_loss: 118000,
      take_profit: 118700,
      forecast_price: 118400,
      current_price: 118350,
      deviation_percent: -0.03,
      accuracy_percent: 99.97,
      risk_reward_ratio: 1.0,
      sentiment_score: 41.33,
      confidence_50: [118320, 118380],
      confidence_80: [118300, 118400],
      confidence_90: [118280, 118420]
    }
  ],
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'TODAY' | 'PAST_7D' | 'NEXT_3D'>('TODAY');
  const [selectedSubTimeframe, setSelectedSubTimeframe] = useState<'3D' | '7D'>('3D');
  const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'SOL' | 'ETH'>('BTC');
  const [tooltip, setTooltip] = useState<TooltipData>({ x: 0, y: 0, data: null, visible: false, type: 'chart' });
  const [isMobile, setIsMobile] = useState(false);
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataSource, setDataSource] = useState<'real' | 'fallback'>('real');
  const [isChartMaximized, setIsChartMaximized] = useState(false);
  
  // Chart refs
  const chartContainer = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const priceSeriesRef = useRef<any>(null);
  const fullScreenChartContainer = useRef<HTMLDivElement>(null);
  const fullScreenChartInstance = useRef<any>(null);
  const fullScreenPriceSeriesRef = useRef<any>(null);

  const [latest, setLatest] = useState<{
    deviation_percent?: number | string;
    overall_accuracy_percent?: number | string;
  } | null>(null);

  useEffect(() => {
    const mockLatest = {
      deviation_percent: 1.5,
      overall_accuracy_percent: 98.5
    };
    setLatest(mockLatest);
  }, []);

  useEffect(() => {
    const initializeRealData = async () => {
      setIsLoadingData(true);
      const realData = await fetchRealBitcoinData(setDataSource);
      setCandlestickData(realData);

      if (realData.length > 0) {
        setCurrentPrice(realData[realData.length - 1].close);
      }

      setIsLoadingData(false);
    };

    initializeRealData();
  }, []);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const live = await fetchCurrentBitcoinPrice();
        if (live > 0) {
          setCurrentPrice(live);
        }
      } catch {
        // swallow or log
      }
    }, 10_000);
    return () => clearInterval(id);
  }, []);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle escape key to close maximized chart
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isChartMaximized) {
        setIsChartMaximized(false);
      }
    };

    if (isChartMaximized) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isChartMaximized]);

  // Create SVG overlay for confidence areas and markers
  const createSVGOverlay = (container: HTMLDivElement, isFullScreen = false) => {
    const lastHourly = hourlyForecast && hourlyForecast.length > 0 
      ? hourlyForecast[hourlyForecast.length - 1] 
      : null;

    if (!lastHourly || candlestickData.length === 0) return null;

    const { clientWidth, clientHeight } = container;
    const padding = isFullScreen ? 60 : (isMobile ? 20 : 35);
    
    // Calculate price range for Y positioning
    const prices = candlestickData.flatMap(d => [d.open, d.high, d.low, d.close]);
    prices.push(
      lastHourly.forecast_price,
      lastHourly.confidence_50[0], lastHourly.confidence_50[1],
      lastHourly.confidence_80[0], lastHourly.confidence_80[1],
      lastHourly.confidence_90[0], lastHourly.confidence_90[1]
    );
    
    if (lastHourly.entry_price) prices.push(lastHourly.entry_price);
    if (lastHourly.stop_loss) prices.push(lastHourly.stop_loss);
    if (lastHourly.take_profit) prices.push(lastHourly.take_profit);

    const minPrice = Math.min(...prices) * 0.998;
    const maxPrice = Math.max(...prices) * 1.002;
    const priceRange = maxPrice - minPrice;
    const chartHeight = clientHeight - 120; // Account for volume area

    const getY = (price: number) => padding + (1 - (price - minPrice) / priceRange) * chartHeight;
    const getX = (ratio: number) => padding + ratio * (clientWidth - 2 * padding);

    // Calculate positions
    const currentX = getX(0.7); // Current time position
    const futureX = getX(0.95); // Future projection end

    // Create confidence areas
    const createConfidencePath = (upper: number, lower: number) => {
      const currentY = getY(candlestickData[candlestickData.length - 1]?.close || currentPrice);
      const upperY = getY(upper);
      const lowerY = getY(lower);
      const midY = (upperY + lowerY) / 2;

      return `
        M ${currentX},${currentY}
        Q ${currentX + 50},${currentY} ${futureX - 50},${midY}
        L ${futureX},${upperY}
        L ${futureX},${lowerY}
        Q ${futureX - 50},${midY} ${currentX},${currentY}
        Z
      `;
    };

    // Create actual DOM SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', clientWidth.toString());
    svg.setAttribute('height', clientHeight.toString());
    svg.setAttribute('viewBox', `0 0 ${clientWidth} ${clientHeight}`);
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '10';

    // Add 90% Confidence Area (if not mobile or is fullscreen)
    if (!isMobile || isFullScreen) {
      const path90 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path90.setAttribute('d', createConfidencePath(lastHourly.confidence_90[1], lastHourly.confidence_90[0]));
      path90.setAttribute('fill', '#22c55e');
      path90.setAttribute('fill-opacity', '0.15');
      path90.setAttribute('stroke', '#22c55e');
      path90.setAttribute('stroke-opacity', '0.4');
      path90.setAttribute('stroke-width', '1');
      svg.appendChild(path90);
    }

    // Add 80% Confidence Area (if not mobile or is fullscreen)
    if (!isMobile || isFullScreen) {
      const path80 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path80.setAttribute('d', createConfidencePath(lastHourly.confidence_80[1], lastHourly.confidence_80[0]));
      path80.setAttribute('fill', '#f59e0b');
      path80.setAttribute('fill-opacity', '0.2');
      path80.setAttribute('stroke', '#f59e0b');
      path80.setAttribute('stroke-opacity', '0.5');
      path80.setAttribute('stroke-width', '1');
      svg.appendChild(path80);
    }

    // Add 50% Confidence Area
    const path50 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path50.setAttribute('d', createConfidencePath(lastHourly.confidence_50[1], lastHourly.confidence_50[0]));
    path50.setAttribute('fill', '#3b82f6');
    path50.setAttribute('fill-opacity', '0.25');
    path50.setAttribute('stroke', '#3b82f6');
    path50.setAttribute('stroke-opacity', '0.6');
    path50.setAttribute('stroke-width', '2');
    svg.appendChild(path50);

    // Add Support/Resistance Lines
    const support = Math.min(...candlestickData.slice(-20).map(d => d.low));
    const resistance = Math.max(...candlestickData.slice(-20).map(d => d.high));

    // Support Line
    const supportLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    supportLine.setAttribute('x1', padding.toString());
    supportLine.setAttribute('y1', getY(support).toString());
    supportLine.setAttribute('x2', (clientWidth - padding).toString());
    supportLine.setAttribute('y2', getY(support).toString());
    supportLine.setAttribute('stroke', '#ef4444');
    supportLine.setAttribute('stroke-width', '2');
    supportLine.setAttribute('stroke-dasharray', '5,5');
    supportLine.setAttribute('opacity', '0.8');
    svg.appendChild(supportLine);

    // Support Label
    const supportText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    supportText.setAttribute('x', (padding + 5).toString());
    supportText.setAttribute('y', (getY(support) - 8).toString());
    supportText.setAttribute('fill', '#ef4444');
    supportText.setAttribute('font-size', isFullScreen ? "14" : isMobile ? "10" : "12");
    supportText.setAttribute('font-weight', 'bold');
    supportText.textContent = `SUPPORT ${Math.round(support).toLocaleString()}`;
    svg.appendChild(supportText);

    // Resistance Line
    const resistanceLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    resistanceLine.setAttribute('x1', padding.toString());
    resistanceLine.setAttribute('y1', getY(resistance).toString());
    resistanceLine.setAttribute('x2', (clientWidth - padding).toString());
    resistanceLine.setAttribute('y2', getY(resistance).toString());
    resistanceLine.setAttribute('stroke', '#10b981');
    resistanceLine.setAttribute('stroke-width', '2');
    resistanceLine.setAttribute('stroke-dasharray', '5,5');
    resistanceLine.setAttribute('opacity', '0.8');
    svg.appendChild(resistanceLine);

    // Resistance Label
    const resistanceText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    resistanceText.setAttribute('x', (padding + 5).toString());
    resistanceText.setAttribute('y', (getY(resistance) + 20).toString());
    resistanceText.setAttribute('fill', '#10b981');
    resistanceText.setAttribute('font-size', isFullScreen ? "14" : isMobile ? "10" : "12");
    resistanceText.setAttribute('font-weight', 'bold');
    resistanceText.textContent = `RESISTANCE ${Math.round(resistance).toLocaleString()}`;
    svg.appendChild(resistanceText);

    // Target Price Line
    const targetLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    targetLine.setAttribute('x1', currentX.toString());
    targetLine.setAttribute('y1', getY(lastHourly.forecast_price).toString());
    targetLine.setAttribute('x2', futureX.toString());
    targetLine.setAttribute('y2', getY(lastHourly.forecast_price).toString());
    targetLine.setAttribute('stroke', '#fbbf24');
    targetLine.setAttribute('stroke-width', '3');
    targetLine.setAttribute('stroke-dasharray', '12,6');
    targetLine.setAttribute('opacity', '0.9');
    svg.appendChild(targetLine);

    // Target Price Label
    const targetText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    targetText.setAttribute('x', (futureX - 5).toString());
    targetText.setAttribute('y', (getY(lastHourly.forecast_price) - 8).toString());
    targetText.setAttribute('fill', '#fbbf24');
    targetText.setAttribute('font-size', isFullScreen ? "14" : isMobile ? "10" : "12");
    targetText.setAttribute('text-anchor', 'end');
    targetText.setAttribute('font-weight', 'bold');
    targetText.textContent = `TARGET ${lastHourly.forecast_price.toLocaleString()}`;
    svg.appendChild(targetText);

    // Add Trading Lines
    if (lastHourly.entry_price && lastHourly.signal !== 'HOLD') {
      const entryLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      entryLine.setAttribute('x1', currentX.toString());
      entryLine.setAttribute('y1', getY(lastHourly.entry_price).toString());
      entryLine.setAttribute('x2', futureX.toString());
      entryLine.setAttribute('y2', getY(lastHourly.entry_price).toString());
      entryLine.setAttribute('stroke', '#10b981');
      entryLine.setAttribute('stroke-width', '2');
      entryLine.setAttribute('stroke-dasharray', '8,4');
      entryLine.setAttribute('opacity', '0.8');
      svg.appendChild(entryLine);

      const entryText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      entryText.setAttribute('x', (futureX - 5).toString());
      entryText.setAttribute('y', (getY(lastHourly.entry_price) - 8).toString());
      entryText.setAttribute('fill', '#10b981');
      entryText.setAttribute('font-size', isFullScreen ? "12" : isMobile ? "9" : "11");
      entryText.setAttribute('text-anchor', 'end');
      entryText.setAttribute('font-weight', 'bold');
      entryText.textContent = `ENTRY ZONE ${lastHourly.entry_price.toLocaleString()}`;
      svg.appendChild(entryText);
    }

    if (lastHourly.stop_loss) {
      const stopLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      stopLine.setAttribute('x1', currentX.toString());
      stopLine.setAttribute('y1', getY(lastHourly.stop_loss).toString());
      stopLine.setAttribute('x2', futureX.toString());
      stopLine.setAttribute('y2', getY(lastHourly.stop_loss).toString());
      stopLine.setAttribute('stroke', '#ef4444');
      stopLine.setAttribute('stroke-width', '2');
      stopLine.setAttribute('stroke-dasharray', '8,4');
      stopLine.setAttribute('opacity', '0.8');
      svg.appendChild(stopLine);

      const stopText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      stopText.setAttribute('x', (futureX - 5).toString());
      stopText.setAttribute('y', (getY(lastHourly.stop_loss) + 20).toString());
      stopText.setAttribute('fill', '#ef4444');
      stopText.setAttribute('font-size', isFullScreen ? "12" : isMobile ? "9" : "11");
      stopText.setAttribute('text-anchor', 'end');
      stopText.setAttribute('font-weight', 'bold');
      stopText.textContent = `STOP LOSS ${lastHourly.stop_loss.toLocaleString()}`;
      svg.appendChild(stopText);
    }

    if (lastHourly.take_profit) {
      const profitLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      profitLine.setAttribute('x1', currentX.toString());
      profitLine.setAttribute('y1', getY(lastHourly.take_profit).toString());
      profitLine.setAttribute('x2', futureX.toString());
      profitLine.setAttribute('y2', getY(lastHourly.take_profit).toString());
      profitLine.setAttribute('stroke', '#8b5cf6');
      profitLine.setAttribute('stroke-width', '2');
      profitLine.setAttribute('stroke-dasharray', '8,4');
      profitLine.setAttribute('opacity', '0.8');
      svg.appendChild(profitLine);

      const profitText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      profitText.setAttribute('x', (futureX - 5).toString());
      profitText.setAttribute('y', (getY(lastHourly.take_profit) - 8).toString());
      profitText.setAttribute('fill', '#8b5cf6');
      profitText.setAttribute('font-size', isFullScreen ? "12" : isMobile ? "9" : "11");
      profitText.setAttribute('text-anchor', 'end');
      profitText.setAttribute('font-weight', 'bold');
      profitText.textContent = `TAKE PROFIT ${lastHourly.take_profit.toLocaleString()}`;
      svg.appendChild(profitText);
    }

    // Add Buy/Sell/Exit Markers
    hourlyForecast.forEach((forecast, index) => {
      if (forecast.signal === 'HOLD' || !forecast.entry_price) return;

      const markerX = getX(0.2 + (index * 0.15));
      const markerY = getY(forecast.entry_price);
      const isLong = forecast.signal === 'LONG';
      const tradePnL = calculateTradePnL(index, hourlyForecast);

      // Entry Marker
      const entryCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      entryCircle.setAttribute('cx', markerX.toString());
      entryCircle.setAttribute('cy', markerY.toString());
      entryCircle.setAttribute('r', (isFullScreen ? 12 : isMobile ? 8 : 10).toString());
      entryCircle.setAttribute('fill', isLong ? '#10b981' : '#ef4444');
      entryCircle.setAttribute('stroke', '#ffffff');
      entryCircle.setAttribute('stroke-width', '2');
      entryCircle.style.cursor = 'pointer';
      entryCircle.style.pointerEvents = 'auto';
      entryCircle.addEventListener('click', () => {
        setTooltip({
          x: markerX,
          y: markerY,
          data: {
            type: 'entry',
            signal: forecast.signal,
            price: forecast.entry_price,
            time: forecast.time,
            forecast
          },
          visible: true,
          type: 'trade'
        });
      });
      svg.appendChild(entryCircle);

      // B/S letter
      const entryText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      entryText.setAttribute('x', markerX.toString());
      entryText.setAttribute('y', (markerY + 2).toString());
      entryText.setAttribute('text-anchor', 'middle');
      entryText.setAttribute('dominant-baseline', 'central');
      entryText.setAttribute('fill', 'white');
      entryText.setAttribute('font-size', (isFullScreen ? 14 : isMobile ? 11 : 12).toString());
      entryText.setAttribute('font-weight', 'bold');
      entryText.style.pointerEvents = 'none';
      entryText.textContent = isLong ? 'B' : 'S';
      svg.appendChild(entryText);

      // Exit Marker (if trade is completed)
      if (index < hourlyForecast.length - 1 && tradePnL.exitPrice > 0) {
        const exitX = getX(0.3 + (index * 0.15));
        const exitY = getY(tradePnL.exitPrice);
        const exitColor = tradePnL.pnl > 0 ? '#10b981' : '#ef4444';

        // Exit Circle
        const exitCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        exitCircle.setAttribute('cx', exitX.toString());
        exitCircle.setAttribute('cy', exitY.toString());
        exitCircle.setAttribute('r', (isFullScreen ? 12 : isMobile ? 8 : 10).toString());
        exitCircle.setAttribute('fill', exitColor);
        exitCircle.setAttribute('stroke', '#ffffff');
        exitCircle.setAttribute('stroke-width', '2');
        exitCircle.style.cursor = 'pointer';
        exitCircle.style.pointerEvents = 'auto';
        exitCircle.addEventListener('click', () => {
          setTooltip({
            x: exitX,
            y: exitY,
            data: {
              type: 'exit',
              signal: forecast.signal,
              price: tradePnL.exitPrice,
              time: hourlyForecast[index + 1]?.time,
              exitReason: tradePnL.exitReason,
              pnl: tradePnL.pnl,
              pnlPercentage: tradePnL.pnlPercentage
            },
            visible: true,
            type: 'trade'
          });
        });
        svg.appendChild(exitCircle);

        // X letter
        const exitText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        exitText.setAttribute('x', exitX.toString());
        exitText.setAttribute('y', (exitY + 2).toString());
        exitText.setAttribute('text-anchor', 'middle');
        exitText.setAttribute('dominant-baseline', 'central');
        exitText.setAttribute('fill', 'white');
        exitText.setAttribute('font-size', (isFullScreen ? 14 : isMobile ? 11 : 12).toString());
        exitText.setAttribute('font-weight', 'bold');
        exitText.style.pointerEvents = 'none';
        exitText.textContent = 'X';
        svg.appendChild(exitText);

        // Connection line
        const connectionLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        connectionLine.setAttribute('x1', markerX.toString());
        connectionLine.setAttribute('y1', markerY.toString());
        connectionLine.setAttribute('x2', exitX.toString());
        connectionLine.setAttribute('y2', exitY.toString());
        connectionLine.setAttribute('stroke', exitColor);
        connectionLine.setAttribute('stroke-width', '2');
        connectionLine.setAttribute('stroke-dasharray', '5,5');
        connectionLine.setAttribute('opacity', '0.6');
        svg.appendChild(connectionLine);
      }
    });

    // Add Confidence Interval Labels
    const conf50Text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    conf50Text.setAttribute('x', (futureX - 10).toString());
    conf50Text.setAttribute('y', (getY(lastHourly.confidence_50[1]) - 5).toString());
    conf50Text.setAttribute('fill', '#3b82f6');
    conf50Text.setAttribute('font-size', isFullScreen ? "12" : isMobile ? "8" : "10");
    conf50Text.setAttribute('text-anchor', 'end');
    conf50Text.setAttribute('font-weight', 'bold');
    conf50Text.textContent = '50% CONFIDENCE';
    svg.appendChild(conf50Text);

    if (!isMobile || isFullScreen) {
      const conf80Text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      conf80Text.setAttribute('x', (futureX - 10).toString());
      conf80Text.setAttribute('y', (getY(lastHourly.confidence_80[1]) - 5).toString());
      conf80Text.setAttribute('fill', '#f59e0b');
      conf80Text.setAttribute('font-size', isFullScreen ? "12" : "10");
      conf80Text.setAttribute('text-anchor', 'end');
      conf80Text.setAttribute('font-weight', 'bold');
      conf80Text.textContent = '80% CONFIDENCE';
      svg.appendChild(conf80Text);

      const conf90Text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      conf90Text.setAttribute('x', (futureX - 10).toString());
      conf90Text.setAttribute('y', (getY(lastHourly.confidence_90[1]) - 5).toString());
      conf90Text.setAttribute('fill', '#22c55e');
      conf90Text.setAttribute('font-size', isFullScreen ? "12" : "10");
      conf90Text.setAttribute('text-anchor', 'end');
      conf90Text.setAttribute('font-weight', 'bold');
      conf90Text.textContent = '90% CONFIDENCE';
      svg.appendChild(conf90Text);
    }

    // Add Breakout and Invalidation Lines
    const breakoutLevel = Math.max(...candlestickData.slice(-20).map(d => d.high)) * 1.001;
    const invalidationLevel = Math.min(...candlestickData.slice(-20).map(d => d.low)) * 0.999;

    // Breakout Line
    const breakoutLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    breakoutLine.setAttribute('x1', padding.toString());
    breakoutLine.setAttribute('y1', getY(breakoutLevel).toString());
    breakoutLine.setAttribute('x2', (clientWidth - padding).toString());
    breakoutLine.setAttribute('y2', getY(breakoutLevel).toString());
    breakoutLine.setAttribute('stroke', '#8b5cf6');
    breakoutLine.setAttribute('stroke-width', '1');
    breakoutLine.setAttribute('stroke-dasharray', '6,2');
    breakoutLine.setAttribute('opacity', '0.6');
    svg.appendChild(breakoutLine);

    const breakoutText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    breakoutText.setAttribute('x', (clientWidth - padding - 5).toString());
    breakoutText.setAttribute('y', (getY(breakoutLevel) - 5).toString());
    breakoutText.setAttribute('fill', '#8b5cf6');
    breakoutText.setAttribute('font-size', isFullScreen ? "11" : isMobile ? "8" : "9");
    breakoutText.setAttribute('text-anchor', 'end');
    breakoutText.textContent = `BREAKOUT ${Math.round(breakoutLevel).toLocaleString()}`;
    svg.appendChild(breakoutText);

    // Invalidation Line
    const invalidationLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    invalidationLine.setAttribute('x1', padding.toString());
    invalidationLine.setAttribute('y1', getY(invalidationLevel).toString());
    invalidationLine.setAttribute('x2', (clientWidth - padding).toString());
    invalidationLine.setAttribute('y2', getY(invalidationLevel).toString());
    invalidationLine.setAttribute('stroke', '#f59e0b');
    invalidationLine.setAttribute('stroke-width', '1');
    invalidationLine.setAttribute('stroke-dasharray', '6,2');
    invalidationLine.setAttribute('opacity', '0.6');
    svg.appendChild(invalidationLine);

    const invalidationText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    invalidationText.setAttribute('x', (clientWidth - padding - 5).toString());
    invalidationText.setAttribute('y', (getY(invalidationLevel) + 15).toString());
    invalidationText.setAttribute('fill', '#f59e0b');
    invalidationText.setAttribute('font-size', isFullScreen ? "11" : isMobile ? "8" : "9");
    invalidationText.setAttribute('text-anchor', 'end');
    invalidationText.textContent = `INVALIDATION ${Math.round(invalidationLevel).toLocaleString()}`;
    svg.appendChild(invalidationText);

    return svg;
  };

  // Create TradingView-style chart
  const createTradingViewChart = (container: HTMLDivElement, isFullScreen = false) => {
    if (!container || candlestickData.length === 0) {
      console.warn('Cannot create chart: missing container or data', { container, dataLength: candlestickData.length });
      return null;
    }

    console.log(`Creating ${isFullScreen ? 'fullscreen' : 'normal'} chart...`, {
      containerDimensions: { width: container.clientWidth, height: container.clientHeight },
      dataLength: candlestickData.length
    });

    const { clientWidth, clientHeight } = container;
    
    const chart = createChart(container, {
      width: clientWidth,
      height: clientHeight,
      layout: { 
        background: { color: '#0a1628' },
        textColor: '#d1d5db' 
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      crosshair: {
        mode: 0,
        vertLine: {
          color: '#6b7280',
          width: 1,
          style: 0,
        },
        horzLine: {
          color: '#6b7280',
          width: 1,
          style: 0,
        },
      },
      timeScale: {
        borderColor: '#4b5563',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#4b5563',
        autoScale: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.3,
        },
      },
    });

    console.log(`Chart created successfully for ${isFullScreen ? 'fullscreen' : 'normal'} mode`);

    // Convert candlestick data to chart format
    const chartData = candlestickData.map(candle => ({
      time: (candle.timestamp / 1000) as UTCTimestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    const volumeData = candlestickData.map((candle, i) => {
      const prev = candlestickData[i - 1];
      const color = !prev || candle.close >= prev.close ? '#26a69a' : '#ef5350';
      return { 
        time: (candle.timestamp / 1000) as UTCTimestamp, 
        value: candle.volume, 
        color 
      };
    });

    // Add candlestick series
    const priceSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    priceSeries.setData(chartData);

    // Add volume series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({ 
      scaleMargins: { top: 0.7, bottom: 0 },
      autoScale: true
    });
    volumeSeries.setData(volumeData);

    console.log(`Series added to ${isFullScreen ? 'fullscreen' : 'normal'} chart`);

    // Handle crosshair move for tooltips
    chart.subscribeCrosshairMove(param => {
      if (!param?.time || !param?.seriesData || !priceSeries || !container) return;

      const data = param.seriesData.get(priceSeries);
      if (!data || typeof data !== 'object') {
        setTooltip(prev => ({ ...prev, visible: false }));
        return;
      }

      const rect = container.getBoundingClientRect();
      const { open, high, low, close } = data as any;
      
      // Convert chart coordinates to screen coordinates
      const x = param.point?.x || 0;
      const y = param.point?.y || 0;

      setTooltip({
        x: x,
        y: y,
        data: {
          time: param.time,
          open,
          high,
          low,
          close,
          type: 'candlestick'
        },
        visible: true,
        type: 'chart'
      });
    });

    chart.timeScale().fitContent();

    // Function to update SVG overlay based on current chart viewport
    const updateOverlay = () => {
      try {
        // Remove existing overlay
        const existingOverlays = container.querySelectorAll('svg.chart-overlay');
        existingOverlays.forEach(overlay => overlay.remove());

        // Create new overlay with current viewport
        const overlay = createSVGOverlay(container, isFullScreen);
        if (overlay) {
          container.appendChild(overlay);
        }
      } catch (error) {
        console.error('Error updating overlay:', error);
      }
    };

    // Store price series reference
    if (isFullScreen) {
      fullScreenPriceSeriesRef.current = priceSeries;
    } else {
      priceSeriesRef.current = priceSeries;
    }

    // Subscribe to chart viewport changes
    chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
      // Update overlay when user scrolls or zooms
      setTimeout(updateOverlay, 50);
    });

    // Initial overlay creation
    setTimeout(() => {
      console.log(`Creating initial overlay for ${isFullScreen ? 'fullscreen' : 'normal'} chart`);
      if (chart && priceSeries) {
        updateOverlay();
      }
    }, 150); // Increased delay for fullscreen

    console.log(`${isFullScreen ? 'Fullscreen' : 'Normal'} chart setup complete`);
    return chart;
  };

  // Initialize main chart
  useEffect(() => {
    if (!chartContainer.current || candlestickData.length === 0) return;

    // Clean up existing chart
    if (chartInstance.current) {
      chartInstance.current.remove();
      chartInstance.current = null;
      priceSeriesRef.current = null;
    }

    // Remove any existing SVG overlays
    const existingOverlays = chartContainer.current.querySelectorAll('svg.chart-overlay');
    existingOverlays.forEach(overlay => overlay.remove());

    chartInstance.current = createTradingViewChart(chartContainer.current, false);

    const handleResize = () => {
      if (chartInstance.current && chartContainer.current) {
        const { clientWidth, clientHeight } = chartContainer.current;
        chartInstance.current.applyOptions({
          width: clientWidth,
          height: clientHeight,
        });
        
        // Recreate overlay on resize
        const existingOverlays = chartContainer.current.querySelectorAll('svg.chart-overlay');
        existingOverlays.forEach(overlay => overlay.remove());
        
        setTimeout(() => {
          if (priceSeriesRef.current && chartContainer.current && chartInstance.current) {
            const overlay = createSVGOverlay(chartContainer.current!, false);
            if (overlay) {
              chartContainer.current!.appendChild(overlay);
            }
          }
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        chartInstance.current.remove();
        chartInstance.current = null;
        priceSeriesRef.current = null;
      }
    };
  }, [candlestickData, hourlyForecast, isMobile]);

  // Initialize full screen chart
  useEffect(() => {
    if (!isChartMaximized || candlestickData.length === 0) return;

    // Add a small delay to ensure DOM is ready
    const initFullScreenChart = () => {
      if (!fullScreenChartContainer.current) return;

      console.log('Initializing fullscreen chart...', {
        container: fullScreenChartContainer.current,
        dimensions: {
          width: fullScreenChartContainer.current.clientWidth,
          height: fullScreenChartContainer.current.clientHeight
        },
        candleDataLength: candlestickData.length
      });

      // Clean up existing full screen chart
      if (fullScreenChartInstance.current) {
        fullScreenChartInstance.current.remove();
        fullScreenChartInstance.current = null;
        fullScreenPriceSeriesRef.current = null;
      }

      // Remove any existing SVG overlays
      const existingOverlays = fullScreenChartContainer.current.querySelectorAll('svg.chart-overlay');
      existingOverlays.forEach(overlay => overlay.remove());

      // Ensure container has dimensions
      if (fullScreenChartContainer.current.clientWidth === 0 || fullScreenChartContainer.current.clientHeight === 0) {
        console.warn('Container has no dimensions, retrying...');
        setTimeout(initFullScreenChart, 100);
        return;
      }

      try {
        fullScreenChartInstance.current = createTradingViewChart(fullScreenChartContainer.current, true);
        console.log('Fullscreen chart created successfully:', fullScreenChartInstance.current);
        
        // Force a small delay before checking if chart is still there
        setTimeout(() => {
          if (fullScreenChartInstance.current && fullScreenChartContainer.current) {
            console.log('Fullscreen chart still exists after delay');
          } else {
            console.warn('Fullscreen chart disappeared after delay');
          }
        }, 200);
        
      } catch (error) {
        console.error('Error creating fullscreen chart:', error);
      }
    };

    // Use setTimeout to ensure the fullscreen modal is fully rendered
    const timeoutId = setTimeout(initFullScreenChart, 200); // Increased delay

    const handleResize = () => {
      if (fullScreenChartInstance.current && fullScreenChartContainer.current) {
        const { clientWidth, clientHeight } = fullScreenChartContainer.current;
        fullScreenChartInstance.current.applyOptions({
          width: clientWidth,
          height: clientHeight,
        });
        
        // Recreate overlay on resize
        const existingOverlays = fullScreenChartContainer.current.querySelectorAll('svg.chart-overlay');
        existingOverlays.forEach(overlay => overlay.remove());
        
        setTimeout(() => {
          if (fullScreenPriceSeriesRef.current && fullScreenChartContainer.current && fullScreenChartInstance.current) {
            const overlay = createSVGOverlay(fullScreenChartContainer.current!, true);
            if (overlay) {
              fullScreenChartContainer.current!.appendChild(overlay);
            }
          }
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      if (fullScreenChartInstance.current) {
        fullScreenChartInstance.current.remove();
        fullScreenChartInstance.current = null;
        fullScreenPriceSeriesRef.current = null;
      }
    };
  }, [isChartMaximized, candlestickData, hourlyForecast]);

  // Get simplified date format (MM/DD)
  const getSimpleDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };

  // Calculate risk/reward ratio
  const getRiskReward = (entry: number, stop: number, target: number, signal: 'LONG' | 'SHORT' = 'LONG') => {
    let risk: number;
    let reward: number;

    if (signal === 'LONG') {
      risk = entry - stop;
      reward = target - entry;
    } else {
      risk = stop - entry;
      reward = entry - target;
    }

    if (risk <= 0 || reward <= 0) {
      return '0.0';
    }

    return (reward / risk).toFixed(1);
  };

  // Calculate key levels based on current price and recent data
  const getKeyLevels = (price: number, recentData?: CandlestickData[]) => {
    if (!recentData || recentData.length === 0) {
      return {
        support: price * 0.996,
        resistance: price * 1.004,
        breakoutLevel: price * 1.002,
        invalidationLevel: price * 0.993
      };
    }

    // Calculate support/resistance from recent highs/lows
    const recentHighs = recentData.slice(-20).map(d => d.high);
    const recentLows = recentData.slice(-20).map(d => d.low);

    const resistance = Math.max(...recentHighs);
    const support = Math.min(...recentLows);
    const breakoutLevel = resistance * 1.001;
    const invalidationLevel = support * 0.999;

    return { support, resistance, breakoutLevel, invalidationLevel };
  };

  // Calculate market structure from actual price data
  const getMarketStructure = (currentPrice: number, recentData?: CandlestickData[], signal?: string) => {
    if (!recentData || recentData.length < 10) {
      return {
        trend: signal === 'LONG' ? 'Bullish' : signal === 'SHORT' ? 'Bearish' : 'Sideways',
        shortTermTrend: 'Insufficient Data',
        longTermTrend: 'Insufficient Data'
      };
    }

    // Short term trend (last 10 candles)
    const shortTermData = recentData.slice(-10);
    const shortTermStart = shortTermData[0].close;
    const shortTermEnd = shortTermData[shortTermData.length - 1].close;
    const shortTermChange = (shortTermEnd - shortTermStart) / shortTermStart;

    // Long term trend (last 30 candles)
    const longTermData = recentData.slice(-30);
    const longTermStart = longTermData[0].close;
    const longTermEnd = longTermData[longTermData.length - 1].close;
    const longTermChange = (longTermEnd - longTermStart) / longTermStart;

    const getTrendLabel = (change: number) => {
      if (change > 0.01) return 'Bullish';
      if (change < -0.01) return 'Bearish';
      return 'Sideways';
    };

    return {
      trend: signal === 'LONG' ? 'Bullish' : signal === 'SHORT' ? 'Bearish' : 'Sideways',
      shortTermTrend: getTrendLabel(shortTermChange),
      longTermTrend: getTrendLabel(longTermChange)
    };
  };

  // Calculate performance metrics from hourly forecast data
  const calculatePerformanceMetrics = (hourlyData?: HourlyForecast[]) => {
    if (!hourlyData || hourlyData.length === 0) {
      return {
        winRate: 0,
        avgGain: 0,
        avgLoss: 0,
        profitFactor: 0,
        winProbability: 0,
        maxDrawdown: 0
      };
    }

    const validData = hourlyData.filter(h =>
      h.accuracy_percent !== 'N/A' &&
      h.deviation_percent !== 'N/A' &&
      typeof h.accuracy_percent === 'number' &&
      typeof h.deviation_percent === 'number'
    );

    if (validData.length === 0) {
      return {
        winRate: 98.5, // fallback from latest data
        avgGain: 1.8,
        avgLoss: 0.9,
        profitFactor: 2.0,
        winProbability: 75,
        maxDrawdown: 2.1
      };
    }

    const accuracies = validData.map(h => Number(h.accuracy_percent));
    const deviations = validData.map(h => Number(h.deviation_percent));

    const winRate = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;

    const gains = deviations.filter(d => d > 0);
    const losses = deviations.filter(d => d < 0).map(d => Math.abs(d));

    const avgGain = gains.length > 0 ? gains.reduce((sum, g) => sum + g, 0) / gains.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((sum, l) => sum + l, 0) / losses.length : 0;

    const profitFactor = avgLoss > 0 ? avgGain / avgLoss : 0;
    const winProbability = (gains.length / validData.length) * 100;
    const maxDrawdown = Math.max(...losses, 0);

    return {
      winRate: Math.round(winRate * 100) / 100,
      avgGain: Math.round(avgGain * 100) / 100,
      avgLoss: Math.round(avgLoss * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      winProbability: Math.round(winProbability),
      maxDrawdown: Math.round(maxDrawdown * 100) / 100
    };
  };

  // Calculate position size based on volatility and risk
  const calculatePositionSize = (signal: string, riskReward: number, volatility: number) => {
    if (signal === 'HOLD') return 'Conservative (1-2%)';

    // Base position size on risk/reward and volatility
    if (riskReward > 2 && volatility < 0.02) return 'Aggressive (3-5%)';
    if (riskReward > 1.5 && volatility < 0.025) return 'Moderate (2-3%)';
    return 'Conservative (1-2%)';
  };

  // Calculate market volatility from recent data
  const calculateVolatility = (recentData?: CandlestickData[]) => {
    if (!recentData || recentData.length < 10) return 0.02; // default

    const returns = recentData.slice(-10).map((candle, i, arr) => {
      if (i === 0) return 0;
      return (candle.close - arr[i - 1].close) / arr[i - 1].close;
    }).slice(1);

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;

    return Math.sqrt(variance);
  };

  // Calculate market context from data
  const getMarketContext = (recentData?: CandlestickData[], sentimentScore?: number) => {
    if (!recentData || recentData.length === 0) {
      return {
        newsImpact: 'Unknown',
        technicalSetup: 'Unknown',
        volumeStatus: 'Unknown',
        correlation: 'Unknown'
      };
    }

    // Volume analysis
    const recentVolumes = recentData.slice(-10).map(d => d.volume);
    const avgVolume = recentVolumes.reduce((sum, v) => sum + v, 0) / recentVolumes.length;
    const currentVolume = recentData[recentData.length - 1]?.volume || 0;

    const volumeRatio = currentVolume / avgVolume;
    let volumeStatus = 'Average';
    if (volumeRatio > 1.2) volumeStatus = 'Above Average';
    if (volumeRatio < 0.8) volumeStatus = 'Below Average';

    // Technical setup based on price action
    const recent5 = recentData.slice(-5);
    const priceRange = Math.max(...recent5.map(d => d.high)) - Math.min(...recent5.map(d => d.low));
    const avgPrice = recent5.reduce((sum, d) => sum + d.close, 0) / recent5.length;
    const volatilityRatio = priceRange / avgPrice;

    let technicalSetup = 'Consolidation';
    if (volatilityRatio > 0.03) technicalSetup = 'Breakout Pending';
    if (volatilityRatio > 0.05) technicalSetup = 'High Volatility';

    // News impact based on sentiment score
    let newsImpact = 'Low';
    if (sentimentScore) {
      if (sentimentScore > 60 || sentimentScore < 20) newsImpact = 'High';
      else if (sentimentScore > 45 || sentimentScore < 35) newsImpact = 'Medium';
    }

    return {
      newsImpact,
      technicalSetup,
      volumeStatus,
      correlation: 'Following Crypto Market' // This would need external data to compute properly
    };
  };

  // Show/hide tooltip
  const showTooltip = (
    event: React.MouseEvent,
    data: any,
    type: 'chart' | 'info' | 'trade' = 'chart'
  ) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setTooltip({ x, y, data, visible: true, type });
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  // Tooltip content definitions
  const tooltipContent = {
    riskManagement: {
      title: "Risk Management",
      content: [
        "Risk vs Reward: Calculated as (Take Profit - Entry) ÷ (Entry - Stop Loss). Higher ratios indicate better risk-adjusted returns.",
        "Position Size: Recommended portfolio allocation based on volatility and R:R ratio. Conservative (1-2%), Moderate (2-3%), Aggressive (3-5%).",
        "Win Probability: Percentage of positive price deviations from historical hourly forecasts.",
        "Max Drawdown: Largest single loss percentage observed in recent trading signals."
      ]
    },
    performanceMetrics: {
      title: "Performance Metrics",
      content: [
        "Win Rate: Average accuracy percentage from the last 100 hourly predictions.",
        "Avg Gain: Mean percentage gain from all profitable prediction periods.",
        "Avg Loss: Mean percentage loss from all unprofitable prediction periods.",
        "Profit Factor: Ratio of average gains to average losses. Values above 2.0 indicate strong performance."
      ]
    },
    marketStructure: {
      title: "Market Structure & Key Levels",
      content: [
        "Trend Direction: Short-term (10 candles) vs Long-term (30 candles) price movement analysis.",
        "Key Pivot: Current price level acting as decision point for market direction.",
        "Next Resistance: Calculated from recent 20-period highs, where selling pressure may increase.",
        "Next Support: Calculated from recent 20-period lows, where buying interest typically emerges."
      ]
    }
  };

  if (!latest) {
    return (
      <div className="p-4 text-gray-400">
        Loading data...
      </div>
    );
  }

  const firstForecast = latest;
  const firstForecasts = forecast[0];

  // Use hourly forecast data or fallback to forecast data
  const lastHourly = hourlyForecast && hourlyForecast.length > 0
    ? hourlyForecast[hourlyForecast.length - 1]
    : null;

  const displaySignal = lastHourly?.signal || firstForecasts?.signal || 'HOLD';
  const displayEntry = lastHourly?.entry_price || firstForecasts?.entry;
  const displayTakeProfit = lastHourly?.take_profit || firstForecasts?.take_profit;
  const displayStopLoss = lastHourly?.stop_loss || firstForecasts?.stop_loss;
  const performanceMetrics = calculatePerformanceMetrics(hourlyForecast);

  const nextHourTarget = lastHourly?.forecast_price ||
    (hourlyForecast && hourlyForecast.length > 0 ? hourlyForecast[0].forecast_price : null);

  const confidenceProbability = lastHourly?.confidence_50 ?
    Math.round(((lastHourly.confidence_50[1] - lastHourly.confidence_50[0]) / lastHourly.forecast_price) * 100 * 10) :
    75; // Default fallback

  const expectedTimeframe = displaySignal === 'LONG' || displaySignal === 'SHORT' ?
    '30-60' : '45-90';

  // Calculate minutes to next forecast (assuming hourly updates)
  const minutesToNextForecast = (() => {
    const now = new Date();
    const nowUTC = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const nextHourUTC = new Date(nowUTC);
    nextHourUTC.setUTCHours(nowUTC.getUTCHours() + 1, 0, 0, 0);
    return Math.ceil((nextHourUTC.getTime() - nowUTC.getTime()) / (1000 * 60));
  })();

  const formattedAccuracy = lastHourly?.accuracy_percent && lastHourly.accuracy_percent !== 'N/A'
    ? `${lastHourly.accuracy_percent}%`
    : firstForecast?.overall_accuracy_percent
      ? `${firstForecast.overall_accuracy_percent}%`
      : `${performanceMetrics.winRate}%`;

  const formattedDeviation = lastHourly?.deviation_percent && lastHourly.deviation_percent !== 'N/A'
    ? `${lastHourly.deviation_percent}%`
    : firstForecast?.deviation_percent
      ? `+${firstForecast.deviation_percent}%`
      : '+1.50%';

  // Calculate market structure
  const marketStructure = getMarketStructure(currentPrice, candlestickData, displaySignal);
  const keyLevels = getKeyLevels(currentPrice, candlestickData);
  const volatility = calculateVolatility(candlestickData);
  const marketContext = getMarketContext(candlestickData, lastHourly?.sentiment_score || 30);

  // Calculate position size recommendation
  const riskRewardValue = lastHourly?.risk_reward_ratio ||
    (displayEntry && displayStopLoss && displayTakeProfit ?
      parseFloat(getRiskReward(displayEntry, displayStopLoss, displayTakeProfit)) : 1.5);

  const positionSize = calculatePositionSize(displaySignal, riskRewardValue, volatility);

  // Full screen chart overlay
  const FullScreenChart = () => (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-95 z-50" 
        onClick={(e) => {
          // Only close if clicking the backdrop, not the chart content
          if (e.target === e.currentTarget) {
            setIsChartMaximized(false);
          }
        }} 
      />

      {/* Full Screen Chart */}
      <div className="fixed inset-0 z-50 flex flex-col p-4">
        <div className="bg-[#0a1628] h-full rounded-lg flex flex-col relative border border-gray-600">
          {/* Close button */}
          <button
            onClick={() => setIsChartMaximized(false)}
            className="absolute top-4 right-4 z-10 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors duration-200"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>

          {/* Chart header */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white text-lg font-bold">
              {selectedAsset} Price Chart - Full Screen
            </h3>
            <p className="text-gray-400 text-sm">
              Real-time candlestick chart with AI predictions, confidence intervals, and trading markers
            </p>
          </div>

          {/* Chart container */}
          <div className="flex-1 p-4 relative" onMouseLeave={hideTooltip}>
            {/* Debug info */}
            {!fullScreenChartInstance.current && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-50 rounded-lg">
                <div className="text-center">
                  <div className="text-white text-lg font-medium">Initializing Chart...</div>
                  <div className="text-gray-400 text-sm mt-1">Setting up fullscreen view</div>
                </div>
              </div>
            )}
            
            <div ref={fullScreenChartContainer} className="w-full h-full" />

            {/* Enhanced Tooltip for full screen */}
            {tooltip.visible && tooltip.data && (
              <div
                className={`absolute ${tooltip.type === 'info' ? 'bg-gray-800' : 'bg-gray-900'} border border-gray-600 rounded-lg p-3 text-white shadow-xl z-50 text-sm ${tooltip.type === 'info' ? 'max-w-md' : 'min-w-48'} break-words`}
                style={{
                  left: tooltip.x + 10,
                  top: tooltip.y - 10,
                  transform: tooltip.x > 300 ? 'translateX(-100%)' : 'none'
                }}
              >
                {tooltip.type === 'info' ? (
                  // Info tooltip content
                  <div className="space-y-2">
                    <div className="font-bold text-blue-400 border-b border-gray-600 pb-1 break-words">
                      {tooltip.data.title}
                    </div>
                    <div className="space-y-2">
                      {tooltip.data.content.map((item: string, index: number) => (
                        <div key={index} className="text-sm leading-relaxed">
                          <span className="font-medium text-gray-300 break-words">
                            {item.split(':')[0]}:
                          </span>
                          <span className="text-gray-400 ml-1 break-words">
                            {item.split(':').slice(1).join(':')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : tooltip.type === 'trade' ? (
                  // Trade tooltip content
                  <div className="space-y-2">
                    <div className="font-bold text-blue-400 border-b border-gray-600 pb-1">
                      {tooltip.data.type === 'entry' ? 'Trade Entry' : 'Trade Exit'}
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400">Signal:</span>
                      <span className={tooltip.data.signal === 'LONG' ? 'text-green-400' : 'text-red-400'}>
                        {tooltip.data.signal}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400">Price:</span>
                      <span>${tooltip.data.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400">Time:</span>
                      <span>{new Date(tooltip.data.time).toLocaleTimeString()}</span>
                    </div>
                    {tooltip.data.type === 'exit' && (
                      <>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400">Exit Reason:</span>
                          <span className={`${
                            tooltip.data.exitReason === 'take_profit' ? 'text-green-400' :
                            tooltip.data.exitReason === 'stop_loss' ? 'text-red-400' : 'text-blue-400'
                          }`}>
                            {tooltip.data.exitReason === 'take_profit' ? 'Take Profit' :
                             tooltip.data.exitReason === 'stop_loss' ? 'Stop Loss' : 'Next Hour'}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400">PnL:</span>
                          <span className={tooltip.data.pnl > 0 ? 'text-green-400' : 'text-red-400'}>
                            ${tooltip.data.pnl?.toFixed(2)} ({tooltip.data.pnlPercentage?.toFixed(2)}%)
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  // Chart tooltip content
                  <div className="space-y-2">
                    {tooltip.data.type === 'candlestick' && (
                      <>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">Time:</span>
                          <span className="break-words min-w-0">{new Date(tooltip.data.time * 1000).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">OHLC:</span>
                          <span className="break-all min-w-0">
                            ${Math.round(tooltip.data.open).toLocaleString()} /
                            ${Math.round(tooltip.data.high).toLocaleString()} /
                            ${Math.round(tooltip.data.low).toLocaleString()} /
                            ${Math.round(tooltip.data.close).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">Change:</span>
                          <span className={`flex-shrink-0 ${tooltip.data.close > tooltip.data.open ? 'text-green-400' : 'text-red-400'}`}>
                            {((tooltip.data.close / tooltip.data.open - 1) * 100).toFixed(2)}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Full screen legend */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-yellow-500"></div>
                <span className="text-gray-400">Target Price</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">B</span>
                </div>
                <span className="text-gray-400">Long Entry</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <span className="text-gray-400">Short Entry</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">X</span>
                </div>
                <span className="text-gray-400">Exit</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-2 bg-blue-500" style={{ opacity: 0.3 }}></div>
                <span className="text-gray-400">50% Confidence</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-2 bg-yellow-600" style={{ opacity: 0.3 }}></div>
                <span className="text-gray-400">80% Confidence</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-2 bg-green-500" style={{ opacity: 0.3 }}></div>
                <span className="text-gray-400">90% Confidence</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-red-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #ef4444 0, #ef4444 3px, transparent 3px, transparent 6px)' }}></div>
                <span className="text-gray-400">Support/Resistance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-purple-600" style={{ backgroundImage: 'repeating-linear-gradient(to right, #7c3aed 0, #7c3aed 4px, transparent 4px, transparent 6px)' }}></div>
                <span className="text-gray-400">Key Levels</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className={`bg-[#0a1628] rounded-lg p-4 ${className}`}>
      {/* Controls Section */}
      <div className="flex justify-between items-center mb-4 gap-2">
        <select
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value as 'BTC' | 'SOL' | 'ETH')}
          className="bg-[#1a2332] text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm min-w-0 flex-shrink-0"
        >
          <option value="BTC">BTC</option>
          <option value="SOL" disabled>SOL (Soon)</option>
          <option value="ETH" disabled>ETH (Soon)</option>
        </select>

        <SegmentedControl
          options={[
            { value: 'TODAY', label: 'Today' },
          ]}
          selected={selectedTimeframe}
          onChange={(value) => setSelectedTimeframe(value as 'TODAY')}
          className="flex-shrink-0"
        />
      </div>

      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 mb-4 border border-blue-500/30">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-blue-400 text-sm font-medium mb-1">🎯 NEXT HOUR OUTLOOK</div>
            <div className="text-white text-base md:text-lg font-bold break-words">
              ZkAGI anticipates price to hit ${nextHourTarget?.toLocaleString()} over next hour
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-gray-400 text-xs md:text-sm whitespace-nowrap">Next forecast in:</div>
            <div className="text-yellow-400 text-lg md:text-xl font-bold">{minutesToNextForecast}m</div>
          </div>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4 mb-4`}>
        {/* Trading Signal Panel */}
        <div className={`bg-[#1a2332] rounded-lg p-4 border-l-4 overflow-hidden ${displaySignal === 'LONG' ? 'border-green-500' :
          displaySignal === 'SHORT' ? 'border-red-500' :
            'border-yellow-500'
          }`}>
          <div className="flex justify-between items-start mb-2 gap-2">
            <span className="text-gray-400 text-sm flex-shrink-0">TRADING SIGNAL</span>
            <span className={`font-bold text-lg flex-shrink-0 ${displaySignal === 'LONG' ? 'text-green-400' :
              displaySignal === 'SHORT' ? 'text-red-400' :
                'text-yellow-400'
              }`}>
              {displaySignal}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Entry Zone:</span>
              <span className="text-white font-medium text-right break-all min-w-0">
                {displayEntry ? `${(displayEntry * 0.999).toLocaleString()} - ${(displayEntry * 1.001).toLocaleString()}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Take Profit:</span>
              <span className="text-green-400 text-right break-all min-w-0">
                {displayTakeProfit ? `${displayTakeProfit.toLocaleString()} (+${((displayTakeProfit / (displayEntry || 1) - 1) * 100).toFixed(1)}%)` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Stop Loss:</span>
              <span className="text-red-400 text-right break-all min-w-0">
                {displayStopLoss ? `${displayStopLoss.toLocaleString()} (-${((1 - displayStopLoss / (displayEntry || 1)) * 100).toFixed(1)}%)` : 'N/A'}
              </span>
            </div>
          </div>

          <div className="mb-1 mt-5 p-2 bg-gray-800/50 rounded text-[9px] text-gray-500 break-words">
            <strong>Note:</strong> Position parameters display as N/A during HOLD signals.
            Specific entry zones, profit targets, and stop levels are provided for actionable LONG/SHORT signals.
          </div>
        </div>

        {/* Enhanced Risk Analysis */}
        <div className="bg-[#1a2332] rounded-lg p-4 overflow-hidden">
          <div
            className="text-gray-400 text-sm mb-2 hover:text-blue-400 cursor-help transition-colors flex items-center space-x-1"
            onMouseEnter={(e) => showTooltip(e, tooltipContent.riskManagement, 'info')}
            onMouseLeave={hideTooltip}
          >
            <span className="break-words min-w-0">Risk Management</span>
            <span className="text-xs flex-shrink-0">ⓘ</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Risk vs Reward:</span>
              <span className="text-blue-400 font-bold flex-shrink-0">
                {lastHourly?.risk_reward_ratio ?
                  `1:${lastHourly.risk_reward_ratio.toFixed(1)}` :
                  displayEntry && displayStopLoss && displayTakeProfit ?
                    `1:${getRiskReward(displayEntry, displayStopLoss, displayTakeProfit)}` :
                    '1:1.5'
                }
              </span>
            </div>
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Position Size:</span>
              <span className="text-green-400 text-right break-words min-w-0">{positionSize}</span>
            </div>
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Win Probability:</span>
              <span className="text-blue-400 flex-shrink-0">{performanceMetrics.winProbability}%</span>
            </div>
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Max Drawdown:</span>
              <span className="text-yellow-400 flex-shrink-0">-{performanceMetrics.maxDrawdown}%</span>
            </div>
          </div>
        </div>

        {/* Enhanced Performance Panel */}
        <div className="bg-[#1a2332] rounded-lg p-4 overflow-hidden">
          <div
            className="text-gray-400 text-sm mb-2 hover:text-blue-400 cursor-help transition-colors flex items-center space-x-1"
            onMouseEnter={(e) => showTooltip(e, tooltipContent.performanceMetrics, 'info')}
            onMouseLeave={hideTooltip}
          >
            <span className="break-words min-w-0">Performance Metrics</span>
            <span className="text-xs flex-shrink-0">ⓘ</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Win Rate (Last 100):</span>
              <span className="text-green-400 flex-shrink-0">
                {formattedAccuracy}
              </span>
            </div>
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Avg Gain:</span>
              <span className="text-green-400 flex-shrink-0">+{performanceMetrics.avgGain}%</span>
            </div>
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Avg Loss:</span>
              <span className="text-red-400 flex-shrink-0">-{performanceMetrics.avgLoss}%</span>
            </div>
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-400 flex-shrink-0">Profit Factor:</span>
              <span className="text-blue-400 flex-shrink-0">{performanceMetrics.profitFactor}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Market Structure Panel */}
      <div className="bg-[#1a2332] rounded-lg p-4 mb-4 overflow-visible">
        <div
          className="text-gray-400 text-sm mb-3 hover:text-blue-400 cursor-help transition-colors flex items-center space-x-1"
          onMouseEnter={(e) => showTooltip(e, tooltipContent.marketStructure, 'info')}
          onMouseLeave={hideTooltip}
        >
          <span className="break-words min-w-0">Market Structure & Key Levels</span>
          <span className="text-xs flex-shrink-0">ⓘ</span>
        </div>
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
          <div className="min-w-0">
            <div className="text-xs text-gray-400">Trend Direction</div>
            <div className={`text-sm font-medium break-words ${marketStructure.trend === 'Bullish' ? 'text-green-400' :
              marketStructure.trend === 'Bearish' ? 'text-red-400' :
                'text-yellow-400'
              }`}>
              {marketStructure.shortTermTrend} / {marketStructure.longTermTrend}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-400">Key Pivot</div>
            <div className="text-sm font-medium text-white break-all">${Math.round(currentPrice || 0).toLocaleString()}</div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-400">Next Resistance</div>
            <div className="text-sm font-medium text-green-400 break-all">${Math.round(keyLevels.resistance).toLocaleString()}</div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-400">Next Support</div>
            <div className="text-sm font-medium text-red-400 break-all">${Math.round(keyLevels.support).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Chart Container with maximize button */}
      <div className="w-full bg-[#1a2332] rounded-lg p-2 mb-4 relative overflow-visible"
        style={{ height: isMobile ? '350px' : '550px' }}
        onMouseLeave={hideTooltip}
      >
        {/* Loading indicator */}
        {isLoadingData && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-50 rounded-lg">
            <div className="text-center">
              <div className="text-white text-lg font-medium">Loading Bitcoin Data...</div>
              <div className="text-gray-400 text-sm mt-1">Fetching live candles from Binance</div>
            </div>
          </div>
        )}

        {/* Chart maximize button */}
        <button
          onClick={() => setIsChartMaximized(true)}
          className="absolute top-3 right-3 z-10 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white p-2 rounded-lg transition-colors duration-200 backdrop-blur-sm"
          title="Maximize Chart"
        >
          <Maximize2 size={16} />
        </button>

        {/* Main chart container */}
        <div ref={chartContainer} className="w-full h-full" />

        {/* Enhanced Tooltip */}
        {tooltip.visible && tooltip.data && (
          <div
            className={`absolute ${tooltip.type === 'info' ? 'bg-gray-800' : 'bg-gray-900'} border border-gray-600 rounded-lg p-3 text-white shadow-xl z-50 ${isMobile ? 'text-xs' : 'text-sm'
              } ${tooltip.type === 'info' ? 'max-w-md' : 'min-w-48'} break-words`}
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 10,
              transform: tooltip.x > (isMobile ? 200 : 300) ? 'translateX(-100%)' : 'none'
            }}
          >
            {tooltip.type === 'info' ? (
              // Info tooltip content
              <div className="space-y-2">
                <div className="font-bold text-blue-400 border-b border-gray-600 pb-1 break-words">
                  {tooltip.data.title}
                </div>
                <div className="space-y-2">
                  {tooltip.data.content.map((item: string, index: number) => (
                    <div key={index} className="text-sm leading-relaxed">
                      <span className="font-medium text-gray-300 break-words">
                        {item.split(':')[0]}:
                      </span>
                      <span className="text-gray-400 ml-1 break-words">
                        {item.split(':').slice(1).join(':')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : tooltip.type === 'trade' ? (
              // Trade tooltip content
              <div className="space-y-2">
                <div className="font-bold text-blue-400 border-b border-gray-600 pb-1">
                  {tooltip.data.type === 'entry' ? 'Trade Entry' : 'Trade Exit'}
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-400">Signal:</span>
                  <span className={tooltip.data.signal === 'LONG' ? 'text-green-400' : 'text-red-400'}>
                    {tooltip.data.signal}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-400">Price:</span>
                  <span>${tooltip.data.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-400">Time:</span>
                  <span>{new Date(tooltip.data.time).toLocaleTimeString()}</span>
                </div>
                {tooltip.data.type === 'exit' && (
                  <>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400">Exit Reason:</span>
                      <span className={`${
                        tooltip.data.exitReason === 'take_profit' ? 'text-green-400' :
                        tooltip.data.exitReason === 'stop_loss' ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {tooltip.data.exitReason === 'take_profit' ? 'Take Profit' :
                         tooltip.data.exitReason === 'stop_loss' ? 'Stop Loss' : 'Next Hour'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400">PnL:</span>
                      <span className={tooltip.data.pnl > 0 ? 'text-green-400' : 'text-red-400'}>
                        ${tooltip.data.pnl?.toFixed(2)} ({tooltip.data.pnlPercentage?.toFixed(2)}%)
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Chart tooltip content
              <div className="space-y-2">
                {tooltip.data.type === 'candlestick' && (
                  <>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">Time:</span>
                      <span className="break-words min-w-0">{new Date(tooltip.data.time * 1000).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">OHLC:</span>
                      <span className="break-all min-w-0">
                        ${Math.round(tooltip.data.open).toLocaleString()} /
                        ${Math.round(tooltip.data.high).toLocaleString()} /
                        ${Math.round(tooltip.data.low).toLocaleString()} /
                        ${Math.round(tooltip.data.close).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">Change:</span>
                      <span className={`flex-shrink-0 ${tooltip.data.close > tooltip.data.open ? 'text-green-400' : 'text-red-400'}`}>
                        {((tooltip.data.close / tooltip.data.open - 1) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Legend */}
      <div className="mb-4 overflow-x-auto">
        <div className={`flex flex-wrap gap-x-6 gap-y-2 ${isMobile ? 'text-xs' : 'text-sm'} min-w-max`}>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-4 h-0.5 bg-yellow-500"></div>
            <span className="text-gray-400 whitespace-nowrap">Target Price</span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <span className="text-gray-400 whitespace-nowrap">Long Entry</span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-gray-400 whitespace-nowrap">Short Entry</span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-3 h-3 bg-gray-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">X</span>
            </div>
            <span className="text-gray-400 whitespace-nowrap">Exit</span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-4 h-2 bg-blue-500" style={{ opacity: 0.3 }}></div>
            <span className="text-gray-400 whitespace-nowrap">50% Confidence</span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-4 h-2 bg-yellow-600" style={{ opacity: 0.3 }}></div>
            <span className="text-gray-400 whitespace-nowrap">80% Confidence</span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-4 h-2 bg-green-500" style={{ opacity: 0.3 }}></div>
            <span className="text-gray-400 whitespace-nowrap">90% Confidence</span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-4 h-0.5 bg-red-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #ef4444 0, #ef4444 3px, transparent 3px, transparent 6px)' }}></div>
            <span className="text-gray-400 whitespace-nowrap">Support/Resistance</span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-4 h-0.5 bg-purple-600" style={{ backgroundImage: 'repeating-linear-gradient(to right, #7c3aed 0, #7c3aed 4px, transparent 4px, transparent 6px)' }}></div>
            <span className="text-gray-400 whitespace-nowrap">Key Levels</span>
          </div>
        </div>
      </div>

      {/* Market Context Panel */}
      <div className="bg-[#1a2332] rounded-lg p-4 overflow-hidden">
        <div className="text-gray-400 text-sm mb-3 break-words">Market Context & Catalysts</div>
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 text-sm`}>
          <div className="min-w-0">
            <div className="text-xs text-gray-400">News Impact</div>
            <div className="text-white break-words">{marketContext.newsImpact}</div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-400">Technical Setup</div>
            <div className="text-white break-words">{marketContext.technicalSetup}</div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-400">Volume</div>
            <div className={`break-words ${marketContext.volumeStatus === 'Above Average' ? 'text-green-400' :
              marketContext.volumeStatus === 'Below Average' ? 'text-red-400' : 'text-yellow-400'
              }`}>{marketContext.volumeStatus}</div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-400">Correlation</div>
            <div className="text-white break-words">{marketContext.correlation}</div>
          </div>
        </div>
      </div>

      {/* Full Screen Chart Overlay */}
      {isChartMaximized && <FullScreenChart />}
    </div>
  );
};

export default PriceChart;