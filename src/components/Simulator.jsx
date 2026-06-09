import React, { useState, useEffect } from 'react';
import { Sliders, Target, CheckCircle2, TrendingUp, Info } from 'lucide-react';

const AUDIENCES = [
  { label: 'Dormant Customers (432 users)', size: 432, aov: 3200, baseConv: 0.048, labelShort: 'Dormant' },
  { label: 'Cart Abandoners (1,280 users)', size: 1280, aov: 2800, baseConv: 0.082, labelShort: 'Abandoners' },
  { label: 'VIP Spenders (98 users)', size: 98, aov: 8500, baseConv: 0.12, labelShort: 'VIPs' }
];

const CHANNELS = [
  { label: 'WhatsApp Business', openRateBase: 0.88, ctrBase: 0.18, costFactor: 1.5, code: 'WA' },
  { label: 'Email Broadcast', openRateBase: 0.26, ctrBase: 0.045, costFactor: 0.2, code: 'EM' },
  { label: 'SMS Gateway', openRateBase: 0.62, ctrBase: 0.08, costFactor: 0.8, code: 'SMS' }
];

export default function Simulator() {
  const [selectedAudIndex, setSelectedAudIndex] = useState(0);
  const [selectedChanIndex, setSelectedChanIndex] = useState(0);
  const [discount, setDiscount] = useState(15); // Percentage slider (0 - 30)

  // Simulation Metrics State
  const [metrics, setMetrics] = useState({
    openRate: 0,
    ctr: 0,
    conversion: 0,
    revenue: 0,
    confidence: 0
  });

  useEffect(() => {
    const aud = AUDIENCES[selectedAudIndex];
    const chan = CHANNELS[selectedChanIndex];

    // Compute values dynamically
    // Open rate increases slightly with discount (up to +6%)
    const openRate = Math.min(chan.openRateBase + (discount * 0.002), 0.98);

    // CTR increases significantly with discount (multiplier up to 1.8x at 30%)
    const ctrMultiplier = 1.0 + (discount * 0.025);
    const ctr = Math.min(chan.ctrBase * ctrMultiplier, 0.45);

    // Conversion derived from baseline conversion, channel CTR efficiency, and discount level
    const discountEffect = 1.0 + (discount * 0.035);
    const conversion = Math.min(aud.baseConv * (chan.ctrBase / 0.1) * discountEffect, 0.4);

    // Projected Revenue = Size * Conversion * (AOV - Discount Value)
    const discountAmount = aud.aov * (discount / 100);
    const finalAov = aud.aov - discountAmount;
    const revenue = Math.round(aud.size * conversion * finalAov);

    // Confidence score starts high, decreases slightly as audience size or discount ranges fluctuate
    const confidence = Math.round(96 - (discount * 0.2) - (aud.size * 0.002));

    setMetrics({
      openRate: Math.round(openRate * 100),
      ctr: Math.round(ctr * 100),
      conversion: (conversion * 100).toFixed(1),
      revenue,
      confidence
    });
  }, [selectedAudIndex, selectedChanIndex, discount]);

  return (
    <section id="simulator" style={{ position: 'relative', borderBottom: '1px solid var(--card-border)' }}>
      <div className="grid-overlay" />

      <div className="section-container">
        {/* Header */}
        <div className="header-center">
          <div className="section-tag">Simulator Engine</div>
          <h2 className="section-title">The ORBIT Mission Simulator</h2>
          <p className="section-subtitle">
            Input segment sizes, delivery channels, and offer discounts. Our neural prediction grid estimates outcomes before spending a single rupee.
          </p>
        </div>

        {/* Simulator Dashboard Container */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.1fr',
          gap: '4rem',
          alignItems: 'stretch',
          zIndex: 5
        }} className="simulator-grid">
          
          {/* Left Side: Controls Panel */}
          <div className="glass-panel" style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            border: '1px solid var(--card-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
              <Sliders size={18} style={{ color: 'var(--accent-blue)' }} />
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'Space Grotesk' }}>Simulation Inputs</h3>
            </div>

            {/* Input 1: Audience */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Target Cohort</label>
              <select
                value={selectedAudIndex}
                onChange={(e) => setSelectedAudIndex(Number(e.target.value))}
                className="form-input"
                style={{ width: '100%', cursor: 'pointer' }}
              >
                {AUDIENCES.map((item, idx) => (
                  <option key={idx} value={idx}>{item.label}</option>
                ))}
              </select>
            </div>

            {/* Input 2: Channel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Delivery Channel</label>
              <select
                value={selectedChanIndex}
                onChange={(e) => setSelectedChanIndex(Number(e.target.value))}
                className="form-input"
                style={{ width: '100%', cursor: 'pointer' }}
              >
                {CHANNELS.map((item, idx) => (
                  <option key={idx} value={idx}>{item.label}</option>
                ))}
              </select>
            </div>

            {/* Input 3: Discount Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Incentive Offer (Discount)</label>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-purple)', fontFamily: 'Space Grotesk' }}>{discount}% OFF</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  accentColor: 'var(--accent-purple)'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                <span>0% (No discount)</span>
                <span>15% (Optimal)</span>
                <span>30% (Max Margin loss)</span>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              border: '1px solid var(--card-border)'
            }}>
              <Info size={16} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
              <span>Vega predicts higher WhatsApp conversion but cautions against discount wearout patterns.</span>
            </div>
          </div>

          {/* Right Side: Predictions Dashboard */}
          <div className="glass-panel" style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid var(--card-border)'
          }}>
            {/* Predicted values Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {/* Metric 1 */}
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Simulated Open Rate</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'Space Grotesk', marginTop: '0.25rem' }}>{metrics.openRate}%</div>
                <div style={{ height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${metrics.openRate}%`, height: '100%', background: 'var(--accent-blue)', transition: 'width 0.4s ease' }} />
                </div>
              </div>

              {/* Metric 2 */}
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Simulated Click Rate (CTR)</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'Space Grotesk', marginTop: '0.25rem' }}>{metrics.ctr}%</div>
                <div style={{ height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${metrics.ctr}%`, height: '100%', background: 'var(--accent-purple)', transition: 'width 0.4s ease' }} />
                </div>
              </div>

              {/* Metric 3 */}
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conversion Rate</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'Space Grotesk', marginTop: '0.25rem' }}>{metrics.conversion}%</div>
                <div style={{ height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${parseFloat(metrics.conversion) * 2.5}%`, height: '100%', background: 'var(--accent-blue)', transition: 'width 0.4s ease' }} />
                </div>
              </div>

              {/* Metric 4 */}
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence Score</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'Space Grotesk', marginTop: '0.25rem' }}>{metrics.confidence}%</div>
                <div style={{ height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${metrics.confidence}%`, height: '100%', background: '#10B981', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            </div>

            {/* Custom SVG chart showing Revenue Projection */}
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Projected Revenue Return</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10B981', fontFamily: 'Space Grotesk' }}>₹{metrics.revenue.toLocaleString('en-IN')}</span>
              </div>

              {/* Custom SVG chart container representing dynamic output change */}
              <div style={{ height: '120px', width: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
                  {/* Dynamic Line Graph representing revenue curve projection */}
                  {/* We generate path values depending on metrics state */}
                  <defs>
                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Draw grid background lines */}
                  <line x1="0" y1="20" x2="300" y2="20" stroke="var(--card-border)" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="300" y2="50" stroke="var(--card-border)" strokeWidth="0.5" />
                  <line x1="0" y1="80" x2="300" y2="80" stroke="var(--card-border)" strokeWidth="0.5" />

                  {/* Area fill */}
                  <path 
                    d={`M 0,100 L 50,85 L 120,70 L 200,${95 - (metrics.conversion * 1.8)} L 300,${100 - (metrics.revenue / 20000) * 80} L 300,100 Z`} 
                    fill="url(#chartGlow)" 
                    transition="all 0.5s ease" 
                    style={{ transition: 'd 0.5s ease' }}
                  />

                  {/* Line */}
                  <path 
                    d={`M 0,100 L 50,85 L 120,70 L 200,${95 - (metrics.conversion * 1.8)} L 300,${100 - (metrics.revenue / 20000) * 80}`} 
                    fill="none" 
                    stroke="var(--accent-blue)" 
                    strokeWidth="2.5" 
                    style={{ transition: 'd 0.5s ease' }}
                  />

                  {/* Nodes */}
                  <circle cx="300" cy={100 - (metrics.revenue / 20000) * 80} r="4" fill="#10B981" style={{ transition: 'cy 0.5s ease' }} />
                </svg>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                <span>COHORT TRIGGER</span>
                <span>AI REASONING STAGE</span>
                <span>MAX DISPATCH</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .simulator-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 4rem;
        }
        @media (max-width: 991px) {
          .simulator-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
        }
      `}</style>
    </section>
  );
}
