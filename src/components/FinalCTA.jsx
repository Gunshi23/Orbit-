import React, { useEffect, useRef } from 'react';
import { ArrowRight, Orbit, Terminal, Send, Globe } from 'lucide-react';

export default function FinalCTA({ launchOnboarding }) {
  const canvasRef = useRef(null);

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

    const particleCount = 600;
    const particles = [];
    const arms = 3;

    for (let i = 0; i < particleCount; i++) {
      const arm = i % arms;
      const angle = (arm * ((2 * Math.PI) / arms)) + (Math.random() * 0.5);
      const distance = 50 + Math.pow(Math.random(), 2) * 400;
      
      particles.push({
        baseAngle: angle,
        angle: angle + (distance * 0.003),
        distance: distance,
        size: 0.5 + Math.random() * 1.8,
        speed: 0.0003 + (15 / distance) * 0.0001,
        color: Math.random() > 0.4 ? 'rgba(59, 130, 246, 0.4)' : 'rgba(139, 92, 246, 0.4)'
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      const cGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
      cGlow.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
      cGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = cGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
      ctx.fill();

      particles.forEach((p) => {
        p.angle += p.speed;
        const posX = centerX + Math.cos(p.angle) * p.distance;
        const posY = centerY + Math.sin(p.angle) * p.distance;

        ctx.beginPath();
        ctx.arc(posX, posY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
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
    <footer style={{ position: 'relative', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
          opacity: 0.7
        }}
      />

      <div className="grid-overlay" />

      {/* Main CTA Box */}
      <div className="section-container" style={{
        position: 'relative',
        zIndex: 5,
        textAlign: 'center',
        paddingTop: '8rem',
        paddingBottom: '8rem',
        borderBottom: '1px solid var(--card-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '800px'
      }}>
        
        {/* Glowing badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--accent-glow-blue)',
          border: '1px solid var(--accent-blue)',
          borderRadius: '9999px',
          padding: '0.4rem 1rem',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--accent-blue)',
          marginBottom: '2rem'
        }}>
          <span>GET STARTED TODAY</span>
        </div>

        {/* Heading */}
        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(2.2rem, 5vw, 4rem)',
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          marginBottom: '1.5rem'
        }}>
          Ready To Put Growth <br/>
          <span className="text-gradient">On Autopilot?</span>
        </h2>

        {/* Subhead */}
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '3rem',
          maxWidth: '620px'
        }}>
          Let autonomous AI agents discover audiences, launch campaigns, and drive revenue while you focus on scaling.
        </p>

        {/* Launch Button wired to launchOnboarding(1) */}
        <button 
          onClick={() => launchOnboarding(1)} 
          className="btn btn-primary" 
          style={{ padding: '1rem 2.2rem', fontSize: '1.05rem', border: 'none' }}
        >
          Launch ORBIT Console <ArrowRight size={18} />
        </button>
      </div>

      {/* Bottom Sitemap & Copyright */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '4rem 2rem 3rem 2rem',
        position: 'relative',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: '3rem'
      }}>
        {/* Links stack */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '3rem'
        }}>
          {/* Logo column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '260px' }}>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.2rem', fontFamily: 'Space Grotesk' }}>
              <Orbit size={24} style={{ color: 'var(--accent-blue)', animation: 'spin 20s linear infinite' }} />
              <span>ORBIT</span>
            </a>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              The Autonomous AI Marketing Operating System. Build campaigns in natural language.
            </p>
          </div>

          {/* Links block 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>Engine</h4>
            <a href="#agents" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AI Agents</a>
            <a href="#pipeline" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Semantic Sync</a>
            <a href="#simulator" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Simulation Model</a>
          </div>

          {/* Links block 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>Consoles</h4>
            <a href="#command-center" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Chat Command</a>
            <a href="#voice-intel" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Voice Intelligence</a>
            <a href="#dashboard" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mission Control</a>
          </div>

          {/* Links block 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>Company</h4>
            <a href="#" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Privacy Policy</a>
            <a href="#" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Security Layer</a>
            <a href="#" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Contact Core</a>
          </div>
        </div>

        {/* Footer Bottomline */}
        <div style={{
          borderTop: '1px solid var(--card-border)',
          paddingTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}>
          <span>&copy; 2026 ORBIT Technologies Inc. All rights reserved.</span>
          
          {/* Socials */}
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <a href="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--text-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}><Send size={18} /></a>
            <a href="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--text-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}><Terminal size={18} /></a>
            <a href="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--text-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}><Globe size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
