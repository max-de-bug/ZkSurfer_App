import React, { useState, useRef, useEffect } from 'react';

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
  deviation_percent?: number | string;
  overall_accuracy_percent?: number | string;
}

interface PriceChartProps {
  priceHistory?: PriceData[];
  forecast?: ForecastData[];
  className?: string;
}

interface TooltipData {
  x: number;
  y: number;
  data: any;
  visible: boolean;
}

const PriceChart: React.FC<PriceChartProps> = ({
  priceHistory = [
    { date: "2025-06-19", price: 104639.48 },
    { date: "2025-06-20", price: 104611.16 },
    { date: "2025-06-21", price: 103296.19 },
    { date: "2025-06-22", price: 101348.19 },
    { date: "2025-06-23", price: 101987.11 },
    { date: "2025-06-24", price: 105436.11 },
    { date: "2025-06-25", price: 106371.09 }
  ],
  forecast = [
    {
      date: "2025-06-26",
      signal: "LONG" as const,
      entry: 105383.516,
      stop_loss: 102887.88,
      take_profit: 107879.15,
      confidence_intervals: {
        50: [104007.53, 106759.5],
        80: [103302.92, 107464.11],
        90: [102406.04, 108360.99]
      }
    },
    {
      date: "2025-06-27",
      signal: "LONG" as const,
      entry: 104762.586,
      stop_loss: 102266.95,
      take_profit: 107258.22,
      confidence_intervals: {
        50: [101955.72, 107569.45],
        80: [101133.86, 108391.31],
        90: [100444.3, 109080.875]
      }
    },
    {
      date: "2025-06-28",
      signal: "LONG" as const,
      entry: 104285.13,
      stop_loss: 101789.50,
      take_profit: 106780.76,
      confidence_intervals: {
        50: [102227.3, 106342.97],
        80: [99639.16, 108931.11],
        90: [99214.6, 109355.664]
      }
    }
  ],
  className = "",
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'PAST_7D' | 'NEXT_3D'>('NEXT_3D');
  const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'SOL' | 'ETH'>('BTC');
  const [tooltip, setTooltip] = useState<TooltipData>({ x: 0, y: 0, data: null, visible: false });
  const [isMobile, setIsMobile] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

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


  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter data based on selected timeframe
  const getFilteredData = () => {
    if (selectedTimeframe === 'PAST_7D') {
      return {
        historical: priceHistory,
        forecast: []
      };
    } else {
      return {
        historical: [],
        forecast: forecast
      };
    }
  };

  const { historical: displayPriceHistory, forecast: displayForecast } = getFilteredData();

  // Show/hide tooltip
  const showTooltip = (event: React.MouseEvent, data: any) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        data: data,
        visible: true
      });
    }
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  // Create SVG chart with filtered data
  const createSVGChart = () => {
    const allData = [
      ...displayPriceHistory.map(item => ({ ...item, type: 'historical' })),
      ...displayForecast.map(item => ({ ...item, price: item.entry, type: 'forecast' }))
    ];

    if (allData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          No data available for selected timeframe
        </div>
      );
    }

    // Include confidence intervals in price calculation for proper scaling
    const allPrices = [
      ...allData.map(item => item.price),
      ...displayForecast.flatMap(item => [
        item.confidence_intervals[90][0],
        item.confidence_intervals[90][1],
        item.stop_loss,
        item.take_profit
      ])
    ];

    const minPrice = Math.min(...allPrices) * 0.995;
    const maxPrice = Math.max(...allPrices) * 1.005;
    const priceRange = maxPrice - minPrice;

    // Mobile-responsive dimensions
    const width = isMobile ? 350 : 500;
    const height = isMobile ? 200 : 300;
    const padding = isMobile ? 30 : 50;

    const xStep = (width - 2 * padding) / Math.max(allData.length - 1, 1);

    const getY = (price: number) => padding + (1 - (price - minPrice) / priceRange) * (height - 2 * padding);
    const getX = (index: number) => padding + index * xStep;


    return (
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
        viewBox={`0 0 ${width} ${height}`}
        onMouseLeave={hideTooltip}
      >
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
            x1={getX(i)}
            y1={padding}
            x2={getX(i)}
            y2={height - padding}
            stroke="#1f2937"
            strokeWidth={1}
            opacity={0.2}
          />
        ))}

        {/* Confidence Intervals - only for forecast data */}
        {displayForecast.length > 0 && (
          <>
            {(() => {
              const createConfidenceArea = (upperBounds: number[], lowerBounds: number[]) => {
                const points = displayForecast.map((_, i) => ({
                  x: getX(displayPriceHistory.length + i),
                  upper: upperBounds[i],
                  lower: lowerBounds[i]
                }));

                let upperPath = `M ${points[0].x},${points[0].upper}`;
                for (let i = 1; i < points.length; i++) {
                  const prev = points[i - 1];
                  const curr = points[i];
                  const cp1x = prev.x + (curr.x - prev.x) / 3;
                  const cp2x = curr.x - (curr.x - prev.x) / 3;
                  upperPath += ` C ${cp1x},${prev.upper} ${cp2x},${curr.upper} ${curr.x},${curr.upper}`;
                }

                let lowerPath = `L ${points[points.length - 1].x},${points[points.length - 1].lower}`;
                for (let i = points.length - 2; i >= 0; i--) {
                  const next = points[i + 1];
                  const curr = points[i];
                  const cp1x = next.x - (next.x - curr.x) / 3;
                  const cp2x = curr.x + (next.x - curr.x) / 3;
                  lowerPath += ` C ${cp1x},${next.lower} ${cp2x},${curr.lower} ${curr.x},${curr.lower}`;
                }

                return upperPath + lowerPath + ' Z';
              };

              const ci90Upper = displayForecast.map(item => getY(item.confidence_intervals[90][1]));
              const ci90Lower = displayForecast.map(item => getY(item.confidence_intervals[90][0]));
              const ci80Upper = displayForecast.map(item => getY(item.confidence_intervals[80][1]));
              const ci80Lower = displayForecast.map(item => getY(item.confidence_intervals[80][0]));
              const ci50Upper = displayForecast.map(item => getY(item.confidence_intervals[50][1]));
              const ci50Lower = displayForecast.map(item => getY(item.confidence_intervals[50][0]));

              return (
                <>
                  <path
                    d={createConfidenceArea(ci90Upper, ci90Lower)}
                    fill="#22c55e"
                    fillOpacity={0.15}
                    stroke="none"
                  />
                  <path
                    d={createConfidenceArea(ci80Upper, ci80Lower)}
                    fill="#f59e0b"
                    fillOpacity={0.2}
                    stroke="none"
                  />
                  <path
                    d={createConfidenceArea(ci50Upper, ci50Lower)}
                    fill="#3b82f6"
                    fillOpacity={0.25}
                    stroke="none"
                  />
                </>
              );
            })()}

            {/* Trading lines with mobile-friendly stroke width */}
            <line
              x1={getX(displayPriceHistory.length)}
              y1={getY(displayForecast[0]?.entry || 0)}
              x2={getX(displayPriceHistory.length + displayForecast.length - 1)}
              y2={getY(displayForecast[displayForecast.length - 1]?.entry || 0)}
              stroke="#059669"
              strokeWidth={isMobile ? 1.5 : 2}
              strokeDasharray="6,3"
            />

            <line
              x1={getX(displayPriceHistory.length)}
              y1={getY(displayForecast[0]?.stop_loss || 0)}
              x2={getX(displayPriceHistory.length + displayForecast.length - 1)}
              y2={getY(displayForecast[displayForecast.length - 1]?.stop_loss || 0)}
              stroke="#dc2626"
              strokeWidth={isMobile ? 1.5 : 2}
              strokeDasharray="6,3"
            />

            <line
              x1={getX(displayPriceHistory.length)}
              y1={getY(displayForecast[0]?.take_profit || 0)}
              x2={getX(displayPriceHistory.length + displayForecast.length - 1)}
              y2={getY(displayForecast[displayForecast.length - 1]?.take_profit || 0)}
              stroke="#7c3aed"
              strokeWidth={isMobile ? 1.5 : 2}
              strokeDasharray="6,3"
            />
          </>
        )}

        {/* Price lines with mobile-friendly stroke width */}
        {displayPriceHistory.length > 0 && (
          <polyline
            points={displayPriceHistory.map((item, i) => {
              const x = getX(i);
              const y = getY(item.price);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={isMobile ? 2 : 3}
          />
        )}

        {displayForecast.length > 0 && (
          <polyline
            points={displayForecast.map((item, i) => {
              const x = getX(displayPriceHistory.length + i);
              const y = getY(item.entry);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth={isMobile ? 2 : 3}
            strokeDasharray="8,4"
          />
        )}

        {/* Data points with mobile-friendly sizes */}
        {displayPriceHistory.map((item, i) => {
          const x = getX(i);
          const y = getY(item.price);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={isMobile ? 3 : 4}
              fill="#3b82f6"
              stroke="#0a1628"
              strokeWidth={isMobile ? 1 : 2}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => showTooltip(e, { ...item, type: 'historical' })}
            />
          );
        })}

        {displayForecast.map((item, i) => {
          const x = getX(displayPriceHistory.length + i);
          const y = getY(item.entry);
          const radius = isMobile ? 4 : 5;
          const arrowSize = isMobile ? 8 : 12;
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={radius}
                fill={item.signal === 'LONG' ? '#10b981' : '#ef4444'}
                stroke="#0a1628"
                strokeWidth={isMobile ? 1 : 2}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => showTooltip(e, { ...item, type: 'forecast' })}
              />
              <polygon
                points={item.signal === 'LONG'
                  ? `${x},${y - arrowSize} ${x - arrowSize / 2},${y - arrowSize / 2} ${x + arrowSize / 2},${y - arrowSize / 2}`
                  : `${x},${y + arrowSize} ${x - arrowSize / 2},${y + arrowSize / 2} ${x + arrowSize / 2},${y + arrowSize / 2}`
                }
                fill={item.signal === 'LONG' ? '#10b981' : '#ef4444'}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => showTooltip(e, { ...item, type: 'forecast' })}
              />
            </g>
          );
        })}

        {/* Price labels with mobile-friendly font size */}
        <text x={padding - 5} y={padding + 5} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
          ${Math.round(maxPrice).toLocaleString()}
        </text>
        <text x={padding - 5} y={height - padding + 5} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
          ${Math.round(minPrice).toLocaleString()}
        </text>
        <text x={padding - 5} y={padding + (height - 2 * padding) / 2} fill="#9ca3af" fontSize={isMobile ? "10" : "12"} textAnchor="end">
          ${Math.round((maxPrice + minPrice) / 2).toLocaleString()}
        </text>

        {/* Date labels with mobile-friendly font size */}
        {allData.length > 1 && (
          <>
            <text x={padding} y={height - padding + 15} fill="#9ca3af" fontSize={isMobile ? "8" : "10"} textAnchor="middle">
              {new Date(allData[0]?.date).toLocaleDateString()}
            </text>
            <text x={width - padding} y={height - padding + 15} fill="#9ca3af" fontSize={isMobile ? "8" : "10"} textAnchor="middle">
              {new Date(allData[allData.length - 1]?.date).toLocaleDateString()}
            </text>
          </>
        )}
      </svg>
    );
  };

  const firstFc = latest;

  // const firstFc = forecast?.[0];

  // Format deviation: prepend "+" if >=0, two decimals, or '—' if missing
  const rawDev = firstFc?.deviation_percent;
  const formattedDeviation =
    typeof rawDev === 'number'
      ? `${rawDev >= 0 ? '+' : ''}${rawDev.toFixed(2)}%`
      : typeof rawDev === 'string' && rawDev !== 'N/A'
        ? `${rawDev.startsWith('-') ? '' : '+'}${rawDev}%`
        : '—';

  // Format accuracy: two decimals + "%"
  const rawAcc = firstFc?.overall_accuracy_percent;
  const formattedAccuracy =
    typeof rawAcc === 'number'
      ? `${rawAcc.toFixed(2)}%`
      : typeof rawAcc === 'string'
        ? rawAcc
        : '—';

  return (
    <div className={`bg-[#0a1628] rounded-lg p-4 ${className}`}>
      {/* Header Controls - Mobile responsive */}
      <div className="flex justify-between items-center">
        {/* Asset Selector */}
        <div className="flex space-x-2">
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value as 'BTC' | 'SOL' | 'ETH')}
            className={`bg-[#1a2332] text-white px-2 py-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none ${isMobile ? 'text-xs w-20' : 'px-3'}`}
          >
            <option value="BTC">BTC</option>
            <option value="SOL" disabled>SOL (Coming Soon)</option>
            <option value="ETH" disabled>ETH (Coming Soon)</option>
          </select>
        </div>

        {/* Timeframe Selector */}
        <div className="flex space-x-1">
          <button
            onClick={() => setSelectedTimeframe('PAST_7D')}
            className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'} rounded font-medium transition-colors ${selectedTimeframe === 'PAST_7D'
              ? 'bg-blue-600 text-white'
              : 'bg-[#1a2332] text-gray-400 hover:text-white'
              }`}
          >
            Past 7D
          </button>
          <button
            onClick={() => setSelectedTimeframe('NEXT_3D')}
            className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'} rounded font-medium transition-colors ${selectedTimeframe === 'NEXT_3D'
              ? 'bg-blue-600 text-white'
              : 'bg-[#1a2332] text-gray-400 hover:text-white'
              }`}
          >
            Next 3D
          </button>
        </div>
      </div>

      {/* Chart Container - Mobile responsive height */}
      <div className={`w-full bg-[#1a2332] rounded-lg p-1 mt-3 relative`} style={{ height: isMobile ? '150px' : '180px' }}>
        {createSVGChart()}

        {/* Tooltip - Mobile responsive */}
        {tooltip.visible && tooltip.data && (
          <div
            className={`absolute bg-gray-900 border border-gray-600 rounded-lg p-3 text-white shadow-lg z-10 ${isMobile ? 'text-xs min-w-40' : 'text-xs min-w-48'}`}
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 10,
              transform: tooltip.x > (isMobile ? 200 : 300) ? 'translateX(-100%)' : 'none'
            }}
          >
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Date:</span>
                <span>{new Date(tooltip.data.date).toLocaleDateString()}</span>
              </div>

              {tooltip.data.type === 'historical' ? (
                <div className="flex justify-between">
                  <span className="text-gray-400">Price:</span>
                  <span>${Math.round(tooltip.data.price).toLocaleString()}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Signal:</span>
                    <span className={tooltip.data.signal === 'LONG' ? 'text-green-400' : 'text-red-400'}>
                      {tooltip.data.signal}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entry:</span>
                    <span>${Math.round(tooltip.data.entry).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stop Loss:</span>
                    <span className="text-red-400">${Math.round(tooltip.data.stop_loss).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Take Profit:</span>
                    <span className="text-green-400">${Math.round(tooltip.data.take_profit).toLocaleString()}</span>
                  </div>
                  {!isMobile && (
                    <>
                      <hr className="border-gray-600 my-2" />
                      <div className="text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>50% CI:</span>
                          <span>${Math.round(tooltip.data.confidence_intervals[50][0]).toLocaleString()} - ${Math.round(tooltip.data.confidence_intervals[50][1]).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>90% CI:</span>
                          <span>${Math.round(tooltip.data.confidence_intervals[90][0]).toLocaleString()} - ${Math.round(tooltip.data.confidence_intervals[90][1]).toLocaleString()}</span>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend - Mobile responsive */}
      <div className={`flex justify-center mt-2 space-x-2 flex-wrap ${isMobile ? 'text-[8px]' : 'text-[10px]'}`}>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-0.5 bg-blue-500"></div>
          <span className="text-gray-400">Historical</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-0.5 bg-green-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #10b981 0, #10b981 4px, transparent 4px, transparent 6px)' }}></div>
          <span className="text-gray-400">Forecast</span>
        </div>
        {!isMobile && (
          <>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-green-600" style={{ backgroundImage: 'repeating-linear-gradient(to right, #059669 0, #059669 4px, transparent 4px, transparent 6px)' }}></div>
              <span className="text-gray-400">Entry</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-red-600" style={{ backgroundImage: 'repeating-linear-gradient(to right, #dc2626 0, #dc2626 4px, transparent 4px, transparent 6px)' }}></div>
              <span className="text-gray-400">Stop Loss</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-purple-600" style={{ backgroundImage: 'repeating-linear-gradient(to right, #7c3aed 0, #7c3aed 4px, transparent 4px, transparent 6px)' }}></div>
              <span className="text-gray-400">Take Profit</span>
            </div>
          </>
        )}
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-400">LONG</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-gray-400">SHORT</span>
        </div>
      </div>

      {/* Forecast Summary - Mobile responsive grid */}
      <div className={`mt-2 grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-3 gap-4'} ${isMobile ? 'text-xs' : 'text-xs'}`}>
        {displayForecast.slice(0, isMobile ? 2 : 3).map((item, i) => (
          <div key={i} className="bg-[#1a2332] rounded p-2 text-center">
            <div className={`font-bold ${item.signal === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
              {item.signal}
            </div>
            <div className="text-gray-400">
              ${Math.round(item.take_profit).toLocaleString()}
            </div>
            <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500`}>
              {new Date(item.date).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Deviation row - Mobile responsive */}
      <div className={`flex justify-between ${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-400 mt-4 ${isMobile ? 'px-2' : 'px-4'}`}>
        <span>Deviation</span>
        <span>BTC {formattedDeviation}</span>
        {/* {!isMobile && (
          <>

            <span>ETH {formattedDeviation}</span>
            <span>SOL {formattedDeviation}</span>
          </>
        )} */}
      </div>
    </div>
  );
};

export default PriceChart;