import { create } from 'zustand';

interface ModelState {
    selectedModel: 'DeepSeek' | 'Mistral';
    setSelectedModel: (model: 'DeepSeek' | 'Mistral') => void;
}

export const useModelStore = create<ModelState>((set) => ({
    selectedModel: 'DeepSeek',
    setSelectedModel: (model) => set({ selectedModel: model }),
}));
