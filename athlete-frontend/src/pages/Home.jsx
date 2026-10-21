import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const elem = document.querySelector(location.hash);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-orange-500 selection:text-slate-900">
      
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 md:py-28 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="md:w-1/2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-6">
            🏏 Official Cricket Athlete Platform
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-white">
            Train smarter. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Perform better.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-6 max-w-lg leading-relaxed">
            Your sports journey, powered by the right cricket coaches, training, and performance insights. Connect with experienced mentors, access personalized batting drills, and track pace vs spin progress — all in one ecosystem.
          </p>
          <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-8">
            Built for athletes. Powered by coaches.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/register')}
              className="bg-orange-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-orange-600 transition shadow-lg shadow-orange-500/30 text-base flex justify-center items-center gap-2 min-h-[44px]"
            >
              Start Your Journey
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="bg-slate-800 text-white font-bold px-8 py-4 rounded-xl hover:bg-slate-700 transition border border-slate-700 text-base min-h-[44px]"
            >
              Log In
            </button>
          </div>
        </div>

        {/* Sports Visual / Hero Image */}
        <div className="md:w-1/2 relative flex justify-center z-10 w-full">
          <div className="absolute inset-0 bg-orange-500 blur-[120px] opacity-20 rounded-full w-3/4 h-3/4 mx-auto"></div>
          <div className="relative w-full max-w-lg aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 group">
            <img 
              src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Cricket Athlete Training" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
            
            {/* Floating Stats Card overlay */}
            <div className="absolute bottom-6 left-6 right-6 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Batsman Card</p>
                <p className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Pace vs Spin Analytics Ready
                </p>
              </div>
              <div className="h-10 w-24 bg-slate-800 rounded-lg flex items-end p-1 gap-1">
                <div className="w-full bg-orange-500 rounded-sm h-[40%]"></div>
                <div className="w-full bg-orange-500 rounded-sm h-[70%]"></div>
                <div className="w-full bg-orange-500 rounded-sm h-[60%]"></div>
                <div className="w-full bg-orange-500 rounded-sm h-[90%]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is DronaMate? (#about) */}
      <section id="about" className="bg-slate-950 py-20 border-t border-slate-800 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">What is DronaMate?</h2>
            <p className="text-orange-500 font-semibold text-lg mb-2">Everything a cricket athlete needs to move forward.</p>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              DronaMate connects the key elements of an athlete's development in one unified platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-orange-500/50 transition-all hover:-translate-y-1 group flex flex-col h-full">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-orange-500/10 transition-colors">🏏</div>
              <h3 className="text-lg font-bold mb-2 text-white">Find the Right Coach</h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-grow">
                Discover coaches based on sport, speciality, experience, location and cricket training requirements.
              </p>
            </div>
            
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-orange-500/50 transition-all hover:-translate-y-1 group flex flex-col h-full">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-orange-500/10 transition-colors">📊</div>
              <h3 className="text-lg font-bold mb-2 text-white">Track Your Cricket Metrics</h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-grow">
                Record and monitor batsman metrics: runs, balls faced, strike rate, and dismissals against medium fast vs spin.
              </p>
            </div>
            
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-orange-500/50 transition-all hover:-translate-y-1 group flex flex-col h-full">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-orange-500/10 transition-colors">🎯</div>
              <h3 className="text-lg font-bold mb-2 text-white">Personalised Training</h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-grow">
                Build structured training plans around your goals, playing position, and development stage.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-orange-500/50 transition-all hover:-translate-y-1 group flex flex-col h-full">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-orange-500/10 transition-colors">💬</div>
              <h3 className="text-lg font-bold mb-2 text-white">Connect & Learn</h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-grow">
                Communicate with coaches, exchange video drills, and receive guidance well beyond the net session.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* For Athletes Section (#athletes) */}
      <section id="athletes" className="py-20 bg-slate-900 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-3 inline-block uppercase">For Athletes</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">How It Works For You</h2>
            <p className="text-slate-400 text-lg">Your path to cricket mastery in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="relative z-10 flex flex-col items-center text-center bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="w-16 h-16 bg-slate-900 border-2 border-slate-700 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-300 mb-4 shadow-xl">1</div>
              <h3 className="text-lg font-bold text-white mb-2">Create Athlete Profile</h3>
              <p className="text-slate-400 text-sm">Set up your profile with your club, batting style, preferred position, and stats.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center bg-slate-950 p-6 rounded-2xl border border-orange-500/30 shadow-lg shadow-orange-500/5">
              <div className="w-16 h-16 bg-orange-500/20 border-2 border-orange-500 rounded-2xl flex items-center justify-center text-2xl font-black text-orange-400 mb-4">2</div>
              <h3 className="text-lg font-bold text-white mb-2">Connect With Coaches</h3>
              <p className="text-slate-400 text-sm">Browse verified cricket coaches and schedule 1-on-1 mentorship or drills.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="w-16 h-16 bg-slate-900 border-2 border-slate-700 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-300 mb-4 shadow-xl">3</div>
              <h3 className="text-lg font-bold text-white mb-2">Track & Level Up</h3>
              <p className="text-slate-400 text-sm">Log matches, analyze your pace vs spin split, and generate AI coaching breakdowns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Dashboard Spotlight (#performance) */}
      <section id="performance" className="bg-slate-950 py-20 border-y border-slate-800 overflow-hidden scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <span className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-6 inline-block">CRICKET ANALYTICS</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">Batsman Performance Card</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Ditch the complex spreadsheets. DronaMate delivers an elite cricket dashboard designed specifically for batsman tracking and match preparation.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-slate-300">
                <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Split performance against Medium Fast pace vs. Spin bowling.
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Track balls faced, runs scored, and dismissal patterns.
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Instant AI Batsman Analysis and dual coach feedback.
              </li>
            </ul>
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="bg-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-orange-600 transition shadow-md shadow-orange-500/20 text-sm min-h-[44px]"
              >
                Explore Dashboard
              </button>
            </div>
          </div>
          
          <div className="md:w-1/2 relative w-full">
             <div className="absolute inset-0 bg-orange-500 blur-[100px] opacity-10 rounded-full"></div>
             {/* Abstract Dashboard UI representation */}
             <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-mono text-slate-400 ml-2">batsman-card.cricket</span>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-4">
                      <div className="text-slate-400 text-xs uppercase mb-1">Batting Average</div>
                      <div className="text-2xl font-bold text-emerald-400">42.50</div>
                      <span className="text-[10px] text-slate-500">18 Innings</span>
                    </div>
                    <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-4">
                      <div className="text-slate-400 text-xs uppercase mb-1">Strike Rate</div>
                      <div className="text-2xl font-bold text-orange-500">138.4</div>
                      <span className="text-[10px] text-slate-500">T20 / One-Day</span>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-750 space-y-3">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-orange-400">Medium Fast Pace</span>
                      <span className="text-slate-300">SR: 135.2 | 480 Runs</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full w-[65%]"></div>
                    </div>
                    <div className="flex justify-between text-xs font-bold pt-1">
                      <span className="text-cyan-400">Spin Bowling</span>
                      <span className="text-slate-300">SR: 142.8 | 285 Runs</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full w-[55%]"></div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* For Coaches Section (#coaches) */}
      <section id="coaches" className="bg-slate-900 py-20 scroll-mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block p-4 rounded-2xl bg-slate-800 border border-slate-700 mb-6">
            <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Coaches. Your expertise deserves a platform.</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Provide 1-on-1 cricket mentorship, host live video masterclasses, and monitor your athletes' batsman scorecards and pace vs spin breakdown. DronaMate handles the logistics so you can focus on building champions.
          </p>
          <button 
            onClick={() => navigate('/register')}
            className="bg-orange-500 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-orange-600 transition shadow-lg shadow-orange-500/25 min-h-[44px]"
          >
            Join as a Coach
          </button>
        </div>
      </section>

      {/* Social Proof / Final CTA Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-white">Your journey to better cricket performance starts here.</h2>
          <p className="text-lg sm:text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Whether you're an emerging club batsman or a certified coach, DronaMate provides the ecosystem to reach your peak.
          </p>
          <button 
            onClick={() => navigate('/register')}
            className="bg-orange-500 text-white font-bold px-10 py-4 rounded-xl hover:bg-orange-600 transition text-lg shadow-xl shadow-orange-500/25 min-h-[44px]"
          >
            Create Your Account
          </button>
        </div>
      </section>

    </div>
  );
}
