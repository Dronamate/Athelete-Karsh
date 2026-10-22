// src/pages/AthleteDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../api';

export default function AthleteDashboard() {
  const username = sessionStorage.getItem('user_name') || 'Athlete';
  const navigate = useNavigate();
  
  // State for tabs and data
  const [activeTab, setActiveTab] = useState('explore'); // 'explore', 'bookings', 'performance'
  const [slots, setSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dbSpecialties, setDbSpecialties] = useState([]);
  
  // Marketplace Filters
  const [filterType, setFilterType] = useState('ALL');
  const [filterSpecialty, setFilterSpecialty] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState('DATE_ASC');
  
  // Intake form state
  const [bookingForm, setBookingForm] = useState({
    current_goal: '',
    past_injury: ''
  });

  // Performance State
  const [performanceLogs, setPerformanceLogs] = useState([]);
  const [performanceForm, setPerformanceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    sleep_hours: '8.0',
    fatigue_level: '5',
    training_duration_mins: '60',
    perceived_exertion: '5',
    muscle_soreness: '1',
    stress_level: '1',
    resting_heart_rate: '',
    weight_kg: '',
    diet_quality: '5',
    hydration_liters: '2.0',
    notes: ''
  });

  // Cricket Stats State
  const [cricketStats, setCricketStats] = useState(null);
  const [athleteProfile, setAthleteProfile] = useState(null);

  // Review State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: '5', comment: '' });

  const filteredSlots = slots.filter(slot => {
    if (filterType !== 'ALL' && slot.session_type !== filterType) return false;
    if (filterSpecialty !== 'ALL' && slot.professional_specialty !== filterSpecialty) return false;
    if (parseFloat(slot.price) > maxPrice) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'PRICE_ASC') return parseFloat(a.price) - parseFloat(b.price);
    if (sortBy === 'PRICE_DESC') return parseFloat(b.price) - parseFloat(a.price);
    if (sortBy === 'RATING_DESC') return (b.professional_rating || 0) - (a.professional_rating || 0);
    const dateA = new Date(`${a.date}T${a.start_time}`);
    const dateB = new Date(`${b.date}T${b.start_time}`);
    return dateA - dateB;
  });

  useEffect(() => {
    fetchAvailableSlots();
    fetchMyBookings();
    fetchPerformanceLogs();
    fetchNotifications();
    fetchSpecialties();
    fetchCricketData();

    const intervalId = setInterval(() => {
      fetchNotifications();
      fetchMyBookings();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchCricketData = async () => {
    try {
      const [statsRes, profRes] = await Promise.all([
        api.get('cricket-stats/my_stats/').catch(() => ({ data: null })),
        api.get('profile/').catch(() => ({ data: null }))
      ]);
      if (statsRes?.data) setCricketStats(statsRes.data);
      if (profRes?.data) setAthleteProfile(profRes.data);
    } catch (err) {
      console.error('Failed to load cricket stats:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await api.get('specialties/');
      setDbSpecialties(response.data.map(s => s.name));
    } catch (error) {
      console.error('Failed to fetch specialties:', error);
    }
  };

  const markNotificationsRead = async () => {
    try {
      await api.post('notifications/mark_all_read/');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notifications read:', error);
    }
  };

  const fetchPerformanceLogs = async () => {
    try {
      const response = await api.get('performance/');
      setPerformanceLogs(response.data.reverse());
    } catch (error) {
      console.error('Failed to fetch performance logs:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await api.get('slots/');
      setSlots(response.data);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const response = await api.get('bookings/');
      setMyBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleFormChange = (e) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
  };

  const handlePerfChange = (e) => {
    setPerformanceForm({ ...performanceForm, [e.target.name]: e.target.value });
  };

  const handlePerfSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('performance/', performanceForm);
      alert('Readiness metrics logged successfully!');
      fetchPerformanceLogs();
      setPerformanceForm({ ...performanceForm, notes: '' });
    } catch (error) {
      alert('Failed to log readiness (you may have already logged today).');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('reviews/', {
        booking: selectedBookingForReview.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      alert('Review submitted! Thank you for supporting your coach.');
      setReviewModalOpen(false);
      fetchMyBookings();
    } catch (error) {
      alert('Failed to submit review.');
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('bookings/', {
        slot: selectedSlot.id,
        current_goal: bookingForm.current_goal,
        past_injury: bookingForm.past_injury
      });

      const bookingData = response.data;
      
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: selectedSlot.price * 100,
        currency: 'INR',
        name: 'DronaMate Cricket Academy',
        description: `Coaching Session with ${selectedSlot.professional_name}`,
        order_id: bookingData.razorpay_order_id,
        
        handler: async function (paymentResponse) {
          try {
            await api.post(`bookings/${bookingData.id}/verify_payment/`, {
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_signature: paymentResponse.razorpay_signature
            });

            alert(`Session Confirmed! Payment ID: ${paymentResponse.razorpay_payment_id}`);
            setSelectedSlot(null);
            setBookingForm({ current_goal: '', past_injury: '' });
            fetchAvailableSlots();
            fetchMyBookings();
            setActiveTab('bookings');
            
          } catch (error) {
            console.error("Verification failed:", error);
            alert("Payment processed, but signature verification encountered an issue. Please contact academy support.");
          }
        },
        prefill: {
          name: username,
          contact: '9999999999'
        },
        theme: {
          color: '#f97316'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Booking failed:', error.response?.data);
      const errorMessage = error.response?.data?.slot || 'Failed to initialize booking. Slot may have been reserved.';
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500 selection:text-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ========================================================= */}
        {/* ACADEMY ATHLETE HEADER & NAVIGATION BAR                   */}
        {/* ========================================================= */}
        <header className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="bg-orange-500/20 border border-orange-500/40 text-orange-400 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Athlete Member
                </span>
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Academy Active
                </span>
                {athleteProfile?.athlete_profile?.club_name && (
                  <span className="text-slate-400 text-xs font-semibold">
                    🏛️ {athleteProfile.athlete_profile.club_name}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Athlete Performance Hub</h1>
              <p className="text-slate-400 text-xs">Logged in as <strong className="text-white">@{username}</strong> • Verified Batsman Analytics</p>
            </div>
            
            {/* Notification Bell */}
            <div className="relative ml-auto">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (notifications.some(n => !n.is_read)) markNotificationsRead();
                }}
                className="relative p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
                title="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                {notifications.some(n => !n.is_read) && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-slate-900"></span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden z-50">
                  <div className="p-3.5 bg-slate-800/80 border-b border-slate-800 font-bold text-white text-xs uppercase tracking-wider flex justify-between items-center">
                    <span>Notifications</span>
                    <span className="text-[10px] text-slate-400 font-mono">{notifications.length} total</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">No new notifications.</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-3.5 text-xs ${n.is_read ? 'opacity-60 text-slate-400' : 'bg-orange-500/5 text-slate-200'}`}>
                          <div className="font-bold text-white">{n.title}</div>
                          <div className="text-slate-400 mt-1">{n.message}</div>
                          <div className="text-[10px] text-slate-500 mt-1.5 font-mono">{new Date(n.created_at).toLocaleDateString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-stretch sm:self-auto">
            <button 
              onClick={() => {setActiveTab('explore'); setSelectedSlot(null);}}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'explore' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              <span>🏏</span> Book Coach
            </button>
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'bookings' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              <span>📅</span> My Sessions ({myBookings.length})
            </button>
            <button 
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'performance' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              <span>⚡</span> Daily Readiness
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* TAB 1: BOOK ACADEMY COACH (MARKETPLACE)                   */}
        {/* ========================================================= */}
        {activeTab === 'explore' && (
          <div className="space-y-6">
            
            {/* If a slot was clicked for checkout */}
            {selectedSlot ? (
              <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto space-y-6">
                <button 
                  onClick={() => setSelectedSlot(null)}
                  className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                >
                  &larr; Back to Coaching Calendar
                </button>
                
                <div>
                  <span className="bg-orange-500/20 border border-orange-500/30 text-orange-400 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                    Reserve Academy Slot
                  </span>
                  <h2 className="text-2xl font-black text-white mt-2">Confirm 1-on-1 Coaching Session</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Booking session with <strong className="text-white">{selectedSlot.professional_name}</strong> on <strong className="text-white">{selectedSlot.date}</strong> at <strong className="text-white">{(selectedSlot.start_time || '00:00').substring(0, 5)} - {(selectedSlot.end_time || '00:00').substring(0, 5)}</strong>.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-500 block">Session Fee</span>
                    <span className="text-xl font-black text-emerald-400">₹{selectedSlot.price}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Format</span>
                    <span className="text-white font-bold">{selectedSlot.session_type} Session</span>
                  </div>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Your Primary Goal for this Session *</label>
                    <input 
                      type="text" 
                      name="current_goal" 
                      value={bookingForm.current_goal} 
                      onChange={handleFormChange} 
                      placeholder="e.g. Fixing front foot balance against medium fast outswingers"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Past Injuries or Physical Considerations (Optional)</label>
                    <textarea 
                      name="past_injury" 
                      value={bookingForm.past_injury} 
                      onChange={handleFormChange} 
                      rows="3"
                      placeholder="Shared securely with your coach prior to warm-up..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    ></textarea>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3.5 rounded-xl text-xs transition shadow-lg shadow-orange-500/25"
                    >
                      Proceed to Secure Payment (₹{selectedSlot.price})
                    </button>
                    <button 
                      type="button" 
                      onClick={async () => {
                        try {
                          const response = await api.post('conversations/', { professional_id: selectedSlot.professional });
                          navigate(`/chat?conversationId=${response.data.id}`);
                        } catch (e) {
                          alert("Could not start chat.");
                        }
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-3.5 rounded-xl text-xs transition border border-slate-700"
                    >
                      Message Coach
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                {/* Marketplace Filter Bar */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl">
                  <div>
                    <h2 className="text-base font-bold text-white">Available Coaching Masterclasses</h2>
                    <p className="text-xs text-slate-400">Choose from certified batting, bowling, and conditioning mentors</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                    <select 
                      value={sortBy} 
                      onChange={e => setSortBy(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-orange-500"
                    >
                      <option value="DATE_ASC">Sort: Soonest</option>
                      <option value="PRICE_ASC">Sort: Price (Low to High)</option>
                      <option value="PRICE_DESC">Sort: Price (High to Low)</option>
                      <option value="RATING_DESC">Sort: Top Rated</option>
                    </select>

                    <select 
                      value={filterType} 
                      onChange={e => setFilterType(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-orange-500"
                    >
                      <option value="ALL">All Formats</option>
                      <option value="ONLINE">Virtual (1-on-1)</option>
                      <option value="OFFLINE">Net Session (In-Person)</option>
                      <option value="GROUP">Group Masterclass</option>
                    </select>

                    <select 
                      value={filterSpecialty} 
                      onChange={e => setFilterSpecialty(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-orange-500 max-w-[170px]"
                    >
                      <option value="ALL">All Specialties</option>
                      {dbSpecialties.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                    
                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 border border-slate-800 rounded-lg text-xs">
                      <span className="text-slate-400">Max ₹{maxPrice}</span>
                      <input 
                        type="range" 
                        min="500" 
                        max="10000" 
                        step="500"
                        value={maxPrice} 
                        onChange={e => setMaxPrice(e.target.value)}
                        className="w-20 accent-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Slots Grid */}
                {filteredSlots.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-500 text-xs">
                    No coaching slots match your filters. Broaden your search or check back soon!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredSlots.map(slot => (
                      <div 
                        key={slot.id} 
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-orange-500/40 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                      >
                        <div>
                          {/* Coach Header */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-bold text-white shadow-md text-sm">
                                {(slot.professional_name?.[0] || 'C').toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                                  {slot.professional_name}
                                </h3>
                                <p className="text-purple-400 text-xs font-semibold">
                                  {slot.professional_specialty || 'Cricket Coach'}
                                </p>
                              </div>
                            </div>
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs font-black">
                              ₹{slot.price}
                            </span>
                          </div>

                          {/* Session Metadata Chips */}
                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 mb-4 text-xs">
                            <div className="flex justify-between text-slate-400">
                              <span>📅 Date:</span>
                              <span className="font-semibold text-white">{slot.date}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>⏰ Time:</span>
                              <span className="font-semibold text-white">{(slot.start_time || '00:00').substring(0, 5)} - {(slot.end_time || '00:00').substring(0, 5)}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>👥 Availability:</span>
                              <span className="font-bold text-amber-400">
                                {slot.max_capacity - (slot.current_enrollments || 0)} spot(s) remaining
                              </span>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => setSelectedSlot(slot)}
                          className="w-full bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-200 font-bold py-2.5 rounded-xl transition text-xs border border-slate-700 hover:border-orange-500 shadow-sm"
                        >
                          Book Coaching Session →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MY BOOKED SESSIONS                                 */}
        {/* ========================================================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Your Scheduled Coaching Sessions</h2>
                <p className="text-xs text-slate-400">Upcoming net training, virtual masterclasses, and coach feedback</p>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                {myBookings.length} Total Bookings
              </span>
            </div>

            {myBookings.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-500 text-xs">
                You haven't scheduled any sessions yet. Browse the calendar to book your first mentor!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myBookings.map(booking => {
                  const slot = booking.slot_details || {};
                  const date = slot.date || booking.date || 'TBD';
                  const startTime = (slot.start_time || booking.start_time || '00:00').substring(0, 5);
                  const endTime = (slot.end_time || booking.end_time || '00:00').substring(0, 5);
                  const sessionType = slot.session_type || booking.session_type || '1-on-1';
                  const coachName = slot.professional_name || 'Assigned Coach';
                  const isCancelled = slot.is_cancelled || false;

                  return (
                    <div key={booking.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-base text-white">{coachName}</h3>
                            <p className="text-xs text-orange-400 font-semibold">{sessionType} Masterclass</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            booking.payment_status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                            booking.payment_status === 'REFUNDED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {isCancelled ? 'CANCELLED' : booking.payment_status}
                          </span>
                        </div>
                        
                        <div className="text-xs space-y-2 mb-4 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                          <div className="flex justify-between text-slate-400">
                            <span>Date:</span>
                            <span className={isCancelled ? "line-through text-slate-500" : "font-bold text-white"}>📅 {date}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Time:</span>
                            <span className={isCancelled ? "line-through text-slate-500" : "font-bold text-white"}>⏰ {startTime} - {endTime}</span>
                          </div>
                          
                          <div className="pt-2 border-t border-slate-800/80">
                            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Session Objective</span>
                            <p className="text-slate-300 italic">{booking.current_goal || 'General Technical Review'}</p>
                          </div>
                        </div>
                      </div>

                      {booking.payment_status === 'PAID' && !(booking.slot_details?.is_cancelled) && (
                        <div className="pt-2 border-t border-slate-800 space-y-2">
                          {(booking.slot_details?.session_type || booking.session_type) === 'ONLINE' ? (
                            <button 
                              onClick={() => {
                                if (booking.slot_details?.meeting_link_or_address || booking.meeting_link_or_address) {
                                  window.open(booking.slot_details?.meeting_link_or_address || booking.meeting_link_or_address, '_blank');
                                } else {
                                  alert("Your coach has not posted the video link yet. Please check back closer to session time or send them a message.");
                                }
                              }}
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs transition shadow-md"
                            >
                              🎥 Join Live Video Session
                            </button>
                          ) : (
                            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                              📍 <strong>Net Facility:</strong> {booking.meeting_link_or_address || "Coach will update facility location."}
                            </div>
                          )}
                          
                          {!booking.has_reviewed ? (
                            <button 
                              onClick={() => {
                                setSelectedBookingForReview(booking);
                                setReviewModalOpen(true);
                              }}
                              className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold py-2 rounded-xl text-xs transition border border-slate-700"
                            >
                              ⭐ Leave Session Review
                            </button>
                          ) : (
                            <div className="w-full bg-slate-950 text-slate-500 font-bold py-2 rounded-xl text-[11px] text-center border border-slate-800">
                              ✓ Review Submitted
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DAILY READINESS & BIOMETRICS                       */}
        {/* ========================================================= */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            
            {/* Batsman Spotlight Card Header */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-2xl border border-orange-500/30">
                    🏏
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-bold text-white">Cricket Batsman Profile</h2>
                      <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-bold px-2 py-0.5 rounded">
                        {athleteProfile?.athlete_profile?.playing_role || 'Batsman'}
                      </span>
                      {athleteProfile?.athlete_profile?.club_name && (
                        <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded border border-slate-700">
                          🏛️ {athleteProfile.athlete_profile.club_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {athleteProfile?.athlete_profile?.preferred_position || 'Top-Order Batsman'} • {athleteProfile?.athlete_profile?.batting_hand || 'Right-hand bat'}
                      {athleteProfile?.athlete_profile?.age && ` • Age: ${athleteProfile.athlete_profile.age}`}
                      {athleteProfile?.athlete_profile?.height && ` • Height: ${athleteProfile.athlete_profile.height}`}
                      {athleteProfile?.athlete_profile?.weight && ` • Weight: ${athleteProfile.athlete_profile.weight}`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/performance')}
                  className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-orange-500/20 flex items-center gap-1.5"
                >
                  <span>⚡</span> Full Performance Engine & AI Coach →
                </button>
              </div>

              {/* Match Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 mb-4 text-center">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Matches / Inn</p>
                  <p className="text-base font-black text-white">{cricketStats?.matches_played || 0} / {cricketStats?.innings || 0}</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Runs Scored</p>
                  <p className="text-base font-black text-orange-400">{cricketStats?.runs_made || 0}</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Batting Avg</p>
                  <p className="text-base font-black text-emerald-400">{cricketStats?.batting_average || '0.00'}</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Strike Rate</p>
                  <p className="text-base font-black text-cyan-400">{cricketStats?.strike_rate || '0.00'}</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">100s / 50s</p>
                  <p className="text-base font-black text-white">{cricketStats?.centuries || 0} / {cricketStats?.half_centuries || 0}</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">4s / 6s</p>
                  <p className="text-base font-black text-amber-400">{cricketStats?.fours || 0} / {cricketStats?.sixes || 0}</p>
                </div>
              </div>

              {/* Pace vs Spin Splits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-500/20">
                  <div className="font-bold text-blue-400 flex items-center justify-between mb-2">
                    <span>⚡ Against Medium Fast (Pace)</span>
                    <span className="text-cyan-400 font-bold">SR: {cricketStats?.sr_medium_fast || '0.00'}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-slate-300 text-[11px]">
                    <div>Balls: <strong className="text-white">{cricketStats?.balls_faced_medium_fast || 0}</strong></div>
                    <div>Runs: <strong className="text-orange-400">{cricketStats?.runs_scored_medium_fast || 0}</strong></div>
                    <div>Outs: <strong className="text-red-400">{cricketStats?.dismissals_medium_fast || 0}</strong></div>
                    <div>Avg: <strong className="text-emerald-400">{cricketStats?.avg_medium_fast || '0.00'}</strong></div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-purple-500/20">
                  <div className="font-bold text-purple-400 flex items-center justify-between mb-2">
                    <span>🌀 Against Spin Bowlers</span>
                    <span className="text-cyan-400 font-bold">SR: {cricketStats?.sr_spin || '0.00'}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-slate-300 text-[11px]">
                    <div>Balls: <strong className="text-white">{cricketStats?.balls_faced_spin || 0}</strong></div>
                    <div>Runs: <strong className="text-cyan-400">{cricketStats?.runs_scored_spin || 0}</strong></div>
                    <div>Outs: <strong className="text-red-400">{cricketStats?.dismissals_spin || 0}</strong></div>
                    <div>Avg: <strong className="text-emerald-400">{cricketStats?.avg_spin || '0.00'}</strong></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Metric Entry Form & Recharts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Log Form */}
              <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800">
                <h3 className="text-base font-bold text-white mb-1">Log Daily Readiness</h3>
                <p className="text-xs text-slate-400 mb-4">Track physical recovery to prevent fatigue in net sessions</p>

                <form onSubmit={handlePerfSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Date</label>
                    <input type="date" name="date" value={performanceForm.date} onChange={handlePerfChange} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Sleep (Hrs)</label>
                      <input type="number" step="0.1" name="sleep_hours" value={performanceForm.sleep_hours} onChange={handlePerfChange} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Training (Mins)</label>
                      <input type="number" name="training_duration_mins" value={performanceForm.training_duration_mins} onChange={handlePerfChange} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Fatigue (1-10)</label>
                      <input type="number" min="1" max="10" name="fatigue_level" value={performanceForm.fatigue_level} onChange={handlePerfChange} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Muscle Soreness (1-10)</label>
                      <input type="number" min="1" max="10" name="muscle_soreness" value={performanceForm.muscle_soreness} onChange={handlePerfChange} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Stress Level (1-10)</label>
                      <input type="number" min="1" max="10" name="stress_level" value={performanceForm.stress_level} onChange={handlePerfChange} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Resting HR (BPM)</label>
                      <input type="number" min="30" max="200" name="resting_heart_rate" value={performanceForm.resting_heart_rate} onChange={handlePerfChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500" placeholder="e.g. 55" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Diet Quality (1-10)</label>
                      <input type="number" min="1" max="10" name="diet_quality" value={performanceForm.diet_quality} onChange={handlePerfChange} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Hydration (Liters)</label>
                      <input type="number" step="0.1" name="hydration_liters" value={performanceForm.hydration_liters} onChange={handlePerfChange} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Notes</label>
                    <textarea name="notes" value={performanceForm.notes} onChange={handlePerfChange} rows="2" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500" placeholder="Batting drill feedback..."></textarea>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-orange-500/20">
                    Save Daily Readiness
                  </button>
                </form>
              </div>

              {/* Right Column: Recharts */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 h-80 min-w-0">
                  <h3 className="text-sm font-bold text-white mb-4">Fatigue vs Perceived Exertion (RPE)</h3>
                  {performanceLogs.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceLogs} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                        <Line type="monotone" dataKey="fatigue_level" stroke="#f59e0b" name="Fatigue (1-10)" strokeWidth={2} />
                        <Line type="monotone" dataKey="perceived_exertion" stroke="#ef4444" name="Exertion (1-10)" strokeWidth={2} />
                        <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis domain={[0, 10]} stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '0.75rem' }} />
                        <Legend />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 text-xs">Log daily metrics to visualize your recovery curve.</div>
                  )}
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 h-80 min-w-0">
                  <h3 className="text-sm font-bold text-white mb-4">Sleep Hours vs Training Duration</h3>
                  {performanceLogs.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceLogs} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                        <Line type="monotone" dataKey="sleep_hours" stroke="#3b82f6" name="Sleep (Hrs)" strokeWidth={2} />
                        <Line type="monotone" dataKey="training_duration_mins" stroke="#10b981" name="Training (Mins)" strokeWidth={2} />
                        <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis yAxisId="left" stroke="#94a3b8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '0.75rem' }} />
                        <Legend />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 text-xs">Log daily metrics to visualize sleep and training trends.</div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* REVIEW MODAL                                              */}
        {/* ========================================================= */}
        {reviewModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
              <button 
                onClick={() => setReviewModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
              <h3 className="text-base font-bold text-white mb-1">Rate Your Coaching Session</h3>
              <p className="text-xs text-slate-400 mb-4">
                Leave feedback for {selectedBookingForReview?.slot_details?.professional_name || 'your coach'}
              </p>
              
              <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Rating</label>
                  <select 
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({...reviewForm, rating: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-semibold"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ - World-Class Mentorship</option>
                    <option value="4">⭐⭐⭐⭐ - Good Session</option>
                    <option value="3">⭐⭐⭐ - Average</option>
                    <option value="2">⭐⭐ - Below Expectation</option>
                    <option value="1">⭐ - Unsatisfactory</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Written Feedback</label>
                  <textarea 
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    rows="3"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    placeholder="Share specific insights or drills your coach helped you with..."
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setReviewModalOpen(false)}
                    className="bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl shadow-lg shadow-orange-500/20"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
