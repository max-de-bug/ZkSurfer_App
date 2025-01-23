import { ReactNode } from "react";

export interface Coin {
    marketCap: ReactNode;
    id: string;  // Changed from number to string
    name: string;
    symbol: string;
    description: string;
    image: string;
    address?: string;
}

// API response interface
export interface ApiCoin {
    _id: string;
    coin_name: string;
    ticker: string;
    description: string;
    image_base64: string;
    memecoin_address?: string;
}

export interface ApiResponse {
    success: boolean;
    data: ApiCoin[];
    pagination: {
        totalCoins: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
}