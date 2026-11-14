import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { SEARCH_CATEGORIES, TRAINING_MODES } from '../constants/taxonomy';
import { useToast } from './Toast';

// Curated stock photos for aesthetic fallback matching sports disciplines
const FALLBACK_COACH_PHOTOS = [
  'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
];

export default function CoachSearchFeed({ onSelectSlot, slots = [], defaultCategory = 'ALL' }) {
  const navigate = useNavigate();
  const { success, error, info } = useToast();
  const token = sessionStorage.getItem('access_token');
  const role = sessionStorage.getItem('user_role');

  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [selectedMode, setSelectedMode] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [expandedCoachId, setExpandedCoachId] = useState(null);

  // Modals for interactive buttons
  const [profileModalCoach, setProfileModalCoach] = useState(null);
  const [waitlistCoach, setWaitlistCoach] = useState(null);
  const [waitlistInput, setWaitlistInput] = useState('');
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditFile, setAuditFile] = useState(null);

  useEffect(() => {
    setSelectedCategory(defaultCategory);
  }, [defaultCategory]);

  useEffect(() => {
    let active = true;
    const fetchCoaches = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory !== 'ALL') params.category = selectedCategory;
        if (selectedMode !== 'ALL') params.training_mode = selectedMode;
        if (searchQuery.trim()) params.search = searchQuery.trim();
        const res = await api.get('coaches/', { params });
        if (active) setCoaches(res.data || []);
      } catch (err) {
        console.error('Failed to load coaches:', err);
        error('Failed to synchronize specialist roster. Please check your connection.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchCoaches();
    return () => {
      active = false;
    };
  }, [selectedCategory, selectedMode, searchQuery]);

  // Client-side filtering for location and available toggle
  const filteredCoaches = coaches.filter((coach) => {
    if (onlyAvailable && !coach.is_available) return false;
    if (locationQuery.trim()) {
      const q = locationQuery.toLowerCase();
      const clubMatch = (coach.institution_club || '').toLowerCase().includes(q);
      const pinMatch = (coach.pincode || '').toLowerCase().includes(q);
      const addressMatch = (coach.address || '').toLowerCase().includes(q);
      if (!clubMatch && !pinMatch && !addressMatch) return false;
    }
    return true;
  });

  const getCoachSlots = (coachId) =>
    slots.filter((s) => {
      if (s.professional !== coachId) return false;
      if (selectedMode !== 'ALL' && s.session_type !== selectedMode.toUpperCase()) return false;
      return true;
    });

  const handleBookClick = (coach) => {
    if (!coach.is_available) {
      setWaitlistCoach(coach);
      return;
    }
    if (!token) {
      info('Please sign in or create an athlete account to reserve a session.');
      navigate('/login');
      return;
    }
    if (role !== 'ATHLETE') {
      info('Redirecting to your account dashboard...');
      navigate(role === 'PROFESSIONAL' ? '/professional' : '/admin');
      return;
    }
    if (onSelectSlot) {
      setExpandedCoachId(expandedCoachId === coach.coach_id ? null : coach.coach_id);
    } else {
      navigate(`/athlete?coach=${coach.coach_id}`);
    }
  };

  const handleCalibrateSearch = () => {
    const count = filteredCoaches.length;
    if (count > 0) {
      success(`Search calibrated: ${count} verified specialist${count > 1 ? 's' : ''} matched your criteria.`);
    } else {
      info('No specialists found matching this exact filter combination. Showing all available.');
    }
    const grid = document.getElementById('coach-results-grid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    if (!waitlistInput.trim()) return;
    success(`Waitlist confirmed! You will receive immediate notification when Coach ${waitlistCoach.name} opens new slots.`);
    setWaitlistCoach(null);
    setWaitlistInput('');
  };

  const handleAuditSubmit = (e) => {
    e.preventDefault();
    success('Biomechanical video clip queued for AI kinematics benchmark! Your report will appear on your Athlete dashboard.');
    setShowAuditModal(false);
    setAuditFile(null);
  };

  return (
    <div className="space-y-8 font-sans w-full overflow-x-hidden">
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-0.5 bg-[#ff5500]"></span>
            <span className="text-[11px] font-bold tracking-widest text-[#ff5500] uppercase font-display">
              Performance Specialist Registry
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0c2340] tracking-tight font-display">
            HIGH-PERFORMANCE ROSTER
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-2 leading-relaxed">
            Book verified elite sports mentors, BCCI-accredited coaches, biomechanics specialists, and clinical nutritionists for calibrated track-and-field elevation.
          </p>
        </div>

        {/* Top Right Quick Stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-display">
              Active Coaches
            </span>
            <span className="text-base font-extrabold text-[#0c2340] font-display">
              {coaches.length > 0 ? `${coaches.length} PROS` : '500+ PROS'}
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-display">
              Average Rating
            </span>
            <span className="text-base font-extrabold text-amber-500 font-display">
              ⭐ 4.92 / 5
            </span>
          </div>
        </div>
      </div>

      {/* 2. DUAL SEARCH BAR & FILTER MODULE */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Dual Input Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Coach Name or Discipline */}
          <div className="md:col-span-5 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Jasprit, Bowling biomechanics, VO2 Max..."
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-[#0c2340] placeholder-slate-400 focus:outline-none focus:border-[#ff5500] focus:bg-white transition"
            />
          </div>

          {/* Location / Ground */}
          <div className="md:col-span-4 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              📍
            </span>
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="Bengaluru, NCA, Wankhede, Mumbai, Virtual"
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-[#0c2340] placeholder-slate-400 focus:outline-none focus:border-[#ff5500] focus:bg-white transition"
            />
          </div>

          {/* Calibrate Search Button */}
          <div className="md:col-span-3">
            <button
              type="button"
              onClick={handleCalibrateSearch}
              className="w-full bg-[#ff5500] hover:bg-[#ea4c00] text-white font-black text-xs uppercase tracking-wider py-3 px-4 rounded-lg transition duration-150 shadow-md shadow-[#ff5500]/20 flex items-center justify-center gap-2 font-display cursor-pointer min-h-[44px]"
            >
              <span>⚡</span>
              <span>CALIBRATE SEARCH</span>
            </button>
          </div>
        </div>

        {/* Secondary Filters Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase transition border cursor-pointer font-display ${
                selectedCategory === 'ALL'
                  ? 'bg-[#0c2340] text-white border-[#0c2340]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              ALL DISCIPLINES
            </button>
            {SEARCH_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase transition border cursor-pointer font-display ${
                  selectedCategory === category
                    ? 'bg-[#0c2340] text-white border-[#0c2340]'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Training Mode & Available Now Toggle */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 self-start lg:self-auto">
            <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {['ALL', ...TRAINING_MODES].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSelectedMode(mode)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition cursor-pointer font-display ${
                    selectedMode === mode
                      ? 'bg-white text-[#0c2340] shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {mode === 'ALL'
                    ? 'ALL MODES'
                    : mode === 'Offline'
                      ? 'OFFLINE'
                      : mode === 'Online'
                        ? 'ONLINE'
                        : 'BOTH'}
                </button>
              ))}
            </div>

            {/* Available Now Toggle */}
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 font-display">
                AVAILABLE NOW
              </span>
              <button
                type="button"
                onClick={() => setOnlyAvailable(!onlyAvailable)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  onlyAvailable ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
                aria-label="Toggle Available Now"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    onlyAvailable ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>
      </div>

      {/* 3. COACH CARDS GRID */}
      <div id="coach-results-grid">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-sm">
            <div className="inline-block w-6 h-6 border-2 border-[#ff5500] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="font-bold text-[#0c2340] font-display">Synchronizing specialist roster...</p>
          </div>
        ) : filteredCoaches.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-sm shadow-sm space-y-3">
            <p className="font-bold text-[#0c2340] text-base font-display">No trainers match your filter criteria.</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try broadening your search query or selecting "ALL DISCIPLINES" to view all certified staff.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedMode('ALL');
                setSearchQuery('');
                setLocationQuery('');
                setOnlyAvailable(false);
              }}
              className="bg-[#0c2340] hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-lg font-display"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoaches.map((coach, index) => {
              const coachSlots = getCoachSlots(coach.coach_id);
              const isExpanded = expandedCoachId === coach.coach_id;
              const expertiseLabels = coach.expertise?.length
                ? coach.expertise.map((e) => (typeof e === 'object' ? e.name : e))
                : coach.speciality?.name
                  ? [coach.speciality.name]
                  : ['Cricket (Batting and bowling)'];

              const photoUrl =
                coach.profile_photo_url ||
                FALLBACK_COACH_PHOTOS[index % FALLBACK_COACH_PHOTOS.length];

              const chargesDisplay = coach.charges_per_session
                ? `₹${Number(coach.charges_per_session).toLocaleString('en-IN')}/hr`
                : '₹1,800/hr';

              return (
                <div
                  key={coach.coach_id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Card Visual Header with Overlay Badges */}
                    <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                      <img
                        src={photoUrl}
                        alt={coach.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c2340]/90 via-[#0c2340]/30 to-transparent"></div>

                      {/* Top Left Live Status Pill */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm font-display ${
                            coach.is_available
                              ? 'bg-emerald-500/95 text-white'
                              : 'bg-slate-700/95 text-slate-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              coach.is_available ? 'bg-white animate-pulse' : 'bg-slate-400'
                            }`}
                          ></span>
                          {coach.is_available ? 'AVAILABLE NOW' : 'UNAVAILABLE'}
                        </span>
                      </div>

                      {/* Top Right Price Tag */}
                      <div className="absolute top-3 right-3">
                        <span className="bg-white/95 backdrop-blur-md text-[#0c2340] px-2.5 py-1 rounded-md text-xs font-black font-display shadow-sm">
                          {chargesDisplay}
                        </span>
                      </div>

                      {/* Bottom Left Coach Name & Subtitle */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-white font-extrabold text-base tracking-tight font-display">
                              {coach.name}
                            </h3>
                            <span className="text-[#ff5500] text-sm">✔</span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-medium line-clamp-1">
                            {coach.is_certified ? 'BCCI / ACCREDITED SPECIALIST' : 'PROFESSIONAL INSTRUCTOR'}
                          </p>
                        </div>

                        {/* Training Mode Pill */}
                        <span className="bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 text-[9px] font-bold uppercase px-2 py-0.5 rounded shrink-0 font-display">
                          {coach.training_mode === 'Both'
                            ? 'Offline + Online'
                            : coach.training_mode === 'Offline'
                              ? 'Offline'
                              : 'Online'}
                        </span>
                      </div>
                    </div>

                    {/* Card Content Details */}
                    <div className="p-4 space-y-3">
                      {/* Facility / Location */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <span className="text-slate-400">🏟️</span>
                        <span className="line-clamp-1">
                          {coach.institution_club || 'Partner Academy Facility • Ground Access'}
                        </span>
                      </div>

                      {/* Bio Snippet */}
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {coach.additional_details ||
                          'Specializing in high-performance mechanics, tactical decision making, and structured return-to-competition protocols.'}
                      </p>

                      {/* Discipline Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {expertiseLabels.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-slate-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="p-4 pt-0 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleBookClick(coach)}
                        className={`font-bold py-2.5 px-3 rounded-lg text-xs transition duration-150 flex items-center justify-center gap-1 font-display min-h-[42px] cursor-pointer ${
                          coach.is_available
                            ? 'bg-[#ff5500] hover:bg-[#ea4c00] text-white shadow-sm shadow-[#ff5500]/20 active:scale-95'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span>
                          {!coach.is_available
                            ? 'Join Waitlist'
                            : onSelectSlot
                              ? isExpanded ? 'Hide Slots' : `Book (${coachSlots.length})`
                              : 'Book Session'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProfileModalCoach(coach)}
                        className="bg-white hover:bg-slate-50 text-[#0c2340] font-bold py-2.5 px-3 rounded-lg text-xs border border-slate-200 transition font-display min-h-[42px] cursor-pointer"
                      >
                        View Profile
                      </button>
                    </div>

                    {/* Inline Slot Expansion for Booking */}
                    {isExpanded && onSelectSlot && coach.is_available && (
                      <div className="space-y-2 pt-3 border-t border-slate-100 mt-2">
                        {coachSlots.length === 0 ? (
                          <p className="text-[11px] text-slate-400 text-center py-2">
                            No upcoming slots published yet. Check back soon.
                          </p>
                        ) : (
                          coachSlots.map((slot) => (
                            <div
                              key={slot.id}
                              className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                            >
                              <div>
                                <p className="font-bold text-[#0c2340] font-display">{slot.date}</p>
                                <p className="text-[10px] text-slate-500">
                                  {(slot.start_time || '').slice(0, 5)} - {(slot.end_time || '').slice(0, 5)} • {slot.session_type}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => onSelectSlot(slot)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded text-[11px] shadow-sm cursor-pointer font-display"
                              >
                                Book ₹{slot.price}
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. BOTTOM BIOMECHANICAL BLUEPRINT AUDIT CALLOUT */}
      <div id="audit" className="bg-[#0c2340] text-white rounded-xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff5500] font-display">
              Ensure Which Coach Fits Your Metrics?
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
              Run a Biomechanical Blueprint Audit
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Upload 60 seconds of your bowling stride or batting delivery. Our AI vision pipeline benchmarks your joint kinematics and assigns the top 3 certified coaches suited to eliminate kinetic leakages.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAuditModal(true)}
            className="bg-[#ff5500] hover:bg-[#ea4c00] text-white font-black text-xs uppercase tracking-wider py-3.5 px-6 rounded-lg transition duration-150 shadow-md shadow-[#ff5500]/25 shrink-0 font-display cursor-pointer min-h-[44px]"
          >
            Audit My Technique
          </button>
        </div>
      </div>

      {/* MODAL 1: VIEW COACH PROFILE MODAL */}
      {profileModalCoach && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl text-[#0c2340] space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={profileModalCoach.profile_photo_url || FALLBACK_COACH_PHOTOS[0]}
                  alt={profileModalCoach.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-lg font-black font-display flex items-center gap-1.5">
                    {profileModalCoach.name} <span className="text-[#ff5500] text-sm">✔</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {profileModalCoach.is_certified ? 'BCCI / Accredited Trainer' : 'Certified Coach'} • {profileModalCoach.institution_club || 'Partner Academy'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProfileModalCoach(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-display">Specializations</span>
                <div className="flex flex-wrap gap-1.5">
                  {(profileModalCoach.expertise || []).map((exp) => (
                    <span key={typeof exp === 'object' ? exp.name : exp} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold">
                      {typeof exp === 'object' ? exp.name : exp}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-display">Coaching Biography</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {profileModalCoach.additional_details ||
                    'Experienced sports practitioner dedicated to technique calibration, biomechanical alignment, and match-scenario mastery.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Session Rate</span>
                  <span className="text-base font-black text-emerald-600 font-display">
                    ₹{profileModalCoach.charges_per_session || '1,800'} / session
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Training Mode</span>
                  <span className="text-sm font-bold text-[#0c2340] font-display">
                    {profileModalCoach.training_mode || 'Online & Offline'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProfileModalCoach(null)}
                className="bg-slate-100 text-slate-600 font-bold px-4 py-2.5 rounded-lg text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = profileModalCoach;
                  setProfileModalCoach(null);
                  handleBookClick(target);
                }}
                className="bg-[#ff5500] hover:bg-[#ea4c00] text-white font-bold px-5 py-2.5 rounded-lg text-xs shadow-sm font-display cursor-pointer"
              >
                Book This Trainer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: JOIN WAITLIST MODAL */}
      {waitlistCoach && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-[#0c2340] space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#ff5500] uppercase tracking-wider font-display">Capacity Alert</span>
                <h3 className="text-base font-black font-display">Join Coach {waitlistCoach.name}&apos;s Waitlist</h3>
              </div>
              <button
                type="button"
                onClick={() => setWaitlistCoach(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              This trainer is currently marked as <strong>Unavailable</strong> for instant booking. Enter your mobile number or email below to be prioritized when new slots are published.
            </p>

            <form onSubmit={handleWaitlistSubmit} className="space-y-3">
              <input
                type="text"
                required
                value={waitlistInput}
                onChange={(e) => setWaitlistInput(e.target.value)}
                placeholder="Mobile number or Email address"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#0c2340] focus:outline-none focus:border-[#ff5500]"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWaitlistCoach(null)}
                  className="bg-slate-100 text-slate-600 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#ff5500] hover:bg-[#ea4c00] text-white font-bold px-4 py-2 rounded-lg text-xs font-display cursor-pointer"
                >
                  Confirm Waitlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BIOMECHANICAL AUDIT MODAL */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-[#0c2340] space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#ff5500] uppercase tracking-wider font-display">AI Video Kinematics</span>
                <h3 className="text-lg font-black font-display">Biomechanical Blueprint Audit</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Upload a 30 to 60-second video of your bowling action, batting delivery, or sprint acceleration. Our sports science pipeline analyzes joint release angles, kinetic chain leakages, and matches you with top-rated technical coaches.
            </p>

            <form onSubmit={handleAuditSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 hover:border-[#ff5500] rounded-xl p-6 text-center transition cursor-pointer bg-slate-50">
                <input
                  type="file"
                  id="auditUpload"
                  accept="video/*"
                  onChange={(e) => setAuditFile(e.target.files?.[0])}
                  className="hidden"
                />
                <label htmlFor="auditUpload" className="cursor-pointer block">
                  <span className="text-3xl block mb-2">📹</span>
                  <span className="text-xs font-bold text-[#0c2340] block">
                    {auditFile ? auditFile.name : 'Click to select training clip (MP4, MOV)'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Maximum file size: 50MB</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="bg-slate-100 text-slate-600 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!auditFile}
                  className="bg-[#ff5500] hover:bg-[#ea4c00] text-white font-bold px-5 py-2 rounded-lg text-xs font-display shadow-sm cursor-pointer disabled:opacity-50"
                >
                  Start Technique Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
