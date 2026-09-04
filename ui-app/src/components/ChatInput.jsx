import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, ShieldOff, Sparkles } from 'lucide-react';

export default function ChatInput({
  onSendMessage,
  isLoading,
  bypassCache,
  onToggleBypass,
  selectedModel,
  onSelectModel
}) {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return;
    onSendMessage(prompt);
    setPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [prompt]);

  return (
    <div className="input-area-wrapper">
      <div className="input-box">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question or test semantic caching (e.g. 'What is Redis Vector Search?')..."
          className="input-textarea"
          rows={1}
        />

        <div className="input-controls">
          <div className="controls-left">
            <label className="bypass-toggle" title="Check this to bypass Redis semantic cache and force direct LLM execution">
              <input
                type="checkbox"
                checked={bypassCache}
                onChange={(e) => onToggleBypass(e.target.checked)}
              />
              <ShieldOff size={13} color={bypassCache ? "var(--miss-purple)" : "var(--text-dim)"} />
              <span style={{ color: bypassCache ? "var(--miss-purple)" : "var(--text-muted)", fontWeight: bypassCache ? 600 : 400 }}>
                Bypass Vector Cache
              </span>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              <Sparkles size={12} color="var(--primary-red)" />
              <select
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-main)',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <option value="gpt-4o">gpt-4o</option>
                <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
                <option value="llama-3-70b">llama-3-70b</option>
              </select>
            </div>
          </div>

          <button
            className="send-btn"
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            title="Send Prompt (Enter)"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
