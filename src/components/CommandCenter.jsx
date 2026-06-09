import React, { useState, useEffect } from 'react';
import { Send, Terminal, CheckCircle, Sparkles, MessageSquare, Play } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const presetQueries = [
  {
    prompt: 'Increase repeat purchases from inactive customers.',
    audience: '432 high-value inactive customers',
    revenue: '₹1.2 Lakhs',
    channel: 'WhatsApp & SMS',
    reasoning: [
      'Scanning CDP database for customers active >90 days ago with CLV > ₹5,000.',
      'Identified cohort: Average order frequency 28 days; elapsed since last buy: 110 days.',
      'Analyzing preferred channels: WhatsApp has 88% engagement rate in this cohort.',
      'Drafting promotion: 15% discount dynamic offer, valid for 48 hours.'
    ],
    copy: 'Hey {first_name}! We missed you. We noticed it’s been a while since your last purchase. Here is a custom 15% off voucher valid for the next 48 hours. Tap here to redeem: orb.it/vip'
  },
  {
    prompt: 'Recover abandoned cart users with high buying intent.',
    audience: '1,280 checkout-dropouts (last 24h)',
    revenue: '₹3.8 Lakhs',
    channel: 'Email',
    reasoning: [
      'Scanning checkout logs for users who added items to cart but did not purchase.',
      'Filtering out items out of stock; verifying checkout funnel completion rates.',
      'Estimated cart value: ₹12.5 Lakhs; average cart size: 2.1 items.',
      'Setting up automated triggers: Email 1 at +2h, Email 2 at +24h.'
    ],
    copy: 'Hi {first_name}! You left some premium items in your bag. They are selling out fast! Click here to complete your checkout with free shipping: orb.it/cart'
  },
  {
    prompt: 'Promote VIP loyalty gift to top 1% spender cohort.',
    audience: '98 active VIP buyers',
    revenue: '₹5.5 Lakhs',
    channel: 'WhatsApp & Email',
    reasoning: [
      'Filtering users by total spend thresholds > ₹50,000 in past 6 months.',
      'Verifying loyalty tier allocation metrics; generating exclusive VIP codes.',
      'Selecting optimal channels: high-touch personalized WhatsApp messages.',
      'Nova draft: Customized message introducing the VIP loyalty reward gift box.'
    ],
    copy: 'Dear {first_name}, as a valued ORBIT VIP customer, we’ve reserved a special custom edition anniversary gift box for you. Claim your gift box now: orb.it/gift-vip'
  }
];

export default function CommandCenter() {
  const [activeQueryIndex, setActiveQueryIndex] = useState(0);
  const [typedPrompt, setTypedPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [activeReasoningLine, setActiveReasoningLine] = useState(0);
  const [campaignLaunched, setCampaignLaunched] = useState(false);

  const query = presetQueries[activeQueryIndex];

  // Start typing simulation when active query changes
  useEffect(() => {
    setIsTyping(true);
    setShowResult(false);
    setCampaignLaunched(false);
    setActiveReasoningLine(0);
    setTypedPrompt('');

    const targetPrompt = query.prompt;
    let charIdx = 0;
    
    const typingInterval = setInterval(() => {
      if (charIdx < targetPrompt.length) {
        setTypedPrompt((prev) => prev + targetPrompt.charAt(charIdx));
        charIdx++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        // Start showing reasoning lines one by one
        simulateReasoning();
      }
    }, 25);

    return () => clearInterval(typingInterval);
  }, [activeQueryIndex]);

  const simulateReasoning = () => {
    let lineIdx = 0;
    const interval = setInterval(() => {
      if (lineIdx < query.reasoning.length) {
        setActiveReasoningLine(lineIdx + 1);
        lineIdx++;
      } else {
        clearInterval(interval);
        setShowResult(true);
      }
    }, 800);
  };

  const handleLaunchCampaign = async () => {
    setCampaignLaunched(true);
    try {
      await addDoc(collection(db, 'campaigns'), {
        prompt: query.prompt,
        audience_size: query.audience,
        predicted_revenue: query.revenue,
        channel: query.channel,
        copy: query.copy,
        status: 'Active',
        launched_at: new Date()
      });
    } catch (err) {
      console.error('Error saving campaign to Firestore:', err);
    }
    setTimeout(() => {
      setCampaignLaunched(false);
    }, 4000);
  };

  return (
    <section id="command-center" style={{ position: 'relative', borderBottom: '1px solid var(--card-border)' }}>
      <div className="grid-overlay" />

      <div className="section-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '5rem', alignItems: 'center' }} className="command-grid">
        {/* Left Side Info */}
        <div style={{ zIndex: 5 }}>
          <div className="section-tag">AI Console</div>
          <h2 className="section-title">Futuristic Command Center</h2>
          <p className="section-subtitle">
            Say goodbye to complex dashboard segmentation builders. Just type your growth objectives, and let ORBIT's operating system run the rest.
          </p>

          {/* Presets Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Select a Command Scenario:
            </div>
            {presetQueries.map((item, idx) => (
              <button
                key={idx}
                onClick={() => !isTyping && setActiveQueryIndex(idx)}
                style={{
                  background: idx === activeQueryIndex ? 'var(--accent-glow-blue)' : 'var(--card-bg)',
                  border: `1px solid ${idx === activeQueryIndex ? 'var(--accent-blue)' : 'var(--card-border)'}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'left',
                  cursor: isTyping ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <MessageSquare size={16} style={{ color: idx === activeQueryIndex ? 'var(--accent-blue)' : 'var(--text-secondary)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.prompt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side Chat Terminal */}
        <div style={{ zIndex: 5, position: 'relative' }}>
          <div className="glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '520px',
            overflow: 'hidden',
            border: '1px solid var(--card-border)'
          }}>
            {/* Header bar */}
            <div style={{
              padding: '0.75rem 1.25rem',
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--card-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                  orbit-core-cli v1.4.0
                </span>
              </div>
              <Terminal size={14} style={{ color: 'var(--text-secondary)' }} />
            </div>

            {/* Chat Body */}
            <div style={{
              flex: 1,
              padding: '1.5rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              lineHeight: 1.5
            }}>
              {/* User Prompt Bubble */}
              <div style={{
                alignSelf: 'flex-end',
                background: 'var(--accent-glow-blue)',
                border: '1px solid var(--accent-blue)',
                padding: '0.75rem 1rem',
                borderRadius: '12px 12px 0 12px',
                maxWidth: '85%',
                color: 'var(--text-primary)'
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', marginBottom: '0.2rem', fontWeight: 600 }}>OPERATOR</div>
                {typedPrompt}
                {isTyping && <span className="cursor-blink">|</span>}
              </div>

              {/* ORBIT AI Response */}
              {(typedPrompt.length === query.prompt.length) && (
                <div style={{
                  alignSelf: 'flex-start',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--card-border)',
                  padding: '1rem',
                  borderRadius: '12px 12px 12px 0',
                  maxWidth: '90%',
                  width: '100%',
                  color: 'var(--text-primary)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--accent-purple)', marginBottom: '0.5rem', fontWeight: 600 }}>
                    <Sparkles size={10} /> ORBIT INTEL CORE
                  </div>

                  {/* Thinking Reasoning steps */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {query.reasoning.map((step, idx) => (
                      <div 
                        key={idx} 
                        style={{
                          opacity: activeReasoningLine > idx ? 1 : 0,
                          transform: activeReasoningLine > idx ? 'translateY(0)' : 'translateY(5px)',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.4rem'
                        }}
                      >
                        <span style={{ color: 'var(--accent-blue)' }}>●</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>

                  {/* Results box */}
                  {showResult && (
                    <div style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '8px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      animation: 'fadeIn 0.5s ease forwards'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Audience Identified</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-blue)', fontFamily: 'Space Grotesk' }}>{query.audience}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Predicted Return</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10B981', fontFamily: 'Space Grotesk' }}>{query.revenue}</div>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '0.5rem' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Nova Draft ({query.channel})</div>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px dashed var(--card-border)',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          fontSize: '0.75rem',
                          fontStyle: 'italic',
                          lineHeight: 1.4
                        }}>
                          "{query.copy}"
                        </div>
                      </div>

                      {/* Dispatch Trigger Button */}
                      <button
                        onClick={handleLaunchCampaign}
                        disabled={campaignLaunched}
                        style={{
                          background: campaignLaunched ? '#10B981' : 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.6rem 1rem',
                          color: '#ffffff',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          fontFamily: 'Space Grotesk',
                          transition: 'all 0.3s'
                        }}
                      >
                        {campaignLaunched ? (
                          <>
                            <CheckCircle size={14} /> CAMPAIGN DEPLOYED!
                          </>
                        ) : (
                          <>
                            <Play size={10} fill="currentColor" /> LAUNCH CAMPAIGN ON AUTOPILOT
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .command-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 5rem;
          align-items: center;
        }
        @media (max-width: 991px) {
          .command-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }
        .cursor-blink {
          animation: blinkCursor 0.8s steps(2, start) infinite;
        }
        @keyframes blinkCursor {
          to { visibility: hidden; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
