// import React, { useState, useEffect } from 'react';
// import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// interface PastNewsItem {
//   news_id: string;
//   title: string;
//   link: string;
//   analysis: string;
//   sentimentScore?: number;
//   sentimentTag?: 'bearish' | 'neutral' | 'bullish';
//   advice?: 'Buy' | 'Hold' | 'Sell';
//   reason?: string;
//   rationale?: string;
// }

// interface PastCryptoNews extends PastNewsItem {}

// interface PastMacroNews extends PastNewsItem {
//   description?: string;
// }

// interface PastPredictionData {
//   fetched_date: string;
//   crypto_news: PastCryptoNews[];
//   macro_news: PastMacroNews[];
// }

// interface PastPredictionsResponse {
//   past_news: PastPredictionData[];
//   price_history_last_7_days: Array<{
//     date: string;
//     price: number;
//   }>;
//   latest_forecast: any[];
// }

// interface PredictionCardProps {
//   data: PastPredictionData;
//   onViewReport: (data: PastPredictionData) => void; // Updated to pass original data
// }

// const PredictionCard: React.FC<PredictionCardProps> = ({ data, onViewReport }) => {
//   // Calculate sentiment summary
//   const allNews = [...data.crypto_news, ...data.macro_news];
//   const sentimentScores = allNews
//     .map(item => item.sentimentScore)
//     .filter((score): score is number => score !== undefined && score !== null);
  
//   const avgSentiment = sentimentScores.length > 0 
//     ? sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length 
//     : 0;

//   const getSentimentInfo = (score: number) => {
//     if (score <= 1.6) return { label: 'BEARISH', color: 'text-red-500', icon: TrendingDown, bgColor: 'bg-red-500/10' };
//     if (score <= 3.2) return { label: 'NEUTRAL', color: 'text-yellow-500', icon: Minus, bgColor: 'bg-yellow-500/10' };
//     return { label: 'BULLISH', color: 'text-green-500', icon: TrendingUp, bgColor: 'bg-green-500/10' };
//   };

//   const sentimentInfo = getSentimentInfo(avgSentiment);
//   const IconComponent = sentimentInfo.icon;

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   return (
//     <div 
//       className="bg-[#1a2332] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer hover:bg-[#1e2636]"
//       onClick={() => onViewReport(data)} // Pass the original data directly
//     >
//       {/* Header with date */}
//       <div className="flex items-center justify-between mb-3">
//         <div className="flex items-center space-x-2">
//           <Calendar className="w-4 h-4 text-gray-400" />
//           <span className="text-sm text-gray-300">{formatDate(data.fetched_date)}</span>
//         </div>
//         <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${sentimentInfo.bgColor}`}>
//           <IconComponent className={`w-3 h-3 ${sentimentInfo.color}`} />
//           <span className={`text-xs font-medium ${sentimentInfo.color}`}>
//             {sentimentInfo.label}
//           </span>
//         </div>
//       </div>

//       {/* News summary */}
//       <div className="space-y-2">
//         <div className="flex justify-between text-sm">
//           <span className="text-gray-400">Crypto News:</span>
//           <span className="text-white">{data.crypto_news.length}</span>
//         </div>
//         <div className="flex justify-between text-sm">
//           <span className="text-gray-400">Macro News:</span>
//           <span className="text-white">{data.macro_news.length}</span>
//         </div>
//       </div>

//       {/* Top news preview */}
//       {allNews.length > 0 && (
//         <div className="mt-3 pt-3 border-t border-gray-700">
//           <p className="text-xs text-gray-400 mb-1">Top Story:</p>
//           <p className="text-sm text-white line-clamp-2 leading-tight">
//             {allNews[0].title}
//           </p>
//         </div>
//       )}

//       {/* Sentiment score */}
//       <div className="mt-3 pt-3 border-t border-gray-700">
//         <div className="flex justify-between items-center">
//           <span className="text-xs text-gray-400">Avg Sentiment:</span>
//           <span className={`text-sm font-medium ${sentimentInfo.color}`}>
//             {avgSentiment.toFixed(1)}/5.0
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// interface PastPredictionsProps {
//   onViewReport: (data: PastPredictionData) => void; // Updated to accept PastPredictionData
//   isMobile?: boolean;
// }

// const PastPredictions: React.FC<PastPredictionsProps> = ({ onViewReport, isMobile = false }) => {
//   const [pastData, setPastData] = useState<PastPredictionData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchPastPredictions = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch('http://103.231.86.182:8006/past', {
//           method: 'GET',
//           headers: {
//             'accept': 'application/json'
//           }
//         });

//         if (!response.ok) {
//           throw new Error(`Failed to fetch past predictions: ${response.statusText}`);
//         }

//         const data: PastPredictionsResponse = await response.json();
        
//         // Process the data to add sentiment analysis to each news item
//         const processedData = data.past_news.map(dayData => ({
//           ...dayData,
//           crypto_news: dayData.crypto_news.map(item => processNewsItem(item)),
//           macro_news: dayData.macro_news.map(item => processNewsItem(item))
//         }));

//         // Sort by date (most recent first)
//         processedData.sort((a, b) => new Date(b.fetched_date).getTime() - new Date(a.fetched_date).getTime());

//         setPastData(processedData);
//       } catch (err) {
//         console.error('Error fetching past predictions:', err);
//         setError(err instanceof Error ? err.message : 'Failed to fetch data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPastPredictions();
//   }, []);

//   const processNewsItem = (item: any) => {
//     // Extract sentiment data from the analysis field
//     const match = item.analysis?.match(/```json\s*([\s\S]*?)```/);
//     let parsed: any = {};

//     if (match) {
//       try {
//         parsed = JSON.parse(match[1]);
//       } catch (e) {
//         console.warn('Failed to parse analysis JSON for item:', item.news_id);
//       }
//     }

//     const normalizeSentiment = (score: number): 'bearish' | 'neutral' | 'bullish' => {
//       if (score <= 1.6) return 'bearish';
//       if (score <= 3.3) return 'neutral';
//       return 'bullish';
//     };

//     return {
//       ...item,
//       sentimentScore: parsed.sentiment_score || 2.5,
//       sentimentTag: parsed.sentiment_score ? normalizeSentiment(parsed.sentiment_score) : 'neutral',
//       advice: parsed.investment?.advice || 'Hold',
//       reason: parsed.investment?.reason || '',
//       rationale: parsed.rationale || ''
//     };
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-8">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
//         <span className="ml-2 text-gray-300">Loading past predictions...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-center">
//         <p className="text-red-400">Error loading past predictions</p>
//         <p className="text-sm text-gray-400 mt-1">{error}</p>
//         <button 
//           onClick={() => window.location.reload()}
//           className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   if (pastData.length === 0) {
//     return (
//       <div className="bg-gray-800/50 rounded-lg p-8 text-center">
//         <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//         <p className="text-gray-400 mb-2">No past predictions available</p>
//         <p className="text-sm text-gray-500">Check back later for historical reports</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center space-x-2 mb-4">
//         <Calendar className="w-5 h-5 text-blue-400" />
//         <h3 className="text-lg font-bold text-white">Past Prediction Reports</h3>
//         <span className="text-sm text-gray-400">({pastData.length} reports)</span>
//       </div>
      
//       <div className={`
//         ${isMobile 
//           ? 'grid grid-cols-1 gap-3' 
//           : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
//         }
//       `}>
//         {pastData.map((dayData, index) => (
//           <PredictionCard
//             key={`${dayData.fetched_date}-${index}`}
//             data={dayData}
//             onViewReport={onViewReport}
//           />
//         ))}
//       </div>
      
//       {pastData.length > 0 && (
//         <div className="text-center mt-6 p-4 bg-gray-800/30 rounded-lg">
//           <p className="text-sm text-gray-400">
//             Showing {pastData.length} past prediction reports
//           </p>
//           <p className="text-xs text-gray-500 mt-1">
//             Click on any card to view the detailed report
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PastPredictions;

import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PastNewsItem {
  news_id: string;
  title: string;
  link: string;
  analysis: string;
  sentimentScore?: number;
  sentimentTag?: 'bearish' | 'neutral' | 'bullish';
  advice?: 'Buy' | 'Hold' | 'Sell';
  reason?: string;
  rationale?: string;
}

interface PastCryptoNews extends PastNewsItem {}

interface PastMacroNews extends PastNewsItem {
  description?: string;
}

interface PastPredictionData {
  fetched_date: string;
  crypto_news: PastCryptoNews[];
  macro_news: PastMacroNews[];
}

interface PastPredictionsResponse {
  past_news: PastPredictionData[];
  price_history_last_7_days: Array<{
    date: string;
    price: number;
  }>;
  latest_forecast: any[];
}

interface PredictionCardProps {
  data: PastPredictionData;
  onViewReport: (data: PastPredictionData) => void;
  isMobile?: boolean;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ data, onViewReport, isMobile = false }) => {
  // Calculate sentiment summary
  const allNews = [...data.crypto_news, ...data.macro_news];
  const sentimentScores = allNews
    .map(item => item.sentimentScore)
    .filter((score): score is number => score !== undefined && score !== null);
  
  const avgSentiment = sentimentScores.length > 0 
    ? sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length 
    : 0;

  const getSentimentInfo = (score: number) => {
    if (score <= 1.6) return { label: 'BEARISH', color: 'text-red-500', icon: TrendingDown, bgColor: 'bg-red-500/10' };
    if (score <= 3.2) return { label: 'NEUTRAL', color: 'text-yellow-500', icon: Minus, bgColor: 'bg-yellow-500/10' };
    return { label: 'BULLISH', color: 'text-green-500', icon: TrendingUp, bgColor: 'bg-green-500/10' };
  };

  const sentimentInfo = getSentimentInfo(avgSentiment);
  const IconComponent = sentimentInfo.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className={`bg-[#1a2332] rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer hover:bg-[#1e2636] ${isMobile ? '' : 'text-sm'}`}
      onClick={() => onViewReport(data)}
    >
      {/* Header with date */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Calendar className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'} text-gray-400`} />
          <span className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-300`}>{formatDate(data.fetched_date)}</span>
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${sentimentInfo.bgColor}`}>
          <IconComponent className={`${isMobile ? 'w-3 h-3' : 'w-2 h-2'} ${sentimentInfo.color}`} />
          <span className={`${isMobile ? 'text-xs' : 'text-[10px]'} font-medium ${sentimentInfo.color}`}>
            {sentimentInfo.label}
          </span>
        </div>
      </div>

      {/* News summary */}
      <div className="space-y-1">
        <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-xs'}`}>
          <span className="text-gray-400">Crypto:</span>
          <span className="text-white">{data.crypto_news.length}</span>
        </div>
        <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-xs'}`}>
          <span className="text-gray-400">Macro:</span>
          <span className="text-white">{data.macro_news.length}</span>
        </div>
      </div>

      {/* Top news preview */}
      {allNews.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <p className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-gray-400 mb-1`}>Top Story:</p>
          <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-white line-clamp-2 leading-tight`}>
            {allNews[0]?.title || 'No news available'}
          </p>
        </div>
      )}

      {/* Sentiment score */}
      <div className="mt-2 pt-2 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-gray-400`}>Sentiment:</span>
          <span className={`${isMobile ? 'text-sm' : 'text-xs'} font-medium ${sentimentInfo.color}`}>
            {avgSentiment.toFixed(1)}/5
          </span>
        </div>
      </div>
    </div>
  );
};

interface PastPredictionsProps {
  onViewReport: (data: PastPredictionData) => void;
  isMobile?: boolean;
}

const PastPredictions: React.FC<PastPredictionsProps> = ({ onViewReport, isMobile = false }) => {
  const [pastData, setPastData] = useState<PastPredictionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPastPredictions = async () => {
      try {
        setLoading(true);

        if (!NEXT_PUBLIC_PAST_PREDICTION_API) {
          throw new Error('API URL not configured');
        }
        
        const response = await fetch(NEXT_PUBLIC_PAST_PREDICTION_API, {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch past predictions: ${response.statusText}`);
        }

        const data: PastPredictionsResponse = await response.json();
        
        // Process the data to add sentiment analysis to each news item
        const processedData = data.past_news.map(dayData => ({
          ...dayData,
          crypto_news: dayData.crypto_news.map(item => processNewsItem(item)),
          macro_news: dayData.macro_news.map(item => processNewsItem(item))
        }));

        // Sort by date (most recent first)
        processedData.sort((a, b) => new Date(b.fetched_date).getTime() - new Date(a.fetched_date).getTime());

        setPastData(processedData);
      } catch (err) {
        console.error('Error fetching past predictions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchPastPredictions();
  }, []);

  const processNewsItem = (item: any) => {
    // Extract sentiment data from the analysis field
    const match = item.analysis?.match(/```json\s*([\s\S]*?)```/);
    let parsed: any = {};

    if (match) {
      try {
        parsed = JSON.parse(match[1]);
      } catch (e) {
        console.warn('Failed to parse analysis JSON for item:', item.news_id);
      }
    }

    const normalizeSentiment = (score: number): 'bearish' | 'neutral' | 'bullish' => {
      if (score <= 1.6) return 'bearish';
      if (score <= 3.3) return 'neutral';
      return 'bullish';
    };

    return {
      ...item,
      sentimentScore: parsed.sentiment_score || 2.5,
      sentimentTag: parsed.sentiment_score ? normalizeSentiment(parsed.sentiment_score) : 'neutral',
      advice: parsed.investment?.advice || 'Hold',
      reason: parsed.investment?.reason || '',
      rationale: parsed.rationale || ''
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span className="ml-2 text-gray-300">Loading past predictions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-center">
        <p className="text-red-400">Error loading past predictions</p>
        <p className="text-sm text-gray-400 mt-1">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (pastData.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400 mb-2">No past predictions available</p>
        <p className="text-sm text-gray-500">Check back later for historical reports</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!isMobile && (
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Historical Reports</h3>
          <span className="text-xs text-gray-400">({pastData.length})</span>
        </div>
      )}
      
      {isMobile && (
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Past Prediction Reports</h3>
          <span className="text-sm text-gray-400">({pastData.length} reports)</span>
        </div>
      )}
      
      <div className={`
        ${isMobile 
          ? 'grid grid-cols-1 gap-3' 
          : 'space-y-2'
        }
      `}>
        {pastData.map((dayData, index) => (
          <PredictionCard
            key={`${dayData.fetched_date}-${index}`}
            data={dayData}
            onViewReport={onViewReport}
            isMobile={isMobile}
          />
        ))}
      </div>
      
      {pastData.length > 0 && (
        <div className={`text-center mt-4 p-3 bg-gray-800/30 rounded-lg ${isMobile ? '' : 'text-xs'}`}>
          <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-400`}>
            {isMobile ? `Showing ${pastData.length} past prediction reports` : `${pastData.length} reports available`}
          </p>
          {isMobile && (
            <p className="text-xs text-gray-500 mt-1">
              Click on any card to view the detailed report
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PastPredictions;