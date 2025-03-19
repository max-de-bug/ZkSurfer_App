import { create } from 'zustand';

interface ModelState {
    selectedModel: 'DeepSeek' | 'Mistral';
    setSelectedModel: (model: 'DeepSeek' | 'Mistral') => void;
}

export const useModelStore = create<ModelState>((set) => ({
    selectedModel: 'Mistral',
    setSelectedModel: (model) => set({ selectedModel: model }),
}));
