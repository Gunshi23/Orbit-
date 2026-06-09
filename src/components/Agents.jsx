import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, TrendingUp, Cpu, Terminal } from 'lucide-react';

const agentsData = [
  {
    name: 'Polaris',
    role: 'Audience Intelligence Agent',
    icon: Compass,
    color: 'var(--accent-blue)',
    description: 'Scans raw customer data, flags high-value churn risks, maps lifetime value patterns, and builds sub-segment clusters.',
    logs: [
      'Scanning customer signals database...',
      'Identified 432 high-value segments with >80% churn risk.',
      'Refining predictive cohort models for target cohort...',
      'Polaris: Audience parameters sent to Nova & Vega.'
    ]
  },
  {
    name: 'Nova',
    role: 'Campaign Creation Agent',
    icon: Sparkles,
    color: 'var(--accent-purple)',
    description: 'Generates cross-channel copy, builds visual layouts, and creates personalized discount models utilizing LLM models.',
    logs: [
      'Analyzing cohort parameters from Polaris...',
      'Drafting WhatsApp message variants (Urgent vs. Casual)...',
      'Creating dynamic discounts using contextual pricing models...',
      'Nova: Campaign variants compiled and loaded.'
    ]
  },
  {
    name: 'Vega',
    role: 'Performance Prediction Agent',
    icon: TrendingUp,
    color: 'var(--accent-blue)',
    description: 'Simulates engagement rates, open rates, conversion rates, and revenue returns BEFORE launching campaigns.',
    logs: [
      'Running simulation matrix for Nova templates...',
      'Estimating conversion probability distribution...',
      'Projected Revenue: ₹1.2L (12% Conversion Rate, 92% Conf.)',
      'Vega: Recommendation flag set to: APPROVED.'
    ]
  },
  {
    name: 'Atlas',
    role: 'Campaign Execution Agent',
    icon: Cpu,
    color: 'var(--accent-purple)',
    description: 'Configures WhatsApp/Email dispatch webhooks, monitors delivery stats, and dynamically throttles send-rates.',
    logs: [
      'Awaiting dispatch sequence trigger...',
      'Dispatch webhook pinged successfully...',
      'Active queue launched: Sending WhatsApp campaign variants...',
      'Atlas: Monitoring click responses in real time.'
    ]
  }
];

export default function Agents() {
  const [activeLogIndices, setActiveLogIndices] = useState([0, 0, 0, 0]);

  // Rotate logs to simulate active thinking
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLogIndices((prev) => 
        prev.map((index, idx) => (index + 1) % agentsData[idx].logs.length)
      );
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Mouse move handler for premium magnetic card glow
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--x', `${x}px`);
    card.style.setProperty('--y', `${y}px`);
  };

  return (
    <section id="agents" style={{ position: 'relative', borderBottom: '1px solid var(--card-border)' }}>
      <div className="grid-overlay" />

      <div className="section-container">
        {/* Header */}
        <div className="header-center">
          <div className="section-tag">Autonomous Operations</div>
          <h2 className="section-title">Meet Your Autonomous Marketing Team</h2>
          <p className="section-subtitle">
            ORBIT orchestrates specialized AI agents that collaborate, write, predict, and execute campaigns with zero human handoffs required.
          </p>
        </div>

        {/* Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          zIndex: 5
        }}>
          {agentsData.map((agent, index) => {
            const Icon = agent.icon;
            return (
              <div 
                key={agent.name}
                className="glass-panel glow-on-hover"
                onMouseMove={handleMouseMove}
                style={{
                  padding: '2rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  cursor: 'default',
                  position: 'relative'
                }}
              >
                {/* Agent Icon Core */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--card-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: agent.color,
                  boxShadow: `0 0 15px ${agent.color.replace(')', ', 0.15)')}`
                }}>
                  <Icon size={22} />
                </div>

                {/* Identity */}
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 600, fontFamily: 'Space Grotesk' }}>{agent.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: agent.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
                    {agent.role}
                  </div>
                </div>

                {/* Bio */}
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {agent.description}
                </p>

                {/* Live Thinking Panel */}
                <div style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '10px',
                  padding: '1rem',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginTop: 'auto',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Status Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    <span className="node-pulse" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thinking State</span>
                  </div>

                  {/* Terminal Line */}
                  <div style={{
                    color: '#a7f3d0',
                    lineHeight: 1.4,
                    minHeight: '40px',
                    transition: 'all 0.3s ease'
                  }}>
                    &gt; {agent.logs[activeLogIndices[index]]}
                  </div>
                  
                  {/* Decorative terminal tag */}
                  <div style={{
                    position: 'absolute',
                    right: '0.5rem',
                    bottom: '0.3rem',
                    color: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}>
                    <Terminal size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
