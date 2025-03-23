import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user: User | null) => set(() => ({ user })),
}));

export function useAuth() {
  const { user, setUser } = useAuthStore();
  return { user, setUser };
} 