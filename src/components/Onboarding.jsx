import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Orbit, Compass, TrendingUp, Cpu, Key, Mail } from 'lucide-react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';

const AGENTS = [
  { name: 'Polaris', role: 'Audience Intel', icon: Compass, color: 'rgba(59, 130, 246, 0.85)', accent: '#3b82f6' },
  { name: 'Nova', role: 'Campaign Creation', icon: Sparkles, color: 'rgba(139, 92, 246, 0.85)', accent: '#8b5cf6' },
  { name: 'Vega', role: 'Predictive Analytics', icon: TrendingUp, color: 'rgba(14, 165, 233, 0.85)', accent: '#0ea5e9' },
  { name: 'Atlas', role: 'Campaign Operations', icon: Cpu, color: 'rgba(236, 72, 153, 0.85)', accent: '#ec4899' }
];

export default function Onboarding({ initialStep = 1, onComplete }) {
  const [step, setStep] = useState(initialStep); // 1: Auth, 2: Agent Sync
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState(['Offline', 'Offline', 'Offline', 'Offline']);

  // If initialStep is passed, make sure it matches our 2-step setup
  useEffect(() => {
    if (initialStep > 2) {
      setStep(1);
    } else {
      setStep(initialStep);
    }
  }, [initialStep]);

  // Handle Email/Password Login & Signup
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Email and password fields are required.');
      return;
    }
    setLoading(true);
    setAuthError('');
    try {
      if (authTab === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setStep(2); // Go to Agent Sync
    } catch (err) {
      console.error(err);
      setAuthError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  // Handle Google SSO popup login
  const handleGoogleAuth = async () => {
    setLoading(true);
    setAuthError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setStep(2); // Go to Agent Sync
    } catch (err) {
      console.error(err);
      setAuthError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  // Demo bypass to enter console immediately
  const handleDemoBypass = () => {
    setStep(2);
  };

  // Agent activation sync logic (Step 2)
  useEffect(() => {
    if (step !== 2) return;
    setAgentStatus(['Offline', 'Offline', 'Offline', 'Offline']);

    const timeouts = [];
    AGENTS.forEach((item, idx) => {
      // Sync state transition
      const syncTimeout = setTimeout(() => {
        setAgentStatus((prev) => {
          const copy = [...prev];
          copy[idx] = 'Synchronizing';
          return copy;
        });
      }, idx * 600 + 300);

      // Online state transition
      const onlineTimeout = setTimeout(() => {
        setAgentStatus((prev) => {
          const copy = [...prev];
          copy[idx] = 'Online';
          return copy;
        });
      }, idx * 600 + 700);

      timeouts.push(syncTimeout, onlineTimeout);
    });

    // Complete onboarding and enter command center automatically when last agent sync completes
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, AGENTS.length * 600 + 1200);

    timeouts.push(completeTimeout);
    return () => timeouts.forEach((t) => clearTimeout(t));
  }, [step]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      {/* Background radial effects */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundImage: 'radial-gradient(var(--card-border) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.15,
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, var(--aurora-1) 0%, transparent 70%)',
        filter: 'blur(80px)',
        top: '20%',
        left: '25%',
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      {/* Main Container */}
      <div style={{ zIndex: 10, width: '100%', maxWidth: '480px', padding: '1.5rem' }}>
        
        {/* STEP 1: AUTHENTICATION MODE */}
        {step === 1 && (
          <div className="glass-panel" style={{
            padding: '2.5rem',
            border: '1px solid var(--card-border)',
            borderRadius: '16px',
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Title / Header */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                color: '#fff',
                marginBottom: '1rem',
                boxShadow: '0 0 20px rgba(59,130,246,0.3)'
              }}>
                <Orbit size={24} style={{ animation: 'spin 10s linear infinite' }} />
              </div>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem', fontWeight: 700 }}>Welcome to ORBIT</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.25rem' }}>
                Secure gateway authentication for the AI Marketing OS
              </p>
            </div>

            {/* Tabs (Login vs Sign Up) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--card-border)',
              borderRadius: '8px',
              padding: '0.25rem'
            }}>
              <button
                onClick={() => setAuthTab('login')}
                style={{
                  background: authTab === 'login' ? 'var(--accent-glow-blue)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: authTab === 'login' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  padding: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthTab('signup')}
                style={{
                  background: authTab === 'signup' ? 'var(--accent-glow-purple)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: authTab === 'signup' ? 'var(--accent-purple)' : 'var(--text-secondary)',
                  padding: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Create Account
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="commander@orbit.ai"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.25rem',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Keyword Access Token (Password)</label>
                <div style={{ position: 'relative' }}>
                  <Key size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.25rem',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              {authError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  color: '#f87171',
                  padding: '0.6rem 0.8rem',
                  fontSize: '0.75rem',
                  lineHeight: 1.4
                }}>
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.9rem',
                  border: 'none',
                  marginTop: '0.5rem'
                }}
              >
                {loading ? 'Decrypting Access Tunnels...' : authTab === 'login' ? 'Initiate Console Login' : 'Register Operator Credentials'}
              </button>
            </form>

            {/* Separator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--card-border)' }} />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>or Federated Auth</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--card-border)' }} />
            </div>

            {/* Google Authentication Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--card-border)',
                color: 'var(--text-primary)',
                padding: '0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.3s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
            >
              {/* Google SVG Icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Sign In with Google
            </button>

            {/* Demo Skip Link */}
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button 
                onClick={handleDemoBypass}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-blue)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textDecoration: 'underline'
                }}
              >
                Demo Mode: Bypass Gateway Credentials
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: AGENT SYNCHRONIZATION AND DISPATCH */}
        {step === 2 && (
          <div className="glass-panel" style={{
            padding: '2.5rem',
            border: '1px solid var(--card-border)',
            borderRadius: '16px',
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            textAlign: 'left'
          }}>
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.6rem', fontWeight: 700 }}>Activating AI Agents</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.25rem' }}>
                Establishing secure telemetry link with ORBIT nodes...
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {AGENTS.map((item, idx) => {
                const Icon = item.icon;
                const status = agentStatus[idx];
                const isOnline = status === 'Online';
                const isSync = status === 'Synchronizing';
                
                return (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      background: isOnline ? 'rgba(16, 185, 129, 0.05)' : isSync ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255,255,255,0.01)',
                      border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.2)' : isSync ? 'rgba(59, 130, 246, 0.2)' : 'var(--card-border)'}`,
                      borderRadius: '8px',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isOnline ? 'rgba(16, 185, 129, 0.1)' : isSync ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isOnline ? '#10b981' : isSync ? '#3b82f6' : 'var(--text-secondary)'
                      }}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.name}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{item.role}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: isOnline ? '#10b981' : isSync ? '#3b82f6' : 'rgba(255,255,255,0.2)',
                        boxShadow: isOnline ? '0 0 8px #10b981' : isSync ? '0 0 8px #3b82f6' : 'none'
                      }} />
                      <span style={{
                        fontSize: '0.7rem',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: isOnline ? '#10b981' : isSync ? '#3b82f6' : 'var(--text-secondary)'
                      }}>
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
