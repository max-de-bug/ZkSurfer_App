export interface Coin {
    id: number;
    name: string;
    marketCap: string;
    image: string;
    description?: string;
    tags?: string[];
    price?: string;
}