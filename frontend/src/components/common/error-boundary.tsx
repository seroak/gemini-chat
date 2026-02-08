import { Component, ErrorInfo, ReactNode } from 'react';
import Button from './button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary
 * - 자식 컴포넌트에서 발생한 렌더링 에러를 잡아서 폴백 UI를 표시
 * - 에러 정보를 콘솔에 로깅
 * - "다시 시도" 버튼으로 복구 시도
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 프로덕션에서는 에러 추적 서비스로 전송할 수 있음
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center px-4 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
            <svg
              className="h-8 w-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-100">
            오류가 발생했습니다
          </h2>
          <p className="mb-6 max-w-md text-sm text-gray-400">
            예기치 못한 오류가 발생했습니다. 다시 시도해주세요.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="mb-4 max-w-lg overflow-auto rounded-xl bg-red-500/5 border border-red-500/10 p-3 text-left text-xs text-red-400">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3">
            <Button variant="primary" onClick={this.handleReset}>
              다시 시도
            </Button>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              페이지 새로고침
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
