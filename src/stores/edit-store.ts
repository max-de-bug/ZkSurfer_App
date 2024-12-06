// import { create } from 'zustand';

// interface CharacterState {
//     editMode: boolean;
//     chatMessages: any[];
//     toggleEditMode: () => void;
//     setChatMessages: (messages: any[]) => void;
// }

// export const useCharacterStore = create<CharacterState>((set) => ({
//     editMode: false,
//     chatMessages: [],
//     toggleEditMode: () => set((state) => ({ editMode: !state.editMode })),
//     setChatMessages: (messages) => set({ chatMessages: messages }),
// }));


// stores/character-edit-store.ts
import { create } from 'zustand';

interface CharacterEditState {
    editMode: boolean;
    setEditMode: (value: boolean) => void;
}

export const useCharacterEditStore = create<CharacterEditState>((set) => ({
    editMode: false,
    setEditMode: (value) => set({ editMode: value }),
}));
