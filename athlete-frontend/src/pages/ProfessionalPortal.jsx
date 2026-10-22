// src/pages/ProfessionalPortal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../api';

export default function ProfessionalPortal() {
  const username = sessionStorage.getItem('user_name') || 'Coach';
  const navigate = useNavigate();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' or 'bookings'

  // Schedule State
  const [slots, setSlots] = useState([]);
  const [formData, setFormData] = useState({
    date: '', start_time: '', end_time: '', session_type: 'OFFLINE', price: '1500.00', max_capacity: 1
  });

  const [bookings, setBookings] = useState([]);
  const [linkInputs, setLinkInputs] = useState({}); // Stores the meeting links being typed

  // Performance View State
  const [performanceModalOpen, setPerformanceModalOpen] = useState(false);
  const [selectedAthleteLogs, setSelectedAthleteLogs] = useState([]);
  const [selectedAthleteCricket, setSelectedAthleteCricket] = useState(null);
  const [selectedAthleteName, setSelectedAthleteName] = useState('');

  // Reschedule State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', start_time: '', end_time: '' });
  
  // UI State
  const [expandedSlot, setExpandedSlot] = useState(null);
  const [myProfile, setMyProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchSlots();
    fetchBookings();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('profile/');
      setMyProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSlots = async () => {
    try {
      const response = await api.get('slots/');
      setSlots(response.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await api.get('bookings/');
      setBookings(response.data);
      
      const initialLinks = {};
      response.data.forEach(b => {
        if (b.meeting_link_or_address) {
          initialLinks[b.id] = b.meeting_link_or_address;
        }
      });
      setLinkInputs(initialLinks);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // --- Schedule Handlers ---
  const handleSlotChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSlotSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('slots/', formData);
      fetchSlots();
      alert('Coaching availability slot published successfully!');
      setFormData({
        date: '', start_time: '', end_time: '', session_type: 'OFFLINE', price: '1500.00', max_capacity: 1
      });
    } catch (error) {
      console.error('Failed to create slot:', error);
      alert('Failed to publish slot. Please check dates.');
    }
  };

  const handleUpdateDetails = async (bookingId) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      await api.patch(`slots/${booking.slot}/`, {
        meeting_link_or_address: linkInputs[bookingId]
      });
      alert('Session details successfully updated!');
      fetchBookings();
      fetchSlots();
    } catch (error) {
      console.error('Failed to update details:', error);
      alert('Failed to save details.');
    }
  };

  const handleViewPerformance = async (athleteId, athleteName) => {
    try {
      const [logsRes, cricketRes] = await Promise.all([
        api.get(`performance/?athlete_id=${athleteId}`).catch(() => ({ data: [] })),
        api.get(`cricket-stats/athlete/${athleteId}/`).catch(() => ({ data: null }))
      ]);
      setSelectedAthleteLogs(logsRes.data ? logsRes.data.reverse() : []);
      setSelectedAthleteCricket(cricketRes.data || null);
      setSelectedAthleteName(athleteName);
      setPerformanceModalOpen(true);
    } catch (error) {
      alert("Failed to fetch athlete batsman scorecard.");
    }
  };

  const handleGenerateMeet = async (slotId) => {
    try {
      await api.post(`slots/${slotId}/generate_meet/`);
      alert('Google Meet link successfully generated!');
      fetchBookings();
      fetchSlots();
    } catch (error) {
      console.error('Failed to generate meet link:', error);
      const msg = error.response?.data?.error || 'Failed to generate link. Try logging out and back in with Google.';
      alert(msg);
    }
  };

  const handleCancelSlot = async (slotId) => {
    if (!window.confirm("Are you sure you want to cancel this session? Any booked athletes will be automatically refunded.")) return;
    try {
      await api.post(`slots/${slotId}/cancel/`);
      alert('Session cancelled and refunds initiated.');
      fetchSlots();
      fetchBookings();
    } catch (error) {
      alert('Failed to cancel session.');
    }
  };

  const openRescheduleModal = (slot) => {
    setSelectedSlot(slot);
    setRescheduleData({ date: slot.date, start_time: slot.start_time, end_time: slot.end_time });
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`slots/${selectedSlot.id}/reschedule/`, rescheduleData);
      alert('Session rescheduled successfully! Athletes notified.');
      setRescheduleModalOpen(false);
      fetchSlots();
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to reschedule.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500 selection:text-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ========================================================= */}
        {/* COACH CONTROL CENTER HEADER                               */}
        {/* ========================================================= */}
        <header className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-purple-500/20 border border-purple-500/40 text-purple-400 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                Certified Coach
              </span>
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Academy Mentor
              </span>
              {myProfile?.professional_profile?.academy_name && (
                <span className="text-slate-400 text-xs font-semibold">
                  🏛️ {myProfile.professional_profile.academy_name}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Coach Portal & Masterclass Engine</h1>
            <p className="text-slate-400 text-xs">Logged in as <strong className="text-white">Coach {myProfile?.first_name || username}</strong> • Manage availability, net sessions & athlete scorecards</p>
          </div>

          <div className="flex space-x-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-stretch sm:self-auto">
            <button 
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'schedule' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              <span>📅</span> My Schedule ({slots.length})
            </button>
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'bookings' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              <span>👥</span> Booked Sessions ({bookings.length})
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* TAB 1: SCHEDULE MANAGEMENT                                */}
        {/* ========================================================= */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Publish Slot Form */}
            <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 h-fit">
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block mb-1">Calendar Provisioning</span>
              <h2 className="text-lg font-bold text-white mb-4">Publish Availability Slot</h2>

              <form onSubmit={handleSlotSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Session Date *</label>
                  <input 
                    type="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleSlotChange} 
                    required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Start Time *</label>
                    <input 
                      type="time" 
                      name="start_time" 
                      value={formData.start_time} 
                      onChange={handleSlotChange} 
                      required 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500" 
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">End Time *</label>
                    <input 
                      type="time" 
                      name="end_time" 
                      value={formData.end_time} 
                      onChange={handleSlotChange} 
                      required 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Session Format *</label>
                  <select 
                    name="session_type" 
                    value={formData.session_type} 
                    onChange={handleSlotChange} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="OFFLINE">Net Session (In-Person)</option>
                    <option value="ONLINE">Virtual (1-on-1 Video Drill)</option>
                    <option value="GROUP">Group Academy Masterclass</option>
                  </select>
                </div>

                {formData.session_type === 'GROUP' && (
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Max Athletes (Capacity) *</label>
                    <input 
                      type="number" 
                      min="2" 
                      max="100" 
                      name="max_capacity" 
                      value={formData.max_capacity} 
                      onChange={handleSlotChange} 
                      required 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500" 
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Session Price (₹ INR) *</label>
                  <input 
                    type="number" 
                    step="50" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleSlotChange} 
                    required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-mono" 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-orange-500/25 mt-2"
                >
                  Publish Academy Slot
                </button>
              </form>
            </div>

            {/* Right: Published Slots */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center bg-slate-900 border border-slate-800 px-5 py-3.5 rounded-2xl">
                <h3 className="font-bold text-white text-sm">Your Active Availability Schedule</h3>
                <span className="text-xs text-slate-400 font-mono">{slots.length} Slots</span>
              </div>

              {slots.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-500 text-xs">
                  No slots published yet. Use the form to make your calendar available to academy batsmen.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {slots.map(slot => (
                    <div 
                      key={slot.id} 
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            {slot.session_type}
                          </span>
                          <div className="font-bold text-white text-sm mt-1.5">📅 {slot.date}</div>
                          <div className="text-xs text-slate-400">⏰ {(slot.start_time || '00:00').substring(0, 5)} - {(slot.end_time || '00:00').substring(0, 5)}</div>
                        </div>
                        <span className="text-emerald-400 font-black text-sm bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                          ₹{slot.price}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                        <span className="text-slate-400">Enrolled:</span>
                        <span className="font-bold text-white">
                          {slot.current_enrollments || 0} / {slot.max_capacity} Athletes
                        </span>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => openRescheduleModal(slot)}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded-lg text-xs font-semibold transition border border-slate-700"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleCancelSlot(slot.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-1.5 px-3 rounded-lg text-xs font-semibold transition"
                          title="Cancel Slot"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: BOOKED SESSIONS & ATHLETE BATSMAN REVIEWS          */}
        {/* ========================================================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Scheduled Athlete Masterclasses</h2>
                <p className="text-xs text-slate-400">Manage venue details, virtual links, and inspect athlete batsman scorecards</p>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                {bookings.length} Confirmed
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-500 text-xs">
                No active athlete bookings found. Once athletes reserve your published slots, they will appear here.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {bookings.map(booking => {
                  const athlete = booking.athlete_details || {};
                  const slot = booking.slot_details || {};
                  const date = slot.date || booking.date || 'TBD';
                  const startTime = (slot.start_time || booking.start_time || '00:00').substring(0, 5);
                  const endTime = (slot.end_time || booking.end_time || '00:00').substring(0, 5);

                  return (
                    <div key={booking.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                      <div>
                        {/* Athlete Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-md text-sm">
                              {(athlete.username?.[0] || 'A').toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-white">
                                {athlete.first_name ? `${athlete.first_name} ${athlete.last_name || ''}` : athlete.username || 'Registered Athlete'}
                              </h3>
                              <p className="text-slate-400 text-xs font-mono">@{athlete.username || 'athlete'}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            booking.payment_status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {booking.payment_status}
                          </span>
                        </div>

                        {/* Session Metadata */}
                        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 mb-4 text-xs">
                          <div className="flex justify-between text-slate-400">
                            <span>📅 Schedule:</span>
                            <span className="font-semibold text-white">{date} ({startTime} - {endTime})</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Format:</span>
                            <span className="font-bold text-purple-400">{slot.session_type || '1-on-1'}</span>
                          </div>
                          {booking.current_goal && (
                            <div className="pt-2 border-t border-slate-800/80">
                              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Athlete Focus Goal</span>
                              <p className="text-slate-300 italic">"{booking.current_goal}"</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-slate-800 space-y-3">
                        
                        {/* Venue or Virtual Link Input */}
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder={slot.session_type === 'ONLINE' ? 'Enter Google Meet Link' : 'Net Facility / Gate Address'}
                            value={linkInputs[booking.id] || ''}
                            onChange={(e) => setLinkInputs({ ...linkInputs, [booking.id]: e.target.value })}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                          />
                          <button
                            onClick={() => handleUpdateDetails(booking.id)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition border border-slate-700"
                          >
                            Save
                          </button>
                        </div>

                        {/* View Athlete Batsman Scorecard CTA */}
                        <button
                          onClick={() => handleViewPerformance(booking.athlete, athlete.username || 'Athlete')}
                          className="w-full bg-slate-800 hover:bg-orange-500 hover:text-white text-orange-400 font-bold py-2 rounded-xl text-xs transition border border-slate-700 hover:border-orange-500 shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <span>🏏</span> View Athlete Batsman Card & Pace/Spin Splits
                        </button>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* ATHLETE BATSMAN SCORECARD MODAL                           */}
      {/* ========================================================= */}
      {performanceModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">Athlete Dossier</span>
                <h3 className="text-xl font-black text-white">Batsman Performance Card • @{selectedAthleteName}</h3>
              </div>
              <button onClick={() => setPerformanceModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            {selectedAthleteCricket ? (
              <div className="mt-5 space-y-6">
                
                {/* 1. Career / Season Metrics Grid */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Matches</span>
                    <span className="text-lg font-black text-white">{selectedAthleteCricket.matches_played || 0}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Runs</span>
                    <span className="text-lg font-black text-orange-400">{selectedAthleteCricket.runs_made || 0}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Average</span>
                    <span className="text-lg font-black text-white">{selectedAthleteCricket.average || 0}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Strike Rate</span>
                    <span className="text-lg font-black text-emerald-400">{selectedAthleteCricket.strike_rate || 0}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">100s / 50s</span>
                    <span className="text-lg font-black text-white">{selectedAthleteCricket.centuries || 0} / {selectedAthleteCricket.half_centuries || 0}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Boundaries</span>
                    <span className="text-lg font-black text-amber-400">{selectedAthleteCricket.fours || 0} 4s • {selectedAthleteCricket.sixes || 0} 6s</span>
                  </div>
                </div>

                {/* 2. Technical Pace vs Spin Splits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/20 space-y-2 text-xs">
                    <span className="font-bold text-blue-400 uppercase tracking-wider block">⚡ Against Medium Fast (Pace)</span>
                    <div className="flex justify-between text-slate-400">
                      <span>Balls Faced:</span>
                      <span className="text-white font-bold">{selectedAthleteCricket.balls_faced_medium_fast || 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Runs Scored:</span>
                      <span className="text-emerald-400 font-bold">{selectedAthleteCricket.runs_scored_medium_fast || 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Dismissals:</span>
                      <span className="text-red-400 font-bold">{selectedAthleteCricket.dismissals_medium_fast || 0}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-purple-500/20 space-y-2 text-xs">
                    <span className="font-bold text-purple-400 uppercase tracking-wider block">🌀 Against Spin Bowling</span>
                    <div className="flex justify-between text-slate-400">
                      <span>Balls Faced:</span>
                      <span className="text-white font-bold">{selectedAthleteCricket.balls_faced_spin || 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Runs Scored:</span>
                      <span className="text-emerald-400 font-bold">{selectedAthleteCricket.runs_scored_spin || 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Dismissals:</span>
                      <span className="text-red-400 font-bold">{selectedAthleteCricket.dismissals_spin || 0}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Recent Biometrics & Recovery Chart */}
                {selectedAthleteLogs.length > 0 && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-bold text-white mb-3">Recent Readiness & Exertion Trend</h4>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedAthleteLogs}>
                          <Line type="monotone" dataKey="fatigue_level" stroke="#f59e0b" name="Fatigue" strokeWidth={2} />
                          <Line type="monotone" dataKey="perceived_exertion" stroke="#ef4444" name="Exertion" strokeWidth={2} />
                          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis domain={[0, 10]} stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                No verified cricket scorecard logged yet by this athlete.
              </div>
            )}

            <div className="mt-6 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setPerformanceModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-2 rounded-xl text-xs"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RESCHEDULE MODAL                                          */}
      {/* ========================================================= */}
      {rescheduleModalOpen && selectedSlot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Reschedule Session</h3>
            <p className="text-xs text-slate-400 mb-4">Set a new date and time. Enrolled athletes will receive immediate notice.</p>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">New Date</label>
                <input 
                  type="date" 
                  value={rescheduleData.date} 
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  required 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Start Time</label>
                  <input 
                    type="time" 
                    value={rescheduleData.start_time} 
                    onChange={(e) => setRescheduleData({ ...rescheduleData, start_time: e.target.value })}
                    required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500" 
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">End Time</label>
                  <input 
                    type="time" 
                    value={rescheduleData.end_time} 
                    onChange={(e) => setRescheduleData({ ...rescheduleData, end_time: e.target.value })}
                    required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl shadow-lg shadow-orange-500/20"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
