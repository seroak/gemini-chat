import { FormEvent, KeyboardEvent, useRef, useEffect } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isDisabled?: boolean;
  placeholder?: string;
}

const ChatInput = ({
  value,
  onChange,
  onSend,
  isDisabled = false,
  placeholder = 'Ask anything...',
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const MAX_HEIGHT = 200;
      textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`;
    }
  }, [value]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isDisabled) return;
    onSend();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!value.trim() || isDisabled) return;
      onSend();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center px-4 pb-6 pt-2">
      <div className="w-full max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 rounded-2xl border border-white/10 bg-background-lighter/80 p-2 shadow-2xl backdrop-blur-xl transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50"
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            rows={1}
            className="
              max-h-[200px] w-full resize-none bg-transparent px-4 py-3 text-[15px] text-gray-100
              placeholder:text-gray-400 focus:outline-none
              disabled:cursor-not-allowed disabled:opacity-50
            "
          />
          <button
            type="submit"
            disabled={!value.trim() || isDisabled}
            className="
              mb-1 mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
              bg-gradient-to-br from-primary to-accent-purple text-white shadow-lg shadow-primary/20
              transition-all duration-200
              hover:scale-105 hover:brightness-110
              active:scale-95
              disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100
            "
          >
            {isDisabled ? (
              <svg className="h-5 w-5 animate-spin text-white/70" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </form>
        <p className="mt-3 text-center text-[11px] font-medium text-gray-500 transition-colors hover:text-gray-400">
          AI can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
