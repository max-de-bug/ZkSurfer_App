import { create } from 'zustand'

interface MemeStore {
  memeData: {
    name: string;
    description: string;
    prompt: string;
    base64Image: string;
    seed: string;
    wallet: string;
  } | null;
  setMemeData: (data: {
    name: string;
    description: string;
    prompt: string;
    base64Image: string;
    seed: string;
    wallet: string;
  }) => void;
  resetMemeData: () => void;
}

export const useMemeStore = create<MemeStore>((set) => ({
  memeData: null,
  setMemeData: (data) => set({ memeData: data }),
  resetMemeData: () => set({ memeData: null })
}));