'use client';
import { FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Coin } from '@/types/marketplaceTypes';

interface CoinCardProps {
    coin: Coin;
    onClick: () => void;
}

export const CoinCard: FC<CoinCardProps> = ({ coin, onClick }) => (
    <Card
        className="w-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={onClick}
    >
        <CardContent className="flex items-center gap-4 p-4">
            <div className="relative w-10 h-10">
                <Image
                    src={coin.image || "/api/placeholder/40/40"}
                    alt={coin.name}
                    className="rounded-full"
                    width={40}
                    height={40}
                />
            </div>
            <div className="flex-1">
                <h3 className="font-semibold">{coin.name}</h3>
                <p className="text-sm text-gray-500">Market Cap: ${coin.marketCap}</p>
            </div>
        </CardContent>
    </Card>
);