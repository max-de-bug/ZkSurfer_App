import React from 'react';

interface Coin {
    _id: string;
    coin_name: string;
}

const LaunchCoinSelector = ({
    availableCoins,
    onLaunchCoin,
}: {
    availableCoins: Coin[];
    onLaunchCoin: (id: string) => void;
}) => {
    const handleSelection = (index: number) => {
        const selectedCoin = availableCoins[index - 1];
        if (selectedCoin) {
            onLaunchCoin(selectedCoin._id);
        }
    };

    return (
        <div className="w-full max-w-2xl bg-[#171D3D] rounded-lg p-4 shadow-lg">
            <div className="mb-4 text-white font-semibold">Available Coins:</div>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="text-left text-gray-400">
                        <th className="p-2">#</th>
                        <th className="p-2">Coin Name</th>
                        <th className="p-2">ID</th>
                    </tr>
                </thead>
                <tbody>
                    {availableCoins.map((coin, index) => (
                        <tr
                            key={coin._id}
                            className="border-t border-gray-700 hover:bg-[#24284E] cursor-pointer"
                            onClick={() => handleSelection(index + 1)}
                        >
                            <td className="p-2 text-gray-400">{index + 1}</td>
                            <td className="p-2 text-white">{coin.coin_name}</td>
                            <td className="p-2 text-gray-400">{coin._id}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-4 text-gray-400 text-sm">
                Click on a coin to launch it
            </div>
        </div>
    );
};

export default LaunchCoinSelector;
