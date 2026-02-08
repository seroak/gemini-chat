import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

/**
 * 마크다운 렌더러 컴포넌트
 * - react-markdown 기반
 * - 코드 블록 (구문 강조 + 복사 버튼)
 * - GFM (테이블, 취소선, 체크리스트)
 */
// XSS 방지를 위한 sanitize 설정 (코드 블록의 class 속성 허용)
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), 'className'],
  },
};

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
      components={markdownComponents}
    >
      {content}
    </ReactMarkdown>
  );
};

const CodeBlock = ({
  language,
  children,
}: {
  language: string;
  children: string;
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl ring-1 ring-white/10">
      {/* 코드 헤더 */}
      <div className="flex items-center justify-between bg-white/5 px-4 py-2 text-xs text-gray-400">
        <span className="font-medium uppercase tracking-wider">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="rounded-md px-2.5 py-1 text-xs text-gray-400 transition-colors hover:bg-white/10 hover:text-gray-200"
        >
          {isCopied ? '복사됨!' : '복사'}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || 'text'}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: '1rem',
          fontSize: '0.875rem',
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');

    // 인라인 코드 vs 블록 코드 구분
    if (match) {
      return <CodeBlock language={match[1]} children={codeString} />;
    }

    return (
      <code
        className="rounded-md bg-white/10 px-1.5 py-0.5 text-sm font-mono text-primary-light ring-1 ring-white/5"
        {...props}
      >
        {children}
      </code>
    );
  },
  // 테이블 스타일링
  table({ children }) {
    return (
      <div className="my-3 overflow-x-auto rounded-xl ring-1 ring-white/10">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          {children}
        </table>
      </div>
    );
  },
  thead({ children }) {
    return <thead className="bg-white/5">{children}</thead>;
  },
  th({ children }) {
    return (
      <th className="px-4 py-2.5 text-left font-semibold text-gray-200">
        {children}
      </th>
    );
  },
  td({ children }) {
    return <td className="border-t border-white/5 px-4 py-2.5 text-gray-400">{children}</td>;
  },
  // 링크
  a({ children, href }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-light underline decoration-primary/30 underline-offset-2 hover:text-primary hover:decoration-primary/50 transition-colors"
      >
        {children}
      </a>
    );
  },
  // 리스트
  ul({ children }) {
    return <ul className="my-2 list-disc space-y-1 pl-6">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="my-2 list-decimal space-y-1 pl-6">{children}</ol>;
  },
  // 단락
  p({ children }) {
    return <p className="my-2 leading-relaxed">{children}</p>;
  },
  // 제목
  h1({ children }) {
    return <h1 className="my-3 text-2xl font-bold">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="my-3 text-xl font-bold">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="my-2 text-lg font-semibold">{children}</h3>;
  },
  // 인용
  blockquote({ children }) {
    return (
      <blockquote className="my-3 border-l-4 border-primary/30 pl-4 italic text-gray-400">
        {children}
      </blockquote>
    );
  },
  // 구분선
  hr() {
    return <hr className="my-4 border-white/10" />;
  },
};

export default MarkdownRenderer;
