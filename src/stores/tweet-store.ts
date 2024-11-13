import { create } from 'zustand';

// Twitter credentials store
interface TwitterStore {
    accessToken: string;
    accessTokenSecret: string;
    setCredentials: (token: string, secret: string) => void;
}

export const useTwitterStore = create<TwitterStore>((set) => ({
    accessToken: '',
    accessTokenSecret: '',
    setCredentials: (token, secret) => set({ accessToken: token, accessTokenSecret: secret }),
}));

// Ticker store
interface TickerStore {
    selectedMemeTicker: string | null;
    setSelectedMemeTicker: (ticker: string) => void;
}

export const useTickerStore = create<TickerStore>((set) => ({
    selectedMemeTicker: null,
    setSelectedMemeTicker: (ticker) => set({ selectedMemeTicker: ticker }),
}));