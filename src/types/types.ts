// export interface PredictionPoint {
//   label: string;    // “1D”, “3D”, “7D”, “SOL”
//   btc: number;
//   eth: number;
//   sol: number;
// }

// export interface PriceStat {
//   symbol: string;   // “BTC”, “SOL”…
//   value: string;    // “$95,007”
//   change?: string;  // “+0.02%”
//   sentiment?: 'bullish' | 'bearish';
// }

// export interface NewsItem {
//   title: string;
//   impact: 'bullish' | 'mixed' | 'bearish';
//   excerpt: string;
// }

// export interface WhatsNewItem {
//   text: string;
//   icon?: string;   // optional icon name or URL
// }

// export interface RecommendationSection {
//   label: string;
//   items: { symbol: string; target: string }[];
//   borderClass: string;
//   textClass: string;
//   dotClass: string;
// }

// export interface ReportData {
//   predictionAccuracy: number;                // 87
//   predictionSeries: PredictionPoint[];       // your chart
//   priceStats: PriceStat[];                   // BTC, SOL, etc.
//   marketSentiment: 'bullish' | 'bearish';
//   avoidTokens: string[];                     // e.g. ['DOGE']
//   newsImpact: { title: string; sentiment: string }[];
//   volatility: 'low' | 'moderate' | 'high';
//   liquidity: 'low' | 'moderate' | 'high';
//   trendingNews: NewsItem[];
//   whatsNew: WhatsNewItem[];
//   recommendations: RecommendationSection[];
// }


// // src/types/types.ts
// export interface CryptoNewsItem {
//   news_id: string;
//   title: string;
//   link: string;
//   sentimentScore: number;
//   symbol: string;
//   sentimentTag: 'bearish' | 'neutral' | 'bullish';
//   advice: 'Buy' | 'Hold' | 'Sell';
//   reason: string;
//   rationale: string;
// }

// export interface MacroNewsItem {
//   news_id: string;
//   title: string;
//   link: string;
//   sentimentScore: number;
//   sentimentTag: 'bearish' | 'neutral' | 'bullish';
//   advice: 'Buy' | 'Hold' | 'Sell';
//   reason: string;
//   rationale: string;
// }

// export interface ForecastPoint {
//   date: string;         // ISO date
//   signal: 'LONG' | 'SHORT';
//   entry: number;
//   stop_loss: number;
//   take_profit: number;
// }

// export interface PriceHistoryPoint {
//   date: string;         // ISO date
//   price: number;
// }

// export interface TodayNewsSection {
//   crypto: CryptoNewsItem[];
//   macro: MacroNewsItem[];
// }

// export interface FullReportData extends ReportData {
//   todaysNews: TodayNewsSection;
//   forecastNext3Days: ForecastPoint[];
//   priceHistoryLast7Days: PriceHistoryPoint[];
// }


// src/types/types.ts

export interface PredictionPoint {
  label: string;    // "1D", "3D", "7D", "SOL"
  btc: number;
  eth: number;
  sol: number;
}

export interface PriceStat {
  symbol: string;   // "BTC", "SOL"…
  value: string;    // "$95,007"
  change?: string;  // "+0.02%"
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

// ===== NEW TYPES TO MATCH YOUR JSON API RESPONSE =====

export interface CryptoNewsItem {
  news_id: string;
  title: string;
  link: string;
  analysis: string; // This contains the JSON analysis as a string
  // Parsed fields (you'll need to parse the analysis string):
  sentimentScore?: number;
  symbol?: string;
  sentimentTag?: 'bearish' | 'neutral' | 'bullish';
  advice?: 'Buy' | 'Hold' | 'Sell';
  reason?: string;
  rationale?: string;
}

export interface MacroNewsItem {
  news_id: string;
  title: string;
  link: string;
  description: string;
  analysis: string; // This contains the JSON analysis as a string
  // Parsed fields (you'll need to parse the analysis string):
  sentimentScore?: number;
  sentimentTag?: 'bearish' | 'neutral' | 'bullish';
  advice?: 'Buy' | 'Hold' | 'Sell';
  reason?: string;
  rationale?: string;
}

export interface ForecastPoint {
  date: string;         // ISO date like "2025-06-26T00:00:00+00:00"
  signal: 'LONG' | 'SHORT';
  entry: number;
  stop_loss: number;
  take_profit: number;
  created_at: string;   // ISO timestamp
  confidence_intervals: {
    50: [number, number];
    80: [number, number];
    90: [number, number];
  };
}

export interface PriceHistoryPoint {
  date: string;         // ISO date like "2025-06-18T00:00:00+00:00"
  price: number;
}

export interface TodayNewsSection {
  fetched_date: string;
  crypto_news: CryptoNewsItem[];
  macro_news: MacroNewsItem[];
}

// ===== MAIN API RESPONSE TYPE =====
export interface ApiResponse {
  todays_news: TodayNewsSection[];
  forecast_next_3_days: ForecastPoint[];
  price_history_last_7_days: PriceHistoryPoint[];
}

// ===== UPDATED FULL REPORT DATA =====
export interface FullReportData extends ReportData {
  // Keep your existing UI-focused properties
  todaysNews: {
    crypto: CryptoNewsItem[];
    macro: MacroNewsItem[];
  };
  
  // Add the raw API response properties with correct names
  todays_news?: TodayNewsSection[];
  forecast_next_3_days?: ForecastPoint[];
  price_history_last_7_days?: PriceHistoryPoint[];
  
  // Keep backward compatibility
  forecastNext3Days?: ForecastPoint[];
  priceHistoryLast7Days?: PriceHistoryPoint[];
}

// ===== UTILITY TYPES FOR CHART COMPONENTS =====
export interface ChartPriceData {
  date: string;
  price: number;
}

export interface ChartForecastData {
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
}

// ===== HELPER FUNCTION TYPES =====
export interface ParsedAnalysis {
  sentiment_score: number;
  investment: {
    advice: 'Buy' | 'Hold' | 'Sell';
    reason: string;
  };
  rationale: string;
}

// ===== UTILITY FUNCTIONS =====
export const parseNewsAnalysis = (analysisString: string): ParsedAnalysis | null => {
  try {
    // Extract JSON from the analysis string that contains JSON wrapped in text
    const jsonMatch = analysisString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Failed to parse news analysis:', error);
    return null;
  }
};

export const transformApiResponse = (apiData: ApiResponse): Partial<FullReportData> => {
  const todaysNews = apiData.todays_news?.[0];
  
  return {
    // Map API response to your existing structure
    price_history_last_7_days: apiData.price_history_last_7_days,
    forecast_next_3_days: apiData.forecast_next_3_days,
    
    // Also provide camelCase versions for backward compatibility
    priceHistoryLast7Days: apiData.price_history_last_7_days,
    forecastNext3Days: apiData.forecast_next_3_days,
    
    // Transform news data
    todaysNews: {
      crypto: todaysNews?.crypto_news?.map(item => ({
        ...item,
        ...parseNewsAnalysis(item.analysis),
      })) || [],
      macro: todaysNews?.macro_news?.map(item => ({
        ...item,
        ...parseNewsAnalysis(item.analysis),
      })) || [],
    },
  };
};