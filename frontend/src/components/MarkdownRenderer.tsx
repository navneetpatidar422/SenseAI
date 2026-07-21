import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import CodeViewer from './CodeViewer';
import MermaidDiagram from './MermaidDiagram';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isStreaming = false }) => {
  return (
    <div className={`prose prose-invert max-w-none text-body leading-relaxed space-y-4 ${isStreaming ? 'streaming-cursor' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            if (language === 'mermaid') {
              return <MermaidDiagram chart={codeString} />;
            }

            if (!inline && (match || codeString.includes('\n'))) {
              return <CodeViewer code={codeString} language={language || 'text'} />;
            }

            return (
              <code className="bg-surface-raised px-1.5 py-0.5 rounded font-mono text-[13px] text-accent-primary" {...props}>
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 border border-border-subtle rounded-lg">
                <table className="w-full text-left text-sm border-collapse">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="bg-surface-raised font-semibold p-2.5 border-b border-border-subtle text-text-primary">
                {children}
              </th>
            );
          },
          td({ children }) {
            return <td className="p-2.5 border-b border-border-subtle/50 text-text-secondary">{children}</td>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-accent-primary bg-accent-primary/5 p-3 rounded-r-lg my-3 text-text-primary font-medium">
                {children}
              </blockquote>
            );
          },
          ul({ children }) {
            return <ul className="list-disc list-inside space-y-1.5 my-2">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside space-y-1.5 my-2">{children}</ol>;
          },
          h1({ children }) {
            return <h1 className="text-xl font-bold text-text-primary mt-6 mb-2">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-lg font-bold text-text-primary mt-5 mb-2">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-base font-semibold text-text-primary mt-4 mb-1">{children}</h3>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
