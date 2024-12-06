interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string | ReactNode;
    type?: string; // Add optional fields as needed
}

import { create } from 'zustand';
import { ReactNode } from 'react';

interface ConversationState {
    messages: Message[];
    addMessage: (msg: Message) => void;
    setMessages: (msgs: Message[]) => void;
    clearMessages: () => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
    messages: [],
    addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
    setMessages: (msgs) => set({ messages: msgs }),
    clearMessages: () => set({ messages: [] }),
}));