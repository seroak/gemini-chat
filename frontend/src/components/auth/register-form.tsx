import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import { useAuth } from '@/hooks/use-auth';

/**
 * 회원가입 폼 컴포넌트
 * - 이메일/비밀번호/이름 입력
 * - 비밀번호 확인 필드
 * - 유효성 검사
 * - 에러 메시지 표시
 */
const RegisterForm = () => {
  const { register, isLoading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const MIN_PASSWORD_LENGTH = 8;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = '이름을 입력해주세요';
    }

    if (!email.trim()) {
      errors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!password) {
      errors.password = '비밀번호를 입력해주세요';
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다`;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await register(email, password, name);
    } catch {
      // 에러는 useAuth 훅에서 처리됨
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-100">회원가입</h1>
        <p className="mt-2 text-sm text-gray-400">
          새 계정을 만들어 AI 챗봇을 시작하세요
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Input
        label="이름"
        type="text"
        placeholder="홍길동"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={validationErrors.name}
        autoComplete="name"
        disabled={isLoading}
      />

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
        placeholder="8자 이상 입력하세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={validationErrors.password}
        autoComplete="new-password"
        disabled={isLoading}
      />

      <Input
        label="비밀번호 확인"
        type="password"
        placeholder="비밀번호를 다시 입력하세요"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={validationErrors.confirmPassword}
        autoComplete="new-password"
        disabled={isLoading}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full"
      >
        회원가입
      </Button>

      <p className="text-center text-sm text-gray-400">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="font-medium text-primary-light hover:text-primary transition-colors">
          로그인
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
