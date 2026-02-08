import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from './register-form';

const mockRegister = vi.fn();
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    register: mockRegister,
    isLoading: false,
    error: null,
  }),
}));

const renderRegisterForm = () =>
  render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>,
  );

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('회원가입 폼을 렌더링한다', () => {
    renderRegisterForm();
    expect(screen.getByRole('heading', { name: '회원가입' })).toBeInTheDocument();
    expect(screen.getByLabelText('이름')).toBeInTheDocument();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument();
  });

  it('빈 필드로 전송하면 유효성 검사 에러를 표시한다', async () => {
    renderRegisterForm();
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    await waitFor(() => {
      expect(screen.getByText('이름을 입력해주세요')).toBeInTheDocument();
      expect(screen.getByText('이메일을 입력해주세요')).toBeInTheDocument();
      expect(screen.getByText('비밀번호를 입력해주세요')).toBeInTheDocument();
    });
  });

  it('비밀번호가 8자 미만이면 에러를 표시한다', async () => {
    renderRegisterForm();
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '테스트' } });
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: '1234' } });
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    await waitFor(() => {
      expect(screen.getByText('비밀번호는 8자 이상이어야 합니다')).toBeInTheDocument();
    });
  });

  it('비밀번호 확인이 다르면 에러를 표시한다', async () => {
    renderRegisterForm();
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '테스트' } });
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    await waitFor(() => {
      expect(screen.getByText('비밀번호가 일치하지 않습니다')).toBeInTheDocument();
    });
  });

  it('유효한 입력으로 전송하면 register 함수를 호출한다', async () => {
    renderRegisterForm();
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '테스트' } });
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123', '테스트');
    });
  });
});
