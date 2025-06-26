import { FC, useEffect, useRef, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
// import { ReportData } from '@/types/types';
import Image from 'next/image';
import { FullReportData } from '@/types/types';
import NewsCard from '@/component/ui/NewsCard';
import Gauge from '@/component/ui/Gauge';
import PriceChart from '@/component/ui/PriceChart';


interface ReportSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    data: FullReportData | null;
}

const ReportSidebar: FC<ReportSidebarProps> = ({ isOpen, onClose, data }) => {
    const panelRef = useRef<HTMLDivElement>(null);

    const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
    const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
}, []);

    const colorMap: Record<string, string> = {
        'border-green-500': '#10b981',
        'border-red-500': '#ef4444',
        'border-yellow-500': '#eab308',
    };

    const [btcPrice, setBtcPrice] = useState<number | null>(null);
    const [btcChange, setBtcChange] = useState<number | null>(null);
    const [loadingBtc, setLoadingBtc] = useState(true);


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


     // Early return if data is null
    if (!data || !data.todaysNews) {
        return (
            <>
                {/* overlay */}
                <div
                    className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${
                        isOpen ? 'opacity-100 z-40' : 'opacity-0 -z-10'
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
    
    // 2️⃣ Compute average sentiment
    const allScores = [
        ...(data.todaysNews.crypto || []),
        ...(data.todaysNews.macro || []),
    ]
        .map(n => n.sentimentScore)
        .filter((score): score is number => score !== undefined && score !== null);

    const avgSentiment = allScores.length > 0
        ? allScores.reduce((s, a) => s + a, 0) / allScores.length
        : 0;;

    const isBearish = avgSentiment <= 1.6;
    const isNeutral = avgSentiment > 1.6 && avgSentiment <= 3.2;
    const isBullish = avgSentiment > 3.2;

    // 3️⃣ Decide emoji + label
    const marketEmoji = isBearish
        ? '😢'
        : isNeutral
            ? '😐'
            : '🤩';

    const marketLabel = isBearish
        ? 'BEARISH'
        : isNeutral
            ? 'NEUTRAL'
            : 'BULLISH';

    // assign tailwind text-color class
    const marketColor = isBearish
        ? 'text-red-500'
        : isNeutral
            ? 'text-yellow-500'
            : 'text-green-500';

    // 4️⃣ Gauge color (red <3, green ≥3)
    const gaugeColor = isBearish ? '#ef4444' : '#10b981';

    const getCurrentDate = () => {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return now.toLocaleDateString('en-US', options).toUpperCase();
    };


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
    console.log('Price history data:', data.priceHistoryLast7Days);
    console.log('Forecast data:', data.forecastNext3Days);
    console.log('First price point:', data.priceHistoryLast7Days?.[0]);
    console.log('First forecast point:', data.forecastNext3Days?.[0]);
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
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <h2 className="text-lg font-bold">DAILY PREDICTION REPORT</h2>
                            <p className="text-sm text-gray-400">{getCurrentDate()}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <IoMdClose size={24} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-6" data-pdf-content>
                    {/* Top Section: Prediction Accuracy and 4 Cards Side by Side */}

                    <section className={`${isMobile ? 'flex-col space-y-4' : 'flex gap-6'}`}>
                        {/* Prediction Accuracy Chart - Left Side */}
                        <div className="flex-1 bg-[#1a2332] rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-gray-300">Prediction Accuracy</span>
                                <span className="text-green-400 font-bold">{data.predictionAccuracy}%</span>
                            </div>

                            {/* 🔥 New lightweight‐charts histogram */}
                            <PriceChart
                                priceHistory={data.priceHistoryLast7Days || []}
                                forecast={data.forecastNext3Days || []}
                            />
                        </div>

                        {/* 4 Cards - Right Side - FULL HEIGHT MATCH */}
                        <div className={`flex-1 ${isMobile ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-2 grid-rows-2 gap-4 h-full'}`}>

                            {/* ── BTC PRICE CARD ── */}
                            <div className="bg-[#1a2332] rounded-lg p-4 text-center flex flex-col justify-center min-h-[120px]">
                                {loadingBtc ? (
                                    <div className="text-gray-400">Loading…</div>
                                ) : (
                                    <>
                                        {/* Current price */}
                                        <div className="text-2xl font-bold">
                                            ${btcPrice?.toLocaleString()}
                                        </div>

                                        {/* 24 h % change */}
                                        <div
                                            className={`text-sm ${(btcChange ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                                                }`}
                                        >
                                            {btcChange! >= 0 ? '+' : ''}
                                            {btcChange?.toFixed(2)}%
                                        </div>
                                    </>
                                )}
                                <div className="text-xs text-gray-400">BTC</div>
                            </div>

                            {/* MARKET SENTIMENT */}
                            <div className="bg-[#1a2332] rounded-lg p-4 text-center flex flex-col justify-center min-h-[120px]">
                                {/* Emoji */}
                                <div className="text-3xl">{marketEmoji}</div>

                                {/* Label */}
                                <div className={`${marketColor} font-bold text-sm`}>
                                    {marketLabel}
                                </div>

                                {/* Sub-label */}
                                <div className="text-xs text-gray-400">MARKET SENTIMENT</div>
                            </div>

                            {/* FEAR / GREED GAUGE (spans both columns and both rows) */}
                            <div className="col-span-2 bg-[#1a2332] rounded-lg p-2 flex flex-col items-center justify-center">
                                <Gauge
                                    value={avgSentiment}
                                    min={0}
                                    max={5}
                                    size={280}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Bottom Section: 2 Columns */}
                    <section className= {`${isMobile ? 'flex-col space-y-4' : 'flex gap-6'}`}>
                        {/* Left Column - 2/3 width: News Impact & Trending News */}
                        <div className="flex-[2] space-y-6">
                            {/* News Impact */}
                            <div>
                                <div className="flex items-center space-x-2 mb-4">
                                    <span className="text-lg">📢</span>
                                    <h3 className="font-bold">NEWS IMPACT</h3>
                                </div>

                                <div className={`${isMobile ? 'grid grid-cols-1 gap-2 mb-4' : 'grid grid-cols-4 gap-4 mb-4 h-16'}`}>
                                    {/* SOL Surges Card - Takes 2 columns */}
                                    <div className="col-span-2 bg-[#1a2332] rounded-lg p-4 h-full flex items-center justify-between">
                                        <TwoLineTitle>
                                            {data.newsImpact[0].title.toUpperCase()}
                                        </TwoLineTitle>
                                        <span className={`text-3xl ${data.newsImpact[0].sentiment === 'bullish'
                                            ? 'text-green-400'
                                            : 'text-red-400'
                                            }`}>
                                            {data.newsImpact[0].sentiment === 'bullish' ? '↗' : '↘'}
                                        </span>
                                    </div>

                                    {/* Volatility Card */}
                                    <div className="bg-[#1a2332] rounded-lg p-4 text-center">
                                        <div className="text-gray-300 text-xs mb-2">VOLATILITY</div>
                                        <div className="text-white font-bold text-lg">{data.volatility.toUpperCase()}</div>
                                    </div>

                                    {/* Liquidity Card */}
                                    <div className="bg-[#1a2332] rounded-lg p-4 text-center">
                                        <div className="text-gray-300 text-xs mb-2">LIQUIDITY</div>
                                        <div className="text-white font-bold text-lg">{data.liquidity.toUpperCase()}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Trending News */}
                            <section className="mt-10">
                                <div className="flex items-center space-x-2 my-4">
                                    <span className="text-lg">🚀</span>
                                    <h3 className="font-bold">TRENDING NEWS</h3>
                                </div>

                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {[
                                        ...data.todaysNews.crypto,
                                        ...data.todaysNews.macro
                                    ].map(item => (
                                        <NewsCard key={item.news_id} item={item} />
                                    ))}
                                </div>
                            </section>


                        </div>

                        {/* Right Column - 1/3 width: What's New & Recommendations */}
                        {data.whatsNew.length > 0 && data.recommendations.length > 0 && (
                            <div className="flex-1 space-y-6">

                                {/* WHAT’S NEW */}
                                {data.whatsNew.length > 0 && (
                                    <div className="bg-[#1a2332] rounded-lg p-4">
                                        <div className="flex items-center space-x-2 mb-4">
                                            <span className="text-lg">⚙️</span>
                                            <h3 className="font-bold">WHAT&#39;S NEW</h3>
                                        </div>
                                        <ul className="space-y-2 text-sm mb-4">
                                            {data.whatsNew.map((item, i) => (
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


                                {/* Trading Recommendations */}
                                {/* RECOMMENDATIONS */}
                                {data.recommendations.length > 0 && (
                                    <div className="space-y-4">
                                        {data.recommendations.map((rec, i) => (
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

                <footer className="p-4 border-t border-gray-700">
                    <button
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                        onClick={async () => {
                            try {
                                // Dynamic import to avoid SSR issues
                                const html2canvas = (await import('html2canvas')).default;
                                const jsPDF = (await import('jspdf')).jsPDF;

                                // Find the actual content element
                                const contentElement = document.querySelector('[data-pdf-content]') as HTMLElement;
                                if (!contentElement) {
                                    alert('Content not found for PDF generation');
                                    return;
                                }

                                // Create a clone of the content for PDF processing
                                const clone = contentElement.cloneNode(true) as HTMLElement;

                                // Create a temporary container for PDF layout
                                const pdfContainer = document.createElement('div');
                                pdfContainer.style.position = 'absolute';
                                pdfContainer.style.left = '-9999px';
                                pdfContainer.style.top = '0';
                                pdfContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
                                pdfContainer.style.minHeight = '1123px'; // A4 height
                                pdfContainer.style.backgroundColor = '#0a1628';
                                pdfContainer.style.color = 'white';
                                pdfContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
                                pdfContainer.style.padding = '20px';
                                pdfContainer.style.boxSizing = 'border-box';

                                const existingLogo = document.querySelector('img[alt="logo"]') as HTMLImageElement;
                                const logoSrc = existingLogo?.src || '/images/tiger.svg';
                                const currentDate = getCurrentDate();

                                // Add header to PDF
                                const header = document.createElement('div');
                                header.innerHTML = `
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #374151; padding-bottom: 15px;">
                                        <div style="display: flex; align-items: center;">
                                            <img src="${logoSrc}" alt="logo" style="width: 32px; height: 32px; margin-right: 12px;" />
                                            <h1 style="font-size: 18px; font-weight: bold; margin: 0;">ZkAGI Newsroom</h1>
                                        </div>
                                        <div style="text-align: right;">
                                            <h2 style="font-size: 18px; font-weight: bold; margin: 0;">DAILY PREDICTION REPORT</h2>
                                            <p style="font-size: 12px; color: #9ca3af; margin: 0;">${currentDate}</p>
                                        </div>
                                    </div>
                                `;

                                // Clone and apply PDF-friendly styles to the content
                                clone.style.width = '100%';
                                clone.style.fontSize = '12px';
                                clone.style.lineHeight = '1.4';

                                // Apply styles to all child elements to ensure proper PDF rendering
                                const allElements = clone.querySelectorAll('*');
                                allElements.forEach((el) => {
                                    const element = el as HTMLElement;
                                    element.style.fontFamily = 'system-ui, -apple-system, sans-serif';
                                    element.style.printColorAdjust = 'exact';
                                    (element.style as any).webkitPrintColorAdjust = 'exact';

                                    // Fix any flex layouts for PDF
                                    if (element.style.display === 'flex' || element.classList.contains('flex')) {
                                        element.style.display = 'flex';
                                        element.style.flexWrap = 'wrap';
                                    }

                                    // Ensure background colors are preserved
                                    if (element.classList.contains('bg-[#1a2332]')) {
                                        element.style.backgroundColor = '#1a2332';
                                    }
                                    if (element.classList.contains('bg-[#0a1628]')) {
                                        element.style.backgroundColor = '#0a1628';
                                    }

                                    // Ensure text colors are preserved
                                    if (element.classList.contains('text-green-400')) {
                                        element.style.color = '#4ade80';
                                    }
                                    if (element.classList.contains('text-red-500')) {
                                        element.style.color = '#ef4444';
                                    }
                                    if (element.classList.contains('text-yellow-500')) {
                                        element.style.color = '#eab308';
                                    }
                                    if (element.classList.contains('text-gray-400')) {
                                        element.style.color = '#9ca3af';
                                    }
                                    if (element.classList.contains('text-white')) {
                                        element.style.color = 'white';
                                    }

                                    // Handle border colors
                                    if (element.classList.contains('border-green-500')) {
                                        element.style.borderColor = '#10b981';
                                    }
                                    if (element.classList.contains('border-red-500')) {
                                        element.style.borderColor = '#ef4444';
                                    }
                                    if (element.classList.contains('border-yellow-500')) {
                                        element.style.borderColor = '#eab308';
                                    }
                                });

                                // Remove scrollable areas for PDF
                                const scrollableElements = clone.querySelectorAll('.overflow-y-auto');
                                scrollableElements.forEach(el => {
                                    (el as HTMLElement).style.overflow = 'visible';
                                    (el as HTMLElement).style.maxHeight = 'none';
                                });

                                // Append header and content to PDF container
                                pdfContainer.appendChild(header);
                                pdfContainer.appendChild(clone);

                                document.body.appendChild(pdfContainer);

                                // Wait for rendering
                                await new Promise(resolve => setTimeout(resolve, 500));

                                // Create canvas from the PDF container
                                const canvas = await html2canvas(pdfContainer, {
                                    backgroundColor: '#0a1628',
                                    scale: 1.5,
                                    useCORS: true,
                                    allowTaint: true,
                                    width: 794,
                                    height: Math.max(1123, pdfContainer.scrollHeight),
                                    logging: false,
                                });

                                // Remove the temporary container
                                document.body.removeChild(pdfContainer);

                                // Create PDF
                                const imgData = canvas.toDataURL('image/png');
                                const pdf = new jsPDF('p', 'mm', 'a4');

                                const imgWidth = 210; // A4 width in mm
                                const pageHeight = 297; // A4 height in mm
                                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                                // Only add content that fits on one page
                                const finalHeight = Math.min(imgHeight, pageHeight);

                                // Add only the first page content, crop anything that overflows
                                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, finalHeight);

                                // Download the PDF
                                const today = new Date().toISOString().split('T')[0];
                                pdf.save(`ZkAGI-Daily-Report-${today}.pdf`);
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

