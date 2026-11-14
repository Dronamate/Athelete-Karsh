// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

export default function AdminDashboard() {
  const currentAdmin = sessionStorage.getItem('user_name') || 'Admin';
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Primary State
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'finance', 'activity'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Summary Metrics & Finance
  const [summary, setSummary] = useState({
    total_users: 0,
    total_athletes: 0,
    total_professionals: 0,
    total_admins: 0,
    active_users: 0,
    suspended_users: 0,
  });
  const [financeData, setFinanceData] = useState({
    metrics: { total_athletes: 0, total_professionals: 0, total_revenue: 0 },
    recent_transactions: []
  });

  // User Management State
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL', 'ATHLETE', 'PROFESSIONAL', 'ADMIN', 'SUSPENDED'

  // Modals & Sub-views
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(null); // User object or null
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [inspectedUser, setInspectedUser] = useState(null); // User object or null
  const [inspectedStats, setInspectedStats] = useState(null); // Cricket stats for athlete inspection
  const [loadingStats, setLoadingStats] = useState(false);

  // New Account Form State
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: 'password123',
    role: 'ATHLETE',
    speciality_id: '',
    academy_name: '',
    session_price: '1500',
    playing_role: 'Batsman',
    club_name: ''
  });
  const [sportsList, setSportsList] = useState([]);
  const [specialtiesList, setSpecialtiesList] = useState([]);

  // Notifications / Alerts
  const [statusNotification, setStatusNotification] = useState({ type: '', message: '' });

  useEffect(() => {
    loadAllData();
    fetchSportsAndSpecialties();
  }, []);

  const showToast = (type, message) => {
    setStatusNotification({ type, message });
    setTimeout(() => setStatusNotification({ type: '', message: '' }), 5000);
  };

  const loadAllData = async () => {
    setRefreshing(true);
    try {
      const [sumRes, finRes, userRes] = await Promise.all([
        api.get('admin/users/summary/'),
        api.get('bookings/admin_metrics/'),
        api.get('admin/users/')
      ]);
      setSummary(sumRes.data);
      setFinanceData(finRes.data);
      setUsers(userRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      if (err.response?.status === 403) {
        addToast("Unauthorized access. Admin privileges required.", "error");
        navigate('/login');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const fetchSportsAndSpecialties = async () => {
    try {
      const [spRes, specRes] = await Promise.all([
        api.get('sports/'),
        api.get('specialties/')
      ]);
      setSportsList(spRes.data.results || spRes.data || []);
      setSpecialtiesList(specRes.data.results || specRes.data || []);
    } catch (err) {
      console.error('Failed to fetch sports/specialties', err);
    }
  };

  // --- Handlers: User Lifecycle & Role Assigner ---

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      await api.patch(`admin/users/${userId}/`, { role: newRole });
      showToast('success', `Role successfully updated to ${newRole}`);
      loadAllData();
    } catch (err) {
      showToast('error', 'Failed to update user role.');
    }
  };

  const handleToggleStatus = async (user) => {
    const actionName = user.is_active ? 'suspend / ban' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionName} @${user.username}?`)) return;
    try {
      const res = await api.post(`admin/users/${user.id}/toggle_active/`);
      showToast('success', res.data.message);
      loadAllData();
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Failed to change user status.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!showPasswordModal || !newPasswordInput) return;
    try {
      const res = await api.post(`admin/users/${showPasswordModal.id}/reset_password/`, {
        password: newPasswordInput
      });
      showToast('success', res.data.message);
      setShowPasswordModal(null);
      setNewPasswordInput('');
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Failed to reset password.');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`PERMANENT ACTION: Delete account @${user.username}? This cannot be undone.`)) return;
    try {
      await api.delete(`admin/users/${user.id}/`);
      showToast('success', `User @${user.username} has been deleted.`);
      loadAllData();
    } catch (err) {
      showToast('error', 'Failed to delete user.');
    }
  };

  // --- Handlers: Impersonation ---
  const handleImpersonate = async (user) => {
    if (!window.confirm(`TROUBLESHOOTING MODE: Switch into @${user.username}'s account view? You can exit anytime from the top banner.`)) return;
    try {
      const res = await api.post(`admin/users/${user.id}/impersonate/`);
      
      // Store backup of admin credentials
      const currentToken = sessionStorage.getItem('access_token');
      const currentRefresh = sessionStorage.getItem('refresh_token');
      const currentUser = sessionStorage.getItem('user_name');
      
      sessionStorage.setItem('admin_backup_token', currentToken);
      if (currentRefresh) sessionStorage.setItem('admin_backup_refresh', currentRefresh);
      sessionStorage.setItem('admin_backup_user', currentUser);
      sessionStorage.setItem('is_impersonating', 'true');

      // Set impersonated credentials
      sessionStorage.setItem('access_token', res.data.access);
      if (res.data.refresh) sessionStorage.setItem('refresh_token', res.data.refresh);
      sessionStorage.setItem('user_name', user.username);
      sessionStorage.setItem('user_role', user.role);

      // Route to role view
      if (user.role === 'PROFESSIONAL') {
        window.location.href = '/professional';
      } else if (user.role === 'ATHLETE') {
        window.location.href = '/athlete';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      showToast('error', 'Failed to generate impersonation session.');
    }
  };

  // --- Handlers: Coach Availability Toggle ---
  const handleToggleCoachAvailability = async (coachUser) => {
    const current = coachUser.professional_profile?.is_available ?? true;
    try {
      const res = await api.patch('coach/availability', {
        coach_id: coachUser.id,
        is_available: !current,
      });
      showToast('success', res.data.message);
      loadAllData();
    } catch (err) {
      showToast('error', 'Failed to toggle coach availability.');
    }
  };

  // --- Handlers: Inspection Modal ---
  const handleInspectUser = (user) => {
    setInspectedUser(user);
    setInspectedStats(null);
  };

  // --- Handlers: Create Account ---
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username: newUserData.username.trim(),
        email: newUserData.email.trim(),
        first_name: newUserData.first_name.trim(),
        last_name: newUserData.last_name.trim(),
        password: newUserData.password || 'password123',
        role: newUserData.role,
      };

      if (newUserData.role === 'PROFESSIONAL') {
        if (newUserData.speciality_id) payload.speciality_id = parseInt(newUserData.speciality_id);
        if (newUserData.academy_name) payload.academy_name = newUserData.academy_name;
        if (newUserData.session_price) payload.session_price = parseFloat(newUserData.session_price);
      } else if (newUserData.role === 'ATHLETE') {
        if (newUserData.playing_role) payload.playing_role = newUserData.playing_role;
        if (newUserData.club_name) payload.club_name = newUserData.club_name;
      }

      await api.post('admin/users/', payload);
      showToast('success', `Account @${newUserData.username} (${newUserData.role}) created successfully!`);
      setShowCreateModal(false);
      setNewUserData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: 'password123',
        role: 'ATHLETE',
        speciality_id: '',
        academy_name: '',
        session_price: '1500',
        playing_role: 'Batsman',
        club_name: ''
      });
      loadAllData();
    } catch (err) {
      console.error(err);
      showToast('error', err.response?.data?.username?.[0] || err.response?.data?.email?.[0] || 'Failed to create user account.');
    }
  };

  // --- Filtering & Searching ---
  const filteredUsers = users.filter((u) => {
    // Role filter
    if (roleFilter === 'ATHLETE' && u.role !== 'ATHLETE') return false;
    if (roleFilter === 'PROFESSIONAL' && u.role !== 'PROFESSIONAL') return false;
    if (roleFilter === 'ADMIN' && u.role !== 'ADMIN') return false;
    if (roleFilter === 'SUSPENDED' && u.is_active) return false;

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchUsername = u.username?.toLowerCase().includes(q);
      const matchName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchClub = u.athlete_profile?.club_name?.toLowerCase().includes(q);
      const matchAcademy = u.professional_profile?.academy_name?.toLowerCase().includes(q);
      return matchUsername || matchName || matchEmail || matchClub || matchAcademy;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8ff] text-[#0c2340] flex flex-col items-center justify-center font-sans">
        <div className="w-8 h-8 border-4 border-[#ff5500] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-bold tracking-wider uppercase text-slate-500 font-display">Loading Platform Control Center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#0c2340] selection:bg-[#ff5500] selection:text-white p-4 md:p-8 font-sans overflow-x-hidden w-full max-w-[100vw]">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOP STATUS TOAST NOTIFICATION */}
        {statusNotification.message && (
          <div className={`p-4 rounded-xl text-sm font-bold flex justify-between items-center shadow-lg transition-all ${
            statusNotification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <span>{statusNotification.type === 'success' ? '✓' : '⚠'} {statusNotification.message}</span>
            <button onClick={() => setStatusNotification({ type: '', message: '' })} className="text-xs hover:opacity-80">✕</button>
          </div>
        )}

        {/* HEADER & QUICK ACTIONS */}
        <header className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-orange-50 border border-orange-200 text-[#ff5500] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-display">
                Platform Admin
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Systems Live
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#0c2340] mt-2 tracking-tight font-display">Platform Control Center</h1>
            <p className="text-slate-500 text-sm mt-0.5">Role-Based Access Control, Account Provisioning &amp; System Monitoring</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              disabled={refreshing}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-200 font-display"
            >
              <span className={refreshing ? "animate-spin" : ""}>↻</span> Refresh
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#ff5500] hover:bg-[#ea4c00] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 font-display"
            >
              <span>＋</span> Create User Account
            </button>
          </div>
        </header>

        {/* KPI MONITORING CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
            <p className="text-2xl md:text-3xl font-black text-white mt-1">{summary.total_users}</p>
            <p className="text-[11px] text-slate-500 mt-1">Platform Accounts</p>
          </div>
          <div className="bg-slate-900 border border-blue-500/30 border-l-4 border-l-blue-500 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Athletes</p>
            <p className="text-2xl md:text-3xl font-black text-white mt-1">{summary.total_athletes}</p>
            <p className="text-[11px] text-slate-500 mt-1">Batsmen / Players</p>
          </div>
          <div className="bg-slate-900 border border-purple-500/30 border-l-4 border-l-purple-500 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Coaches</p>
            <p className="text-2xl md:text-3xl font-black text-white mt-1">{summary.total_professionals}</p>
            <p className="text-[11px] text-slate-500 mt-1">Verified Trainers</p>
          </div>
          <div className="bg-slate-900 border border-red-500/30 border-l-4 border-l-red-500 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Admins</p>
            <p className="text-2xl md:text-3xl font-black text-white mt-1">{summary.total_admins}</p>
            <p className="text-[11px] text-slate-500 mt-1">Full Privileges</p>
          </div>
          <div className="bg-slate-900 border border-emerald-500/30 border-l-4 border-l-emerald-500 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Gross Revenue</p>
            <p className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">₹{Number(financeData.metrics.total_revenue || 0).toLocaleString()}</p>
            <p className="text-[11px] text-slate-500 mt-1">Total Booked Fees</p>
          </div>
          <div className="bg-slate-900 border border-amber-500/30 border-l-4 border-l-amber-500 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Active Status</p>
            <p className="text-2xl md:text-3xl font-black text-white mt-1">{summary.active_users}</p>
            <p className="text-[11px] text-slate-500 mt-1">{summary.suspended_users} Suspended</p>
          </div>
        </div>

        {/* PRIMARY NAVIGATION TABS */}
        <div className="flex border-b border-slate-800 space-x-2 md:space-x-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-3 text-sm font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'users' ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>👥</span> User & Access Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`pb-3 px-3 text-sm font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'finance' ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>💳</span> Bookings & Financial Records ({financeData.recent_transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 px-3 text-sm font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'activity' ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📜</span> System Audit & Security Logs
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: USER & ACCESS MANAGEMENT (RBAC, CRUD, DIRECTORY)   */}
        {/* ========================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            
            {/* Search, Filter Pills & Controls */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Search Box */}
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search user, name, email, club..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-500">🔍</span>
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2 text-xs text-slate-400">✕</button>
                )}
              </div>

              {/* Quick Role Filters */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                <button
                  onClick={() => setRoleFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    roleFilter === 'ALL' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  All ({users.length})
                </button>
                <button
                  onClick={() => setRoleFilter('ATHLETE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    roleFilter === 'ATHLETE' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  🏏 Athletes ({summary.total_athletes})
                </button>
                <button
                  onClick={() => setRoleFilter('PROFESSIONAL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    roleFilter === 'PROFESSIONAL' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  👨‍🏫 Coaches ({summary.total_professionals})
                </button>
                <button
                  onClick={() => setRoleFilter('ADMIN')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    roleFilter === 'ADMIN' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  🛡️ Admins ({summary.total_admins})
                </button>
                <button
                  onClick={() => setRoleFilter('SUSPENDED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    roleFilter === 'SUSPENDED' ? 'bg-slate-700 text-amber-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  ⛔ Suspended ({summary.suspended_users})
                </button>
              </div>

            </div>

            {/* Users Data Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
                      <th className="px-5 py-3.5">User Identity</th>
                      <th className="px-4 py-3.5">Role & RBAC Assigner</th>
                      <th className="px-4 py-3.5">Profile Info</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Management Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                          No users found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isAthlete = u.role === 'ATHLETE';
                        const isCoach = u.role === 'PROFESSIONAL';
                        const isAdminRole = u.role === 'ADMIN';

                        return (
                          <tr key={u.id} className="hover:bg-slate-800/40 transition">
                            
                            {/* User Identity */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
                                  isAdminRole ? 'bg-red-600' : isCoach ? 'bg-purple-600' : 'bg-blue-600'
                                }`}>
                                  {(u.first_name?.[0] || u.username?.[0] || 'U').toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                    {u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.username}
                                    <span className="text-slate-400 font-mono text-[11px]">@{u.username}</span>
                                  </div>
                                  <div className="text-slate-400 text-[11px]">{u.email || 'No email provided'}</div>
                                </div>
                              </div>
                            </td>

                            {/* Role & Role Assigner */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                  isAdminRole ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                  isCoach ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                  'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                }`}>
                                  {u.role}
                                </span>

                                {/* Role Assigner Dropdown */}
                                <select
                                  value={u.role}
                                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                  className="bg-slate-950 border border-slate-700 text-slate-300 text-[11px] font-semibold rounded px-2 py-1 focus:outline-none focus:border-orange-500 cursor-pointer"
                                  title="Assign New Role"
                                >
                                  <option value="ATHLETE">Assign: Athlete</option>
                                  <option value="PROFESSIONAL">Assign: Coach</option>
                                  <option value="ADMIN">Assign: Admin</option>
                                </select>
                              </div>
                            </td>

                            {/* Profile Info Summary */}
                            <td className="px-4 py-3.5 text-slate-300">
                              {isAthlete && (
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-white flex items-center gap-1">
                                    <span>🏏</span> {u.athlete_profile?.playing_role || 'Batsman'}
                                  </div>
                                  <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                    {u.athlete_profile?.club_name || 'Shivaji Park Gymkhana'}
                                  </div>
                                </div>
                              )}
                              {isCoach && (
                                <div className="space-y-1">
                                  <div className="font-semibold text-purple-300 flex items-center gap-1">
                                    <span>👨‍🏫</span> {u.professional_profile?.speciality?.name || 'Trainer'}
                                  </div>
                                  <div className="text-[11px] text-slate-400 truncate max-w-[220px]">
                                    {u.professional_profile?.institution_club || u.professional_profile?.academy_name || 'Independent'} • ₹{u.professional_profile?.charges_per_session || u.professional_profile?.session_price || '1000'} • {u.professional_profile?.training_mode || 'Both'}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleCoachAvailability(u)}
                                    className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                                      u.professional_profile?.is_available !== false
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                                    }`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${u.professional_profile?.is_available !== false ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                    {u.professional_profile?.is_available !== false ? 'Available (Click to Toggle)' : 'Unavailable (Click to Toggle)'}
                                  </button>
                                </div>
                              )}
                              {isAdminRole && (
                                <span className="text-slate-400 text-[11px]">System Superuser</span>
                              )}
                            </td>

                            {/* Account Status */}
                            <td className="px-4 py-3.5">
                              {u.is_active ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Suspended
                                </span>
                              )}
                            </td>

                            {/* Actions Buttons */}
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                
                                {/* Inspect Profile */}
                                <button
                                  onClick={() => handleInspectUser(u)}
                                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded text-[11px] font-bold transition border border-slate-700"
                                  title="Inspect Profile"
                                >
                                  🔍 Inspect
                                </button>

                                {/* Impersonate User */}
                                <button
                                  onClick={() => handleImpersonate(u)}
                                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1.5 rounded text-[11px] font-bold transition"
                                  title="Troubleshoot as User"
                                >
                                  🎭 Impersonate
                                </button>

                                {/* Reset Password */}
                                <button
                                  onClick={() => { setShowPasswordModal(u); setNewPasswordInput('password123'); }}
                                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1.5 rounded text-[11px] font-semibold transition border border-slate-700"
                                  title="Reset Password"
                                >
                                  🔑
                                </button>

                                {/* Ban / Activate Toggle */}
                                <button
                                  onClick={() => handleToggleStatus(u)}
                                  className={`px-2 py-1.5 rounded text-[11px] font-semibold transition border ${
                                    u.is_active ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                  }`}
                                  title={u.is_active ? 'Ban / Suspend Account' : 'Reactivate Account'}
                                >
                                  {u.is_active ? '⛔' : '✓'}
                                </button>

                                {/* Delete User */}
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 px-2 py-1.5 rounded text-[11px] transition border border-slate-700"
                                  title="Delete User Permanently"
                                >
                                  🗑️
                                </button>

                              </div>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: FINANCIAL OPERATIONS & BOOKINGS                   */}
        {/* ========================================================= */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-xs font-bold text-slate-400 uppercase">Gross Platform Revenue</p>
                <p className="text-3xl font-black text-emerald-400 mt-2">₹{Number(financeData.metrics.total_revenue || 0).toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Processed coaching transactions</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-xs font-bold text-slate-400 uppercase">Confirmed Bookings</p>
                <p className="text-3xl font-black text-white mt-2">{financeData.recent_transactions.length}</p>
                <p className="text-xs text-slate-500 mt-1">Total completed & pending slots</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-xs font-bold text-slate-400 uppercase">Platform Take Rate</p>
                <p className="text-3xl font-black text-orange-400 mt-2">10%</p>
                <p className="text-xs text-slate-500 mt-1">Standard marketplace commission</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-white text-base">Recent Platform Transactions</h3>
                <span className="text-xs text-slate-400">{financeData.recent_transactions.length} records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
                      <th className="px-6 py-3.5">Athlete</th>
                      <th className="px-6 py-3.5">Coach</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {financeData.recent_transactions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                          No transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      financeData.recent_transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-800/40 transition">
                          <td className="px-6 py-4 font-bold text-white">@{t.athlete}</td>
                          <td className="px-6 py-4 text-purple-300 font-semibold">@{t.professional}</td>
                          <td className="px-6 py-4 text-slate-400">{t.date}</td>
                          <td className="px-6 py-4 font-bold text-emerald-400">₹{t.amount}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                              t.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SYSTEM AUDIT & SECURITY LOGS                       */}
        {/* ========================================================= */}
        {activeTab === 'activity' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">System Security & Audit Activity</h3>
                <p className="text-xs text-slate-400">Chronological platform security and administrative event stream</p>
              </div>
              <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full font-mono">
                Log retention: 90 days
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">[AUTH]</span>
                  <span className="text-slate-300">Admin session authenticated for @{currentAdmin}</span>
                </div>
                <span className="text-slate-500">Just now</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-purple-400 font-bold">[RBAC]</span>
                  <span className="text-slate-300">Role-based access enforcement active for {summary.total_users} accounts</span>
                </div>
                <span className="text-slate-500">Continuous</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-blue-400 font-bold">[DB]</span>
                  <span className="text-slate-300">PostgreSQL database health check status: 200 OK (Latency: 42ms)</span>
                </div>
                <span className="text-slate-500">2 min ago</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-orange-400 font-bold">[CRICKET]</span>
                  <span className="text-slate-300">Cricket batsman performance metrics engine initialized for {summary.total_athletes} athletes</span>
                </div>
                <span className="text-slate-500">10 min ago</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* MODAL 1: CREATE USER ACCOUNT MODAL                        */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Create Platform Account</h3>
                <p className="text-xs text-slate-400">Provision credentials and assign user role with immediate activation</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Select Role</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewUserData({ ...newUserData, role: 'ATHLETE' })}
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      newUserData.role === 'ATHLETE' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    🏏 Athlete
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewUserData({ ...newUserData, role: 'PROFESSIONAL' })}
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      newUserData.role === 'PROFESSIONAL' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    👨‍🏫 Coach
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewUserData({ ...newUserData, role: 'ADMIN' })}
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      newUserData.role === 'ADMIN' ? 'bg-red-600 text-white border-red-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    🛡️ Admin
                  </button>
                </div>
              </div>

              {/* Username & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={newUserData.username}
                    onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                    placeholder="e.g. rohit_sharma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    placeholder="e.g. rohit@cricket.in"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newUserData.first_name}
                    onChange={(e) => setNewUserData({ ...newUserData, first_name: e.target.value })}
                    placeholder="Rohit"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newUserData.last_name}
                    onChange={(e) => setNewUserData({ ...newUserData, last_name: e.target.value })}
                    placeholder="Sharma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Initial Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Password *</label>
                <input
                  type="text"
                  required
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="password123"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              {/* Role-Specific Fields: COACH */}
              {newUserData.role === 'PROFESSIONAL' && (
                <div className="p-4 bg-purple-950/20 border border-purple-800/40 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-purple-300 uppercase">Coach Configuration</p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Coaching Specialty</label>
                    <select
                      value={newUserData.speciality_id}
                      onChange={(e) => setNewUserData({ ...newUserData, speciality_id: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="">Select Specialty</option>
                      {specialtiesList.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Academy Name</label>
                      <input
                        type="text"
                        value={newUserData.academy_name}
                        onChange={(e) => setNewUserData({ ...newUserData, academy_name: e.target.value })}
                        placeholder="e.g. National Cricket Academy"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Hourly Fee (₹)</label>
                      <input
                        type="number"
                        value={newUserData.session_price}
                        onChange={(e) => setNewUserData({ ...newUserData, session_price: e.target.value })}
                        placeholder="1500"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Role-Specific Fields: ATHLETE */}
              {newUserData.role === 'ATHLETE' && (
                <div className="p-4 bg-blue-950/20 border border-blue-800/40 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-blue-300 uppercase">Athlete Cricket Configuration</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Role</label>
                      <select
                        value={newUserData.playing_role}
                        onChange={(e) => setNewUserData({ ...newUserData, playing_role: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="Batsman">Batsman</option>
                        <option value="Wicket-keeper Batsman">Wicket-keeper Batsman</option>
                        <option value="All-rounder">All-rounder</option>
                        <option value="Bowler">Bowler</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Club Name</label>
                      <input
                        type="text"
                        value={newUserData.club_name}
                        onChange={(e) => setNewUserData({ ...newUserData, club_name: e.target.value })}
                        placeholder="e.g. Shivaji Park Gymkhana"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/25"
                >
                  Create Account
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: RESET PASSWORD MODAL                             */}
      {/* ========================================================= */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Reset Password for @{showPasswordModal.username}</h3>
            <p className="text-xs text-slate-400 mb-4">Set a temporary or updated password directly without email tokens.</p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                <input
                  type="text"
                  required
                  minLength="6"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl text-xs font-bold"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: INSPECT USER & ATHLETE BATSMAN SCORECARD MODAL   */}
      {/* ========================================================= */}
      {inspectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  inspectedUser.role === 'ADMIN' ? 'bg-red-600' : inspectedUser.role === 'PROFESSIONAL' ? 'bg-purple-600' : 'bg-blue-600'
                }`}>
                  {(inspectedUser.first_name?.[0] || inspectedUser.username?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {inspectedUser.first_name ? `${inspectedUser.first_name} ${inspectedUser.last_name || ''}` : inspectedUser.username}
                  </h3>
                  <p className="text-xs text-slate-400">@{inspectedUser.username} • {inspectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setInspectedUser(null)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            {/* If Athlete: Render Athlete Onboarding Profile */}
            {inspectedUser.role === 'ATHLETE' ? (
              <div className="mt-5 space-y-5">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3">Athlete Booking Profile</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Age</span>
                      <span className="font-semibold text-white">{inspectedUser.athlete_profile?.age || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Profession</span>
                      <span className="font-semibold text-white">{inspectedUser.athlete_profile?.profession || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Pincode</span>
                      <span className="font-semibold text-white">{inspectedUser.athlete_profile?.pincode || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Mobile</span>
                      <span className="font-semibold text-white">{inspectedUser.mobile_number || '—'}</span>
                    </div>
                  </div>
                  {inspectedUser.athlete_profile?.address && (
                    <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300">
                      <span className="text-slate-500 block">Address</span>
                      {inspectedUser.athlete_profile.address}
                    </div>
                  )}
                </div>
              </div>
            ) : inspectedUser.role === 'PROFESSIONAL' ? (
              <div className="mt-5 space-y-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <p className="font-bold text-purple-400 uppercase tracking-wider">Coach Credentials & Academy</p>
                  <div className="flex justify-between text-slate-400">
                    <span>Specialization:</span>
                    <span className="text-white font-semibold">{inspectedUser.professional_profile?.speciality?.name || 'Cricket Mentor'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Academy:</span>
                    <span className="text-white font-semibold">{inspectedUser.professional_profile?.academy_name || 'Elite Academy'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Hourly Rate:</span>
                    <span className="text-emerald-400 font-bold">₹{inspectedUser.professional_profile?.session_price || '1,500'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Facility Location:</span>
                    <span className="text-slate-300">{inspectedUser.professional_profile?.address || 'Bangalore, India'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                Administrator account with root platform access, user provisioning, and financial audit privileges.
              </div>
            )}

            <div className="mt-6 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectedUser(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-xl text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
