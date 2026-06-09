import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, TrendingUp, Cpu, MessageSquare } from 'lucide-react';

const agentBubbles = [
  {
    agent: 'Polaris',
    role: 'Audience Intelligence',
    icon: Compass,
    color: 'var(--accent-blue)',
    text: 'Identified 432 high-value repeat customers who have been inactive for >90 days. Risk score: 82%. Recommending immediate re-engagement sequence.',
    delay: 1000
  },
  {
    agent: 'Vega',
    role: 'Performance Prediction',
    icon: TrendingUp,
    color: '#0ea5e9',
    text: 'Running simulator: Baseline re-engagement conversion is 4.8%. If we deploy on WhatsApp with a dynamic 15% discount offer, conversion probability jumps to 12.2% with ₹1.2L projected revenue.',
    delay: 4000
  },
  {
    agent: 'Nova',
    role: 'Campaign Creation',
    icon: Sparkles,
    color: 'var(--accent-purple)',
    text: 'Copy drafted. Variant A: "Hey {first_name}! We missed you..." dynamically injecting personalized checkout link. Testing subject lines now.',
    delay: 7500
  },
  {
    agent: 'Atlas',
    role: 'Campaign Execution',
    icon: Cpu,
    color: '#ec4899',
    text: 'API routing configured. Twilio WhatsApp gateway initialized. Ready to execute dispatch on operator approval.',
    delay: 11000
  }
];

export default function Boardroom() {
  const [messages, setMessages] = useState([]);
  const [typingAgent, setTypingAgent] = useState(null);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    // Reset boardroom timeline at start of cycle
    setMessages([]);
    setTypingAgent(null);

    const timeouts = [];

    // Schedule typing and posting messages
    agentBubbles.forEach((item, idx) => {
      // Show typing indicator
      const typingTimeout = setTimeout(() => {
        setTypingAgent(item.agent);
      }, item.delay - 800);

      // Post message
      const postTimeout = setTimeout(() => {
        setMessages((prev) => [...prev, item]);
        setTypingAgent(null);
      }, item.delay);

      timeouts.push(typingTimeout, postTimeout);
    });

    // Schedule next cycle loop at 16 seconds
    const loopTimeout = setTimeout(() => {
      setCycleCount((c) => c + 1);
    }, 15000);

    timeouts.push(loopTimeout);

    return () => timeouts.forEach((t) => clearTimeout(t));
  }, [cycleCount]);

  return (
    <section id="boardroom" style={{ position: 'relative', borderBottom: '1px solid var(--card-border)' }}>
      <div className="grid-overlay" />

      <div className="section-container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div className="header-center">
          <div className="section-tag">Collaboration Core</div>
          <h2 className="section-title">The Agent Boardroom</h2>
          <p className="section-subtitle">
            Watch ORBIT’s neural team negotiate marketing metrics, generate content drafts, and plan execution vectors dynamically.
          </p>
        </div>

        {/* Boardroom Chat Console */}
        <div className="glass-panel" style={{
          padding: '2.5rem 2rem',
          minHeight: '480px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: '1.5rem',
          border: '1px solid var(--card-border)',
          position: 'relative'
        }}>
          {/* Header watermark */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--card-border)',
            paddingBottom: '1rem',
            marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={14} /> ACTIVE AGENT DIALOGUE (AUTO-RUNNING)
            </span>
            <span style={{
              fontSize: '0.7rem',
              color: 'var(--accent-purple)',
              background: 'var(--accent-glow-purple)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              fontFamily: 'monospace'
            }}>
              thread_id: 82a3-f09c
            </span>
          </div>

          {/* Dialogues */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
            {messages.map((msg, idx) => {
              const Icon = msg.icon;
              return (
                <div 
                  key={idx} 
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    animation: 'fadeInSlideUp 0.4s ease forwards'
                  }}
                >
                  {/* Agent Avatar */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--card-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: msg.color,
                    flexShrink: 0
                  }}>
                    <Icon size={18} />
                  </div>

                  {/* Message Bubble */}
                  <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--card-border)',
                    padding: '1rem 1.25rem',
                    borderRadius: '0 12px 12px 12px',
                    maxWidth: '85%'
                  }}>
                    {/* Header meta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{msg.agent}</span>
                      <span style={{ fontSize: '0.7rem', color: msg.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{msg.role}</span>
                    </div>

                    {/* Text */}
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Live Typing Indicator Bubble */}
            {typingAgent && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                animation: 'fadeIn 0.2s ease forwards'
              }}>
                {/* Dummy Avatar */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--card-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-blue)',
                  flexShrink: 0
                }}>
                  <MessageSquare size={18} style={{ animation: 'pulseGlow 1.5s infinite' }} />
                </div>

                {/* Typing Dots bubble */}
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--card-border)',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0 12px 12px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, marginRight: '0.5rem' }}>
                    {typingAgent} is analyzing
                  </span>
                  <div className="typing-dot" />
                  <div className="typing-dot" style={{ animationDelay: '0.2s' }} />
                  <div className="typing-dot" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .typing-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--text-primary);
          animation: dotBounce 1s infinite alternate;
        }
        @keyframes dotBounce {
          from { transform: translateY(0); opacity: 0.3; }
          to { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes fadeInSlideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
