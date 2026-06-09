import React, { useEffect, useRef, useState } from 'react';
import { Play, Terminal, ArrowRight } from 'lucide-react';

export default function Hero({ launchOnboarding }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const progress = Math.min(Math.max(window.scrollY / (windowHeight * 0.8), 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationId;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = 1200;
    const particles = [];
    
    const getSegmentCenters = (w, h) => [
      { x: -w * 0.22, y: -h * 0.12, color: 'rgba(59, 130, 246, 0.8)' },
      { x: w * 0.22, y: -h * 0.12, color: 'rgba(139, 92, 246, 0.8)' },
      { x: -w * 0.22, y: h * 0.12, color: 'rgba(14, 165, 233, 0.8)' },
      { x: w * 0.22, y: h * 0.12, color: 'rgba(236, 72, 153, 0.8)' }
    ];

    for (let i = 0; i < particleCount; i++) {
      const segmentIndex = i % 4;
      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 260;
      const orbitSpeed = (0.002 + Math.random() * 0.005) * (Math.random() > 0.5 ? 1 : -1);
      
      particles.push({
        segmentIndex,
        baseAngle: angle,
        angle: angle,
        distance: distance,
        speed: orbitSpeed,
        size: 0.8 + Math.random() * 2,
        seed: Math.random()
      });
    }

    let t = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      t += 0.5;

      const centerX = width / 2;
      const centerY = height / 2;
      const centers = getSegmentCenters(width, height);
      const p = parseFloat(canvas.dataset.scrollProgress || 0);

      const coreRadius = 40 * (1 - p * 0.3) + Math.sin(t * 0.05) * 3;
      const coreGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius * 2.5);
      
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const coreColor1 = isDark ? 'rgba(59, 130, 246, 0.8)' : 'rgba(37, 99, 235, 0.8)';
      const coreColor2 = isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(124, 58, 237, 0.1)';

      coreGlow.addColorStop(0, coreColor1);
      coreGlow.addColorStop(0.3, 'rgba(139, 92, 246, 0.5)');
      coreGlow.addColorStop(1, 'rgba(5, 8, 22, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = coreGlow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(15, 23, 42, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (p < 0.8) {
        ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
        ctx.font = 'bold 10px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ORBIT', centerX, centerY);
      }

      if (p > 0.4) {
        centers.forEach((center, idx) => {
          const cX = centerX + center.x * p;
          const cY = centerY + center.y * p;
          const alpha = (p - 0.4) / 0.6;

          const subGlow = ctx.createRadialGradient(cX, cY, 0, cX, cY, 30);
          subGlow.addColorStop(0, center.color.replace('0.8', (0.4 * alpha).toString()));
          subGlow.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(cX, cY, 30, 0, Math.PI * 2);
          ctx.fillStyle = subGlow;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(cX, cY, 5, 0, Math.PI * 2);
          ctx.fillStyle = center.color.replace('0.8', alpha.toString());
          ctx.fill();

          const titles = ['High Value Churn Risk', 'Inactive Repurchasers', 'Loyal Campaign Responders', 'First Time Conversions'];
          ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${alpha})` : `rgba(15, 23, 42, ${alpha})`;
          ctx.font = '500 11px "Space Grotesk", sans-serif';
          ctx.fillText(titles[idx], cX, cY - 14);
        });
      }

      particles.forEach((part) => {
        part.angle += part.speed;
        const segment = centers[part.segmentIndex];
        const x1 = Math.cos(part.angle) * part.distance;
        const y1 = Math.sin(part.angle) * part.distance;

        const subDistance = 30 + (part.distance % 70);
        const x2 = segment.x + Math.cos(part.angle) * subDistance;
        const y2 = segment.y + Math.sin(part.angle) * subDistance;

        const relX = x1 * (1 - p) + x2 * p;
        const relY = y1 * (1 - p) + y2 * p;

        const posX = centerX + relX;
        const posY = centerY + relY;

        let color = isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(15, 23, 42, 0.35)';
        if (p > 0.3) {
          color = segment.color.replace('0.8', (0.3 + 0.5 * p).toString());
        }

        ctx.beginPath();
        ctx.arc(posX, posY, part.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        if (part.seed > 0.985 && p < 0.7) {
          ctx.beginPath();
          ctx.moveTo(posX, posY);
          ctx.lineTo(centerX, centerY);
          ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${0.04 * (1 - p)})` : `rgba(37, 99, 235, ${0.03 * (1 - p)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section ref={containerRef} style={{
      position: 'relative',
      height: '110vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      paddingTop: '80px'
    }}>
      <canvas 
        ref={canvasRef} 
        data-scroll-progress={scrollProgress}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      <div className="grid-overlay" />

      <div className="aurora-bg">
        <div className="aurora-color-1" />
        <div className="aurora-color-2" />
      </div>

      {/* Hero Content */}
      <div className="section-container" style={{
        position: 'relative',
        zIndex: 5,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `translateY(${-scrollProgress * 50}px)`,
        opacity: 1 - scrollProgress * 0.95,
        transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
        maxWidth: '900px'
      }}>
        {/* YC Tag */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '9999px',
          padding: '0.4rem 1rem',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          backdropFilter: 'blur(8px)',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <span style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--accent-blue)',
            animation: 'pulseGlow 1.5s infinite'
          }} />
          <span>W26 Y Combinator Demo Day Launch</span>
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(2.8rem, 6vw, 5rem)',
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          marginBottom: '1.5rem',
          color: 'var(--text-primary)'
        }}>
          Keep Every Customer <br/>
          <span className="text-gradient">In Your Orbit.</span>
        </h1>

        {/* Subhead */}
        <p style={{
          fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          margin: '0 auto 3rem auto',
          lineHeight: 1.5,
          fontWeight: 400
        }}>
          ORBIT is not a CRM. It is an Autonomous AI Marketing Operating System that discovers audiences, predicts behavior, and launches automated campaigns.
        </p>

        {/* Actions wired to launchOnboarding(1) */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <button onClick={() => launchOnboarding(1)} className="btn btn-primary" style={{ border: 'none' }}>
            Launch Command Center <ArrowRight size={16} />
          </button>
          <a href="#boardroom" className="btn btn-secondary" style={{ gap: '0.5rem' }}>
            <Play size={14} fill="currentColor" /> Watch Mission Briefing
          </a>
        </div>

        {/* Floating details */}
        <div style={{
          marginTop: '6rem',
          display: 'flex',
          gap: '3rem',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          fontFamily: "'Space Grotesk', sans-serif"
        }}>
          <div>⚡ Autonomous Processing</div>
          <div>🌌 Customer Intelligence Grid</div>
          <div>🛡️ Private LLM Guardrails</div>
        </div>
      </div>

      {/* Floating Scroll Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '2.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        opacity: 1 - scrollProgress,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none'
      }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>Scroll to segment</span>
        <div style={{
          width: '20px',
          height: '35px',
          borderRadius: '10px',
          border: '2px solid var(--text-secondary)',
          position: 'relative'
        }}>
          <div style={{
            width: '4px',
            height: '8px',
            borderRadius: '2px',
            background: 'var(--accent-blue)',
            position: 'absolute',
            top: '6px',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'scrollDownMouse 2s infinite ease-in-out'
          }} />
        </div>
      </div>

      <style>{`
        @keyframes scrollDownMouse {
          0% { top: 6px; opacity: 0; }
          30% { opacity: 1; }
          70% { top: 18px; opacity: 0; }
          100% { top: 6px; opacity: 0; }
        }
      `}</style>
    </section>
  );
}
