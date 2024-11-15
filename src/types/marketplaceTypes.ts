export interface Coin {
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
}