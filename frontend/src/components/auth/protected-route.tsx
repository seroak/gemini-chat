import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import LoadingSpinner from '@/components/common/loading-spinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * 인증 필요 라우트 래퍼
 * - 미인증 시 로그인 페이지 리다이렉트
 * - 토큰 복원 중 로딩 표시
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
