import React, { useEffect, useRef, useState } from 'react';
import { Network, Activity, Cpu, ShieldCheck } from 'lucide-react';

function useCounter(target, duration = 2000, trigger = false, prefix = '', suffix = '', decimals = 0) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const val = progress * target;
      setCount(decimals ? parseFloat(val.toFixed(decimals)) : Math.floor(val));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [target, duration, trigger, decimals]);

  return `${prefix}${count.toLocaleString()}${suffix}`;
}

export default function Trust() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const signalCount = useCounter(12, 2000, isVisible, '', 'M+');
  const engagementMultiplier = useCounter(4.8, 2000, isVisible, '', 'x', 1);
  const automationRate = useCounter(92, 2000, isVisible, '', '%');
  const revenueInfluenced = useCounter(50, 2000, isVisible, '$', 'M+');

  return (
    <section ref={sectionRef} style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--card-border)' }}>
      {/* Background decoration */}
      <div className="grid-overlay" />

      <div className="section-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="trust-grid">
        {/* Left Side: Stats */}
        <div style={{ zIndex: 5 }}>
          <div className="section-tag">Autonomous Operations</div>
          <h2 className="section-title">The Global Intelligence Network</h2>
          <p className="section-subtitle" style={{ marginBottom: '2.5rem' }}>
            ORBIT replaces static database tables with a live, self-optimizing semantic layer that translates data into actionable growth.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem'
          }}>
            {/* Stat 1 */}
            <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--accent-blue)' }}><Activity size={18} /></div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }} className="text-gradient">
                {signalCount}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '0.5rem' }}>
                Customer Signals Processed
              </div>
            </div>

            {/* Stat 2 */}
            <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--accent-purple)' }}><Network size={18} /></div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }} className="text-gradient">
                {engagementMultiplier}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '0.5rem' }}>
                Higher Engagement
              </div>
            </div>

            {/* Stat 3 */}
            <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--accent-blue)' }}><Cpu size={18} /></div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }} className="text-gradient">
                {automationRate}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '0.5rem' }}>
                Campaign Automation
              </div>
            </div>

            {/* Stat 4 */}
            <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--accent-purple)' }}><ShieldCheck size={18} /></div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }} className="text-gradient">
                {revenueInfluenced}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '0.5rem' }}>
                Revenue Influenced
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: High-tech SVG node animation */}
        <div style={{ display: 'flex', justifyContent: 'center', zIndex: 5, position: 'relative' }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '500px',
            height: '420px',
            padding: '1.5rem',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            {/* SVG Network Map */}
            <svg width="100%" height="100%" viewBox="0 0 400 350" style={{ position: 'absolute' }}>
              {/* Connection Vectors */}
              <g stroke="var(--card-border)" strokeWidth="1.5">
                {/* Core to Node Connections */}
                <line x1="200" y1="175" x2="80" y2="80" className="line-vector" />
                <line x1="200" y1="175" x2="320" y2="80" className="line-vector" />
                <line x1="200" y1="175" x2="80" y2="270" className="line-vector" />
                <line x1="200" y1="175" x2="320" y2="270" className="line-vector" />
                
                {/* Outer connections */}
                <line x1="80" y1="80" x2="320" y2="80" strokeDasharray="4 4" />
                <line x1="80" y1="80" x2="80" y2="270" strokeDasharray="4 4" />
                <line x1="320" y1="80" x2="320" y2="270" strokeDasharray="4 4" />
                <line x1="80" y1="270" x2="320" y2="270" strokeDasharray="4 4" />
              </g>

              {/* Vector flow pulses */}
              <circle r="4" fill="var(--accent-blue)">
                <animateMotion 
                  dur="4s" 
                  repeatCount="indefinite" 
                  path="M 200,175 L 80,80" 
                />
              </circle>
              <circle r="4" fill="var(--accent-purple)">
                <animateMotion 
                  dur="3s" 
                  repeatCount="indefinite" 
                  path="M 200,175 L 320,80" 
                />
              </circle>
              <circle r="4" fill="var(--accent-blue)">
                <animateMotion 
                  dur="5s" 
                  repeatCount="indefinite" 
                  path="M 200,175 L 80,270" 
                />
              </circle>
              <circle r="4" fill="var(--accent-purple)">
                <animateMotion 
                  dur="3.5s" 
                  repeatCount="indefinite" 
                  path="M 200,175 L 320,270" 
                />
              </circle>

              {/* Node Circles */}
              {/* ORBIT core node */}
              <circle cx="200" cy="175" r="28" fill="var(--bg-secondary)" stroke="var(--accent-blue)" strokeWidth="3" className="node-pulse" />
              <text x="200" y="179" textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="bold" fontFamily="Space Grotesk">CORE</text>

              {/* Satellite nodes */}
              {/* Node 1: Polaris */}
              <circle cx="80" cy="80" r="18" fill="var(--bg-secondary)" stroke="var(--card-border)" strokeWidth="2" />
              <text x="80" y="84" textAnchor="middle" fill="var(--accent-blue)" fontSize="8" fontWeight="bold">POLARIS</text>
              <circle cx="80" cy="80" r="3" fill="var(--accent-blue)" />

              {/* Node 2: Nova */}
              <circle cx="320" cy="80" r="18" fill="var(--bg-secondary)" stroke="var(--card-border)" strokeWidth="2" />
              <text x="320" y="84" textAnchor="middle" fill="var(--accent-purple)" fontSize="8" fontWeight="bold">NOVA</text>
              <circle cx="320" cy="80" r="3" fill="var(--accent-purple)" />

              {/* Node 3: Vega */}
              <circle cx="80" cy="270" r="18" fill="var(--bg-secondary)" stroke="var(--card-border)" strokeWidth="2" />
              <text x="80" y="274" textAnchor="middle" fill="var(--accent-blue)" fontSize="8" fontWeight="bold">VEGA</text>
              <circle cx="80" cy="270" r="3" fill="var(--accent-blue)" />

              {/* Node 4: Atlas */}
              <circle cx="320" cy="270" r="18" fill="var(--bg-secondary)" stroke="var(--card-border)" strokeWidth="2" />
              <text x="320" y="274" textAnchor="middle" fill="var(--accent-purple)" fontSize="8" fontWeight="bold">ATLAS</text>
              <circle cx="320" cy="270" r="3" fill="var(--accent-purple)" />
            </svg>
            
            {/* Visual labels overlay */}
            <div style={{
              position: 'absolute',
              bottom: '1.5rem',
              display: 'flex',
              gap: '1rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontWeight: 500
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-blue)' }} /> Data Ingestion
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-purple)' }} /> Executing Nodes
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .trust-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 5rem;
          align-items: center;
        }
        @media (max-width: 991px) {
          .trust-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }
        .line-vector {
          stroke-dasharray: 8 4;
          animation: dashVector 30s linear infinite;
        }
        @keyframes dashVector {
          to {
            stroke-dashoffset: -1000;
          }
        }
      `}</style>
    </section>
  );
}
