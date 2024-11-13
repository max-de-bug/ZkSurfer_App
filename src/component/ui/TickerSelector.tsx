import React from 'react';
import { useTickerStore } from '@/stores/ticker-store';

// const TickerSelector = ({ onClose }: { onClose: () => void }) => {
const TickerSelector = () => {
    const { availableTickers, setSelectedMemeTicker } = useTickerStore();

    const handleSelection = (index: number) => {
        const selectedTicker = availableTickers[index - 1];
        if (selectedTicker) {
            setSelectedMemeTicker(selectedTicker);
        }
        // onClose();
    };

    return (
        <div className="w-full max-w-2xl bg-[#171D3D] rounded-lg p-4 shadow-lg">
            <div className="mb-4 text-white font-semibold">Available Tickers:</div>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="text-left text-gray-400">
                        <th className="p-2">#</th>
                        <th className="p-2">Ticker</th>
                    </tr>
                </thead>
                <tbody>
                    {availableTickers.map((ticker, index) => (
                        <tr
                            key={index}
                            className="border-t border-gray-700 hover:bg-[#24284E] cursor-pointer"
                            onClick={() => handleSelection(index + 1)}
                        >
                            <td className="p-2 text-gray-400">{index + 1}</td>
                            <td className="p-2 text-white">{ticker}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-4 text-gray-400 text-sm">
                Enter /select [number] to choose a ticker
            </div>
        </div>
    );
};

export default TickerSelector;