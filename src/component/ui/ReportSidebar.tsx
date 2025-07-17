import { FC, useEffect, useRef, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import Image from 'next/image';
import { FullReportData } from '@/types/types';
import NewsCard from '@/component/ui/NewsCard';
import Gauge from '@/component/ui/Gauge';
import PriceChart from '@/component/ui/PriceChart';
import HourlyPredictionsTable from './HourelyForecast';

// New interface for past prediction data
interface PastPredictionData {
    fetched_date: string;
    crypto_news: Array<{
        news_id: string;
        title: string;
        link: string;
        analysis: string;
        sentimentScore?: number;
        sentimentTag?: 'bearish' | 'neutral' | 'bullish';
        advice?: 'Buy' | 'Hold' | 'Sell';
        reason?: string;
        rationale?: string;
    }>;
    macro_news: Array<{
        news_id: string;
        title: string;
        link: string;
        description?: string;
        analysis: string;
        sentimentScore?: number;
        sentimentTag?: 'bearish' | 'neutral' | 'bullish';
        advice?: 'Buy' | 'Hold' | 'Sell';
        reason?: string;
        rationale?: string;
    }>;
}

interface ReportSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    data: FullReportData | PastPredictionData | null;
}

const ReportSidebar: FC<ReportSidebarProps> = ({ isOpen, onClose, data }) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [btcPrice, setBtcPrice] = useState<number | null>(null);
    const [btcChange, setBtcChange] = useState<number | null>(null);
    const [loadingBtc, setLoadingBtc] = useState(true);

     const [latest, setLatest] = useState<{
    deviation_percent?: number | string;
    overall_accuracy_percent?: number | string;
  } | null>(null);

  // 2️⃣ Fetch it once on mount
  useEffect(() => {
    fetch("/api/past-prediction", {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    })
      .then(r => r.json())
      .then(past => {
        const entry = past.latest_forecast?.[0];
        setLatest({
          deviation_percent: entry?.deviation_percent,
          overall_accuracy_percent: entry?.overall_accuracy_percent
        });
      })
      .catch(console.error);
  }, []);

  const firstFc = latest;
  const rawAcc = firstFc?.overall_accuracy_percent;

    // Check if data is past prediction data
    const isPastData = (data: any): data is PastPredictionData => {
        return data && 'fetched_date' in data && !('predictionAccuracy' in data);
    };

    // Transform past data to current format
    const transformPastDataToCurrentFormat = (pastData: PastPredictionData): FullReportData => {
        const allNews = [...pastData.crypto_news, ...pastData.macro_news];
        const sentimentScores = allNews
            .map(item => item.sentimentScore)
            .filter((score): score is number => score !== undefined && score !== null);
        
        const avgSentiment = sentimentScores.length > 0 
            ? sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length 
            : 2.5;

        // Determine market sentiment based on average score
        const getMarketSentiment = (score: number): 'bullish' | 'bearish' => {
            return score > 3.2 ? 'bullish' : 'bearish';
        };

        // Determine volatility level
        const getVolatility = (): 'low' | 'moderate' | 'high' => {
            // You can customize this logic based on your requirements
            return 'moderate';
        };

        return {
            predictionAccuracy: 85, // Default for past data
            predictionSeries: [],
            priceStats: [], // Empty array to match PriceStat[] type
            marketSentiment: getMarketSentiment(avgSentiment),
            avoidTokens: [],
            newsImpact: [
                {
                    title: allNews[0]?.title || "No major news",
                    sentiment: avgSentiment > 3.2 ? 'bullish' : avgSentiment < 1.6 ? 'bearish' : 'neutral'
                }
            ],
            volatility: getVolatility(),
            liquidity: "high",
            trendingNews: [],
            whatsNew: [
                {
                    text: `Historical report from ${new Date(pastData.fetched_date).toLocaleDateString()}`
                }
            ],
            recommendations: [],
            todaysNews: {
                crypto: pastData.crypto_news.map(item => ({
                    news_id: item.news_id,
                    title: item.title,
                    link: item.link,
                    analysis: item.analysis,
                    sentimentScore: item.sentimentScore || 2.5,
                    sentimentTag: item.sentimentTag || 'neutral',
                    advice: item.advice || 'Hold',
                    reason: item.reason || '',
                    rationale: item.rationale || ''
                })),
                macro: pastData.macro_news.map(item => ({
                    news_id: item.news_id,
                    title: item.title,
                    link: item.link,
                    description: item.description || '',
                    analysis: item.analysis,
                    sentimentScore: item.sentimentScore || 2.5,
                    sentimentTag: item.sentimentTag || 'neutral',
                    advice: item.advice || 'Hold',
                    reason: item.reason || '',
                    rationale: item.rationale || ''
                }))
            },
            forecastNext3Days: [],
            priceHistoryLast7Days: []
        };
    };

    // Get the properly formatted data
    const reportData: FullReportData | null = data 
        ? isPastData(data) 
            ? transformPastDataToCurrentFormat(data)
            : data as FullReportData
        : null;

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        fetch(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin'
        )
            .then(r => r.json())
            .then((arr: any[]) => {
                const btc = arr[0];
                setBtcPrice(btc.current_price);
                setBtcChange(btc.price_change_percentage_24h);
            })
            .catch(console.error)
            .finally(() => setLoadingBtc(false));
    }, []);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        }
        if (isOpen) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen, onClose]);

    // Early return if data is null
    if (!reportData || !reportData.todaysNews) {
        return (
            <>
                {/* overlay */}
                <div
                    className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${isOpen ? 'opacity-100 z-40' : 'opacity-0 -z-10'
                        }`}
                    aria-hidden
                />
                {/* sliding panel */}
                <div
                    ref={panelRef}
                    className={`
                        fixed inset-y-0 right-0 ${isMobile ? 'w-full' : 'w-3/5'} bg-[#0a1628] 
                        transform transition-transform duration-300 ease-in-out
                        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                        flex flex-col shadow-xl z-50 text-white
                    `}
                >
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
                            <p>Loading report data...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Compute average sentiment
    const allScores = [
        ...(reportData.todaysNews.crypto || []),
        ...(reportData.todaysNews.macro || []),
    ]
        // .map(n => n.sentimentScore)
        // .filter((score): score is number => score !== undefined && score !== null);
        .map(n => Number(n.sentimentScore))
  // keep only real, finite numbers (drops NaN, Infinity, undefined)
  .filter(score => Number.isFinite(score));

    const avgSentiment = allScores.length > 0
        ? allScores.reduce((s, a) => s + a, 0) / allScores.length
        : 2.5;

    const isBearish = avgSentiment <= 1.6;
    const isNeutral = avgSentiment > 1.6 && avgSentiment <= 3.2;
    const isBullish = avgSentiment > 3.2;

    // Decide emoji + label
    const marketEmoji = isBearish ? '😢' : isNeutral ? '😐' : '🤩';
    const marketLabel = isBearish ? 'BEARISH' : isNeutral ? 'NEUTRAL' : 'BULLISH';
    const marketColor = isBearish ? 'text-red-500' : isNeutral ? 'text-yellow-500' : 'text-green-500';

    const getCurrentDate = () => {
        // If it's past data, show the fetched date, otherwise show current date
        if (isPastData(data)) {
            const date = new Date(data.fetched_date);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).toUpperCase();
        }
        
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return now.toLocaleDateString('en-US', options).toUpperCase();
    };

    const getReportTitle = () => {
        if (isPastData(data)) {
            return "HISTORICAL PREDICTION REPORT";
        }
        return "DAILY PREDICTION REPORT";
    };

    function TwoLineTitle({ children }: { children: string }) {
        const words = children.split(' ');
        const mid = Math.ceil(words.length / 2);
        const first = words.slice(0, mid).join(' ');
        const second = words.slice(mid).join(' ');
        return (
            <span className="text-green-400 font-bold text-lg leading-tight">
                {first}<br />{second}
            </span>
        );
    }

    // above your return
const formattedAccuracyDisplay = 
  typeof rawAcc === 'number'
    ? `${rawAcc.toFixed(2)}%`
    : typeof rawAcc === 'string'
      // if the API already gave you a string like "99.687", just append "%"
      ? rawAcc.endsWith('%')
          ? rawAcc
          : `${rawAcc}%`
      : '';


    return (
        <>
            {/* overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${isOpen ? 'opacity-100 z-40' : 'opacity-0 -z-10'
                    }`}
                aria-hidden
            />
            {/* sliding panel */}
            <div
                ref={panelRef}
                className={`
                    fixed inset-y-0 right-0 ${isMobile ? 'w-full' : 'w-5/6'} bg-[#0a1628] 
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                    flex flex-col shadow-xl z-50 text-white
                `}
            >
                {/* Header */}
                <header className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                        <div className="">
                            <Image
                                src="images/tiger.svg"
                                alt="logo"
                                width={40}
                                height={40}
                                className='p-2'
                            />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">ZkAGI Newsroom</h1>
                            {isPastData(data) && (
                                <p className="text-xs text-blue-400">Historical Data</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <h2 className="text-lg font-bold">{getReportTitle()}</h2>
                            <p className="text-sm text-gray-400">{getCurrentDate()}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <IoMdClose size={24} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-6" data-pdf-content>
                    {/* Top Section: Prediction Accuracy and 4 Cards Side by Side */}
                    <section className={`${isMobile ? 'flex-col space-y-4' : 'grid grid-cols-3 gap-6'}`}>
                        {/* Prediction Accuracy Chart - Left Side */}
                        <div className="col-span-2 bg-[#1a2332] rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-gray-300">
                                    {isPastData(data) ? 'Historical Analysis' : 'Prediction Accuracy'}
                                </span>
                                <span className="text-green-400 font-bold">
                                    {/* {isPastData(data) ? 'ARCHIVE' : `${rawAcc}%`} */}
                                      {isPastData(data)
    ? 'ARCHIVE'
    : formattedAccuracyDisplay}
                                </span>
                            </div>

                            {/* Price Chart or Historical Notice */}
                            {!isPastData(data) ? (
                                <PriceChart
                                    priceHistory={reportData.priceHistoryLast7Days || []}
                                    forecast={reportData.forecastNext3Days || []}
                                    hourlyForecast={reportData.forecastTodayHourly || []}
                                />
                            ) : (
                                <div className="h-40 flex items-center justify-center bg-gray-800/50 rounded-lg">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">📊</div>
                                        <p className="text-gray-400 text-sm">Historical Report</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(data.fetched_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

{/* 3 Cards - Right Side - Single Column Layout */}
<div className={`flex-1 ${isMobile ? 'flex flex-col gap-2' : 'flex flex-col gap-4 h-full'}`}>
    {/* BTC PRICE CARD */}
    <div className="bg-[#1a2332] rounded-lg p-4 text-center flex flex-col justify-center min-h-[120px]">
        {loadingBtc ? (
            <div className="text-gray-400">Loading…</div>
        ) : (
            <>
                <div className="text-2xl font-bold">
                    ${btcPrice?.toLocaleString()}
                </div>
                <div className={`text-sm ${(btcChange ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {btcChange! >= 0 ? '+' : ''}
                    {btcChange?.toFixed(2)}%
                </div>
            </>
        )}
        <div className="text-xs text-gray-400">
            {isPastData(data) ? 'BTC (Current)' : 'BTC'}
        </div>
    </div>

    {/* MARKET SENTIMENT */}
    <div className="bg-[#1a2332] rounded-lg p-4 text-center flex flex-col justify-center min-h-[120px]">
        <div className="text-3xl">{marketEmoji}</div>
        <div className={`${marketColor} font-bold text-sm`}>
            {marketLabel}
        </div>
        <div className="text-xs text-gray-400">
            {isPastData(data) ? 'HISTORICAL SENTIMENT' : 'MARKET SENTIMENT'}
        </div>
    </div>

    {/* SENTIMENT GAUGE */}
    <div className="bg-[#1a2332] rounded-lg p-2 flex flex-col items-center justify-center flex-1">
        <Gauge
            value={avgSentiment}
            min={0}
            max={5}
            size={280}
        />
    </div>
     {!isPastData(data) && reportData.forecastTodayHourly && (
        <HourlyPredictionsTable 
            hourlyForecast={reportData.forecastTodayHourly}
            className="mt-4"
        />
    )}
</div>
                        {/* 4 Cards - Right Side */}
                        {/* <div className={`flex-1 ${isMobile ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-2 grid-rows-2 gap-4 h-full'}`}>
                            {/* BTC PRICE CARD 
                            <div className="bg-[#1a2332] rounded-lg p-4 text-center flex flex-col justify-center min-h-[120px]">
                                {loadingBtc ? (
                                    <div className="text-gray-400">Loading…</div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">
                                            ${btcPrice?.toLocaleString()}
                                        </div>
                                        <div className={`text-sm ${(btcChange ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {btcChange! >= 0 ? '+' : ''}
                                            {btcChange?.toFixed(2)}%
                                        </div>
                                    </>
                                )}
                                <div className="text-xs text-gray-400">
                                    {isPastData(data) ? 'BTC (Current)' : 'BTC'}
                                </div>
                            </div>

                            {/* MARKET SENTIMENT 
                            <div className="bg-[#1a2332] rounded-lg p-4 text-center flex flex-col justify-center min-h-[120px]">
                                <div className="text-3xl">{marketEmoji}</div>
                                <div className={`${marketColor} font-bold text-sm`}>
                                    {marketLabel}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {isPastData(data) ? 'HISTORICAL SENTIMENT' : 'MARKET SENTIMENT'}
                                </div>
                            </div>

                            {/* SENTIMENT GAUGE 
                            <div className="col-span-2 bg-[#1a2332] rounded-lg p-2 flex flex-col items-center justify-center">
                                <Gauge
                                    value={avgSentiment}
                                    min={0}
                                    max={5}
                                    size={280}
                                />
                            </div>
                        </div> */}
                    </section>

                    {/* Bottom Section: News */}
                    <section className={`${isMobile ? 'flex-col space-y-4' : 'flex gap-6'}`}>
                        {/* Left Column - News Impact & Trending News */}
                        <div className="flex-[2] space-y-6">
                            {/* News Impact */}
                            {/* <div>
                                <div className="flex items-center space-x-2 mb-4">
                                    <span className="text-lg">📢</span>
                                    <h3 className="font-bold">
                                        {isPastData(data) ? 'HISTORICAL NEWS IMPACT' : 'NEWS IMPACT'}
                                    </h3>
                                </div>

                                <div className={`${isMobile ? 'grid grid-cols-1 gap-2 mb-4' : 'grid grid-cols-4 gap-4 mb-4 h-16'}`}>
                                  
                                    <div className="col-span-2 bg-[#1a2332] rounded-lg p-4 h-full flex items-center justify-between">
                                        <TwoLineTitle>
                                            {reportData.newsImpact[0].title.toUpperCase()}
                                        </TwoLineTitle>
                                        <span className={`text-3xl ${reportData.newsImpact[0].sentiment === 'bullish' ? 'text-green-400' : 'text-red-400'}`}>
                                            {reportData.newsImpact[0].sentiment === 'bullish' ? '↗' : '↘'}
                                        </span>
                                    </div>

                    
                                    <div className="bg-[#1a2332] rounded-lg p-4 text-center">
                                        <div className="text-gray-300 text-xs mb-2">VOLATILITY</div>
                                        <div className="text-white font-bold text-lg">{reportData.volatility.toUpperCase()}</div>
                                    </div>

                                    <div className="bg-[#1a2332] rounded-lg p-4 text-center">
                                        <div className="text-gray-300 text-xs mb-2">LIQUIDITY</div>
                                        <div className="text-white font-bold text-lg">{reportData.liquidity.toUpperCase()}</div>
                                    </div>
                                </div>
                            </div> */}

                            {/* Trending News */}
                            <section className="">
                                <div className="flex items-center space-x-2 my-4">
                                    <span className="text-lg">🚀</span>
                                    <h3 className="font-bold">
                                        {isPastData(data) ? 'HISTORICAL NEWS' : 'TRENDING NEWS'}
                                    </h3>
                                </div>

                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {[
                                        ...reportData.todaysNews.crypto,
                                        ...reportData.todaysNews.macro
                                    ].map(item => (
                                        <NewsCard key={item.news_id} item={item} />
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Right Column - What's New & Recommendations */}
                        {(reportData.whatsNew.length > 0 || reportData.recommendations.length > 0) && (
                            <div className="flex-1 space-y-6">
                                {/* WHAT'S NEW */}
                                {reportData.whatsNew.length > 0 && (
                                    <div className="bg-[#1a2332] rounded-lg p-4">
                                        <div className="flex items-center space-x-2 mb-4">
                                            <span className="text-lg">⚙️</span>
                                            <h3 className="font-bold">
                                                {isPastData(data) ? 'ARCHIVE INFO' : "WHAT'S NEW"}
                                            </h3>
                                        </div>
                                        <ul className="space-y-2 text-sm mb-4">
                                            {reportData.whatsNew.map((item, i) => (
                                                <li key={i} className="flex items-start space-x-2">
                                                    <span className="text-green-400">•</span>
                                                    <span>{item.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="flex justify-end">
                                            <Image src="/images/tiger.png" alt="" width={40} height={40} />
                                        </div>
                                    </div>
                                )}

                                {/* RECOMMENDATIONS */}
                                {reportData.recommendations.length > 0 && (
                                    <div className="space-y-4">
                                        {reportData.recommendations.map((rec, i) => (
                                            <div
                                                key={i}
                                                className={`bg-[#1a2332] rounded-lg p-4 border-l-4 ${rec.borderClass}`}
                                            >
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className={`w-2 h-2 rounded-full ${rec.dotClass}`}></span>
                                                    <span className={`font-bold ${rec.textClass}`}>{rec.label}</span>
                                                </div>
                                                <ul className="text-xs space-y-1">
                                                    {rec.items.map((item, idx) => (
                                                        <li key={idx}>
                                                            {item.symbol} – TARGET: {item.target}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </div>

                {/* Footer with Download PDF */}
                <footer className="p-4 border-t border-gray-700">
                    <button
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                        onClick={async () => {
                            try {
                                const html2canvas = (await import('html2canvas')).default;
                                const jsPDF = (await import('jspdf')).jsPDF;

                                const contentElement = document.querySelector('[data-pdf-content]') as HTMLElement;
                                if (!contentElement) {
                                    alert('Content not found for PDF generation');
                                    return;
                                }

                                const clone = contentElement.cloneNode(true) as HTMLElement;
                                const pdfContainer = document.createElement('div');
                                pdfContainer.style.position = 'absolute';
                                pdfContainer.style.left = '-9999px';
                                pdfContainer.style.top = '0';
                                pdfContainer.style.width = '794px';
                                pdfContainer.style.minHeight = '1123px';
                                pdfContainer.style.backgroundColor = '#0a1628';
                                pdfContainer.style.color = 'white';
                                pdfContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
                                pdfContainer.style.padding = '20px';
                                pdfContainer.style.boxSizing = 'border-box';

                                const existingLogo = document.querySelector('img[alt="logo"]') as HTMLImageElement;
                                const logoSrc = existingLogo?.src || '/images/tiger.svg';
                                const currentDate = getCurrentDate();

                                const header = document.createElement('div');
                                header.innerHTML = `
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #374151; padding-bottom: 15px;">
                                        <div style="display: flex; align-items: center;">
                                            <img src="${logoSrc}" alt="logo" style="width: 32px; height: 32px; margin-right: 12px;" />
                                            <h1 style="font-size: 18px; font-weight: bold; margin: 0;">ZkAGI Newsroom</h1>
                                        </div>
                                        <div style="text-align: right;">
                                            <h2 style="font-size: 18px; font-weight: bold; margin: 0;">${getReportTitle()}</h2>
                                            <p style="font-size: 12px; color: #9ca3af; margin: 0;">${currentDate}</p>
                                        </div>
                                    </div>
                                `;

                                clone.style.width = '100%';
                                clone.style.fontSize = '12px';
                                clone.style.lineHeight = '1.4';

                                pdfContainer.appendChild(header);
                                pdfContainer.appendChild(clone);
                                document.body.appendChild(pdfContainer);

                                await new Promise(resolve => setTimeout(resolve, 500));

                                const canvas = await html2canvas(pdfContainer, {
                                    backgroundColor: '#0a1628',
                                    scale: 1.5,
                                    useCORS: true,
                                    allowTaint: true,
                                    width: 794,
                                    height: Math.max(1123, pdfContainer.scrollHeight),
                                    logging: false,
                                });

                                document.body.removeChild(pdfContainer);

                                const imgData = canvas.toDataURL('image/png');
                                const pdf = new jsPDF('p', 'mm', 'a4');
                                const imgWidth = 210;
                                const pageHeight = 297;
                                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                                const finalHeight = Math.min(imgHeight, pageHeight);

                                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, finalHeight);

                                const dateStr = isPastData(data) 
                                    ? new Date(data.fetched_date).toISOString().split('T')[0]
                                    : new Date().toISOString().split('T')[0];
                                const reportType = isPastData(data) ? 'Historical' : 'Daily';
                                pdf.save(`ZkAGI-${reportType}-Report-${dateStr}.pdf`);
                            } catch (error) {
                                console.error('Error generating PDF:', error);
                                alert('Error generating PDF. Please try again.');
                            }
                        }}
                    >
                        Download PDF
                    </button>
                </footer>
            </div>
        </>
    );
};

export default ReportSidebar;

// import { FC, useEffect, useRef, useState } from 'react';
// import { IoMdClose } from 'react-icons/io';
// import Image from 'next/image';
// import { FullReportData } from '@/types/types';
// import NewsCard from '@/component/ui/NewsCard';
// import Gauge from '@/component/ui/Gauge';
// import PriceChart from '@/component/ui/PriceChart';

// // New interface for past prediction data
// interface PastPredictionData {
//     fetched_date: string;
//     crypto_news: Array<{
//         news_id: string;
//         title: string;
//         link: string;
//         analysis: string;
//         sentimentScore?: number;
//         sentimentTag?: 'bearish' | 'neutral' | 'bullish';
//         advice?: 'Buy' | 'Hold' | 'Sell';
//         reason?: string;
//         rationale?: string;
//     }>;
//     macro_news: Array<{
//         news_id: string;
//         title: string;
//         link: string;
//         description?: string;
//         analysis: string;
//         sentimentScore?: number;
//         sentimentTag?: 'bearish' | 'neutral' | 'bullish';
//         advice?: 'Buy' | 'Hold' | 'Sell';
//         reason?: string;
//         rationale?: string;
//     }>;
// }

// interface ReportSidebarProps {
//     isOpen: boolean;
//     onClose: () => void;
//     data: FullReportData | PastPredictionData | null;
// }

// const ReportSidebar: FC<ReportSidebarProps> = ({ isOpen, onClose, data }) => {
//     const panelRef = useRef<HTMLDivElement>(null);
//     const [isMobile, setIsMobile] = useState(false);
//     const [btcPrice, setBtcPrice] = useState<number | null>(null);
//     const [btcChange, setBtcChange] = useState<number | null>(null);
//     const [loadingBtc, setLoadingBtc] = useState(true);

//      const [latest, setLatest] = useState<{
//     deviation_percent?: number | string;
//     overall_accuracy_percent?: number | string;
//   } | null>(null);

//   // 2️⃣ Fetch it once on mount
//   useEffect(() => {
//     fetch("/api/past-prediction", {
//       cache: "no-store",
//       headers: { "Cache-Control": "no-cache" },
//     })
//       .then(r => r.json())
//       .then(past => {
//         const entry = past.latest_forecast?.[0];
//         setLatest({
//           deviation_percent: entry?.deviation_percent,
//           overall_accuracy_percent: entry?.overall_accuracy_percent
//         });
//       })
//       .catch(console.error);
//   }, []);

//   const firstFc = latest;
//   const rawAcc = firstFc?.overall_accuracy_percent;

//     // Check if data is past prediction data
//     const isPastData = (data: any): data is PastPredictionData => {
//         return data && 'fetched_date' in data && !('predictionAccuracy' in data);
//     };

//     // Transform past data to current format
//     const transformPastDataToCurrentFormat = (pastData: PastPredictionData): FullReportData => {
//         const allNews = [...pastData.crypto_news, ...pastData.macro_news];
//         const sentimentScores = allNews
//             .map(item => item.sentimentScore)
//             .filter((score): score is number => score !== undefined && score !== null);
        
//         const avgSentiment = sentimentScores.length > 0 
//             ? sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length 
//             : 2.5;

//         // Determine market sentiment based on average score
//         const getMarketSentiment = (score: number): 'bullish' | 'bearish' => {
//             return score > 3.2 ? 'bullish' : 'bearish';
//         };

//         // Determine volatility level
//         const getVolatility = (): 'low' | 'moderate' | 'high' => {
//             // You can customize this logic based on your requirements
//             return 'moderate';
//         };

//         return {
//             predictionAccuracy: 85, // Default for past data
//             predictionSeries: [],
//             priceStats: [], // Empty array to match PriceStat[] type
//             marketSentiment: getMarketSentiment(avgSentiment),
//             avoidTokens: [],
//             newsImpact: [
//                 {
//                     title: allNews[0]?.title || "No major news",
//                     sentiment: avgSentiment > 3.2 ? 'bullish' : avgSentiment < 1.6 ? 'bearish' : 'neutral'
//                 }
//             ],
//             volatility: getVolatility(),
//             liquidity: "high",
//             trendingNews: [],
//             whatsNew: [
//                 {
//                     text: `Historical report from ${new Date(pastData.fetched_date).toLocaleDateString()}`
//                 }
//             ],
//             recommendations: [],
//             todaysNews: {
//                 crypto: pastData.crypto_news.map(item => ({
//                     news_id: item.news_id,
//                     title: item.title,
//                     link: item.link,
//                     analysis: item.analysis,
//                     sentimentScore: item.sentimentScore || 2.5,
//                     sentimentTag: item.sentimentTag || 'neutral',
//                     advice: item.advice || 'Hold',
//                     reason: item.reason || '',
//                     rationale: item.rationale || ''
//                 })),
//                 macro: pastData.macro_news.map(item => ({
//                     news_id: item.news_id,
//                     title: item.title,
//                     link: item.link,
//                     description: item.description || '',
//                     analysis: item.analysis,
//                     sentimentScore: item.sentimentScore || 2.5,
//                     sentimentTag: item.sentimentTag || 'neutral',
//                     advice: item.advice || 'Hold',
//                     reason: item.reason || '',
//                     rationale: item.rationale || ''
//                 }))
//             },
//             forecastNext3Days: [],
//             priceHistoryLast7Days: []
//         };
//     };

//     // Get the properly formatted data
//     const reportData: FullReportData | null = data 
//         ? isPastData(data) 
//             ? transformPastDataToCurrentFormat(data)
//             : data as FullReportData
//         : null;

//     useEffect(() => {
//         const checkMobile = () => {
//             setIsMobile(window.innerWidth < 768);
//         };

//         checkMobile();
//         window.addEventListener('resize', checkMobile);
//         return () => window.removeEventListener('resize', checkMobile);
//     }, []);

//     useEffect(() => {
//         fetch(
//             'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin'
//         )
//             .then(r => r.json())
//             .then((arr: any[]) => {
//                 const btc = arr[0];
//                 setBtcPrice(btc.current_price);
//                 setBtcChange(btc.price_change_percentage_24h);
//             })
//             .catch(console.error)
//             .finally(() => setLoadingBtc(false));
//     }, []);

//     // Close on outside click
//     useEffect(() => {
//         function handleClick(e: MouseEvent) {
//             if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
//                 onClose();
//             }
//         }
//         if (isOpen) document.addEventListener('mousedown', handleClick);
//         return () => document.removeEventListener('mousedown', handleClick);
//     }, [isOpen, onClose]);

//     // Early return if data is null
//     if (!reportData || !reportData.todaysNews) {
//         return (
//             <>
//                 {/* overlay */}
//                 <div
//                     className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${isOpen ? 'opacity-100 z-40' : 'opacity-0 -z-10'
//                         }`}
//                     aria-hidden
//                 />
//                 {/* sliding panel */}
//                 <div
//                     ref={panelRef}
//                     className={`
//                         fixed inset-y-0 right-0 ${isMobile ? 'w-full' : 'w-3/5'} bg-[#0a1628] 
//                         transform transition-transform duration-300 ease-in-out
//                         ${isOpen ? 'translate-x-0' : 'translate-x-full'}
//                         flex flex-col shadow-xl z-50 text-white
//                     `}
//                 >
//                     <div className="flex items-center justify-center h-full">
//                         <div className="text-center">
//                             <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
//                             <p>Loading report data...</p>
//                         </div>
//                     </div>
//                 </div>
//             </>
//         );
//     }

//     // Compute average sentiment
//     const allScores = [
//         ...(reportData.todaysNews.crypto || []),
//         ...(reportData.todaysNews.macro || []),
//     ]
//         // .map(n => n.sentimentScore)
//         // .filter((score): score is number => score !== undefined && score !== null);
//         .map(n => Number(n.sentimentScore))
//   // keep only real, finite numbers (drops NaN, Infinity, undefined)
//   .filter(score => Number.isFinite(score));

//     const avgSentiment = allScores.length > 0
//         ? allScores.reduce((s, a) => s + a, 0) / allScores.length
//         : 2.5;

//     const isBearish = avgSentiment <= 1.6;
//     const isNeutral = avgSentiment > 1.6 && avgSentiment <= 3.2;
//     const isBullish = avgSentiment > 3.2;

//     // Decide emoji + label
//     const marketEmoji = isBearish ? '😢' : isNeutral ? '😐' : '🤩';
//     const marketLabel = isBearish ? 'BEARISH' : isNeutral ? 'NEUTRAL' : 'BULLISH';
//     const marketColor = isBearish ? 'text-red-500' : isNeutral ? 'text-yellow-500' : 'text-green-500';

//     const getCurrentDate = () => {
//         // If it's past data, show the fetched date, otherwise show current date
//         if (isPastData(data)) {
//             const date = new Date(data.fetched_date);
//             return date.toLocaleDateString('en-US', {
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric'
//             }).toUpperCase();
//         }
        
//         const now = new Date();
//         const options: Intl.DateTimeFormatOptions = {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         };
//         return now.toLocaleDateString('en-US', options).toUpperCase();
//     };

//     const getReportTitle = () => {
//         if (isPastData(data)) {
//             return "HISTORICAL PREDICTION REPORT";
//         }
//         return "DAILY PREDICTION REPORT";
//     };

//     function TwoLineTitle({ children }: { children: string }) {
//         const words = children.split(' ');
//         const mid = Math.ceil(words.length / 2);
//         const first = words.slice(0, mid).join(' ');
//         const second = words.slice(mid).join(' ');
//         return (
//             <span className="text-green-400 font-bold text-lg leading-tight">
//                 {first}<br />{second}
//             </span>
//         );
//     }

//     // above your return
// const formattedAccuracyDisplay = 
//   typeof rawAcc === 'number'
//     ? `${rawAcc.toFixed(2)}%`
//     : typeof rawAcc === 'string'
//       // if the API already gave you a string like "99.687", just append "%"
//       ? rawAcc.endsWith('%')
//           ? rawAcc
//           : `${rawAcc}%`
//       : '';


//     return (
//         <>
//             {/* overlay */}
//             <div
//                 className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${isOpen ? 'opacity-100 z-40' : 'opacity-0 -z-10'
//                     }`}
//                 aria-hidden
//             />
//             {/* sliding panel */}
//             <div
//                 ref={panelRef}
//                 className={`
//                     fixed inset-y-0 right-0 ${isMobile ? 'w-full' : 'w-3/5'} bg-[#0a1628] 
//                     transform transition-transform duration-300 ease-in-out
//                     ${isOpen ? 'translate-x-0' : 'translate-x-full'}
//                     flex flex-col shadow-xl z-50 text-white
//                 `}
//             >
//                 {/* Header */}
//                 <header className="flex items-center justify-between p-6 border-b border-gray-700">
//                     <div className="flex items-center space-x-2">
//                         <div className="">
//                             <Image
//                                 src="images/tiger.svg"
//                                 alt="logo"
//                                 width={40}
//                                 height={40}
//                                 className='p-2'
//                             />
//                         </div>
//                         <div>
//                             <h1 className="text-lg font-bold">ZkAGI Newsroom</h1>
//                             {isPastData(data) && (
//                                 <p className="text-xs text-blue-400">Historical Data</p>
//                             )}
//                         </div>
//                     </div>
//                     <div className="flex items-center space-x-4">
//                         <div className="text-right">
//                             <h2 className="text-lg font-bold">{getReportTitle()}</h2>
//                             <p className="text-sm text-gray-400">{getCurrentDate()}</p>
//                         </div>
//                         <button onClick={onClose} className="text-gray-400 hover:text-white">
//                             <IoMdClose size={24} />
//                         </button>
//                     </div>
//                 </header>

//                 <div className="flex-1 overflow-y-auto p-6 space-y-6" data-pdf-content>
//                     {/* Top Section: 3-Column Layout - Price Chart (2 cols) + Cards (1 col) */}
//                     <section className={`${isMobile ? 'flex-col space-y-4' : 'grid grid-cols-3 gap-6'}`}>
//                         {/* Price Chart - Takes 2 columns */}
//                         <div className={`${isMobile ? '' : 'col-span-2'} bg-[#1a2332] rounded-lg p-4`}>
//                             <div className="flex items-center justify-between mb-4">
//                                 <span className="text-sm text-gray-300">
//                                     {isPastData(data) ? 'Historical Analysis' : 'Prediction Accuracy'}
//                                 </span>
//                                 <span className="text-green-400 font-bold">
//                                     {isPastData(data)
//                                         ? 'ARCHIVE'
//                                         : formattedAccuracyDisplay}
//                                 </span>
//                             </div>

//                             {/* Price Chart or Historical Notice */}
//                             {!isPastData(data) ? (
//                                 <PriceChart
//                                     priceHistory={reportData.priceHistoryLast7Days || []}
//                                     forecast={reportData.forecastNext3Days || []}
//                                 />
//                             ) : (
//                                 <div className="h-40 flex items-center justify-center bg-gray-800/50 rounded-lg">
//                                     <div className="text-center">
//                                         <div className="text-4xl mb-2">📊</div>
//                                         <p className="text-gray-400 text-sm">Historical Report</p>
//                                         <p className="text-xs text-gray-500">
//                                             {new Date(data.fetched_date).toLocaleDateString()}
//                                         </p>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Right Column - Takes 1 column */}
//                         <div className={`${isMobile ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-4'}`}>
//                             {/* BTC PRICE CARD */}
//                             <div className="bg-[#1a2332] rounded-lg p-4 text-center flex flex-col justify-center min-h-[120px]">
//                                 {loadingBtc ? (
//                                     <div className="text-gray-400">Loading…</div>
//                                 ) : (
//                                     <>
//                                         <div className="text-2xl font-bold">
//                                             ${btcPrice?.toLocaleString()}
//                                         </div>
//                                         <div className={`text-sm ${(btcChange ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                                             {btcChange! >= 0 ? '+' : ''}
//                                             {btcChange?.toFixed(2)}%
//                                         </div>
//                                     </>
//                                 )}
//                                 <div className="text-xs text-gray-400">
//                                     {isPastData(data) ? 'BTC (Current)' : 'BTC'}
//                                 </div>
//                             </div>

//                             {/* MARKET SENTIMENT */}
//                             <div className="bg-[#1a2332] rounded-lg p-4 text-center flex flex-col justify-center min-h-[120px]">
//                                 <div className="text-3xl">{marketEmoji}</div>
//                                 <div className={`${marketColor} font-bold text-sm`}>
//                                     {marketLabel}
//                                 </div>
//                                 <div className="text-xs text-gray-400">
//                                     {isPastData(data) ? 'HISTORICAL SENTIMENT' : 'MARKET SENTIMENT'}
//                                 </div>
//                             </div>

//                             {/* SENTIMENT GAUGE */}
//                             <div className={`${isMobile ? 'col-span-2' : ''} bg-[#1a2332] rounded-lg p-2 flex flex-col items-center justify-center`}>
//                                 <Gauge
//                                     value={avgSentiment}
//                                     min={0}
//                                     max={5}
//                                     size={isMobile ? 280 : 200}
//                                 />
//                             </div>
//                         </div>
//                     </section>

//                     {/* Bottom Section: News */}
//                     <section className={`${isMobile ? 'flex-col space-y-4' : 'flex gap-6'}`}>
//                         {/* Left Column - News Impact & Trending News */}
//                         <div className="flex-[2] space-y-6">
//                             {/* News Impact */}
//                             <div>
//                                 <div className="flex items-center space-x-2 mb-4">
//                                     <span className="text-lg">📢</span>
//                                     <h3 className="font-bold">
//                                         {isPastData(data) ? 'HISTORICAL NEWS IMPACT' : 'NEWS IMPACT'}
//                                     </h3>
//                                 </div>

//                                 <div className={`${isMobile ? 'grid grid-cols-1 gap-2 mb-4' : 'grid grid-cols-4 gap-4 mb-4 h-16'}`}>
//                                     {/* Main News Card */}
//                                     <div className="col-span-2 bg-[#1a2332] rounded-lg p-4 h-full flex items-center justify-between">
//                                         <TwoLineTitle>
//                                             {reportData.newsImpact[0].title.toUpperCase()}
//                                         </TwoLineTitle>
//                                         <span className={`text-3xl ${reportData.newsImpact[0].sentiment === 'bullish' ? 'text-green-400' : 'text-red-400'}`}>
//                                             {reportData.newsImpact[0].sentiment === 'bullish' ? '↗' : '↘'}
//                                         </span>
//                                     </div>

//                                     {/* Volatility & Liquidity Cards */}
//                                     <div className="bg-[#1a2332] rounded-lg p-4 text-center">
//                                         <div className="text-gray-300 text-xs mb-2">VOLATILITY</div>
//                                         <div className="text-white font-bold text-lg">{reportData.volatility.toUpperCase()}</div>
//                                     </div>

//                                     <div className="bg-[#1a2332] rounded-lg p-4 text-center">
//                                         <div className="text-gray-300 text-xs mb-2">LIQUIDITY</div>
//                                         <div className="text-white font-bold text-lg">{reportData.liquidity.toUpperCase()}</div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Trending News */}
//                             <section className="mt-10">
//                                 <div className="flex items-center space-x-2 my-4">
//                                     <span className="text-lg">🚀</span>
//                                     <h3 className="font-bold">
//                                         {isPastData(data) ? 'HISTORICAL NEWS' : 'TRENDING NEWS'}
//                                     </h3>
//                                 </div>

//                                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                                     {[
//                                         ...reportData.todaysNews.crypto,
//                                         ...reportData.todaysNews.macro
//                                     ].map(item => (
//                                         <NewsCard key={item.news_id} item={item} />
//                                     ))}
//                                 </div>
//                             </section>
//                         </div>

//                         {/* Right Column - What's New & Recommendations */}
//                         {(reportData.whatsNew.length > 0 || reportData.recommendations.length > 0) && (
//                             <div className="flex-1 space-y-6">
//                                 {/* WHAT'S NEW */}
//                                 {reportData.whatsNew.length > 0 && (
//                                     <div className="bg-[#1a2332] rounded-lg p-4">
//                                         <div className="flex items-center space-x-2 mb-4">
//                                             <span className="text-lg">⚙️</span>
//                                             <h3 className="font-bold">
//                                                 {isPastData(data) ? 'ARCHIVE INFO' : "WHAT'S NEW"}
//                                             </h3>
//                                         </div>
//                                         <ul className="space-y-2 text-sm mb-4">
//                                             {reportData.whatsNew.map((item, i) => (
//                                                 <li key={i} className="flex items-start space-x-2">
//                                                     <span className="text-green-400">•</span>
//                                                     <span>{item.text}</span>
//                                                 </li>
//                                             ))}
//                                         </ul>
//                                         <div className="flex justify-end">
//                                             <Image src="/images/tiger.png" alt="" width={40} height={40} />
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* RECOMMENDATIONS */}
//                                 {reportData.recommendations.length > 0 && (
//                                     <div className="space-y-4">
//                                         {reportData.recommendations.map((rec, i) => (
//                                             <div
//                                                 key={i}
//                                                 className={`bg-[#1a2332] rounded-lg p-4 border-l-4 ${rec.borderClass}`}
//                                             >
//                                                 <div className="flex items-center space-x-2 mb-2">
//                                                     <span className={`w-2 h-2 rounded-full ${rec.dotClass}`}></span>
//                                                     <span className={`font-bold ${rec.textClass}`}>{rec.label}</span>
//                                                 </div>
//                                                 <ul className="text-xs space-y-1">
//                                                     {rec.items.map((item, idx) => (
//                                                         <li key={idx}>
//                                                             {item.symbol} – TARGET: {item.target}
//                                                         </li>
//                                                     ))}
//                                                 </ul>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </section>
//                 </div>

//                 {/* Footer with Download PDF */}
//                 <footer className="p-4 border-t border-gray-700">
//                     <button
//                         className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
//                         onClick={async () => {
//                             try {
//                                 const html2canvas = (await import('html2canvas')).default;
//                                 const jsPDF = (await import('jspdf')).jsPDF;

//                                 const contentElement = document.querySelector('[data-pdf-content]') as HTMLElement;
//                                 if (!contentElement) {
//                                     alert('Content not found for PDF generation');
//                                     return;
//                                 }

//                                 const clone = contentElement.cloneNode(true) as HTMLElement;
//                                 const pdfContainer = document.createElement('div');
//                                 pdfContainer.style.position = 'absolute';
//                                 pdfContainer.style.left = '-9999px';
//                                 pdfContainer.style.top = '0';
//                                 pdfContainer.style.width = '794px';
//                                 pdfContainer.style.minHeight = '1123px';
//                                 pdfContainer.style.backgroundColor = '#0a1628';
//                                 pdfContainer.style.color = 'white';
//                                 pdfContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
//                                 pdfContainer.style.padding = '20px';
//                                 pdfContainer.style.boxSizing = 'border-box';

//                                 const existingLogo = document.querySelector('img[alt="logo"]') as HTMLImageElement;
//                                 const logoSrc = existingLogo?.src || '/images/tiger.svg';
//                                 const currentDate = getCurrentDate();

//                                 const header = document.createElement('div');
//                                 header.innerHTML = `
//                                     <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #374151; padding-bottom: 15px;">
//                                         <div style="display: flex; align-items: center;">
//                                             <img src="${logoSrc}" alt="logo" style="width: 32px; height: 32px; margin-right: 12px;" />
//                                             <h1 style="font-size: 18px; font-weight: bold; margin: 0;">ZkAGI Newsroom</h1>
//                                         </div>
//                                         <div style="text-align: right;">
//                                             <h2 style="font-size: 18px; font-weight: bold; margin: 0;">${getReportTitle()}</h2>
//                                             <p style="font-size: 12px; color: #9ca3af; margin: 0;">${currentDate}</p>
//                                         </div>
//                                     </div>
//                                 `;

//                                 clone.style.width = '100%';
//                                 clone.style.fontSize = '12px';
//                                 clone.style.lineHeight = '1.4';

//                                 pdfContainer.appendChild(header);
//                                 pdfContainer.appendChild(clone);
//                                 document.body.appendChild(pdfContainer);

//                                 await new Promise(resolve => setTimeout(resolve, 500));

//                                 const canvas = await html2canvas(pdfContainer, {
//                                     backgroundColor: '#0a1628',
//                                     scale: 1.5,
//                                     useCORS: true,
//                                     allowTaint: true,
//                                     width: 794,
//                                     height: Math.max(1123, pdfContainer.scrollHeight),
//                                     logging: false,
//                                 });

//                                 document.body.removeChild(pdfContainer);

//                                 const imgData = canvas.toDataURL('image/png');
//                                 const pdf = new jsPDF('p', 'mm', 'a4');
//                                 const imgWidth = 210;
//                                 const pageHeight = 297;
//                                 const imgHeight = (canvas.height * imgWidth) / canvas.width;
//                                 const finalHeight = Math.min(imgHeight, pageHeight);

//                                 pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, finalHeight);

//                                 const dateStr = isPastData(data) 
//                                     ? new Date(data.fetched_date).toISOString().split('T')[0]
//                                     : new Date().toISOString().split('T')[0];
//                                 const reportType = isPastData(data) ? 'Historical' : 'Daily';
//                                 pdf.save(`ZkAGI-${reportType}-Report-${dateStr}.pdf`);
//                             } catch (error) {
//                                 console.error('Error generating PDF:', error);
//                                 alert('Error generating PDF. Please try again.');
//                             }
//                         }}
//                     >
//                         Download PDF
//                     </button>
//                 </footer>
//             </div>
//         </>
//     );
// };

// export default ReportSidebar;