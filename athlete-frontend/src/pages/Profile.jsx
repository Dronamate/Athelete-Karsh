// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Profile() {
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
        role: data.role || '',
        dob: data.dob || ap.date_of_birth || '',
        blood_type: data.blood_type || '',
        // Athlete profile
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
        // Coach profile
        academy_name: pp.academy_name || '',
        specialty_name: pp.speciality?.name || 'Cricket Specialist',
        session_price: pp.session_price || '',
        address: pp.address || '',
        is_certified: pp.is_certified || false
      });
      
      let avatarUrl = data.avatar;
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        const mediaBaseUrl = import.meta.env.VITE_MEDIA_BASE_URL || 'http://127.0.0.1:8000';
        avatarUrl = `${mediaBaseUrl}${avatarUrl}`;
      }
      setAvatarPreview(avatarUrl || null);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (formData.role === 'PROFESSIONAL') {
      const fields = ['first_name', 'last_name', 'email', 'academy_name', 'session_price', 'address'];
      let filled = 0;
      fields.forEach(f => { if (formData[f]) filled++; });
      if (avatarPreview || selectedFile) filled++; 
      return Math.min(100, Math.round((filled / 7) * 100));
    }
    const fields = ['first_name', 'last_name', 'email', 'playing_role', 'club_name', 'batting_hand', 'preferred_position'];
    let filled = 0;
    fields.forEach(f => { if (formData[f]) filled++; });
    if (avatarPreview || selectedFile) filled++; 
    return Math.min(100, Math.round((filled / 8) * 100));
  };

  const progress = calculateProgress();

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
      
      setSuccessMsg('Profile details updated successfully!');
      setSelectedFile(null);
      fetchProfile();
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password1 !== passwordData.new_password2) {
      return setErrorMsg("New passwords do not match!");
    }
    try {
      await api.post('auth/password/change/', passwordData);
      setSuccessMsg('Password updated securely!');
      setPasswordData({ old_password: '', new_password1: '', new_password2: '' });
    } catch (error) {
      setErrorMsg(error.response?.data?.old_password?.[0] || 'Failed to update password.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Profile...</div>;

  const isAthlete = formData.role === 'ATHLETE';
  const isCoach = formData.role === 'PROFESSIONAL';
  const isAdmin = formData.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 selection:bg-orange-500 selection:text-slate-900">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Left Side: Avatar Card */}
        <div className="w-full md:w-1/3 bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col items-center h-fit">
          <div className="relative mb-4 group cursor-pointer">
            <div className="w-36 h-36 rounded-2xl overflow-hidden border-4 border-slate-800 bg-slate-800 shadow-xl flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-4xl">
                  <span>{isCoach ? '🏏' : isAthlete ? '⚡' : '🛡️'}</span>
                  <span className="text-xs text-slate-400 mt-2 font-semibold">Upload Photo</span>
                </div>
              )}
            </div>
            <input type="file" id="avatarUpload" accept="image/*" className="hidden" onChange={handleFileChange} />
            <label htmlFor="avatarUpload" className="absolute -bottom-2 -right-2 bg-orange-500 text-white p-2.5 rounded-xl shadow-lg cursor-pointer hover:bg-orange-600 transition">
              📷
            </label>
          </div>
          
          <h2 className="text-xl font-bold text-white text-center">
            {formData.first_name || (isCoach ? 'Coach' : 'Athlete')} {formData.last_name}
          </h2>

          <div className="flex items-center gap-2 mt-1 mb-4 flex-wrap justify-center">
            <span className="bg-orange-500/10 border border-orange-500/30 text-orange-400 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
              {isCoach ? 'Certified Coach' : isAthlete ? (formData.playing_role || 'Batsman') : 'Administrator'}
            </span>
            {isAthlete && formData.club_name && (
              <span className="bg-slate-800 text-slate-400 text-xs px-2.5 py-0.5 rounded-full font-medium">
                {formData.club_name}
              </span>
            )}
            {isCoach && formData.academy_name && (
              <span className="bg-slate-800 text-slate-400 text-xs px-2.5 py-0.5 rounded-full font-medium">
                {formData.academy_name}
              </span>
            )}
          </div>

          {/* Role-Specific Summary Card */}
          {isAthlete && (
            <div className="w-full bg-slate-800/60 p-4 rounded-xl border border-slate-800 mt-2 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Primary Role</span>
                <span className="font-semibold text-white">{formData.playing_role}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Secondary Role</span>
                <span className="font-semibold text-white">{formData.secondary_role || 'None'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Batting Hand</span>
                <span className="font-semibold text-white">{formData.batting_hand}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Position</span>
                <span className="font-semibold text-white">{formData.preferred_position}</span>
              </div>
            </div>
          )}

          {isCoach && (
            <div className="w-full bg-slate-800/60 p-4 rounded-xl border border-slate-800 mt-2 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Specialization</span>
                <span className="font-semibold text-orange-400">{formData.specialty_name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Session Rate</span>
                <span className="font-semibold text-emerald-400">₹{formData.session_price || '1,000'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status</span>
                <span className="font-semibold text-white">✓ Verified Coach</span>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="w-full bg-slate-800/60 p-4 rounded-xl border border-slate-800 mt-2 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Permissions</span>
                <span className="font-semibold text-white">Full Superuser</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Panel</span>
                <span className="font-semibold text-orange-400">Control Center</span>
              </div>
            </div>
          )}

          <div className="w-full mt-6">
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
              <span>Profile Completion</span>
              <span className="text-orange-400">{progress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Tabs */}
        <div className="w-full md:w-2/3 bg-slate-900 p-6 md:p-8 rounded-2xl shadow-lg border border-slate-800">
          <div className="flex border-b border-slate-800 mb-6 space-x-6">
            <button 
              className={`pb-3 font-bold transition text-sm ${activeTab === 'details' ? 'border-b-2 border-orange-500 text-orange-400' : 'text-slate-400 hover:text-slate-200'}`}
              onClick={() => { setActiveTab('details'); setSuccessMsg(''); setErrorMsg(''); }}
            >
              {isCoach ? 'Coach Information' : isAthlete ? 'Athlete Information' : 'Admin Details'}
            </button>
            <button 
              className={`pb-3 font-bold transition text-sm ${activeTab === 'security' ? 'border-b-2 border-orange-500 text-orange-400' : 'text-slate-400 hover:text-slate-200'}`}
              onClick={() => { setActiveTab('security'); setSuccessMsg(''); setErrorMsg(''); }}
            >
              Security & Password
            </button>
          </div>

          {successMsg && <div className="mb-6 p-4 bg-emerald-500/10 text-emerald-400 rounded-xl font-medium border border-emerald-500/20 text-sm">✓ {successMsg}</div>}
          {errorMsg && <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-xl font-medium border border-red-500/20 text-sm">⚠ {errorMsg}</div>}

          {activeTab === 'details' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              
              {/* Common Section: Basic Identity */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">1. Personal Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleProfileChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleProfileChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleProfileChange} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none text-sm" />
                  </div>
                </div>
              </div>

              {/* ATHLETE SPECIFIC SECTIONS */}
              {isAthlete && (
                <>
                  {/* Physical & Age */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">2. Physical Attributes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Age</label>
                        <input type="number" name="age" value={formData.age} onChange={handleProfileChange} placeholder="e.g. 21" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Height</label>
                        <input type="text" name="height" value={formData.height} onChange={handleProfileChange} placeholder="e.g. 178 cm" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Weight</label>
                        <input type="text" name="weight" value={formData.weight} onChange={handleProfileChange} placeholder="e.g. 74 kg" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Cricket Batsman Specialization */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">3. Cricket Profile (Batsman Focus)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Club / Academy Name</label>
                        <input type="text" name="club_name" value={formData.club_name} onChange={handleProfileChange} placeholder="e.g. Shivaji Park Gymkhana" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm" />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Role</label>
                        <select name="playing_role" value={formData.playing_role} onChange={handleProfileChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm">
                          <option value="Batsman">Batsman</option>
                          <option value="Wicket-keeper Batsman">Wicket-keeper Batsman</option>
                          <option value="All-rounder">All-rounder (Batting focus)</option>
                          <option value="Bowler">Bowler</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Secondary Role</label>
                        <select name="secondary_role" value={formData.secondary_role} onChange={handleProfileChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm">
                          <option value="Bowler">Bowler</option>
                          <option value="Wicket-keeper">Wicket-keeper</option>
                          <option value="All-rounder">All-rounder</option>
                          <option value="None">None (Pure Batsman)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Batting Hand</label>
                        <select name="batting_hand" value={formData.batting_hand} onChange={handleProfileChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm">
                          <option value="Right-hand bat">Right-hand bat</option>
                          <option value="Left-hand bat">Left-hand bat</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Playing Position</label>
                        <select name="preferred_position" value={formData.preferred_position} onChange={handleProfileChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm">
                          <option value="Top-Order Batsman">Top-Order Batsman (No. 1-3)</option>
                          <option value="Opening Batsman">Opening Batsman (No. 1-2)</option>
                          <option value="Middle-Order Batsman">Middle-Order Batsman (No. 4-5)</option>
                          <option value="Finisher / Lower-Order">Finisher / Lower-Order (No. 6-7)</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Bowling Style</label>
                        <input type="text" name="bowling_style" value={formData.bowling_style} onChange={handleProfileChange} placeholder="e.g. Right-arm medium fast" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* COACH / PROFESSIONAL SPECIFIC SECTIONS */}
              {isCoach && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">2. Coaching Credentials & Academy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Academy / Organization Name</label>
                      <input type="text" name="academy_name" value={formData.academy_name} onChange={handleProfileChange} placeholder="e.g. National Cricket Academy" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm" />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Session Rate (₹ INR)</label>
                      <input type="number" name="session_price" value={formData.session_price} onChange={handleProfileChange} placeholder="e.g. 1500" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Training Ground / Net Facility Address</label>
                      <input type="text" name="address" value={formData.address} onChange={handleProfileChange} placeholder="e.g. Chinnaswamy Stadium Complex, Gate 3 Nets" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleProfileChange} placeholder="e.g. Mumbai" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleProfileChange} placeholder="e.g. Maharashtra" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm" />
                </div>
              </div>

              <button type="submit" className="w-full bg-orange-500 text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition shadow-lg shadow-orange-500/20 text-sm">
                Save Profile Details
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                <input type="password" name="old_password" value={passwordData.old_password} onChange={handlePasswordChange} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                <input type="password" name="new_password1" value={passwordData.new_password1} onChange={handlePasswordChange} required minLength="8" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                <input type="password" name="new_password2" value={passwordData.new_password2} onChange={handlePasswordChange} required minLength="8" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm" />
              </div>
              <button type="submit" className="w-full bg-slate-800 text-white font-bold py-3.5 rounded-xl hover:bg-slate-700 transition border border-slate-700 text-sm">
                Update Password
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
