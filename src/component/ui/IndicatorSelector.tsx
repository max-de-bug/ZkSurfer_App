import React, { useState } from 'react'

const indicators = [
    'SMA', 'EMA', 'RSI', 'MACD', 'Bollinger Bands', 'ATR',
    '52 Week High/Low', 'ADX', 'Aroon', 'Awesome Oscillator'
]

export const IndicatorSelector = ({ onSelect }: { onSelect: (id: string) => void }) => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')

    const filtered = indicators.filter(i => i.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="relative">
            <button onClick={() => setOpen(true)} className="bg-gray-700 px-4 py-2 rounded text-white">
                fx Indicators
            </button>

            {open && (
                <div className="absolute top-12 left-0 z-50 w-64 bg-black bg-opacity-80 backdrop-blur-lg p-4 rounded shadow-lg text-white">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold">Indicators</span>
                        <button onClick={() => setOpen(false)}>✕</button>
                    </div>
                    <input
                        placeholder="Search indicators..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full p-1 mb-3 bg-gray-800 text-white rounded border border-gray-600"
                    />
                    <div className="max-h-48 overflow-auto">
                        {filtered.map(ind => (
                            <div
                                key={ind}
                                onClick={() => {
                                    onSelect(ind)
                                    setOpen(false)
                                }}
                                className="hover:bg-gray-600 cursor-pointer p-1 rounded"
                            >
                                {ind}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
