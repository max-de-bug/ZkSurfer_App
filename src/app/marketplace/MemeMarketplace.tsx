'use client';

import { FC, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CoinCard } from '@/component/ui/CoinCard';
import { CoinDetail } from '@/component/ui/CoinDetails';
import { Coin } from '@/types/marketplaceTypes';
import { ArrowLeft } from 'lucide-react';

const tags: string[] = ['DeFi', 'Gaming', 'NFT', 'Metaverse', 'Web3'];

const MarketplacePage: FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Example data - replace with API data
    const yourCoins: Coin[] = [
        {
            id: 1,
            name: 'Freedom Bird',
            marketCap: '34,656,614',
            image: '/api/placeholder/40/40',
            description: 'Freedom Bird description'
        },
        // Add more coins
    ];

    const listedCoins: Coin[] = [
        {
            id: 2,
            name: 'Dev Bike',
            marketCap: '12,345,678',
            image: '/api/placeholder/40/40',
            tags: ['DeFi'],
            description: 'Dev Bike description'
        },
        // Add more coins
    ];

    const handleTagClick = useCallback((tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    }, []);

    const filteredCoins = listedCoins.filter(coin => {
        const matchesSearch = coin.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTags = selectedTags.length === 0 ||
            (coin.tags && selectedTags.some(tag => coin.tags?.includes(tag)));
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
                    className="text-blue-600 hover:text-blue-800"
                    type="button"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                        type="text"
                        placeholder="Search memecoin"
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="px-5">
                <h2 className="text-xl font-semibold mb-4 font-ttfirs text-[#fff]">Your Coins</h2>
                <div className="space-y-4">
                    {yourCoins.map(coin => (
                        <CoinCard
                            key={coin.id}
                            coin={coin}
                            onClick={() => setSelectedCoin(coin)}
                        />
                    ))}
                </div>
            </div>

            <Separator />

            <div className="px-5">
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map(tag => (
                        <Badge
                            key={tag}
                            className="cursor-pointer bg-[#5D7285]"
                            onClick={() => handleTagClick(tag)}
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>

                <div className="space-y-4">
                    {filteredCoins.map(coin => (
                        <CoinCard
                            key={coin.id}
                            coin={coin}
                            onClick={() => setSelectedCoin(coin)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MarketplacePage;