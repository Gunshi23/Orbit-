import React, { useState } from 'react';
import { Layers, Database, Cpu, Send, LineChart, Award } from 'lucide-react';

const layers = [
  {
    id: 'core',
    name: 'ORBIT Core Layer',
    icon: Database,
    description: 'The semantic hub where all customer attributes, events, and transactional parameters are structured into unified vector embeddings.',
    tech: 'Snowflake / BigQuery Sync, Vector Embeddings, LLM Guardrails'
  },
  {
    id: 'agents',
    name: 'AI Agent Layer',
    icon: Cpu,
    description: 'Collaborative agent nodes (Polaris, Nova, Vega, Atlas) analyzing risk profiles, writing copy templates, and predicting metrics.',
    tech: 'Stateful Agent Orchestrators, Generative Models, Vega Simulations'
  },
  {
    id: 'audience',
    name: 'Audience Intelligence Grid',
    icon: Layers,
    description: 'Dynamic cohort grouping engine that automatically isolates re-engagement opportunities without manual rule building.',
    tech: 'Cluster Mapping, Frequency Decay Inference, Channel Affinity Weighting'
  },
  {
    id: 'channel',
    name: 'Multi-Channel Engine',
    icon: Send,
    description: 'Unified dispatch queues routing notifications to WhatsApp, Email, and SMS gateways based on active timing curves.',
    tech: 'Twilio Business Gateway, SendGrid SMTP, Custom Webhook Router'
  },
  {
    id: 'analytics',
    name: 'Attribution & Analytics',
    icon: LineChart,
    description: 'Monitoring loops tracking click triggers and transaction events, updating vector indices to calibrate agent predictions.',
    tech: 'Attribution Ledgers, Event Callbacks, Model Calibrator'
  },
  {
    id: 'revenue',
    name: 'Revenue Optimization Layer',
    icon: Award,
    description: 'The final destination where campaign conversions compound margin returns, feeding growth data back into the Core.',
    tech: 'Margin Analytics, Conversion Attribution Ledgers, LTV Maximizers'
  }
];

export default function Architecture() {
  const [hoveredLayerIndex, setHoveredLayerIndex] = useState(0);

  return (
    <section id="architecture" style={{ position: 'relative', borderBottom: '1px solid var(--card-border)' }}>
      <div className="grid-overlay" />

      <div className="section-container">
        {/* Header */}
        <div className="header-center">
          <div className="section-tag">System Design</div>
          <h2 className="section-title">The Operating System Architecture</h2>
          <p className="section-subtitle">
            ORBIT integrates data syncs, collaborative agents, channel routing, and analytics into a single, closed-loop revenue engine.
          </p>
        </div>

        {/* Diagram Wrapper Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'center',
          zIndex: 5
        }} className="arch-grid">
          
          {/* Left Side: Interactive Layer Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
            {/* SVG Connector Line that runs behind all layers */}
            <svg width="60" height="100%" style={{ position: 'absolute', top: 0, left: '38px', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
              <line x1="30" y1="0" x2="30" y2="100%" stroke="var(--card-border)" strokeWidth="2" strokeDasharray="6 4" />
              {/* Flowing pulse blob */}
              <circle r="4" fill="var(--accent-blue)">
                <animate 
                  attributeName="cy" 
                  from="0" 
                  to="100%" 
                  dur="4s" 
                  repeatCount="indefinite" 
                />
              </circle>
            </svg>

            {layers.map((layer, index) => {
              const Icon = layer.icon;
              const isHovered = index === hoveredLayerIndex;

              return (
                <div
                  key={layer.id}
                  onMouseEnter={() => setHoveredLayerIndex(index)}
                  className="glass-panel"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    padding: '1rem 1.5rem',
                    cursor: 'pointer',
                    zIndex: 5,
                    borderLeft: isHovered ? '4px solid var(--accent-blue)' : '1px solid var(--card-border)',
                    transform: isHovered ? 'translateX(10px)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    background: isHovered ? 'var(--accent-glow-blue)' : 'var(--card-bg)'
                  }}
                >
                  {/* Icon Node */}
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: isHovered ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' : 'var(--bg-primary)',
                    border: '1px solid var(--card-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isHovered ? '#ffffff' : 'var(--text-secondary)',
                    transition: 'all 0.3s',
                    flexShrink: 0
                  }}>
                    <Icon size={18} />
                  </div>

                  {/* Text */}
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, fontFamily: 'Space Grotesk' }}>{layer.name}</h3>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{layer.tech}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Side: Layer Detail Board */}
          <div style={{ position: 'relative' }}>
            <div className="glass-panel" style={{
              padding: '2.5rem',
              border: '1px solid var(--card-border)',
              minHeight: '260px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '1rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background gradient blob */}
              <div style={{
                position: 'absolute',
                top: '-30%',
                right: '-10%',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, var(--accent-glow-purple) 0%, transparent 70%)',
                filter: 'blur(30px)',
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
                <Layers size={14} /> ACTIVE NODE SCHEMATIC
              </div>

              <h3 style={{ fontSize: '1.6rem', fontFamily: 'Space Grotesk', fontWeight: 700 }}>
                {layers[hoveredLayerIndex].name}
              </h3>

              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {layers[hoveredLayerIndex].description}
              </p>

              <div style={{
                borderTop: '1px solid var(--card-border)',
                paddingTop: '1rem',
                marginTop: '0.5rem'
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Sub-systems / Modules:</span>
                <div style={{
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  color: 'var(--accent-blue)',
                  marginTop: '0.25rem'
                }}>
                  {layers[hoveredLayerIndex].tech}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .arch-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
        }
        @media (max-width: 991px) {
          .arch-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }
      `}</style>
    </section>
  );
}
