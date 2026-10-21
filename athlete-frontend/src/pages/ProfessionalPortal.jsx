// src/pages/ProfessionalPortal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../api';

export default function ProfessionalPortal() {
  const username = sessionStorage.getItem('user_name');
  const navigate = useNavigate();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' or 'bookings'

  // Schedule State
  const [slots, setSlots] = useState([]);
  const [formData, setFormData] = useState({
    date: '', start_time: '', end_time: '', session_type: 'OFFLINE', price: '1200.00', max_capacity: 1
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
      const response = await api.get('auth/user/');
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
      alert('Availability Slot created successfully!');
    } catch (error) {
      console.error('Failed to create slot:', error);
    }
  };

  const handleUpdateDetails = async (bookingId) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      await api.patch(`slots/${booking.slot}/`, {
        meeting_link_or_address: linkInputs[bookingId]
      });
      alert('Details successfully updated!');
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
      alert("Failed to fetch athlete performance.");
    }
  };

  const handleGenerateMeet = async (slotId) => {
    try {
      const response = await api.post(`slots/${slotId}/generate_meet/`);
      alert('Google Meet Link successfully generated!');
      fetchBookings();
      fetchSlots();
    } catch (error) {
      console.error('Failed to generate meet link:', error);
      const msg = error.response?.data?.error || 'Failed to generate link. Try logging out and back in with Google.';
      alert(msg);
    }
  };

  const handleCancelSlot = async (slotId) => {
    if (!window.confirm("Are you sure you want to cancel this session? All athletes will be automatically refunded.")) return;
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

  const toggleExpand = (slotId) => {
    setExpandedSlot(expandedSlot === slotId ? null : slotId);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Coach Control Center</h1>
            <p className="text-slate-500">Welcome, Coach {username}. Manage availability, sessions, and athlete data.</p>
          </div>

          <div className="flex space-x-2 bg-slate-200 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 rounded-md font-semibold transition ${activeTab === 'schedule' ? 'bg-white shadow text-amber-700' : 'text-slate-600 hover:text-slate-800'}`}
            >
              My Schedule
            </button>
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-md font-semibold transition ${activeTab === 'bookings' ? 'bg-white shadow text-amber-700' : 'text-slate-600 hover:text-slate-800'}`}
            >
              Booked Sessions
            </button>
          </div>
        </header>

        {/* TAB 1: SCHEDULE MANAGEMENT */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow border border-slate-100 h-fit">
              <h2 className="text-xl font-bold text-slate-700 mb-4">Post Availability Slot</h2>
              <form onSubmit={handleSlotSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleSlotChange} required className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Start Time</label>
                    <input type="time" name="start_time" value={formData.start_time} onChange={handleSlotChange} required className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">End Time</label>
                    <input type="time" name="end_time" value={formData.end_time} onChange={handleSlotChange} required className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Session Format</label>
                  <select name="session_type" value={formData.session_type} onChange={handleSlotChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500">
                    <option value="OFFLINE">In-Person (1-on-1)</option>
                    <option value="ONLINE">Virtual (1-on-1)</option>
                    <option value="GROUP">Group Masterclass</option>
                  </select>
                </div>
                {formData.session_type === 'GROUP' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Max Athletes (Capacity)</label>
                    <input type="number" min="2" max="100" name="max_capacity" value={formData.max_capacity} onChange={handleSlotChange} required className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Session Price (INR)</label>
                  <input type="number" step="0.01" name="price" value={formData.price} onChange={handleSlotChange} required className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500" />
                </div>
                <button type="submit" className="w-full bg-amber-600 text-white font-bold py-2 rounded hover:bg-amber-700 transition">Publish Slot</button>
              </form>
            </div>

            <div className="md:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-slate-700 mb-4">Your Posted Slots</h2>
              {slots.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow border border-slate-100 text-center text-slate-500">
                  You haven't posted any availability slots yet.
                </div>
              ) : (
                slots.map(slot => (
                  <div key={slot.id} className="bg-white p-5 rounded-xl shadow border border-slate-100 transition hover:shadow-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-lg text-slate-800">{slot.date}</span>
                          <span className="text-sm font-semibold text-slate-500">({(slot.start_time || '').slice(0, 5)} - {(slot.end_time || '').slice(0, 5)})</span>
                        </div>
                        <div className="mt-1 flex items-center space-x-2 text-sm">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            slot.session_type === 'OFFLINE' ? 'bg-amber-100 text-amber-800' :
                            slot.session_type === 'ONLINE' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {slot.session_type}
                          </span>
                          <span className="text-slate-600">Capacity: {slot.current_enrollments ?? slot.booked_count ?? 0} / {slot.max_capacity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-slate-800">₹{slot.price}</span>
                        <div className="mt-1">
                          {((slot.current_enrollments ?? slot.booked_count ?? 0) >= slot.max_capacity) ? (
                            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold">Full</span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold">Available</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                      <div className="space-x-2">
                        <button onClick={() => openRescheduleModal(slot)} className="text-amber-600 hover:text-amber-700 font-bold">Reschedule</button>
                        <span className="text-slate-300">|</span>
                        <button onClick={() => handleCancelSlot(slot.id)} className="text-red-500 hover:text-red-700 font-bold">Cancel Session</button>
                      </div>
                      {slot.session_type === 'GROUP' && (
                        <button onClick={() => toggleExpand(slot.id)} className="text-slate-500 hover:text-slate-700 font-semibold">
                          {expandedSlot === slot.id ? 'Hide Roster ▲' : 'View Roster ▼'}
                        </button>
                      )}
                    </div>

                    {expandedSlot === slot.id && slot.roster && (
                      <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h4 className="font-bold text-slate-700 text-sm mb-2">Booked Athletes</h4>
                        {slot.roster.length === 0 ? (
                          <div className="text-xs text-slate-400">No athletes have booked this slot yet.</div>
                        ) : (
                          <div className="space-y-2">
                            {slot.roster.map(r => (
                              <div key={r.booking_id} className="flex justify-between items-center text-xs">
                                <div>
                                  <span className="font-bold text-slate-700">{r.athlete_name}</span>
                                  <span className="text-slate-400 ml-2">Goal: {r.goal || 'None specified'}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded font-bold ${r.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {r.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BOOKED SESSIONS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-700 mb-4">Upcoming Coaching Appointments</h2>
            {bookings.length === 0 ? (
              <div className="bg-white p-8 rounded-xl shadow border border-slate-100 text-center text-slate-500">
                You have no active bookings right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookings.map(booking => {
                  const slot = booking.slot_details || {};
                  const date = slot.date || booking.date || 'TBD';
                  const startTime = (slot.start_time || booking.start_time || '00:00').slice(0, 5);
                  const endTime = (slot.end_time || booking.end_time || '00:00').slice(0, 5);
                  const sessionType = slot.session_type || booking.session_type || '1-on-1';

                  return (
                  <div key={booking.id} className="bg-white p-6 rounded-xl shadow border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Athlete</span>
                          <h3 className="text-xl font-bold text-slate-800">{booking.athlete_name || 'Registered Athlete'}</h3>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            booking.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {booking.payment_status || 'CONFIRMED'}
                          </span>
                          <span className="text-xs text-slate-400 mt-1">{sessionType}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg space-y-2 mb-4 border border-slate-100">
                        <div className="text-sm">
                          <span className="text-slate-500 font-semibold">Date & Time: </span>
                          <span className="font-bold text-slate-700">{date} at {startTime}{endTime ? ` - ${endTime}` : ''}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-500 font-semibold">Primary Goal: </span>
                          <span className="text-slate-700">{booking.current_goal || 'None provided'}</span>
                        </div>
                        {booking.past_injury && (
                          <div className="text-sm">
                            <span className="text-red-500 font-semibold">Past Injury: </span>
                            <span className="text-slate-700">{booking.past_injury}</span>
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          {(booking.slot_details?.session_type || booking.session_type) === 'ONLINE' ? 'Virtual Meeting Link' : 'Facility / Training Ground Address'}
                        </label>
                        <div className="flex space-x-2">
                          <input 
                            type="text" 
                            placeholder={(booking.slot_details?.session_type || booking.session_type) === 'ONLINE' ? 'https://meet.google.com/...' : 'Ground 2, Sector 4...'}
                            value={linkInputs[booking.id] || ''} 
                            onChange={(e) => setLinkInputs({ ...linkInputs, [booking.id]: e.target.value })}
                            className="flex-1 px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-amber-500"
                          />
                          <button 
                            onClick={() => handleUpdateDetails(booking.id)}
                            className="bg-slate-800 text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-slate-900 transition"
                          >
                            Save
                          </button>
                        </div>
                        {(booking.slot_details?.session_type || booking.session_type) === 'ONLINE' && (
                          <button
                            onClick={() => handleGenerateMeet(booking.slot)}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                          >
                            <span>🎥</span> Auto-Generate Google Meet Link
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
                      <button 
                        onClick={() => handleViewPerformance(booking.athlete, booking.athlete_name)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold py-2 rounded transition flex items-center justify-center gap-2 text-sm shadow-sm"
                      >
                        <span>🏏</span> View Cricket Performance & Biometrics
                      </button>

                      <button 
                        onClick={async () => {
                          try {
                            const res = await api.post('conversations/', { recipient_id: booking.athlete });
                            navigate('/chat', { state: { autoSelectId: res.data.id } });
                          } catch (err) {
                            alert("Failed to open chat with athlete.");
                          }
                        }}
                        className="w-full bg-white border-2 border-slate-300 text-slate-700 font-bold py-2 rounded transition hover:bg-slate-50 text-sm"
                      >
                        Message Athlete
                      </button>
                    </div>

                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PERFORMANCE MODAL (CRICKET BATSMAN STATS + BIOMETRICS) */}
        {performanceModalOpen && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 relative max-h-[90vh] flex flex-col">
              <button 
                onClick={() => setPerformanceModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-2xl"
              >
                &times;
              </button>
              
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-slate-800">{selectedAthleteName}'s Performance Dashboard</h2>
                <p className="text-xs text-slate-500">Live batsman metrics, pace vs spin matchups, and physical readiness</p>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                
                {/* 1. Cricket Batsman Profile & Split Stats */}
                {selectedAthleteCricket ? (
                  <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xl">🏏</span>
                          <span className="font-bold text-lg text-white">Cricket Batsman Profile</span>
                          <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2.5 py-0.5 rounded border border-orange-500/40">
                            {selectedAthleteCricket.athlete_details?.primary_role || 'Batsman'}
                          </span>
                          {selectedAthleteCricket.athlete_details?.club_name && (
                            <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded border border-slate-700">
                              🏛️ {selectedAthleteCricket.athlete_details.club_name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {selectedAthleteCricket.athlete_details?.preferred_position || 'Top-Order'} • {selectedAthleteCricket.athlete_details?.batting_hand || 'Right-hand bat'}
                          {selectedAthleteCricket.athlete_details?.age && ` • Age: ${selectedAthleteCricket.athlete_details.age}`}
                          {selectedAthleteCricket.athlete_details?.height && ` • Height: ${selectedAthleteCricket.athlete_details.height}`}
                          {selectedAthleteCricket.athlete_details?.weight && ` • Weight: ${selectedAthleteCricket.athlete_details.weight}`}
                        </p>
                      </div>
                      <div className="text-xs text-slate-400">
                        Updated: {new Date(selectedAthleteCricket.updated_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Overall Numbers */}
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 mb-5 text-center">
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Matches / Inn</p>
                        <p className="text-lg font-black text-white">{selectedAthleteCricket.matches_played} / {selectedAthleteCricket.innings}</p>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Runs Scored</p>
                        <p className="text-lg font-black text-orange-400">{selectedAthleteCricket.runs_made}</p>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Batting Average</p>
                        <p className="text-lg font-black text-emerald-400">{selectedAthleteCricket.batting_average}</p>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Strike Rate</p>
                        <p className="text-lg font-black text-cyan-400">{selectedAthleteCricket.strike_rate}</p>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">100s / 50s</p>
                        <p className="text-lg font-black text-white">{selectedAthleteCricket.centuries} / {selectedAthleteCricket.half_centuries}</p>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">4s / 6s</p>
                        <p className="text-lg font-black text-amber-400">{selectedAthleteCricket.fours} / {selectedAthleteCricket.sixes}</p>
                      </div>
                    </div>

                    {/* Pace vs Spin Split (Key Requirement) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-900 p-4 rounded-xl border border-orange-500/20">
                        <div className="font-bold text-orange-400 flex items-center justify-between mb-3">
                          <span className="flex items-center gap-1.5 text-sm">⚡ Vs. Medium Fast (Pace)</span>
                          <span className="text-cyan-400 font-bold">SR: {selectedAthleteCricket.sr_medium_fast}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-slate-300">
                          <div>Balls: <strong className="text-white">{selectedAthleteCricket.balls_faced_medium_fast}</strong></div>
                          <div>Runs: <strong className="text-orange-400">{selectedAthleteCricket.runs_scored_medium_fast}</strong></div>
                          <div>Dismissals: <strong className="text-red-400">{selectedAthleteCricket.dismissals_medium_fast}</strong></div>
                          <div>Average: <strong className="text-emerald-400">{selectedAthleteCricket.avg_medium_fast}</strong></div>
                        </div>
                      </div>

                      <div className="bg-slate-900 p-4 rounded-xl border border-cyan-500/20">
                        <div className="font-bold text-cyan-400 flex items-center justify-between mb-3">
                          <span className="flex items-center gap-1.5 text-sm">🌀 Vs. Spin Bowlers</span>
                          <span className="text-cyan-400 font-bold">SR: {selectedAthleteCricket.sr_spin}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-slate-300">
                          <div>Balls: <strong className="text-white">{selectedAthleteCricket.balls_faced_spin}</strong></div>
                          <div>Runs: <strong className="text-cyan-400">{selectedAthleteCricket.runs_scored_spin}</strong></div>
                          <div>Dismissals: <strong className="text-red-400">{selectedAthleteCricket.dismissals_spin}</strong></div>
                          <div>Average: <strong className="text-emerald-400">{selectedAthleteCricket.avg_spin}</strong></div>
                        </div>
                      </div>
                    </div>

                    {selectedAthleteCricket.notes && (
                      <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
                        <strong className="text-slate-300">Athlete Target/Notes:</strong> {selectedAthleteCricket.notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-500">
                    No cricket match metrics recorded yet for this athlete.
                  </div>
                )}

                {/* 2. Biometrics & Daily Recovery Charts */}
                {selectedAthleteLogs.length > 0 ? (
                  <>
                    <h3 className="text-lg font-bold text-slate-800 pt-2 border-t border-slate-100">
                      Biometrics & Training Readiness
                    </h3>

                    <div className="h-64 border border-slate-100 rounded-xl p-4 shadow-sm bg-white">
                      <h4 className="font-bold text-slate-700 mb-2 text-sm">Fatigue vs Exertion (RPE)</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedAthleteLogs} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                          <Line type="monotone" dataKey="fatigue_level" stroke="#f59e0b" name="Fatigue (1-10)" strokeWidth={2} />
                          <Line type="monotone" dataKey="perceived_exertion" stroke="#ef4444" name="Exertion (1-10)" strokeWidth={2} />
                          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 10]} />
                          <Tooltip />
                          <Legend />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="h-64 border border-slate-100 rounded-xl p-4 shadow-sm bg-white">
                      <h4 className="font-bold text-slate-700 mb-2 text-sm">Sleep vs Training Volume</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedAthleteLogs} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                          <Line type="monotone" dataKey="sleep_hours" stroke="#3b82f6" name="Sleep (Hrs)" strokeWidth={2} />
                          <Line type="monotone" dataKey="training_duration_mins" stroke="#10b981" name="Training (Mins)" strokeWidth={2} />
                          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500 bg-slate-50 rounded-xl">
                    No daily biometric logs recorded yet for this athlete.
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </div>

      {/* RESCHEDULE MODAL */}
      {rescheduleModalOpen && selectedSlot && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setRescheduleModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Reschedule Session</h2>
            <p className="text-slate-600 mb-4">Athletes will be automatically notified of this change.</p>
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">New Date</label>
                <input type="date" value={rescheduleData.date} onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})} required className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">New Start</label>
                  <input type="time" value={rescheduleData.start_time} onChange={(e) => setRescheduleData({...rescheduleData, start_time: e.target.value})} required className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">New End</label>
                  <input type="time" value={rescheduleData.end_time} onChange={(e) => setRescheduleData({...rescheduleData, end_time: e.target.value})} required className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <button type="submit" className="w-full bg-amber-600 text-white font-bold py-3 rounded-lg hover:bg-amber-700 transition">Confirm Reschedule</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
