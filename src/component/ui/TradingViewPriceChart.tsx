'use client'

import React, { useRef, useEffect } from 'react'

// your existing hourly forecast type
interface HourlyForecast {
  time: string;                     // ISO timestamp
  signal: 'LONG' | 'SHORT' | 'HOLD';
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  confidence_50: [number, number];
  confidence_80: [number, number];
  confidence_90: [number, number];
  current_price?: number;
}

declare global {
  interface Window { TradingView: any }
}

// small helper to compute exit PnL
function calculateTradePnL(idx: number, hourly: HourlyForecast[]) {
  const curr = hourly[idx];
  const next = hourly[idx + 1];
  if (!curr.entry_price || curr.signal === 'HOLD' || !next?.current_price) return null;

  let exitPrice = next.current_price;
  let exitReason: 'stop_loss' | 'take_profit' | 'next_hour' = 'next_hour';

  if (curr.signal === 'LONG') {
    if (curr.stop_loss! >= exitPrice) {
      exitPrice = curr.stop_loss!;
      exitReason = 'stop_loss';
    } else if (curr.take_profit! <= exitPrice) {
      exitPrice = curr.take_profit!;
      exitReason = 'take_profit';
    }
  } else {
    if (curr.stop_loss! <= exitPrice) {
      exitPrice = curr.stop_loss!;
      exitReason = 'stop_loss';
    } else if (curr.take_profit! >= exitPrice) {
      exitPrice = curr.take_profit!;
      exitReason = 'take_profit';
    }
  }

  const pnl =
    curr.signal === 'LONG'
      ? exitPrice - curr.entry_price!
      : curr.entry_price! - exitPrice;
  return { exitPrice, exitReason, pnl };
}

export const TradingViewPriceChart: React.FC<{
  hourlyForecast: HourlyForecast[];
  symbol?: string;
  intervalMinutes?: number;
  width?: string | number;
  height?: string | number;
}> = ({
  hourlyForecast,
  symbol = 'BINANCE:BTCUSDT',
  intervalMinutes = 60,
  width = '100%',
  height = 400,
}) => {
  const container = useRef<HTMLDivElement>(null);
  const tooltip   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!(window as any).TradingView || !container.current) return;

    const widget = new (window as any).TradingView.widget({
      container_id:   container.current.id,
      autosize:       false,
      width,
      height,
      symbol,
      interval:       String(intervalMinutes),
      timezone:       'Etc/UTC',
      theme:          'Dark',
      style:          '1',   // candlesticks
      locale:         'en',
      toolbar_bg:     '#0a1628',
      allow_symbol_change: false,
    });

    widget.onChartReady(() => {
      const chart = widget.activeChart();

      const toTVTime = (iso: string) => Math.floor(Date.parse(iso) / 1000);

      // 1) confidence bands
      [
        { key: 'confidence_90', color: '#22c55e', opacity: 0.1 },
        { key: 'confidence_80', color: '#f59e0b', opacity: 0.15 },
        { key: 'confidence_50', color: '#3b82f6', opacity: 0.2 },
      ].forEach(({ key, color, opacity }) => {
        hourlyForecast.forEach(fc => {
          const [low, high] = (fc as any)[key] as [number, number];
          chart.createMultipointShape(
            [
              { time: toTVTime(fc.time), price: low },
              { time: toTVTime(fc.time), price: high },
            ],
            {
              shape: 'rectangle',
              overrides: {
                fill:        color,
                fillOpacity: opacity,
                lineColor:   color,
                lineWidth:   1,
              },
            }
          );
        });
      });

      // 2) latest Entry/Stop/TP horizontal lines
      const last = hourlyForecast[hourlyForecast.length - 1];
      const drawLine = (price: number, col: string) => {
        const range = chart.getVisibleRange();
        chart.createMultipointShape(
          [
            { time: range.from, price },
            { time: range.to,   price },
          ],
          {
            shape: 'horizontal_line',
            overrides: {
              lineColor: col,
              lineWidth: 2,
              lineStyle: 1,
            },
          }
        );
      };
      if (last.entry_price)   drawLine(last.entry_price,   '#10b981');
      if (last.stop_loss)     drawLine(last.stop_loss,     '#ef4444');
      if (last.take_profit)   drawLine(last.take_profit,   '#8b5cf6');

      // 3) entry “B” and exit “X”
      hourlyForecast.forEach((fc, i) => {
        if (!fc.entry_price || fc.signal === 'HOLD') return;
        const t1 = toTVTime(fc.time);
        const isLong = fc.signal === 'LONG';

        // “B” arrow
        chart.createShape(
          { time: t1, price: fc.entry_price },
          {
            shape: isLong ? 'arrowUp' : 'arrowDown',
            overrides: {
              color: isLong ? '#10b981' : '#ef4444',
              text:  isLong ? 'B' : 'S',
              size:  4,
            },
          }
        );

        // exit “X” circle
        const pnlData = calculateTradePnL(i, hourlyForecast);
        if (pnlData) {
          const t2 = toTVTime(hourlyForecast[i + 1].time);
          chart.createShape(
            { time: t2, price: pnlData.exitPrice },
            {
              shape: 'circle',
              overrides: {
                color: pnlData.pnl > 0 ? '#10b981' : '#ef4444',
                text:  'X',
                size:  6,
              },
            }
          );
        }
      });

      // 4) HTML tooltip
      const tip = document.createElement('div');
      tip.style.cssText = `
        position:absolute;
        display:none;
        background:rgba(0,0,0,0.8);
        color:#fff;
        padding:8px;
        border-radius:4px;
        font-size:12px;
        pointer-events:none;
        z-index:1000;
      `;
      container.current!.append(tip);
      tooltip.current = tip;

      widget.chart()
        .onMouseMove()
        .subscribe(null, (p: any) => {
          const { time, seriesData, point } = p;
          if (!time || !seriesData.has(widget.chart().mainSeries())) {
            tip.style.display = 'none';
            return;
          }
          const d  = seriesData.get(widget.chart().mainSeries());
          const vol= seriesData.get(widget.chart().minorSeries()[0]);
          const dt = new Date(time * 1000);

          tip.innerHTML = `
            <b>${dt.toLocaleTimeString()}</b><br/>
            O: ${d.open.toFixed(2)}<br/>
            H: ${d.high.toFixed(2)}<br/>
            L: ${d.low.toFixed(2)}<br/>
            C: ${d.close.toFixed(2)}<br/>
            Vol: ${Math.round(vol.value).toLocaleString()}
          `;
          tip.style.display = 'block';
          tip.style.left = point.x + 12 + 'px';
          tip.style.top  = point.y + 12 + 'px';
        });
    });

    return () => widget.remove();
  }, [hourlyForecast, symbol, intervalMinutes, width, height]);

  // zoom controls
  const zoomIn  = () => (window as any).TradingView.activeChart()?.zoomIn();
  const zoomOut = () => (window as any).TradingView.activeChart()?.zoomOut();
  const reset   = () => (window as any).TradingView.activeChart()?.resetTimeScale();

  return (
    <div style={{ position: 'relative', width, height }}>
      <div id={container.current?.id || 'tv-chart'} ref={container} />
      <div style={{
        position: 'absolute',
        top: 8, right: 8,
        display: 'flex',
        gap: 4,
        zIndex: 10
      }}>
        {[{fn: zoomIn,  label:'＋'},
          {fn: zoomOut, label:'－'},
          {fn: reset,   label:'⛶'}].map(b => (
          <button
            key={b.label}
            onClick={b.fn}
            style={{
              padding:'4px 8px',
              background:'#1a2332',
              color:'#fff',
              border:'none',
              borderRadius:4,
              cursor:'pointer'
            }}
          >{b.label}</button>
        ))}
      </div>
    </div>
  );
};
