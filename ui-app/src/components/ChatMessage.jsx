import React, { useState } from 'react';
import { User, Database, Zap, Cpu, Clock, Check, Copy, Eye, ArrowUpRight } from 'lucide-react';

export default function ChatMessage({ message, onInspectVector }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Basic markdown & code block renderer helper
  const renderFormattedContent = (content) => {
    if (!content) return null;

    // Split code blocks ```python ... ```
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', text: content.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'code', lang: match[1] || 'code', code: match[2].trim() });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      parts.push({ type: 'text', text: content.slice(lastIndex) });
    }

    return parts.map((part, index) => {
      if (part.type === 'code') {
        return (
          <div key={index} style={{ position: 'relative', margin: '12px 0' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#040609',
                padding: '6px 12px',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderBottom: 'none',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-dim)'
              }}
            >
              <span>{part.lang}</span>
              <button
                onClick={() => navigator.clipboard.writeText(part.code)}
                style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}
              >
                <Copy size={12} /> Copy Code
              </button>
            </div>
            <pre style={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              <code>{part.code}</code>
            </pre>
          </div>
        );
      } else {
        // Simple inline markdown parsing for bold **text** and line breaks
        const lines = part.text.split('\n');
        return (
          <div key={index}>
            {lines.map((line, idx) => {
              const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
              return (
                <p
                  key={idx}
                  dangerouslySetInnerHTML={{ __html: formattedLine }}
                  style={{ marginBottom: idx === lines.length - 1 ? 0 : '8px' }}
                />
              );
            })}
          </div>
        );
      }
    });
  };

  return (
    <div className={`message-wrapper animate-fade-in ${isUser ? 'user-msg' : ''}`}>
      <div className={`avatar ${isUser ? 'user' : 'assistant'}`}>
        {isUser ? <User size={18} /> : <Database size={18} />}
      </div>

      <div className="message-content-box">
        <div className="message-header-row">
          <span className="sender-name">{isUser ? 'User' : 'Redis Vector Cache Gateway'}</span>

          {!isUser && message.isCacheHit !== undefined && (
            <div className={`cache-badge ${message.isCacheHit ? 'hit' : 'miss'}`}>
              {message.isCacheHit ? (
                <>
                  <Zap size={12} />
                  <span>CACHE HIT ({message.latencyMs}ms)</span>
                </>
              ) : (
                <>
                  <Cpu size={12} />
                  <span>LLM MISS ({message.latencyMs}ms)</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="message-bubble">
          {renderFormattedContent(message.content)}
        </div>

        {!isUser && (
          <div className="message-meta-bar">
            <div className="meta-item">
              <Clock size={12} />
              <span>Latency: {message.latencyMs}ms</span>
            </div>

            {message.similarityScore && (
              <div className="meta-item">
                <span>Similarity: {(message.similarityScore * 100).toFixed(1)}%</span>
              </div>
            )}

            {message.isCacheHit && (
              <button className="inspect-btn" onClick={() => onInspectVector(message)}>
                <Eye size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Inspect Vector Match
              </button>
            )}

            <button
              onClick={handleCopy}
              style={{ color: 'var(--text-dim)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {copied ? <Check size={12} color="var(--hit-green)" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
