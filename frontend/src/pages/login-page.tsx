import LoginForm from '@/components/auth/login-form';

/**
 * 로그인 페이지
 * - 그라데이션 배경 + 글래스모피즘 카드
 */
const LoginPage = () => {
  return (
    <div className="gradient-bg-auth flex min-h-screen items-center justify-center px-4">
      {/* 배경 장식 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-blob" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-accent-purple/15 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-accent-cyan/10 blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* 로고 */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent-purple shadow-2xl shadow-primary/30 ring-1 ring-white/20">
            <svg
              className="h-9 w-9 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gradient">Anti-Gravity</h2>
        </div>

        {/* 카드 */}
        <div className="glass-card rounded-3xl p-8">
          <LoginForm />
        </div>

        {/* 하단 텍스트 */}
        <p className="mt-6 text-center text-sm text-white/40">
          Powered by Google Gemini AI
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
