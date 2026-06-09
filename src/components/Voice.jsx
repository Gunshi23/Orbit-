import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles } from 'lucide-react';

const transcripts = [
  { sender: 'USER', text: 'Hey ORBIT, target users who added items to cart in the last hour but didn’t complete.' },
  { sender: 'ORBIT', text: 'Scanned checkouts. Found 124 users. Average cart value ₹3,200. Shall I draft an SMS?' },
  { sender: 'USER', text: 'Yes, draft it. Add a voucher for free delivery.' },
  { sender: 'ORBIT', text: 'SMS campaign drafted. Predicted CTR: 18%. Ready to deploy on WhatsApp and SMS?' },
  { sender: 'USER', text: 'Launch it now.' },
  { sender: 'ORBIT', text: 'Campaign active. Sending dispatch signals to Atlas.' }
];

export default function Voice() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptIndex, setTranscriptIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const particleCanvasRef = useRef(null);

  // Auto scroll transcript messages when recording
  useEffect(() => {
    if (!isRecording) {
      setDisplayedText('Click the microphone and say: "ORBIT, check active campaigns..."');
      return;
    }

    let msgIdx = 0;
    setTranscriptIndex(0);
    
    const nextMessage = () => {
      if (msgIdx < transcripts.length) {
        const msg = transcripts[msgIdx];
        setDisplayedText(`${msg.sender}: ${msg.text}`);
        setTranscriptIndex(msgIdx);
        msgIdx++;
        
        // Wait 3.5 seconds for the next message
        setTimeout(nextMessage, 3500);
      } else {
        msgIdx = 0;
        nextMessage();
      }
    };

    nextMessage();
  }, [isRecording]);

  // Floating particles canvas for sound particles
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationId;
    let width = canvas.width = 300;
    let height = canvas.height = 300;

    const particles = [];
    const maxParticles = 40;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: width / 2,
        y: height / 2,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        size: 1 + Math.random() * 3,
        alpha: 1,
        decay: 0.01 + Math.random() * 0.02,
        color: Math.random() > 0.5 ? 'var(--accent-blue)' : 'var(--accent-purple)'
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Update
        p.x += p.vx;
        p.y += p.vy;
        
        // If recording, they float outwards faster
        const multiplier = isRecording ? 1.5 : 0.4;
        p.x += p.vx * multiplier;
        p.y += p.vy * multiplier;

        p.alpha -= p.decay;

        // Reset dead particles
        if (p.alpha <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          p.x = width / 2;
          p.y = height / 2;
          p.vx = (Math.random() - 0.5) * 2.5;
          p.vy = (Math.random() - 0.5) * 2.5;
          p.alpha = 1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(')', `, ${p.alpha})`);
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [isRecording]);

  return (
    <section id="voice-intel" style={{ position: 'relative', borderBottom: '1px solid var(--card-border)' }}>
      <div className="grid-overlay" />

      <div className="section-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }} className="voice-grid">
        {/* Left Side: Waveform & Mic */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 5 }}>
          <div style={{ position: 'relative', width: '300px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Particles background */}
            <canvas ref={particleCanvasRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />

            {/* Glowing rings */}
            <div style={{
              position: 'absolute',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              border: '1px solid var(--card-border)',
              animation: isRecording ? 'pulseGlow 2s infinite' : 'none',
              transform: 'scale(1)',
              transition: 'all 0.5s'
            }} />
            <div style={{
              position: 'absolute',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              border: '1px dashed var(--card-border)',
              opacity: isRecording ? 0.6 : 0.2,
              animation: isRecording ? 'spin 20s linear infinite' : 'none',
              transition: 'all 0.5s'
            }} />

            {/* Massive microphone button */}
            <button
              onClick={() => setIsRecording(!isRecording)}
              style={{
                position: 'relative',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: isRecording ? 'linear-gradient(135deg, var(--accent-purple), #ec4899)' : 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: isRecording ? '0 0 40px rgba(139, 92, 246, 0.6)' : '0 0 20px rgba(0,0,0,0.3)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: 6
              }}
              onMouseEnter={(e) => {
                if(!isRecording) e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                if(!isRecording) e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isRecording ? <Mic size={36} style={{ animation: 'float 3s ease-in-out infinite' }} /> : <MicOff size={36} style={{ color: 'var(--text-secondary)' }} />}
            </button>
          </div>

          {/* Animated Waveform Lines */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            height: '40px',
            width: '200px',
            marginTop: '1.5rem',
            overflow: 'hidden'
          }}>
            {[...Array(24)].map((_, idx) => {
              // Custom delay and animation speed for standard frequency wave look
              const speed = 0.5 + Math.random() * 0.8;
              const delay = idx * 0.1;
              return (
                <div
                  key={idx}
                  style={{
                    width: '3px',
                    height: isRecording ? '100%' : '4px',
                    background: 'linear-gradient(to top, var(--accent-blue), var(--accent-purple))',
                    borderRadius: '2px',
                    animation: isRecording ? `audioWaveform 1.2s infinite ease-in-out alternate` : 'none',
                    animationDelay: `${delay}s`,
                    transition: 'height 0.3s ease'
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Right Side: Copy & Transcripts */}
        <div style={{ zIndex: 5 }}>
          <div className="section-tag">Voice Operating Layer</div>
          <h2 className="section-title">Talk To ORBIT.</h2>
          <p className="section-subtitle">
            Skip writing configurations. Connect your voice command layer directly to campaigns using state-of-the-art speech-to-intent technology.
          </p>

          {/* Dynamic Transcript Console */}
          <div className="glass-panel" style={{
            padding: '1.5rem',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            border: '1px solid var(--card-border)',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '1rem',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
              <Volume2 size={12} /> LIVE VOICE STREAM
            </div>

            <div style={{
              fontSize: '1.05rem',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              transition: 'all 0.3s ease'
            }}>
              {displayedText}
            </div>

            {isRecording && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                borderTop: '1px solid var(--card-border)',
                paddingTop: '0.75rem',
                marginTop: '0.5rem'
              }}>
                <Sparkles size={10} style={{ color: 'var(--accent-purple)' }} />
                <span>Simulating speech transaction logs... (Click Mic to stop)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .voice-grid {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 5rem;
          align-items: center;
        }
        @media (max-width: 991px) {
          .voice-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }
        @keyframes audioWaveform {
          0% { transform: scaleY(0.1); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </section>
  );
}
