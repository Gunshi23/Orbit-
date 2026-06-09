import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Users, TrendingUp, CheckCircle } from 'lucide-react';

const initialLogs = [
  'WhatsApp message dispatched to +91 98122-XXXXX (Status: Delivered)',
  'Email conversion tracked for user_98129 (AOV: ₹4,500)',
  'Polaris identified new cohort: 14 Churn-risk VIP users isolation completed',
  'WhatsApp click-through detected from +91 95400-XXXXX (Target code: orb.it/vip)',
  'Vega prediction score calibrated: Model precision at 98.4%',
  'Atlas automated email queue dispatch completed (1,280 checkout abandonment instances)'
];

export default function Dashboard() {
  const [revenue, setRevenue] = useState(412450);
  const [activeRuns, setActiveRuns] = useState(12);
  const [liveLogs, setLiveLogs] = useState(initialLogs);
  
  // High-performance real-time data points for line chart
  const [chartData, setChartData] = useState([45, 60, 55, 70, 65, 80, 75, 90, 85, 100]);

  useEffect(() => {
    // Dynamic Ticking Revenue
    const revInterval = setInterval(() => {
      setRevenue((prev) => prev + Math.floor(Math.random() * 250) + 20);
    }, 2500);

    // Live Telemetry Event Logs scrolling
    const logInterval = setInterval(() => {
      setLiveLogs((prev) => {
        const copy = [...prev];
        copy.shift(); // remove first
        const newLog = getRandomTelemetryLog();
        copy.push(newLog); // push new to end
        return copy;
      });
      
      // Update chart data points to simulate live waves
      setChartData((prev) => {
        const copy = [...prev];
        copy.shift();
        const nextVal = Math.min(Math.max(copy[copy.length - 1] + (Math.random() - 0.5) * 15, 30), 100);
        copy.push(Math.round(nextVal));
        return copy;
      });
    }, 4000);

    return () => {
      clearInterval(revInterval);
      clearInterval(logInterval);
    };
  }, []);

  const getRandomTelemetryLog = () => {
    const customNames = ['+91 99100-XXXXX', 'user_8820', '+91 90112-XXXXX', 'user_4031', 'VIP_Spender_09', 'Checkout_Abandoner_92'];
    const logsPool = [
      `WhatsApp webhook response received from ${customNames[Math.floor(Math.random() * customNames.length)]} (Status: Read)`,
      `Order conversion tracked successfully (Revenue: ₹${(Math.floor(Math.random() * 5000) + 1200).toLocaleString('en-IN')})`,
      `Polaris database sync finished. Segment cluster parameters updated.`,
      `Nova template variation C selected automatically based on user channel affinity.`,
      `Atlas webhook delivery throttle: dispatch queue speed adjusted dynamically.`,
      `Email triggered webhook: complete cart checkout sequence initialized.`
    ];
    return logsPool[Math.floor(Math.random() * logsPool.length)];
  };

  // Convert chartData array into SVG path string
  const getSvgPath = () => {
    const width = 450;
    const height = 120;
    const step = width / (chartData.length - 1);
    
    return chartData.map((val, idx) => {
      const x = idx * step;
      // Invert Y coordinate so higher values are drawn at top
      const y = height - (val / 100) * (height - 20) - 10;
      return `${idx === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');
  };

  const getAreaPath = (linePath) => {
    return `${linePath} L 450,120 L 0,120 Z`;
  };

  return (
    <section id="dashboard" style={{ position: 'relative', borderBottom: '1px solid var(--card-border)' }}>
      <div className="grid-overlay" />

      <div className="section-container">
        {/* Header */}
        <div className="header-center">
          <div className="section-tag">Executive Hub</div>
          <h2 className="section-title">Mission Control Dashboard</h2>
          <p className="section-subtitle">
            A real-time display tracking agent campaigns, live revenue updates, and pipeline telemetry logs.
          </p>
        </div>

        {/* Dashboard Frame */}
        <div className="glass-panel" style={{
          padding: '2.5rem',
          border: '1px solid var(--card-border)',
          zIndex: 5,
          position: 'relative'
        }}>
          {/* Top Panel: Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {/* Metric 1 */}
            <div style={{ borderRight: '1px solid var(--card-border)', paddingRight: '1rem' }} className="dash-metric-border">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <TrendingUp size={14} style={{ color: '#10B981' }} /> LIVE REVENUE TODAY
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'Space Grotesk', marginTop: '0.5rem', color: '#10B981' }}>
                ₹{revenue.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Ticking up in real time...
              </div>
            </div>

            {/* Metric 2 */}
            <div style={{ borderRight: '1px solid var(--card-border)', paddingRight: '1rem' }} className="dash-metric-border">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <Activity size={14} style={{ color: 'var(--accent-blue)' }} /> ACTIVE RUNS
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'Space Grotesk', marginTop: '0.5rem' }}>
                {activeRuns} campaigns
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                All systems functional (100% capacity)
              </div>
            </div>

            {/* Metric 3 */}
            <div style={{ borderRight: '1px solid var(--card-border)', paddingRight: '1rem' }} className="dash-metric-border">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <Users size={14} style={{ color: 'var(--accent-purple)' }} /> AUDIENCE REACHED
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'Space Grotesk', marginTop: '0.5rem' }}>
                248.5K users
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                +1.2% growth past 24 hours
              </div>
            </div>

            {/* Metric 4 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <CheckCircle size={14} style={{ color: 'var(--accent-blue)' }} /> AVG CONVERSION
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'Space Grotesk', marginTop: '0.5rem' }}>
                11.4%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Optimized by Vega predictions
              </div>
            </div>
          </div>

          {/* Bottom Panel: Grid with chart & telemetry log console */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '3rem'
          }} className="dashboard-subgrid">
            
            {/* Left: Real-time Line Graph */}
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Campaign Conversion Frequency</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-blue)', animation: 'pulseGlow 1.5s infinite' }} />
                  Live Stream (3s refresh)
                </span>
              </div>

              {/* Shifting Wave SVG */}
              <div style={{ height: '140px', width: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                <svg width="100%" height="100%" viewBox="0 0 450 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="liveGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  <line x1="0" y1="30" x2="450" y2="30" stroke="var(--card-border)" strokeWidth="0.5" />
                  <line x1="0" y1="65" x2="450" y2="65" stroke="var(--card-border)" strokeWidth="0.5" />
                  <line x1="0" y1="100" x2="450" y2="100" stroke="var(--card-border)" strokeWidth="0.5" />

                  {/* Area path */}
                  <path 
                    d={getAreaPath(getSvgPath())} 
                    fill="url(#liveGlow)" 
                    style={{ transition: 'd 0.8s ease' }}
                  />

                  {/* Line path */}
                  <path 
                    d={getSvgPath()} 
                    fill="none" 
                    stroke="var(--accent-blue)" 
                    strokeWidth="2" 
                    style={{ transition: 'd 0.8s ease' }}
                  />
                </svg>
              </div>
            </div>

            {/* Right: Telemetry Event Logs */}
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                <ShieldAlert size={14} style={{ color: 'var(--accent-purple)' }} /> SYSTEM TELEMETRY
              </div>

              {/* Logs display */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontFamily: 'monospace',
                fontSize: '0.72rem',
                height: '140px',
                overflowY: 'hidden'
              }}>
                {liveLogs.map((log, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      color: index === liveLogs.length - 1 ? '#a7f3d0' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      animation: index === liveLogs.length - 1 ? 'fadeIn 0.5s ease forwards' : 'none'
                    }}
                  >
                    &gt; {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-subgrid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 3rem;
        }
        @media (max-width: 991px) {
          .dashboard-subgrid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .dash-metric-border {
            border-right: none !important;
            border-bottom: 1px solid var(--card-border);
            padding-bottom: 1.5rem;
            padding-right: 0 !important;
          }
        }
      `}</style>
    </section>
  );
}
