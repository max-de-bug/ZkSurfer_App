// src/component/ui/AccuracyChart.tsx
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';

type Point = { label: string; value: number };

interface AccuracyChartProps {
  data: Point[];
  barColor?: string;
  height?: number;
}

const AccuracyChart: React.FC<AccuracyChartProps> = ({
  data,
  barColor = '#10b981',
  height = 100,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    try {
      // Create the chart with minimal configuration
      chartRef.current = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height,
        layout: {
          background: { color: 'transparent' },
          textColor: 'transparent',
        },
        grid: {
          vertLines: { visible: false },
          horzLines: { visible: false },
        },
        timeScale: {
          visible: false,
          borderColor: 'transparent',
        },
        rightPriceScale: {
          visible: false,
          borderColor: 'transparent',
        },
        leftPriceScale: {
          visible: false,
          borderColor: 'transparent',
        },
        crosshair: {
          horzLine: { visible: false },
          vertLine: { visible: false },
        },
      });

      // Use line series to create bar-like visualization
      const lineSeries = chartRef.current.addSeries(LightweightCharts.LineSeries, {
        color: barColor,
        lineWidth: 3,
      });

      // Convert data to time-based format
      const chartData = data.map((point, index) => ({
        time: (index + 1) as any, // Simple increment for x-axis
        value: point.value,
      }));

      if (chartData.length > 0) {
        lineSeries.setData(chartData);
      }

      // Handle resize
      const handleResize = () => {
        if (containerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: containerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error creating accuracy chart:', error);
      return;
    }
  }, [data, barColor, height]);

  // Fallback rendering if chart fails
  if (!data || data.length === 0) {
    return (
      <div
        style={{ width: '100%', height: `${height}px` }}
        className="flex items-center justify-center text-gray-400 text-sm"
      >
        No data available
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: `${height}px` }}
    />
  );
};

export default AccuracyChart;