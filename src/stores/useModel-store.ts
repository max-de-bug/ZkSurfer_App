// import { create } from 'zustand';

// interface ModelState {
//     selectedModel: 'DeepSeek' | 'Mistral';
//     setSelectedModel: (model: 'DeepSeek' | 'Mistral') => void;
// }

// export const useModelStore = create<ModelState>((set) => ({
//     selectedModel: 'Mistral',
//     setSelectedModel: (model) => set({ selectedModel: model }),
// }));


import { create } from 'zustand';

type ModelName = 'DeepSeek' | 'Mistral';

interface ModelState {
    selectedModel: ModelName;
    credits: number;
    apiKey: string;
    setSelectedModel: (model: ModelName) => void;
    setCredits: (credits: number) => void;
    setApiKey: (apiKey: string) => void;
}

export const useModelStore = create<ModelState>((set) => ({
    // keep your default model
    selectedModel: 'Mistral',

    // new defaults
    credits: 0,
    apiKey: '',

    // existing setter
    setSelectedModel: (model) => set({ selectedModel: model }),

    // new setters
    setCredits: (credits) => set({ credits }),
    setApiKey: (apiKey) => set({ apiKey }),
}));
