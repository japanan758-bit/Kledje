import { create } from 'zustand';
import { AuthUser } from '../types';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (user: AuthUser, isAdmin?: boolean) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAdmin: false,
  login: (user, isAdmin = false) => set({ user, isAdmin, loading: false }),
  logout: () => set({ user: null, isAdmin: false }),
  setLoading: (loading) => set({ loading }),
}));
