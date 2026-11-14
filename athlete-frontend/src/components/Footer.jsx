import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import BrandLogo from './BrandLogo';

export default function Footer() {
  const [modalContent, setModalContent] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const openModal = (type) => setModalContent(type);
  const closeModal = () => setModalContent(null);

  const handleNavClick = (hash) => {
    if (location.pathname === '/') {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/' + hash);
    }
  };

  return (
    <>
      <footer className="bg-[#0c2340] text-slate-300 font-sans border-t border-slate-800 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-slate-800/80">

            {/* Brand Column (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <Link to="/" className="inline-block transition-opacity hover:opacity-95" title="DronaMate">
                <BrandLogo inverted size="lg" />
              </Link>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
                Next-generation athletic mentorship, sports telemetry tracking, and elite coach reservation platform designed to accelerate field-ready performance.
              </p>

              <div className="pt-2 space-y-2 text-xs text-slate-300">
                <a
                  href="mailto:info@dronamate.in"
                  className="flex items-center gap-2 hover:text-white transition group"
                  title="Send us an email"
                >
                  <span className="text-[#ff5500]">✉</span>
                  <span className="group-hover:underline">info@dronamate.in</span>
                </a>
                <a
                  href="tel:+918219486269"
                  className="flex items-center gap-2 hover:text-white transition group"
                  title="Call our booking support"
                >
                  <span className="text-[#ff5500]">📞</span>
                  <span className="font-mono group-hover:underline">+91 8219486269</span>
                </a>
              </div>
            </div>

            {/* Links Columns (7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
              {/* Training */}
              <div>
                <h4 className="text-white font-bold uppercase tracking-wider mb-4 font-display">
                  Training
                </h4>
                <ul className="space-y-2.5 text-slate-400">
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavClick('#categories')}
                      className="hover:text-white transition text-left cursor-pointer"
                    >
                      All Disciplines
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavClick('#blueprint')}
                      className="hover:text-white transition text-left cursor-pointer"
                    >
                      Performance Blueprint
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavClick('#audit')}
                      className="hover:text-white transition text-left cursor-pointer"
                    >
                      Biomechanical Audits
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavClick('#coaches')}
                      className="hover:text-white transition text-left cursor-pointer"
                    >
                      Academy Scouting
                    </button>
                  </li>
                </ul>
              </div>

              {/* Verified Directory */}
              <div>
                <h4 className="text-white font-bold uppercase tracking-wider mb-4 font-display">
                  Verified Directory
                </h4>
                <ul className="space-y-2.5 text-slate-400">
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavClick('#coaches')}
                      className="hover:text-white transition text-left cursor-pointer"
                    >
                      BCCI Certified Coaches
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavClick('#coaches')}
                      className="hover:text-white transition text-left cursor-pointer"
                    >
                      Pro Strength Specialists
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavClick('#coaches')}
                      className="hover:text-white transition text-left cursor-pointer"
                    >
                      Field Physio Specialists
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => openModal('verification')}
                      className="hover:text-white transition text-left cursor-pointer"
                    >
                      Verification Protocol
                    </button>
                  </li>
                </ul>
              </div>

              {/* Platform */}
              <div>
                <h4 className="text-white font-bold uppercase tracking-wider mb-4 font-display">
                  Platform
                </h4>
                <ul className="space-y-2.5 text-slate-400">
                  <li>
                    <button
                      type="button"
                      onClick={() => openModal('about')}
                      className="hover:text-white transition text-left cursor-pointer"
                    >
                      About Us
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => openModal('facilities')}
                      className="hover:text-white transition text-left cursor-pointer"
                    >
                      Partner Facilities
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => openModal('privacy')}
                      className="hover:text-white transition text-left cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => openModal('terms')}
                      className="hover:text-white transition text-left cursor-pointer"
                    >
                      Terms of Service
                    </button>
                  </li>
                </ul>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Drona Mate Systems Pvt Ltd. All athletic rights reserved.</p>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-[11px] tracking-wider uppercase">
                High Performance Network Live
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Dynamic Modals */}
      {modalContent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c2340] border border-slate-700 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-white font-display">
                {modalContent === 'about' && 'About DronaMate'}
                {modalContent === 'privacy' && 'Privacy Policy'}
                {modalContent === 'terms' && 'Terms of Service'}
                {modalContent === 'verification' && 'Verification Protocol'}
                {modalContent === 'facilities' && 'Partner Training Facilities'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="text-xs leading-relaxed space-y-3 text-slate-300">
              {modalContent === 'about' && (
                <>
                  <p>
                    DronaMate is India's dedicated coach and trainer booking platform engineered for athletes striving for state, national, and competitive excellence.
                  </p>
                  <p>
                    Our mission is to eliminate barriers between aspiring players and verified technical sports masters. We connect athletes with BCCI, ICC, CSCS, and accredited technical mentors across Cricket, Strength &amp; Conditioning, Physiotherapy, Dietetics, and Sports Yoga.
                  </p>
                  <p>
                    For partnerships or academy inquiries, reach us at <a href="mailto:info@dronamate.in" className="text-[#ff5500] underline">info@dronamate.in</a> or call <a href="tel:+918219486269" className="text-[#ff5500] underline">+91 8219486269</a>.
                  </p>
                </>
              )}

              {modalContent === 'privacy' && (
                <>
                  <p>
                    DronaMate is committed to protecting your personal and athletic data. We collect profile, session reservation, and contact information strictly to coordinate coaching and training schedules.
                  </p>
                  <p>
                    We do not sell personal information to third parties. All booking credentials and transaction records are encrypted using industry standard protocols.
                  </p>
                  <p>
                    Contact <a href="mailto:info@dronamate.in" className="text-[#ff5500] underline">info@dronamate.in</a> for privacy or data inquiries.
                  </p>
                </>
              )}

              {modalContent === 'terms' && (
                <>
                  <p>
                    By booking or offering training sessions on DronaMate, you agree to adhere to our athletic conduct guidelines, arrive punctually at reserved facility slots, and honor cancellations in accordance with coach policies.
                  </p>
                  <p>
                    Coaches are independent sports professionals certified under relevant sports authorities. DronaMate acts as the connection and scheduling technology platform.
                  </p>
                </>
              )}

              {modalContent === 'verification' && (
                <>
                  <p>
                    Every coach and trainer listed on DronaMate undergoes rigorous document inspection, verifying sporting certifications (BCCI, ICC, SAI, CSCS, NSCA, or affiliated sport federations), identity, and background.
                  </p>
                  <p>
                    Look for the "Verified" badge on coach profiles to ensure certified technical instruction.
                  </p>
                </>
              )}

              {modalContent === 'facilities' && (
                <>
                  <p>
                    DronaMate partners with top tier cricket academies, indoor turf nets, strength gyms, and sports rehab centers across major Indian metros including Bengaluru, Mumbai, Delhi-NCR, Hyderabad, and Chennai.
                  </p>
                  <p>
                    To onboard your facility as an accredited training partner ground, reach out to <a href="mailto:info@dronamate.in" className="text-[#ff5500] underline">info@dronamate.in</a> or call <a href="tel:+918219486269" className="text-[#ff5500] underline">+91 8219486269</a>.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="bg-[#ff5500] hover:bg-[#ea4c00] text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer font-display"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
