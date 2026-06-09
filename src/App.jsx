import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Header from './components/Header';
import Hero from './components/Hero';
import Trust from './components/Trust';
import Agents from './components/Agents';
import Intelligence from './components/Intelligence';
import CommandCenter from './components/CommandCenter';
import Voice from './components/Voice';
import Boardroom from './components/Boardroom';
import Simulator from './components/Simulator';
import Dashboard from './components/Dashboard';
import GalaxyZoom from './components/GalaxyZoom';
import Architecture from './components/Architecture';
import FinalCTA from './components/FinalCTA';
import CommandCenterOS from './components/CommandCenterOS';
import { auth } from './firebase';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [isOSMode, setIsOSMode] = useState(false);

  useEffect(() => {
    // Set theme on mount and dynamic changes
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Sync login state with OS Mode
    let isInitial = true;
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Only auto-switch to OS mode if it is the initial page load check.
        // If they sign in/up via the onboarding flow, let them finish Step 2 (Agent Sync).
        if (isInitial) {
          setIsOSMode(true);
        }
      } else {
        setIsOSMode(false);
      }
      isInitial = false;
    });
    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const launchOnboarding = (step = 1) => {
    setOnboardingStep(step);
    setShowOnboarding(true);
  };

  if (isOSMode) {
    return (
      <CommandCenterOS 
        theme={theme}
        toggleTheme={toggleTheme}
        onExit={async () => {
          try {
            await auth.signOut();
          } catch (e) {
            console.error(e);
          }
          setIsOSMode(false);
        }} 
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Cinematic Onboarding Overlay */}
      {showOnboarding && (
        <Onboarding 
          initialStep={onboardingStep} 
          onComplete={() => {
            setShowOnboarding(false);
            setIsOSMode(true);
          }} 
        />
      )}

      {/* Dynamic Background Grid and Aurora Lights */}
      <div className="grid-overlay" style={{ zIndex: 0 }} />
      <div className="aurora-bg">
        <div className="aurora-color-1" />
        <div className="aurora-color-2" />
      </div>

      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        backgroundImage: 'radial-gradient(var(--card-border) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        opacity: 0.15,
        zIndex: 0
      }} />

      {/* Page Navigation & Sections */}
      <Header theme={theme} toggleTheme={toggleTheme} launchOnboarding={launchOnboarding} />
      
      <main>
        <Hero launchOnboarding={launchOnboarding} />
        <Trust />
        <Agents />
        <Intelligence />
        <CommandCenter launchOnboarding={launchOnboarding} />
        <Voice />
        <Boardroom />
        <Simulator />
        <Dashboard />
        <GalaxyZoom />
        <Architecture />
        <FinalCTA launchOnboarding={launchOnboarding} />
      </main>
    </div>
  );
}

