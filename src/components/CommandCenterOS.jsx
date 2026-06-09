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

  // Redesign state additions
  const [missionDetails, setMissionDetails] = useState({
    goal: 'Standby',
    status: 'System Ready',
    progress: 0,
    leadAgents: 'None',
    estCompletion: '--'
  });

  const [agentTelemetry, setAgentTelemetry] = useState({
    polaris: { task: 'System Standby', status: 'Standby', progress: 0, reasoning: 'Awaiting command', confidence: '--' },
    nova: { task: 'System Standby', status: 'Standby', progress: 0, reasoning: 'Awaiting command', confidence: '--' },
    vega: { task: 'System Standby', status: 'Standby', progress: 0, reasoning: 'Awaiting command', confidence: '--' },
    atlas: { task: 'System Standby', status: 'Standby', progress: 0, reasoning: 'Awaiting command', confidence: '--' }
  });

  const [launchSequenceActive, setLaunchSequenceActive] = useState(false);
  const [launchStep, setLaunchStep] = useState(0);
  const [expandedOutcomeIndex, setExpandedOutcomeIndex] = useState(-1);

  // Live system stream values
  const tickerEvents = [
    "Polaris discovered a new audience cluster.",
    "Nova generated campaign variant B.",
    "Vega updated revenue forecast.",
    "Atlas verified dispatch queue.",
    "Polaris detected purchase pattern decay in cohort D.",
    "Vega optimized lifetime value curve projections.",
    "Nova polished creative message templates.",
    "Atlas verified queue pipelines for SMS nodes.",
    "System diagnostic check: Stable (0.002% packet loss).",
    "Polaris created a micro-segment of 45 repeat buyers.",
    "Vega detected a 4.2% lift in conversion probability."
  ];
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const tickerInterval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % tickerEvents.length);
    }, 3500);
    return () => clearInterval(tickerInterval);
  }, []);

  
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
    
    // Set mission details initial
    setMissionDetails({
      goal: inputStr,
      status: 'Analyzing Customer Universe',
      progress: 0,
      leadAgents: 'Polaris • Vega',
      estCompletion: '6 Seconds'
    });

    // Step 1: Reasoning Mode
    setStatusText('Analyzing');
    setAgentProgress({ polaris: 'Analyzing', nova: 'Idle', vega: 'Idle', atlas: 'Idle' });
    setAgentGlow({ polaris: true, nova: false, vega: false, atlas: false });
    
    setAgentTelemetry({
      polaris: { task: 'Querying customer cohort...', status: 'Active', progress: 10, reasoning: 'Evaluating database records', confidence: '94%' },
      nova: { task: 'Awaiting input...', status: 'Standby', progress: 0, reasoning: 'Pending Polaris analysis', confidence: '--' },
      vega: { task: 'Awaiting input...', status: 'Standby', progress: 0, reasoning: 'Pending Polaris analysis', confidence: '--' },
      atlas: { task: 'Awaiting input...', status: 'Standby', progress: 0, reasoning: 'Pending Polaris analysis', confidence: '--' }
    });

    // Simulate ticking reasoning items
    for (let i = 0; i < selectedData.reasoning.length; i++) {
      await new Promise(resolve => setTimeout(resolve, autonomousMode ? 250 : 600));
      const stepName = selectedData.reasoning[i];
      setCompletedReasoningItems(prev => [...prev, stepName]);
      const currentProgress = Math.floor(((i + 1) / selectedData.reasoning.length) * 100);
      setReasoningProgress(currentProgress);

      setAgentTelemetry(prev => ({
        ...prev,
        polaris: {
          task: `Analyzing signal ${i + 1}/6: ${stepName}`,
          status: 'Active',
          progress: currentProgress,
          reasoning: stepName,
          confidence: '94%'
        }
      }));

      setMissionDetails(prev => ({
        ...prev,
        status: `Polaris: ${stepName}`,
        progress: Math.floor(currentProgress * 0.4),
        estCompletion: `${Math.max(1, 6 - i)} Seconds`
      }));
    }

    // Step 2: Agent Sync Sequence
    setCurrentStep(2);
    
    // Polaris Online Complete
    setStatusText('Segmenting Customers');
    setAgentProgress(prev => ({ ...prev, polaris: 'Analyzing segments' }));
    setAgentTelemetry(prev => ({
      ...prev,
      polaris: { task: `Identified cohort: ${selectedData.audience}`, status: 'Complete', progress: 100, reasoning: 'CDP segment locked', confidence: '94%' }
    }));
    await new Promise(resolve => setTimeout(resolve, autonomousMode ? 300 : 900));
    setAgentProgress(prev => ({ ...prev, polaris: 'Complete' }));
    setAgentGlow(prev => ({ ...prev, polaris: false }));

    // Vega Online
    setStatusText('Predicting Results');
    setAgentProgress(prev => ({ ...prev, vega: 'Forecasting revenue' }));
    setAgentGlow(prev => ({ ...prev, vega: true }));
    setAgentTelemetry(prev => ({
      ...prev,
      vega: { task: 'Forecasting revenue lift opportunities', status: 'Active', progress: 50, reasoning: 'Calculating CLV trajectory curves', confidence: '92%' }
    }));
    setMissionDetails(prev => ({
      ...prev,
      status: 'Vega: Calculating predictive curves',
      progress: 60,
      leadAgents: 'Vega • Nova',
      estCompletion: '4 Seconds'
    }));
    await new Promise(resolve => setTimeout(resolve, autonomousMode ? 300 : 900));
    setAgentProgress(prev => ({ ...prev, vega: 'Complete' }));
    setAgentGlow(prev => ({ ...prev, vega: false }));
    setAgentTelemetry(prev => ({
      ...prev,
      vega: { task: `Projected opportunity: ${selectedData.revenue}`, status: 'Complete', progress: 100, reasoning: 'ROI matrix locked', confidence: '92%' }
    }));

    // Nova Online
    setStatusText('Generating Campaign');
    setAgentProgress(prev => ({ ...prev, nova: 'Drafting copy' }));
    setAgentGlow(prev => ({ ...prev, nova: true }));
    setAgentTelemetry(prev => ({
      ...prev,
      nova: { task: 'Generating personalized copy variants', status: 'Active', progress: 60, reasoning: 'Creative personalization tokens', confidence: '88%' }
    }));
    setMissionDetails(prev => ({
      ...prev,
      status: 'Nova: Designing campaign models',
      progress: 80,
      leadAgents: 'Nova • Atlas',
      estCompletion: '2 Seconds'
    }));
    await new Promise(resolve => setTimeout(resolve, autonomousMode ? 300 : 900));
    setAgentProgress(prev => ({ ...prev, nova: 'Complete' }));
    setAgentGlow(prev => ({ ...prev, nova: false }));
    setAgentTelemetry(prev => ({
      ...prev,
      nova: { task: 'Campaign creative variations compiled', status: 'Complete', progress: 100, reasoning: 'Dynamic copy locked', confidence: '88%' }
    }));

    // Atlas Online
    setStatusText('Preparing Launch');
    setAgentProgress(prev => ({ ...prev, atlas: 'Syncing channels' }));
    setAgentGlow(prev => ({ ...prev, atlas: true }));
    setAgentTelemetry(prev => ({
      ...prev,
      atlas: { task: 'Checking API dispatch gateways', status: 'Active', progress: 80, reasoning: 'Validating carrier endpoints', confidence: '95%' }
    }));
    setMissionDetails(prev => ({
      ...prev,
      status: 'Atlas: Securing gateways',
      progress: 95,
      leadAgents: 'Atlas Core',
      estCompletion: '1 Seconds'
    }));
    await new Promise(resolve => setTimeout(resolve, autonomousMode ? 300 : 900));
    setAgentProgress(prev => ({ ...prev, atlas: 'Ready to launch' }));
    setAgentGlow(prev => ({ ...prev, atlas: false }));
    setAgentTelemetry(prev => ({
      ...prev,
      atlas: { task: 'Gateways verified. Armed and ready', status: 'Complete', progress: 100, reasoning: 'Carrier queues ready', confidence: '95%' }
    }));

    // Complete / Ready State
    setCurrentStep(3);
    setStatusText('Ready To Launch');
    setMissionDetails(prev => ({
      ...prev,
      status: 'Console Armed. Awaiting launch sequence confirmation.',
      progress: 100,
      estCompletion: '0 Seconds'
    }));

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
      setAgentProgress(prev => ({ ...prev, atlas: 'Active dispatch' }));
      setAgentGlow(prev => ({ ...prev, atlas: true }));
      setAgentTelemetry(prev => ({
        ...prev,
        atlas: { task: `Autopilot Dispatching to ${selectedData.audience}`, status: 'Active', progress: 100, reasoning: 'Auto deployment active', confidence: '95%' }
      }));
      setMissionDetails(prev => ({
        ...prev,
        status: 'Autopilot campaign active dispatch',
        progress: 100,
        estCompletion: '0 Seconds'
      }));
      
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
          text: `⚡ Autonomous launch successful. Dispatching ${selectedData.channel} package to ${selectedData.audience}.`
        }
      ]);
      
      setTimeout(() => {
        setAgentProgress(prev => ({ ...prev, atlas: 'Idle' }));
        setAgentGlow(prev => ({ ...prev, atlas: false }));
        setStatusText('Idle');
        setAgentTelemetry({
          polaris: { task: 'System Standby', status: 'Standby', progress: 0, reasoning: 'Awaiting command', confidence: '--' },
          nova: { task: 'System Standby', status: 'Standby', progress: 0, reasoning: 'Awaiting command', confidence: '--' },
          vega: { task: 'System Standby', status: 'Standby', progress: 0, reasoning: 'Awaiting command', confidence: '--' },
          atlas: { task: 'System Standby', status: 'Standby', progress: 0, reasoning: 'Awaiting command', confidence: '--' }
        });
        setMissionDetails({
          goal: 'Standby',
          status: 'System Ready',
          progress: 0,
          leadAgents: 'None',
          estCompletion: '--'
        });
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
    setLaunchSequenceActive(true);
    setLaunchStep(0);
    setStatusText('Launching');
    setAgentProgress(prev => ({ ...prev, atlas: 'Locking parameters' }));
    setAgentGlow(prev => ({ ...prev, atlas: true }));

    // Step 0: Initiating Launch Sequence...
    await new Promise(r => setTimeout(r, 600));
    setLaunchStep(1); // Audience Locked
    setAgentProgress(prev => ({ ...prev, atlas: 'Audience locked' }));

    await new Promise(r => setTimeout(r, 600));
    setLaunchStep(2); // Campaign Approved
    setAgentProgress(prev => ({ ...prev, atlas: 'Campaign approved' }));

    await new Promise(r => setTimeout(r, 600));
    setLaunchStep(3); // Channel Allocated
    setAgentProgress(prev => ({ ...prev, atlas: 'Channel allocated' }));

    await new Promise(r => setTimeout(r, 600));
    setLaunchStep(4); // Dispatch Queue Verified
    setAgentProgress(prev => ({ ...prev, atlas: 'Verifying queue' }));

    await new Promise(r => setTimeout(r, 600));
    setLaunchStep(5); // Atlas Dispatching
    setAgentProgress(prev => ({ ...prev, atlas: 'Atlas dispatching' }));

    await new Promise(r => setTimeout(r, 800));
    setLaunchStep(6); // CAMPAIGN ACTIVE
    setAgentProgress(prev => ({ ...prev, atlas: 'Active dispatch' }));
    setStatusText('Campaign Active');

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

    // Hold the completed state overlay for readability
    await new Promise(r => setTimeout(r, 1600));
    setLaunchSequenceActive(false);
    setCampaignLaunched(true);

    setTimeout(() => {
      setCampaignLaunched(false);
      setAgentProgress(prev => ({ ...prev, atlas: 'Idle' }));
      setAgentGlow(prev => ({ ...prev, atlas: false }));
      setStatusText('Idle');
      
      // Reset telemetry
      setAgentTelemetry({
        polaris: { task: 'System Standby', status: 'Standby', progress: 0, reasoning: 'Awaiting command', confidence: '--' },
        nova: { task: 'System Standby', status: 'Standby', progress: 0, reasoning: 'Awaiting command', confidence: '--' },
        vega: { task: 'System Standby', status: 'Standby', progress: 0, reasoning: 'Awaiting command', confidence: '--' },
        atlas: { task: 'System Standby', status: 'Standby', progress: 0, reasoning: 'Awaiting command', confidence: '--' }
      });
      setMissionDetails({
        goal: 'Standby',
        status: 'System Ready',
        progress: 0,
        leadAgents: 'None',
        estCompletion: '--'
      });
    }, 3000);
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
        {/* PERSISTENT MISSION CONTROL STATUS BANNER */}
        <div style={{
          borderBottom: '1px solid var(--card-border)',
          background: 'rgba(11, 17, 32, 0.9)',
          height: '75px',
          padding: '0 1.5rem',
          boxSizing: 'border-box',
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr',
          gap: '1rem',
          alignItems: 'center',
          backdropFilter: 'blur(15px)',
          zIndex: 5,
          position: 'relative'
        }}>
          {/* Column 1: Mission Goal / COMMAND */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.6rem', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              🚀 MISSION ACTIVE
            </span>
            <span style={{ 
              fontSize: '0.78rem', 
              fontWeight: 600, 
              color: '#f3f4f6',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '220px'
            }}>
              {missionDetails.goal === 'Standby' ? 'Goal: Standby' : `Goal: ${missionDetails.goal}`}
            </span>
          </div>

          {/* Column 2: Status Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.6rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              STATUS
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isExecuting ? '#eab308' : statusText === 'Campaign Active' ? '#10b981' : '#3b82f6',
                boxShadow: isExecuting ? '0 0 8px #eab308' : statusText === 'Campaign Active' ? '0 0 8px #10b981' : '0 0 8px #3b82f6',
                animation: 'pulse 1.2s infinite'
              }} />
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                color: isExecuting ? '#eab308' : statusText === 'Campaign Active' ? '#10b981' : '#3b82f6',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '120px'
              }}>
                {isExecuting ? 'ANALYZING' : statusText === 'Campaign Active' ? 'DISPATCHED' : 'STANDBY'}
              </span>
            </div>
          </div>

          {/* Column 3: Runtime Progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#9ca3af' }}>
              <span>PROGRESS</span>
              <span>{missionDetails.progress}%</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${missionDetails.progress}%`, 
                height: '100%', 
                background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', 
                borderRadius: '2px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          {/* Column 4: Lead Agents */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.6rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              LEAD AGENTS
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f3f4f6' }}>
              {missionDetails.leadAgents}
            </span>
          </div>

          {/* Column 5: Time Remaining */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.6rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              EST. COMPLETION
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isExecuting ? '#eab308' : '#3b82f6', fontFamily: 'monospace' }}>
              {missionDetails.estCompletion}
            </span>
          </div>
        </div>

        {/* AI OS STREAM ACTIVITY TICKER STRIP */}
        <div style={{
          background: 'rgba(5, 8, 22, 0.45)',
          borderBottom: '1px solid var(--card-border)',
          padding: '0.45rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.7rem',
          fontFamily: 'monospace',
          color: 'var(--text-secondary)',
          zIndex: 4
        }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            color: '#3b82f6',
            fontWeight: 700,
            fontSize: '0.65rem',
            letterSpacing: '0.05em'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 6px #10b981',
              animation: 'pulse 1.2s infinite'
            }} />
            SYSTEM STREAM &gt;
          </span>
          <div style={{
            animation: 'fadeInOut 3.5s infinite',
            color: '#9ca3af'
          }}>
            {tickerEvents[tickerIndex]}
          </div>
        </div>


        {/* SUB-TABS ROUTING SCREEN */}
        <div style={{
          flex: 1,
          overflow: activeTab === 'command-center' ? 'hidden' : 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          minHeight: 0
        }}>
          
          {/* TAB 1: FLAGSHIP COMMAND CENTER */}
          {activeTab === 'command-center' && (
            <>
              {/* CONVERSATION INTERFACE BODY */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '16px',
                padding: '1.5rem',
                minHeight: 0,
                overflow: 'hidden',
                justifyContent: 'space-between',
                position: 'relative'
              }}>
                
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                  paddingRight: '0.5rem',
                  minHeight: 0
                }}>
                  {/* EMPTY STATE - GLOWING ORBIT CORE */}
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
                      {/* Orbit Core Visual System */}
                      <div className="orbit-core-system" style={{
                        position: 'relative',
                        width: '240px',
                        height: '240px',
                        margin: '0 auto 1.5rem auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)'
                      }}>
                        {/* Outer Orbit Track */}
                        <div style={{
                          position: 'absolute',
                          width: '220px',
                          height: '220px',
                          borderRadius: '50%',
                          border: '1px dashed rgba(139, 92, 246, 0.15)',
                          animation: 'spin 20s linear infinite'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            left: '50%',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#8b5cf6',
                            boxShadow: '0 0 10px #8b5cf6',
                            transform: 'translateX(-50%)'
                          }} />
                          <div style={{
                            position: 'absolute',
                            bottom: '8px',
                            left: '50%',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#ec4899',
                            boxShadow: '0 0 8px #ec4899',
                            transform: 'translateX(-50%)'
                          }} />
                        </div>

                        {/* Middle Orbit Track */}
                        <div style={{
                          position: 'absolute',
                          width: '160px',
                          height: '160px',
                          borderRadius: '50%',
                          border: '1px dashed rgba(59, 130, 246, 0.2)',
                          animation: 'spin-reverse 15s linear infinite'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '-4px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#3b82f6',
                            boxShadow: '0 0 10px #3b82f6',
                            transform: 'translateY(-50%)'
                          }} />
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            right: '-4px',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#10b981',
                            boxShadow: '0 0 8px #10b981',
                            transform: 'translateY(-50%)'
                          }} />
                        </div>

                        {/* Inner Orbit Track */}
                        <div style={{
                          position: 'absolute',
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          border: '1px dashed rgba(255, 255, 255, 0.05)',
                          animation: 'spin 10s linear infinite'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: '#60a5fa',
                            boxShadow: '0 0 6px #60a5fa'
                          }} />
                        </div>

                        {/* Glowing CORE */}
                        <div className="orbit-core-glow" style={{
                          position: 'relative',
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, #3b82f6 0%, #8b5cf6 60%, #050816 100%)',
                          boxShadow: '0 0 35px rgba(59, 130, 246, 0.8), 0 0 70px rgba(139, 92, 246, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          animation: 'pulseCore 4s infinite alternate'
                        }}>
                          <Orbit size={24} style={{ color: '#fff', animation: 'spin 8s linear infinite' }} />
                        </div>
                      </div>

                      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.4rem', marginBottom: '0.5rem', color: '#fff' }}>
                        Your AI Marketing Team Is Standing By.
                      </h3>
                      <p style={{ color: '#9ca3af', fontSize: '0.82rem', maxWidth: '420px', lineHeight: 1.5 }}>
                        Describe a growth goal and ORBIT will transform it into action by coordinating Polaris, Nova, Vega, and Atlas.
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
                        animation: 'fadeIn 0.3s ease',
                        width: msg.sender === 'orbit' ? '100%' : 'auto'
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
                        /* PREMIUM MISSION OUTCOME CARD */
                        <div style={{
                          background: 'rgba(11, 17, 32, 0.8)',
                          border: '1px solid rgba(59, 130, 246, 0.25)',
                          borderRadius: '16px',
                          padding: '1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1.25rem',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.4), 0 0 20px rgba(59, 130, 246, 0.1)',
                          animation: 'fadeIn 0.5s ease',
                          width: '100%'
                        }}>
                          {/* Card Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#10b981',
                              letterSpacing: '0.1em',
                              fontFamily: "'Space Grotesk', sans-serif"
                            }}>
                              🏆 MISSION OUTCOME
                            </span>
                            <span style={{
                              background: 'rgba(16, 185, 129, 0.1)',
                              color: '#10b981',
                              fontSize: '0.65rem',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              fontWeight: 600
                            }}>
                              CONFIDENCE: {msg.data.confidence}
                            </span>
                          </div>

                          {/* Premium Metric Grid */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1rem',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            paddingBottom: '1.25rem'
                          }}>
                            {/* METRIC 1: REVENUE */}
                            <div style={{
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              borderRadius: '8px',
                              padding: '0.75rem'
                            }}>
                              <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase' }}>Revenue Opportunity</div>
                              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#10b981', fontFamily: "'Space Grotesk', sans-serif", marginTop: '0.2rem' }}>
                                {msg.data.revenue}
                              </div>
                            </div>

                            {/* METRIC 2: COHORT */}
                            <div style={{
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              borderRadius: '8px',
                              padding: '0.75rem'
                            }}>
                              <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase' }}>Audience Size</div>
                              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#3b82f6', fontFamily: "'Space Grotesk', sans-serif", marginTop: '0.2rem' }}>
                                {msg.data.audience}
                              </div>
                            </div>

                            {/* METRIC 3: OPEN RATE */}
                            <div style={{
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              borderRadius: '8px',
                              padding: '0.75rem'
                            }}>
                              <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase' }}>Expected Open Rate</div>
                              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#a78bfa', fontFamily: "'Space Grotesk', sans-serif", marginTop: '0.2rem' }}>
                                74%
                              </div>
                            </div>

                            {/* METRIC 4: CONVERSION */}
                            <div style={{
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              borderRadius: '8px',
                              padding: '0.75rem'
                            }}>
                              <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase' }}>Predicted Conversion</div>
                              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ec4899', fontFamily: "'Space Grotesk', sans-serif", marginTop: '0.2rem' }}>
                                12.4%
                              </div>
                            </div>
                          </div>

                          {/* CHANNEL DETAIL */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(59, 130, 246, 0.05)',
                            border: '1px solid rgba(59, 130, 246, 0.15)',
                            borderRadius: '8px',
                            padding: '0.75rem'
                          }}>
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                              Recommended Channel:
                            </span>
                            <span style={{
                              background: '#22c55e',
                              color: '#fff',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              boxShadow: '0 0 10px rgba(34, 197, 94, 0.4)'
                            }}>
                              <MessageCircle size={12} fill="#fff" /> {msg.data.channel}
                            </span>
                          </div>

                          {/* Campaign Copy Preview */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                              Creative Content Draft
                            </span>
                            <div style={{
                              background: '#070a13',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              borderRadius: '8px',
                              padding: '1rem',
                              fontStyle: 'italic',
                              fontSize: '0.8rem',
                              color: '#e5e7eb',
                              lineHeight: 1.5,
                              borderLeft: '3px solid #8b5cf6'
                            }}>
                              "{msg.data.copy}"
                            </div>
                          </div>

                          {/* Explainability Drawer Button */}
                          <button
                            onClick={() => setExpandedOutcomeIndex(prev => (prev === idx ? -1 : idx))}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#60a5fa',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              alignSelf: 'flex-start',
                              padding: '0',
                              fontWeight: 600,
                              fontFamily: 'monospace'
                            }}
                          >
                            <span>{expandedOutcomeIndex === idx ? '▼' : '►'} Why {msg.data.channel}?</span>
                          </button>

                          {/* Explainability Drawer Content */}
                          {expandedOutcomeIndex === idx && (
                            <div style={{
                              background: 'rgba(11, 17, 32, 0.5)',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              borderRadius: '8px',
                              padding: '0.85rem 1rem',
                              fontSize: '0.75rem',
                              color: '#9ca3af',
                              lineHeight: 1.5,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.5rem',
                              animation: 'fadeIn 0.25s ease'
                            }}>
                              <div style={{ fontWeight: 600, color: '#e5e7eb', fontFamily: 'monospace' }}>
                                ORBIT selected {msg.data.channel} because:
                              </div>
                              <ul style={{ paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <li>• 73% historical open rate on WhatsApp for this cluster</li>
                                <li>• Highest engagement velocity during evening peaks</li>
                                <li>• Lowest projected churn risk and unsubscribe frequency</li>
                              </ul>
                              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '0.5rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                                <span>Confidence Matrix:</span>
                                <span style={{ color: '#10b981' }}>91% STABLE</span>
                              </div>
                            </div>
                          )}

                          {/* ACTIONS */}
                          {!msg.autonomous && (
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                              <button 
                                onClick={() => handleLaunchCampaign(msg.data)}
                                disabled={campaignLaunched}
                                style={{
                                  background: campaignLaunched ? '#10b981' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                  border: 'none',
                                  color: '#fff',
                                  padding: '0.6rem 1.2rem',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  boxShadow: campaignLaunched ? 'none' : '0 0 15px rgba(59, 130, 246, 0.4)',
                                  transition: 'all 0.3s'
                                }}
                                onMouseEnter={e => {
                                  if (!campaignLaunched) {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.6)';
                                  }
                                }}
                                onMouseLeave={e => {
                                  if (!campaignLaunched) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.4)';
                                  }
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
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  color: '#e5e7eb',
                                  padding: '0.6rem 1.2rem',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.25s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                              >
                                Preview Campaign
                              </button>
                              <button 
                                onClick={() => setActiveTab('customer-galaxy')}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid transparent',
                                  color: '#9ca3af',
                                  padding: '0.6rem 1.2rem',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  transition: 'all 0.25s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
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
                      background: 'rgba(11, 17, 32, 0.45)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      animation: 'fadeIn 0.3s ease'
                    }}>
                      
                      {/* REDESIGNED AI REASONING TIMELINE */}
                      {currentStep === 1 && (
                        <div style={{
                          background: 'rgba(11, 17, 32, 0.75)',
                          border: '1px solid rgba(59, 130, 246, 0.25)',
                          borderRadius: '16px',
                          padding: '1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1.25rem',
                          boxShadow: '0 0 25px rgba(59, 130, 246, 0.1)',
                          animation: 'fadeIn 0.4s ease',
                          width: '100%'
                        }}>
                          {/* Title Bar */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            paddingBottom: '0.75rem'
                          }}>
                            <span style={{
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              fontFamily: "'Space Grotesk', sans-serif",
                              color: '#eab308',
                              letterSpacing: '0.1em'
                            }}>
                              ⚡ MISSION ACCEPTED
                            </span>
                            <span style={{
                              fontSize: '0.7rem',
                              fontFamily: 'monospace',
                              color: '#9ca3af'
                            }}>
                              INITIATING ENGINE...
                            </span>
                          </div>

                          {/* Timeline List */}
                          <div style={{
                            position: 'relative',
                            paddingLeft: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                          }}>
                            {/* Timeline connector line */}
                            <div style={{
                              position: 'absolute',
                              left: '6px',
                              top: '5px',
                              bottom: '5px',
                              width: '2px',
                              background: 'linear-gradient(to bottom, #10b981 30%, rgba(255,255,255,0.05) 100%)',
                              transition: 'all 0.5s'
                            }} />

                            {presetQueries[activePresetIndex >= 0 ? activePresetIndex : 0].reasoning.map((stepName, idx) => {
                              const isCompleted = completedReasoningItems.includes(stepName);
                              const isActive = !isCompleted && (idx === completedReasoningItems.length);
                              return (
                                <div key={idx} style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.75rem',
                                  color: isCompleted ? '#10b981' : isActive ? '#60a5fa' : '#4b5563',
                                  fontSize: '0.8rem',
                                  fontFamily: 'monospace',
                                  transition: 'all 0.3s'
                                }}>
                                  {/* Node dot */}
                                  <div style={{
                                    position: 'absolute',
                                    left: '1px',
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: isCompleted ? '#10b981' : isActive ? '#3b82f6' : '#1f2937',
                                    border: `2px solid ${isCompleted ? '#10b981' : isActive ? '#60a5fa' : 'rgba(255,255,255,0.08)'}`,
                                    boxShadow: isCompleted 
                                      ? '0 0 8px #10b981' 
                                      : isActive 
                                      ? '0 0 8px #3b82f6' 
                                      : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 2,
                                    transition: 'all 0.3s'
                                  }}>
                                    {isCompleted && <span style={{ fontSize: '0.5rem', color: '#fff', fontWeight: 'bold' }}>✓</span>}
                                  </div>

                                  <span style={{ fontWeight: isActive ? 600 : 400 }}>{stepName}</span>
                                  {isActive && (
                                    <span style={{ fontSize: '0.65rem', color: '#3b82f6', opacity: 0.8 }} className="blink">
                                      [PROCESSING...]
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* STAGE 2: SYSTEM EXECUTION BANNER */}
                      {currentStep === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%' }}>
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
                            MISSION IN PROGRESS: SYNCING COOPERATIVE NODES
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
            Agent Telemetry
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Redesigned Polaris Card */}
            <div style={{
              background: 'rgba(11, 17, 32, 0.7)',
              border: `1px solid ${agentGlow.polaris ? '#3b82f6' : 'var(--card-border)'}`,
              borderRadius: '12px',
              padding: '1rem',
              transition: 'all 0.3s',
              animation: agentGlow.polaris ? 'pulseGlowBlue 1.5s infinite alternate' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Compass size={16} style={{ color: '#3b82f6' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.02em', color: '#fff' }}>Polaris</span>
                </div>
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 700,
                  color: agentTelemetry.polaris.status === 'Active' ? '#60a5fa' : agentTelemetry.polaris.status === 'Complete' ? '#10b981' : '#9ca3af',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  {agentTelemetry.polaris.status === 'Active' && (
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#3b82f6',
                      boxShadow: '0 0 6px #3b82f6',
                      animation: 'pulse 1s infinite'
                    }} />
                  )}
                  {agentTelemetry.polaris.status}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontStyle: 'italic' }}>Audience Intelligence</div>

              <div style={{ 
                fontSize: '0.72rem', 
                color: '#e5e7eb',
                fontFamily: 'monospace',
                background: '#070a13',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.03)'
              }}>
                Task: {agentTelemetry.polaris.task}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#9ca3af' }}>
                  <span>Progress: {agentTelemetry.polaris.progress}%</span>
                  <span>Confidence: {agentTelemetry.polaris.confidence}</span>
                </div>
                <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${agentTelemetry.polaris.progress}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s' }} />
                </div>
              </div>

              <div style={{ fontSize: '0.65rem', color: '#6b7280', fontFamily: 'monospace', display: 'flex', gap: '0.2rem' }}>
                <span>&gt; Reasoning:</span>
                <span style={{ color: '#9ca3af' }}>{agentTelemetry.polaris.reasoning}</span>
              </div>
            </div>

            {/* Redesigned Nova Card */}
            <div style={{
              background: 'rgba(11, 17, 32, 0.7)',
              border: `1px solid ${agentGlow.nova ? '#8b5cf6' : 'var(--card-border)'}`,
              borderRadius: '12px',
              padding: '1rem',
              transition: 'all 0.3s',
              animation: agentGlow.nova ? 'pulseGlowPurple 1.5s infinite alternate' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} style={{ color: '#8b5cf6' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.02em', color: '#fff' }}>Nova</span>
                </div>
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 700,
                  color: agentTelemetry.nova.status === 'Active' ? '#a78bfa' : agentTelemetry.nova.status === 'Complete' ? '#10b981' : '#9ca3af',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  {agentTelemetry.nova.status === 'Active' && (
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#8b5cf6',
                      boxShadow: '0 0 6px #8b5cf6',
                      animation: 'pulse 1s infinite'
                    }} />
                  )}
                  {agentTelemetry.nova.status}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontStyle: 'italic' }}>Campaign Creator</div>

              <div style={{ 
                fontSize: '0.72rem', 
                color: '#e5e7eb',
                fontFamily: 'monospace',
                background: '#070a13',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.03)'
              }}>
                Task: {agentTelemetry.nova.task}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#9ca3af' }}>
                  <span>Progress: {agentTelemetry.nova.progress}%</span>
                  <span>Confidence: {agentTelemetry.nova.confidence}</span>
                </div>
                <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${agentTelemetry.nova.progress}%`, height: '100%', background: '#8b5cf6', transition: 'width 0.3s' }} />
                </div>
              </div>

              <div style={{ fontSize: '0.65rem', color: '#6b7280', fontFamily: 'monospace', display: 'flex', gap: '0.2rem' }}>
                <span>&gt; Reasoning:</span>
                <span style={{ color: '#9ca3af' }}>{agentTelemetry.nova.reasoning}</span>
              </div>
            </div>

            {/* Redesigned Vega Card */}
            <div style={{
              background: 'rgba(11, 17, 32, 0.7)',
              border: `1px solid ${agentGlow.vega ? '#0ea5e9' : 'var(--card-border)'}`,
              borderRadius: '12px',
              padding: '1rem',
              transition: 'all 0.3s',
              animation: agentGlow.vega ? 'pulseGlowSky 1.5s infinite alternate' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={16} style={{ color: '#0ea5e9' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.02em', color: '#fff' }}>Vega</span>
                </div>
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 700,
                  color: agentTelemetry.vega.status === 'Active' ? '#38bdf8' : agentTelemetry.vega.status === 'Complete' ? '#10b981' : '#9ca3af',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  {agentTelemetry.vega.status === 'Active' && (
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#0ea5e9',
                      boxShadow: '0 0 6px #0ea5e9',
                      animation: 'pulse 1s infinite'
                    }} />
                  )}
                  {agentTelemetry.vega.status}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontStyle: 'italic' }}>Predictive Analytics</div>

              <div style={{ 
                fontSize: '0.72rem', 
                color: '#e5e7eb',
                fontFamily: 'monospace',
                background: '#070a13',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.03)'
              }}>
                Task: {agentTelemetry.vega.task}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#9ca3af' }}>
                  <span>Progress: {agentTelemetry.vega.progress}%</span>
                  <span>Confidence: {agentTelemetry.vega.confidence}</span>
                </div>
                <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${agentTelemetry.vega.progress}%`, height: '100%', background: '#0ea5e9', transition: 'width 0.3s' }} />
                </div>
              </div>

              {/* Vega live chart telemetry */}
              <div style={{ height: '28px', width: '100%', marginTop: '0.2rem', background: '#070a13', borderRadius: '6px', padding: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <svg width="100%" height="100%" viewBox="0 0 200 24" preserveAspectRatio="none">
                  <path 
                    d={`M 0 24 L 0 ${24 - (vegaChartData[0]/4.5)} L 33 ${24 - (vegaChartData[1]/4.5)} L 66 ${24 - (vegaChartData[2]/4.5)} L 99 ${24 - (vegaChartData[3]/4.5)} L 132 ${24 - (vegaChartData[4]/4.5)} L 165 ${24 - (vegaChartData[5]/4.5)} L 200 ${24 - (vegaChartData[6]/4.5)}`}
                    fill="none" 
                    stroke={agentGlow.vega ? '#0ea5e9' : 'rgba(255, 255, 255, 0.15)'} 
                    strokeWidth="1.5" 
                    style={{ transition: 'stroke 0.3s' }}
                  />
                </svg>
              </div>

              <div style={{ fontSize: '0.65rem', color: '#6b7280', fontFamily: 'monospace', display: 'flex', gap: '0.2rem' }}>
                <span>&gt; Reasoning:</span>
                <span style={{ color: '#9ca3af' }}>{agentTelemetry.vega.reasoning}</span>
              </div>
            </div>

            {/* Redesigned Atlas Card */}
            <div style={{
              background: 'rgba(11, 17, 32, 0.7)',
              border: `1px solid ${agentGlow.atlas ? '#ec4899' : 'var(--card-border)'}`,
              borderRadius: '12px',
              padding: '1rem',
              transition: 'all 0.3s',
              animation: agentGlow.atlas ? 'pulseGlowPink 1.5s infinite alternate' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Cpu size={16} style={{ color: '#ec4899' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.02em', color: '#fff' }}>Atlas</span>
                </div>
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 700,
                  color: agentTelemetry.atlas.status === 'Active' ? '#f472b6' : agentTelemetry.atlas.status === 'Complete' ? '#10b981' : '#9ca3af',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  {agentTelemetry.atlas.status === 'Active' && (
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#ec4899',
                      boxShadow: '0 0 6px #ec4899',
                      animation: 'pulse 1s infinite'
                    }} />
                  )}
                  {agentTelemetry.atlas.status}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontStyle: 'italic' }}>Campaign Operator</div>

              <div style={{ 
                fontSize: '0.72rem', 
                color: '#e5e7eb',
                fontFamily: 'monospace',
                background: '#070a13',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.03)'
              }}>
                Task: {agentTelemetry.atlas.task}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#9ca3af' }}>
                  <span>Progress: {agentTelemetry.atlas.progress}%</span>
                  <span>Confidence: {agentTelemetry.atlas.confidence}</span>
                </div>
                <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${agentTelemetry.atlas.progress}%`, height: '100%', background: '#ec4899', transition: 'width 0.3s' }} />
                </div>
              </div>

              <div style={{ fontSize: '0.65rem', color: '#6b7280', fontFamily: 'monospace', display: 'flex', gap: '0.2rem' }}>
                <span>&gt; Reasoning:</span>
                <span style={{ color: '#9ca3af' }}>{agentTelemetry.atlas.reasoning}</span>
              </div>
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
          0% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        @keyframes pulseCore {
          0% { transform: scale(0.96); box-shadow: 0 0 35px rgba(59, 130, 246, 0.7), 0 0 70px rgba(139, 92, 246, 0.35); }
          100% { transform: scale(1.04); box-shadow: 0 0 55px rgba(59, 130, 246, 0.95), 0 0 110px rgba(139, 92, 246, 0.65); }
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(2px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-2px); }
        }
        @keyframes pulseGlowBlue {
          0% { border-color: rgba(59, 130, 246, 0.3); box-shadow: 0 0 6px rgba(59, 130, 246, 0.1); }
          100% { border-color: rgba(59, 130, 246, 0.85); box-shadow: 0 0 18px rgba(59, 130, 246, 0.4); }
        }
        @keyframes pulseGlowPurple {
          0% { border-color: rgba(139, 92, 246, 0.3); box-shadow: 0 0 6px rgba(139, 92, 246, 0.1); }
          100% { border-color: rgba(139, 92, 246, 0.85); box-shadow: 0 0 18px rgba(139, 92, 246, 0.4); }
        }
        @keyframes pulseGlowSky {
          0% { border-color: rgba(14, 165, 233, 0.3); box-shadow: 0 0 6px rgba(14, 165, 233, 0.1); }
          100% { border-color: rgba(14, 165, 233, 0.85); box-shadow: 0 0 18px rgba(14, 165, 233, 0.4); }
        }
        @keyframes pulseGlowPink {
          0% { border-color: rgba(236, 72, 153, 0.3); box-shadow: 0 0 6px rgba(236, 72, 153, 0.1); }
          100% { border-color: rgba(236, 72, 153, 0.85); box-shadow: 0 0 18px rgba(236, 72, 153, 0.4); }
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
        .blink {
          animation: pulse 0.8s infinite alternate;
        }
      `}</style>

      {/* CINEMATIC LAUNCH SEQUENCE OVERLAY */}
      {launchSequenceActive && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(5, 8, 22, 0.96)',
          backdropFilter: 'blur(15px)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontFamily: 'monospace',
          animation: 'fadeIn 0.4s ease'
        }}>
          {/* Animated Grid overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'radial-gradient(rgba(59, 130, 246, 0.1) 1.5px, transparent 1.5px)',
            backgroundSize: '30px 30px',
            opacity: 0.3,
            pointerEvents: 'none'
          }} />

          {/* Glowing Vector radar ring */}
          <div style={{
            position: 'absolute',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            boxShadow: '0 0 100px rgba(59, 130, 246, 0.05)',
            animation: 'spin 30s linear infinite',
            pointerEvents: 'none'
          }} />

          {/* Telemetry Console Frame */}
          <div style={{
            background: 'rgba(11, 17, 32, 0.85)',
            border: '2px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 0 50px rgba(59, 130, 246, 0.2), inset 0 0 30px rgba(59, 130, 246, 0.1)',
            borderRadius: '20px',
            padding: '3rem',
            width: '90%',
            maxWidth: '560px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* Corner decorations */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', width: '20px', height: '20px', borderTop: '2px solid #3b82f6', borderLeft: '2px solid #3b82f6' }} />
            <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderTop: '2px solid #3b82f6', borderRight: '2px solid #3b82f6' }} />
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '20px', height: '20px', borderBottom: '2px solid #3b82f6', borderLeft: '2px solid #3b82f6' }} />
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '20px', height: '20px', borderBottom: '2px solid #3b82f6', borderRight: '2px solid #3b82f6' }} />

            {/* Launch Heading */}
            <div>
              <h2 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1.75rem',
                color: '#fff',
                letterSpacing: '0.15em',
                textShadow: '0 0 15px rgba(59, 130, 246, 0.8)',
                marginBottom: '0.5rem'
              }}>
                {launchStep === 6 ? 'LAUNCH COMPLETED' : 'LAUNCH PROTOCOL'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#60a5fa', letterSpacing: '0.2em' }}>
                {launchStep === 0 && 'INITIATING CORE DISPATCH ENGINE...'}
                {launchStep >= 1 && launchStep <= 5 && 'EXECUTING SEQUENTIAL MATRIX CHECKLIST...'}
                {launchStep === 6 && 'ALL SYSTEMS ENGAGED - DISPATCH ACTIVE'}
              </p>
            </div>

            {/* Telemetry Steps */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              textAlign: 'left',
              padding: '1rem',
              background: '#070a13',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.05)',
              fontFamily: 'monospace'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: launchStep >= 1 ? '#10b981' : '#4b5563' }}>
                <span>[01] AUDIENCE COHORT LOCK</span>
                <span>{launchStep >= 1 ? '✓ SECURED' : '● PENDING'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: launchStep >= 2 ? '#10b981' : '#4b5563' }}>
                <span>[02] CAMPAIGN ASSET VERIFICATION</span>
                <span>{launchStep >= 2 ? '✓ VERIFIED' : '● PENDING'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: launchStep >= 3 ? '#10b981' : '#4b5563' }}>
                <span>[03] GATEWAY CHANNEL ALLOCATION</span>
                <span>{launchStep >= 3 ? '✓ ROUTED' : '● PENDING'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: launchStep >= 4 ? '#10b981' : '#4b5563' }}>
                <span>[04] DISPATCH QUEUE INTEGRITY</span>
                <span>{launchStep >= 4 ? '✓ STABLE' : '● PENDING'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: launchStep >= 5 ? '#10b981' : '#4b5563' }}>
                <span>[05] ATLAS CORE DISPATCH CONTROLLER</span>
                <span>{launchStep >= 5 ? '✓ DISPATCHING' : '● PENDING'}</span>
              </div>
            </div>

            {/* Big Launch Banner or Progress Bar */}
            <div style={{ marginTop: '0.5rem' }}>
              {launchStep === 6 ? (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '2px solid #10b981',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  color: '#10b981',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  letterSpacing: '0.2em',
                  boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)'
                }}>
                  CAMPAIGN ACTIVE
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '99px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${(launchStep / 6) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                    boxShadow: '0 0 10px #3b82f6',
                    borderRadius: '99px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              )}
            </div>

            {/* Footer Telemetry Coordinates */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.65rem',
              color: '#6b7280',
              fontFamily: 'monospace'
            }}>
              <span>GATEWAY_ALT_INDEX: 4022</span>
              <span>REF_LATENCY: {(Math.random() * 20 + 10).toFixed(2)}ms</span>
              <span>SYS_COORDS: 82.02N / 120.4W</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
