import { useState } from 'react';
import { Search, ArrowUp, Menu, Share } from 'lucide-react';

interface NewsItem {
    title: string;
    timeAgo: string;
    source: string;
    icons?: string[];
}

const DUMMY_NEWS: NewsItem[] = [
    {
        title: 'VCs invest $3m in crypto startups to top up 2025 funding bonanza',
        timeAgo: '32m',
        source: 'DL News',
        icons: ['🟠', '🔵', '⚪']
    },
    {
        title: 'ARK Invest Loaded Up $373M Worth of Circle Shares on First Day of Trading',
        timeAgo: '1h',
        source: 'CoinDesk',
        icons: ['🔵']
    },
    {
        title: 'Crypto market sees nearly $1B in daily liquidations as overleveraged longs are caught...',
        timeAgo: '1h',
        source: 'The Block',
        icons: ['🟠', '⚪']
    },
    {
        title: 'Tigran Gambaryan, Binance Exec Who Was Detained in Nigeria for Nearly a Year, Departs...',
        timeAgo: '1h',
        source: 'CoinDesk'
    },
    {
        title: 'XRP Price Whipsaws in Volatile Trading Session Amid Broader Market Slide',
        timeAgo: '2h',
        source: 'CoinDesk',
        icons: ['🔵', '❌']
    },
    {
        title: 'Tigran Gambaryan, Binance Exec Who Was Detained in Nigeria for Nearly a Year, Departs...',
        timeAgo: '1h',
        source: 'CoinDesk'
    },
    {
        title: 'XRP Price Whipsaws in Volatile Trading Session Amid Broader Market Slide',
        timeAgo: '2h',
        source: 'CoinDesk',
        icons: ['🔵', '❌']
    },

];

export default function NewsSidebar() {
    const [activeTab, setActiveTab] = useState<'Limited' | 'All'>('Limited');

    const newsToDisplay = activeTab === 'Limited' ? DUMMY_NEWS.slice(0, 6) : DUMMY_NEWS;

    return (
        <div className="w-full h-full bg-slate-900 text-white flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div className="flex items-center space-x-2">
                    <h1 className="text-lg font-semibold text-white">News</h1>
                    <Share className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex items-center space-x-2">
                    <Search className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
                    {/* <ArrowUp className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
                    <Menu className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
                    <Share className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" /> */}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex px-4 py-3">
                <button
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'Limited'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    onClick={() => setActiveTab('Limited')}
                >
                    Limited
                </button>
                <button
                    className={`ml-3 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'All'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    onClick={() => setActiveTab('All')}
                >
                    All
                </button>
            </div>

            {/* News List */}
            <div className="flex-1 overflow-y-auto">
                {newsToDisplay.map((item, idx) => (
                    <div
                        key={idx}
                        className="px-4 py-4 border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1 pr-3">
                                <h3 className="text-white font-medium leading-5 mb-2 text-sm">
                                    {item.title}
                                </h3>
                                <div className="flex items-center text-xs text-slate-400">
                                    <span>{item.timeAgo}</span>
                                    <span className="mx-1">•</span>
                                    <span>{item.source}</span>
                                </div>
                            </div>
                            {item.icons && (
                                <div className="flex items-center space-x-1 ml-2">
                                    {item.icons.map((icon, iconIdx) => (
                                        <div
                                            key={iconIdx}
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                                            style={{
                                                background: icon === '🟠' ? '#f97316' :
                                                    icon === '🔵' ? '#3b82f6' :
                                                        icon === '⚪' ? '#64748b' :
                                                            icon === '🟣' ? '#8b5cf6' :
                                                                icon === '❌' ? '#ef4444' : '#64748b'
                                            }}
                                        >
                                            {icon === '🟠' && '₿'}
                                            {icon === '🔵' && 'C'}
                                            {icon === '⚪' && 'E'}
                                            {icon === '🟣' && '≡'}
                                            {icon === '❌' && '×'}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}