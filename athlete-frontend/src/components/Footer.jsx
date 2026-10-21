import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [modalContent, setModalContent] = useState(null);

  const openModal = (type) => setModalContent(type);
  const closeModal = () => setModalContent(null);

  return (
    <>
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg mb-4 transition hover:opacity-90">
              <img src="/logo.png" alt="DronaMate Logo" className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mt-2">
              DronaMate connects athletes with top-tier coaches, smart cricket metrics, and performance analytics. Master your batting craft against pace and spin.
            </p>
            <div className="mt-4 space-y-1.5 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <span className="text-orange-500 font-bold">Call:</span>
                <a href="tel:+919368029835" className="hover:text-orange-400 font-mono transition">
                  +91 93680 29835
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-orange-500 font-bold">Email:</span>
                <a href="mailto:support@dronamate.in" className="hover:text-orange-400 transition">
                  support@dronamate.in
                </a>
              </p>
            </div>
          </div>
          
          {/* Platform */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/register" className="hover:text-orange-400 transition">
                  Find a Cricket Coach
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-orange-400 transition">
                  Join as Coach / Mentor
                </Link>
              </li>
              <li>
                <Link to="/performance" className="hover:text-orange-400 transition">
                  Performance & Batsman Card
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Company</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="/#about" className="hover:text-orange-400 transition">
                  About DronaMate
                </a>
              </li>
              <li>
                <button 
                  onClick={() => openModal('careers')} 
                  className="hover:text-orange-400 transition text-left"
                >
                  Careers
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openModal('contact')} 
                  className="hover:text-orange-400 transition text-left"
                >
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Legal</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => openModal('privacy')} 
                  className="hover:text-orange-400 transition text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openModal('terms')} 
                  className="hover:text-orange-400 transition text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} DronaMate Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="tel:+919368029835" className="hover:text-slate-300 transition">
              +91 93680 29835
            </a>
            <span className="text-slate-700">•</span>
            <a href="mailto:support@dronamate.in" className="hover:text-slate-300 transition">
              support@dronamate.in
            </a>
          </div>
        </div>
      </footer>

      {/* Modal Dialog for Legal / Company Links */}
      {modalContent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl text-slate-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-white">
                {modalContent === 'privacy' && 'Privacy Policy'}
                {modalContent === 'terms' && 'Terms of Service'}
                {modalContent === 'careers' && 'Careers at DronaMate'}
                {modalContent === 'contact' && 'Contact DronaMate Support'}
              </h3>
              <button 
                onClick={closeModal} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="text-sm leading-relaxed space-y-3 text-slate-300">
              {modalContent === 'privacy' && (
                <>
                  <p>
                    <strong>DronaMate</strong> is committed to safeguarding the personal and athletic data of our users. We collect profile details, match performance metrics (runs, strike rates, dismissals against pace and spin), and communication logs strictly to deliver personalized sports analysis and coaching services.
                  </p>
                  <p>
                    We do not sell, rent, or monetize your personal statistics to third-party advertisers. All biometric and performance data are securely encrypted in transit and at rest.
                  </p>
                  <p className="text-xs text-slate-400">
                    Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </>
              )}

              {modalContent === 'terms' && (
                <>
                  <p>
                    By registering or using the <strong>DronaMate</strong> platform, athletes and coaches agree to abide by our fair play policy and respectful communication standards.
                  </p>
                  <p>
                    Coaches agree that all tactical guidance and workout regimens are tailored responsibly. Athletes are advised to consult sports medicine practitioners before initiating intense physical conditioning.
                  </p>
                  <p className="text-xs text-slate-400">
                    Governed by the laws of India. For full legal documentation, contact legal@dronamate.in.
                  </p>
                </>
              )}

              {modalContent === 'careers' && (
                <>
                  <p>
                    We're building the future of cricket athlete intelligence and high-performance training.
                  </p>
                  <p>
                    We are currently looking for sports data scientists, cricket coaches, and full-stack software engineers passionate about Indian sports.
                  </p>
                  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 mt-4">
                    <p className="font-semibold text-white mb-1">Interested in joining our team?</p>
                    <p className="text-xs text-slate-400 mb-3">Send your portfolio or CV to:</p>
                    <a 
                      href="mailto:careers@dronamate.in?subject=Application%20for%20DronaMate%20Team" 
                      className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
                    >
                      careers@dronamate.in
                    </a>
                  </div>
                </>
              )}

              {modalContent === 'contact' && (
                <>
                  <p>
                    Have questions about DronaMate or need help setting up your batsman profile?
                  </p>
                  <div className="space-y-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700 mt-3">
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-bold block">Direct Hotline</span>
                      <a href="tel:+919368029835" className="text-base font-bold text-orange-400 hover:underline">
                        +91 93680 29835
                      </a>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-bold block">Support Email</span>
                      <a href="mailto:support@dronamate.in" className="text-base font-bold text-orange-400 hover:underline">
                        support@dronamate.in
                      </a>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-bold block">Support Hours</span>
                      <span className="text-sm text-slate-300">Mon – Sat, 9:00 AM – 7:00 PM IST</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button 
                onClick={closeModal} 
                className="px-5 py-2 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition"
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
