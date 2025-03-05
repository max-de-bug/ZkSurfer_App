import { create } from 'zustand';

interface TwitterAuthState {
    username: string;
    email: string;
    password: string;
    twofa: string;
    setTwitterCredentials: (credentials: Partial<Omit<TwitterAuthState, 'setTwitterCredentials'>>) => void;
}

export const useTwitterAuthStore = create<TwitterAuthState>((set) => ({
    username: '',
    email: '',
    password: '',
    twofa: '',
    setTwitterCredentials: (credentials) =>
        set((state) => ({
            ...state,
            ...credentials,
        })),
}));
