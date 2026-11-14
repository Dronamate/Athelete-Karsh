// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../components/Toast';

const INPUT_CLASS =
  'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#0c2340] focus:outline-none focus:border-[#ff5500] focus:bg-white text-xs sm:text-sm transition';

export default function Profile() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    dob: '',
    blood_type: '',
    // Athlete fields
    age: '',
    city: '',
    state: '',
    primary_sport: 'Cricket',
    playing_role: 'Batsman',
    secondary_role: 'Bowler',
    club_name: '',
    height: '',
    weight: '',
    batting_hand: 'Right-hand bat',
    bowling_style: 'Right-arm medium fast',
    preferred_position: 'Top-Order Batsman',
    // Coach / Professional fields
    academy_name: '',
    specialty_name: '',
    session_price: '',
    address: '',
    is_certified: false
  });
  
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [passwordData, setPasswordData] = useState({
    old_password: '', new_password1: '', new_password2: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('profile/');
      const data = response.data;
      const ap = data.athlete_profile || {};
      const pp = data.professional_profile || {};

      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        role: data.role || 'ATHLETE',
        dob: ap.dob || '',
        blood_type: ap.blood_type || '',
        age: ap.age || '',
        city: ap.city || '',
        state: ap.state || '',
        primary_sport: ap.primary_sport || 'Cricket',
        playing_role: ap.playing_role || 'Batsman',
        secondary_role: ap.secondary_role || 'Bowler',
        club_name: ap.club_name || '',
        height: ap.height || '',
        weight: ap.weight || '',
        batting_hand: ap.batting_hand || 'Right-hand bat',
        bowling_style: ap.bowling_style || 'Right-arm medium fast',
        preferred_position: ap.preferred_position || 'Top-Order Batsman',
        academy_name: pp.institution_club || pp.academy_name || '',
        specialty_name: pp.speciality?.name || '',
        session_price: pp.charges_per_session || pp.session_price || '',
        address: pp.address || '',
        is_certified: pp.is_certified || false
      });

      if (data.avatar) {
        setAvatarPreview(data.avatar);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setErrorMsg('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('first_name', formData.first_name);
      submitData.append('last_name', formData.last_name);
      submitData.append('email', formData.email);
      if (formData.dob) submitData.append('dob', formData.dob);
      if (formData.blood_type) submitData.append('blood_type', formData.blood_type);
      if (selectedFile) submitData.append('avatar', selectedFile);

      if (formData.role === 'ATHLETE') {
        if (formData.age) submitData.append('age', formData.age);
        if (formData.city) submitData.append('city', formData.city);
        if (formData.state) submitData.append('state', formData.state);
        submitData.append('primary_sport', formData.primary_sport);
        submitData.append('playing_role', formData.playing_role);
        submitData.append('secondary_role', formData.secondary_role);
        submitData.append('club_name', formData.club_name);
        submitData.append('height', formData.height);
        submitData.append('weight', formData.weight);
        submitData.append('batting_hand', formData.batting_hand);
        submitData.append('bowling_style', formData.bowling_style);
        submitData.append('preferred_position', formData.preferred_position);
      }

      if (formData.role === 'PROFESSIONAL') {
        if (formData.academy_name) submitData.append('academy_name', formData.academy_name);
        if (formData.session_price) submitData.append('session_price', formData.session_price);
        if (formData.address) submitData.append('address', formData.address);
      }

      await api.patch('profile/', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccessMsg('Profile details successfully updated!');
      addToast('Profile details successfully updated!', 'success');
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      const msg = 'Failed to update profile. Please check inputs.';
      setErrorMsg(msg);
      addToast(msg, 'error');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password1 !== passwordData.new_password2) {
      const msg = 'New passwords do not match.';
      setErrorMsg(msg);
      addToast(msg, 'error');
      return;
    }

    try {
      await api.post('auth/password/change/', {
        old_password: passwordData.old_password,
        new_password1: passwordData.new_password1,
        new_password2: passwordData.new_password2
      });
      setSuccessMsg('Password updated successfully!');
      addToast('Password updated successfully!', 'success');
      setPasswordData({ old_password: '', new_password1: '', new_password2: '' });
    } catch (error) {
      const msg = error.response?.data?.old_password?.[0] || 'Failed to update password.';
      setErrorMsg(msg);
      addToast(msg, 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8ff] text-[#0c2340] flex flex-col items-center justify-center font-sans">
        <div className="w-8 h-8 border-4 border-[#ff5500] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-bold tracking-wider uppercase text-slate-500 font-display">Loading Profile...</p>
      </div>
    );
  }

  const isAthlete = formData.role === 'ATHLETE';
  const isCoach = formData.role === 'PROFESSIONAL';
  const isAdmin = formData.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#0c2340] p-4 md:p-8 selection:bg-[#ff5500] selection:text-white font-sans overflow-x-hidden w-full max-w-[100vw]">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Left Side: Avatar Card */}
        <div className="w-full md:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center h-fit">
          <div className="relative mb-4 group cursor-pointer">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-sm flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-3xl">
                  <span>{isCoach ? '🏏' : isAthlete ? '⚡' : '🛡️'}</span>
                  <span className="text-[10px] text-slate-500 mt-1 font-bold">Upload Photo</span>
                </div>
              )}
            </div>
            <input type="file" id="avatarUpload" accept="image/*" className="hidden" onChange={handleFileChange} />
            <label htmlFor="avatarUpload" className="absolute -bottom-1 -right-1 bg-[#ff5500] text-white p-2 rounded-xl shadow-md cursor-pointer hover:bg-[#ea4c00] transition">
              📷
            </label>
          </div>
          
          <h2 className="text-lg font-black text-[#0c2340] text-center font-display">
            {formData.first_name || (isCoach ? 'Coach' : 'Athlete')} {formData.last_name}
          </h2>

          <div className="flex items-center gap-2 mt-1 mb-4 flex-wrap justify-center">
            <span className="bg-orange-50 border border-orange-200 text-[#ff5500] px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-display">
              {isCoach ? 'Certified Coach' : isAthlete ? (formData.playing_role || 'Athlete') : 'Administrator'}
            </span>
            {isAthlete && formData.club_name && (
              <span className="bg-slate-100 text-slate-600 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                {formData.club_name}
              </span>
            )}
            {isCoach && formData.academy_name && (
              <span className="bg-slate-100 text-slate-600 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                {formData.academy_name}
              </span>
            )}
          </div>

          <div className="w-full bg-slate-50 p-3.5 rounded-xl border border-slate-200 mt-2 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Account Status</span>
              <span className="font-bold text-emerald-600">Active</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Access Level</span>
              <span className="font-bold text-[#0c2340]">{formData.role}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Tabs */}
        <div className="w-full md:w-2/3 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex border-b border-slate-200 space-x-6 pb-2">
            <button 
              className={`pb-2 font-bold transition text-xs sm:text-sm font-display ${activeTab === 'details' ? 'border-b-2 border-[#ff5500] text-[#ff5500]' : 'text-slate-500 hover:text-[#0c2340]'}`}
              onClick={() => { setActiveTab('details'); setSuccessMsg(''); setErrorMsg(''); }}
            >
              {isCoach ? 'Coach Information' : isAthlete ? 'Athlete Information' : 'Admin Details'}
            </button>
            <button 
              className={`pb-2 font-bold transition text-xs sm:text-sm font-display ${activeTab === 'security' ? 'border-b-2 border-[#ff5500] text-[#ff5500]' : 'text-slate-500 hover:text-[#0c2340]'}`}
              onClick={() => { setActiveTab('security'); setSuccessMsg(''); setErrorMsg(''); }}
            >
              Security &amp; Password
            </button>
          </div>

          {successMsg && <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200">✓ {successMsg}</div>}
          {errorMsg && <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs font-semibold border border-red-200">⚠ {errorMsg}</div>}

          {activeTab === 'details' && (
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-display">1. Personal Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">First Name</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleProfileChange} className={INPUT_CLASS} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">Last Name</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleProfileChange} className={INPUT_CLASS} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleProfileChange} className={INPUT_CLASS} />
                  </div>
                </div>
              </div>

              {isAthlete && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-display">2. Athletic Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">Age</label>
                      <input type="number" name="age" value={formData.age} onChange={handleProfileChange} placeholder="e.g. 21" className={INPUT_CLASS} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">City</label>
                      <input type="text" name="city" value={formData.city} onChange={handleProfileChange} placeholder="e.g. Bengaluru" className={INPUT_CLASS} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">Club / Facility</label>
                      <input type="text" name="club_name" value={formData.club_name} onChange={handleProfileChange} placeholder="Club Name" className={INPUT_CLASS} />
                    </div>
                  </div>
                </div>
              )}

              {isCoach && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-display">2. Professional Practice</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">Academy / Institution</label>
                      <input type="text" name="academy_name" value={formData.academy_name} onChange={handleProfileChange} placeholder="Karnataka State Cricket Academy" className={INPUT_CLASS} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">Charges per Session (INR)</label>
                      <input type="number" name="session_price" value={formData.session_price} onChange={handleProfileChange} placeholder="1500" className={INPUT_CLASS} />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button type="submit" className="bg-[#ff5500] hover:bg-[#ea4c00] text-white font-bold px-6 py-2.5 rounded-lg text-xs transition shadow-sm font-display">
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">Current Password</label>
                <input type="password" name="old_password" value={passwordData.old_password} onChange={handlePasswordChange} required className={INPUT_CLASS} />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">New Password</label>
                <input type="password" name="new_password1" value={passwordData.new_password1} onChange={handlePasswordChange} required className={INPUT_CLASS} />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0c2340] mb-1 font-display">Confirm New Password</label>
                <input type="password" name="new_password2" value={passwordData.new_password2} onChange={handlePasswordChange} required className={INPUT_CLASS} />
              </div>
              <button type="submit" className="bg-[#ff5500] hover:bg-[#ea4c00] text-white font-bold px-6 py-2.5 rounded-lg text-xs transition shadow-sm font-display">
                Update Password
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
