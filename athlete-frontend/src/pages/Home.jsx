// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CoachSearchFeed from '../components/CoachSearchFeed';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = sessionStorage.getItem('access_token');
  const role = sessionStorage.getItem('user_role');

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [spotlightFilter, setSpotlightFilter] = useState('ALL');

  useEffect(() => {
    if (location.hash) {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  const handleStartTraining = () => {
    if (token && role === 'ATHLETE') {
      navigate('/athlete');
    } else if (token && role === 'PROFESSIONAL') {
      navigate('/professional');
    } else {
      navigate('/register/athlete');
    }
  };

  const handleSelectCategory = (categoryName) => {
    setSelectedCategoryFilter(categoryName);
    const coachesSection = document.getElementById('coaches');
    if (coachesSection) {
      coachesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#0c2340] selection:bg-[#ff5500] selection:text-white font-sans w-full overflow-x-hidden">

      {/* 1. HERO SECTION (matching Image 3) */}
      <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden border-b border-slate-200 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Column (7 cols) */}
            <div className="lg:col-span-7 text-left">
              {/* Top Orange Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#ff5500] text-xs font-bold uppercase tracking-wider mb-5 font-display">
                <span className="w-2 h-2 rounded-full bg-[#ff5500] animate-pulse"></span>
                <span>PRO ATHLETE / HIGH-PERFORMANCE TRAINING</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] mb-6 text-[#0c2340] font-display">
                Train like a <span className="text-[#ff5500]">champion</span>,<br />
                master your craft.
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
                Connect and train with ICC, BCCI level and experienced coaches and trainers by booking 1 on 1 or group session. Elite mentorship tailored for athletic excellence across India.
              </p>

              {/* CTA Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-10">
                <button
                  type="button"
                  onClick={handleStartTraining}
                  className="bg-[#ff5500] hover:bg-[#ea4c00] text-white font-black px-7 py-3.5 rounded-lg transition duration-150 shadow-md shadow-[#ff5500]/25 text-sm flex items-center justify-center gap-2 group font-display cursor-pointer min-h-[44px]"
                >
                  <span>Start training.</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => document.getElementById('blueprint')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white hover:bg-slate-50 text-[#0c2340] font-bold px-6 py-3.5 rounded-lg transition duration-150 border border-slate-200 text-sm flex items-center justify-center gap-2 shadow-sm font-display cursor-pointer min-h-[44px]"
                >
                  <span>⚡</span>
                  <span>Explore Blueprint</span>
                </button>
              </div>

              {/* Verified Master Mentors Avatar Group */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200 flex-wrap">
                <div className="flex -space-x-2">
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=120&h=120"
                    alt="Coach 1"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=120&h=120"
                    alt="Coach 2"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?fit=crop&w=120&h=120"
                    alt="Coach 3"
                  />
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  <span className="text-[#0c2340] font-bold">Certified Master Mentors</span> • Guaranteed Credentials
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card (5 cols) */}
            <div className="lg:col-span-5 relative w-full max-w-md mx-auto lg:max-w-none">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white">
                {/* Visual Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                    alt="Pro Coach Session"
                    className="w-full h-full object-cover brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c2340]/90 via-[#0c2340]/20 to-transparent"></div>

                  {/* Top Floating Badge */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-lg shadow-md border border-slate-100 flex items-center gap-2">
                    <span className="text-[#ff5500]">🛡️</span>
                    <span className="text-[11px] font-extrabold text-[#0c2340] uppercase tracking-wide font-display">
                      100% Inspected - Certified Credentials
                    </span>
                  </div>

                  {/* Bottom Coach Card Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-white">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wider font-display">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        HEAD COACH VERIFIED
                      </span>
                      <span className="bg-[#ff5500] text-white px-2.5 py-0.5 rounded font-black text-xs font-display">
                        ₹3,200/hr
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <h4 className="text-lg font-black font-display tracking-tight text-white">
                        Rajeshwar Sen
                      </h4>
                      <span className="text-[#ff5500]">✔</span>
                    </div>
                    <p className="text-xs text-slate-200">
                      Former Ranji Specialist • 14+ Yrs Elite Services
                    </p>
                  </div>
                </div>

                {/* Floating Bottom Right Badge */}
                <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <span>📅</span>
                    <span>
                      <strong className="text-[#0c2340]">NEXT OPENING:</strong> Today, 05:30 PM (Turf 01)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const coachesEl = document.getElementById('coaches');
                      if (coachesEl) coachesEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[#ff5500] hover:text-[#ea4c00] font-bold text-[11px] uppercase tracking-wider font-display cursor-pointer"
                  >
                    Reserve →
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. 4-STAT METRIC COUNTER BAR */}
      <section className="py-8 bg-white border-b border-slate-200 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tile 1 */}
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-[#faf8ff] flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 font-display">
                🏏 CRICKETING STAFF
              </span>
              <p className="text-2xl sm:text-3xl font-black text-[#0c2340] font-display mb-1">500+</p>
              <p className="text-xs text-slate-500">Verified trainers across nationwide academies</p>
            </div>

            {/* Tile 2 */}
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-[#faf8ff] flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 font-display">
                🏟️ ACCREDITED HUBS
              </span>
              <p className="text-2xl sm:text-3xl font-black text-[#0c2340] font-display mb-1">50+</p>
              <p className="text-xs text-slate-500">Standard training centres &amp; partner grounds</p>
            </div>

            {/* Tile 3 */}
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-[#faf8ff] flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 font-display">
                ⚡ FLEXIBLE FORMAT
              </span>
              <p className="text-2xl sm:text-3xl font-black text-[#0c2340] font-display mb-1">1-on-1 &amp; Group</p>
              <p className="text-xs text-slate-500">Flexible private mentorship or team cohort camps</p>
            </div>

            {/* Tile 4 */}
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-[#faf8ff] flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 font-display">
                📍 REACH
              </span>
              <p className="text-2xl sm:text-3xl font-black text-[#0c2340] font-display mb-1">All-India</p>
              <p className="text-xs text-slate-500">Tier 1 hubs &amp; regional sports districts</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "MASTER EVERY DIMENSION OF ATHLETICS" (5 TAXONOMY CATEGORIES) */}
      <section id="categories" className="py-16 sm:py-20 border-b border-slate-200 bg-[#faf8ff] scroll-mt-16 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-[#ff5500] uppercase font-display block mb-1">
                DISCIPLINES OF EXCELLENCE
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0c2340] tracking-tight font-display">
                Master Every Dimension of Athletics
              </h2>
            </div>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              Select a specialized training stream engineered by certified masters to prepare you for state, national, and competitive match days.
            </p>
          </div>

          {/* 5 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* 1. Cricket */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Cricket Coaching"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#0c2340] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded font-display">
                    CRICKET PILLAR
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-black text-[#0c2340] font-display">Cricket</h3>
                    <span className="text-slate-400">🏏</span>
                  </div>
                  <p className="text-xs font-bold text-[#ff5500] mb-2 uppercase tracking-wide font-display">
                    Batting &amp; Bowling Specialisation
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Seam release, spin drift, footwork mechanics, backfoot defense, and powerplay tempo calibrated by BCCI &amp; ICC credentialed experts.
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2 text-xs">
                <span className="font-semibold text-slate-400">450+ Active Coaches</span>
                <button
                  type="button"
                  onClick={() => handleSelectCategory('Cricket (Batting and bowling)')}
                  className="font-bold text-[#ff5500] hover:text-[#ea4c00] flex items-center gap-1 font-display cursor-pointer"
                >
                  View Coaches →
                </button>
              </div>
            </div>

            {/* 2. Fitness */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Fitness & Strength"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#0c2340] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded font-display">
                    STRENGTH &amp; SPEED
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-black text-[#0c2340] font-display">Fitness</h3>
                    <span className="text-slate-400">🏋️</span>
                  </div>
                  <p className="text-xs font-bold text-[#ff5500] mb-2 uppercase tracking-wide font-display">
                    Strength &amp; Conditioning
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Multi-directional agility, rotational kinetic power, endurance thresholds, and load management designed for sport-specific stamina.
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2 text-xs">
                <span className="font-semibold text-slate-400">120+ Trainers</span>
                <button
                  type="button"
                  onClick={() => handleSelectCategory('Fitness')}
                  className="font-bold text-[#ff5500] hover:text-[#ea4c00] flex items-center gap-1 font-display cursor-pointer"
                >
                  View Trainers →
                </button>
              </div>
            </div>

            {/* 3. Physiotherapy */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Physiotherapy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded font-display">
                    REHAB &amp; RECOVERY
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-black text-[#0c2340] font-display">Physiotherapy</h3>
                    <span className="text-slate-400">🩺</span>
                  </div>
                  <p className="text-xs font-bold text-[#ff5500] mb-2 uppercase tracking-wide font-display">
                    Injury Management &amp; Recovery
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Kinematic rehabilitation, joint mobility restoration, tendon strain mitigation, and return-to-play structured progression.
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2 text-xs">
                <span className="font-semibold text-slate-400">85+ Specialists</span>
                <button
                  type="button"
                  onClick={() => handleSelectCategory('Physiotherapy')}
                  className="font-bold text-[#ff5500] hover:text-[#ea4c00] flex items-center gap-1 font-display cursor-pointer"
                >
                  View Physios →
                </button>
              </div>
            </div>

            {/* 4. Dietician */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Sports Dietician"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#0c2340] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded font-display">
                    NUTRITION
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-black text-[#0c2340] font-display">Dietician</h3>
                    <span className="text-slate-400">🥗</span>
                  </div>
                  <p className="text-xs font-bold text-[#ff5500] mb-2 uppercase tracking-wide font-display">
                    Sports Nutrition &amp; Metabolism Fueling
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Match-day fueling strategies, hydration equilibrium, lean mass conditioning, and micronutrient regimens customized to your athletic calendar.
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2 text-xs">
                <span className="font-semibold text-slate-400">40+ Certified Dieticians</span>
                <button
                  type="button"
                  onClick={() => handleSelectCategory('Dietician')}
                  className="font-bold text-[#ff5500] hover:text-[#ea4c00] flex items-center gap-1 font-display cursor-pointer"
                >
                  Consult Dieticians →
                </button>
              </div>
            </div>

            {/* 5. Yoga & Meditation */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Yoga and Meditation"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded font-display">
                    FOCUS &amp; RECOVERY
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-black text-[#0c2340] font-display">Yoga &amp; Meditation</h3>
                    <span className="text-slate-400">🧘</span>
                  </div>
                  <p className="text-xs font-bold text-[#ff5500] mb-2 uppercase tracking-wide font-display">
                    Breathwork &amp; Mental Fortitude
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pranayama breath control under distress/pressure, parasympathetic resets, and deep nervous system recovery for athletes.
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2 text-xs">
                <span className="font-semibold text-slate-400">60+ Specialized Yogis</span>
                <button
                  type="button"
                  onClick={() => handleSelectCategory('Yoga and Meditation')}
                  className="font-bold text-[#ff5500] hover:text-[#ea4c00] flex items-center gap-1 font-display cursor-pointer"
                >
                  Explore Yoga →
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. "VERIFIED TRAINERS SPOTLIGHT" & LIVE SEARCH FEED */}
      <section id="coaches" className="py-16 sm:py-20 bg-white border-b border-slate-200 scroll-mt-16 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-2 font-display">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                REAL-TIME CALENDAR CAPACITY
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0c2340] tracking-tight font-display">
                Verified Trainers Spotlight
              </h2>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-2">
              {['ALL ROSTER', 'Cricket', 'S&C / Fitness', 'Physio'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setSpotlightFilter(chip);
                    if (chip === 'Cricket') setSelectedCategoryFilter('Cricket (Batting and bowling)');
                    else if (chip === 'S&C / Fitness') setSelectedCategoryFilter('Fitness');
                    else if (chip === 'Physio') setSelectedCategoryFilter('Physiotherapy');
                    else setSelectedCategoryFilter('ALL');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer font-display ${
                    spotlightFilter === chip
                      ? 'bg-[#ff5500] text-white border-[#ff5500]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Spotlight Featured Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Arvind Nambiar */}
            <div className="bg-[#faf8ff] border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Arvind Nambiar"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-display">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    AVAILABLE TODAY
                  </div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <h4 className="font-extrabold text-base font-display">Arvind Nambiar ✔</h4>
                    <p className="text-[10px] text-slate-200 uppercase tracking-wider font-semibold font-display">
                      BCCI LEVEL 3 • FAST BOWLERS
                    </p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-500 font-bold">★ 4.98 (120 reviews)</span>
                    <span className="text-slate-500">Bengaluru • Online</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    12+ years nurturing national pacers; active biomechanics alignment, seam velocity optimization and release calibration.
                  </p>
                </div>
              </div>
              <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-200 mt-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold font-display">RATE</span>
                  <span className="text-sm font-black text-[#0c2340] font-display">₹2,200 / session</span>
                </div>
                <button
                  type="button"
                  onClick={handleStartTraining}
                  className="bg-[#ff5500] hover:bg-[#ea4c00] text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-sm font-display cursor-pointer min-h-[38px]"
                >
                  Book Session
                </button>
              </div>
            </div>

            {/* Card 2: Pooja Deshmukh */}
            <div className="bg-[#faf8ff] border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Pooja Deshmukh"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-display">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    AVAILABLE TODAY
                  </div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <h4 className="font-extrabold text-base font-display">Pooja Deshmukh ✔</h4>
                    <p className="text-[10px] text-slate-200 uppercase tracking-wider font-semibold font-display">
                      CSCS • ATHLETIC S&amp;C COACH
                    </p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-500 font-bold">★ 4.92 (94 reviews)</span>
                    <span className="text-slate-500">Mumbai • Hybrid</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    Specialist in explosive power, kinetic deceleration, speed mechanics, and match conditioning for field-sport contenders.
                  </p>
                </div>
              </div>
              <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-200 mt-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold font-display">RATE</span>
                  <span className="text-sm font-black text-[#0c2340] font-display">₹1,600 / session</span>
                </div>
                <button
                  type="button"
                  onClick={handleStartTraining}
                  className="bg-[#ff5500] hover:bg-[#ea4c00] text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-sm font-display cursor-pointer min-h-[38px]"
                >
                  Book Session
                </button>
              </div>
            </div>

            {/* Card 3: Dr. Kabir Rathore */}
            <div className="bg-[#faf8ff] border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Dr. Kabir Rathore"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-display">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    AVAILABLE TODAY
                  </div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <h4 className="font-extrabold text-base font-display">Dr. Kabir Rathore ✔</h4>
                    <p className="text-[10px] text-slate-200 uppercase tracking-wider font-semibold font-display">
                      CHIEF PHYSIO • REHAB SPECIALIST
                    </p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-500 font-bold">★ 4.99 (210 reviews)</span>
                    <span className="text-slate-500">Delhi-NCR • Clinic</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    Ex-State cricket team physio. Rotator cuff recovery, lower back stress fracture rehabilitation, and mobility return protocols.
                  </p>
                </div>
              </div>
              <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-200 mt-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold font-display">RATE</span>
                  <span className="text-sm font-black text-[#0c2340] font-display">₹2,500 / session</span>
                </div>
                <button
                  type="button"
                  onClick={handleStartTraining}
                  className="bg-[#ff5500] hover:bg-[#ea4c00] text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-sm font-display cursor-pointer min-h-[38px]"
                >
                  Book Session
                </button>
              </div>
            </div>
          </div>

          {/* Complete Live Directory Feed */}
          <div className="pt-8">
            <CoachSearchFeed defaultCategory={selectedCategoryFilter} />
          </div>

        </div>
      </section>

      {/* 5. "HOW DRONAMATE WORKS" */}
      <section id="blueprint" className="py-16 sm:py-20 bg-[#faf8ff] border-b border-slate-200 scroll-mt-16 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[11px] font-bold tracking-widest text-[#ff5500] uppercase font-display block mb-1">
              TRAINING ECOSYSTEM BLUEPRINT
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0c2340] tracking-tight font-display mb-3">
              How Dronamate Works
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              From discovery to pitch execution: a structured journey built around your specific athletic schedule and ambition.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-2xl font-black text-[#ff5500] font-display block mb-4">01</span>
                <h3 className="text-base font-bold text-[#0c2340] font-display mb-2">Browse &amp; Match</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Filter by sport discipline, accreditation tier (ICC, BCCI, CSCS), location, fee spectrum, and verified athlete reviews.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">
                SEARCHING SPECIALISTS
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-2xl font-black text-[#ff5500] font-display block mb-4">02</span>
                <h3 className="text-base font-bold text-[#0c2340] font-display mb-2">Online or Offline</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Train in-person at one of our 50+ standard training centres or book interactive video consultations wherever you are.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">
                HYBRID ACCESSIBILITY
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-2xl font-black text-[#ff5500] font-display block mb-4">03</span>
                <h3 className="text-base font-bold text-[#0c2340] font-display mb-2">1-on-1 or Group</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Lock in your individual slot for intensive personal attention or join high-intensity small cohort academy drills.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">
                TAILORED CAPACITY FORMAT
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-2xl font-black text-[#ff5500] font-display block mb-4">04</span>
                <h3 className="text-base font-bold text-[#0c2340] font-display mb-2">Elevate Performance</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Receive drill homework, feedback customized drill assignments, and systematic progression milestones to dominate the field.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">
                CHAMPION RESULTS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CTA BANNER */}
      <section className="py-16 bg-[#faf8ff] w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0c2340] text-white rounded-2xl p-6 sm:p-10 md:p-12 border border-slate-800 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl text-center lg:text-left">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#ff5500] font-display">
                HIT STRIDE ON THE FIELD
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white font-display">
                Ready to transform your athletic journey?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Book your first session with an accredited coach today. Available offline across 50+ facilities in India and online nationwide.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('coaches');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-[#ff5500] hover:bg-[#ea4c00] text-white font-black px-7 py-3.5 rounded-lg text-sm transition shadow-md shadow-[#ff5500]/25 font-display cursor-pointer min-h-[44px]"
              >
                Find Your Trainer
              </button>
              <a
                href="tel:+918219486269"
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-lg text-sm border border-slate-700 transition flex items-center justify-center gap-2 font-display min-h-[44px]"
              >
                <span>📞</span>
                <span>+91 8219486269</span>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
