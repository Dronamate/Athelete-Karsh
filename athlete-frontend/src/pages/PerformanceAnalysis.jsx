// src/pages/PerformanceAnalysis.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area 
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import api from '../api';

export default function PerformanceAnalysis() {
  const navigate = useNavigate();
  
  // Biometric logs
  const [logs, setLogs] = useState([]);
  const [recoveryData, setRecoveryData] = useState({ score: 0, status: 'No Data', color: 'text-slate-400' });
  
  // Cricket Stats & Profile
  const [cricketStats, setCricketStats] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // AI Insights State
  const [aiInsights, setAiInsights] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiType, setAiType] = useState('tactical'); // 'tactical' or 'biometrics'

  // Modal State for Manual Entry
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statsForm, setStatsForm] = useState({
    matches_played: 0,
    innings: 0,
    runs_made: 0,
    wickets: 0,
    batting_average: 0,
    strike_rate: 0,
    centuries: 0,
    half_centuries: 0,
    fours: 0,
    sixes: 0,
    highest_score: '0',
    not_outs: 0,
    balls_faced_medium_fast: 0,
    runs_scored_medium_fast: 0,
    dismissals_medium_fast: 0,
    balls_faced_spin: 0,
    runs_scored_spin: 0,
    dismissals_spin: 0,
    notes: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoadingStats(true);
    try {
      // 1. Fetch user profile
      const profRes = await api.get('profile/');
      setUserProfile(profRes.data);

      // 2. Fetch cricket stats
      const statsRes = await api.get('cricket-stats/my_stats/');
      setCricketStats(statsRes.data);
      setStatsForm({
        matches_played: statsRes.data.matches_played || 0,
        innings: statsRes.data.innings || 0,
        runs_made: statsRes.data.runs_made || 0,
        wickets: statsRes.data.wickets || 0,
        batting_average: statsRes.data.batting_average || 0,
        strike_rate: statsRes.data.strike_rate || 0,
        centuries: statsRes.data.centuries || 0,
        half_centuries: statsRes.data.half_centuries || 0,
        fours: statsRes.data.fours || 0,
        sixes: statsRes.data.sixes || 0,
        highest_score: statsRes.data.highest_score || '0',
        not_outs: statsRes.data.not_outs || 0,
        balls_faced_medium_fast: statsRes.data.balls_faced_medium_fast || 0,
        runs_scored_medium_fast: statsRes.data.runs_scored_medium_fast || 0,
        dismissals_medium_fast: statsRes.data.dismissals_medium_fast || 0,
        balls_faced_spin: statsRes.data.balls_faced_spin || 0,
        runs_scored_spin: statsRes.data.runs_scored_spin || 0,
        dismissals_spin: statsRes.data.dismissals_spin || 0,
        notes: statsRes.data.notes || ''
      });

      // 3. Fetch biometrics logs
      const logsRes = await api.get('performance/');
      const fetchedLogs = logsRes.data.reverse();
      setLogs(fetchedLogs);
      if (fetchedLogs.length > 0) {
        setRecoveryData(calculateRecovery(fetchedLogs[fetchedLogs.length - 1]));
      }

    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const calculateRecovery = (log) => {
    if (!log) return { score: 0, status: 'No Data', color: 'text-slate-400' };
    const sleepScore = Math.min((log.sleep_hours / 8.5) * 40, 40);
    const fatigueScore = ((10 - log.fatigue_level) / 10) * 25;
    const sorenessScore = ((10 - log.muscle_soreness) / 10) * 20;
    const stressScore = ((10 - log.stress_level) / 10) * 15;
    const total = Math.round(sleepScore + fatigueScore + sorenessScore + stressScore);
    
    let status = 'Prime for Match Day';
    let color = 'text-emerald-400';
    if (total < 50) { 
      status = 'High Injury Risk'; 
      color = 'text-red-400'; 
    } else if (total < 75) { 
      status = 'Needs Light Nets / Recovery'; 
      color = 'text-orange-400'; 
    }
    return { score: total, status, color, raw: log };
  };

  const handleStatsChange = (e) => {
    const { name, value } = e.target;
    setStatsForm(prev => {
      const updated = { ...prev, [name]: name === 'notes' || name === 'highest_score' ? value : Number(value) };
      
      // Auto-compute average if user changes runs or innings
      if (name === 'runs_made' || name === 'innings' || name === 'not_outs' || name === 'dismissals_medium_fast' || name === 'dismissals_spin') {
        const runs = name === 'runs_made' ? Number(value) : updated.runs_made;
        const totalDismissals = (updated.dismissals_medium_fast || 0) + (updated.dismissals_spin || 0);
        const effectiveDismissals = totalDismissals > 0 ? totalDismissals : Math.max(1, (updated.innings - updated.not_outs));
        if (effectiveDismissals > 0 && runs > 0) {
          updated.batting_average = Number((runs / effectiveDismissals).toFixed(2));
        }
      }
      
      // Auto-compute strike rate if user changes balls faced or runs
      if (name === 'runs_made' || name === 'balls_faced_medium_fast' || name === 'balls_faced_spin') {
        const runs = name === 'runs_made' ? Number(value) : updated.runs_made;
        const totalBalls = (updated.balls_faced_medium_fast || 0) + (updated.balls_faced_spin || 0);
        if (totalBalls > 0 && runs > 0) {
          updated.strike_rate = Number(((runs / totalBalls) * 100).toFixed(2));
        }
      }
      
      return updated;
    });
  };

  const handleStatsSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('cricket-stats/my_stats/', statsForm);
      setCricketStats(res.data);
      setEditModalOpen(false);
      alert('Cricket performance stats updated successfully!');
    } catch (error) {
      console.error('Failed to update stats:', error);
      alert('Failed to update stats.');
    }
  };

  const generateTacticalAnalysis = async () => {
    setAiLoading(true);
    setAiInsights('');
    setAiType('tactical');
    try {
      const response = await api.post('cricket-stats/ai_batsman_analysis/', {});
      setAiInsights(response.data.analysis);
    } catch (error) {
      console.error('Failed to generate tactical analysis:', error);
      setAiInsights('⚠️ Error generating tactical batsman analysis. Please check your network or try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const generateBiometricsPlan = async () => {
    setAiLoading(true);
    setAiInsights('');
    setAiType('biometrics');
    try {
      const response = await api.get('performance/ai_analysis/');
      setAiInsights(response.data.analysis);
    } catch (error) {
      console.error('Failed to generate biometrics plan:', error);
      setAiInsights('⚠️ Error generating biometrics recovery plan. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Pace vs Spin Chart Data
  const paceVsSpinData = [
    {
      metric: 'Balls Faced',
      'Medium Fast': cricketStats?.balls_faced_medium_fast || 0,
      'Spin': cricketStats?.balls_faced_spin || 0,
    },
    {
      metric: 'Runs Scored',
      'Medium Fast': cricketStats?.runs_scored_medium_fast || 0,
      'Spin': cricketStats?.runs_scored_spin || 0,
    },
    {
      metric: 'Strike Rate',
      'Medium Fast': parseFloat(cricketStats?.sr_medium_fast || 0),
      'Spin': parseFloat(cricketStats?.sr_spin || 0),
    },
    {
      metric: 'Batting Avg',
      'Medium Fast': parseFloat(cricketStats?.avg_medium_fast || 0),
      'Spin': parseFloat(cricketStats?.avg_spin || 0),
    },
    {
      metric: 'Dismissals',
      'Medium Fast': cricketStats?.dismissals_medium_fast || 0,
      'Spin': cricketStats?.dismissals_spin || 0,
    }
  ];

  const athleteDetails = userProfile?.athlete_profile || {};
  let avatarUrl = userProfile?.avatar;
  if (avatarUrl && !avatarUrl.startsWith('http')) {
    const mediaBaseUrl = import.meta.env.VITE_MEDIA_BASE_URL || 'http://127.0.0.1:8000';
    avatarUrl = `${mediaBaseUrl}${avatarUrl}`;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500 selection:text-slate-900 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-orange-500 text-slate-950 px-2.5 py-1 rounded text-xs font-black tracking-widest uppercase">
                Cricket Batsman Engine
              </span>
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded text-xs font-medium border border-slate-700">
                DronaMate Certified
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Athlete Performance Dashboard</h1>
            <p className="mt-1 text-slate-400 max-w-2xl text-sm">
              Complete cricket match metrics, pace vs. spin breakdown, and sports science readiness—without expensive tracking hardware.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-orange-500/20 flex items-center gap-2"
            >
              <span>✏️</span> Edit Cricket Stats
            </button>
            <button
              onClick={() => navigate('/athlete')}
              className="text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl transition border border-slate-700"
            >
              ← Back to Portal
            </button>
          </div>
        </div>

        {/* 1. ATHLETE PERSONAL DATA CARD (Client requirement) */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/80 rounded-2xl border border-slate-800 p-6 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            
            {/* Athlete Photo & Core Badges */}
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-500/40 bg-slate-800 shadow-md flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Athlete" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-2xl">
                    <span>🏏</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-bold text-white">
                    {userProfile?.first_name || userProfile?.username} {userProfile?.last_name || ''}
                  </h2>
                  <span className="bg-orange-500/20 border border-orange-500/40 text-orange-400 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase">
                    {athleteDetails.playing_role || 'Batsman'}
                  </span>
                  {athleteDetails.club_name && (
                    <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-md text-xs font-semibold">
                      🏛️ {athleteDetails.club_name}
                    </span>
                  )}
                </div>

                <p className="text-slate-400 text-sm mt-1">
                  {athleteDetails.preferred_position || 'Top-Order Batsman'} • {athleteDetails.batting_hand || 'Right-hand bat'}
                  {athleteDetails.secondary_role && ` • 2nd: ${athleteDetails.secondary_role}`}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-300">
                  <span className="bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                    🎂 Age: <strong className="text-white">{athleteDetails.age || 'N/A'}</strong>
                  </span>
                  <span className="bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                    📏 Height: <strong className="text-white">{athleteDetails.height || 'N/A'}</strong>
                  </span>
                  <span className="bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                    ⚖️ Weight: <strong className="text-white">{athleteDetails.weight || 'N/A'}</strong>
                  </span>
                  {athleteDetails.bowling_style && (
                    <span className="bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                      🎯 Bowling: <strong className="text-white">{athleteDetails.bowling_style}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Profile Edit CTA */}
            <button
              onClick={() => navigate('/profile')}
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-3.5 py-2 rounded-lg font-semibold transition"
            >
              Edit Personal Info →
            </button>
          </div>
        </div>

        {/* 2. OVERALL BATSMAN KPI STATS (Matches, Innings, Runs, Average, SR, 100s, 50s, 4s, 6s) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>📊</span> Career / Season Match Statistics
            </h3>
            <span className="text-xs text-slate-500">
              Last updated: {cricketStats?.updated_at ? new Date(cricketStats.updated_at).toLocaleDateString() : 'Today'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-slate-400 uppercase font-semibold">Matches / Inn</p>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-black text-white">{cricketStats?.matches_played || 0}</span>
                <span className="text-slate-500 text-xs">/ {cricketStats?.innings || 0} inn</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">NO: {cricketStats?.not_outs || 0}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-slate-400 uppercase font-semibold">Runs Made</p>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-black text-orange-400">{cricketStats?.runs_made || 0}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">HS: {cricketStats?.highest_score || '0'}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-slate-400 uppercase font-semibold">Batting Average</p>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-black text-emerald-400">{cricketStats?.batting_average || '0.00'}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Runs/Dismissal</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-slate-400 uppercase font-semibold">Strike Rate</p>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-black text-cyan-400">{cricketStats?.strike_rate || '0.00'}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{cricketStats?.total_balls_faced || 0} balls faced</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-slate-400 uppercase font-semibold">Centuries / 50s</p>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-black text-white">{cricketStats?.centuries || 0}</span>
                <span className="text-slate-500 text-xs">/ {cricketStats?.half_centuries || 0}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Milestones</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-slate-400 uppercase font-semibold">Boundaries (4s / 6s)</p>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-black text-amber-400">{cricketStats?.fours || 0}</span>
                <span className="text-slate-500 text-xs">/ {cricketStats?.sixes || 0}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Wickets: {cricketStats?.wickets || 0}</p>
            </div>

          </div>
        </div>

        {/* 3. CORE SPLIT BREAKDOWN: MEDIUM FAST (PACE) VS SPIN BOWLING (Key client requirement) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>⚡</span> Bowler Type Breakdown: Medium Fast vs. Spin
              </h3>
              <p className="text-xs text-slate-400">
                Comparative analysis of scoring control, strike rotation, and dismissal risk against pace vs. spin.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Medium Fast Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h4 className="font-bold text-white text-base">Against Medium Fast</h4>
                      <p className="text-[11px] text-slate-400">Pace, seam, and swing bowling</p>
                    </div>
                  </div>
                  <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2.5 py-1 rounded">
                    Pace Split
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                    <span className="text-slate-400 text-xs">Balls Faced</span>
                    <span className="font-bold text-white text-sm">{cricketStats?.balls_faced_medium_fast || 0}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                    <span className="text-slate-400 text-xs">Runs Scored</span>
                    <span className="font-bold text-orange-400 text-sm">{cricketStats?.runs_scored_medium_fast || 0}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                    <span className="text-slate-400 text-xs">Dismissals</span>
                    <span className="font-bold text-red-400 text-sm">{cricketStats?.dismissals_medium_fast || 0}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                    <span className="text-slate-400 text-xs">Strike Rate vs Pace</span>
                    <span className="font-black text-cyan-400 text-base">{cricketStats?.sr_medium_fast || '0.00'}</span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400 text-xs">Batting Average vs Pace</span>
                    <span className="font-black text-emerald-400 text-base">{cricketStats?.avg_medium_fast || '0.00'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                <span>Balls per dismissal:</span>
                <strong className="text-white">
                  {cricketStats?.dismissals_medium_fast > 0 
                    ? (cricketStats.balls_faced_medium_fast / cricketStats.dismissals_medium_fast).toFixed(1) 
                    : cricketStats?.balls_faced_medium_fast || 0} bpd
                </strong>
              </div>
            </div>

            {/* Spin Bowling Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌀</span>
                    <div>
                      <h4 className="font-bold text-white text-base">Against Spin</h4>
                      <p className="text-[11px] text-slate-400">Off-break, leg-break, and left-arm orthodox</p>
                    </div>
                  </div>
                  <span className="bg-cyan-500/20 text-cyan-400 text-xs font-bold px-2.5 py-1 rounded">
                    Spin Split
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                    <span className="text-slate-400 text-xs">Balls Faced</span>
                    <span className="font-bold text-white text-sm">{cricketStats?.balls_faced_spin || 0}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                    <span className="text-slate-400 text-xs">Runs Scored</span>
                    <span className="font-bold text-cyan-400 text-sm">{cricketStats?.runs_scored_spin || 0}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                    <span className="text-slate-400 text-xs">Dismissals</span>
                    <span className="font-bold text-red-400 text-sm">{cricketStats?.dismissals_spin || 0}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                    <span className="text-slate-400 text-xs">Strike Rate vs Spin</span>
                    <span className="font-black text-cyan-400 text-base">{cricketStats?.sr_spin || '0.00'}</span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400 text-xs">Batting Average vs Spin</span>
                    <span className="font-black text-emerald-400 text-base">{cricketStats?.avg_spin || '0.00'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                <span>Balls per dismissal:</span>
                <strong className="text-white">
                  {cricketStats?.dismissals_spin > 0 
                    ? (cricketStats.balls_faced_spin / cricketStats.dismissals_spin).toFixed(1) 
                    : cricketStats?.balls_faced_spin || 0} bpd
                </strong>
              </div>
            </div>

            {/* Visual Comparison Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between min-w-0">
              <div>
                <h4 className="font-bold text-white text-base mb-1">Visual Matchup Comparison</h4>
                <p className="text-[11px] text-slate-400 mb-4">Pace (Orange) vs. Spin (Cyan)</p>

                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paceVsSpinData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="metric" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#fff' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="Medium Fast" fill="#f97316" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Spin" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 mt-2">
                💡 <strong>Key Takeaway:</strong> {
                  (cricketStats?.sr_spin || 0) > (cricketStats?.sr_medium_fast || 0)
                    ? 'You attack spin aggressively (+ strike rate) but must watch dismissal risk.'
                    : 'Solid against pace; work on rotating strike against spin in middle overs.'
                }
              </div>
            </div>

          </div>
        </div>

        {/* 4. DUAL AI ENGINE: CRICKET TACTICAL COACH & BIOMETRICS ENGINE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Left Column: Biometrics & Workload (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Top Readiness Score Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Match Day Readiness</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-black ${recoveryData.color}`}>{recoveryData.score}</span>
                  <span className="text-slate-500 font-bold">/100</span>
                </div>
                <p className={`text-xs mt-1.5 font-medium ${recoveryData.color}`}>{recoveryData.status}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Fatigue & Strain</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">
                    {recoveryData.raw ? ((recoveryData.raw.fatigue_level + recoveryData.raw.stress_level)/2).toFixed(1) : '0'}
                  </span>
                  <span className="text-slate-500 font-bold text-xs">/10</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-orange-500 h-full" style={{ width: `${recoveryData.raw ? ((recoveryData.raw.fatigue_level + recoveryData.raw.stress_level)/2)*10 : 0}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Sleep Recovery</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{recoveryData.raw ? recoveryData.raw.sleep_hours : '0'}</span>
                  <span className="text-slate-500 font-bold text-xs">hrs</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {recoveryData.raw && recoveryData.raw.sleep_hours >= 8 ? '✅ Optimal biological rest' : '⚠️ Mild sleep debt'}
                </p>
              </div>
            </div>

            {/* Chart: Fatigue & Exertion over time */}
            <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-6 min-w-0">
              <h4 className="text-base font-bold text-white mb-4 flex items-center justify-between">
                <span>Training Workload & Fatigue Over Time</span>
                <span className="text-xs text-slate-400 font-normal">Last entries</span>
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={logs} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <defs>
                      <linearGradient id="colorFatigue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExertion" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 10]} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" name="Systemic Fatigue" dataKey="fatigue_level" stroke="#ef4444" fillOpacity={1} fill="url(#colorFatigue)" strokeWidth={2} />
                    <Area type="monotone" name="Perceived Exertion" dataKey="perceived_exertion" stroke="#f97316" fillOpacity={1} fill="url(#colorExertion)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Right Column: AI Cricket Coach Panel */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-black rounded-2xl shadow-2xl border border-slate-800 p-6 flex flex-col h-full min-h-[550px] relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-orange-500 rounded-full blur-[70px] opacity-20 pointer-events-none"></div>

            <div className="mb-4 flex items-center justify-between relative z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                  🏏
                </span>
                Cricket AI Specialist
              </h3>
            </div>

            {/* Toggle Modes */}
            <div className="flex gap-2 p-1 bg-slate-800/80 rounded-xl mb-4 text-xs font-semibold">
              <button
                onClick={() => setAiType('tactical')}
                className={`flex-1 py-1.5 rounded-lg transition ${aiType === 'tactical' ? 'bg-orange-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Batting Matchups
              </button>
              <button
                onClick={() => setAiType('biometrics')}
                className={`flex-1 py-1.5 rounded-lg transition ${aiType === 'biometrics' ? 'bg-orange-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Nets & Recovery
              </button>
            </div>

            {/* AI Action CTA when empty */}
            {!aiInsights && !aiLoading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 py-6">
                <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg text-3xl">
                  {aiType === 'tactical' ? '🎯' : '🥗'}
                </div>
                <h4 className="text-base font-bold text-white mb-1.5">
                  {aiType === 'tactical' ? 'Tactical Batting Analysis' : 'Personal Nets & Nutrition Plan'}
                </h4>
                <p className="text-slate-400 text-xs mb-6 leading-relaxed max-w-xs">
                  {aiType === 'tactical'
                    ? 'Evaluates your pace vs. spin split stats, boundary generation, and provides personalized technical drill recommendations.'
                    : 'Parses your sleep, muscle soreness, and exertion markers to configure today’s nets session and recovery meals.'}
                </p>
                <button
                  onClick={aiType === 'tactical' ? generateTacticalAnalysis : generateBiometricsPlan}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition shadow-lg shadow-orange-500/20 text-sm"
                >
                  {aiType === 'tactical' ? '⚡ Generate Tactical Report' : '🏏 Generate Nets & Fueling Plan'}
                </button>
              </div>
            )}

            {/* Loading State */}
            {aiLoading && (
              <div className="flex-1 flex flex-col items-center justify-center relative z-10 py-12">
                <div className="w-10 h-10 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin mb-3"></div>
                <p className="text-orange-400 font-semibold text-xs animate-pulse tracking-wide uppercase">
                  Analyzing Cricket Metrics...
                </p>
              </div>
            )}

            {/* Result Display */}
            {aiInsights && !aiLoading && (
              <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
                <div className="prose prose-invert prose-orange prose-xs max-w-none flex-1 overflow-y-auto pr-1 text-slate-300">
                  <ReactMarkdown>{aiInsights}</ReactMarkdown>
                </div>
                <button
                  onClick={aiType === 'tactical' ? generateTacticalAnalysis : generateBiometricsPlan}
                  className="mt-4 w-full bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-slate-700 transition border border-slate-700 text-xs"
                >
                  Regenerate Analysis
                </button>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* 5. MANUAL EDIT CRICKET STATS MODAL (Client requirement: manually filled initially) */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 md:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-xl"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🏏</span>
              <div>
                <h3 className="text-xl font-bold text-white">Manual Cricket Performance Input</h3>
                <p className="text-xs text-slate-400">Fill your match and bowler split statistics. Rates & averages auto-calculate!</p>
              </div>
            </div>

            <form onSubmit={handleStatsSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
              
              {/* Career Section */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-3">1. Match & Innings Overview</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Matches Played</label>
                    <input type="number" name="matches_played" value={statsForm.matches_played} onChange={handleStatsChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Innings Batted</label>
                    <input type="number" name="innings" value={statsForm.innings} onChange={handleStatsChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Total Runs Made</label>
                    <input type="number" name="runs_made" value={statsForm.runs_made} onChange={handleStatsChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Highest Score</label>
                    <input type="text" name="highest_score" value={statsForm.highest_score} onChange={handleStatsChange} placeholder="e.g. 104*" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Not Outs</label>
                    <input type="number" name="not_outs" value={statsForm.not_outs} onChange={handleStatsChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Batting Average</label>
                    <input type="number" step="0.01" name="batting_average" value={statsForm.batting_average} onChange={handleStatsChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Strike Rate</label>
                    <input type="number" step="0.01" name="strike_rate" value={statsForm.strike_rate} onChange={handleStatsChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Wickets Taken</label>
                    <input type="number" name="wickets" value={statsForm.wickets} onChange={handleStatsChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                </div>
              </div>

              {/* Milestones & Boundaries */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-3">2. Milestones & Boundaries</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Centuries (100s)</label>
                    <input type="number" name="centuries" value={statsForm.centuries} onChange={handleStatsChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Half-Centuries (50s)</label>
                    <input type="number" name="half_centuries" value={statsForm.half_centuries} onChange={handleStatsChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Fours (4s)</label>
                    <input type="number" name="fours" value={statsForm.fours} onChange={handleStatsChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Sixes (6s)</label>
                    <input type="number" name="sixes" value={statsForm.sixes} onChange={handleStatsChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                </div>
              </div>

              {/* Against Medium Fast */}
              <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-3 flex items-center gap-1.5">
                  <span>⚡</span> 3. Performance Against Medium Fast (Pace)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Balls Faced</label>
                    <input type="number" name="balls_faced_medium_fast" value={statsForm.balls_faced_medium_fast} onChange={handleStatsChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Runs Scored</label>
                    <input type="number" name="runs_scored_medium_fast" value={statsForm.runs_scored_medium_fast} onChange={handleStatsChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Dismissals against Pace</label>
                    <input type="number" name="dismissals_medium_fast" value={statsForm.dismissals_medium_fast} onChange={handleStatsChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                </div>
              </div>

              {/* Against Spin */}
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
                  <span>🌀</span> 4. Performance Against Spin
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Balls Faced</label>
                    <input type="number" name="balls_faced_spin" value={statsForm.balls_faced_spin} onChange={handleStatsChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Runs Scored</label>
                    <input type="number" name="runs_scored_spin" value={statsForm.runs_scored_spin} onChange={handleStatsChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Dismissals against Spin</label>
                    <input type="number" name="dismissals_spin" value={statsForm.dismissals_spin} onChange={handleStatsChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Coaching Notes / Season Target</label>
                <textarea rows="2" name="notes" value={statsForm.notes} onChange={handleStatsChange} placeholder="e.g. Focus on front-foot defense against away-swing and rotating strike..." className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"></textarea>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold py-3.5 rounded-xl transition shadow-lg shadow-orange-500/20 text-sm"
                >
                  Save Cricket Performance Stats
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3.5 px-6 rounded-xl transition border border-slate-700 text-sm"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
