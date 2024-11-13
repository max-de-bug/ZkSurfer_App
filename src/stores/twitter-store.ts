import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TwitterState {
    accessToken: string | null;
    accessSecret: string | null;
    setAccessToken: (token: string) => void;
    setAccessSecret: (secret: string) => void;
    clearCredentials: () => void;
}

export const useTwitterStore = create<TwitterState>()(
    persist(
        (set) => ({
            accessToken: null,
            accessSecret: null,
            setAccessToken: (token) => set({ accessToken: token }),
            setAccessSecret: (secret) => set({ accessSecret: secret }),
            clearCredentials: () => set({ accessToken: null, accessSecret: null }),
        }),
        {
            name: 'twitter-storage',
        }
    )
);