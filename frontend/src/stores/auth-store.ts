import { create } from 'zustand';
import { User } from '@shared/index';

const TOKEN_KEY = 'auth_token';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  restoreToken: () => string | null;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  // 상태
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  // 액션
  setAuth: (user: User, token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setUser: (user: User) => {
    set({ user });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  restoreToken: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      set({ token, isLoading: true });
    } else {
      set({ isLoading: false });
    }
    return token;
  },
}));
