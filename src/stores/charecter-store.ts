import { create } from 'zustand';

interface CharacterState {
    characterJson: any | null;
    setCharacterJson: (json: any) => void;
}

export const useCharacterStore = create<CharacterState>((set) => ({
    characterJson: null,
    setCharacterJson: (json) => set({ characterJson: json }),
}));
