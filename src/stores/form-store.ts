// stores/form-store.ts
import { create } from 'zustand';

interface FormState {
    formData: {
        email: string;
        password: string;
        username: string;
        twofa: string;
    };
    error: string;
    success: boolean;
    setFormData: (data: Partial<FormState['formData']>) => void;
    setError: (msg: string) => void;
    setSuccess: (val: boolean) => void;
}

export const useFormStore = create<FormState>((set) => ({
    formData: { email: '', password: '', username: '', twofa: '' },
    error: '',
    success: false,
    setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
    setError: (msg) => set({ error: msg }),
    setSuccess: (val) => set({ success: val })
}));
