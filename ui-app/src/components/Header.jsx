import React from 'react';
import { Database, Zap, Settings, Sliders, Menu } from 'lucide-react';

export default function Header({
  onToggleSidebar,
  onOpenSettings,
  telemetry
}) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="header-btn"
          onClick={onToggleSidebar}
          title="Toggle Sidebar"
          style={{ padding: '6px' }}
        >
          <Menu size={18} />
        </button>

        <div className="logo-badge">
          <Database size={20} />
        </div>

        <div className="app-title-group">
          <h1>
            Redis Vector Cache
            <span className="version-chip">v2.4 AI Gateway</span>
          </h1>
          <p>Sub-5ms Semantic LLM Prompt Caching & Vector Search</p>
        </div>
      </div>

      <div className="header-right">
        <div className="status-pill">
          <span className="status-dot"></span>
          <span>Redis Vector Cache Active</span>
        </div>

        <button className="header-btn" onClick={onOpenSettings} title="Settings & Parameters">
          <Settings size={16} />
          <span>Config</span>
        </button>
      </div>
    </header>
  );
}
