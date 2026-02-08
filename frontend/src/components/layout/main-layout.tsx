import { ReactNode } from 'react';

interface MainLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

const MainLayout = ({ sidebar, children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-gray-100 font-sans antialiased selection:bg-primary-500/30">
      {sidebar}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl opacity-50 animate-blob mix-blend-screen" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl opacity-50 animate-blob animation-delay-2000 mix-blend-screen" />
          <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl opacity-50 animate-blob animation-delay-4000 mix-blend-screen" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
        </div>

        <div className="relative z-10 flex h-full flex-col">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
