import { create } from 'zustand';

interface UIState {
  quickAddVisible: boolean;
  setQuickAddVisible: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  quickAddVisible: false,
  setQuickAddVisible: (v) => set({ quickAddVisible: v }),
}));
