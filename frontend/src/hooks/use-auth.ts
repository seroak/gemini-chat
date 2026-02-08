import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import * as authService from '@/services/auth-service';

interface UseAuthReturn {
  user: ReturnType<typeof useAuthStore.getState>['user'];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

/**
 * 인증 커스텀 훅
 * - 로그인, 회원가입, 로그아웃 함수 제공
 * - 로딩/에러 상태 관리
 * - 주의: 토큰 복원/초기화는 App.tsx의 AuthInitializer에서 처리
 */
export const useAuth = (): UseAuthReturn => {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading: storeLoading,
    setAuth,
    logout: storeLogout,
  } = useAuthStore();

  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      setActionLoading(true);
      try {
        const result = await authService.login({ email, password });
        setAuth(result.user, result.accessToken);
        navigate('/');
      } catch (err: unknown) {
        const message = extractErrorMessage(err, '로그인에 실패했습니다');
        setError(message);
        throw new Error(message);
      } finally {
        setActionLoading(false);
      }
    },
    [setAuth, navigate],
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      setError(null);
      setActionLoading(true);
      try {
        const result = await authService.register({ email, password, name });
        setAuth(result.user, result.accessToken);
        navigate('/');
      } catch (err: unknown) {
        const message = extractErrorMessage(err, '회원가입에 실패했습니다');
        setError(message);
        throw new Error(message);
      } finally {
        setActionLoading(false);
      }
    },
    [setAuth, navigate],
  );

  const logout = useCallback(() => {
    storeLogout();
    navigate('/login');
  }, [storeLogout, navigate]);

  return {
    user,
    isAuthenticated,
    isLoading: storeLoading || actionLoading,
    error,
    login,
    register,
    logout,
  };
};

function extractErrorMessage(err: unknown, fallback: string): string {
  if (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    typeof (err as Record<string, unknown>).response === 'object'
  ) {
    const response = (err as { response: { data?: { message?: string | string[] } } }).response;
    const message = response.data?.message;
    if (Array.isArray(message)) {
      return message[0];
    }
    if (typeof message === 'string') {
      return message;
    }
  }
  return fallback;
}
