interface WelcomeScreenProps {
  onSendPrompt: (prompt: string) => void;
}

const EXAMPLE_PROMPTS = [
  {
    icon: '💡',
    title: '아이디어 브레인스토밍',
    prompt: '피트니스 트래킹 앱의 독특한 기능을 제안해줘',
  },
  {
    icon: '💻',
    title: '코드 어시스턴트',
    prompt: 'React의 동시성 모드가 어떻게 작동하는지 예제와 함께 설명해줘',
  },
  {
    icon: '📝',
    title: '콘텐츠 크리에이터',
    prompt: 'AI가 헬스케어 분야에 미치는 영향에 대한 블로그 포스트를 작성해줘',
  },
  {
    icon: '🎯',
    title: '학습 가이드',
    prompt: 'Rust 프로그래밍 학습을 위한 로드맵을 만들어줘',
  },
];

const WelcomeScreen = ({ onSendPrompt }: WelcomeScreenProps) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      {/* Hero Section */}
      <div className="animate-fade-in mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary via-accent-purple to-accent-pink shadow-2xl shadow-primary/30 ring-1 ring-white/20">
        <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>

      <h2 className="animate-fade-in mb-4 text-center text-4xl font-bold tracking-tight md:text-5xl">
        <span className="text-gray-100">Welcome to </span>
        <span className="text-gradient">Anti-Gravity</span>
      </h2>

      <p className="animate-fade-in mb-12 max-w-lg text-center text-lg text-gray-400">
        차세대 AI 챗봇을 경험하세요. 강력하고, 빠르고, 아름답게 디자인되었습니다.
      </p>

      {/* Example Prompts Grid */}
      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        {EXAMPLE_PROMPTS.map((item, index) => (
          <button
            key={item.prompt}
            onClick={() => onSendPrompt(item.prompt)}
            className="
              animate-slide-in-up group relative overflow-hidden rounded-2xl border border-white/5 bg-background-lighter/50 p-5 text-center backdrop-blur-sm
              transition-all duration-300
              hover:border-primary/30 hover:bg-white/5 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/5
            "
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-xl group-hover:bg-primary/20 transition-colors">
              {item.icon}
            </div>
            <h3 className="mb-1 text-sm font-bold text-gray-200 group-hover:text-primary-300 transition-colors">
              {item.title}
            </h3>
            <p className="text-xs leading-relaxed text-gray-500 group-hover:text-gray-400 transition-colors">
              {item.prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
