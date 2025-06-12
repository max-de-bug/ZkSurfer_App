export interface PredictionPoint {
    label: string;    // “1D”, “3D”, “7D”, “SOL”
    btc: number;
    eth: number;
    sol: number;
}

export interface PriceStat {
    symbol: string;   // “BTC”, “SOL”…
    value: string;    // “$95,007”
    change?: string;  // “+0.02%”
    sentiment?: 'bullish' | 'bearish';
}

export interface NewsItem {
    title: string;
    impact: 'bullish' | 'mixed' | 'bearish';
    excerpt: string;
}

export interface WhatsNewItem {
    text: string;
    icon?: string;   // optional icon name or URL
}

export interface RecommendationSection {
    label: string;
    items: { symbol: string; target: string }[];
    borderClass: string;
    textClass: string;
    dotClass: string;
}

export interface ReportData {
    predictionAccuracy: number;                // 87
    predictionSeries: PredictionPoint[];       // your chart
    priceStats: PriceStat[];                   // BTC, SOL, etc.
    marketSentiment: 'bullish' | 'bearish';
    avoidTokens: string[];                     // e.g. ['DOGE']
    newsImpact: { title: string; sentiment: string }[];
    volatility: 'low' | 'moderate' | 'high';
    liquidity: 'low' | 'moderate' | 'high';
    trendingNews: NewsItem[];
    whatsNew: WhatsNewItem[];
    recommendations: RecommendationSection[];
}
