import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import api from '../api';

export default function PerformanceAnalysis() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [aiInsights, setAiInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryData, setRecoveryData] = useState({ score: 0, status: 'No Data', color: 'text-slate-400' });

  useEffect(() => {
    fetchPerformanceLogs();
  }, []);

  const fetchPerformanceLogs = async () => {
    try {
      const response = await api.get('performance/');
      const fetchedLogs = response.data.reverse(); // chronological for charts
      setLogs(fetchedLogs);
      
      if (fetchedLogs.length > 0) {
        const latestLog = fetchedLogs[fetchedLogs.length - 1];
        setRecoveryData(calculateRecovery(latestLog));
      }
    } catch (error) {
      console.error('Failed to fetch performance logs:', error);
    }
  };

  const calculateRecovery = (log) => {
    if (!log) return { score: 0, status: 'No Data', color: 'text-slate-400' };
    
    // Algorithm to simulate a sophisticated hardware-free recovery score (0-100%)
    const sleepScore = Math.min((log.sleep_hours / 8.5) * 40, 40);
    const fatigueScore = ((10 - log.fatigue_level) / 10) * 25;
    const sorenessScore = ((10 - log.muscle_soreness) / 10) * 20;
    const stressScore = ((10 - log.stress_level) / 10) * 15;

    const total = Math.round(sleepScore + fatigueScore + sorenessScore + stressScore);
    
    let status = 'Prime for Match Day';
    let color = 'text-emerald-500';
    if (total < 50) { 
        status = 'High Injury Risk'; 
        color = 'text-red-500'; 
    } else if (total < 75) { 
        status = 'Needs Light Practice'; 
        color = 'text-orange-500'; 
    }

    return { score: total, status, color, raw: log };
  };

  const generateInsights = async () => {
    setLoading(true);
    setAiInsights('');
    try {
      const response = await api.get('performance/ai_analysis/');
      setAiInsights(response.data.analysis);
    } catch (error) {
      console.error('Failed to generate insights:', error);
      setAiInsights('⚠️ Error generating insights. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500 selection:text-slate-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-orange-500 text-slate-900 px-2 py-1 rounded text-xs font-bold tracking-widest uppercase">Cricket Focus</span>
              <h1 className="text-3xl font-bold text-white tracking-tight">Athlete Performance Engine</h1>
            </div>
            <p className="mt-1 text-slate-400 max-w-2xl">
              Your software-based sports scientist. We track your biological markers natively—no expensive wearables required—to optimize your cricket performance.
            </p>
          </div>
          <button
            onClick={() => navigate('/athlete')}
            className="text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-full transition shadow-sm self-start md:self-auto"
          >
            ← Dashboard
          </button>
        </div>

        {/* Top KPI Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Readiness Score</p>
                <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-black ${recoveryData.color}`}>{recoveryData.score}</span>
                    <span className="text-slate-500 font-bold">/100</span>
                </div>
                <p className={`text-sm mt-2 font-medium ${recoveryData.color}`}>{recoveryData.status}</p>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">CNS Strain (Stress/Fatigue)</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                        {recoveryData.raw ? ((recoveryData.raw.fatigue_level + recoveryData.raw.stress_level)/2).toFixed(1) : '0'}
                    </span>
                    <span className="text-slate-500 font-bold">/10</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-orange-500 h-full" style={{ width: `${recoveryData.raw ? ((recoveryData.raw.fatigue_level + recoveryData.raw.stress_level)/2)*10 : 0}%` }}></div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Muscular Load</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                        {recoveryData.raw ? ((recoveryData.raw.muscle_soreness + recoveryData.raw.perceived_exertion)/2).toFixed(1) : '0'}
                    </span>
                    <span className="text-slate-500 font-bold">/10</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: `${recoveryData.raw ? ((recoveryData.raw.muscle_soreness + recoveryData.raw.perceived_exertion)/2)*10 : 0}%` }}></div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Last Sleep</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white">{recoveryData.raw ? recoveryData.raw.sleep_hours : '0'}</span>
                        <span className="text-slate-500 font-bold">hrs</span>
                    </div>
                </div>
                <p className="text-sm text-slate-400 mt-2">
                   {recoveryData.raw && recoveryData.raw.sleep_hours >= 8 ? '✅ Optimal recovery' : '⚠️ Under-recovered'}
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Charts (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Chart 1: Fatigue & Exertion */}
            <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-6">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-white">Systemic Strain & Effort Over Time</h2>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={logs} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
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
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 10]} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      name="Systemic Fatigue"
                      dataKey="fatigue_level" 
                      stroke="#ef4444" 
                      fillOpacity={1} fill="url(#colorFatigue)"
                      strokeWidth={3} 
                      activeDot={{ r: 6, strokeWidth: 0 }} 
                    />
                    <Area 
                      type="monotone" 
                      name="Perceived Exertion"
                      dataKey="perceived_exertion" 
                      stroke="#f97316" 
                      fillOpacity={1} fill="url(#colorExertion)"
                      strokeWidth={3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Sleep & Training Duration */}
            <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-6">
              <h2 className="text-lg font-bold text-white mb-6">Workload vs. Recovery Matrix</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={logs} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    {/* Left Y Axis for Sleep */}
                    <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    {/* Right Y Axis for Duration */}
                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', color: '#fff' }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      name="Sleep (hrs)"
                      dataKey="sleep_hours" 
                      stroke="#38bdf8" // Light blue
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#38bdf8', strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      name="Training Vol (mins)"
                      dataKey="training_duration_mins" 
                      stroke="#a855f7" // Purple
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#a855f7', strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column: AI Insights (1/3 width) */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-black rounded-2xl shadow-2xl border border-slate-700 p-6 flex flex-col h-full min-h-[600px] relative overflow-hidden">
            
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500 rounded-full blur-[80px] opacity-20"></div>

            <div className="mb-6 flex justify-between items-center relative z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zm0 14l-10-5v2l10 5 10-5v-2l-10 5zm0 4l-10-5v2l10 5 10-5v-2l-10 5z"/>
                    </svg>
                </span>
                Cricket AI Coach
              </h2>
            </div>

            {!aiInsights && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10">
                <div className="w-20 h-20 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/10 rotate-3">
                  <span className="text-4xl">🏏</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Analyze Match Readiness</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Our intelligence engine will parse your bio-markers to generate a custom nets session and fueling plan for your exact recovery state.
                </p>
                <button
                  onClick={generateInsights}
                  className="w-full bg-orange-500 text-white font-bold py-4 px-4 rounded-xl hover:bg-orange-600 transition shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                >
                  Generate Cricket Plan
                </button>
              </div>
            )}

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                <div className="w-12 h-12 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
                <p className="text-orange-500 font-semibold text-sm animate-pulse tracking-wide uppercase">Processing Biometrics...</p>
              </div>
            )}

            {aiInsights && !loading && (
              <div className="flex-1 flex flex-col relative z-10">
                <div className="prose prose-invert prose-orange prose-sm max-w-none flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <ReactMarkdown>{aiInsights}</ReactMarkdown>
                </div>
                <button
                  onClick={generateInsights}
                  className="mt-6 w-full bg-slate-800 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-700 transition border border-slate-700"
                >
                  Regenerate Analysis
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
