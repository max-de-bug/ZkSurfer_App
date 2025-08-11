// 'use client'
// import React, { useState } from 'react'
// import { useTradingStore } from '@/stores/trading-store';
// import { ChevronDown } from 'lucide-react'

// const assets = ['Bitcoin', 'Ethereum', 'Solana', 'Cardano'] as const;
// type Asset = typeof assets[number];

// interface PredictionPanelProps {
//     className?: string;
// }

// const PredictionPanel: React.FC<PredictionPanelProps> = ({ className }) => {
//     const {
//         currentAsset,
//         currentPrice,
//         prediction,
//         setDirection,
//         setEntryPrice,
//         setStopLoss,
//         setTakeProfit,
//         placePrediction,
//         resetPrediction
//     } = useTradingStore()

//     const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState<boolean>(false)

//     const handleInputChange = (field: 'entryPrice' | 'stopLoss' | 'takeProfit', value: string): void => {
//         switch (field) {
//             case 'entryPrice':
//                 setEntryPrice(value)
//                 break
//             case 'stopLoss':
//                 setStopLoss(value)
//                 break
//             case 'takeProfit':
//                 setTakeProfit(value)
//                 break
//         }
//     }

//     const handleAssetSelect = (asset: Asset): void => {
//         setIsAssetDropdownOpen(false)
//         // You can add asset switching logic here
//         console.log(`Selected asset: ${asset}`)
//     }

//     return (
//         <div className={`bg-gray-900 text-white p-6 rounded-lg w-80 h-full space-y-4 ${className || ''}`}>
//             <h2 className="text-xl font-semibold">New Prediction</h2>

//             {/* Asset Selector */}
//             <div className="space-y-2">
//                 <label className="text-sm text-gray-400">Asset</label>
//                 <div className="relative">
//                     <button
//                         onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
//                         className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-left flex items-center justify-between hover:bg-gray-750 transition-colors"
//                         type="button"
//                     >
//                         <span>{currentAsset}</span>
//                         <ChevronDown className={`w-4 h-4 transition-transform ${isAssetDropdownOpen ? 'rotate-180' : ''}`} />
//                     </button>

//                     {isAssetDropdownOpen && (
//                         <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
//                             {assets.map((asset) => (
//                                 <button
//                                     key={asset}
//                                     className="w-full px-4 py-3 text-left hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
//                                     onClick={() => handleAssetSelect(asset)}
//                                     type="button"
//                                 >
//                                     {asset}
//                                 </button>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Direction Buttons */}
//             <div className="flex space-x-2">
//                 <button
//                     onClick={() => setDirection('Long')}
//                     className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${prediction.direction === 'Long'
//                         ? 'bg-blue-600 text-white'
//                         : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
//                         }`}
//                     type="button"
//                 >
//                     Long
//                 </button>
//                 <button
//                     onClick={() => setDirection('Short')}
//                     className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${prediction.direction === 'Short'
//                         ? 'bg-red-600 text-white'
//                         : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
//                         }`}
//                     type="button"
//                 >
//                     Short
//                 </button>
//             </div>

//             {/* Entry Price */}
//             <div className="space-y-2">
//                 <label className="text-sm text-gray-400">Entry Price</label>
//                 <input
//                     type="number"
//                     value={prediction.entryPrice}
//                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('entryPrice', e.target.value)}
//                     className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
//                     placeholder="38,500"
//                 />
//             </div>

//             {/* Stop Loss and Take Profit */}
//             <div className="flex space-x-4">
//                 <div className="flex-1 space-y-2">
//                     <label className="text-sm text-gray-400">Stop Loss</label>
//                     <input
//                         type="number"
//                         value={prediction.stopLoss}
//                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('stopLoss', e.target.value)}
//                         className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none"
//                         placeholder="38,000"
//                     />
//                 </div>
//                 <div className="flex-1 space-y-2">
//                     <label className="text-sm text-gray-400">Take Profit</label>
//                     <input
//                         type="number"
//                         value={prediction.takeProfit}
//                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('takeProfit', e.target.value)}
//                         className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
//                         placeholder="41,500"
//                     />
//                 </div>
//             </div>

//             {/* Place Prediction Button */}
//             <button
//                 onClick={placePrediction}
//                 disabled={prediction.isActive}
//                 className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${prediction.isActive
//                     ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
//                     : 'bg-blue-600 hover:bg-blue-700 text-white'
//                     }`}
//                 type="button"
//             >
//                 {prediction.isActive ? 'Prediction Active' : 'Place Prediction'}
//             </button>

//             {/* Reset Button (when prediction is active) */}
//             {prediction.isActive && (
//                 <button
//                     onClick={resetPrediction}
//                     className="w-full py-2 px-4 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
//                     type="button"
//                 >
//                     Reset Prediction
//                 </button>
//             )}
//         </div>
//     )
// }

// export default PredictionPanel

'use client'
import React, { useState } from 'react'
import { useTradingStore } from '@/stores/trading-store';
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

const assets = ['Bitcoin', 'Ethereum', 'Solana', 'Cardano'] as const;
type Asset = typeof assets[number];

interface PredictionPanelProps {
  className?: string;
}

type Step = 1 | 2;

const PredictionPanel: React.FC<PredictionPanelProps> = ({ className }) => {
  const {
    currentAsset,
    prediction,
    setDirection,
    setEntryPrice,
    setStopLoss,
    setTakeProfit,
    placePrediction,
    resetPrediction
  } = useTradingStore()

  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState<boolean>(false)

  const handleInputChange = (field: 'entryPrice' | 'stopLoss' | 'takeProfit', value: string): void => {
    switch (field) {
      case 'entryPrice':
        setEntryPrice(value); break;
      case 'stopLoss':
        setStopLoss(value); break;
      case 'takeProfit':
        setTakeProfit(value); break;
    }
  }

  const handleAssetSelect = (asset: Asset): void => {
    setIsAssetDropdownOpen(false)
    console.log(`Selected asset: ${asset}`)
  }

  // -------------------------------
  // Copy ZkAGI Trade – wizard state
  // -------------------------------
  const [showCopyWizard, setShowCopyWizard] = useState(false)
  const [step, setStep] = useState<Step>(1)
  const [submitting, setSubmitting] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  const [creds, setCreds] = useState({
    wallet: '',
    apiKey: '',
    apiSecret: ''
  })

  const [cfg, setCfg] = useState({
    aumPct: '',              // % of portfolio used for AUM
    pctPerTrade: '',         // % of AUM per trade
    maxDailyLossUsd: '',     // $
    maxLossPerTradeUsd: '',  // $
    expectedDailyProfitUsd: '',
    useLeverage: true,
    levMin: 5,
    levMax: 20,
  })

  const percentOk = (v: string) => {
    const n = Number(v)
    return Number.isFinite(n) && n >= 0 && n <= 100
  }
  const positiveUsdOk = (v: string) => {
    const n = Number(v)
    return Number.isFinite(n) && n >= 0
  }

  const step1Valid =
    creds.wallet.trim() &&
    creds.apiKey.trim() &&
    creds.apiSecret.trim()

  const step2Valid =
    percentOk(cfg.aumPct) &&
    percentOk(cfg.pctPerTrade) &&
    positiveUsdOk(cfg.maxDailyLossUsd) &&
    positiveUsdOk(cfg.maxLossPerTradeUsd) &&
    positiveUsdOk(cfg.expectedDailyProfitUsd) &&
    (!cfg.useLeverage || (cfg.levMin > 0 && cfg.levMax >= cfg.levMin))

  async function handleEnableCopy() {
    if (!step1Valid || !step2Valid) return
    setSubmitting(true)
    try {
      // 🔐 IMPORTANT: send to a server route that stores these securely (DB/KMS),
      // never localStorage.
      const res = await fetch('/api/copy-trade/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creds, cfg })
      })

      if (!res.ok) throw new Error('Setup failed')
      // optional: toast
      setShowCopyWizard(false)
    } catch (e) {
      console.error(e)
      alert('Failed to enable copy trading. Check server logs.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={clsx('bg-gray-900 text-white p-6 rounded-lg w-80 h-full space-y-4', className)}>
      {/* =============== Copy ZkAGI Trade card =============== */}
      <div className="rounded-lg border border-gray-700 bg-gray-850 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Copy ZkAGI Trade</h3>
            <p className="text-xs text-gray-400">
              Mirror our signals with your limits and leverage rules.
            </p>
          </div>
          {!showCopyWizard && (
            <button
              onClick={() => { setShowCopyWizard(true); setStep(1); }}
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold"
            >
              Copy
            </button>
          )}
        </div>

        {showCopyWizard && (
          <div className="mt-4 space-y-3">
            {/* Stepper */}
            <div className="flex items-center text-xs">
              <div className={clsx('px-2 py-1 rounded', step === 1 ? 'bg-blue-600' : 'bg-gray-700')}>1. Secrets</div>
              <div className="mx-2 h-px flex-1 bg-gray-700" />
              <div className={clsx('px-2 py-1 rounded', step === 2 ? 'bg-blue-600' : 'bg-gray-700')}>2. Risk Config</div>
            </div>

            {step === 1 && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">HyperLiquid Wallet Address</label>
                  <input
                    value={creds.wallet}
                    onChange={e => setCreds(s => ({ ...s, wallet: e.target.value.trim() }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                    placeholder="0x…"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Hyperliquid API Key</label>
                  <input
                    value={creds.apiKey}
                    onChange={e => setCreds(s => ({ ...s, apiKey: e.target.value.trim() }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                    placeholder="hlpk_********"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Hyperliquid API Private Key</label>
                  <div className="flex gap-2">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={creds.apiSecret}
                      onChange={e => setCreds(s => ({ ...s, apiSecret: e.target.value }))}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(v => !v)}
                      className="px-2 text-xs rounded bg-gray-700 hover:bg-gray-600"
                    >
                      {showSecret ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="flex-1 px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm"
                    onClick={() => setShowCopyWizard(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-sm"
                    disabled={!step1Valid}
                    onClick={() => setStep(2)}
                    type="button"
                  >
                    Next
                  </button>
                </div>
                <p className="text-[10px] text-gray-500">
                  We’ll send these to a secure TEE storage.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">% of Portfolio (AUM)</label>
                    <input
                      inputMode="decimal"
                      value={cfg.aumPct}
                      onChange={e => setCfg(s => ({ ...s, aumPct: e.target.value }))}
                      className={clsx(
                        'w-full bg-gray-800 border rounded px-3 py-2 text-sm',
                        percentOk(cfg.aumPct) ? 'border-gray-700' : 'border-red-600'
                      )}
                      placeholder="e.g. 50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">% of AUM per Trade</label>
                    <input
                      inputMode="decimal"
                      value={cfg.pctPerTrade}
                      onChange={e => setCfg(s => ({ ...s, pctPerTrade: e.target.value }))}
                      className={clsx(
                        'w-full bg-gray-800 border rounded px-3 py-2 text-sm',
                        percentOk(cfg.pctPerTrade) ? 'border-gray-700' : 'border-red-600'
                      )}
                      placeholder="e.g. 2"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Max Daily Loss ($)</label>
                    <input
                      inputMode="decimal"
                      value={cfg.maxDailyLossUsd}
                      onChange={e => setCfg(s => ({ ...s, maxDailyLossUsd: e.target.value }))}
                      className={clsx(
                        'w-full bg-gray-800 border rounded px-3 py-2 text-sm',
                        positiveUsdOk(cfg.maxDailyLossUsd) ? 'border-gray-700' : 'border-red-600'
                      )}
                      placeholder="e.g. 100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Max Loss per Trade ($)</label>
                    <input
                      inputMode="decimal"
                      value={cfg.maxLossPerTradeUsd}
                      onChange={e => setCfg(s => ({ ...s, maxLossPerTradeUsd: e.target.value }))}
                      className={clsx(
                        'w-full bg-gray-800 border rounded px-3 py-2 text-sm',
                        positiveUsdOk(cfg.maxLossPerTradeUsd) ? 'border-gray-700' : 'border-red-600'
                      )}
                      placeholder="e.g. 25"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-xs text-gray-400">Expected Daily Profit ($)</label>
                    <input
                      inputMode="decimal"
                      value={cfg.expectedDailyProfitUsd}
                      onChange={e => setCfg(s => ({ ...s, expectedDailyProfitUsd: e.target.value }))}
                      className={clsx(
                        'w-full bg-gray-800 border rounded px-3 py-2 text-sm',
                        positiveUsdOk(cfg.expectedDailyProfitUsd) ? 'border-gray-700' : 'border-red-600'
                      )}
                      placeholder="e.g. 150"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">Use Leverage?</label>
                  <button
                    onClick={() => setCfg(s => ({ ...s, useLeverage: !s.useLeverage }))}
                    className={clsx(
                      'px-3 py-1 rounded text-sm',
                      cfg.useLeverage ? 'bg-emerald-600' : 'bg-gray-700'
                    )}
                    type="button"
                  >
                    {cfg.useLeverage ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {cfg.useLeverage && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Leverage Min (x)</label>
                      <input
                        type="number"
                        min={1}
                        value={cfg.levMin}
                        onChange={e => setCfg(s => ({ ...s, levMin: Number(e.target.value) }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Leverage Max (x)</label>
                      <input
                        type="number"
                        min={cfg.levMin}
                        value={cfg.levMax}
                        onChange={e => setCfg(s => ({ ...s, levMax: Number(e.target.value) }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <p className="col-span-2 text-[10px] text-gray-500">
                      We’ll clamp dynamic leverage to this range.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    className="flex-1 px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm"
                    onClick={() => setStep(1)}
                    type="button"
                  >
                    Back
                  </button>
                  <button
                    className="flex-1 px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-sm"
                    disabled={!step2Valid || submitting}
                    onClick={handleEnableCopy}
                    type="button"
                  >
                    {submitting ? 'Enabling…' : 'Enable Copy Trading'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* =============== /Copy ZkAGI Trade card =============== */}

      {/* <h2 className="text-xl font-semibold">New Prediction</h2> */}

      {/* Asset Selector */}
   {/* <div className="space-y-2">
        <label className="text-sm text-gray-400">Asset</label>
        <div className="relative">
          <button
            onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-left flex items-center justify-between hover:bg-gray-750 transition-colors"
            type="button"
          >
            <span>{currentAsset}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isAssetDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isAssetDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
              {assets.map((asset) => (
                <button
                  key={asset}
                  className="w-full px-4 py-3 text-left hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                  onClick={() => handleAssetSelect(asset)}
                  type="button"
                >
                  {asset}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>  */}

      {/* Direction Buttons */}
       {/* <div className="flex space-x-2">
        <button
          onClick={() => setDirection('Long')}
          className={clsx(
            'flex-1 py-3 px-4 rounded-lg font-medium transition-colors',
            prediction.direction === 'Long' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          )}
          type="button"
        >
          Long
        </button>
        <button
          onClick={() => setDirection('Short')}
          className={clsx(
            'flex-1 py-3 px-4 rounded-lg font-medium transition-colors',
            prediction.direction === 'Short' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          )}
          type="button"
        >
          Short
        </button>
      </div>  */}

      {/* Entry Price */}
      {/* <div className="space-y-2">
        <label className="text-sm text-gray-400">Entry Price</label>
        <input
          type="number"
          value={prediction.entryPrice}
          onChange={(e) => handleInputChange('entryPrice', e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
          placeholder="38,500"
        />
      </div> */}

      {/* Stop Loss and Take Profit */}
    {/* <div className="flex space-x-4">
        <div className="flex-1 space-y-2">
          <label className="text-sm text-gray-400">Stop Loss</label>
          <input
            type="number"
            value={prediction.stopLoss}
            onChange={(e) => handleInputChange('stopLoss', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none"
            placeholder="38,000"
          />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-sm text-gray-400">Take Profit</label>
          <input
            type="number"
            value={prediction.takeProfit}
            onChange={(e) => handleInputChange('takeProfit', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
            placeholder="41,500"
          />
        </div>
      </div>   */}

      {/* Place Prediction Button */}
  {/* <button
        onClick={placePrediction}
        disabled={prediction.isActive}
        className={clsx(
          'w-full py-3 px-4 rounded-lg font-medium transition-colors',
          prediction.isActive ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
        )}
        type="button"
      >
        {prediction.isActive ? 'Prediction Active' : 'Place Prediction'}
      </button> */}

      {/* Reset Button (when prediction is active) */}
      {/* {prediction.isActive && (
        <button
          onClick={resetPrediction}
          className="w-full py-2 px-4 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          type="button"
        >
          Reset Prediction
        </button>
      )} */}
    </div> 
  )
}

export default PredictionPanel
