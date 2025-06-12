import { FC, useEffect, useRef } from 'react';
import { IoMdClose } from 'react-icons/io';
import { ReportData } from '@/types/types';
import Image from 'next/image';

interface ReportSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    data: ReportData;
}

const ReportSidebar: FC<ReportSidebarProps> = ({ isOpen, onClose, data }) => {
    const panelRef = useRef<HTMLDivElement>(null);

    const colorMap: Record<string, string> = {
        'border-green-500': '#10b981',
        'border-red-500': '#ef4444',
        'border-yellow-500': '#eab308',
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
                    fixed inset-y-0 right-0 w-3/5 bg-[#0a1628] 
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
                            <p className="text-sm text-gray-400">JUNE 11, 2025</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <IoMdClose size={24} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-6" data-pdf-content>
                    {/* Top Section: Prediction Accuracy and 4 Cards Side by Side */}
                    <section className="flex gap-6">
                        {/* Prediction Accuracy Chart - Left Side */}
                        <div className="flex-1 bg-[#1a2332] rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-gray-300">Prediction Accuracy</span>
                                <span className="text-green-400 font-bold">{data.predictionAccuracy}%</span>
                            </div>

                            {/* Chart area */}
                            <div className="h-32 relative mb-4">
                                <div className="absolute inset-0 flex items-end justify-between px-2">
                                    {data.predictionSeries.map((point, i) => (
                                        <div key={i} className={`w-1 ${i >= data.predictionSeries.length - 2 ? 'bg-green-500' : 'bg-gray-600'} h-${8 + i * 4}`}></div>
                                    ))}
                                </div>
                            </div>

                            {/* Chart labels */}
                            <div className="flex justify-between text-xs text-gray-400">
                                {data.predictionSeries.map((point, i) => (
                                    <span key={i}>{point.label}</span>
                                ))}
                            </div>

                            {/* Deviation info */}
                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                                <span>Deviation</span>
                                <span>BTC +2.7%</span>
                                <span>ETH +3.1%</span>
                                <span>SOL +4.2%</span>
                            </div>
                        </div>

                        {/* 4 Cards - Right Side */}
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            {/* Price Stats Cards - Top Row */}
                            {data.priceStats.map((stat, i) => (
                                <div key={i} className="bg-[#1a2332] rounded-lg p-4 text-center">
                                    {stat.symbol === 'BTC' ? (
                                        <>
                                            <div className="text-2xl font-bold">{stat.value}</div>
                                            <div className="text-green-400 text-sm">{stat.change}</div>
                                            <div className="text-xs text-gray-400">{stat.symbol}</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-2xl font-bold">{stat.symbol}</div>
                                            <div className="text-green-400 text-sm">{stat.value}</div>
                                            <div className="text-xs text-gray-400">{stat.sentiment?.toUpperCase()}</div>
                                        </>
                                    )}
                                </div>
                            ))}

                            {/* Market Sentiment Card - Bottom Left */}
                            <div className="bg-[#1a2332] rounded-lg p-4 text-center">
                                <div className={`w-12 h-12  rounded-full flex items-center justify-center mx-auto `}>
                                    <span className="text-3xl">
                                        {data.marketSentiment === 'bearish' ? '😢' : '🤩'}
                                    </span>
                                </div>
                                <div className={`${data.marketSentiment === 'bearish' ? 'text-yellow-500' : 'text-green-500'} font-bold text-sm`}>
                                    {data.marketSentiment.toUpperCase()}
                                </div>
                                <div className="text-xs text-gray-400">MARKET SENTIMENT</div>
                            </div>

                            {/* Avoid Tokens Card - Bottom Right */}
                            <div className="bg-[#1a2332] rounded-lg p-4 text-center">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto ">
                                    <span className="text-white text-3xl">🛑</span>
                                </div>
                                <div className="text-red-500 font-bold text-sm">AVOID</div>
                                <div className="text-xs text-gray-400">{data.avoidTokens.join(', ')}</div>
                            </div>
                        </div>
                    </section>

                    {/* Bottom Section: 2 Columns */}
                    <section className="flex gap-6">
                        {/* Left Column - 2/3 width: News Impact & Trending News */}
                        <div className="flex-[2] space-y-6">
                            {/* News Impact */}
                            <div>
                                <div className="flex items-center space-x-2 mb-4">
                                    <span className="text-lg">📢</span>
                                    <h3 className="font-bold">NEWS IMPACT</h3>
                                </div>

                                <div className="grid grid-cols-4 gap-4 mb-4 h-16">
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
                            <div>
                                <div className="flex items-center space-x-2 mb-4">
                                    <span className="text-lg">🚀</span>
                                    <h3 className="font-bold">TRENDING NEWS</h3>
                                </div>

                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {data.trendingNews.map((news, i) => (
                                        <div key={i} className="bg-[#1a2332] rounded-lg p-4">
                                            <h4 className="font-bold text-sm mb-2">{news.title.toUpperCase()}</h4>
                                            <p className="text-xs text-gray-400 mb-2">{news.excerpt.toUpperCase()}</p>
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${news.impact === 'bullish' ? 'bg-green-500 text-black' :
                                                news.impact === 'mixed' ? 'bg-blue-500 text-white' :
                                                    news.impact === 'bearish' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
                                                }`}>
                                                {news.impact.toUpperCase()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - 1/3 width: What's New & Recommendations */}
                        <div className="flex-1 space-y-6">
                            {/* What's New */}
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
                                    <Image
                                        src="/images/tiger.png"
                                        alt="Attach file"
                                        width={40}
                                        height={40}
                                    />
                                </div>
                            </div>

                            {/* Trading Recommendations */}
                            <div className="space-y-4">
                                {data.recommendations.map((rec, i) => (
                                    <div
                                        key={i}
                                        className={`bg-[#1a2332] rounded-lg p-4 border-l-4 ${rec.borderClass}`}
                                    >
                                        <div className="flex items-center space-x-2 mb-2">
                                            {/* colored bullet */}
                                            <span className={`w-2 h-2 rounded-full ${rec.dotClass}`}></span>
                                            {/* heading */}
                                            <span className={`font-bold ${rec.textClass}`}>
                                                {rec.label}
                                            </span>
                                        </div>
                                        {/* list of targets */}
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
                        </div>
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

                                // Add header to PDF
                                const header = document.createElement('div');
                                header.innerHTML = `
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #374151; padding-bottom: 15px;">
                                        <div style="display: flex; align-items: center;">
                                            <div style="width: 32px; height: 32px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                                <span style="color: black; font-weight: bold; font-size: 14px;">🐅</span>
                                            </div>
                                            <h1 style="font-size: 18px; font-weight: bold; margin: 0;">ZkAGI Newsroom</h1>
                                        </div>
                                        <div style="text-align: right;">
                                            <h2 style="font-size: 18px; font-weight: bold; margin: 0;">DAILY PREDICTION REPORT</h2>
                                            <p style="font-size: 12px; color: #9ca3af; margin: 0;">JUNE 11, 2025</p>
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