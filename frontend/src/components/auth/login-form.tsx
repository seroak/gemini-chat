import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import { useAuth } from '@/hooks/use-auth';

/**
 * 로그인 폼 컴포넌트
 * - 이메일/비밀번호 입력
 * - 유효성 검사
 * - 에러 메시지 표시
 * - 로딩 상태
 */
const LoginForm = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!password) {
      errors.password = '비밀번호를 입력해주세요';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login(email, password);
    } catch {
      // 에러는 useAuth 훅에서 처리됨
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-100">로그인</h1>
        <p className="mt-2 text-sm text-gray-400">
          AI 챗봇에 오신 것을 환영합니다
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Input
        label="이메일"
        type="email"
        placeholder="user@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={validationErrors.email}
        autoComplete="email"
        disabled={isLoading}
      />

      <Input
        label="비밀번호"
        type="password"
        placeholder="비밀번호를 입력하세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={validationErrors.password}
        autoComplete="current-password"
        disabled={isLoading}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full"
      >
        로그인
      </Button>

      <p className="text-center text-sm text-gray-400">
        계정이 없으신가요?{' '}
        <Link to="/register" className="font-medium text-primary-light hover:text-primary transition-colors">
          회원가입
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
