import React, { useEffect, useRef, useState } from 'react';
import { Compass, Sparkles, ShieldCheck, TrendingUp, Search } from 'lucide-react';

const mockCustomers = [
  { id: 'user_0940', dna: 'High-Value VIP Spender', risk: '4% (Very Low)', channel: 'WhatsApp', nextPurchase: 'June 12, 2026', orderValue: '₹8,500', x: 150, y: 120 },
  { id: 'user_8820', dna: 'Dormant Cart Dropper', risk: '76% (High Risk)', channel: 'SMS', nextPurchase: 'June 18, 2026 (Est.)', orderValue: '₹3,200', x: 280, y: 80 },
  { id: 'user_4031', dna: 'Loyal Response Cohort', risk: '12% (Low)', channel: 'WhatsApp', nextPurchase: 'June 25, 2026', orderValue: '₹4,500', x: 80, y: 220 },
  { id: 'user_1190', dna: 'First-Time Converter', risk: '34% (Medium)', channel: 'Email', nextPurchase: 'July 04, 2026', orderValue: '₹1,800', x: 340, y: 240 },
  { id: 'user_7761', dna: 'Periodic Bulk Buyer', risk: '22% (Low)', channel: 'Email', nextPurchase: 'June 30, 2026', orderValue: '₹12,000', x: 220, y: 200 }
];

export default function GalaxyZoom() {
  const canvasRef = useRef(null);
  const [selectedCustIndex, setSelectedCustIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const activeCustomer = mockCustomers[selectedCustIndex];

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationId;
    let width = canvas.width = 500;
    let height = canvas.height = 300;

    // Static array of background stars
    const starCount = 180;
    const backgroundStars = [];
    for (let i = 0; i < starCount; i++) {
      backgroundStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.5 + Math.random() * 1.5,
        alpha: 0.1 + Math.random() * 0.7,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        seed: Math.random()
      });
    }

    // Target zoom & pan variables for smooth interpolation (ease out)
    let currentScale = 1;
    let currentPan = { x: 0, y: 0 };
    
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smoothly interpolate scale and offsets
      const targetScale = selectedCustIndex !== null ? 2.2 : 1;
      const targetPanX = selectedCustIndex !== null ? (width / 2 - activeCustomer.x * targetScale) : 0;
      const targetPanY = selectedCustIndex !== null ? (height / 2 - activeCustomer.y * targetScale) : 0;

      currentScale += (targetScale - currentScale) * 0.08;
      currentPan.x += (targetPanX - currentPan.x) * 0.08;
      currentPan.y += (targetPanY - currentPan.y) * 0.08;

      ctx.save();
      // Apply translation and zoom transformations
      ctx.translate(currentPan.x, currentPan.y);
      ctx.scale(currentScale, currentScale);

      // Draw background stars
      backgroundStars.forEach((star) => {
        star.alpha += Math.sin(Date.now() * star.pulseSpeed) * 0.02;
        star.alpha = Math.max(Math.min(star.alpha, 0.9), 0.1);

        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections between customer nodes
      ctx.beginPath();
      ctx.moveTo(mockCustomers[0].x, mockCustomers[0].y);
      for (let i = 1; i < mockCustomers.length; i++) {
        ctx.lineTo(mockCustomers[i].x, mockCustomers[i].y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw Customer Nodes
      mockCustomers.forEach((cust, idx) => {
        const isTarget = idx === selectedCustIndex;

        // Draw node glow concentric rings
        if (isTarget) {
          const glowRadius = 8 + Math.sin(Date.now() * 0.005) * 4;
          const radialGlow = ctx.createRadialGradient(cust.x, cust.y, 0, cust.x, cust.y, glowRadius * 2);
          radialGlow.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
          radialGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = radialGlow;
          ctx.beginPath();
          ctx.arc(cust.x, cust.y, glowRadius * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw main node dot
        ctx.fillStyle = isTarget ? 'var(--accent-blue)' : 'var(--text-secondary)';
        ctx.beginPath();
        ctx.arc(cust.x, cust.y, isTarget ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Node ring border
        ctx.strokeStyle = isTarget ? '#ffffff' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = isTarget ? 1.5 : 1;
        ctx.beginPath();
        ctx.arc(cust.x, cust.y, isTarget ? 8 : 6, 0, Math.PI * 2);
        ctx.stroke();

        // Node ID Label
        if (isTarget || currentScale < 1.5) {
          ctx.fillStyle = isTarget ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
          ctx.font = isTarget ? 'bold 7px "Space Grotesk", sans-serif' : '5px "Space Grotesk", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(cust.id, cust.x, cust.y - 12);
        }
      });

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [selectedCustIndex]);

  const handleNext = () => {
    setSelectedCustIndex((prev) => (prev + 1) % mockCustomers.length);
  };

  const handlePrev = () => {
    setSelectedCustIndex((prev) => (prev - 1 + mockCustomers.length) % mockCustomers.length);
  };

  return (
    <section id="galaxy-zoom" style={{ position: 'relative', borderBottom: '1px solid var(--card-border)' }}>
      <div className="grid-overlay" />

      <div className="section-container" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '5rem', alignItems: 'center' }} className="galaxy-grid">
        {/* Left Side: Magical Zoomable Canvas */}
        <div style={{ zIndex: 5, position: 'relative' }}>
          <div className="glass-panel" style={{
            padding: '1rem',
            overflow: 'hidden',
            border: '1px solid var(--card-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            {/* Searching Overlay tag */}
            <div style={{
              position: 'absolute',
              top: '1.5rem',
              left: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              background: 'var(--bg-secondary)',
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid var(--card-border)',
              zIndex: 10
            }}>
              <Search size={12} style={{ color: 'var(--accent-blue)' }} />
              <span>GALAXY CAMERA LOCK: {activeCustomer.id}</span>
            </div>

            {/* Canvas */}
            <canvas ref={canvasRef} style={{ maxWidth: '100%', borderRadius: '12px', background: '#02040a' }} />

            {/* Control buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1.25rem',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CLICK TO CYCLE CUSTOMER LOCK</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handlePrev} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Prev</button>
                <button onClick={handleNext} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Next</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Customer HUD Info Card */}
        <div style={{ zIndex: 5 }}>
          <div className="section-tag">Microscopic Cohorts</div>
          <h2 className="section-title">The Customer Galaxy</h2>
          <p className="section-subtitle">
            Orbit maps every single customer as an autonomous node. Zoom into any star to inspect their genetic profiles, conversion forecasts, and purchase paths.
          </p>

          {/* Customer HUD Detail Card */}
          <div className="glass-panel" style={{
            padding: '2rem',
            border: '1px solid var(--card-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
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

            {/* Card Header ID */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>CUSTOMER NODE ID</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>{activeCustomer.id}</h3>
              </div>
              <span style={{
                fontSize: '0.7rem',
                color: 'var(--accent-blue)',
                background: 'var(--accent-glow-blue)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontFamily: 'monospace'
              }}>
                STATE: CONNECTED
              </span>
            </div>

            {/* DNA details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Customer DNA:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeCustomer.dna}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Churn Risk Index:</span>
                <span style={{ fontWeight: 600, color: activeCustomer.risk.includes('High') ? '#EF4444' : '#10B981' }}>{activeCustomer.risk}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Preferred Channel:</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{activeCustomer.channel}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Est. Next Purchase:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeCustomer.nextPurchase}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Forecasted AOV:</span>
                <span style={{ fontWeight: 600, color: '#10B981', fontFamily: 'Space Grotesk' }}>{activeCustomer.orderValue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .galaxy-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 5rem;
          align-items: center;
        }
        @media (max-width: 991px) {
          .galaxy-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }
      `}</style>
    </section>
  );
}
