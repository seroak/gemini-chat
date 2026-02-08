import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './auth-store';

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AuthStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  describe('setAuth', () => {
    it('사용자 정보와 토큰을 설정하고 인증 상태를 true로 변경한다', () => {
      const mockUser = { id: '1', email: 'test@example.com', name: '테스트', createdAt: new Date(), updatedAt: new Date() };
      const mockToken = 'jwt.token.here';

      useAuthStore.getState().setAuth(mockUser, mockToken);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', mockToken);
    });
  });

  describe('setUser', () => {
    it('사용자 정보만 업데이트한다', () => {
      const mockUser = { id: '1', email: 'test@example.com', name: '변경됨', createdAt: new Date(), updatedAt: new Date() };

      useAuthStore.getState().setUser(mockUser);

      expect(useAuthStore.getState().user).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('모든 인증 상태를 초기화하고 토큰을 제거한다', () => {
      const mockUser = { id: '1', email: 'test@example.com', name: '테스트', createdAt: new Date(), updatedAt: new Date() };
      useAuthStore.getState().setAuth(mockUser, 'token');

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('restoreToken', () => {
    it('localStorage에 토큰이 있으면 복원하고 반환한다', () => {
      localStorageMock.getItem.mockReturnValueOnce('saved-token');

      const token = useAuthStore.getState().restoreToken();

      expect(token).toBe('saved-token');
      expect(useAuthStore.getState().token).toBe('saved-token');
      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it('localStorage에 토큰이 없으면 null을 반환하고 로딩을 종료한다', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const token = useAuthStore.getState().restoreToken();

      expect(token).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});
