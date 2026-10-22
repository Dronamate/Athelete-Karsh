// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // Interactive Batsman Simulator State
  const [selectedRoleType, setSelectedRoleType] = useState('top_order');

  useEffect(() => {
    if (location.hash) {
      const elem = document.querySelector(location.hash);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  // Demo Coach Faculty Roster
  const facultyCoaches = [
    {
      name: 'Rahul Dravid',
      role: 'Top-Order Batting Coach',
      academy: 'National Cricket Academy, Bangalore',
      rate: '₹1,500',
      experience: '18+ Years Pro',
      badge: 'BCCI Level 3',
      initials: 'RD',
      color: 'from-orange-500 to-amber-600',
      specialty: 'Defensive Anchor & Trigger Movements'
    },
    {
      name: 'Vikram Rathour',
      role: 'Power Hitting & Spin Specialist',
      academy: 'Delhi Cricket Hub',
      rate: '₹1,800',
      experience: '15+ Years Pro',
      badge: 'National Mentor',
      initials: 'VR',
      color: 'from-purple-500 to-indigo-600',
      specialty: 'Bat Speed & Boundary Clearance'
    },
    {
      name: 'Bharat Arun',
      role: 'Fast & Medium Pace Bowling Coach',
      academy: 'Chennai Bowling Academy',
      rate: '₹1,600',
      experience: '20+ Years Pro',
      badge: 'Elite Master',
      initials: 'BA',
      color: 'from-blue-500 to-cyan-600',
      specialty: 'Seam Presentation & Match Tactics'
    }
  ];

  // Simulator Data for Batsman Card
  const simulatorProfiles = {
    top_order: {
      title: 'Top-Order Anchor (No. 3)',
      average: '48.60',
      strikeRate: '138.4',
      matches: '24',
      runs: '972',
      boundaries: '88 4s • 24 6s',
      fastBalls: '340',
      fastRuns: '476',
      fastDismissals: '4',
      spinBalls: '290',
      spinRuns: '412',
      spinDismissals: '3',
      paceSR: '140.0',
      spinSR: '142.1'
    },
    power_finisher: {
      title: 'T20 Power Finisher (No. 6)',
      average: '36.80',
      strikeRate: '168.2',
      matches: '28',
      runs: '662',
      boundaries: '42 4s • 48 6s',
      fastBalls: '180',
      fastRuns: '295',
      fastDismissals: '5',
      spinBalls: '140',
      spinRuns: '248',
      spinDismissals: '2',
      paceSR: '163.8',
      spinSR: '177.1'
    },
    opener: {
      title: 'Opening Batsman (No. 1-2)',
      average: '44.20',
      strikeRate: '141.0',
      matches: '26',
      runs: '884',
      boundaries: '94 4s • 22 6s',
      fastBalls: '410',
      fastRuns: '582',
      fastDismissals: '7',
      spinBalls: '210',
      spinRuns: '292',
      spinDismissals: '2',
      paceSR: '141.9',
      spinSR: '139.0'
    }
  };

  const currentSim = simulatorProfiles[selectedRoleType];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500 selection:text-slate-950 font-sans">
      
      {/* ========================================================= */}
      {/* 1. HERO SECTION: ACADEMY MASTERCLASS ATMOSPHERE           */}
      {/* ========================================================= */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-slate-900">
        
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-orange-500/10 blur-[140px] pointer-events-none rounded-full"></div>
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
            
            {/* Left Column: Academy Value Prop */}
            <div className="lg:w-1/2 text-center lg:text-left">
              
              {/* Season Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-md shadow-orange-500/5">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                DronaMate High-Performance Cricket Academy
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-6 text-white">
                TRAIN LIKE A CHAMPION. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
                  MASTER EVERY MATCHUP.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Connect with certified BCCI & ICC mentors, book 1-on-1 net masterclasses, and analyze your batsman metrics against medium fast pace vs mystery spin in a professional high-performance academy ecosystem.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black px-8 py-4 rounded-xl transition duration-200 shadow-xl shadow-orange-500/25 text-sm flex items-center justify-center gap-2 group min-h-[48px]"
                >
                  <span>Start Academy Training</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                <button 
                  onClick={() => {
                    const el = document.getElementById('coaches');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold px-7 py-4 rounded-xl transition border border-slate-800 hover:border-slate-700 text-sm min-h-[48px]"
                >
                  View Academy Coaches
                </button>
              </div>

              {/* Verified Trust Strip */}
              <div className="mt-10 pt-8 border-t border-slate-900/80 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-semibold">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Verified Mentors
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> BCCI Standard Drills
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Live Pace vs Spin Data
                </div>
              </div>

            </div>

            {/* Right Column: Hero Visual Card with High-Performance Batsman Card Overlay */}
            <div className="lg:w-1/2 w-full max-w-lg mx-auto">
              <div className="relative">
                
                {/* Visual Glassmorphic Frame */}
                <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/90 shadow-2xl p-2">
                  
                  {/* Cricket Visual Banner */}
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden group">
                    <img 
                      src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                      alt="Cricket Batsman Training at Nets" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                    
                    {/* Live Badge */}
                    <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 px-3 py-1 rounded-full flex items-center gap-2 text-[11px] font-bold text-white shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      Academy Net Session Active
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block">Real-Time Technical Metrics</span>
                      <p className="text-white font-black text-lg">Aryan Sharma • Shivaji Park Gymkhana</p>
                    </div>
                  </div>

                  {/* Micro Batsman Scorecard Strip */}
                  <div className="p-4 grid grid-cols-3 gap-2 mt-2">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Average</span>
                      <span className="text-xl font-black text-emerald-400">48.6</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Strike Rate</span>
                      <span className="text-xl font-black text-orange-400">142.8</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">100s / 50s</span>
                      <span className="text-xl font-black text-white">2 / 5</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* STATS STRIP: ACADEMY CREDIBILITY METRICS                  */}
          {/* ========================================================= */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-xl">
            <div className="text-center p-3">
              <p className="text-3xl md:text-4xl font-black text-white">1,500+</p>
              <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Batsmen Developed</p>
            </div>
            <div className="text-center p-3 border-l border-slate-800/80">
              <p className="text-3xl md:text-4xl font-black text-orange-400">12,000+</p>
              <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Coaching Net Overs</p>
            </div>
            <div className="text-center p-3 border-l border-slate-800/80">
              <p className="text-3xl md:text-4xl font-black text-emerald-400">98.4%</p>
              <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Match Readiness</p>
            </div>
            <div className="text-center p-3 border-l border-slate-800/80">
              <p className="text-3xl md:text-4xl font-black text-amber-400">4.9 ★</p>
              <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Average Coach Rating</p>
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* 2. INTERACTIVE BATSMAN PERFORMANCE CARD SIMULATOR         */}
      {/* ========================================================= */}
      <section id="performance" className="py-24 bg-slate-950 border-b border-slate-900 scroll-mt-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="bg-orange-500/10 text-orange-400 border border-orange-500/30 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-4 inline-block">
              Cricket Intelligence Engine
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              The Batsman Performance Card
            </h2>
            <p className="text-slate-400 text-base md:text-lg mt-4">
              Modern cricket is decided by fractions of a second. See how DronaMate tracks your technical numbers and breaks down pace vs spin execution.
            </p>

            {/* Role Simulator Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setSelectedRoleType('top_order')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedRoleType === 'top_order' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Top-Order Anchor
              </button>
              <button
                onClick={() => setSelectedRoleType('power_finisher')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedRoleType === 'power_finisher' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                T20 Power Finisher
              </button>
              <button
                onClick={() => setSelectedRoleType('opener')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedRoleType === 'opener' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Opening Batsman
              </button>
            </div>
          </div>

          {/* Interactive Card Presentation */}
          <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            
            {/* Header of Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block">Live Batsman Card Preview</span>
                <h3 className="text-xl md:text-2xl font-black text-white mt-1">{currentSim.title}</h3>
                <p className="text-xs text-slate-400">Shivaji Park Gymkhana • Right-Hand Bat</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Verified Data
                </span>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition border border-slate-700"
                >
                  Create Yours →
                </button>
              </div>
            </div>

            {/* Overall Scorecard Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-center">
                <span className="text-[11px] text-slate-500 uppercase font-bold block">Innings Average</span>
                <span className="text-2xl md:text-3xl font-black text-emerald-400 mt-1 block">{currentSim.average}</span>
                <span className="text-[10px] text-slate-500">{currentSim.matches} Matches Played</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-center">
                <span className="text-[11px] text-slate-500 uppercase font-bold block">Strike Rate</span>
                <span className="text-2xl md:text-3xl font-black text-orange-400 mt-1 block">{currentSim.strikeRate}</span>
                <span className="text-[10px] text-slate-500">Balls Faced: 600+</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-center">
                <span className="text-[11px] text-slate-500 uppercase font-bold block">Total Runs</span>
                <span className="text-2xl md:text-3xl font-black text-white mt-1 block">{currentSim.runs}</span>
                <span className="text-[10px] text-slate-500">Season 2026</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-center">
                <span className="text-[11px] text-slate-500 uppercase font-bold block">Boundaries</span>
                <span className="text-2xl md:text-3xl font-black text-amber-400 mt-1 block">{currentSim.boundaries.split('•')[0]}</span>
                <span className="text-[10px] text-slate-500">{currentSim.boundaries.split('•')[1]}</span>
              </div>
            </div>

            {/* Technical Pace vs Spin Matchup Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              
              {/* Medium Fast Pace */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-blue-500/20 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚡</span>
                    <h4 className="font-bold text-sm text-blue-400 uppercase tracking-wider">Against Medium Fast Pace</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-white bg-blue-500/20 px-2.5 py-0.5 rounded border border-blue-500/30">
                    SR: {currentSim.paceSR}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Balls Faced:</span>
                    <span className="font-bold text-white">{currentSim.fastBalls} Balls</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Runs Scored:</span>
                    <span className="font-bold text-emerald-400">{currentSim.fastRuns} Runs</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Dismissals:</span>
                    <span className="font-bold text-red-400">{currentSim.fastDismissals} Wickets</span>
                  </div>
                  
                  {/* Progress visualization */}
                  <div className="pt-2">
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Control percentage: 84% on front foot</span>
                  </div>
                </div>
              </div>

              {/* Spin Bowling */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-purple-500/20 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌀</span>
                    <h4 className="font-bold text-sm text-purple-400 uppercase tracking-wider">Against Spin Bowling</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-white bg-purple-500/20 px-2.5 py-0.5 rounded border border-purple-500/30">
                    SR: {currentSim.spinSR}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Balls Faced:</span>
                    <span className="font-bold text-white">{currentSim.spinBalls} Balls</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Runs Scored:</span>
                    <span className="font-bold text-emerald-400">{currentSim.spinRuns} Runs</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Dismissals:</span>
                    <span className="font-bold text-red-400">{currentSim.spinDismissals} Wickets</span>
                  </div>
                  
                  {/* Progress visualization */}
                  <div className="pt-2">
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '74%' }}></div>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Boundary strike: 1 boundary every 4.8 balls</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. VERIFIED COACHING FACULTY: ELITE CRICKET MENTORS       */}
      {/* ========================================================= */}
      <section id="coaches" className="py-24 bg-slate-900 border-b border-slate-800 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-3 inline-block">
                Academy Mentors
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Learn from Certified Cricket Coaches
              </h2>
              <p className="text-slate-400 text-base max-w-xl mt-3">
                Experience high-performance nets, video technical analysis, and mental mastery with mentors from premier cricket academies.
              </p>
            </div>

            <button
              onClick={() => navigate('/register')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-3 rounded-xl border border-slate-700 transition self-start md:self-auto"
            >
              Apply as Academy Coach →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {facultyCoaches.map((coach, idx) => (
              <div 
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-orange-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  
                  {/* Top Bar with Avatar & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${coach.color} flex items-center justify-center font-black text-xl text-white shadow-lg`}>
                      {coach.initials}
                    </div>
                    <span className="bg-slate-900 text-slate-300 border border-slate-700 px-3 py-1 rounded-full text-[11px] font-bold">
                      {coach.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white">{coach.name}</h3>
                  <p className="text-orange-400 text-xs font-bold mt-0.5">{coach.role}</p>
                  <p className="text-slate-400 text-xs mt-1.5">{coach.academy}</p>

                  <div className="my-5 p-3.5 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Experience:</span>
                      <span className="font-semibold text-white">{coach.experience}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Specialty:</span>
                      <span className="font-semibold text-amber-400">{coach.specialty}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Rate:</span>
                      <span className="font-bold text-emerald-400">{coach.rate} / hr</span>
                    </div>
                  </div>

                </div>

                <button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-slate-900 hover:bg-orange-500 hover:text-white text-slate-300 font-bold py-3 rounded-xl transition text-xs border border-slate-800 hover:border-orange-500 shadow-md"
                >
                  Book Coaching Session
                </button>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. ACADEMY TRAINING PILLARS (HOW DRONAMATE WORKS)          */}
      {/* ========================================================= */}
      <section id="about" className="py-24 bg-slate-950 border-b border-slate-900 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-3 inline-block">
              Academy Blueprint
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              A Complete Cricket Development Ecosystem
            </h2>
            <p className="text-slate-400 text-base md:text-lg mt-3">
              We bridge the gap between net practice and match-day performance through 4 core pillars.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-orange-500/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center text-2xl mb-5">
                🏏
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. 1-on-1 Net Masterclasses</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Connect directly with certified coaches for personalized net sessions, high-speed camera technical reviews, and immediate grip adjustments.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-2xl mb-5">
                📊
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. Pace vs Spin Data Splits</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Log every dismissal and ball faced to identify exactly where your strike rate drops and train targeted solutions before your next tournament match.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-2xl mb-5">
                🧠
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. Match Situation Readiness</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Master powerplay tempo, middle-overs strike rotation, and death-over boundary hitting with scenario-based coaching drills.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-2xl mb-5">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-white mb-2">4. Physical & Biometric Logs</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Track daily sleep, soreness, readiness, and hydration to ensure your bat speed and reaction time are primed when stepping onto the pitch.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. ATHLETE TESTIMONIALS & TRANSFORMATION STORIES          */}
      {/* ========================================================= */}
      <section className="py-24 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-3 inline-block">
              Proven Results
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Champions in the Making
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative">
              <div className="text-amber-400 text-sm mb-3">★★★★★</div>
              <p className="text-slate-300 text-xs leading-relaxed italic mb-6">
                "Breaking down my strike rate against left-arm spin completely changed my game. Coach Vikram showed me how my front foot was falling across, and within 3 weeks my club average jumped by 14 runs."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white">AS</div>
                <div>
                  <h4 className="font-bold text-sm text-white">Aryan Sharma</h4>
                  <p className="text-slate-500 text-[11px]">Shivaji Park Gymkhana, Mumbai</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative">
              <div className="text-amber-400 text-sm mb-3">★★★★★</div>
              <p className="text-slate-300 text-xs leading-relaxed italic mb-6">
                "Having direct calendar booking with Coach Rahul Dravid was a game changer. The Batsman Card keeps all my pace vs spin data organized without messy notes."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm text-white">KV</div>
                <div>
                  <h4 className="font-bold text-sm text-white">Kabir Verma</h4>
                  <p className="text-slate-500 text-[11px]">Wankhede Cricket Academy</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative">
              <div className="text-amber-400 text-sm mb-3">★★★★★</div>
              <p className="text-slate-300 text-xs leading-relaxed italic mb-6">
                "As an academy director, DronaMate gives my coaches a unified portal to manage slots, review batsman cards, and track athlete progress in one place."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center font-bold text-sm text-white">SS</div>
                <div>
                  <h4 className="font-bold text-sm text-white">Sameer Sen</h4>
                  <p className="text-slate-500 text-[11px]">Delhi Premier League Coach</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. CALL TO ACTION BANNER: ENROLLMENT                      */}
      {/* ========================================================= */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="bg-slate-900/90 border border-slate-800 p-8 md:p-14 rounded-3xl shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] pointer-events-none rounded-full"></div>

            <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 inline-block">
              Elevate Your Match Performance
            </span>
            
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              Your Journey to Cricket Mastery Starts Today.
            </h2>
            
            <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto mb-8">
              Whether you are an aspiring top-order batsman, a club captain, or a certified coach, DronaMate provides the professional infrastructure to reach your peak.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black px-8 py-4 rounded-xl transition text-sm shadow-xl shadow-orange-500/25"
              >
                Create Free Athlete Account
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-4 rounded-xl transition text-sm border border-slate-700"
              >
                Sign In to Portal
              </button>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
