// 'use client';

// import { FC, useState, useCallback } from 'react';
// import { Search } from 'lucide-react';
// import { Card } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { CoinCard } from '@/component/ui/CoinCard';
// import { CoinDetail } from '@/component/ui/CoinDetails';
// import { Coin } from '@/types/marketplaceTypes';
// import { ArrowLeft } from 'lucide-react';

// const tags: string[] = ['DeFi', 'Gaming', 'NFT', 'Metaverse', 'Web3'];

// const MarketplacePage: FC = () => {
//     const [searchQuery, setSearchQuery] = useState<string>('');
//     const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
//     const [selectedTags, setSelectedTags] = useState<string[]>([]);

//     // Example data - replace with API data
//     const yourCoins: Coin[] = [
//         {
//             id: 1,
//             name: 'Freedom Bird',
//             marketCap: '34,656,614',
//             image: '/api/placeholder/40/40',
//             description: 'Freedom Bird description'
//         },
//         // Add more coins
//     ];

//     const listedCoins: Coin[] = [
//         {
//             id: 2,
//             name: 'Dev Bike',
//             marketCap: '12,345,678',
//             image: '/api/placeholder/40/40',
//             tags: ['DeFi'],
//             description: 'Dev Bike description'
//         },
//         // Add more coins
//     ];

//     const handleTagClick = useCallback((tag: string) => {
//         setSelectedTags(prev =>
//             prev.includes(tag)
//                 ? prev.filter(t => t !== tag)
//                 : [...prev, tag]
//         );
//     }, []);

//     const filteredCoins = listedCoins.filter(coin => {
//         const matchesSearch = coin.name.toLowerCase().includes(searchQuery.toLowerCase());
//         const matchesTags = selectedTags.length === 0 ||
//             (coin.tags && selectedTags.some(tag => coin.tags?.includes(tag)));
//         return matchesSearch && matchesTags;
//     });

//     if (selectedCoin) {
//         return <CoinDetail coin={selectedCoin} onBack={() => setSelectedCoin(null)} />;
//     }

//     return (
//         <div className="min-h-screen flex flex-col max-w-full mx-auto px-5 py-10 space-y-6 bg-[#000A19]">
//             <div className="flex items-center h-full gap-4 bg-[#000A19]">
//                 <button
//                     onClick={() => window.history.back()}
//                     className="text-blue-600 hover:text-blue-800"
//                     type="button"
//                 >
//                     <ArrowLeft size={20} />
//                 </button>
//                 <div className="relative flex-1">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                     <Input
//                         type="text"
//                         placeholder="Search memecoin"
//                         className="pl-10"
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                     />
//                 </div>
//             </div>

//             <div className="px-5">
//                 <h2 className="text-xl font-semibold mb-4 font-ttfirs text-[#fff]">Your Coins</h2>
//                 <div className="space-y-4">
//                     {yourCoins.map(coin => (
//                         <CoinCard
//                             key={coin.id}
//                             coin={coin}
//                             onClick={() => setSelectedCoin(coin)}
//                         />
//                     ))}
//                 </div>
//             </div>

//             <Separator />

//             <div className="px-5">
//                 <div className="flex flex-wrap gap-2 mb-4">
//                     {tags.map(tag => (
//                         <Badge
//                             key={tag}
//                             className="cursor-pointer bg-[#5D7285]"
//                             onClick={() => handleTagClick(tag)}
//                         >
//                             {tag}
//                         </Badge>
//                     ))}
//                 </div>

//                 <div className="space-y-4">
//                     {filteredCoins.map(coin => (
//                         <CoinCard
//                             key={coin.id}
//                             coin={coin}
//                             onClick={() => setSelectedCoin(coin)}
//                         />
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default MarketplacePage;

'use client';

import { FC, useState, useCallback, useEffect } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CoinCard } from '@/component/ui/CoinCard';
import { CoinDetail } from '@/component/ui/CoinDetails';
import { Coin, ApiCoin, ApiResponse } from '@/types/marketplaceTypes';
import { useWallet } from '@solana/wallet-adapter-react';

const tags: string[] = ['DeFi', 'Gaming', 'NFT', 'Metaverse', 'Web3'];

const MarketplacePage: FC = () => {
    const wallet = useWallet();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allCoins, setAllCoins] = useState<Coin[]>([]);
    const [memeCoins, setMemeCoins] = useState<Coin[]>([]);

    // Convert API coin format to UI coin format
    const convertApiCoinToUiCoin = (apiCoin: ApiCoin): Coin => ({
        id: apiCoin._id,
        name: apiCoin.coin_name,
        symbol: apiCoin.ticker,
        description: apiCoin.description,
        // image: apiCoin.image_base64,
        image: apiCoin.image_base64.startsWith('data:image/png;base64,')
            ? apiCoin.image_base64
            : `data:image/png;base64,${apiCoin.image_base64}`,
        address: apiCoin.memecoin_address,
        marketCap: undefined
    });

    useEffect(() => {
        const fetchCoins = async () => {
            if (!wallet.publicKey) {
                setError('Please connect your wallet.');
                setIsLoading(false);
                return;
            }
            try {
                const response = await fetch('https://zynapse.zkagi.ai/api/coins', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': 'zk-123321'
                    }
                });

                if (!response.ok) {
                    throw new Error(`API call failed: ${response.statusText}`);
                }

                const data: ApiResponse = await response.json();

                if (data.success) {
                    // Convert all coins to UI format
                    const convertedCoins = data.data.map(convertApiCoinToUiCoin);
                    console.log('wallet.publicKey?.toString()', wallet.publicKey?.toString())

                    // Filter memecoins (coins with valid memecoin_address)
                    // const validMemecoins = convertedCoins.filter(coin =>
                    //     coin.address &&
                    //     coin.address !== "0x1234567890abcdef" &&
                    //     wallet.publicKey?.toString() === coin.address
                    // );
                    const validMemecoins = convertedCoins.filter(coin => {
                        console.log('Checking coin:', coin); // Log each coin
                        return (
                            coin.address &&
                            coin.address !== "0x1234567890abcdef" &&
                            wallet.publicKey?.toString() === coin.address
                        );
                    });


                    setAllCoins(convertedCoins);
                    setMemeCoins(validMemecoins);
                } else {
                    throw new Error('API returned unsuccessful response');
                }
            } catch (err) {
                console.error('Error fetching coins:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch coins');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCoins();
    }, []);

    const handleTagClick = useCallback((tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    }, []);

    const filteredMemeCoins = memeCoins.filter(coin => {
        const matchesSearch = coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTags = selectedTags.length === 0;
        return matchesSearch && matchesTags;
    });

    const filteredOtherCoins = allCoins
        .filter(coin => !memeCoins.some(memeCoin => memeCoin.id === coin.id))
        .filter(coin => {
            const matchesSearch = coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTags = selectedTags.length === 0;
            return matchesSearch && matchesTags;
        });

    if (selectedCoin) {
        return <CoinDetail coin={selectedCoin} onBack={() => setSelectedCoin(null)} />;
    }

    return (
        <div className="min-h-screen flex flex-col max-w-full mx-auto px-5 py-10 space-y-6 bg-[#000A19]">
            <div className="flex items-center h-full gap-4 bg-[#000A19]">
                <button
                    onClick={() => window.history.back()}
                    className="text-white hover:text-blue-800"
                    type="button"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="bg-gradient-to-tr from-[#000D33] via-[#582CFF] to-[#9a9a9a] flex flex-col w-full rounded-xl">
                    <div className="h-full bg-[#0F132C] m-0.5 rounded-xl py-1 flex flex-col justify-between">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <Input
                                type="text"
                                placeholder="Search for AI Coins Created on ZkTerminal"
                                className="pl-10 !text-white placeholder-gray-400 focus:outline-none bg-transparent"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>



            {isLoading ? (
                <div className="text-center text-white">Loading coins...</div>
            ) : error ? (
                <div className="text-center text-red-500">{error}</div>
            ) : (
                <>
                    {/* <div className="px-5">
                        <h2 className="text-xl font-semibold mb-4 font-ttfirs text-[#fff]">Meme Coins</h2>
                        <div className="space-y-4">
                            {filteredMemeCoins.map(coin => (
                                <CoinCard
                                    key={coin.id}
                                    coin={coin}
                                    onClick={() => setSelectedCoin(coin)}
                                />
                            ))}
                        </div>
                    </div>

                    <Separator /> */}

                    <div className="px-5">
                        <h2 className="text-xl font-semibold mb-4 font-ttfirs text-[#fff]">AI Coins</h2>
                        {/* <div className="flex flex-wrap gap-2 mb-4">
                            {tags.map(tag => (
                                <Badge
                                    key={tag}
                                    className={`cursor-pointer ${selectedTags.includes(tag)
                                        ? 'bg-blue-600'
                                        : 'bg-[#5D7285]'
                                        }`}
                                    onClick={() => handleTagClick(tag)}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div> */}

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredOtherCoins.map(coin => (
                                <CoinCard
                                    key={coin.id}
                                    coin={coin}
                                // onClick={() => setSelectedCoin(coin)}
                                />
                            ))}
                        </div>

                    </div>
                </>
            )}
        </div>
    );
};

export default MarketplacePage;