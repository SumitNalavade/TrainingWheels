import { create } from "zustand";

export interface User {
    id: string
    name: string
    email: string
}

interface AppState {
  user: User | null;
  setUser: (user : User | null) => void
}

const useAppStore = create<AppState>()((set) => ({
    user: null,
    setUser: (user) => set(() => ({ user })),
}));

export default useAppStore;