import React from 'react';
import { X, Database, Zap, CheckCircle2, Sliders, Layers } from 'lucide-react';

export default function VectorInspectorModal({ message, onClose }) {
  if (!message) return null;

  const simPercent = (message.similarityScore * 100).toFixed(2);
  const distance = message.vectorDistance || (1 - message.similarityScore).toFixed(4);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Database size={18} color="var(--primary-red)" />
            Redis Vector Similarity Inspector
          </h3>
          <button className="header-btn" onClick={onClose} style={{ padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Similarity Meter */}
          <div className="telemetry-card" style={{ margin: 0 }}>
            <div className="metric-row">
              <span className="metric-label" style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                Cosine Similarity Score
              </span>
              <span className="metric-value hit" style={{ fontSize: '1.1rem' }}>
                {simPercent}%
              </span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.5)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${simPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981, #059669)',
                  borderRadius: '5px'
                }}
              />
            </div>

            <div className="metric-row" style={{ marginTop: '4px', fontSize: '0.78rem' }}>
              <span className="metric-label">Vector Distance (Cosine)</span>
              <span className="metric-value">{distance}</span>
            </div>
          </div>

          {/* Prompt Match Comparison */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} color="var(--hit-green)" />
              Original Cached Prompt in Redis Index
            </label>
            <div
              className="form-input"
              style={{
                background: 'rgba(16, 185, 129, 0.06)',
                borderColor: 'var(--hit-green-border)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            >
              {message.matchedPrompt || 'Vector query match hit'}
            </div>
          </div>

          {/* Latency Comparison Card */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="telemetry-card" style={{ margin: 0, padding: '12px' }}>
              <span className="metric-label" style={{ fontSize: '0.75rem' }}>
                ⚡ Redis Cache Latency
              </span>
              <span className="metric-value hit" style={{ fontSize: '1.2rem', marginTop: '4px' }}>
                {message.latencyMs} ms
              </span>
            </div>

            <div className="telemetry-card" style={{ margin: 0, padding: '12px' }}>
              <span className="metric-label" style={{ fontSize: '0.75rem' }}>
                🤖 Saved LLM Latency
              </span>
              <span className="metric-value highlight" style={{ fontSize: '1.2rem', marginTop: '4px' }}>
                ~820 ms
              </span>
            </div>
          </div>

          {/* Vector Index Info */}
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', border: 'var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: 'var(--text-muted)' }}>
              <Layers size={13} />
              <span>Redis Stack Vector Index: <code>idx:llm_semantic_cache</code></span>
            </div>
            <div>• Vector Algorithm: HNSW (M=16, EF_CONSTRUCTION=200)</div>
            <div>• Embedding Engine: OpenAI <code>text-embedding-3-small</code> (1536 dim)</div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
