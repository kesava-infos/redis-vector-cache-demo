import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import { SAMPLE_PROMPTS } from '../services/chatService';
import { Database, Zap, Cpu, ArrowRight } from 'lucide-react';

export default function ChatFeed({
  messages,
  isLoading,
  onSelectPrompt,
  onInspectVector
}) {
  const feedEndRef = useRef(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="messages-feed">
        <div className="welcome-hero animate-fade-in">
          <div className="hero-icon-glow">
            <Database size={32} />
          </div>
          <h2>Redis Vector Cache AI Gateway</h2>
          <p>
            Experience instant <strong>sub-5ms semantic cache hits</strong> using Redis HNSW vector search. Eliminate redundant LLM calls and reduce API costs by up to 99%.
          </p>

          <div className="prompt-grid">
            {SAMPLE_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                className="prompt-card"
                onClick={() => onSelectPrompt(item.prompt)}
              >
                <span className="prompt-card-title">{item.title}</span>
                <span className="prompt-card-desc">{item.prompt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-feed">
      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          message={msg}
          onInspectVector={onInspectVector}
        />
      ))}

      {isLoading && (
        <div className="message-wrapper animate-fade-in">
          <div className="avatar assistant">
            <Database size={18} />
          </div>
          <div className="message-content-box">
            <div className="message-bubble" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="status-dot" style={{ background: 'var(--primary-red)' }}></div>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Searching Redis Vector Index & Evaluating Cosine Distance...
              </span>
            </div>
          </div>
        </div>
      )}

      <div ref={feedEndRef} />
    </div>
  );
}
