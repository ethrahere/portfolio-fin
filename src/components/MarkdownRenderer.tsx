import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const components: Components = {
    // Headings
    h1: ({ children }) => (
      <h1 className="text-2xl md:text-3xl font-mono font-bold mb-4 mt-6 border-b border-black pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl md:text-2xl font-mono font-bold mb-3 mt-5 border-b border-black pb-2">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg md:text-xl font-mono font-bold mb-2 mt-4">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base md:text-lg font-mono font-bold mb-2 mt-3">
        {children}
      </h4>
    ),
    // Paragraphs
    p: ({ children }) => (
      <p className="font-mono text-sm mb-4 leading-relaxed">
        {children}
      </p>
    ),
    // Links
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-black underline hover:bg-black hover:text-white transition-colors"
      >
        {children}
      </a>
    ),
    // Lists
    ul: ({ children }) => (
      <ul className="font-mono text-sm mb-4 ml-6 list-disc space-y-2">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="font-mono text-sm mb-4 ml-6 list-decimal space-y-2">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed">
        {children}
      </li>
    ),
    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-black pl-4 my-4 italic text-gray-700">
        {children}
      </blockquote>
    ),
    // Code
    code: ({ children, className }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
            {children}
          </code>
        );
      }
      return (
        <code className="block bg-gray-100 p-4 rounded font-mono text-sm overflow-x-auto my-4">
          {children}
        </code>
      );
    },
    // Strong/Bold
    strong: ({ children }) => (
      <strong className="font-bold">
        {children}
      </strong>
    ),
    // Emphasis/Italic
    em: ({ children }) => (
      <em className="italic">
        {children}
      </em>
    ),
    // Horizontal rule
    hr: () => (
      <hr className="border-black my-8" />
    ),
    // Images
    img: ({ src, alt }) => (
      <img
        src={src}
        alt={alt || ''}
        className="max-w-full h-auto my-4 border border-black"
      />
    ),
  };

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
