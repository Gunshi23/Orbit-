import React, { useState, useEffect } from 'react';
import { Sun, Moon, Orbit, ArrowRight, Menu, X } from 'lucide-react';

export default function Header({ theme, toggleTheme, launchOnboarding }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 100,
      transition: 'all 0.3s ease',
      background: scrolled ? 'var(--nav-bg)' : 'transparent',
      borderBottom: scrolled ? '1px solid var(--card-border)' : '1px solid transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
      padding: scrolled ? '1rem 2rem' : '1.5rem 2rem'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '1.25rem', fontFamily: "'Space Grotesk', sans-serif" }}>
          <div style={{
            position: 'relative',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
          }}>
            <Orbit size={18} style={{ color: '#fff', animation: 'spin 10s linear infinite' }} />
          </div>
          <span>ORBIT</span>
        </a>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-only">
          <a href="#agents" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', transition: 'color 0.2s', fontWeight: 500 }} onMouseEnter={e => e.target.style.color = 'var(--text-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Agents</a>
          <a href="#pipeline" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', transition: 'color 0.2s', fontWeight: 500 }} onMouseEnter={e => e.target.style.color = 'var(--text-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Workflow</a>
          <a href="#command-center" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', transition: 'color 0.2s', fontWeight: 500 }} onMouseEnter={e => e.target.style.color = 'var(--text-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Console</a>
          <a href="#simulator" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', transition: 'color 0.2s', fontWeight: 500 }} onMouseEnter={e => e.target.style.color = 'var(--text-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Simulator</a>
          <a href="#dashboard" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', transition: 'color 0.2s', fontWeight: 500 }} onMouseEnter={e => e.target.style.color = 'var(--text-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Dashboard</a>
          <a href="#architecture" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', transition: 'color 0.2s', fontWeight: 500 }} onMouseEnter={e => e.target.style.color = 'var(--text-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Architecture</a>
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(var(--highlight-rgb), 0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--card-border)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* CTA Button linked to launchOnboarding(1) (Credential verification screen) */}
          <button 
            onClick={() => launchOnboarding(1)}
            className="btn btn-primary desktop-only" 
            style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem', border: 'none' }}
          >
            Launch ORBIT <ArrowRight size={14} />
          </button>

          {/* Mobile menu trigger */}
          <button 
            className="mobile-only" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--card-border)',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          zIndex: 99
        }}>
          <a href="#agents" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 500 }}>Agents</a>
          <a href="#pipeline" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 500 }}>Workflow</a>
          <a href="#command-center" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 500 }}>Console</a>
          <a href="#simulator" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 500 }}>Simulator</a>
          <a href="#dashboard" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 500 }}>Dashboard</a>
          <a href="#architecture" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 500 }}>Architecture</a>
          <button 
            onClick={() => { setMobileMenuOpen(false); launchOnboarding(1); }} 
            className="btn btn-primary" 
            style={{ alignSelf: 'flex-start', border: 'none' }}
          >
            Launch ORBIT <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Desktop and Mobile CSS helpers */}
      <style>{`
        .desktop-only { display: flex; }
        .mobile-only { display: none; }
        @media (max-width: 800px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: block; }
        }
      `}</style>
    </header>
  );
}
