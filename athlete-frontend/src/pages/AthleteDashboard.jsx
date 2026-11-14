// src/pages/AthleteDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import CoachSearchFeed from '../components/CoachSearchFeed';
import { useToast } from '../components/Toast';

export default function AthleteDashboard() {
  const username = sessionStorage.getItem('user_name') || 'Athlete';
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'bookings'
  const [slots, setSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [athleteProfile, setAthleteProfile] = useState(null);

  const [bookingForm, setBookingForm] = useState({
    current_goal: '',
    past_injury: '',
  });

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: '5', comment: '' });

  useEffect(() => {
    fetchAvailableSlots();
    fetchMyBookings();
    fetchNotifications();
    api.get('profile/').then((res) => setAthleteProfile(res.data)).catch(() => {});

    const intervalId = setInterval(() => {
      fetchNotifications();
      fetchMyBookings();
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
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

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('reviews/', {
        booking: selectedBookingForReview.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      addToast('Review submitted! Thank you for supporting your trainer.', 'success');
      setReviewModalOpen(false);
      fetchMyBookings();
    } catch (error) {
      addToast('Failed to submit review.', 'error');
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('bookings/', {
        slot: selectedSlot.id,
        current_goal: bookingForm.current_goal,
        past_injury: bookingForm.past_injury,
      });

      const bookingData = response.data;
      const res = await loadRazorpayScript();
      if (!res) {
        addToast('Razorpay SDK failed to load. Please check your network connection.', 'error');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: selectedSlot.price * 100,
        currency: 'INR',
        name: 'DronaMate',
        description: `Training Session with ${selectedSlot.professional_name}`,
        order_id: bookingData.razorpay_order_id,
        handler: async function (paymentResponse) {
          try {
            await api.post(`bookings/${bookingData.id}/verify_payment/`, {
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            addToast(`Session Confirmed! Payment ID: ${paymentResponse.razorpay_payment_id}`, 'success');
            setSelectedSlot(null);
            setBookingForm({ current_goal: '', past_injury: '' });
            fetchAvailableSlots();
            fetchMyBookings();
            setActiveTab('bookings');
          } catch (error) {
            addToast('Payment processed, but signature verification encountered an issue.', 'error');
          }
        },
        prefill: {
          name: athleteProfile?.name || username,
          contact: athleteProfile?.mobile_number || '9999999999',
        },
        theme: { color: '#ff5500' },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      const errorMessage = error.response?.data?.slot || 'Failed to initialize booking.';
      addToast(errorMessage, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#0c2340] selection:bg-[#ff5500] selection:text-white p-4 md:p-8 font-sans overflow-x-hidden w-full max-w-[100vw]">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <header className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="bg-orange-50 border border-orange-200 text-[#ff5500] px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-display">
                  Athlete Member
                </span>
                {athleteProfile?.athlete_profile?.pincode && (
                  <span className="text-slate-500 text-xs font-semibold">
                    📍 Pincode: {athleteProfile.athlete_profile.pincode}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-[#0c2340] tracking-tight font-display">
                Athlete Booking Hub
              </h1>
              <p className="text-slate-500 text-xs">
                Logged in as <strong className="text-[#0c2340]">{athleteProfile?.name || username}</strong> • Find trainers &amp; manage sessions
              </p>
            </div>

            {/* Notification Bell */}
            <div className="relative ml-auto">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (notifications.some((n) => !n.is_read)) markNotificationsRead();
                }}
                className="relative p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition border border-slate-200"
                title="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.some((n) => !n.is_read) && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ff5500] rounded-full border-2 border-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-bold text-[#0c2340] text-xs uppercase tracking-wider flex justify-between items-center font-display">
                    <span>Notifications</span>
                    <span className="text-[10px] text-slate-400 font-mono">{notifications.length} total</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">No new notifications.</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-3.5 text-xs ${n.is_read ? 'opacity-60 text-slate-500' : 'bg-orange-50/50 text-[#0c2340]'}`}>
                          <div className="font-bold text-[#0c2340]">{n.title}</div>
                          <div className="text-slate-500 mt-1">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-stretch sm:self-auto">
            <button
              onClick={() => { setActiveTab('explore'); setSelectedSlot(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 font-display ${
                activeTab === 'explore' ? 'bg-[#ff5500] text-white shadow-sm' : 'text-slate-600 hover:text-[#0c2340]'
              }`}
            >
              <span>🔍</span> Find Trainers
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 font-display ${
                activeTab === 'bookings' ? 'bg-[#ff5500] text-white shadow-sm' : 'text-slate-600 hover:text-[#0c2340]'
              }`}
            >
              <span>📅</span> My Sessions ({myBookings.length})
            </button>
          </div>
        </header>

        {/* TAB 1: SEARCH & BOOK TRAINERS */}
        {activeTab === 'explore' && (
          <div className="space-y-6">
            {selectedSlot ? (
              <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm max-w-2xl mx-auto space-y-6">
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="text-xs font-bold text-[#ff5500] hover:text-[#ea4c00] flex items-center gap-1 font-display"
                >
                  &larr; Back to Trainers
                </button>

                <div>
                  <span className="bg-orange-50 border border-orange-200 text-[#ff5500] px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-display">
                    Confirm Booking
                  </span>
                  <h2 className="text-2xl font-black text-[#0c2340] mt-2 font-display">Reserve Training Session</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Booking with <strong className="text-[#0c2340]">{selectedSlot.professional_name}</strong> on{' '}
                    <strong className="text-[#0c2340]">{selectedSlot.date}</strong> at{' '}
                    <strong className="text-[#0c2340]">
                      {(selectedSlot.start_time || '00:00').substring(0, 5)} - {(selectedSlot.end_time || '00:00').substring(0, 5)}
                    </strong>.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-500 block">Session Fee</span>
                    <span className="text-xl font-black text-emerald-600 font-display">₹{selectedSlot.price}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Format</span>
                    <span className="text-[#0c2340] font-bold">{selectedSlot.session_type} Session</span>
                  </div>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      Your Goal for this Session *
                    </label>
                    <input
                      type="text"
                      name="current_goal"
                      value={bookingForm.current_goal}
                      onChange={(e) => setBookingForm({ ...bookingForm, current_goal: e.target.value })}
                      placeholder="e.g. Batting technique, strength conditioning, or recovery"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-[#0c2340] focus:outline-none focus:border-[#ff5500] focus:bg-white transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      Past Injuries or Notes (Optional)
                    </label>
                    <textarea
                      name="past_injury"
                      value={bookingForm.past_injury}
                      onChange={(e) => setBookingForm({ ...bookingForm, past_injury: e.target.value })}
                      rows="3"
                      placeholder="Shared with your trainer before the session..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-[#0c2340] focus:outline-none focus:border-[#ff5500] focus:bg-white transition"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-[#ff5500] hover:bg-[#ea4c00] text-white font-black py-3.5 rounded-lg text-xs transition shadow-md shadow-[#ff5500]/25 font-display"
                    >
                      Proceed to Secure Payment (₹{selectedSlot.price})
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const response = await api.post('conversations/', { professional_id: selectedSlot.professional });
                          navigate(`/chat?conversationId=${response.data.id}`);
                        } catch {
                          addToast('Could not start chat session with trainer.', 'error');
                        }
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-[#0c2340] font-bold px-6 py-3.5 rounded-lg text-xs transition border border-slate-200 font-display"
                    >
                      Message Trainer
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <CoachSearchFeed slots={slots} onSelectSlot={setSelectedSlot} />
            )}
          </div>
        )}

        {/* TAB 2: MY BOOKED SESSIONS */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-[#0c2340] font-display">Your Scheduled Sessions</h2>
                <p className="text-xs text-slate-500">Upcoming online and in-person training bookings</p>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                {myBookings.length} Total Bookings
              </span>
            </div>

            {myBookings.length === 0 ? (
              <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center text-slate-500 text-xs shadow-sm">
                You haven&apos;t scheduled any sessions yet. Browse trainers to book your first session!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myBookings.map((booking) => {
                  const slot = booking.slot_details || {};
                  const date = slot.date || booking.date || 'TBD';
                  const startTime = (slot.start_time || booking.start_time || '00:00').substring(0, 5);
                  const endTime = (slot.end_time || booking.end_time || '00:00').substring(0, 5);
                  const sessionType = slot.session_type || booking.session_type || '1-on-1';
                  const coachName = slot.professional_name || 'Assigned Trainer';
                  const isCancelled = slot.is_cancelled || false;

                  return (
                    <div key={booking.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-extrabold text-base text-[#0c2340] font-display">{coachName}</h3>
                            <p className="text-xs text-[#ff5500] font-bold">{sessionType} Session</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            booking.payment_status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            booking.payment_status === 'REFUNDED' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {isCancelled ? 'CANCELLED' : booking.payment_status}
                          </span>
                        </div>

                        <div className="text-xs space-y-2 mb-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                          <div className="flex justify-between text-slate-600">
                            <span>Date:</span>
                            <span className={isCancelled ? 'line-through text-slate-400' : 'font-bold text-[#0c2340]'}>📅 {date}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Time:</span>
                            <span className={isCancelled ? 'line-through text-slate-400' : 'font-bold text-[#0c2340]'}>⏰ {startTime} - {endTime}</span>
                          </div>
                          <div className="pt-2 border-t border-slate-200">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Session Goal</span>
                            <p className="text-slate-700 italic">{booking.current_goal || 'General Coaching Session'}</p>
                          </div>
                        </div>
                      </div>

                      {booking.payment_status === 'PAID' && !isCancelled && (
                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          {sessionType === 'ONLINE' ? (
                            <button
                              onClick={() => {
                                const link = slot.meeting_link_or_address || booking.meeting_link_or_address;
                                if (link) window.open(link, '_blank');
                                else addToast('Your trainer has not posted the meeting link yet. Please check back before session time.', 'info');
                              }}
                              className="w-full bg-[#ff5500] hover:bg-[#ea4c00] text-white font-bold py-2 rounded-lg text-xs transition shadow-sm font-display min-h-[40px]"
                            >
                              🎥 Join Live Online Session
                            </button>
                          ) : (
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                              📍 <strong>Venue:</strong> {booking.meeting_link_or_address || 'Trainer will update location.'}
                            </div>
                          )}

                          {!booking.has_reviewed ? (
                            <button
                              onClick={() => {
                                setSelectedBookingForReview(booking);
                                setReviewModalOpen(true);
                              }}
                              className="w-full bg-white hover:bg-slate-50 text-amber-600 font-bold py-2 rounded-lg text-xs transition border border-slate-200 font-display"
                            >
                              ⭐ Leave Booking Review
                            </button>
                          ) : (
                            <div className="w-full bg-slate-50 text-slate-400 font-bold py-2 rounded-lg text-[11px] text-center border border-slate-200">
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

        {/* REVIEW MODAL */}
        {reviewModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
              <h3 className="text-base font-black text-[#0c2340] mb-1 font-display">Rate Your Booking Experience</h3>
              <p className="text-xs text-slate-500 mb-4">
                Leave feedback for {selectedBookingForReview?.slot_details?.professional_name || 'your trainer'}
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">Rating</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[#0c2340] focus:outline-none focus:border-[#ff5500] font-semibold"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ - Exceptional Session</option>
                    <option value="4">⭐⭐⭐⭐ - Good Session</option>
                    <option value="3">⭐⭐⭐ - Average</option>
                    <option value="2">⭐⭐ - Below Expectation</option>
                    <option value="1">⭐ - Unsatisfactory</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">Written Feedback</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    rows="3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[#0c2340] focus:outline-none focus:border-[#ff5500]"
                    placeholder="Share how your booking and coaching session went..."
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="bg-slate-100 text-slate-600 font-bold px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#ff5500] hover:bg-[#ea4c00] text-white font-bold px-5 py-2 rounded-lg shadow-sm font-display"
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
