import React from 'react';
import {
  Plus,
  MessageSquare,
  Zap,
  DollarSign,
  Clock,
  Activity,
  Sliders,
  Trash2
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  telemetry,
  similarityThreshold,
  onThresholdChange
}) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={onNewChat}>
          <Plus size={18} />
          <span>New Chat Session</span>
        </button>
      </div>

      <div className="sidebar-section" style={{ paddingBottom: '4px' }}>
        <div className="sidebar-section-title">
          <span>Vector Cache Telemetry</span>
          <Activity size={14} color="var(--primary-red)" />
        </div>
      </div>

      {/* Telemetry Card */}
      <div className="telemetry-card">
        <div className="metric-row">
          <span className="metric-label">
            <Zap size={14} color="var(--hit-green)" />
            Hit Rate
          </span>
          <span className="metric-value hit">{telemetry.hitRate}%</span>
        </div>

        <div className="metric-row">
          <span className="metric-label">
            <Clock size={14} color="var(--primary-red)" />
            Avg Latency Saved
          </span>
          <span className="metric-value highlight">{telemetry.avgLatencySaved}ms</span>
        </div>

        <div className="metric-row">
          <span className="metric-label">
            <DollarSign size={14} color="#f59e0b" />
            Cost Savings
          </span>
          <span className="metric-value">${telemetry.costSaved.toFixed(4)}</span>
        </div>

        <div className="metric-row">
          <span className="metric-label">Total Queries</span>
          <span className="metric-value">{telemetry.totalQueries}</span>
        </div>

        <hr style={{ borderColor: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

        {/* Similarity Threshold Slider */}
        <div className="slider-container">
          <div className="metric-row">
            <span className="metric-label" style={{ fontSize: '0.75rem' }}>
              <Sliders size={12} />
              Cosine Threshold
            </span>
            <span className="metric-value" style={{ fontSize: '0.78rem' }}>
              {similarityThreshold}
            </span>
          </div>
          <input
            type="range"
            min="0.60"
            max="0.99"
            step="0.01"
            value={similarityThreshold}
            onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
            className="slider-input"
          />
        </div>
      </div>

      <div className="sidebar-section" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="sidebar-section-title">
          <span>Recent Sessions</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{chats.length}</span>
        </div>

        <div className="history-list">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`history-item ${chat.id === activeChatId ? 'active' : ''}`}
              onClick={() => onSelectChat(chat.id)}
            >
              <MessageSquare size={14} />
              <span className="history-item-text">{chat.title || 'New Conversation'}</span>
              {chats.length > 1 && (
                <button
                  style={{ opacity: 0.6, padding: '2px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  title="Delete Session"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
