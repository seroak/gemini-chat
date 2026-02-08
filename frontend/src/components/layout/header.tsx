interface HeaderProps {
  title?: string;
  onToggleSidebar: () => void;
}

const Header = ({ title, onToggleSidebar }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b border-white/5 bg-background/50 px-4 backdrop-blur-md transition-all duration-300 supports-[backdrop-filter]:bg-background/20">
      <button
        onClick={onToggleSidebar}
        className="mr-3 rounded-xl p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white md:hidden"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <div className="flex flex-1 items-center justify-between">
        <h1 className="flex items-center gap-2 truncate text-lg font-semibold text-gray-100">
          {title ? <span>{title}</span> : <span className="text-gray-500">New Conversation</span>}
        </h1>
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
          <span className="text-xs font-semibold tracking-wide text-amber-400 sm:inline-block">
            Gemini 2.0 Flash
          </span>
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
        </div>
      </div>
    </header>
  );
};

export default Header;
