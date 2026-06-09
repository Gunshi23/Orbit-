import React, { useState } from 'react';
import { Database, Eye, Users, Palette, Send, ArrowRightLeft } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Customer Data',
    icon: Database,
    description: 'Ingests real-time events, purchase histories, product logs, and profile attributes from CDPs, warehouses, or APIs.',
    details: 'ORBIT establishes bidirectional syncs with Snowflake, BigQuery, Segment, or direct REST APIs. Ingested data is immediately mapped to a unified customer entity schema.'
  },
  {
    id: 2,
    title: 'AI Understanding',
    icon: Eye,
    description: 'Autonomous embeddings parse semantic relations, predicting churn probability, next purchase timing, and channel affinity.',
    details: 'Customer event streams are vector-embedded. Our proprietary neural networks run real-time inference on customer risk weights, frequency decay, and value models.'
  },
  {
    id: 3,
    title: 'Audience Discovery',
    icon: Users,
    description: 'AI agents automatically isolate high-opportunity customer segments without manual cohort builders or SQL.',
    details: 'Instead of building SQL rules, agents continuously monitor cohorts, clustering users by semantic criteria (e.g. "inactive buyers likely to click discount offers").'
  },
  {
    id: 4,
    title: 'Campaign Creation',
    icon: Palette,
    description: 'Nova drafts highly context-aware text, localized templates, and sets personalized offer levels using LLMs.',
    details: 'Agents use generative text models calibrated with past campaign conversion data, automatically drafting highly specialized email, WhatsApp, and push notifications.'
  },
  {
    id: 5,
    title: 'Multi Channel Delivery',
    icon: Send,
    description: 'Atlas dispatches notifications via optimized delivery webhooks at the exact minute each user is most active.',
    details: 'Supports native dispatchers and integrations (Twilio, SendGrid, Braze, Klaviyo, WhatsApp Business). Deliveries are paced over dynamic curves to avoid rate limits.'
  },
  {
    id: 6,
    title: 'Revenue Growth',
    icon: ArrowRightLeft,
    description: 'Attribution engines track return metrics, feeding data back into the AI core to improve the next predictive run.',
    details: 'Conversions are verified on-chain or via ledger syncs, instantly closing the feedback loop to refine the predictive models of Polaris and Vega.'
  }
];

export default function Intelligence() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section id="pipeline" style={{ position: 'relative', borderBottom: '1px solid var(--card-border)' }}>
      <div className="grid-overlay" />

      <div className="section-container" style={{ paddingBottom: '6rem' }}>
        {/* Header */}
        <div className="header-center">
          <div className="section-tag">Operating Architecture</div>
          <h2 className="section-title">The Loop of Autonomous Intelligence</h2>
          <p className="section-subtitle">
            See how ORBIT converts raw events into self-running campaigns and compounding returns.
          </p>
        </div>

        {/* Horizontal Steps Pipeline */}
        <div className="pipeline-track" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          position: 'relative',
          gap: '1rem',
          marginBottom: '4rem'
        }}>
          {/* Connection Line */}
          <div className="pipeline-line" style={{
            position: 'absolute',
            top: '28px',
            left: '5%',
            width: '90%',
            height: '2px',
            background: 'var(--card-border)',
            zIndex: 1
          }}>
            {/* Active glowing indicator */}
            <div style={{
              height: '100%',
              width: `${((activeStep - 1) / (steps.length - 1)) * 100}%`,
              background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))',
              transition: 'width 0.5s ease',
              boxShadow: '0 0 10px var(--accent-blue)'
            }} />
          </div>

          {/* Individual Step Nodes */}
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id <= activeStep;
            const isCurrent = step.id === activeStep;

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 5,
                  cursor: 'pointer',
                  width: '15%',
                  minWidth: '100px',
                  textAlign: 'center'
                }}
              >
                {/* Node Ring */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: isCurrent ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' : 'var(--bg-secondary)',
                  border: isCurrent 
                    ? 'none' 
                    : `2px solid ${isActive ? 'var(--accent-blue)' : 'var(--card-border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCurrent ? '#ffffff' : (isActive ? 'var(--accent-blue)' : 'var(--text-secondary)'),
                  transition: 'all 0.3s ease',
                  boxShadow: isCurrent ? '0 0 20px rgba(139, 92, 246, 0.4)' : 'none'
                }}>
                  <Icon size={20} />
                </div>

                {/* Node Title */}
                <h4 style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginTop: '1rem',
                  fontFamily: 'Space Grotesk',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'color 0.3s'
                }}>
                  {step.title}
                </h4>
              </button>
            );
          })}
        </div>

        {/* Detailed Panel Card */}
        <div className="glass-panel" style={{
          padding: '2.5rem',
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '3rem',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 5
        }}>
          {/* Subtle Glow inside the Panel */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent-glow-blue) 0%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none'
          }} />

          {/* Description */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                background: 'var(--accent-glow-blue)',
                color: 'var(--accent-blue)',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                fontWeight: 600
              }}>
                STAGE 0{steps[activeStep - 1].id}
              </span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 600, fontFamily: 'Space Grotesk' }}>
                {steps[activeStep - 1].title}
              </h3>
            </div>
            
            <p style={{
              fontSize: '1.05rem',
              color: 'var(--text-primary)',
              lineHeight: 1.6,
              marginBottom: '1.5rem'
            }}>
              {steps[activeStep - 1].description}
            </p>

            <p style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}>
              {steps[activeStep - 1].details}
            </p>
          </div>

          {/* Interactive illustration */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '240px',
            position: 'relative'
          }}>
            {/* Displaying step specific decorative visual */}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', fontWeight: 600 }}>
              Operational Visualization
            </div>

            <div style={{
              fontSize: '4.5rem',
              fontWeight: 700,
              fontFamily: 'Space Grotesk',
              color: 'rgba(255, 255, 255, 0.03)',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 0,
              userSelect: 'none'
            }}>
              0{steps[activeStep - 1].id}
            </div>

            <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'var(--accent-glow-blue)',
                color: 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                border: '1px solid var(--card-border)'
              }}>
                {React.createElement(steps[activeStep - 1].icon, { size: 28 })}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                Active routing: {steps[activeStep - 1].title.toLowerCase()}.local
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .pipeline-track {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 2rem !important;
            margin-bottom: 2rem !important;
          }
          .pipeline-line {
            display: none !important;
          }
          .pipeline-track button {
            width: 100% !important;
            flex-direction: row !important;
            text-align: left !important;
            gap: 1rem;
          }
          .pipeline-track button h4 {
            margin-top: 0 !important;
          }
          .glass-panel {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </section>
  );
}
