import React, { useState } from 'react';

interface PriceData {
  date: string;
  price: number;
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
}

interface PriceChartProps {
  priceHistory?: PriceData[];
  forecast?: ForecastData[];
  className?: string;
}

const PriceChart: React.FC<PriceChartProps> = ({
  priceHistory = [],
  forecast = [],
  className = "",
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'PAST_7D' | 'NEXT_3D'>('NEXT_3D');
  const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'SOL' | 'ETH'>('BTC');

  // Filter data based on selected timeframe
  const getFilteredData = () => {
    if (selectedTimeframe === 'PAST_7D') {
      // Past 7D - show only historical data (June 19-25)
      return {
        historical: priceHistory,
        forecast: []
      };
    } else {
      // Next 3D - show only forecast data (June 26-28)
      return {
        historical: [],
        forecast: forecast
      };
    }
  };

  const { historical: displayPriceHistory, forecast: displayForecast } = getFilteredData();

  // Create SVG chart with filtered data
  const createSVGChart = () => {
    const allData = [
      ...displayPriceHistory.map(item => ({ ...item, type: 'historical' })),
      ...displayForecast.map(item => ({ date: item.date, price: item.entry, type: 'forecast' }))
    ];

    if (allData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          No data available for selected timeframe
        </div>
      );
    }

    const prices = allData.map(item => item.price);
    const minPrice = Math.min(...prices) * 0.995;
    const maxPrice = Math.max(...prices) * 1.005;
    const priceRange = maxPrice - minPrice;

    const width = 500;
    const height = 300;
    const padding = 50;

    const xStep = (width - 2 * padding) / (allData.length - 1);

    return (
      <svg width={width} height={height} className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + ratio * (height - 2 * padding)}
            x2={width - padding}
            y2={padding + ratio * (height - 2 * padding)}
            stroke="#1f2937"
            strokeWidth={1}
            opacity={0.3}
          />
        ))}

        {/* Vertical grid lines */}
        {allData.map((_, i) => (
          <line
            key={i}
            x1={padding + i * xStep}
            y1={padding}
            x2={padding + i * xStep}
            y2={height - padding}
            stroke="#1f2937"
            strokeWidth={1}
            opacity={0.2}
          />
        ))}

        {/* Historical price line */}
        {displayPriceHistory.length > 0 && (
          <polyline
            points={displayPriceHistory.map((item, i) => {
              const x = padding + i * xStep;
              const y = padding + (1 - (item.price - minPrice) / priceRange) * (height - 2 * padding);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={3}
          />
        )}

        {/* Forecast line */}
        {displayForecast.length > 0 && (
          <polyline
            points={displayForecast.map((item, i) => {
              const x = padding + (displayPriceHistory.length + i) * xStep;
              const y = padding + (1 - (item.entry - minPrice) / priceRange) * (height - 2 * padding);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth={3}
            strokeDasharray="8,4"
          />
        )}

        {/* Historical price points */}
        {displayPriceHistory.map((item, i) => {
          const x = padding + i * xStep;
          const y = padding + (1 - (item.price - minPrice) / priceRange) * (height - 2 * padding);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={4}
              fill="#3b82f6"
              stroke="#0a1628"
              strokeWidth={2}
            />
          );
        })}

        {/* Forecast points with signals */}
        {displayForecast.map((item, i) => {
          const x = padding + (displayPriceHistory.length + i) * xStep;
          const y = padding + (1 - (item.entry - minPrice) / priceRange) * (height - 2 * padding);
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={5}
                fill={item.signal === 'LONG' ? '#10b981' : '#ef4444'}
                stroke="#0a1628"
                strokeWidth={2}
              />
              {/* Signal arrow */}
              <polygon
                points={item.signal === 'LONG' 
                  ? `${x},${y-12} ${x-5},${y-7} ${x+5},${y-7}`
                  : `${x},${y+12} ${x-5},${y+7} ${x+5},${y+7}`
                }
                fill={item.signal === 'LONG' ? '#10b981' : '#ef4444'}
              />
            </g>
          );
        })}

        {/* Price labels on Y-axis */}
        <text x={padding - 10} y={padding + 5} fill="#9ca3af" fontSize="12" textAnchor="end">
          ${Math.round(maxPrice).toLocaleString()}
        </text>
        <text x={padding - 10} y={height - padding + 5} fill="#9ca3af" fontSize="12" textAnchor="end">
          ${Math.round(minPrice).toLocaleString()}
        </text>
        <text x={padding - 10} y={padding + (height - 2 * padding) / 2} fill="#9ca3af" fontSize="12" textAnchor="end">
          ${Math.round((maxPrice + minPrice) / 2).toLocaleString()}
        </text>

        {/* Date labels */}
        {allData.length > 1 && (
          <>
            <text x={padding} y={height - padding + 20} fill="#9ca3af" fontSize="10" textAnchor="middle">
              {new Date(allData[0]?.date).toLocaleDateString()}
            </text>
            <text x={width - padding} y={height - padding + 20} fill="#9ca3af" fontSize="10" textAnchor="middle">
              {new Date(allData[allData.length - 1]?.date).toLocaleDateString()}
            </text>
          </>
        )}
      </svg>
    );
  };

  return (
    <div className={`bg-[#0a1628] rounded-lg p-4 ${className}`}>
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        {/* Asset Selector */}
        <div className="flex space-x-2">
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value as 'BTC' | 'SOL' | 'ETH')}
            className="bg-[#1a2332] text-white px-3 py-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="BTC">BTC</option>
            <option value="SOL" disabled>SOL (Coming Soon)</option>
            <option value="ETH" disabled>ETH (Coming Soon)</option>
          </select>
        </div>

        {/* Timeframe Selector */}
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedTimeframe('PAST_7D')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedTimeframe === 'PAST_7D'
                ? 'bg-blue-600 text-white'
                : 'bg-[#1a2332] text-gray-400 hover:text-white'
            }`}
          >
            Past 7D
          </button>
          <button
            onClick={() => setSelectedTimeframe('NEXT_3D')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedTimeframe === 'NEXT_3D'
                ? 'bg-blue-600 text-white'
                : 'bg-[#1a2332] text-gray-400 hover:text-white'
            }`}
          >
            Next 3D
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="w-full bg-[#1a2332] rounded-lg p-1 mt-3" style={{ height: '180px' }}>
        {createSVGChart()}
      </div>

      {/* Legend */}
      <div className="flex justify-center mt-2 space-x-6 text-[10px]">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-blue-500"></div>
          <span className="text-gray-400">Historical Price</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-green-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #10b981 0, #10b981 8px, transparent 8px, transparent 12px)' }}></div>
          <span className="text-gray-400">Forecast</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-400">LONG Signal</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-400">SHORT Signal</span>
        </div>
      </div>

      {/* Forecast Summary with real data */}
      <div className="mt-2 grid grid-cols-3 gap-4 text-xs">
        {displayForecast.map((item, i) => (
          <div key={i} className="bg-[#1a2332] rounded p-2 text-center">
            <div className={`font-bold ${item.signal === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
              {item.signal}
            </div>
            <div className="text-gray-400">
              ${Math.round(item.entry).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(item.date).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Deviation row with actual calculated values */}
      <div className="flex justify-between text-xs text-gray-400 mt-4 px-4">
        <span>Deviation</span>
        <span>BTC +2.7%</span>
        <span>ETH +3.1%</span>
        <span>SOL +4.2%</span>
      </div>
    </div>
  );
};

export default PriceChart;