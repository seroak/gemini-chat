import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from './login-form';

// useAuth 훅 모킹
const mockLogin = vi.fn();
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    login: mockLogin,
    isLoading: false,
    error: null,
  }),
}));

const renderLoginForm = () =>
  render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>,
  );

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('로그인 폼을 렌더링한다', () => {
    renderLoginForm();
    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
  });

  it('회원가입 페이지 링크를 표시한다', () => {
    renderLoginForm();
    expect(screen.getByText('회원가입')).toBeInTheDocument();
  });

  it('빈 필드로 전송하면 유효성 검사 에러를 표시한다', async () => {
    renderLoginForm();
    const form = screen.getByRole('button', { name: '로그인' }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('이메일을 입력해주세요')).toBeInTheDocument();
      expect(screen.getByText('비밀번호를 입력해주세요')).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('잘못된 이메일 형식이면 에러를 표시한다', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText('이메일'), 'invalid-email');
    await user.type(screen.getByLabelText('비밀번호'), 'password123');

    const form = screen.getByLabelText('이메일').closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식이 아닙니다')).toBeInTheDocument();
    });
  });

  it('유효한 입력으로 전송하면 login 함수를 호출한다', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText('이메일'), 'test@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'password123');

    const form = screen.getByLabelText('이메일').closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});
