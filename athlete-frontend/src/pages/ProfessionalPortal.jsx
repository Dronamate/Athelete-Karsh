// src/pages/ProfessionalPortal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useToast } from '../components/Toast';

export default function ProfessionalPortal() {
  const username = sessionStorage.getItem('user_name') || 'Coach';
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' or 'bookings'

  // Schedule State
  const [slots, setSlots] = useState([]);
  const [formData, setFormData] = useState({
    date: '', start_time: '', end_time: '', session_type: 'OFFLINE', price: '1500.00', max_capacity: 1
  });

  const [bookings, setBookings] = useState([]);
  const [linkInputs, setLinkInputs] = useState({}); // Stores the meeting links being typed
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  // Reschedule State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', start_time: '', end_time: '' });
  
  // UI State
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
      addToast('Coaching availability slot published successfully!', 'success');
      setFormData({
        date: '', start_time: '', end_time: '', session_type: 'OFFLINE', price: '1500.00', max_capacity: 1
      });
    } catch (error) {
      console.error('Failed to create slot:', error);
      addToast('Failed to publish slot. Please verify the dates and times.', 'error');
    }
  };

  const handleUpdateDetails = async (bookingId) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      await api.patch(`slots/${booking.slot}/`, {
        meeting_link_or_address: linkInputs[bookingId]
      });
      addToast('Session details successfully updated and saved!', 'success');
      fetchBookings();
      fetchSlots();
    } catch (error) {
      console.error('Failed to update details:', error);
      addToast('Failed to save session details.', 'error');
    }
  };

  const handleToggleAvailability = async () => {
    const current = myProfile?.professional_profile?.is_available ?? true;
    setTogglingAvailability(true);
    try {
      const res = await api.patch('coach/availability', { is_available: !current });
      setMyProfile((prev) => ({
        ...prev,
        professional_profile: {
          ...(prev?.professional_profile || {}),
          is_available: res.data.is_available,
        },
      }));
      addToast(
        res.data.is_available
          ? 'Live status updated: You are now marked as AVAILABLE for instant bookings.'
          : 'Live status updated: You are marked as UNAVAILABLE (Waitlist only).',
        res.data.is_available ? 'success' : 'info'
      );
    } catch (error) {
      addToast('Failed to update availability status.', 'error');
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleCancelSlot = async (slotId) => {
    if (!window.confirm("Are you sure you want to cancel this session? Any booked athletes will be automatically refunded.")) return;
    try {
      await api.post(`slots/${slotId}/cancel/`);
      addToast('Session cancelled and athlete refunds initiated.', 'success');
      fetchSlots();
      fetchBookings();
    } catch (error) {
      addToast('Failed to cancel session.', 'error');
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
      addToast('Session rescheduled successfully! Enrolled athletes have been notified.', 'success');
      setRescheduleModalOpen(false);
      fetchSlots();
      fetchBookings();
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to reschedule session.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#0c2340] selection:bg-[#ff5500] selection:text-white p-4 md:p-8 font-sans overflow-x-hidden w-full max-w-[100vw]">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ========================================================= */}
        {/* COACH CONTROL CENTER HEADER                               */}
        {/* ========================================================= */}
        <header className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-purple-50 border border-purple-200 text-purple-700 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-display">
                Certified Coach
              </span>
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 font-display">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Academy Mentor
              </span>
              {myProfile?.professional_profile?.institution_club && (
                <span className="text-slate-500 text-xs font-semibold">
                  🏛️ {myProfile.professional_profile.institution_club}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#0c2340] tracking-tight font-display">
              Trainer Portal &amp; Schedule
            </h1>
            <p className="text-slate-500 text-xs">
              Logged in as <strong className="text-[#0c2340]">{myProfile?.name || username}</strong> • Manage live availability, slots &amp; bookings
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-stretch sm:self-auto">
            {/* Prominent Live Availability Toggle Switch */}
            <button
              type="button"
              disabled={togglingAvailability}
              onClick={handleToggleAvailability}
              className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-xs font-bold transition font-display ${
                myProfile?.professional_profile?.is_available !== false
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  myProfile?.professional_profile?.is_available !== false ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`}></span>
                {myProfile?.professional_profile?.is_available !== false ? 'Status: Available' : 'Status: Unavailable'}
              </span>
              <span className={`w-9 h-5 rounded-full relative transition ${
                myProfile?.professional_profile?.is_available !== false ? 'bg-emerald-500' : 'bg-slate-300'
              }`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                  myProfile?.professional_profile?.is_available !== false ? 'left-4' : 'left-0.5'
                }`}></span>
              </span>
            </button>

            <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setActiveTab('schedule')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 font-display ${
                  activeTab === 'schedule' ? 'bg-[#ff5500] text-white shadow-sm' : 'text-slate-600 hover:text-[#0c2340]'
                }`}
              >
                <span>📅</span> My Schedule ({slots.length})
              </button>
              <button 
                onClick={() => setActiveTab('bookings')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 font-display ${
                  activeTab === 'bookings' ? 'bg-[#ff5500] text-white shadow-sm' : 'text-slate-600 hover:text-[#0c2340]'
                }`}
              >
                <span>👥</span> Booked Sessions ({bookings.length})
              </button>
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* TAB 1: SCHEDULE MANAGEMENT                                */}
        {/* ========================================================= */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Publish Slot Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit space-y-4">
              <div>
                <span className="text-[10px] font-bold text-[#ff5500] uppercase tracking-wider block mb-1 font-display">
                  Calendar Provisioning
                </span>
                <h2 className="text-lg font-black text-[#0c2340] font-display">Publish Availability Slot</h2>
              </div>

              <form onSubmit={handleSlotSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                    Session Date *
                  </label>
                  <input 
                    type="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleSlotChange} 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[#0c2340] focus:outline-none focus:border-[#ff5500]" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      Start Time *
                    </label>
                    <input 
                      type="time" 
                      name="start_time" 
                      value={formData.start_time} 
                      onChange={handleSlotChange} 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[#0c2340] focus:outline-none focus:border-[#ff5500]" 
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      End Time *
                    </label>
                    <input 
                      type="time" 
                      name="end_time" 
                      value={formData.end_time} 
                      onChange={handleSlotChange} 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[#0c2340] focus:outline-none focus:border-[#ff5500]" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                    Session Format *
                  </label>
                  <select 
                    name="session_type" 
                    value={formData.session_type} 
                    onChange={handleSlotChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[#0c2340] focus:outline-none focus:border-[#ff5500]"
                  >
                    <option value="OFFLINE">Net Session (In-Person)</option>
                    <option value="ONLINE">Virtual (1-on-1 Video Drill)</option>
                    <option value="GROUP">Group Academy Masterclass</option>
                  </select>
                </div>

                {formData.session_type === 'GROUP' && (
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      Max Athletes (Capacity) *
                    </label>
                    <input 
                      type="number" 
                      min="2" 
                      max="100" 
                      name="max_capacity" 
                      value={formData.max_capacity} 
                      onChange={handleSlotChange} 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[#0c2340] focus:outline-none focus:border-[#ff5500]" 
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                    Session Price (₹ INR) *
                  </label>
                  <input 
                    type="number" 
                    step="50" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleSlotChange} 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[#0c2340] focus:outline-none focus:border-[#ff5500] font-mono" 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#ff5500] hover:bg-[#ea4c00] text-white font-bold py-3 rounded-lg transition shadow-sm font-display mt-2"
                >
                  Publish Academy Slot
                </button>
              </form>
            </div>

            {/* Right: Published Slots */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center bg-white border border-slate-200 px-5 py-3.5 rounded-xl shadow-sm">
                <h3 className="font-bold text-[#0c2340] text-sm font-display">Your Active Availability Schedule</h3>
                <span className="text-xs text-slate-500 font-mono">{slots.length} Slots</span>
              </div>

              {slots.length === 0 ? (
                <div className="bg-white border border-slate-200 p-12 rounded-xl text-center text-slate-500 text-xs shadow-sm">
                  No slots published yet. Use the form to make your calendar available to academy athletes.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {slots.map(slot => (
                    <div 
                      key={slot.id} 
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            {slot.session_type}
                          </span>
                          <div className="font-bold text-[#0c2340] text-sm mt-1.5 font-display">📅 {slot.date}</div>
                          <div className="text-xs text-slate-500">⏰ {(slot.start_time || '00:00').substring(0, 5)} - {(slot.end_time || '00:00').substring(0, 5)}</div>
                        </div>
                        <span className="text-emerald-700 font-black text-sm bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-display">
                          ₹{slot.price}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                        <span className="text-slate-500">Enrolled:</span>
                        <span className="font-bold text-[#0c2340]">
                          {slot.current_enrollments || 0} / {slot.max_capacity} Athletes
                        </span>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => openRescheduleModal(slot)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-lg text-xs font-semibold transition border border-slate-200"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleCancelSlot(slot.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-1.5 px-3 rounded-lg text-xs font-semibold transition"
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
        {/* TAB 2: BOOKED SESSIONS                                    */}
        {/* ========================================================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-[#0c2340] font-display">Scheduled Athlete Masterclasses</h2>
                <p className="text-xs text-slate-500">Manage venue details, virtual links, and session requirements</p>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                {bookings.length} Confirmed
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-white border border-slate-200 p-12 rounded-xl text-center text-slate-500 text-xs shadow-sm">
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
                    <div key={booking.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        {/* Athlete Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#0c2340] flex items-center justify-center font-bold text-white shadow-sm text-sm font-display">
                              {(athlete.username?.[0] || 'A').toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-[#0c2340] font-display">
                                {athlete.first_name ? `${athlete.first_name} ${athlete.last_name || ''}` : athlete.username || 'Registered Athlete'}
                              </h3>
                              <p className="text-slate-500 text-xs font-mono">@{athlete.username || 'athlete'}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            booking.payment_status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {booking.payment_status}
                          </span>
                        </div>

                        {/* Session Metadata */}
                        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2 mb-4 text-xs">
                          <div className="flex justify-between text-slate-600">
                            <span>📅 Schedule:</span>
                            <span className="font-semibold text-[#0c2340]">{date} ({startTime} - {endTime})</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Format:</span>
                            <span className="font-bold text-purple-700">{slot.session_type || '1-on-1'}</span>
                          </div>
                          {booking.current_goal && (
                            <div className="pt-2 border-t border-slate-200">
                              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Athlete Focus Goal</span>
                              <p className="text-slate-700 italic">"{booking.current_goal}"</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder={slot.session_type === 'ONLINE' ? 'Enter Google Meet Link' : 'Net Facility / Gate Address'}
                            value={linkInputs[booking.id] || ''}
                            onChange={(e) => setLinkInputs({ ...linkInputs, [booking.id]: e.target.value })}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-[#0c2340] focus:outline-none focus:border-[#ff5500]"
                          />
                          <button
                            onClick={() => handleUpdateDetails(booking.id)}
                            className="bg-[#0c2340] hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm font-display"
                          >
                            Save
                          </button>
                        </div>
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
      {/* RESCHEDULE MODAL                                          */}
      {/* ========================================================= */}
      {rescheduleModalOpen && selectedSlot && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-black text-[#0c2340] mb-1 font-display">Reschedule Session</h3>
            <p className="text-xs text-slate-500 mb-4">Set a new date and time. Enrolled athletes will receive immediate notice.</p>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">New Date</label>
                <input 
                  type="date" 
                  value={rescheduleData.date} 
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[#0c2340] focus:outline-none focus:border-[#ff5500]" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">Start Time</label>
                  <input 
                    type="time" 
                    value={rescheduleData.start_time} 
                    onChange={(e) => setRescheduleData({ ...rescheduleData, start_time: e.target.value })}
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[#0c2340] focus:outline-none focus:border-[#ff5500]" 
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">End Time</label>
                  <input 
                    type="time" 
                    value={rescheduleData.end_time} 
                    onChange={(e) => setRescheduleData({ ...rescheduleData, end_time: e.target.value })}
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[#0c2340] focus:outline-none focus:border-[#ff5500]" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="bg-slate-100 text-slate-600 font-bold px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#ff5500] hover:bg-[#ea4c00] text-white font-bold px-5 py-2 rounded-lg shadow-sm font-display"
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
