// import React, { useState } from 'react';

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

// interface PnLData {
//   pnl: number;
//   pnlPercentage: number;
//   status: 'pending' | 'calculated';
//   predictedPrice?: number;
//   actualPrice?: number;
// }

// interface HourlyPredictionsTableProps {
//   hourlyForecast: HourlyForecast[];
//   className?: string;
// }

// const HourlyPredictionsTable: React.FC<HourlyPredictionsTableProps> = ({
//   hourlyForecast = [],
//   className = ""
// }) => {
//   const [isExpanded, setIsExpanded] = useState(false);

//   // Function to extract time from UTC timestamp
//   const formatTime = (utcTime: string) => {
//     const date = new Date(utcTime);
//     return date.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: false,
//       timeZone: 'UTC'
//     });
//   };

//   // Function to calculate PnL
//   const calculatePnL = (currentIndex: number): PnLData => {
//     if (currentIndex >= hourlyForecast.length - 1) {
//       return {
//         pnl: 0,
//         pnlPercentage: 0,
//         status: 'pending' as const,
//         predictedPrice: undefined,
//         actualPrice: undefined
//       };
//     }

//     const currentForecast = hourlyForecast[currentIndex];
//     const nextActual = hourlyForecast[currentIndex + 1];

//     if (!currentForecast || !nextActual) {
//       return {
//         pnl: 0,
//         pnlPercentage: 0,
//         status: 'pending' as const,
//         predictedPrice: undefined,
//         actualPrice: undefined
//       };
//     }

//     // PnL = Actual price (next hour) - Predicted price (current hour)
//     const pnl = nextActual.current_price - currentForecast.forecast_price;
//     const pnlPercentage = (pnl / currentForecast.forecast_price) * 100;

//     return {
//       pnl,
//       pnlPercentage,
//       status: 'calculated' as const,
//       predictedPrice: currentForecast.forecast_price,
//       actualPrice: nextActual.current_price
//     };
//   };

//   // Function to get signal color and icon
//   const getSignalDisplay = (signal: string) => {
//     switch (signal) {
//       case 'LONG':
//         return {
//           color: 'text-green-400',
//           bgColor: 'bg-green-400/20',
//           icon: '↗',
//           text: 'LONG'
//         };
//       case 'SHORT':
//         return {
//           color: 'text-red-400',
//           bgColor: 'bg-red-400/20',
//           icon: '↘',
//           text: 'SHORT'
//         };
//       case 'HOLD':
//         return {
//           color: 'text-yellow-400',
//           bgColor: 'bg-yellow-400/20',
//           icon: '→',
//           text: 'HOLD'
//         };
//       default:
//         return {
//           color: 'text-gray-400',
//           bgColor: 'bg-gray-400/20',
//           icon: '?',
//           text: 'N/A'
//         };
//     }
//   };

//   // Function to get PnL color
//   const getPnLColor = (pnlPercentage: number) => {
//     if (pnlPercentage > 0) return 'text-green-400';
//     if (pnlPercentage < 0) return 'text-red-400';
//     return 'text-gray-400';
//   };

//   // Compact table for the sidebar
//   const CompactTable = () => (
//     <div className="h-80 overflow-y-auto">
//       <div className="space-y-2">
//         {[...hourlyForecast].reverse().map((forecast, reverseIndex) => {
//           // Calculate original index for PnL calculation
//           const originalIndex = hourlyForecast.length - 1 - reverseIndex;
//           const signalDisplay = getSignalDisplay(forecast.signal);
//           const pnlData = calculatePnL(originalIndex);

//           return (
//             <div key={forecast.time} className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
//               <div className="flex items-center space-x-3">
//                 <div className="font-mono text-sm text-white font-medium min-w-[45px]">
//                   {formatTime(forecast.time)}
//                 </div>
//                 <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${signalDisplay.bgColor} ${signalDisplay.color} min-w-[55px] justify-center`}>
//                   <span>{signalDisplay.icon}</span>
//                   <span>{signalDisplay.text}</span>
//                 </div>
//               </div>

//               <div className="text-right">
//                 <div className="font-mono text-sm text-white">
//                   ${forecast.forecast_price.toLocaleString(undefined, {
//                     minimumFractionDigits: 0,
//                     maximumFractionDigits: 0
//                   })}
//                 </div>
//                 {pnlData.status === 'calculated' && pnlData.actualPrice ? (
//                   <div className={`font-mono text-xs font-medium ${getPnLColor(pnlData.pnlPercentage)}`}>
//                     {pnlData.pnlPercentage >= 0 ? '+' : ''}
//                     {pnlData.pnlPercentage.toFixed(2)}%
//                   </div>
//                 ) : (
//                   <div className="text-gray-400 text-xs">Pending</div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );

//   // Full table for the popup
//   const FullTable = () => (
//     <div className="overflow-x-auto">
//       <table className="w-full text-sm">
//         <thead>
//           <tr className="border-b border-gray-600">
//             <th className="text-left py-3 px-4 text-gray-400 font-medium">TIME</th>
//             <th className="text-left py-3 px-4 text-gray-400 font-medium">SIGNAL</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">PREDICTED</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">ACTUAL</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">PnL</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">PnL %</th>
//             <th className="text-right py-3 px-4 text-gray-400 font-medium">ACCURACY</th>
//           </tr>
//         </thead>
//         <tbody>
//           {[...hourlyForecast].reverse().map((forecast, reverseIndex) => {
//             // Calculate original index for PnL calculation
//             const originalIndex = hourlyForecast.length - 1 - reverseIndex;
//             const signalDisplay = getSignalDisplay(forecast.signal);
//             const pnlData = calculatePnL(originalIndex);

//             return (
//               <tr key={forecast.time} className="border-b border-gray-700/50 hover:bg-gray-800/30">
//                 <td className="py-3 px-4">
//                   <div className="font-mono text-white font-medium">
//                     {formatTime(forecast.time)}
//                   </div>
//                 </td>

//                 <td className="py-3 px-4">
//                   <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${signalDisplay.bgColor} ${signalDisplay.color}`}>
//                     <span>{signalDisplay.icon}</span>
//                     <span>{signalDisplay.text}</span>
//                   </div>
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   <div className="font-mono text-white">
//                     ${forecast.forecast_price.toLocaleString(undefined, {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2
//                     })}
//                   </div>
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   {pnlData.status === 'calculated' && pnlData.actualPrice ? (
//                     <div className="font-mono text-white">
//                       ${pnlData.actualPrice.toLocaleString(undefined, {
//                         minimumFractionDigits: 2,
//                         maximumFractionDigits: 2
//                       })}
//                     </div>
//                   ) : (
//                     <div className="text-gray-400 text-xs">Pending</div>
//                   )}
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   {pnlData.status === 'calculated' && pnlData.actualPrice ? (
//                     <div className={`font-mono font-medium ${getPnLColor(pnlData.pnlPercentage)}`}>
//                       {pnlData.pnl >= 0 ? '+' : ''}
//                       ${pnlData.pnl.toLocaleString(undefined, {
//                         minimumFractionDigits: 2,
//                         maximumFractionDigits: 2
//                       })}
//                     </div>
//                   ) : (
//                     <div className="text-gray-400 text-xs">-</div>
//                   )}
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   {pnlData.status === 'calculated' && pnlData.actualPrice ? (
//                     <div className={`font-mono font-medium ${getPnLColor(pnlData.pnlPercentage)}`}>
//                       {pnlData.pnlPercentage >= 0 ? '+' : ''}
//                       {pnlData.pnlPercentage.toFixed(3)}%
//                     </div>
//                   ) : (
//                     <div className="text-gray-400 text-xs">-</div>
//                   )}
//                 </td>

//                 <td className="py-3 px-4 text-right">
//                   <div className="text-white">
//                     {forecast.accuracy_percent && forecast.accuracy_percent !== 'N/A'
//                       ? `${forecast.accuracy_percent}%`
//                       : 'N/A'}
//                   </div>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );

//   if (hourlyForecast.length === 0) {
//     return (
//       <div className={`bg-[#1a2332] rounded-lg p-4 ${className}`}>
//         <h3 className="font-bold mb-4 flex items-center space-x-2">
//           <span className="text-lg">⏰</span>
//           <span>HOURLY PREDICTIONS</span>
//         </h3>
//         <div className="text-center text-gray-400 py-8">
//           <div className="text-4xl mb-2">📊</div>
//           <p>No hourly predictions available</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className={`bg-[#1a2332] rounded-lg p-4 relative ${className}`}>
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="font-bold flex items-center space-x-2">
//             <span className="text-lg">⏰</span>
//             <span>HOURLY PREDICTIONS</span>
//           </h3>

//           {/* Expand Button */}
//           <button
//             onClick={() => setIsExpanded(true)}
//             className="text-gray-400 hover:text-white transition-colors p-1 rounded"
//             title="Expand table"
//           >
//             <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
//               <path d="M1 1h6v2H3v4H1V1zm8 0h6v6h-2V3h-4V1zM3 9v4h4v2H1V9h2zm12 0v6H9v-2h4V9h2z" />
//             </svg>
//           </button>
//         </div>

//         <CompactTable />

//         {/* Summary Stats */}
//         <div className="mt-4 pt-3 border-t border-gray-600">
//           <div className="flex justify-between items-center text-xs">
//             <span className="text-gray-400">
//               Total: {hourlyForecast.length}
//             </span>
//             <span className="text-gray-400">
//               Completed: {hourlyForecast.length - 1}/{hourlyForecast.length}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Expanded Modal */}
//       {isExpanded && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-[#0a1628] rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
//             {/* Modal Header */}
//             <div className="flex items-center justify-between p-6 border-b border-gray-700">
//               <h2 className="text-xl font-bold flex items-center space-x-2">
//                 <span className="text-lg">⏰</span>
//                 <span>HOURLY PREDICTIONS - DETAILED VIEW</span>
//               </h2>
//               <button
//                 onClick={() => setIsExpanded(false)}
//                 className="text-gray-400 hover:text-white transition-colors"
//               >
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
//                   <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
//                 </svg>
//               </button>
//             </div>

//             {/* Modal Content */}
//             <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
//               <FullTable />

//               {/* Enhanced Summary Stats */}
//               <div className="mt-6 pt-4 border-t border-gray-600">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                   <div className="text-center">
//                     <div className="text-gray-400">Total Predictions</div>
//                     <div className="text-white font-bold text-lg">{hourlyForecast.length}</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-gray-400">Completed</div>
//                     <div className="text-white font-bold text-lg">{hourlyForecast.length - 1}</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-gray-400">Avg PnL%</div>
//                     <div className="text-white font-bold text-lg">
//                       {(() => {
//                         const validPnLs = hourlyForecast.slice(0, -1).map((_, index) => calculatePnL(index))
//                           .filter(p => p.status === 'calculated');
//                         if (validPnLs.length === 0) return 'N/A';
//                         const avgPnL = validPnLs.reduce((sum, p) => sum + p.pnlPercentage, 0) / validPnLs.length;
//                         return `${avgPnL >= 0 ? '+' : ''}${avgPnL.toFixed(2)}%`;
//                       })()}
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-gray-400">Success Rate</div>
//                     <div className="text-white font-bold text-lg">
//                       {(() => {
//                         const validPnLs = hourlyForecast.slice(0, -1).map((_, index) => calculatePnL(index))
//                           .filter(p => p.status === 'calculated');
//                         if (validPnLs.length === 0) return 'N/A';
//                         const successCount = validPnLs.filter(p => p.pnlPercentage >= 0).length;
//                         return `${((successCount / validPnLs.length) * 100).toFixed(1)}%`;
//                       })()}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default HourlyPredictionsTable;

import React, { useState } from 'react';

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

interface PnLData {
  pnl: number;
  pnlPercentage: number;
  status: 'pending' | 'calculated';
  predictedPrice?: number;
  actualPrice?: number;
}

interface HourlyPredictionsTableProps {
  hourlyForecast: HourlyForecast[];
  className?: string;
}

const HourlyPredictionsTable: React.FC<HourlyPredictionsTableProps> = ({
  hourlyForecast = [],
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Function to extract time from UTC timestamp
  const formatTime = (utcTime: string) => {
    const date = new Date(utcTime);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });
  };

  // Function to calculate PnL
  const calculatePnL = (currentIndex: number): PnLData => {
    if (currentIndex >= hourlyForecast.length - 1) {
      return {
        pnl: 0,
        pnlPercentage: 0,
        status: 'pending' as const,
        predictedPrice: undefined,
        actualPrice: undefined
      };
    }

    const currentForecast = hourlyForecast[currentIndex];
    const nextActual = hourlyForecast[currentIndex + 1];

    if (!currentForecast || !nextActual) {
      return {
        pnl: 0,
        pnlPercentage: 0,
        status: 'pending' as const,
        predictedPrice: undefined,
        actualPrice: undefined
      };
    }

    // PnL = Actual price (next hour) - Predicted price (current hour)
    const pnl = nextActual.current_price - currentForecast.forecast_price;
    const pnlPercentage = (pnl / currentForecast.forecast_price) * 100;

    return {
      pnl,
      pnlPercentage,
      status: 'calculated' as const,
      predictedPrice: currentForecast.forecast_price,
      actualPrice: nextActual.current_price
    };
  };

  // Function to get signal color and icon
  const getSignalDisplay = (signal: string) => {
    switch (signal) {
      case 'LONG':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-400/20',
          icon: '↗',
          text: 'LONG'
        };
      case 'SHORT':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-400/20',
          icon: '↘',
          text: 'SHORT'
        };
      case 'HOLD':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/20',
          icon: '→',
          text: 'HOLD'
        };
      default:
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/20',
          icon: '?',
          text: 'N/A'
        };
    }
  };

  // Function to get PnL color
  const getPnLColor = (pnlPercentage: number) => {
    if (pnlPercentage > 0) return 'text-green-400';
    if (pnlPercentage < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  // Compact table for the sidebar
  const CompactTable = () => (
    <div className="h-80 overflow-y-auto">
      <div className="space-y-2">
        {[...hourlyForecast].reverse().map((forecast, reverseIndex) => {
          // Calculate original index for PnL calculation
          const originalIndex = hourlyForecast.length - 1 - reverseIndex;
          const signalDisplay = getSignalDisplay(forecast.signal);
          const pnlData = calculatePnL(originalIndex);

          return (
            <div key={forecast.time} className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="font-mono text-sm text-white font-medium min-w-[45px]">
                  {formatTime(forecast.time)}
                </div>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${signalDisplay.bgColor} ${signalDisplay.color} min-w-[55px] justify-center`}>
                  <span>{signalDisplay.icon}</span>
                  <span>{signalDisplay.text}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-sm text-white">
                  ${forecast.forecast_price.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  })}
                </div>
                {/* Hide PnL for HOLD signals */}
                {forecast.signal !== 'HOLD' && (
                  <>
                    {pnlData.status === 'calculated' && pnlData.actualPrice ? (
                      <div className={`font-mono text-xs font-medium ${getPnLColor(pnlData.pnlPercentage)}`}>
                        {pnlData.pnlPercentage >= 0 ? '+' : ''}
                        {pnlData.pnlPercentage.toFixed(2)}%
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">Pending</div>
                    )}
                  </>
                )}
                {forecast.signal === 'HOLD' && (
                  <div className="text-gray-400 text-xs">-</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Full table for the popup
  const FullTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="text-left py-3 px-4 text-gray-400 font-medium">TIME</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">SIGNAL</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">PREDICTED</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">ACTUAL</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">PnL</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">PnL %</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">ACCURACY</th>
          </tr>
        </thead>
        <tbody>
          {[...hourlyForecast].reverse().map((forecast, reverseIndex) => {
            // Calculate original index for PnL calculation
            const originalIndex = hourlyForecast.length - 1 - reverseIndex;
            const signalDisplay = getSignalDisplay(forecast.signal);
            const pnlData = calculatePnL(originalIndex);

            return (
              <tr key={forecast.time} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                <td className="py-3 px-4">
                  <div className="font-mono text-white font-medium">
                    {formatTime(forecast.time)}
                  </div>
                </td>

                <td className="py-3 px-4">
                  <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${signalDisplay.bgColor} ${signalDisplay.color}`}>
                    <span>{signalDisplay.icon}</span>
                    <span>{signalDisplay.text}</span>
                  </div>
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="font-mono text-white">
                    ${forecast.forecast_price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                </td>

                <td className="py-3 px-4 text-right">
                  {pnlData.status === 'calculated' && pnlData.actualPrice ? (
                    <div className="font-mono text-white">
                      ${pnlData.actualPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-xs">Pending</div>
                  )}
                </td>

                <td className="py-3 px-4 text-right">
                  {/* Hide PnL for HOLD signals */}
                  {forecast.signal !== 'HOLD' && (
                    <>
                      {pnlData.status === 'calculated' && pnlData.actualPrice ? (
                        <div className={`font-mono font-medium ${getPnLColor(pnlData.pnlPercentage)}`}>
                          {pnlData.pnl >= 0 ? '+' : ''}
                          ${pnlData.pnl.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs">-</div>
                      )}
                    </>
                  )}
                  {forecast.signal === 'HOLD' && (
                    <div className="text-gray-400 text-xs">-</div>
                  )}
                </td>

                <td className="py-3 px-4 text-right">
                  {/* Hide PnL % for HOLD signals */}
                  {forecast.signal !== 'HOLD' && (
                    <>
                      {pnlData.status === 'calculated' && pnlData.actualPrice ? (
                        <div className={`font-mono font-medium ${getPnLColor(pnlData.pnlPercentage)}`}>
                          {pnlData.pnlPercentage >= 0 ? '+' : ''}
                          {pnlData.pnlPercentage.toFixed(3)}%
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs">-</div>
                      )}
                    </>
                  )}
                  {forecast.signal === 'HOLD' && (
                    <div className="text-gray-400 text-xs">-</div>
                  )}
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="text-white">
                    {forecast.accuracy_percent && forecast.accuracy_percent !== 'N/A'
                      ? `${forecast.accuracy_percent}%`
                      : 'N/A'}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  if (hourlyForecast.length === 0) {
    return (
      <div className={`bg-[#1a2332] rounded-lg p-4 ${className}`}>
        <h3 className="font-bold mb-4 flex items-center space-x-2">
          <span className="text-lg">⏰</span>
          <span>HOURLY PREDICTIONS</span>
        </h3>
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-2">📊</div>
          <p>No hourly predictions available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-[#1a2332] rounded-lg p-4 relative ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center space-x-2">
            <span className="text-lg">⏰</span>
            <span>HOURLY PREDICTIONS</span>
          </h3>

          {/* Expand Button */}
          <button
            onClick={() => setIsExpanded(true)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
            title="Expand table"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 1h6v2H3v4H1V1zm8 0h6v6h-2V3h-4V1zM3 9v4h4v2H1V9h2zm12 0v6H9v-2h4V9h2z" />
            </svg>
          </button>
        </div>

        <CompactTable />

        {/* Summary Stats */}
        <div className="mt-4 pt-3 border-t border-gray-600">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">
              Total: {hourlyForecast.length}
            </span>
            <span className="text-gray-400">
              Completed: {hourlyForecast.length - 1}/{hourlyForecast.length}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a1628] rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <span className="text-lg">⏰</span>
                <span>HOURLY PREDICTIONS - DETAILED VIEW</span>
              </h2>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <FullTable />

              {/* Enhanced Summary Stats */}
              <div className="mt-6 pt-4 border-t border-gray-600">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-gray-400">Total Predictions</div>
                    <div className="text-white font-bold text-lg">{hourlyForecast.length}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Completed</div>
                    <div className="text-white font-bold text-lg">{hourlyForecast.length - 1}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Avg PnL%</div>
                    <div className="text-white font-bold text-lg">
                      {(() => {
                        // Only calculate PnL for non-HOLD signals
                        const validPnLs = hourlyForecast.slice(0, -1)
                          .filter(forecast => forecast.signal !== 'HOLD')
                          .map((_, index) => calculatePnL(index))
                          .filter(p => p.status === 'calculated');
                        if (validPnLs.length === 0) return 'N/A';
                        const avgPnL = validPnLs.reduce((sum, p) => sum + p.pnlPercentage, 0) / validPnLs.length;
                        return `${avgPnL >= 0 ? '+' : ''}${avgPnL.toFixed(2)}%`;
                      })()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Success Rate</div>
                    <div className="text-white font-bold text-lg">
                      {(() => {
                        // Only calculate success rate for non-HOLD signals
                        const validPnLs = hourlyForecast.slice(0, -1)
                          .filter(forecast => forecast.signal !== 'HOLD')
                          .map((_, index) => calculatePnL(index))
                          .filter(p => p.status === 'calculated');
                        if (validPnLs.length === 0) return 'N/A';
                        const successCount = validPnLs.filter(p => p.pnlPercentage >= 0).length;
                        return `${((successCount / validPnLs.length) * 100).toFixed(1)}%`;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HourlyPredictionsTable;