'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';

/**
 * Individual chat message component with markdown support
 * @param {Object} props - Component props
 * @param {string} props.content - Message text content (supports markdown)
 * @param {boolean} props.isUser - Whether the message is from the user
 * @param {string} props.timestamp - Time the message was sent
 * @param {string|null} props.emojiReaction - Optional emoji reaction for AI messages
 */
export default function Message({ content, isUser, timestamp, emojiReaction }) {
  // Process content to fix any malformed markdown in code blocks
  const processCodeBlocks = (text) => {
    // Fix common code block issues
    return text
      // Remove timestamps that break code blocks (like "03:29 PM")
      .replace(/(\d{1,2}:\d{2}\s?[AP]M)/g, '')
      // Fix broken code blocks by ensuring proper newlines around them
      .replace(/```([a-z]*)\s*\n?/g, '\n\n```$1\n')
      // Ensure code blocks close properly
      .replace(/```\s*(?![\s\S]*```)/g, '```\n');
  };

  // Clean up content if it's from AI
  const cleanContent = isUser ? content : processCodeBlocks(content);

  return (
    <div className={`message ${isUser ? 'user-message' : 'ai-message'}`}>
      {isUser ? cleanContent : (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <div className="code-block-container">
                  <div className="code-language-label">{match[1]}</div>
                  <SyntaxHighlighter
                    style={atomDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                    customStyle={{
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      margin: '0.5rem 0'
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                  <button 
                    className="copy-code-button"
                    onClick={() => {
                      navigator.clipboard.writeText(String(children));
                    }}
                  >
                    Copy
                  </button>
                </div>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {cleanContent}
        </ReactMarkdown>
      )}
      
      {/* Timestamp */}
      <div className="time-stamp">
        {timestamp}
      </div>
      
      {/* Emoji reaction for AI messages */}
      {emojiReaction && (
        <div className="emoji-reaction">
          {emojiReaction}
        </div>
      )}
    </div>
  );
}
