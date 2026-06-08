import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content?: string;
  compact?: boolean;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content = '', compact = false }) => {
  if (!content.trim()) return null;

  const components: Components = {
    h1: ({ children }) => (
      <h1 className={`${compact ? 'text-xl' : 'text-3xl'} mb-3 font-black leading-tight text-stone-50`}>{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className={`${compact ? 'text-lg' : 'text-2xl'} mb-2 mt-4 font-black leading-tight text-stone-50`}>{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className={`${compact ? 'text-base' : 'text-xl'} mb-2 mt-4 font-bold leading-tight text-stone-50`}>{children}</h3>
    ),
    p: ({ children }) => <p className="mb-3 leading-relaxed text-stone-200 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 text-stone-200">{children}</ul>,
    ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 text-stone-200">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="mb-3 rounded-r-lg border-l-4 border-red-400 bg-red-950/25 px-4 py-3 text-red-50">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => <strong className="font-black text-stone-50">{children}</strong>,
    em: ({ children }) => <em className="text-red-100">{children}</em>,
    code: ({ children }) => (
      <code className="rounded border border-red-900/45 bg-black/35 px-1.5 py-0.5 text-sm text-red-100">{children}</code>
    ),
    a: ({ children, href }) => (
      <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-red-200 underline decoration-red-400/60 underline-offset-4 hover:text-red-100">
        {children}
      </a>
    )
  };

  return (
    <div className={compact ? 'text-sm' : 'text-base'}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {normalizeDiscordMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
};

const normalizeDiscordMarkdown = (content: string) => {
  const lines = content.split('\n');
  const normalized: string[] = [];
  let tipLines: string[] = [];
  let inTip = false;

  lines.forEach((line) => {
    if (line.trim().toLowerCase() === ':: tip') {
      inTip = true;
      tipLines = [];
      return;
    }

    if (line.trim() === '::' && inTip) {
      normalized.push('> **Tip**');
      tipLines.forEach((tipLine) => normalized.push(`> ${tipLine}`));
      inTip = false;
      tipLines = [];
      return;
    }

    if (inTip) {
      tipLines.push(line);
      return;
    }

    normalized.push(line);
  });

  if (inTip) {
    normalized.push('> **Tip**');
    tipLines.forEach((tipLine) => normalized.push(`> ${tipLine}`));
  }

  return normalized.join('\n');
};

export default MarkdownContent;
