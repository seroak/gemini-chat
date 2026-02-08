import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/protected-route';
import LoadingSpinner from '@/components/common/loading-spinner';
import ErrorBoundary from '@/components/common/error-boundary';
import { useAuthStore } from '@/stores/auth-store';
import * as authService from '@/services/auth-service';

// 코드 스플리팅을 위한 Lazy 로딩
const LoginPage = lazy(() => import('@/pages/login-page'));
const RegisterPage = lazy(() => import('@/pages/register-page'));
const ChatPage = lazy(() => import('@/pages/chat-page'));

const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

/**
 * 앱 시작 시 인증 상태를 초기화하는 컴포넌트
 * - localStorage에서 토큰 복원
 * - 토큰이 있으면 사용자 정보 조회
 * - 토큰이 없거나 만료되었으면 로딩 종료
 */
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { restoreToken, setAuth, logout } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = restoreToken();
      if (!token) {
        return; // restoreToken 내부에서 isLoading: false 설정됨
      }
      try {
        const user = await authService.getMe();
        setAuth(user, token);
      } catch {
        logout();
      }
    };
    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
};

const App = () => {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <AuthInitializer>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* 인증 페이지 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 보호된 페이지 */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:conversationId?"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* 기본 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      </AuthInitializer>
    </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
