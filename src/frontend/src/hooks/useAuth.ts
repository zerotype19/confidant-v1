import { StateCreator, create } from 'zustand';

interface User {
  sub: string;
  email: string;
  name?: string;
  auth_provider: string;
  auth_provider_id: string;
}

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

const useAuthStore = create<AuthStore>((set: StateCreator<AuthStore>) => ({
  user: null,
  setUser: (user: User | null) => set({ user }),
}));

export const useAuth = () => {
  const { user, setUser } = useAuthStore();
  return { user, setUser };
}; 