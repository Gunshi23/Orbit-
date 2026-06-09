import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Terminal, CheckCircle, Sparkles, MessageSquare, Play, 
  Orbit, Compass, TrendingUp, Cpu, Volume2, BarChart3, Settings, 
  LogOut, Mic, Paperclip, ChevronRight, User, Shield, Zap, AlertCircle,
  Plus, Users, MessageCircle, RefreshCw, Radio, Sun, Moon
} from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { generateGrowthMission, generateVoiceScript } from '../gemini';

// Sound wave data
const waveBars = Array.from({ length: 24 }, (_, i) => ({
  height: 5 + Math.random() * 35,
  delay: `${i * 0.08}s`
}));

const presetQueries = [
  {
    prompt: 'Increase repeat purchases from customers who haven\'t purchased in 90 days.',
    audience: '432 inactive customers',
    revenue: '₹1.2 Lakhs',
    channel: 'WhatsApp',
    confidence: '87%',
    reasoning: [
      'Querying customer database',
      'Evaluating purchase history',
      'Detecting churn signals',
      'Ranking customer segments',
      'Calculating revenue impact',
      'Selecting communication channel'
    ],
    logs: [
      'Scanning CDP database for customers active >90 days ago with CLV > ₹5,000.',
      'Identified cohort: Average order frequency 28 days; elapsed since last buy: 110 days.',
      'Analyzing preferred channels: WhatsApp has 88% engagement rate in this cohort.',
      'Nova draft: 15% discount dynamic offer, valid for 48 hours.'
    ],
    copy: 'Hey {first_name}! We missed you. We noticed it’s been a while since your last purchase. Here is a custom 15% off voucher valid for the next 48 hours. Tap here to redeem: orb.it/vip'
  },
  {
    prompt: 'Recover abandoned cart users with high buying intent.',
    audience: '1,280 checkout-dropouts',
    revenue: '₹3.8 Lakhs',
    channel: 'Email',
    confidence: '92%',
    reasoning: [
      'Querying customer database',
      'Evaluating cart retention profiles',
      'Ranking abandoned item affinities',
      'Detecting transaction dropouts',
      'Calculating recovery rates',
      'Selecting communication channel'
    ],
    logs: [
      'Scanning checkout logs for users who added items to cart but did not purchase in 24h.',
      'Filtering out items out of stock; verifying checkout funnel completion rates.',
      'Estimated cart value: ₹12.5 Lakhs; average cart size: 2.1 items.',
      'Setting up automated triggers: Email 1 at +2h, Email 2 at +24h.'
    ],
    copy: 'Hi {first_name}! You left some premium items in your bag. They are selling out fast! Click here to complete your checkout with free shipping: orb.it/cart'
  },
  {
    prompt: 'Promote VIP loyalty gift to top 1% spender cohort.',
    audience: '98 active VIP spenders',
    revenue: '₹5.5 Lakhs',
    channel: 'WhatsApp & Email',
    confidence: '95%',
    reasoning: [
      'Querying customer database',
      'Evaluating loyalty points balances',
      'Detecting VIP spend thresholds',
      'Ranking customer lifetime value',
      'Calculating repeat probability',
      'Selecting communication channel'
    ],
    logs: [
      'Filtering users by total spend thresholds > ₹50,000 in past 6 months.',
      'Verifying loyalty tier allocation metrics; generating exclusive VIP codes.',
      'Selecting optimal channels: high-touch personalized WhatsApp messages.',
      'Nova draft: Customized message introducing the VIP loyalty reward gift box.'
    ],
    copy: 'Dear {first_name}, as a valued ORBIT VIP customer, we’ve reserved a special custom edition anniversary gift box for you. Claim your gift box now: orb.it/gift-vip'
  }
];

export default function CommandCenterOS({ theme, toggleTheme, onExit }) {
  const [activeTab, setActiveTab] = useState('command-center'); // 'command-center' | 'customer-galaxy' | 'agent-boardroom' | 'voice-console' | 'orbit-analytics' | 'system-config'
  const [autonomousMode, setAutonomousMode] = useState(false);
  const [statusText, setStatusText] = useState('Idle');
  
  // Chat / Execution States
  const [customInput, setCustomInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [activePresetIndex, setActivePresetIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: Idle, 1: Reasoning, 2: Agent Sync, 3: Complete
  const [reasoningProgress, setReasoningProgress] = useState(0);
  const [completedReasoningItems, setCompletedReasoningItems] = useState([]);
  const [agentProgress, setAgentProgress] = useState({
    polaris: 'Idle',
    nova: 'Idle',
    vega: 'Idle',
    atlas: 'Idle'
  });
  const [agentGlow, setAgentGlow] = useState({
    polaris: false,
    nova: false,
    vega: false,
    atlas: false
  });
  
  const [campaignLaunched, setCampaignLaunched] = useState(false);
  
  // Live Feed Ambient Events
  const [liveEvents, setLiveEvents] = useState([
    { id: 1, text: 'Polaris discovered a new audience cluster.', time: 'Just now', type: 'info' },
    { id: 2, text: 'Vega updated revenue forecast.', time: '2m ago', type: 'success' },
    { id: 3, text: 'Nova generated a better campaign variation.', time: '5m ago', type: 'purple' },
    { id: 4, text: 'Atlas completed launch sequence.', time: '10m ago', type: 'warning' }
  ]);

  // Vega live chart simulation states
  const [vegaChartData, setVegaChartData] = useState([30, 45, 35, 60, 48, 70, 85]);
  
  // Voice tab States
  const [voiceModel, setVoiceModel] = useState('orbit-v1');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [waveformActive, setWaveformActive] = useState(false);
  const [voiceScript, setVoiceScript] = useState("Hello! We detected checkout dropdown events on your ORBIT VIP cart items. We've reserved them for you with free shipping for 12 hours. Press 1 to speak to an executive.");
  
  // Customer Galaxy Tab States
  const [selectedCluster, setSelectedCluster] = useState(null);

  // System Configuration States
  const [ping, setPing] = useState(42);

  const consoleEndRef = useRef(null);

  // Periodic random ambient events to feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      const phrases = [
        'Polaris detected purchase pattern decay in cohort D.',
        'Vega optimized lifetime value curve projections.',
        'Nova polished synthetic copy templates.',
        'Atlas verified queue pipelines for SMS nodes.',
        'System diagnostic check: Stable (0.002% packet loss).',
        'Polaris created a micro-segment of 45 repeat buyers.',
        'Vega detected a 4.2% lift in conversion probability.'
      ];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      setLiveEvents(prev => [
        { id: Date.now(), text: randomPhrase, time: 'Just now', type: 'info' },
        ...prev.slice(0, 5)
      ]);

      // Jitter ping slightly
      setPing(prev => Math.max(30, Math.min(80, prev + Math.floor(Math.random() * 9) - 4)));

      // Modify Vega chart data slightly
      setVegaChartData(prev => {
        const copy = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        const next = Math.max(20, Math.min(100, last + Math.floor(Math.random() * 31) - 15));
        return [...copy, next];
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const scrollChatToEnd = () => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollChatToEnd();
  }, [chatHistory, currentStep, completedReasoningItems]);

  // Launch cinematic execution sequence
  const startMissionExecution = async (inputStr, presetIdx) => {
    if (isExecuting) return;
    setIsExecuting(true);
    setCurrentStep(1);
    setReasoningProgress(0);
    setCompletedReasoningItems([]);
    setCampaignLaunched(false);
    
    const isPreset = presetIdx >= 0;

    // Append user message to chat history first to show operator's bubble immediately
    setChatHistory(prev => [
      ...prev,
      { sender: 'operator', text: inputStr }
    ]);

    let selectedData;
    if (isPreset) {
      selectedData = presetQueries[presetIdx];
    } else {
      setStatusText('Analyzing');
      try {
        selectedData = await generateGrowthMission(inputStr);
      } catch (err) {
        console.error("Gemini mission generation failed, using fallback:", err);
        selectedData = {
          prompt: inputStr,
          audience: '150 customers in transition',
          revenue: '₹45,000',
          channel: 'WhatsApp & Email',
          confidence: '82%',
          reasoning: [
            'Querying customer database',
            'Evaluating purchase history',
            'Detecting churn signals',
            'Ranking customer segments',
            'Calculating revenue impact',
            'Selecting communication channel'
          ],
          logs: [
            'Running customized SQL matching for growth vectors.',
            'Slicing customer tiers by buying affinity parameters.',
            'Selecting best channels based on response latency matrix.'
          ],
          copy: 'Hey {first_name}! We crafted a special reward package just for you. Redeem here: orb.it/custom'
        };
      }
    }
    
    // Step 1: Reasoning Mode
    setStatusText('Analyzing');
    setAgentStatus({ polaris: 'Analyzing', nova: 'Idle', vega: 'Idle', atlas: 'Idle' });
    setAgentGlow({ polaris: true, nova: false, vega: false, atlas: false });

    // Simulate ticking reasoning items
    for (let i = 0; i < selectedData.reasoning.length; i++) {
      await new Promise(resolve => setTimeout(resolve, autonomousMode ? 250 : 600));
      setCompletedReasoningItems(prev => [...prev, selectedData.reasoning[i]]);
      setReasoningProgress(((i + 1) / selectedData.reasoning.length) * 100);
    }

    // Step 2: Agent Sync Sequence
    setCurrentStep(2);
    
    // Polaris Online
    setStatusText('Segmenting Customers');
    setAgentStatus(prev => ({ ...prev, polaris: 'Analyzing segments' }));
    await new Promise(resolve => setTimeout(resolve, autonomousMode ? 300 : 900));
    setAgentStatus(prev => ({ ...prev, polaris: 'Complete' }));
    setAgentGlow(prev => ({ ...prev, polaris: false }));

    // Vega Online
    setStatusText('Predicting Results');
    setAgentStatus(prev => ({ ...prev, vega: 'Forecasting revenue' }));
    setAgentGlow(prev => ({ ...prev, vega: true }));
    await new Promise(resolve => setTimeout(resolve, autonomousMode ? 300 : 900));
    setAgentStatus(prev => ({ ...prev, vega: 'Complete' }));
    setAgentGlow(prev => ({ ...prev, vega: false }));

    // Nova Online
    setStatusText('Generating Campaign');
    setAgentStatus(prev => ({ ...prev, nova: 'Drafting copy' }));
    setAgentGlow(prev => ({ ...prev, nova: true }));
    await new Promise(resolve => setTimeout(resolve, autonomousMode ? 300 : 900));
    setAgentStatus(prev => ({ ...prev, nova: 'Complete' }));
    setAgentGlow(prev => ({ ...prev, nova: false }));

    // Atlas Online
    setStatusText('Preparing Launch');
    setAgentStatus(prev => ({ ...prev, atlas: 'Syncing channels' }));
    setAgentGlow(prev => ({ ...prev, atlas: true }));
    await new Promise(resolve => setTimeout(resolve, autonomousMode ? 300 : 900));
    setAgentStatus(prev => ({ ...prev, atlas: 'Ready to launch' }));
    setAgentGlow(prev => ({ ...prev, atlas: false }));

    // Complete / Ready State
    setCurrentStep(3);
    setStatusText('Ready To Launch');

    // Add ORBIT Response to Chat
    setChatHistory(prev => [
      ...prev,
      {
        sender: 'orbit',
        data: selectedData,
        autonomous: autonomousMode
      }
    ]);

    // If Autonomous Mode is Enabled: Trigger Auto Launch after 1.5 seconds!
    if (autonomousMode) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatusText('Campaign Active');
      setAgentStatus(prev => ({ ...prev, atlas: 'Active dispatch' }));
      setAgentGlow(prev => ({ ...prev, atlas: true }));
      
      // Auto write to firebase
      try {
        await addDoc(collection(db, 'campaigns'), {
          prompt: selectedData.prompt,
          audience_size: selectedData.audience,
          predicted_revenue: selectedData.revenue,
          channel: selectedData.channel,
          copy: selectedData.copy,
          status: 'Active',
          launched_at: new Date(),
          autonomous: true
        });
      } catch (err) {
        console.error('Error saving campaign to Firestore:', err);
      }

      setChatHistory(prev => [
        ...prev,
        {
          sender: 'system',
          text: `⚡ Autonomous launch successful. Dispatching WhatsApp package to ${selectedData.audience}.`
        }
      ]);
      
      setTimeout(() => {
        setAgentStatus(prev => ({ ...prev, atlas: 'Idle' }));
        setAgentGlow(prev => ({ ...prev, atlas: false }));
        setStatusText('Idle');
      }, 3000);
    }

    setIsExecuting(false);
  };

  const handleSend = () => {
    if (!customInput.trim() || isExecuting) return;
    const input = customInput;
    setCustomInput('');
    startMissionExecution(input, -1);
  };

  const handleLaunchCampaign = async (campaignData) => {
    setCampaignLaunched(true);
    setStatusText('Campaign Active');
    setAgentStatus(prev => ({ ...prev, atlas: 'Active dispatch' }));
    setAgentGlow(prev => ({ ...prev, atlas: true }));

    try {
      await addDoc(collection(db, 'campaigns'), {
        prompt: campaignData.prompt,
        audience_size: campaignData.audience,
        predicted_revenue: campaignData.revenue,
        channel: campaignData.channel,
        copy: campaignData.copy,
        status: 'Active',
        launched_at: new Date(),
        autonomous: false
      });
    } catch (err) {
      console.error('Error saving campaign to Firestore:', err);
    }

    setTimeout(() => {
      setCampaignLaunched(false);
      setAgentStatus(prev => ({ ...prev, atlas: 'Idle' }));
      setAgentGlow(prev => ({ ...prev, atlas: false }));
      setStatusText('Idle');
    }, 4000);
  };

  // Voice synthesis simulator using Gemini Voice API
  const startVoiceSynthesis = async () => {
    if (isSynthesizing) return;
    setIsSynthesizing(true);
    setWaveformActive(true);
    
    try {
      const script = await generateVoiceScript(voiceModel, voiceScript);
      setVoiceScript(script);
    } catch (e) {
      console.error("Gemini voice script generation failed:", e);
    }

    setTimeout(() => {
      setIsSynthesizing(false);
      setWaveformActive(false);
    }, 5000);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '260px 1fr 340px',
      height: '100vh',
      width: '100vw',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 200,
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* BACKGROUND PARTICLES/GLOWS */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'radial-gradient(rgba(59, 130, 246, 0.08) 1.5px, transparent 1.5px)',
        backgroundSize: '40px 40px',
        opacity: 0.2,
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '20%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />

      {/* LEFT SIDEBAR: ORBIT NAV */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--card-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem',
        zIndex: 10,
        backdropFilter: 'blur(20px)'
      }}>
        {/* LOGO */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '1.25rem'
          }}>
            <div style={{
              position: 'relative',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)'
            }}>
              {/* Spinning Orbit Ring SVG */}
              <svg 
                style={{
                  position: 'absolute',
                  width: '42px',
                  height: '42px',
                  animation: 'spin 4s linear infinite',
                  transformStyle: 'preserve-3d'
                }}
                viewBox="0 0 100 100"
              >
                <ellipse 
                  cx="50" cy="50" rx="38" ry="12" 
                  fill="none" stroke="rgba(255,255,255,0.7)" 
                  strokeWidth="2.5" 
                  transform="rotate(-25 50 50)"
                />
              </svg>
              <Orbit size={16} style={{ color: '#fff' }} />
            </div>
            <span style={{ letterSpacing: '0.05em' }}>ORBIT</span>
          </div>

          {/* NAV LINKS */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '1.5rem' }}>
            <button 
              onClick={() => setActiveTab('mission-control')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'mission-control' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: activeTab === 'mission-control' ? '#3b82f6' : '#9ca3af',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontWeight: 500,
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>🏠</span> Mission Control
            </button>

            <button 
              onClick={() => setActiveTab('command-center')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'command-center' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: activeTab === 'command-center' ? '#3b82f6' : '#9ca3af',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontWeight: 500,
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>🤖</span> Command Center
            </button>

            <button 
              onClick={() => setActiveTab('customer-galaxy')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'customer-galaxy' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: activeTab === 'customer-galaxy' ? '#3b82f6' : '#9ca3af',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontWeight: 500,
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>🛰</span> Customer Galaxy
            </button>

            <button 
              onClick={() => setActiveTab('growth-engine')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'growth-engine' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: activeTab === 'growth-engine' ? '#3b82f6' : '#9ca3af',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontWeight: 500,
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>📢</span> Growth Engine
            </button>

            <button 
              onClick={() => setActiveTab('agent-boardroom')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'agent-boardroom' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: activeTab === 'agent-boardroom' ? '#3b82f6' : '#9ca3af',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontWeight: 500,
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>🧠</span> Agent Boardroom
            </button>

            <button 
              onClick={() => setActiveTab('voice-console')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'voice-console' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: activeTab === 'voice-console' ? '#3b82f6' : '#9ca3af',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontWeight: 500,
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>🎙</span> Voice Console
            </button>

            <button 
              onClick={() => setActiveTab('orbit-analytics')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'orbit-analytics' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: activeTab === 'orbit-analytics' ? '#3b82f6' : '#9ca3af',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontWeight: 500,
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>📊</span> Orbit Analytics
            </button>

            <button 
              onClick={() => setActiveTab('system-config')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'system-config' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: activeTab === 'system-config' ? '#3b82f6' : '#9ca3af',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontWeight: 500,
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>⚙</span> System Configuration
            </button>
          </nav>
        </div>

        {/* BOTTOM USER PROFILE & STATUS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* THEME SWITCHER */}
          <button 
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              background: 'var(--button-hover-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              padding: '0.6rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.3s'
            }}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={14} style={{ color: 'var(--accent-blue)' }} /> Light Mode
              </>
            ) : (
              <>
                <Moon size={14} style={{ color: 'var(--accent-purple)' }} /> Dark Mode
              </>
            )}
          </button>

          {/* USER INFO */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem',
            background: 'var(--button-hover-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '10px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid #3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
              fontWeight: 'bold',
              fontSize: '0.8rem'
            }}>
              C
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {auth.currentUser?.email || 'Commander Sach'}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>System Operator</div>
            </div>
          </div>

          {/* EXIT / LOGOUT */}
          <button 
            onClick={onExit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '#0.5rem',
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '0.25rem',
              justifyContent: 'center'
            }}
          >
            <LogOut size={14} style={{ marginRight: '0.4rem' }} /> Exit Command Deck
          </button>

          {/* NET STACK STATUS */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.65rem',
            color: '#9ca3af',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981',
                animation: 'pulse 1.5s infinite'
              }} />
              <span>ORBIT NET: SECURE</span>
            </div>
            <span>{ping}ms</span>
          </div>
        </div>
      </div>

      {/* CENTER AREA */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        height: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* DYNAMIC MISSION STATUS BAR */}
        <div style={{
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid var(--card-border)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(10px)',
          zIndex: 5
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isExecuting ? '#eab308' : statusText === 'Campaign Active' ? '#10b981' : '#3b82f6',
              boxShadow: isExecuting 
                ? '0 0 10px #eab308' 
                : statusText === 'Campaign Active' 
                ? '0 0 10px #10b981' 
                : '0 0 10px #3b82f6',
              animation: 'pulse 1.2s infinite'
            }} />
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: 'monospace' }}>
              MISSION STATUS: <span style={{ 
                color: isExecuting ? '#eab308' : statusText === 'Campaign Active' ? '#10b981' : '#60a5fa', 
                fontWeight: 700 
              }}>{statusText}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* AUTONOMOUS MODE TOGGLE */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              userSelect: 'none'
            }}>
              <input 
                type="checkbox"
                checked={autonomousMode}
                onChange={(e) => setAutonomousMode(e.target.checked)}
                style={{
                  appearance: 'none',
                  width: '32px',
                  height: '16px',
                  borderRadius: '99px',
                  background: autonomousMode ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.3s',
                  outline: 'none',
                  border: '1px solid rgba(255,255,255,0.15)'
                }}
                className="autonomous-checkbox"
              />
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: autonomousMode ? '#3b82f6' : '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}>
                <Zap size={10} fill={autonomousMode ? 'currentColor' : 'none'} /> ⚡ Autonomous Mode
              </span>
            </label>
            <span style={{ fontSize: '0.7rem', color: '#4b5563', fontFamily: 'monospace' }}>SYSTEM VER: v3.2.1-SECURE</span>
          </div>
        </div>

        {/* SUB-TABS ROUTING SCREEN */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* TAB 1: FLAGSHIP COMMAND CENTER */}
          {activeTab === 'command-center' && (
            <>
              {/* MISSION CARDS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                animation: 'fadeIn 0.5s ease'
              }}>
                {/* CARD 1 */}
                <div style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  backdropFilter: 'blur(12px)',
                  boxShadow: 'var(--panel-shadow)'
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue Goal</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", margin: '0.25rem 0', color: '#10b981' }}>
                    ₹5,00,000
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', color: '#10b981' }}>
                    <span style={{ background: 'rgba(16,185,129,0.1)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>+12.4%</span>
                    <span style={{ color: 'var(--text-secondary)' }}>vs last target</span>
                  </div>
                </div>

                {/* CARD 2 */}
                <div style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  backdropFilter: 'blur(12px)',
                  boxShadow: 'var(--panel-shadow)'
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Pipelines</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", margin: '0.25rem 0', color: '#3b82f6' }}>
                    4 Active
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', color: '#3b82f6' }}>
                    <span style={{ background: 'rgba(59,130,246,0.1)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>Nova Node</span>
                    <span style={{ color: 'var(--text-secondary)' }}>monitoring</span>
                  </div>
                </div>

                {/* CARD 3 */}
                <div style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  backdropFilter: 'blur(12px)',
                  boxShadow: 'var(--panel-shadow)'
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nodes Interacted</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", margin: '0.25rem 0', color: '#a78bfa' }}>
                    1,482
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', color: '#a78bfa' }}>
                    <span style={{ background: 'rgba(139,92,246,0.1)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>Polaris Segment</span>
                    <span style={{ color: 'var(--text-secondary)' }}>reached</span>
                  </div>
                </div>

                {/* CARD 4 */}
                <div style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  backdropFilter: 'blur(12px)',
                  boxShadow: 'var(--panel-shadow)'
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Growth Index</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", margin: '0.25rem 0', color: '#ec4899' }}>
                    98.4%
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', color: '#ec4899' }}>
                    <span style={{ background: 'rgba(236,72,153,0.1)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>Optimal</span>
                    <span style={{ color: 'var(--text-secondary)' }}>efficiency index</span>
                  </div>
                </div>
              </div>

              {/* CONVERSATION INTERFACE BODY */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '16px',
                padding: '1.5rem',
                minHeight: '400px',
                justifyContent: 'space-between',
                position: 'relative'
              }}>
                
                {/* CHAT DISPLAY */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                  paddingRight: '0.5rem',
                  maxHeight: '450px'
                }}>
                  {/* EMPTY STATE */}
                  {chatHistory.length === 0 && !isExecuting && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      height: '100%',
                      margin: 'auto 0',
                      animation: 'fadeIn 0.6s ease'
                    }}>
                      {/* Animated Core */}
                      <div style={{
                        position: 'relative',
                        width: '120px',
                        height: '120px',
                        margin: '0 auto 2rem auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          position: 'absolute',
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          border: '2px dashed rgba(59, 130, 246, 0.3)',
                          animation: 'spin 12s linear infinite'
                        }} />
                        <div style={{
                          position: 'absolute',
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          border: '1px dashed rgba(139, 92, 246, 0.4)',
                          animation: 'spin-reverse 8s linear infinite'
                        }} />
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, #3b82f6 0%, #8b5cf6 100%)',
                          boxShadow: '0 0 35px rgba(59, 130, 246, 0.8)',
                          animation: 'pulse 2s infinite alternate'
                        }} />
                      </div>

                      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                        Your AI marketing team is standing by.
                      </h3>
                      <p style={{ color: '#9ca3af', fontSize: '0.85rem', maxWidth: '420px', lineHeight: 1.5 }}>
                        Describe a goal and ORBIT will coordinate Polaris, Nova, Vega, and Atlas to deploy targeted growth operations.
                      </p>
                    </div>
                  )}

                  {/* CHAT MESSAGES LOOP */}
                  {chatHistory.map((msg, idx) => (
                    <div 
                      key={idx}
                      style={{
                        alignSelf: msg.sender === 'operator' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        animation: 'fadeIn 0.3s ease'
                      }}
                    >
                      <div style={{ 
                        fontSize: '0.65rem', 
                        color: msg.sender === 'operator' ? '#60a5fa' : '#c084fc', 
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        alignSelf: msg.sender === 'operator' ? 'flex-end' : 'flex-start'
                      }}>
                        {msg.sender === 'operator' ? 'OPERATOR' : msg.sender === 'system' ? 'SYSTEM' : 'ORBIT COGNITIVE SYSTEM'}
                      </div>
                      
                      {msg.sender === 'operator' ? (
                        <div style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid #3b82f6',
                          borderRadius: '12px 12px 0 12px',
                          padding: '0.75rem 1.25rem',
                          color: '#f9fafb',
                          fontSize: '0.85rem',
                          fontFamily: 'monospace'
                        }}>
                          {msg.text}
                        </div>
                      ) : msg.sender === 'system' ? (
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px dashed rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          padding: '0.5rem 1rem',
                          color: '#10b981',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace'
                        }}>
                          {msg.text}
                        </div>
                      ) : (
                        <div style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--card-border)',
                          borderRadius: '12px 12px 12px 0',
                          padding: '1.25rem',
                          width: '100%',
                          minWidth: '320px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem'
                        }}>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                            Mission accepted and executed. The cohort parameters have been locked.
                          </div>

                          {/* MISSION METRIC SUMMARY TABLE */}
                          <div style={{
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--card-border)',
                            borderRadius: '8px',
                            padding: '1rem',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '0.75rem',
                            textAlign: 'center'
                          }}>
                            <div>
                              <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Opportunity</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981', fontFamily: "'Space Grotesk', sans-serif", marginTop: '0.25rem' }}>
                                {msg.data.revenue}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Cohort Size</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#3b82f6', fontFamily: "'Space Grotesk', sans-serif", marginTop: '0.25rem' }}>
                                {msg.data.audience}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Channel</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#a78bfa', fontFamily: "'Space Grotesk', sans-serif", marginTop: '0.25rem' }}>
                                {msg.data.channel}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Confidence</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ec4899', fontFamily: "'Space Grotesk', sans-serif", marginTop: '0.25rem' }}>
                                {msg.data.confidence}
                              </div>
                            </div>
                          </div>

                          {/* CAMPAIGN TEMPLATE PREVIEW */}
                          <div style={{
                            background: 'var(--button-hover-bg)',
                            border: '1px dashed var(--card-border)',
                            borderRadius: '8px',
                            padding: '0.85rem',
                            fontStyle: 'italic',
                            fontSize: '0.78rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.45
                          }}>
                            "{msg.data.copy}"
                          </div>

                          {/* ACTIONS */}
                          {!msg.autonomous && (
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                              <button 
                                onClick={() => handleLaunchCampaign(msg.data)}
                                disabled={campaignLaunched}
                                style={{
                                  background: campaignLaunched ? '#10b981' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                  border: 'none',
                                  color: '#fff',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  transition: 'all 0.3s'
                                }}
                              >
                                {campaignLaunched ? (
                                  <>
                                    <CheckCircle size={12} /> Dispatched
                                  </>
                                ) : (
                                  <>
                                    <Play size={10} fill="currentColor" /> Launch Campaign
                                  </>
                                )}
                              </button>
                              <button 
                                onClick={() => alert(`Reviewing assets: WhatsApp layout generated with dynamic vouchers...`)}
                                style={{
                                  background: 'rgba(255,255,255,0.03)',
                                  border: '1px solid rgba(255,255,255,0.06)',
                                  color: '#e5e7eb',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Preview Campaign
                              </button>
                              <button 
                                onClick={() => setActiveTab('customer-galaxy')}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid transparent',
                                  color: '#9ca3af',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  cursor: 'pointer'
                                }}
                              >
                                Refine Audience
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* ACTIVE LIVE PROGRESS / REASONING SEQUENCE */}
                  {isExecuting && (
                    <div style={{
                      alignSelf: 'flex-start',
                      width: '100%',
                      background: 'rgba(11, 17, 32, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      animation: 'fadeIn 0.3s ease'
                    }}>
                      
                      {/* STAGE 1: EXPANDABLE THINKING */}
                      {currentStep === 1 && (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <div className="spinner-mini" style={{
                              width: '12px',
                              height: '12px',
                              border: '2px solid rgba(59,130,246,0.2)',
                              borderTop: '2px solid #3b82f6',
                              borderRadius: '50%',
                              animation: 'spin 0.8s linear infinite'
                            }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', fontFamily: 'monospace' }}>
                              Thinking... ({Math.floor(reasoningProgress)}%)
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                            {presetQueries[activePresetIndex >= 0 ? activePresetIndex : 0].reasoning.map((stepName, idx) => {
                              const isCompleted = completedReasoningItems.includes(stepName);
                              return (
                                <div key={idx} style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.5rem',
                                  color: isCompleted ? '#10b981' : '#4b5563',
                                  transition: 'color 0.3s'
                                }}>
                                  <span>{isCompleted ? '✓' : '●'}</span>
                                  <span>{stepName}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* STAGE 2: SYSTEM EXECUTION BANNER */}
                      {currentStep === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                          {/* Animated mission banner */}
                          <div style={{
                            background: 'rgba(59, 130, 246, 0.08)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            textAlign: 'center',
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            color: '#60a5fa'
                          }}>
                            MISSION RECEIVED: Analyzing Customer Universe...
                          </div>

                          {/* Agent step log cards */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: agentProgress.polaris === 'Complete' ? '#10b981' : '#3b82f6' }}>
                              <span>🟢 Polaris Online</span>
                              <span>{agentProgress.polaris === 'Complete' ? '✓ Complete' : 'Identifying segments...'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: agentProgress.vega === 'Complete' ? '#10b981' : agentProgress.vega === 'Idle' ? '#4b5563' : '#3b82f6' }}>
                              <span>🟢 Vega Online</span>
                              <span>{agentProgress.vega === 'Complete' ? '✓ Complete' : agentProgress.vega === 'Idle' ? 'Offline' : 'Forecasting revenue...'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: agentProgress.nova === 'Complete' ? '#10b981' : agentProgress.nova === 'Idle' ? '#4b5563' : '#3b82f6' }}>
                              <span>🟢 Nova Online</span>
                              <span>{agentProgress.nova === 'Complete' ? '✓ Complete' : agentProgress.nova === 'Idle' ? 'Offline' : 'Generating templates...'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: agentProgress.atlas === 'Ready to launch' ? '#10b981' : agentProgress.atlas === 'Idle' ? '#4b5563' : '#3b82f6' }}>
                              <span>🟢 Atlas Online</span>
                              <span>{agentProgress.atlas === 'Ready to launch' ? '✓ Complete' : agentProgress.atlas === 'Idle' ? 'Offline' : 'Syncing operations...'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  <div ref={consoleEndRef} />
                </div>

                {/* BOTTOM SUGGESTED COMMANDS & INPUT */}
                <div style={{ marginTop: '1.5rem' }}>
                  {/* Suggested Commands Pills */}
                  {chatHistory.length === 0 && !isExecuting && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      marginBottom: '1rem',
                      justifyContent: 'center'
                    }}>
                      {presetQueries.map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActivePresetIndex(idx);
                            startMissionExecution(preset.prompt, idx);
                          }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '20px',
                            padding: '0.4rem 0.85rem',
                            color: '#9ca3af',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            transition: 'all 0.25s'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#3b82f6';
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.background = 'rgba(59,130,246,0.05)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = '#9ca3af';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                          }}
                        >
                          {preset.prompt.substring(0, 42)}...
                        </button>
                      ))}
                    </div>
                  )}

                  {/* COMMAND PILL INPUT BLOCK */}
                  <div style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '30px',
                    padding: '0.4rem 0.5rem 0.4rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: 'var(--panel-shadow)',
                    position: 'relative'
                  }}>
                    <button 
                      onClick={() => alert('Activating Orbit Voice Capture protocol...')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        padding: '0.25rem'
                      }}
                      title="Voice Command"
                    >
                      <Mic size={18} />
                    </button>
                    <button 
                      onClick={() => alert('Accessing attachment modules...')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        padding: '0.25rem'
                      }}
                      title="Attach File"
                    >
                      <Paperclip size={18} />
                    </button>
                    <input 
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSend();
                      }}
                      placeholder="Describe your growth mission..."
                      disabled={isExecuting}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace'
                      }}
                    />
                    <button 
                      onClick={handleSend}
                      disabled={isExecuting || !customInput.trim()}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        border: 'none',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                        opacity: (isExecuting || !customInput.trim()) ? 0.4 : 1
                      }}
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: CUSTOMER GALAXY DB */}
          {activeTab === 'customer-galaxy' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 300px',
              gap: '1.5rem',
              height: '100%',
              animation: 'fadeIn 0.5s ease'
            }}>
              {/* INTERACTIVE D3-STYLE GALAXY SVG */}
              <div style={{
                background: 'rgba(11, 17, 32, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '1.5rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '520px'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Customer Galaxy</h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.78rem' }}>Visual database of transacting clusters and neural segments.</p>
                </div>

                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <svg width="100%" height="100%" viewBox="0 0 600 350" style={{ pointerEvents: 'all' }}>
                    {/* Concentric orbital rings */}
                    <circle cx="300" cy="175" r="50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <circle cx="300" cy="175" r="90" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <circle cx="300" cy="175" r="140" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="300" cy="175" r="190" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

                    {/* Galaxy Core */}
                    <circle cx="300" cy="175" r="14" fill="#3b82f6" opacity="0.8" style={{ filter: 'drop-shadow(0 0 10px #3b82f6)' }} />

                    {/* Customer Node Clusters */}
                    <g 
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedCluster({ name: 'Active VIPs', count: 98, ltv: '₹58,400 avg', churn: '0.4%', color: '#10b981' })}
                    >
                      <circle cx="210" cy="110" r="12" fill="#10b981" opacity="0.6" style={{ filter: 'drop-shadow(0 0 6px #10b981)' }} />
                      <circle cx="210" cy="110" r="2" fill="#fff" />
                      <text x="210" y="90" fill="#9ca3af" fontSize="9" textAnchor="middle">VIP Cohort</text>
                    </g>

                    <g 
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedCluster({ name: 'High-Value Inactive', count: 432, ltv: '₹12,200 avg', churn: '45%', color: '#3b82f6' })}
                    >
                      <circle cx="380" cy="240" r="18" fill="#3b82f6" opacity="0.6" style={{ filter: 'drop-shadow(0 0 8px #3b82f6)' }} />
                      <circle cx="380" cy="240" r="3" fill="#fff" />
                      <text x="380" y="275" fill="#9ca3af" fontSize="9" textAnchor="middle">90D Inactive</text>
                    </g>

                    <g 
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedCluster({ name: 'Checkout Dropouts', count: 1280, ltv: '₹4,100 potential', churn: '78%', color: '#eab308' })}
                    >
                      <circle cx="440" cy="120" r="15" fill="#eab308" opacity="0.6" style={{ filter: 'drop-shadow(0 0 6px #eab308)' }} />
                      <circle cx="440" cy="120" r="2.5" fill="#fff" />
                      <text x="440" y="100" fill="#9ca3af" fontSize="9" textAnchor="middle">Cart Abandoners</text>
                    </g>

                    <g 
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedCluster({ name: 'New Signups', count: 280, ltv: '₹2,500 avg', churn: '12%', color: '#a78bfa' })}
                    >
                      <circle cx="160" cy="220" r="10" fill="#a78bfa" opacity="0.6" style={{ filter: 'drop-shadow(0 0 5px #a78bfa)' }} />
                      <circle cx="160" cy="220" r="2" fill="#fff" />
                      <text x="160" y="240" fill="#9ca3af" fontSize="9" textAnchor="middle">New Leads</text>
                    </g>

                    {/* Faint ambient nodes */}
                    <circle cx="260" cy="70" r="3" fill="rgba(255,255,255,0.2)" />
                    <circle cx="340" cy="80" r="2" fill="rgba(255,255,255,0.2)" />
                    <circle cx="280" cy="260" r="4" fill="rgba(255,255,255,0.2)" />
                    <circle cx="480" cy="190" r="2.5" fill="rgba(255,255,255,0.15)" />
                  </svg>
                </div>

                <div style={{ fontSize: '0.7rem', color: '#6b7280', textAlign: 'center' }}>
                  *Click on any main cohort cluster to inspect metrics
                </div>
              </div>

              {/* DETAILS SIDE PANE */}
              <div style={{
                background: 'rgba(11, 17, 32, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                {selectedCluster ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: selectedCluster.color,
                        boxShadow: `0 0 8px ${selectedCluster.color}`
                      }} />
                      <h4 style={{ fontSize: '1.1rem' }}>{selectedCluster.name}</h4>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.04)',
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#9ca3af' }}>Members:</span>
                        <span style={{ fontWeight: 'bold' }}>{selectedCluster.count}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#9ca3af' }}>Value Vector:</span>
                        <span style={{ fontWeight: 'bold' }}>{selectedCluster.ltv}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#9ca3af' }}>Churn Risk:</span>
                        <span style={{ fontWeight: 'bold', color: selectedCluster.churn.includes('78%') || selectedCluster.churn.includes('45%') ? '#f87171' : '#34d399' }}>{selectedCluster.churn}</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Core Attributes</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem' }}>Avg Recency: 98 days</span>
                        <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem' }}>Coupon affinity: High</span>
                        <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem' }}>Mobile User: 92%</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setActiveTab('command-center');
                        setCustomInput(`Recover cohort ${selectedCluster.name} via ${selectedCluster.color === '#10b981' ? 'VIP Loyalty channel' : 'WhatsApp promo package'}`);
                      }}
                      style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        padding: '0.65rem',
                        color: '#60a5fa',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: '1rem'
                      }}
                    >
                      Initialize Grow Vector
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    height: '100%',
                    color: '#9ca3af',
                    gap: '0.75rem'
                  }}>
                    <AlertCircle size={24} />
                    <span style={{ fontSize: '0.8rem' }}>No Cohort Selected.</span>
                    <span style={{ fontSize: '0.7rem' }}>Select a cluster node in the Customer Galaxy SVG diagram to analyze metrics.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AGENT BOARDROOM */}
          {activeTab === 'agent-boardroom' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              animation: 'fadeIn 0.5s ease'
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Agent Boardroom</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.78rem' }}>Manage and configure tokens allocated to ORBIT autonomous intelligence nodes.</p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem'
              }}>
                {/* Agent Polaris Card */}
                <div style={{
                  background: 'rgba(11, 17, 32, 0.45)',
                  border: '1px solid rgba(59, 130, 246, 0.15)',
                  borderRadius: '12px',
                  padding: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#3b82f6' }}><Compass size={18} /></span>
                      <h4 style={{ fontSize: '1rem' }}>Polaris (Audience Intel)</h4>
                    </div>
                    <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>IDLE</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '1rem' }}>
                    Specialized in vector database lookups, transactional clusters profiling, and customer data platform segments.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9ca3af', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                    <span>Model: GPT-4o Segmenter</span>
                    <span>Tokens Used: 48,102</span>
                  </div>
                </div>

                {/* Agent Nova Card */}
                <div style={{
                  background: 'rgba(11, 17, 32, 0.45)',
                  border: '1px solid rgba(139, 92, 246, 0.15)',
                  borderRadius: '12px',
                  padding: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#8b5cf6' }}><Sparkles size={18} /></span>
                      <h4 style={{ fontSize: '1rem' }}>Nova (Campaign Creator)</h4>
                    </div>
                    <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>IDLE</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '1rem' }}>
                    Specialized in creative assets drafting, personalized messaging copywriting, and context-dependent design parameters.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9ca3af', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                    <span>Model: Claude 3.5 Copywriter</span>
                    <span>Tokens Used: 92,492</span>
                  </div>
                </div>

                {/* Agent Vega Card */}
                <div style={{
                  background: 'rgba(11, 17, 32, 0.45)',
                  border: '1px solid rgba(14, 165, 233, 0.15)',
                  borderRadius: '12px',
                  padding: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#0ea5e9' }}><TrendingUp size={18} /></span>
                      <h4 style={{ fontSize: '1rem' }}>Vega (Predictive Analytics)</h4>
                    </div>
                    <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>IDLE</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '1rem' }}>
                    Specialized in revenue lift estimations, click-through probability forecasting, and ROI predictions.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9ca3af', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                    <span>Model: Vega-Math v2.4</span>
                    <span>Tokens Used: 24,105</span>
                  </div>
                </div>

                {/* Agent Atlas Card */}
                <div style={{
                  background: 'rgba(11, 17, 32, 0.45)',
                  border: '1px solid rgba(236, 72, 153, 0.15)',
                  borderRadius: '12px',
                  padding: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#ec4899' }}><Cpu size={18} /></span>
                      <h4 style={{ fontSize: '1rem' }}>Atlas (Campaign Operator)</h4>
                    </div>
                    <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>IDLE</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '1rem' }}>
                    Specialized in API trigger deployments, webhook synchronization, scheduling pacing, and dispatching communications.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9ca3af', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                    <span>Model: Atlas-Router v1.0</span>
                    <span>Tokens Used: 82,904</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VOICE CONSOLE */}
          {activeTab === 'voice-console' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              animation: 'fadeIn 0.5s ease'
            }}>
              {/* VOICE BUILDER */}
              <div style={{
                background: 'rgba(11, 17, 32, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Voice Console</h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.78rem' }}>Draft synthesized agent voice scripts for audio calling pipelines.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Select Synthetic Voice Node</label>
                  <select 
                    value={voiceModel}
                    onChange={(e) => setVoiceModel(e.target.value)}
                    style={{
                      background: '#070a14',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      color: '#fff',
                      padding: '0.6rem',
                      outline: 'none',
                      fontSize: '0.8rem'
                    }}
                  >
                    <option value="orbit-v1">Orbit Voice-1 (Male - Command Accent)</option>
                    <option value="vector-a">Vector-A (Female - Friendly Assist)</option>
                    <option value="nebula-prime">Nebula Prime (Neutral - Premium Tech)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Voice Script Scripting</label>
                  <textarea 
                    placeholder="Describe what the synthetic voice should say to the user..."
                    value={voiceScript}
                    onChange={(e) => setVoiceScript(e.target.value)}
                    style={{
                      background: '#070a14',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      color: '#fff',
                      padding: '0.75rem',
                      outline: 'none',
                      fontSize: '0.8rem',
                      minHeight: '100px',
                      resize: 'none',
                      lineHeight: 1.4
                    }}
                  />
                </div>

                <button 
                  onClick={startVoiceSynthesis}
                  disabled={isSynthesizing}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isSynthesizing ? (
                    <>
                      <RefreshCw size={14} className="spin-slow" /> Synthesizing Audio Node...
                    </>
                  ) : (
                    <>
                      <Volume2 size={14} /> Generate & Listen Voice Sample
                    </>
                  )}
                </button>
              </div>

              {/* WAVEFORM VISUALIZER */}
              <div style={{
                background: 'rgba(11, 17, 32, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                gap: '1.5rem',
                minHeight: '300px'
              }}>
                <h4 style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Synthetic Waveform Pulse</h4>
                
                {/* WAV BARS */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  height: '80px',
                  justifyContent: 'center'
                }}>
                  {waveBars.map((bar, idx) => (
                    <div 
                      key={idx}
                      style={{
                        width: '4px',
                        height: `${bar.height}px`,
                        background: 'linear-gradient(to top, #3b82f6, #8b5cf6)',
                        borderRadius: '2px',
                        animation: waveformActive ? 'bounceWave 1s infinite alternate' : 'none',
                        animationDelay: bar.delay,
                        transition: 'height 0.3s'
                      }}
                    />
                  ))}
                </div>

                <p style={{ fontSize: '0.72rem', color: '#6b7280', maxWidth: '240px' }}>
                  {waveformActive ? 'Audio stream playing from synthetics core.' : 'Click "Generate & Listen" to activate waveform sample synthesis.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: ORBIT ANALYTICS */}
          {activeTab === 'orbit-analytics' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              animation: 'fadeIn 0.5s ease'
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Orbit Analytics</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.78rem' }}>Realtime conversion tracking, forecasting matrices, and campaign pacing logs.</p>
              </div>

              {/* DYNAMIC LINE GRAPH (MINI SVG) */}
              <div style={{
                background: 'rgba(11, 17, 32, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '1.5rem',
                height: '280px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem' }}>Conversion Lift Projection (Vega Analytics Node)</h4>
                  <p style={{ color: '#9ca3af', fontSize: '0.7rem' }}>Realtime growth vector projection trend.</p>
                </div>

                <div style={{ flex: 1, position: 'relative', marginTop: '1rem' }}>
                  <svg width="100%" height="100%" viewBox="0 0 500 120" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(255,255,255,0.02)" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.02)" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.02)" />

                    {/* Gradient under curve */}
                    <path 
                      d={`M 0 120 L 0 ${120 - vegaChartData[0]} L 83 ${120 - vegaChartData[1]} L 166 ${120 - vegaChartData[2]} L 249 ${120 - vegaChartData[3]} L 332 ${120 - vegaChartData[4]} L 415 ${120 - vegaChartData[5]} L 500 ${120 - vegaChartData[6]} L 500 120 Z`}
                      fill="url(#glowGrad)" 
                    />

                    {/* Line Curve */}
                    <path 
                      d={`M 0 ${120 - vegaChartData[0]} L 83 ${120 - vegaChartData[1]} L 166 ${120 - vegaChartData[2]} L 249 ${120 - vegaChartData[3]} L 332 ${120 - vegaChartData[4]} L 415 ${120 - vegaChartData[5]} L 500 ${120 - vegaChartData[6]}`}
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="2" 
                    />

                    {/* Glowing dots */}
                    {vegaChartData.map((val, idx) => (
                      <circle 
                        key={idx} 
                        cx={idx === 6 ? 500 : idx * 83} 
                        cy={120 - val} 
                        r="3" 
                        fill="#60a5fa" 
                        style={{ filter: 'drop-shadow(0 0 4px #3b82f6)' }}
                      />
                    ))}

                    <defs>
                      <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.25)" />
                        <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SYSTEM CONFIGURATION */}
          {activeTab === 'system-config' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '1.5rem',
              animation: 'fadeIn 0.5s ease'
            }}>
              {/* SYSTEM DIAGNOSTICS */}
              <div style={{
                background: 'rgba(11, 17, 32, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>System Configuration</h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.78rem' }}>Check connectivity, databases, and operational webhooks.</p>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ color: '#9ca3af' }}>Firestore Database:</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>CONNECTIVITY ESTABLISHED</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ color: '#9ca3af' }}>Firebase Auth Server:</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>SECURE INTEGRATION</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ color: '#9ca3af' }}>WhatsApp API Gateway:</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>CONNECTED (200 OK)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9ca3af' }}>Nova Copywriter Node:</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>SYNCED</span>
                  </div>
                </div>
              </div>

              {/* TERMINAL LOGGER */}
              <div style={{
                background: '#040712',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '1.25rem',
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                lineHeight: 1.4,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '240px'
              }}>
                <div style={{ color: '#3b82f6', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
                  ORBIT DIAGNOSTIC LOGS
                </div>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', color: '#9ca3af' }}>
                  <div>[18:16:01] DB check: OK (Read count: 4)</div>
                  <div>[18:16:15] Nova Copy Model loaded successfully.</div>
                  <div>[18:16:22] Atlas dispatch channel synced.</div>
                  <div>[18:16:34] System diagnostic loop complete: STABLE</div>
                  <div style={{ color: '#10b981' }}>[18:16:44] Client synced (Ping: {ping}ms). Ready.</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: MISSION CONTROL (OVERVIEW DASHBOARD) */}
          {activeTab === 'mission-control' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              animation: 'fadeIn 0.5s ease'
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Mission Control</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.78rem' }}>Historical log of launched growth sequences and performance feedback loop.</p>
              </div>

              <div style={{
                background: 'rgba(11, 17, 32, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <h4 style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Historical Growth Missions (Firestore Feed)</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Increase Repeat Purchases</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.7rem', marginTop: '0.2rem' }}>Targeting 432 customers via WhatsApp</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#10b981', fontWeight: 600 }}>₹1.2 Lakhs potential</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.65rem', marginTop: '0.2rem' }}>Launched 12m ago</div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Recover Abandoned Cart checkout</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.7rem', marginTop: '0.2rem' }}>Targeting 1,280 checkout-dropouts via Email</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#10b981', fontWeight: 600 }}>₹3.8 Lakhs potential</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.65rem', marginTop: '0.2rem' }}>Launched 2h ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT SIDEBAR: AGENT ACTIVITY & FEED */}
      <div style={{
        background: 'rgba(5, 7, 18, 0.95)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        zIndex: 10,
        backdropFilter: 'blur(20px)',
        overflowY: 'auto'
      }}>
        
        {/* AGENTS PANEL */}
        <div>
          <h4 style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#9ca3af',
            marginBottom: '1rem',
            fontWeight: 600
          }}>
            Agent Activity
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Polaris Card */}
            <div style={{
              background: 'var(--card-bg)',
              border: `1px solid ${agentGlow.polaris ? '#3b82f6' : 'var(--card-border)'}`,
              borderRadius: '12px',
              padding: '0.85rem',
              boxShadow: agentGlow.polaris ? '0 0 15px rgba(59, 130, 246, 0.15)' : 'none',
              transition: 'all 0.3s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Compass size={14} style={{ color: '#3b82f6' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Polaris</span>
                </div>
                <span style={{ 
                  fontSize: '0.65rem', 
                  color: agentProgress.polaris === 'Analyzing segments' ? '#60a5fa' : agentProgress.polaris === 'Complete' ? '#10b981' : 'var(--text-secondary)'
                }}>
                  {agentProgress.polaris === 'Analyzing segments' ? 'Analyzing' : agentProgress.polaris}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Audience Intelligence</div>
              {agentProgress.polaris === 'Analyzing segments' && (
                <div style={{ width: '100%', height: '2px', background: 'var(--card-border)', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: '40%', height: '100%', background: '#3b82f6', borderRadius: '2px', animation: 'progressPulse 1.2s infinite' }} />
                </div>
              )}
            </div>

            {/* Nova Card */}
            <div style={{
              background: 'var(--card-bg)',
              border: `1px solid ${agentGlow.nova ? '#8b5cf6' : 'var(--card-border)'}`,
              borderRadius: '12px',
              padding: '0.85rem',
              boxShadow: agentGlow.nova ? '0 0 15px rgba(139, 92, 246, 0.15)' : 'none',
              transition: 'all 0.3s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={14} style={{ color: '#8b5cf6' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Nova</span>
                </div>
                <span style={{ 
                  fontSize: '0.65rem', 
                  color: agentProgress.nova === 'Drafting copy' ? '#a78bfa' : agentProgress.nova === 'Complete' ? '#10b981' : 'var(--text-secondary)'
                }}>
                  {agentProgress.nova === 'Drafting copy' ? 'Drafting campaign' : agentProgress.nova}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Campaign Creator</div>
              {agentProgress.nova === 'Drafting copy' && (
                <div style={{ display: 'flex', gap: '2px', marginTop: '0.4rem' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#8b5cf6', animation: 'typing 1s infinite alternate' }} />
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#8b5cf6', animation: 'typing 1s infinite alternate', animationDelay: '0.2s' }} />
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#8b5cf6', animation: 'typing 1s infinite alternate', animationDelay: '0.4s' }} />
                </div>
              )}
            </div>

            {/* Vega Card */}
            <div style={{
              background: 'var(--card-bg)',
              border: `1px solid ${agentGlow.vega ? '#0ea5e9' : 'var(--card-border)'}`,
              borderRadius: '12px',
              padding: '0.85rem',
              boxShadow: agentGlow.vega ? '0 0 15px rgba(14, 165, 233, 0.15)' : 'none',
              transition: 'all 0.3s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <TrendingUp size={14} style={{ color: '#0ea5e9' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Vega</span>
                </div>
                <span style={{ 
                  fontSize: '0.65rem', 
                  color: agentProgress.vega === 'Forecasting revenue' ? '#38bdf8' : agentProgress.vega === 'Complete' ? '#10b981' : 'var(--text-secondary)'
                }}>
                  {agentProgress.vega === 'Forecasting revenue' ? 'Forecasting revenue' : agentProgress.vega}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Predictive Analytics</div>
              
              {/* Mini SVG Chart updating live */}
              <div style={{ height: '24px', width: '100%', marginTop: '0.5rem' }}>
                <svg width="100%" height="100%" viewBox="0 0 200 24" preserveAspectRatio="none">
                  <path 
                    d={`M 0 24 L 0 ${24 - (vegaChartData[0]/4.5)} L 33 ${24 - (vegaChartData[1]/4.5)} L 66 ${24 - (vegaChartData[2]/4.5)} L 99 ${24 - (vegaChartData[3]/4.5)} L 132 ${24 - (vegaChartData[4]/4.5)} L 165 ${24 - (vegaChartData[5]/4.5)} L 200 ${24 - (vegaChartData[6]/4.5)}`}
                    fill="none" 
                    stroke={agentGlow.vega ? '#0ea5e9' : 'var(--card-border)'} 
                    strokeWidth="1.5" 
                  />
                </svg>
              </div>
            </div>

            {/* Atlas Card */}
            <div style={{
              background: 'var(--card-bg)',
              border: `1px solid ${agentGlow.atlas ? '#ec4899' : 'var(--card-border)'}`,
              borderRadius: '12px',
              padding: '0.85rem',
              boxShadow: agentGlow.atlas ? '0 0 15px rgba(236, 72, 153, 0.15)' : 'none',
              transition: 'all 0.3s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Cpu size={14} style={{ color: '#ec4899' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Atlas</span>
                </div>
                <span style={{ 
                  fontSize: '0.65rem', 
                  color: agentProgress.atlas === 'Syncing channels' ? '#f472b6' : agentProgress.atlas === 'Ready to launch' || agentProgress.atlas === 'Active dispatch' ? '#10b981' : 'var(--text-secondary)'
                }}>
                  {agentProgress.atlas === 'Syncing channels' ? 'Preparing launch' : agentProgress.atlas}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Campaign Operator</div>
              {agentGlow.atlas && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  marginTop: '0.5rem',
                  fontSize: '0.65rem',
                  color: '#f472b6'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#ec4899',
                    boxShadow: '0 0 6px #ec4899',
                    animation: 'pulse 0.8s infinite'
                  }} />
                  <span>SYSTEM PULSE ACTIVE</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LIVE EVENTS ACTIVITY FEED */}
        <div>
          <h4 style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#9ca3af',
            marginBottom: '1rem',
            fontWeight: 600
          }}>
            Live Activity Feed
          </h4>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            maxHeight: '220px',
            overflowY: 'auto'
          }}>
            {liveEvents.map((evt) => (
              <div 
                key={evt.id}
                style={{
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                  fontSize: '0.72rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                  animation: 'fadeIn 0.5s ease'
                }}
              >
                <div style={{ color: '#d1d5db', lineHeight: 1.3 }}>{evt.text}</div>
                <div style={{ fontSize: '0.6rem', color: '#6b7280' }}>{evt.time}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* COMPONENT CSS KEYFRAMES */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        @keyframes progressPulse {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        @keyframes typing {
          from { opacity: 0.2; transform: translateY(0); }
          to { opacity: 1; transform: translateY(-3px); }
        }
        @keyframes bounceWave {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1.3); }
        }
        .spin-slow {
          animation: spin 3s linear infinite;
        }
        .autonomous-checkbox:checked::after {
          content: '';
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fff;
          top: 1px;
          right: 1px;
          box-shadow: 0 0 5px rgba(59, 130, 246, 0.8);
          transition: all 0.3s;
        }
        .autonomous-checkbox::after {
          content: '';
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #4b5563;
          top: 1px;
          left: 1px;
          transition: all 0.3s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
