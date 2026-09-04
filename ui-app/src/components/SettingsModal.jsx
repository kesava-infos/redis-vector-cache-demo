import React, { useState } from 'react';
import { X, Settings, Database, Server, Sliders, RefreshCw } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  backendUrl,
  onSaveBackendUrl,
  similarityThreshold,
  onThresholdChange,
  onResetTelemetry
}) {
  const [urlInput, setUrlInput] = useState(backendUrl);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveBackendUrl(urlInput);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Settings size={18} color="var(--primary-red)" />
            AI Gateway & Redis Vector Configuration
          </h3>
          <button className="header-btn" onClick={onClose} style={{ padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Backend API Endpoint */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Server size={14} color="var(--primary-red)" />
              FastAPI / LLM Gateway Backend Endpoint URL
            </label>
            <input
              type="text"
              className="form-input"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="http://localhost:8000/api/chat"
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              If unreachable, application will gracefully simulate sub-5ms Redis vector cache hits.
            </span>
          </div>

          {/* Index Config */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={14} color="var(--hit-green)" />
              Redis Vector Search Index Name
            </label>
            <input
              type="text"
              className="form-input"
              value="idx:llm_semantic_cache"
              disabled
              style={{ opacity: 0.7 }}
            />
          </div>

          {/* Similarity Threshold Slider */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={14} />
                Global Similarity Match Threshold
              </label>
              <span className="metric-value hit">{similarityThreshold}</span>
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

          <hr style={{ borderColor: 'var(--border-color)', margin: '4px 0' }} />

          <button
            className="btn-secondary"
            onClick={onResetTelemetry}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#f87171' }}
          >
            <RefreshCw size={14} />
            Reset Telemetry & Cache Metrics
          </button>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
