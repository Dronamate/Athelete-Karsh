import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../api';
import { persistAuthSession } from '../constants/taxonomy';
import { useToast } from '../components/Toast';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  setupInvisibleRecaptcha,
} from '../firebase';

export default function Login() {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [otpMobile, setOtpMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authMethod, setAuthMethod] = useState('password'); // 'password' | 'otp'
  const [keepActive, setKeepActive] = useState(true);
  const [bookingActive, setBookingActive] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');

  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();

  const normalizePhoneNumber = (phone) => {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.length === 10) return `+91${cleaned}`;
    if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
    return `+91${cleaned}`;
  };

  const handleFirebaseGoogleLogin = async () => {
    try {
      setSubmitting(true);
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const response = await api.post('auth/firebase/', { id_token: idToken });
      persistAuthSession(response.data);
      success(`Welcome back, ${result.user.displayName || response.data.user?.first_name || 'Athlete'}!`);
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        info('Google sign-in popup was closed.');
      } else {
        console.error('Firebase Auth Error:', err);
        const msg = err.response?.data?.error || err.message || 'Firebase Google Sign-In failed.';
        setError(msg);
        toastError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!otpMobile.trim()) return;

    setError('');
    setSubmitting(true);

    try {
      const formattedPhone = normalizePhoneNumber(otpMobile.trim());
      const appVerifier = setupInvisibleRecaptcha('recaptcha-container');
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      success(`One-Time Passcode (OTP) sent to ${formattedPhone}.`);
    } catch (err) {
      console.error('Phone OTP Dispatch Error:', err);
      let msg = 'Failed to dispatch SMS OTP.';
      if (err.code === 'auth/invalid-phone-number') {
        msg = 'Invalid phone number format. Please enter a valid 10-digit mobile number.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many requests sent. Please wait a few minutes and try again.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!confirmationResult || !otpCode.trim()) return;

    setError('');
    setSubmitting(true);

    try {
      const userCredential = await confirmationResult.confirm(otpCode.trim());
      const idToken = await userCredential.user.getIdToken();
      const response = await api.post('auth/firebase/', { id_token: idToken });
      persistAuthSession(response.data);
      success(`Welcome back, ${userCredential.user.displayName || response.data.user?.first_name || 'Athlete'}!`);
      navigate('/');
    } catch (err) {
      console.error('OTP Verification Error:', err);
      let msg = 'OTP verification failed.';
      if (err.code === 'auth/invalid-verification-code') {
        msg = 'Invalid verification code. Please check the code and try again.';
      } else if (err.code === 'auth/code-expired') {
        msg = 'This code has expired. Please request a new OTP.';
      } else if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (codeResponse) => {
    try {
      const response = await api.post('auth/google/', { code: codeResponse.code });
      persistAuthSession(response.data);
      success('Google Authentication successful! Welcome back.');
      navigate('/');
    } catch (err) {
      console.error('Google Auth Error:', err.response?.data);
      const msg = 'Google Sign-In was unsuccessful. Please use credentials.';
      setError(msg);
      toastError(msg);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      const msg = 'Google Sign-In was dismissed or unsuccessful.';
      setError(msg);
      toastError(msg);
    },
    flow: 'auth-code',
    scope: 'openid profile email https://www.googleapis.com/auth/calendar.events',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    localStorage.clear();

    try {
      const response = await api.post('auth/login/', formData);
      persistAuthSession(response.data);
      success(`Welcome back, ${response.data.name || 'Athlete'}!`);
      navigate('/');
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail[0] : detail || 'Invalid email/mobile number or password.';
      setError(msg);
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotInput.trim()) return;
    success(`Passcode recovery instructions have been sent to ${forgotInput}.`);
    setShowForgotModal(false);
    setForgotInput('');
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#0c2340] font-sans py-8 sm:py-12 px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* 1. TOP HEADER & TELEMETRY COUNTERS */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#ff5500] animate-pulse"></span>
              <span className="text-[11px] font-bold tracking-widest text-[#ff5500] uppercase font-display">
                DRONA MATE ACCESS PORTAL / NODE_AUTH.v4.8
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0c2340] tracking-tight font-display">
              HIGH-PERFORMANCE ROSTER
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-2 leading-relaxed">
              Precision sports mentorship ecosystem. Secure authentication, biometric-aligned athlete profiles, and verified BCCI/FIFA technical staff registration.
            </p>
          </div>

          {/* Top Right System Telemetry Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
              <span className="text-orange-500 text-lg">🚩</span>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider font-display">
                  PITCH NETWORK
                </span>
                <span className="text-xs font-black text-[#0c2340] font-display">
                  1,420 <span className="text-emerald-500 text-[10px] font-mono">ONLINE</span>
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
              <span className="text-blue-500 text-lg">🛡️</span>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider font-display">
                  CERTIFIED STAFF
                </span>
                <span className="text-xs font-black text-[#0c2340] font-display">
                  98.4%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SEGMENTED NAVIGATION TABS */}
        <div className="inline-flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm gap-1 w-full sm:w-auto">
          <button
            type="button"
            className="flex-1 sm:flex-initial bg-[#ff5500] text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2 font-display cursor-default min-h-[40px]"
          >
            <span>🔒</span>
            <span>Unified Login</span>
          </button>
          <Link
            to="/register/athlete"
            className="flex-1 sm:flex-initial text-slate-600 hover:text-[#0c2340] font-bold text-xs px-5 py-2.5 rounded-lg transition flex items-center justify-center gap-2 font-display min-h-[40px]"
          >
            <span>🏃</span>
            <span>Athlete Intake</span>
          </Link>
          <Link
            to="/register/coach"
            className="flex-1 sm:flex-initial text-slate-600 hover:text-[#0c2340] font-bold text-xs px-5 py-2.5 rounded-lg transition flex items-center justify-center gap-2 font-display min-h-[40px]"
          >
            <span>📋</span>
            <span>Coach Application</span>
          </Link>
        </div>

        {/* 3. MAIN GRID (LEFT FORM + RIGHT TELEMETRY MODULE) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Member Credentials Card */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-sm space-y-6">

            {/* Card Header with Password / Quick OTP Toggle */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff5500] font-display block">
                  AUTHENTICATION PROTOCOL
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#0c2340] tracking-tight font-display">
                  Member Credentials
                </h2>
              </div>

              {/* Password vs Quick OTP Pill */}
              <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center text-xs">
                <button
                  type="button"
                  onClick={() => setAuthMethod('password')}
                  className={`px-3 py-1 rounded-md font-bold transition cursor-pointer font-display ${
                    authMethod === 'password'
                      ? 'bg-white text-[#0c2340] shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('otp')}
                  className={`px-3 py-1 rounded-md font-bold transition cursor-pointer font-display ${
                    authMethod === 'otp'
                      ? 'bg-white text-[#0c2340] shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Quick OTP
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between">
                <span>⚠️ {error}</span>
                <button onClick={() => setError('')} className="text-xs font-bold text-red-400 hover:text-red-700">✕</button>
              </div>
            )}

            {/* Authentication Form */}
            {authMethod === 'password' ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Identity / Identifier */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#0c2340] font-display">
                      IDENTITY / IDENTIFIER
                    </label>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-display">
                      MOBILE OR EMAIL
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      ✉️
                    </span>
                    <input
                      type="text"
                      name="identifier"
                      value={formData.identifier}
                      onChange={handleChange}
                      placeholder="e.g. coach.sharma@apexcricket.in or +91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-[#0c2340] placeholder-slate-400 focus:outline-none focus:border-[#ff5500] focus:bg-white transition"
                      required
                    />
                  </div>
                </div>

                {/* Security Key / Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#0c2340] font-display">
                      SECURITY KEY / PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[10px] font-bold text-[#ff5500] hover:underline cursor-pointer font-display"
                    >
                      Forgot passcode?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      🔑
                    </span>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-[#0c2340] placeholder-slate-400 focus:outline-none focus:border-[#ff5500] focus:bg-white transition"
                      required
                    />
                  </div>
                </div>

                {/* Keep active checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="keepActive"
                    checked={keepActive}
                    onChange={(e) => setKeepActive(e.target.checked)}
                    className="w-4 h-4 text-[#ff5500] border-slate-300 rounded focus:ring-[#ff5500]"
                  />
                  <label htmlFor="keepActive" className="text-xs text-slate-600 font-medium select-none cursor-pointer">
                    Keep session active for 30 days
                  </label>
                </div>

                {/* Main Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#ff5500] hover:bg-[#ea4c00] text-white font-black text-sm uppercase tracking-wider py-3.5 px-4 rounded-lg transition shadow-md shadow-[#ff5500]/25 flex items-center justify-center gap-2 font-display cursor-pointer disabled:opacity-60 min-h-[44px]"
                >
                  <span>{submitting ? 'Authenticating...' : 'Enter Training Environment'}</span>
                  <span>→</span>
                </button>
              </form>
            ) : !otpSent ? (
              /* QUICK OTP FORM - DISPATCH */
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                    Registered Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      📱
                    </span>
                    <input
                      type="tel"
                      required
                      value={otpMobile}
                      onChange={(e) => setOtpMobile(e.target.value)}
                      placeholder="e.g. 98765 43210 or +91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-[#0c2340] focus:outline-none focus:border-[#ff5500] focus:bg-white transition"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    An SMS with a 6-digit verification code will be sent to this mobile number.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#ff5500] hover:bg-[#ea4c00] text-white font-black text-sm uppercase tracking-wider py-3.5 px-4 rounded-lg transition shadow-md shadow-[#ff5500]/25 font-display cursor-pointer disabled:opacity-60 min-h-[44px]"
                >
                  {submitting ? 'Transmitting Code...' : 'Send One-Time Passcode (OTP)'}
                </button>
              </form>
            ) : (
              /* QUICK OTP FORM - CONFIRM */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#0c2340] font-display">
                      Enter 6-Digit Passcode
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode('');
                        setError('');
                      }}
                      className="text-[10px] font-bold text-[#ff5500] hover:underline cursor-pointer font-display"
                    >
                      Change Number
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      💬
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm sm:text-base font-mono tracking-widest text-[#0c2340] focus:outline-none focus:border-[#ff5500] focus:bg-white transition text-center"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 text-center">
                    Code transmitted to <span className="font-semibold text-slate-700">{otpMobile}</span>
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={submitting || otpCode.trim().length < 6}
                  className="w-full bg-[#ff5500] hover:bg-[#ea4c00] text-white font-black text-sm uppercase tracking-wider py-3.5 px-4 rounded-lg transition shadow-md shadow-[#ff5500]/25 font-display cursor-pointer disabled:opacity-60 min-h-[44px]"
                >
                  {submitting ? 'Verifying OTP...' : 'Verify & Enter Portal →'}
                </button>
              </form>
            )}

            {/* Invisible Recaptcha container for Phone Auth */}
            <div id="recaptcha-container"></div>

            {/* Google OAuth Login via Firebase */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleFirebaseGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-[#0c2340] font-bold text-xs py-3 px-4 rounded-lg border border-slate-200 transition shadow-sm font-display cursor-pointer min-h-[44px]"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
                <span>Continue with Google Account</span>
              </button>
            </div>

            {/* Trust Footer */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-emerald-600 text-lg">🛡️</span>
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 font-display">
                    BCCI &amp; SAI AUDITED GATEWAY
                  </h4>
                  <p className="text-[10px] text-emerald-700">
                    Encrypted 256-bit TLS hardware session security
                  </p>
                </div>
              </div>
              <span className="bg-white border border-emerald-300 text-emerald-700 text-[10px] font-black uppercase px-2 py-0.5 rounded font-mono">
                ACTIVE
              </span>
            </div>

          </div>

          {/* Right Column: Telemetry Module & Preview Cards */}
          <div className="lg:col-span-5 space-y-6">

            {/* 1. Slot Telemetry Control Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h3 className="text-sm font-bold text-[#0c2340] font-display">
                    Slot Telemetry
                  </h3>
                </div>
                <span className="bg-slate-100 text-slate-600 font-mono text-[10px] px-2 py-0.5 rounded">
                  PUT /v1/slots
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Interactive control module used by certified coaches &amp; admins to modify instant booking access in real time.
              </p>

              {/* Booking Engine Toggle */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-emerald-600 text-base">⚡</span>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 font-display">
                      Booking Engine Active
                    </h4>
                    <p className="text-[10px] text-emerald-700">
                      Accepting Instant On-Demand Slots
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = !bookingActive;
                    setBookingActive(next);
                    if (next) success('Booking engine enabled: now accepting instant sessions.');
                    else info('Booking engine paused: new requests will be queued.');
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    bookingActive ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle booking engine"
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      bookingActive ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Terminal Box with real copy */}
              <div className="bg-[#0c2340] text-slate-300 rounded-lg p-3 font-mono text-[11px] space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-700 pb-1 mb-1">
                  <span>DISPATCH STATUS</span>
                  <span className="text-emerald-400 font-bold">200 OK</span>
                </div>
                <div className="text-slate-300 overflow-x-auto">
                  {`{ "status": "ONLINE", "network_nodes": 1420, "instant_booking": true }`}
                </div>
              </div>

              {/* Today's Reservation Rail */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-display">
                  <span>TODAY&apos;S RESERVATION RAIL</span>
                  <span>IST TIME</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => info('Session slot 06:00 AM at Turf 01 is currently open for booking.')}
                    className="bg-[#ff5500] text-white p-2 rounded-lg text-center font-display cursor-pointer hover:bg-[#ea4c00]"
                  >
                    <div className="text-[10px] font-extrabold">06:00 AM</div>
                    <div className="text-[9px] opacity-80 uppercase tracking-wider">TURF 01</div>
                  </button>

                  <button
                    type="button"
                    disabled
                    className="bg-slate-100 text-slate-400 p-2 rounded-lg text-center cursor-not-allowed font-display border border-slate-200"
                  >
                    <div className="text-[10px] font-bold line-through">08:30 AM</div>
                    <div className="text-[9px] uppercase tracking-wider">BOOKED</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => info('Session slot 04:30 PM at Turf 02 is currently open for booking.')}
                    className="bg-[#ff5500] text-white p-2 rounded-lg text-center font-display cursor-pointer hover:bg-[#ea4c00]"
                  >
                    <div className="text-[10px] font-extrabold">04:30 PM</div>
                    <div className="text-[9px] opacity-80 uppercase tracking-wider">TURF 02</div>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Coach Spotlight Preview Card */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="relative aspect-[16/9] bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Devdutt Padhi"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c2340]/90 via-[#0c2340]/30 to-transparent"></div>

                <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-display">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  HEAD COACH VERIFIED
                </div>

                <div className="absolute top-3 right-3 bg-white text-[#0c2340] px-2 py-0.5 rounded text-xs font-black font-display">
                  ₹3,500/hr
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-base font-display">Devdutt Padhi</h4>
                    <span className="text-[#ff5500]">✔</span>
                  </div>
                  <p className="text-[11px] text-slate-200">
                    BCCI Level 3 Specialist • High-Velocity Pace &amp; Bio-Mechanics
                  </p>
                </div>
              </div>

              <div className="p-3 flex items-center justify-between text-[11px] font-semibold text-slate-600 bg-slate-50 border-t border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px]">IPL MENTOR</span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px]">RADAR ANALYTICS</span>
                </div>
                <span className="text-amber-500 font-bold">★ 4.98 (312)</span>
              </div>
            </div>

            {/* 3. System Compliance Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider font-display">
                  SYSTEM COMPLIANCE
                </span>
                <h4 className="text-sm font-extrabold text-[#0c2340] font-display">
                  ISO-27001 &amp; SAI
                </h4>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <span>🔒</span> Zero Data Leak Shield
                </p>
              </div>

              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-[#ff5500] border-r-[#ff5500] flex items-center justify-center font-black text-xs text-[#0c2340] font-display">
                  94%
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* FORGOT PASSCODE MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-[#0c2340] space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#ff5500] uppercase tracking-wider font-display">Security Protocol</span>
                <h3 className="text-lg font-black font-display">Reset Your Passcode</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your registered mobile number or email address. We will transmit an encrypted verification link to reset your training passcode.
            </p>

            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <input
                type="text"
                required
                value={forgotInput}
                onChange={(e) => setForgotInput(e.target.value)}
                placeholder="Mobile number or Email address"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#0c2340] focus:outline-none focus:border-[#ff5500]"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="bg-slate-100 text-slate-600 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#ff5500] hover:bg-[#ea4c00] text-white font-bold px-4 py-2 rounded-lg text-xs font-display cursor-pointer"
                >
                  Send Recovery Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
