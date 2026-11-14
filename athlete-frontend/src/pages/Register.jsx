import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { SEARCH_CATEGORIES, persistAuthSession } from '../constants/taxonomy';
import { useToast } from '../components/Toast';

const INPUT_CLASS =
  'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-[#0c2340] rounded-lg focus:outline-none focus:border-[#ff5500] focus:bg-white text-xs sm:text-sm transition placeholder-slate-400';

function formatApiError(err) {
  const data = err.response?.data;
  if (!data) return 'Registration failed. Please check your inputs.';
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  const firstKey = Object.keys(data)[0];
  const val = data[firstKey];
  return `${firstKey}: ${Array.isArray(val) ? val[0] : val}`;
}

export default function Register({ initialRole = null }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [roleType, setRoleType] = useState(initialRole || 'ATHLETE'); // 'ATHLETE' | 'COACH'
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [telemetryActive, setTelemetryActive] = useState(true);

  const [athleteForm, setAthleteForm] = useState({
    name: '',
    mobile_number: '',
    email: '',
    password: '',
    age: '',
    profession: '',
    address: '',
    pincode: '',
    additional_details: '',
  });

  const [coachForm, setCoachForm] = useState({
    name: '',
    mobile_number: '',
    email: '',
    password: '',
    institution_club: '',
    expertise: ['Cricket (Batting and bowling)'],
    is_certified: false,
    is_available: true,
    training_mode: 'Both',
    charges_per_session: '',
    address: '',
    pincode: '',
    additional_details: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const selectRole = (role) => {
    setRoleType(role);
    setError('');
    navigate(role === 'ATHLETE' ? '/register/athlete' : '/register/coach');
  };

  const toggleExpertise = (cat) => {
    setCoachForm((prev) => {
      const exists = prev.expertise.includes(cat);
      const next = exists ? prev.expertise.filter((c) => c !== cat) : [...prev.expertise, cat];
      return { ...prev, expertise: next };
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAthleteSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('auth/register/athlete/', {
        ...athleteForm,
        age: parseInt(athleteForm.age, 10),
      });
      persistAuthSession(res.data);
      addToast('Athlete registration successful! Welcome to DronaMate.', 'success');
      navigate('/');
    } catch (err) {
      const msg = formatApiError(err);
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCoachSubmit = async (e) => {
    e.preventDefault();
    if (coachForm.expertise.length === 0) {
      const msg = 'Please select at least one expertise category.';
      setError(msg);
      addToast(msg, 'error');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('name', coachForm.name);
      fd.append('mobile_number', coachForm.mobile_number);
      fd.append('email', coachForm.email);
      fd.append('password', coachForm.password);
      if (coachForm.institution_club) fd.append('institution_club', coachForm.institution_club);
      coachForm.expertise.forEach((item) => fd.append('expertise', item));
      fd.append('is_certified', String(coachForm.is_certified));
      fd.append('is_available', String(coachForm.is_available));
      fd.append('training_mode', coachForm.training_mode);
      fd.append('charges_per_session', coachForm.charges_per_session);
      fd.append('address', coachForm.address);
      fd.append('pincode', coachForm.pincode);
      if (coachForm.additional_details) fd.append('additional_details', coachForm.additional_details);
      if (photoFile) fd.append('profile_photo', photoFile);

      const res = await api.post('auth/register/coach/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      persistAuthSession(res.data);
      addToast('Coach application submitted successfully! Welcome to DronaMate.', 'success');
      navigate('/');
    } catch (err) {
      const msg = formatApiError(err);
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#0c2340] font-sans py-10 px-4 sm:px-6 lg:px-8 overflow-x-hidden w-full max-w-[100vw]">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* 1. TOP HEADER & TELEMETRY COUNTERS (matching Image 1) */}
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
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
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
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                  CERTIFIED STAFF
                </span>
                <span className="text-xs font-black text-[#0c2340] font-display">
                  98.4%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SEGMENTED NAVIGATION TABS (matching Image 1) */}
        <div className="inline-flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm gap-1 w-full sm:w-auto">
          <Link
            to="/login"
            className="flex-1 sm:flex-initial text-slate-600 hover:text-[#0c2340] font-bold text-xs px-5 py-2.5 rounded-lg transition flex items-center justify-center gap-2 font-display"
          >
            <span>🔒</span>
            <span>Unified Login</span>
          </Link>
          <button
            type="button"
            onClick={() => selectRole('ATHLETE')}
            className={`flex-1 sm:flex-initial font-bold text-xs px-5 py-2.5 rounded-lg transition flex items-center justify-center gap-2 font-display ${
              roleType === 'ATHLETE'
                ? 'bg-[#ff5500] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#0c2340]'
            }`}
          >
            <span>🏃</span>
            <span>Athlete Intake</span>
          </button>
          <button
            type="button"
            onClick={() => selectRole('COACH')}
            className={`flex-1 sm:flex-initial font-bold text-xs px-5 py-2.5 rounded-lg transition flex items-center justify-center gap-2 font-display ${
              roleType === 'COACH'
                ? 'bg-[#ff5500] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#0c2340]'
            }`}
          >
            <span>📋</span>
            <span>Coach Application</span>
          </button>
        </div>

        {/* 3. MAIN GRID (LEFT FORM + RIGHT TELEMETRY MODULE) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Form Card (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">

            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff5500] font-display block">
                {roleType === 'ATHLETE' ? 'INTAKE PROTOCOL • ATHLETE' : 'ACCREDITATION PROTOCOL • COACH / TRAINER'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#0c2340] tracking-tight font-display">
                {roleType === 'ATHLETE' ? 'Athlete Profile Onboarding' : 'Apply as a Coach / Trainer'}
              </h2>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}

            {/* ATHLETE REGISTRATION FORM */}
            {roleType === 'ATHLETE' && (
              <form onSubmit={handleAthleteSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={athleteForm.name}
                      onChange={(e) => setAthleteForm({ ...athleteForm, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={athleteForm.mobile_number}
                      onChange={(e) => setAthleteForm({ ...athleteForm, mobile_number: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={athleteForm.email}
                      onChange={(e) => setAthleteForm({ ...athleteForm, email: e.target.value })}
                      placeholder="rahul@example.com"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={athleteForm.password}
                      onChange={(e) => setAthleteForm({ ...athleteForm, password: e.target.value })}
                      placeholder="••••••••••••"
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      Age *
                    </label>
                    <input
                      type="number"
                      required
                      min="5"
                      max="100"
                      value={athleteForm.age}
                      onChange={(e) => setAthleteForm({ ...athleteForm, age: e.target.value })}
                      placeholder="e.g. 21"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      Profession *
                    </label>
                    <input
                      type="text"
                      required
                      value={athleteForm.profession}
                      onChange={(e) => setAthleteForm({ ...athleteForm, profession: e.target.value })}
                      placeholder="Student, Club Cricketer"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      value={athleteForm.pincode}
                      onChange={(e) => setAthleteForm({ ...athleteForm, pincode: e.target.value })}
                      placeholder="e.g. 560001"
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                    Address / Ground Facility Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={athleteForm.address}
                    onChange={(e) => setAthleteForm({ ...athleteForm, address: e.target.value })}
                    placeholder="Indiranagar, Bengaluru"
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                    Additional Details / Sporting Ambition (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={athleteForm.additional_details}
                    onChange={(e) => setAthleteForm({ ...athleteForm, additional_details: e.target.value })}
                    placeholder="Right-hand top order batsman preparing for district trials..."
                    className={INPUT_CLASS}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#ff5500] hover:bg-[#ea4c00] text-white font-black text-sm uppercase tracking-wider py-3.5 px-4 rounded-lg transition shadow-md shadow-[#ff5500]/25 flex items-center justify-center gap-2 font-display disabled:opacity-60"
                >
                  <span>{submitting ? 'Registering...' : 'Complete Athlete Intake'}</span>
                  <span>→</span>
                </button>
              </form>
            )}

            {/* COACH REGISTRATION FORM */}
            {roleType === 'COACH' && (
              <form onSubmit={handleCoachSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={coachForm.name}
                      onChange={(e) => setCoachForm({ ...coachForm, name: e.target.value })}
                      placeholder="e.g. Coach Devdutt Sharma"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={coachForm.mobile_number}
                      onChange={(e) => setCoachForm({ ...coachForm, mobile_number: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={coachForm.email}
                      onChange={(e) => setCoachForm({ ...coachForm, email: e.target.value })}
                      placeholder="coach@academy.in"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={coachForm.password}
                      onChange={(e) => setCoachForm({ ...coachForm, password: e.target.value })}
                      placeholder="••••••••••••"
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                    Institution / Club (Optional)
                  </label>
                  <input
                    type="text"
                    value={coachForm.institution_club}
                    onChange={(e) => setCoachForm({ ...coachForm, institution_club: e.target.value })}
                    placeholder="Karnataka State Cricket Academy, Bengaluru"
                    className={INPUT_CLASS}
                  />
                </div>

                {/* Expertise Categories */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-2 font-display">
                    Expertise / Disciplines * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SEARCH_CATEGORIES.map((cat) => {
                      const selected = coachForm.expertise.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleExpertise(cat)}
                          className={`text-left px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                            selected
                              ? 'bg-orange-50 border-[#ff5500] text-[#ff5500]'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {selected ? '✓ ' : '+ '} {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Training Mode & Charges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      Training Mode *
                    </label>
                    <select
                      value={coachForm.training_mode}
                      onChange={(e) => setCoachForm({ ...coachForm, training_mode: e.target.value })}
                      className={INPUT_CLASS}
                    >
                      <option value="Both">Both (Online &amp; Offline)</option>
                      <option value="Online">Online (Virtual Only)</option>
                      <option value="Offline">Offline (In-Person Only)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      Charges per Session (INR) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={coachForm.charges_per_session}
                      onChange={(e) => setCoachForm({ ...coachForm, charges_per_session: e.target.value })}
                      placeholder="e.g. 1500"
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                {/* Self Photo Upload Handler */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                    Self Profile Photo (Upload)
                  </label>
                  <div className="flex items-center gap-4">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Profile preview"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-lg">
                        📷
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0c2340] file:text-white hover:file:bg-slate-800"
                    />
                  </div>
                </div>

                {/* Certification & Availability */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={coachForm.is_certified}
                      onChange={(e) => setCoachForm({ ...coachForm, is_certified: e.target.checked })}
                      className="w-4 h-4 text-[#ff5500] border-slate-300 rounded focus:ring-[#ff5500]"
                    />
                    <span className="text-xs text-[#0c2340] font-semibold">
                      BCCI / Certified Trainer
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={coachForm.is_available}
                      onChange={(e) => setCoachForm({ ...coachForm, is_available: e.target.checked })}
                      className="w-4 h-4 text-emerald-500 border-slate-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-xs text-[#0c2340] font-semibold">
                      Available for Immediate Booking
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      Address / Operating Ground *
                    </label>
                    <input
                      type="text"
                      required
                      value={coachForm.address}
                      onChange={(e) => setCoachForm({ ...coachForm, address: e.target.value })}
                      placeholder="e.g. Ground 2, Wankhede Stadium"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      value={coachForm.pincode}
                      onChange={(e) => setCoachForm({ ...coachForm, pincode: e.target.value })}
                      placeholder="e.g. 400020"
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">
                    Additional Details / Coaching Accolades
                  </label>
                  <textarea
                    rows={2}
                    value={coachForm.additional_details}
                    onChange={(e) => setCoachForm({ ...coachForm, additional_details: e.target.value })}
                    placeholder="Former Ranji trophy player, specialized in seam release and power hitting..."
                    className={INPUT_CLASS}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#ff5500] hover:bg-[#ea4c00] text-white font-black text-sm uppercase tracking-wider py-3.5 px-4 rounded-lg transition shadow-md shadow-[#ff5500]/25 flex items-center justify-center gap-2 font-display disabled:opacity-60"
                >
                  <span>{submitting ? 'Submitting Application...' : 'Submit Coach Application'}</span>
                  <span>→</span>
                </button>
              </form>
            )}

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

          {/* Right Column: Telemetry Module & Preview Cards (5 cols) */}
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

              {/* Booking Engine Toggle Preview */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-emerald-600 text-base">⚡</span>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 font-display">
                      {telemetryActive ? 'Booking Engine Active' : 'Booking Engine Paused'}
                    </h4>
                    <p className="text-[10px] text-emerald-700">
                      {telemetryActive ? 'Accepting Instant On-Demand Slots' : 'Direct Booking Inactive'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = !telemetryActive;
                    setTelemetryActive(next);
                    addToast(next ? 'Booking engine activated for real-time reservations.' : 'Booking engine paused.', next ? 'success' : 'info');
                  }}
                  className={`inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out cursor-pointer ${
                    telemetryActive ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle Booking Engine"
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      telemetryActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Terminal Box */}
              <div className="bg-[#0c2340] text-slate-300 rounded-lg p-3 font-mono text-[11px] space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-700 pb-1 mb-1">
                  <span>DISPATCH STATUS</span>
                  <span className="text-emerald-400 font-bold">200 OK</span>
                </div>
                <div className="text-slate-300">
                  {`{ "status": "${telemetryActive ? 'ONLINE' : 'PAUSED'}", "network_nodes": 1420, "instant_booking": ${telemetryActive} }`}
                </div>
              </div>

              {/* Today's Reservation Rail */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-display">
                  <span>TODAY'S RESERVATION RAIL</span>
                  <span>IST TIME</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => addToast('06:00 AM Turf 01: Slot reserved for incoming intake members.', 'info')}
                    className="bg-[#ff5500] hover:bg-[#ea4c00] text-white p-2 rounded-lg text-center font-display transition cursor-pointer"
                  >
                    <div className="text-[10px] font-extrabold">06:00 AM</div>
                    <div className="text-[9px] opacity-80 uppercase tracking-wider">TURF 01</div>
                  </button>

                  <div className="bg-slate-100 text-slate-400 p-2 rounded-lg text-center font-display border border-slate-200">
                    <div className="text-[10px] font-bold line-through">08:30 AM</div>
                    <div className="text-[9px] uppercase tracking-wider">BOOKED</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => addToast('04:30 PM Turf 02: Slot reserved for incoming intake members.', 'info')}
                    className="bg-[#ff5500] hover:bg-[#ea4c00] text-white p-2 rounded-lg text-center font-display transition cursor-pointer"
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

                <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
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

              <div className="p-3 flex items-center justify-between text-[11px] font-semibold text-slate-600 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center gap-2">
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
    </div>
  );
}
