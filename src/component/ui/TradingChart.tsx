'use client'
import React, { useRef, useEffect, useState } from 'react'
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  UTCTimestamp,
} from 'lightweight-charts'
import {
  SMA,
  EMA,
  RSI,
  MACD,
  BollingerBands,
  ATR,
} from 'technicalindicators'
import { useTradingStore } from '@/stores/trading-store'
import { IndicatorSelector } from './IndicatorSelector'
import { IndicatorBadge } from './IndicatorBadge'

interface Candle {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export function TradingChart({ width = 800, height = 400 }) {
  const container = useRef<HTMLDivElement>(null)
  const [indicators, setIndicators] = useState<{ name: string, visible: boolean }[]>([])
  const [interval, setInterval] = useState<'1m' | '5m' | '15m' | '1h' | '1d'>('1h')

  const [ohlc, setOhlc] = useState<{
    o: number
    h: number
    l: number
    c: number
    change: number
    percent: number
  } | null>(null)

  const raw = useTradingStore(s => s.candlestickData) as Candle[]
  const candles = raw.map(c => ({
    time: (new Date().setHours(parseInt(c.time), 0, 0, 0) / 1000) as UTCTimestamp,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
    volume: c.volume,
  }))

  const handleAddIndicator = (name: string) => {
    setIndicators(prev => {
      if (prev.find(i => i.name === name)) return prev
      return [...prev, { name, visible: true }]
    })
  }

  useEffect(() => {
    if (!container.current) return
    const chart = createChart(container.current, {
      width,
      height,
      layout: { background: '#1e1e2e', textColor: '#d1d4dc' },
      grid: {
        vertLines: { color: '#2f2f3f' },
        horzLines: { color: '#2f2f3f' },
      },
    })

    const priceSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
    })
    priceSeries.setData(candles)
    priceSeries.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: 0.3 } })

    chart.subscribeCrosshairMove(param => {
      if (!param?.seriesData || !priceSeries) return

      const data = param.seriesData.get(priceSeries)
      if (!data || typeof data !== 'object') return

      const { open, high, low, close } = data as any
      const change = close - open
      const percent = (change / open) * 100

      setOhlc({ o: open, h: high, l: low, c: close, change, percent })
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    })
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.7, bottom: 0 } })

    const volumeData = candles.map((bar, i) => {
      const prev = candles[i - 1]
      const color = !prev || bar.close >= prev.close ? '#26a69a' : '#ef5350'
      return { time: bar.time, value: bar.volume, color }
    })
    volumeSeries.setData(volumeData)

    const closes = candles.map(c => c.close)
    const highs = candles.map(c => c.high)
    const lows = candles.map(c => c.low)

    const sma14 = SMA.calculate({ period: 14, values: closes })
    const ema14 = EMA.calculate({ period: 14, values: closes })
    const rsi14 = RSI.calculate({ period: 14, values: closes })
    const macd = MACD.calculate({ values: closes, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 })
    const bb = BollingerBands.calculate({ period: 20, values: closes, stdDev: 2 })
    const atr14 = ATR.calculate({ period: 14, high: highs, low: lows, close: closes })

    const shift = (arr: any[]) => candles.slice(candles.length - arr.length).map((c, i) => ({ time: c.time, value: arr[i] }))

    for (const ind of indicators) {
      if (!ind.visible) continue
      if (ind.name === 'SMA')
        chart.addSeries(LineSeries, { color: '#f1c40f' }).setData(shift(sma14))
      if (ind.name === 'EMA')
        chart.addSeries(LineSeries, { color: '#8e44ad' }).setData(shift(ema14))
      if (ind.name === 'RSI')
        chart.addSeries(LineSeries, { color: '#2ecc71' }).setData(shift(rsi14))
      if (ind.name === 'ATR')
        chart.addSeries(LineSeries, { color: '#e74c3c' }).setData(shift(atr14))
      if (ind.name === 'MACD') {
        chart.addSeries(LineSeries, { color: '#e67e22' }).setData(macd.map((m, i) => ({ time: candles[i + (candles.length - macd.length)].time, value: m.MACD })))
        chart.addSeries(LineSeries, { color: '#3498db' }).setData(macd.map((m, i) => ({ time: candles[i + (candles.length - macd.length)].time, value: m.signal })))
        chart.addSeries(HistogramSeries, { color: '#95a5a6' }).setData(macd.map((m, i) => ({ time: candles[i + (candles.length - macd.length)].time, value: m.histogram })))
      }
      if (ind.name === 'Bollinger Bands') {
        chart.addSeries(LineSeries, { color: '#bdc3c7' }).setData(bb.map((b, i) => ({ time: candles[i + (candles.length - bb.length)].time, value: b.upper })))
        chart.addSeries(LineSeries, { color: '#bdc3c7' }).setData(bb.map((b, i) => ({ time: candles[i + (candles.length - bb.length)].time, value: b.lower })))
      }
    }

    chart.timeScale().fitContent()
    return () => chart.remove()
  }, [candles, width, height, indicators])

  return (
    <div className="relative">
      <div className="absolute left-40 z-50">
        <select
          value={interval}
          onChange={(e) => setInterval(e.target.value as any)}
          className="bg-gray-800 text-white p-2 rounded border border-gray-600 text-sm"
        >
          <optgroup label="Minutes">
            <option value="1m">1m</option>
            <option value="5m">5m</option>
            <option value="15m">15m</option>
          </optgroup>
          <optgroup label="Hours">
            <option value="1h">1h</option>
          </optgroup>
          <optgroup label="Days">
            <option value="1d">1d</option>
          </optgroup>
        </select>
      </div>

      <IndicatorSelector onSelect={handleAddIndicator} />

      {ohlc && (
        <div className="absolute top-1 left-1/2  text-sm text-white bg-black/60 px-4 py-1 rounded flex gap-4 z-50">
          <span>O {ohlc.o.toFixed(2)}</span>
          <span>H {ohlc.h.toFixed(2)}</span>
          <span>L {ohlc.l.toFixed(2)}</span>
          <span>C {ohlc.c.toFixed(2)}</span>
          <span className={ohlc.change >= 0 ? 'text-green-400' : 'text-red-400'}>
            {ohlc.change.toFixed(2)} ({ohlc.percent.toFixed(2)}%)
          </span>
        </div>
      )}

      <div className="absolute top-2 left-2 z-50 flex gap-2">
        {indicators.map(ind => (
          <IndicatorBadge
            key={ind.name}
            name={ind.name}
            visible={ind.visible}
            onToggle={() => {
              setIndicators(prev => prev.map(i => i.name === ind.name ? { ...i, visible: !i.visible } : i))
            }}
            onRemove={() => {
              setIndicators(prev => prev.filter(i => i.name !== ind.name))
            }}
          />
        ))}
      </div>
      <div ref={container} style={{ width, height }} />
    </div>
  )
}
