import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as faceapi from 'face-api.js';

// ==========================================
// CUSTOM ICONS (SVG inline)
// ==========================================
const Icon = ({ size = 24, className = "", children }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{children}</svg>
);

const ArrowRight = (p) => <Icon {...p}><path d="M5 12h14M12 5l7 7-7 7"/></Icon>;
const Shield = (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon>;
const Sparkles = (p) => <Icon {...p}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1-1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></Icon>;
const User = (p) => <Icon {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>;
const Users = (p) => <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>;
const MessageCircle = (p) => <Icon {...p}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></Icon>;
const Clock = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>;
const Activity = (p) => <Icon {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Icon>;
const TrendingDown = (p) => <Icon {...p}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></Icon>;
const Brain = (p) => <Icon {...p}><path d="M9.5 2A2.5 2.5 0 0 0 7 4.5v15a2.5 2.5 0 0 0 4.9 1 2.5 2.5 0 0 0 4.2 0 2.5 2.5 0 0 0 4.9-1v-15A2.5 2.5 0 0 0 18.5 2H9.5z"/><path d="M12 2v20"/></Icon>;
const Database = (p) => <Icon {...p}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></Icon>;
const PhoneCall = (p) => <Icon {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></Icon>;
const Camera = (p) => <Icon {...p}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></Icon>;
const CameraOff = (p) => <Icon {...p}><line x1="2" y1="2" x2="22" y2="22"/><path d="M10.41 4H14l2.5 3h3.5a2 2 0 0 1 2 2v9m-1.55 2.45c-.44.34-1 .55-1.56.55H4a2 2 0 0 1-2-2V9c0-.55.2-1.05.55-1.5M10.5 10.5a3 3 0 0 0 4 4"/></Icon>;
const Settings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></Icon>;

// Patient Dashboard Icons
const BookOpen = (p) => <Icon {...p}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></Icon>;
const TrendingUp = (p) => <Icon {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></Icon>;
const Mic = (p) => <Icon {...p}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></Icon>;
const Send = (p) => <Icon {...p}><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></Icon>;
const Star = (p) => <Icon {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Icon>;
const MapPin = (p) => <Icon {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></Icon>;
const Gift = (p) => <Icon {...p}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" x2="12" y1="22" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></Icon>;
const Search = (p) => <Icon {...p}><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></Icon>;
const Bell = (p) => <Icon {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Icon>;
const AlertTriangle = (p) => <Icon {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Icon>;
const Volume2 = (p) => <Icon {...p}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></Icon>;
const VolumeX = (p) => <Icon {...p}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></Icon>;
const PieChart = (p) => <Icon {...p}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></Icon>;
const Smile = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></Icon>;
const Frown = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></Icon>;
const Meh = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></Icon>;
const Linkedin = (p) => <Icon {...p}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></Icon>;
const Mail = (p) => <Icon {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Icon>;

const Heart = (p) => <Icon {...p}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></Icon>;
const HeartPulse = (p) => <Icon {...p}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M22 12h-4l-3 5-3-10-3 8-2-3H2"/></Icon>;
const Target = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Icon>;
const Menu = (p) => <Icon {...p}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></Icon>;
const Zap = (p) => <Icon {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Icon>;
const HelpCircle = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></Icon>;

const theme = {
  bg: 'bg-[#F2F9F6]/25 backdrop-blur-md', 
  textMain: 'text-[#2C5555]',
  textDark: 'text-slate-800',
  outset: 'glass-card rounded-[2rem]',
  outsetHover: 'glass-card-hover',
  btnTeal: 'glass-btn-shine bg-gradient-to-r from-[#3A7070] to-[#2C5555] text-white shadow-[0_10px_20px_rgba(58,112,112,0.25)] hover:shadow-[0_15px_30px_rgba(58,112,112,0.35)] hover:-translate-y-0.5 transition-all border border-white/20',
  btnOutline: 'glass-btn-shine border border-[#3A7070]/25 text-[#3A7070] shadow-[0_10px_20px_rgba(58,112,112,0.03)] hover:border-[#3A7070]/40 hover:shadow-[0_15px_30px_rgba(58,112,112,0.08)] hover:-translate-y-0.5 transition-all bg-white/45 backdrop-blur-sm'
};
const NeffiLogo = ({ size = "w-10 h-10", onClick }) => (
  <div onClick={onClick} className={`${size} relative flex items-center justify-center cursor-pointer group`}>
    <div className="absolute inset-0 bg-[#3A7070] rounded-xl blur-[6px] group-hover:blur-[8px] transition-all opacity-30"></div>
    <div className={`absolute inset-0 bg-transparent rounded-xl flex items-center justify-center z-10`}>
      <Star size={size === "w-10 h-10" ? 28 : 36} className="text-[#3A7070] fill-[#3A7070]" />
    </div>
  </div>
);

const DynamicLoginIllustration = ({ step, className }) => {
  return (
    <svg viewBox="0 0 400 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        {`
          @keyframes scan-line {
            0%, 100% { transform: translateY(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            50% { transform: translateY(60px); }
          }
        `}
      </style>
      
      {/* Universal Background for all steps */}
      <circle cx="200" cy="200" r="180" fill="#E6F0F0" opacity="0.6" />
      <circle cx="200" cy="200" r="130" fill="white" opacity="0.8" />
      <ellipse cx="200" cy="340" rx="90" ry="12" fill="#3A7070" opacity="0.2" className="animate-pulse" />

      {step === 1 && (
        <g className="animate-bounce" style={{ animationDuration: '3s' }}>
          {/* Step 1: Secure Identity & Trust (Glowing Keyhole Shield) */}
          <path d="M200 60 L280 90 V180 C280 250 200 310 200 330 C200 310 120 250 120 180 V90 L200 60 Z" fill="white" stroke="#3A7070" strokeWidth="8" strokeLinejoin="round" />
          <path d="M200 80 L260 100 V180 C260 230 200 280 200 295 C200 280 140 230 140 180 V100 L200 80 Z" fill="#F2F9F6" />
          
          {/* Keyhole */}
          <circle cx="200" cy="180" r="18" fill="#F43F5E" className="animate-pulse" />
          <path d="M192 190 L188 220 H212 L208 190 Z" fill="#F43F5E" className="animate-pulse" />
          
          {/* Trust Network Nodes */}
          <circle cx="200" cy="220" r="80" fill="none" stroke="#8FA989" strokeWidth="2" strokeDasharray="8 8" className="animate-spin" style={{animationDuration: '10s'}} />
          <circle cx="100" cy="120" r="6" fill="#D4A373" className="animate-ping" />
          <circle cx="300" cy="250" r="5" fill="#8FA989" />
          <circle cx="130" cy="280" r="4" fill="#3A7070" />
        </g>
      )}

      {step === 2 && (
        <g className="animate-bounce" style={{ animationDuration: '3s' }}>
          {/* Step 2: OTP Verification Scanner */}
          <rect x="130" y="100" width="140" height="220" rx="20" fill="#2C5555" stroke="#3A7070" strokeWidth="6" />
          <rect x="140" y="110" width="120" height="200" rx="12" fill="#F2F9F6" />
          
          {/* Phone Screen Elements */}
          <rect x="175" y="120" width="50" height="6" rx="3" fill="#8FA989" opacity="0.5" />
          
          <circle cx="200" cy="180" r="22" fill="white" stroke="#3A7070" strokeWidth="4" />
          <path d="M190 175 V165 C190 155 210 155 210 165 V175" stroke="#8FA989" strokeWidth="4" strokeLinecap="round" />
          <circle cx="200" cy="183" r="4" fill="#F43F5E" />
          
          <rect x="160" y="225" width="80" height="8" rx="4" fill="#E6F0F0" />
          <rect x="160" y="240" width="60" height="8" rx="4" fill="#E6F0F0" />
          <rect x="160" y="260" width="80" height="18" rx="9" fill="#3A7070" />
          
          {/* Scanning Laser Line */}
          <line x1="130" y1="160" x2="270" y2="160" stroke="#F43F5E" strokeWidth="2" opacity="0" style={{animation: 'scan-line 3s infinite ease-in-out'}} />
          <polygon points="130,160 270,160 250,180 150,180" fill="#F43F5E" opacity="0.08" style={{animation: 'scan-line 3s infinite ease-in-out'}} />

          {/* Floating OTP Bubble */}
          <g className="animate-pulse" style={{ animationDuration: '2s' }}>
            <path d="M250 120 C250 100 270 90 290 90 C310 90 320 100 320 120 C320 140 310 150 290 150 L270 160 L275 145 C260 140 250 130 250 120 Z" fill="#D4A373" />
            <circle cx="275" cy="120" r="3" fill="white" />
            <circle cx="285" cy="120" r="3" fill="white" />
            <circle cx="295" cy="120" r="3" fill="white" />
          </g>

          <ellipse cx="200" cy="210" rx="100" ry="20" fill="none" stroke="#8FA989" strokeWidth="3" opacity="0.6" strokeDasharray="10 10" transform="rotate(-15 200 210)" />
          
          <circle cx="100" cy="140" r="5" fill="#8FA989" className="animate-pulse" />
          <circle cx="300" cy="230" r="4" fill="#D4A373" className="animate-ping" />
        </g>
      )}

      {step === 3 && (
        <g className="animate-bounce" style={{ animationDuration: '3s' }}>
          {/* Step 3: Natural Sanctuary (Geometric Character under Leaf) */}
          <path d="M200 50 C320 50 360 150 280 230 C200 310 80 310 40 230 C0 150 80 50 200 50 Z" fill="#8FA989" opacity="0.2" />
          <path d="M200 80 C270 80 290 150 240 200 C190 250 110 250 90 200 C70 150 130 80 200 80 Z" fill="#3A7070" opacity="0.1" />

          <circle cx="160" cy="150" r="28" fill="#3A7070" />
          <path d="M160 185 C185 185 205 205 205 240 L205 290 L115 290 L115 240 C115 205 135 185 160 185 Z" fill="#2C5555" />
          <path d="M110 275 C70 275 60 305 90 315 L230 315 C260 305 250 275 210 275 Z" fill="#3A7070" />
          
          <path d="M210 205 L260 190 L285 215 L235 230 Z" fill="#D4A373" className="animate-pulse" />
          <path d="M210 200 L260 185 L285 210 L235 225 Z" fill="white" />
          
          <path d="M250 160 C235 160 220 145 220 130 C220 115 235 100 250 115 C265 100 280 115 280 130 C280 145 265 160 250 160 Z" fill="#F43F5E" className="animate-bounce" style={{animationDuration: '2s'}} />
          
          <circle cx="310" cy="130" r="6" fill="#D4A373" className="animate-ping" />
          <circle cx="90" cy="110" r="5" fill="#8FA989" className="animate-pulse" />
          <circle cx="270" cy="250" r="4" fill="#D4A373" />
        </g>
      )}
    </svg>
  );
};

// ==========================================
// 1. ULTIMATE LANDING PAGE (Level 3 Design)
// ==========================================
const LandingPage = ({ setView }) => {
  const [activeIncident, setActiveIncident] = useState(0);

  useEffect(() => {
    const sections = document.querySelectorAll('.scroll-zoom-section');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('in-view');
        else e.target.classList.remove('in-view');
      });
    }, { threshold: 0.1 });
    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <>
    <div className="min-h-screen bg-transparent overflow-x-hidden text-[#1E293B] font-inter selection:bg-[#3A7070] selection:text-white relative">
      
      <div className="floating-blob w-[600px] h-[600px] bg-[#8FA989] top-[-100px] right-[-200px]"></div>
      <div className="floating-blob-slow w-[800px] h-[800px] bg-[#E6F0F0] top-[800px] left-[-400px]"></div>
      <div className="floating-blob w-[600px] h-[600px] bg-[#3A7070] opacity-10 top-[2200px] right-[-200px]" style={{animationDelay: '2s'}}></div>

      {/* 🚀 HEADER */}
      <div className="sticky top-4 z-[100] w-full max-w-[1200px] mx-auto px-4">
        <nav className="w-full px-6 py-4 flex justify-between items-center rounded-2xl glass-nav backdrop-blur-md">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
            <NeffiLogo size="w-10 h-10" />
            <span className="text-2xl font-raleway font-black text-transparent bg-clip-text bg-gradient-to-r from-[#2C5555] to-[#3A7070] tracking-tight">Neffi AI</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 font-space text-[15px] font-semibold text-slate-500">
            <button onClick={() => setView('landing')} className="text-gradient-teal font-black transition-colors cursor-pointer">Home</button>
            <button onClick={() => {document.getElementById('story').scrollIntoView({behavior: 'smooth'})}} className="hover:text-[#3A7070] transition-colors cursor-pointer">Our Story</button>
            <button onClick={() => setView('login-admin')} className="hover:text-[#3A7070] transition-colors cursor-pointer">Clinical Hub</button>
            <button onClick={() => setView('login-patient')} className="hover:text-[#3A7070] transition-colors cursor-pointer">Sanctuary</button>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setView('login-patient')} className="hidden md:block font-inter text-[15px] font-semibold text-slate-600 hover:text-[#3A7070] transition-colors cursor-pointer">
              Log in
            </button>
            <button onClick={() => setView('login-patient')} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3A7070] to-[#2C5555] text-white font-space font-bold text-[15px] shadow-md shadow-[#3A7070]/25 hover:from-[#2C5555] hover:to-[#1B4332] hover:scale-105 hover:shadow-lg hover:shadow-[#2C5555]/30 transition-all cursor-pointer tracking-wide">
              Get Started
            </button>
          </div>
        </nav>
      </div>
      <main className="relative z-10 w-full">

        {/* ─────────── SECTION 1: HERO ─────────── */}
        <section className="w-full min-h-screen flex items-center relative overflow-hidden pt-20 pb-16 animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-[#DCF0EC]/65 via-white/40 to-[#E4F5F1]/65 z-0" />
          <div className="absolute top-[-60px] left-[-60px] w-[650px] h-[650px] bg-[#0D7070]/10 rounded-full blur-[130px] z-0" />
          <div className="absolute bottom-[-40px] right-[-40px] w-[550px] h-[550px] bg-[#2AA870]/10 rounded-full blur-[110px] z-0" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-[#D4A373]/6 rounded-full blur-[80px] z-0" />

          <div className="max-w-[1340px] mx-auto px-6 lg:px-16 flex flex-col lg:flex-row items-center gap-10 lg:gap-16 relative z-10 w-full">

            {/* ── Left: Text ── */}
            <div className="flex-1 flex flex-col items-start text-left max-w-[680px] animate-slide-in-left">

              {/* Top Badge */}
              <div style={{
                display:'inline-flex', alignItems:'center', gap:'8px',
                padding:'8px 18px', borderRadius:'999px',
                background:'linear-gradient(135deg, rgba(13,64,64,0.1), rgba(42,168,112,0.08))',
                border:'1px solid rgba(13,100,100,0.2)',
                marginBottom:'28px', boxShadow:'0 2px 12px rgba(13,100,100,0.08)'
              }}>
                <Sparkles size={13} style={{color:'#0D7070'}} />
                <span style={{fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:'11px', letterSpacing:'0.18em', textTransform:'uppercase', color:'#0D5050'}}>Mental Health AI · Emotion Engine</span>
              </div>

              {/* NEFFI — The Brand Name First */}
              <div style={{marginBottom:'12px', lineHeight:1}}>
                <span style={{
                  fontFamily:"'Raleway', sans-serif",
                  fontSize:'clamp(80px, 12vw, 150px)',
                  fontWeight:900,
                  letterSpacing:'-0.05em',
                  lineHeight:0.92,
                  background:'linear-gradient(135deg, #0A3535 0%, #0D5555 20%, #1A7A7A 45%, #28A8A0 70%, #3ABCB0 90%, #4DD4C4 100%)',
                  WebkitBackgroundClip:'text',
                  WebkitTextFillColor:'transparent',
                  backgroundClip:'text',
                  display:'block',
                  filter:'drop-shadow(0 4px 12px rgba(13,112,112,0.18))'
                }}>
                  NEFFI AI
                </span>
              </div>

              {/* Tagline */}
              <p style={{
                fontFamily:"'Space Grotesk', sans-serif",
                fontSize:'clamp(28px, 3.8vw, 48px)',
                fontWeight:900,
                color:'#0A3535',
                marginBottom:'24px',
                letterSpacing:'-0.03em',
                lineHeight:1.2
              }}>
                Bridging the <span style={{fontFamily:"'Dancing Script',cursive", fontWeight: 700, fontSize:'1.35em', color:'#10B981', display:'inline-block', transform:'rotate(-1.5deg)', textShadow:'0 0 16px rgba(16,185,129,0.3)'}}>Invisible Gap</span> in Mental Healthcare
              </p>

              {/* Description - Scientific explanation of Neffi meaning */}
              <p style={{
                fontFamily:"'Inter', sans-serif",
                fontSize:'clamp(15px, 1.4vw, 17px)',
                lineHeight:1.88,
                color:'#1A2E2E',
                fontWeight:500,
                maxWidth:'580px',
                marginBottom:'36px'
              }}>
                <strong>Neffi</strong> — derived from the concept of <strong style={{color:'#0D7070'}}>&ldquo;Kefi&rdquo;</strong> (the Greek spirit of joy, emotional vitality, and passion) — is a clinically-grounded AI companion built to solve the <strong style={{color:'#0D7070'}}>167-hour gap</strong> in mental healthcare. While traditional therapy supports you for just one hour a week, Neffi is available 24/7. It understands <strong style={{color:'#0D7070'}}>96 emotional states</strong>, remembers your journey, and delivers personalized therapeutic support whenever distress arises.
              </p>

              {/* CTA Buttons */}
              <div style={{display:'flex', flexWrap:'wrap', gap:'14px', alignItems:'center'}}>
                <button
                  onClick={() => setView('login-patient')}
                  className="group relative overflow-hidden cursor-pointer"
                  style={{
                    padding:'14px 32px', borderRadius:'16px',
                    background:'linear-gradient(135deg, #0A3535 0%, #0D5555 40%, #1A7A7A 100%)',
                    color: 'white', border: 'none',
                    fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:'16px',
                    boxShadow:'0 16px 40px rgba(13,85,85,0.4), 0 4px 12px rgba(13,85,85,0.2)',
                    display:'flex', alignItems:'center', gap:'10px',
                    transition:'all 0.3s ease', letterSpacing:'0.02em'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 24px 50px rgba(13,85,85,0.5), 0 6px 16px rgba(13,85,85,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 16px 40px rgba(13,85,85,0.4), 0 4px 12px rgba(13,85,85,0.2)'; }}
                >
                  <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span>✨ Start with Neffi</span>
                  <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setView('login-admin')}
                  className="group cursor-pointer"
                  style={{
                    padding:'14px 28px', borderRadius:'16px',
                    background:'rgba(255,255,255,0.6)', backdropFilter:'blur(12px)',
                    border:'2px solid rgba(13,100,100,0.25)',
                    color:'#0D5050', fontFamily:"'Space Grotesk',sans-serif",
                    fontWeight:700, fontSize:'16px',
                    display:'flex', alignItems:'center', gap:'10px',
                    transition:'all 0.3s ease', letterSpacing:'0.02em'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.background='rgba(255,255,255,0.9)'; e.currentTarget.style.borderColor='rgba(13,100,100,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.background='rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor='rgba(13,100,100,0.25)'; }}
                >
                  🩺 Clinical Hub
                </button>
              </div>

            </div>

            {/* ── Right: Visual Orb ── */}
            <div className="hidden lg:flex flex-shrink-0 items-center justify-center relative animate-slide-in-right" style={{width:'420px', height:'420px'}}>
              {/* Glow layers */}
              <div style={{position:'absolute', inset:0, background:'radial-gradient(circle, rgba(13,112,112,0.18) 0%, transparent 70%)', borderRadius:'50%', filter:'blur(30px)'}} />
              <div style={{position:'absolute', inset:'40px', background:'radial-gradient(circle, rgba(42,168,112,0.12) 0%, transparent 70%)', borderRadius:'50%', filter:'blur(20px)'}} className="animate-pulse" />

              {/* Glass orb */}
              <div style={{
                position:'relative', width:'240px', height:'240px', borderRadius:'50%',
                background:'linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.1))',
                backdropFilter:'blur(20px)',
                boxShadow:'inset -10px -10px 20px rgba(255,255,255,0.4), inset 10px 10px 20px rgba(255,255,255,0.2), 0 20px 60px rgba(13,112,112,0.25)',
                border:'6px solid rgba(255,255,255,0.7)',
                display:'flex', alignItems:'center', justifyContent:'center', zIndex:10
              }}>
                <Star size={90} style={{color:'#0D5555', fill:'rgba(13,85,85,0.8)'}} className="animate-[spin_16s_linear_infinite] drop-shadow-[0_8px_20px_rgba(13,112,112,0.4)]" />
              </div>

              {/* Floating emotion bubbles */}
              <div className="absolute animate-float" style={{top:'10px', right:'50px', width:'64px', height:'64px', background:'white', borderRadius:'50%', boxShadow:'0 8px 24px rgba(16,185,129,0.2)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(16,185,129,0.2)', zIndex:12}}>
                <Heart size={26} style={{color:'#10B981', fill:'rgba(16,185,129,0.15)'}} />
              </div>
              <div className="absolute animate-float" style={{bottom:'50px', left:'10px', width:'72px', height:'72px', background:'white', borderRadius:'50%', boxShadow:'0 8px 24px rgba(13,85,85,0.15)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(13,85,85,0.1)', animationDelay:'1.5s', zIndex:12}}>
                <MessageCircle size={32} style={{color:'#0D7070', fill:'rgba(13,112,112,0.05)'}} />
              </div>
              <div className="absolute animate-float" style={{top:'40%', right:'-10px', width:'52px', height:'52px', background:'white', borderRadius:'50%', boxShadow:'0 6px 18px rgba(217,119,6,0.2)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(217,119,6,0.15)', animationDelay:'0.8s', zIndex:12}}>
                <Brain size={22} style={{color:'#D97706'}} />
              </div>
              <div className="absolute animate-float" style={{bottom:'20px', right:'60px', width:'44px', height:'44px', background:'white', borderRadius:'50%', boxShadow:'0 5px 15px rgba(139,92,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(139,92,246,0.15)', animationDelay:'2.2s', zIndex:12}}>
                <Sparkles size={18} style={{color:'#7C3AED'}} />
              </div>
            </div>
          </div>
        </section>
        {/* 🚀 SECTION 2: THE PROBLEM (Story Zig-Zag) */}
        <section id="story" className="scroll-zoom-section w-full py-32 bg-gradient-to-br from-[#F0F9F5]/45 via-[#E6F0F0]/30 to-[#F2F9F6]/45 backdrop-blur-md border-y border-[#3A7070]/8">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row-reverse items-center gap-24 relative">
             <div className="absolute top-10 left-0 text-[300px] font-poppins font-bold text-slate-100 opacity-50 z-[-1] leading-none select-none">01</div>
            
             <div className="flex-1 flex justify-center lg:justify-start animate-fade-in">
               <img src="https://illustrations.popsy.co/amber/surreal-hourglass.svg" alt="Hourglass Drawing" className="w-full max-w-[500px] drop-shadow-xl animate-float" />
             </div>

             <div className="flex-1 flex flex-col items-start text-left">
              <h2 className="h2-title mb-8">The <span className="cursive-accent-lg text-gradient-slate">Silent Crisis</span> <span className="text-gradient-forest">We Ignore</span>.</h2>
              <div className="space-y-6">
                <p className="p-text" style={{color:'#2D4040'}}>
                  Therapy typically happens for one hour a week. But emotional struggles don't follow a schedule. What happens during the remaining <span className="font-extrabold text-gradient-teal">167 hours</span>? Patients are left alone to fight their anxiety, burnout, and depression in silence.
                </p>
                <p className="p-text" style={{color:'#2D4040'}}>
                  Healing is incredibly hard, and it isn't linear. Due to stigma, high costs, and a lack of immediate support, nearly 60% of patients drop out of treatment before fully recovering. 
                </p>
                <p className="p-text" style={{color:'#2D4040'}}>
                  When they drop out, relapses go completely undetected. Doctors have no proactive way to monitor these at-risk patients outside the clinic walls. This is the gap Neffi AI was built to close.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 🚀 SECTION 2.5: CLINICAL RESEARCH & REAL-WORLD CRISIS */}
        <section className="scroll-zoom-section w-full py-32 bg-gradient-to-br from-[#f8fafc]/60 via-[#e0f2fe]/20 to-[#f8fafc]/60 backdrop-blur-md border-y border-[#3A7070]/10 relative overflow-hidden">
          <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] glow-orb-purple rounded-full blur-[120px] pointer-events-none z-0"></div>
          <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] glow-orb-rose rounded-full blur-[120px] pointer-events-none z-0"></div>

          <div className="max-w-[1200px] mx-auto px-6 lg:px-12 relative z-10">
            {/* Unified Section Header */}
            <div className="text-center max-w-[800px] mx-auto mb-20 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-space font-bold uppercase tracking-widest text-xs mb-6 shadow-sm">
                <Activity size={14} /> Clinical Reality & Psychological Research
              </div>
              <h2 className="text-4xl lg:text-5xl font-poppins font-black text-[#0F172A] tracking-tight mb-6">
                Why <span className="cursive-accent-lg text-[#0D7070] font-sacramento font-normal text-5xl">Neffi</span> Was Created.
              </h2>
              <p className="text-lg text-slate-700 font-medium leading-relaxed">
                The mental health crisis is one of the most pressing global emergencies. Here is the clinical evidence and real-world impact driving Neffi's development.
              </p>
            </div>

            {/* Part 1: Scientific Stats Grid (Why Neffi Was Created) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-28">
              {[
                {
                  val: "1 in 5",
                  label: "Adults Experience Crisis",
                  desc: "Over 970 million people globally live with a diagnosed mental health condition. Due to acute clinical shortages, over 70% of individuals in distress receive zero support, overloading emergency rooms and medical staff.",
                  sol: "Neffi serves as an immediate digital buffer, providing clinically-validated self-regulation tools (CBT reframings, Rogerian counseling) the instant distress occurs—bypassing waitlists completely.",
                  glow: "glow-rose bg-white/40 shadow-rose-200/20 hover:shadow-rose-300/40 transition-all duration-300",
                  valColor: "text-rose-600 drop-shadow-[0_0_12px_rgba(244,63,94,0.3)]",
                  bgGlow: "bg-rose-100/40 border border-rose-200/50",
                  badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
                  unit: "Global Prevalence"
                },
                {
                  val: "167 hrs",
                  label: "The Support Gap",
                  desc: "Traditional psychotherapy operates on a single 1-hour weekly session, leaving 167 hours of completely unmonitored vulnerability where triggers accumulate, symptoms worsen, and patients lack real-time care.",
                  sol: "Fills the weekly gap by offering 24/7 continuous dialogue mapping and proactive check-ins, keeping the therapeutic thread active and logging daily coping stats for analysis.",
                  glow: "glow-gold bg-white/40 shadow-amber-200/20 hover:shadow-amber-300/40 transition-all duration-300",
                  valColor: "text-amber-600 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]",
                  bgGlow: "bg-amber-100/40 border border-amber-200/50",
                  badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
                  unit: "Weekly Care Gap"
                },
                {
                  val: "60%",
                  label: "Early Treatment Attrition",
                  desc: "Up to 60% of patients drop out of their mental health recovery plans prematurely. Without daily reinforcement, micro-progress tracking, and interactive feedback, emotional hurdles feel too overwhelming to manage alone.",
                  sol: "Employs gamified wellness challenges, real-time rewards, and interactive coping tools to keep engagement high, reducing treatment dropouts by up to 3.5x.",
                  glow: "glow-purple bg-white/40 shadow-purple-200/20 hover:shadow-purple-300/40 transition-all duration-300",
                  valColor: "text-purple-600 drop-shadow-[0_0_12px_rgba(139,92,246,0.3)]",
                  bgGlow: "bg-purple-100/40 border border-purple-200/50",
                  badgeColor: "bg-purple-50 text-purple-600 border-purple-100",
                  unit: "Therapy Dropout"
                },
                {
                  val: "82%",
                  label: "Predictive Warning Signals",
                  desc: "Over 82% of clinical relapses (e.g., depressive episodes or panic attacks) are preceded by subtle changes in vocabulary and speaking tone days in advance, which standard diagnostic tools fail to capture.",
                  sol: "Translates text semantics into risk-indexes in real-time, detecting cognitive patterns and alerting supervisors instantly in high-severity situations to trigger human care.",
                  glow: "glow-emerald bg-white/40 shadow-emerald-200/20 hover:shadow-emerald-300/40 transition-all duration-300",
                  valColor: "text-emerald-600 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]",
                  bgGlow: "bg-emerald-100/40 border border-emerald-200/50",
                  badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
                  unit: "Linguistic Triggers"
                }
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className={`p-8 rounded-[2.5rem] border border-white/45 flex flex-col md:flex-row gap-6 justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${stat.glow}`}
                >
                  <div className="flex flex-col items-center md:items-start shrink-0 md:w-32">
                    <div className={`w-28 h-28 rounded-[2rem] ${stat.bgGlow} flex flex-col items-center justify-center shadow-inner mb-4`}>
                      <span className={`text-3xl font-black ${stat.valColor} font-space`}>{stat.val}</span>
                    </div>
                    <span className={`text-[10px] font-black font-space uppercase tracking-widest px-3 py-1 rounded-full ${stat.badgeColor} border`}>{stat.unit}</span>
                  </div>
                  
                  <div className="flex-1 text-left flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-poppins font-black text-slate-850 mb-3">{stat.label}</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] font-space font-black uppercase text-slate-400 tracking-wider block mb-1">Clinical Challenge</span>
                          <p className="text-sm text-slate-600 font-medium leading-relaxed">{stat.desc}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#0D7070]/5 border border-[#0D7070]/10 mt-3 shadow-inner">
                          <span className="text-[10px] font-space font-black uppercase text-[#0D7070] tracking-wider block mb-1">Neffi Intervention</span>
                          <p className="text-xs text-[#2C5555] font-medium leading-relaxed">{stat.sol}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-[10px] font-bold font-space uppercase tracking-wider text-slate-500 border-t border-slate-200/30 pt-3">
                      <span>Scientific Research Study</span>
                      <span className={stat.valColor}>WHO Guidelines</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Part 2: Real-World Incidents & Severe Tragedies Statistics */}
            <div className="mb-28">
              <div className="text-center max-w-[800px] mx-auto mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-700 font-space font-bold uppercase tracking-widest text-xs mb-6 shadow-sm">
                  <Shield size={14} /> Global Impact & Tragic Incidents
                </div>
                <h3 className="text-3xl lg:text-4xl font-poppins font-black text-slate-900 mb-6">
                  The <span style={{fontFamily: "'Dancing Script', cursive", fontWeight: 700, color: '#E11D48', fontSize: '1.25em', display: 'inline-block', transform: 'rotate(-0.5deg)'}}>Cost of Silence</span>: Real-World Tragedies
                </h3>
                <p className="text-[#475569] font-medium leading-relaxed">
                  Mental health conditions are not just numbers on a screen; they represent severe, real-world crises that lead to devastating losses of life and human potential.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                {/* Incident 1 */}
                <div className="glass-panel border border-white/60 p-8 rounded-[2rem] flex flex-col justify-between hover:border-rose-300/50 hover:shadow-2xl transition-all duration-300 bg-white/30">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-bold font-space uppercase tracking-widest text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">Every 40 Seconds</span>
                      <span className="text-[10px] font-space font-bold text-slate-400">WHO REPORT</span>
                    </div>
                    <h4 className="text-xl font-poppins font-black text-slate-900 mb-4">800,000+ Annual Suicide Deaths</h4>
                    <p className="text-sm text-slate-650 leading-relaxed font-medium">
                      Globally, close to 800,000 people die by suicide every single year. It stands as the 4th leading cause of death among youth aged 15-29. In India, tragic suicide incidents spiked to over 170,000 in 2022, primarily driven by academic pressure, lack of emotional resources, and social isolation.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200/50 text-xs font-space font-bold text-slate-500">
                    Target Impact: Immediate Crisis Intervention Routing
                  </div>
                </div>

                {/* Incident 2 */}
                <div className="glass-panel border border-white/60 p-8 rounded-[2rem] flex flex-col justify-between hover:border-amber-400/50 hover:shadow-2xl transition-all duration-300 bg-white/30">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-bold font-space uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">75%+ Untreated Deficit</span>
                      <span className="text-[10px] font-space font-bold text-slate-400">TREATMENT GAP</span>
                    </div>
                    <h4 className="text-xl font-poppins font-black text-slate-900 mb-4">Severe Under-Resourced Stigma</h4>
                    <p className="text-sm text-slate-650 leading-relaxed font-medium">
                      In low- and middle-income regions, over 75% of individuals suffering from severe psychological distress receive absolutely no clinical treatment. This deficit is exacerbated by an average of just 1 psychiatrist per 100,000 citizens, leaving desperate families without any resource or guidance.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200/50 text-xs font-space font-bold text-slate-500">
                    Target Impact: 24/7 Zero-Cost Sanctuary Access
                  </div>
                </div>

                {/* Incident 3 */}
                <div className="glass-panel border border-white/60 p-8 rounded-[2rem] flex flex-col justify-between hover:border-purple-300/50 hover:shadow-2xl transition-all duration-300 bg-white/30">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-bold font-space uppercase tracking-widest text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">40% Academic Anxiety</span>
                      <span className="text-[10px] font-space font-bold text-slate-400">STUDENT CRISIS</span>
                    </div>
                    <h4 className="text-xl font-poppins font-black text-slate-900 mb-4">Academic Distress & Student Self-Harm</h4>
                    <p className="text-sm text-slate-650 leading-relaxed font-medium">
                      Systemic performance pressure has triggered a 40% post-pandemic increase in clinical depression diagnoses among university and high school students. A lack of immediate, private counseling portals leads to weekly preventable tragedies under student exam stress.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200/50 text-xs font-space font-bold text-slate-500">
                    Target Impact: Empathetic Peer-Style Active Listening
                  </div>
                </div>

                {/* Incident 4 */}
                <div className="glass-panel border border-white/60 p-8 rounded-[2rem] flex flex-col justify-between hover:border-emerald-300/50 hover:shadow-2xl transition-all duration-300 bg-white/30">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-bold font-space uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">$1 Trillion Economic Loss</span>
                      <span className="text-[10px] font-space font-bold text-slate-400">PRODUCTIVITY GAP</span>
                    </div>
                    <h4 className="text-xl font-poppins font-black text-slate-900 mb-4">Silent Productivity & Social Toll</h4>
                    <p className="text-sm text-slate-650 leading-relaxed font-medium">
                      Depression and anxiety result in an estimated $1 trillion USD lost in global workforce productivity every single year. Beyond financial indicators, the human cost is measured in broken social relationships, domestic stress, and chronic isolation in families.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200/50 text-xs font-space font-bold text-slate-500">
                    Target Impact: NLP Warning Log for Supervisor Referral
                  </div>
                </div>
              </div>
            </div>

            {/* Part 3: Clinical Psychological Foundations */}
            <div className="mt-24 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D7070]/10 border border-[#0D7070]/20 text-[#0D7070] font-space font-bold uppercase tracking-widest text-xs mb-6 shadow-sm">
                <BookOpen size={14} /> Evidence-Based Foundations
              </div>
              <h3 className="text-3xl lg:text-4xl font-poppins font-black text-[#0F172A] mb-6">
                <span style={{fontFamily: "'Dancing Script', cursive", fontWeight: 700, color: '#0D7070', fontSize: '1.25em', display: 'inline-block', transform: 'rotate(-0.5deg)'}} className="mr-1">Clinical Research</span> & Psychological Models
              </h3>
              <p className="text-slate-600 font-medium max-w-3xl mx-auto mb-16 leading-relaxed">
                Neffi's emotional intelligence engine is grounded in peer-reviewed psychotherapeutic frameworks. We translate evidence-based methods into continuous digital support.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                {/* CBT */}
                <div className="glass-card p-6 rounded-[2rem] border border-white/40 hover:border-[#3A7070]/30 transition-all glow-teal flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#3A7070]/10 flex items-center justify-center text-[#3A7070]"><Brain size={24}/></div>
                  <h4 className="font-space font-bold text-lg text-slate-800">Beck's CBT Model</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">Helps users identify, analyze, and restructure negative cognitive distortions (such as catastrophizing or overgeneralization) in real-time.</p>
                </div>
                {/* Somatic */}
                <div className="glass-card p-6 rounded-[2rem] border border-white/40 hover:border-amber-500/30 transition-all glow-gold flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600"><Activity size={24}/></div>
                  <h4 className="font-space font-bold text-lg text-slate-800">Somatic Grounding</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">Triggers physiological down-regulation protocols (like 5-4-3-2-1 sensory mapping) based on Polyvagal Theory to reduce nervous arousal.</p>
                </div>
                {/* Rogerian */}
                <div className="glass-card p-6 rounded-[2rem] border border-white/40 hover:border-purple-500/30 transition-all glow-purple flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600"><Heart size={24}/></div>
                  <h4 className="font-space font-bold text-lg text-slate-800">Rogerian Reflective Care</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">Applies Rogers' core principles of unconditional positive regard, active listening, and empathetic echoing to provide supportive venting spaces.</p>
                </div>
                {/* BERT */}
                <div className="glass-card p-6 rounded-[2rem] border border-white/40 hover:border-emerald-500/30 transition-all glow-emerald flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600"><Sparkles size={24}/></div>
                  <h4 className="font-space font-bold text-lg text-slate-800">Linguistic Shift Analytics</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">BERT transformer pipelines track patient semantic choices (e.g. self-referential 'I/me' shifts) to monitor progressive depressive patterns.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 🚀 SECTION 5: DUAL PLATFORM (True Split-Screen) */}
        <section className="scroll-zoom-section w-full flex flex-col lg:flex-row mt-20 border-y border-[#3A7070]/8 bg-gradient-to-r from-[#F0F9F6]/30 via-white/30 to-[#F0F9F6]/30 backdrop-blur-md">
           {/* Left Side: Patient (Light) */}
           <div className="flex-1 bg-[#F2F9F6]/20 p-16 lg:p-24 flex flex-col items-center text-center border-r border-white/10 hover:bg-[#F2F9F6]/40 transition-all duration-500 group">
             <div className="label-text inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3A7070]/5 border border-[#3A7070]/10 text-[#3A7070] font-space font-bold uppercase tracking-widest text-xs mb-6">Patient Portal</div>
             <div className="h-48 flex items-end justify-center mb-10 group-hover:scale-105 transition-transform duration-500">
               <img src="https://illustrations.popsy.co/amber/success.svg" alt="Patient Sanctuary" className="h-full drop-shadow-xl" />
             </div>
              <h2 className="h2-title font-poppins text-slate-900 mb-6">For Patients.<br/>The <span className="cursive-accent-lg text-transparent bg-clip-text bg-gradient-to-r from-[#3A7070] to-[#8FA989]">Sanctuary</span>.</h2>
             <p className="p-text mb-10 max-w-sm font-medium leading-[1.7]" style={{color:'#2D4040'}}>
               A completely judgment-free zone to vent, track your shifting moods, and receive real-time emotional first-aid without having to wait weeks for an appointment.
             </p>
             <button onClick={() => setView('login-patient')} className={`mt-auto px-10 py-4 rounded-2xl font-inter font-bold text-lg ${theme.btnTeal} cursor-pointer`}>
               Neffi
             </button>
           </div>

           {/* Right Side: Doctor (Light) */}
           <div className="flex-1 bg-white/15 p-16 lg:p-24 flex flex-col items-center text-center border-l border-white/10 hover:bg-white/30 transition-all duration-500 group">
             <div className="label-text inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-600/5 border border-teal-600/10 text-teal-700 font-space font-bold uppercase tracking-widest text-xs mb-6">Clinical Access</div>
             <div className="h-48 flex items-end justify-center mb-10 group-hover:scale-105 transition-transform duration-500">
               <img src="https://illustrations.popsy.co/amber/video-call.svg" alt="Clinical Hub" className="h-full drop-shadow-2xl" />
             </div>
              <h2 className="h2-title font-poppins text-slate-900 mb-6">For Clinicians.<br/>The <span className="cursive-accent-lg text-transparent bg-clip-text bg-gradient-to-r from-[#2C5555] to-teal-700">Hub</span>.</h2>
             <p className="p-text mb-10 max-w-sm font-medium leading-[1.7]" style={{color:'#2D4040'}}>
               A predictive dashboard giving you a real-time view of your entire roster's emotional trajectory. If a patient shows signs of relapse, Neffi alerts you instantly.
             </p>
             <button onClick={() => setView('login-admin')} className={`mt-auto px-10 py-4 rounded-2xl font-inter font-bold text-lg ${theme.btnOutline} cursor-pointer`}>
               Access Hub
             </button>
           </div>
        </section>

        {/* 🚀 SECTION 6: SAFETY (Light Mode Alert Block) */}
        <section className="scroll-zoom-section w-full bg-gradient-to-br from-rose-50/25 via-[#F2F9F6]/35 to-rose-50/25 backdrop-blur-md py-32 relative overflow-hidden border-y border-rose-300/20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[120px]"></div>
          <div className="max-w-[800px] mx-auto px-6 text-center relative z-10 flex flex-col items-center">
             <div className="w-24 h-24 mb-10 text-red-500 animate-pulse"><Shield size={96} strokeWidth={1} /></div>
              <h2 className="h2-title font-raleway text-slate-900 mb-8"><span className="cursive-accent-lg text-gradient-rose">Clinical Safety</span> First. <span className="text-gradient-slate">Always</span>.</h2>
             <p className="p-text max-w-3xl font-medium leading-[1.85]" style={{color:'#2D4040'}}>
               Built with strict WHO-compliant crisis protocols and the n8n automation engine, Neffi continuously monitors conversations for high-risk signals. In moments of severe distress or suicidal ideation, it overrides AI independence and instantly triggers an SOS alert to emergency contacts and your clinical supervisor. 
               <br/><br/>
               <span className="text-red-500 font-bold">We prioritize human safety over everything else.</span>
             </p>
          </div>
        </section>

        {/* ─────────── PROJECT OVERVIEW / TECH STACK SECTION ─────────── */}
        <section className="scroll-zoom-section w-full py-28 relative overflow-hidden bg-transparent">
          <div className="absolute inset-0 bg-gradient-to-br from-[#DCF0EC]/35 via-white/20 to-[#E4F5F1]/35 z-0" />
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#3A7070]/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#8FA989]/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-[1280px] mx-auto px-6 lg:px-16 relative z-10">

            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3A7070]/10 border border-[#3A7070]/25 text-[#3A7070] font-space font-bold text-xs tracking-[0.18em] uppercase mb-6">
                <Sparkles size={12} /> Project Overview
              </div>
              <h2 className="text-4xl md:text-5xl font-raleway font-black text-slate-800 mb-4 tracking-tight">
                The <span className="animate-pulse-slow" style={{fontFamily: "'Dancing Script', cursive", fontWeight: 700, color: '#0A3535', fontSize: '1.35em', display: 'inline-block', transform: 'rotate(-1.5deg)'}}>Neffi AI</span> <span style={{fontFamily: "'Dancing Script', cursive", fontWeight: 700, color: '#1B7A7A', fontSize: '1.35em', display: 'inline-block'}}>Architecture</span>
              </h2>
              <p className="p-text max-w-2xl mx-auto text-slate-650 font-medium">
                A full-stack, production-ready mental health platform built with modern AI and cloud infrastructure — designed for real clinical impact.
              </p>
            </div>

            {/* Tech Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">

              {/* Card 1 - AI Core */}
              <div className="group relative p-8 rounded-[2.5rem] bg-white/45 backdrop-blur-lg border border-white/65 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/70 cursor-default glow-teal">
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-[#3A7070]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#3A7070]/10 flex items-center justify-center text-[#3A7070]">
                    <Brain size={24} />
                  </div>
                  <div>
                    <p className="font-space text-sm md:text-base font-black text-[#0A3535] uppercase tracking-widest mb-1">AI Core</p>
                    <h4 className="font-raleway font-black text-xl text-[#2C5555]">BERT + Gemini</h4>
                  </div>
                </div>
                <p className="font-inter font-medium text-[14px] leading-relaxed text-slate-600">Custom fine-tuned BERT model classifies 96 emotional states. Google Gemini Pro powers empathetic, context-aware conversational responses using 7 therapeutic modes.</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {['BERT', 'Gemini Pro', '96 States', 'NLP'].map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-[#3A7070]/10 border border-[#3A7070]/20 text-[#2C5555] font-space font-bold text-xs">{t}</span>
                  ))}
                </div>
              </div>

              {/* Card 2 - Memory */}
              <div className="group relative p-8 rounded-[2.5rem] bg-white/45 backdrop-blur-lg border border-white/65 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/70 cursor-default glow-gold">
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <Database size={24} />
                  </div>
                  <div>
                    <p className="font-space text-sm md:text-base font-black text-amber-800 uppercase tracking-widest mb-1">Memory Layer</p>
                    <h4 className="font-raleway font-black text-xl text-amber-750">Pinecone Vector DB</h4>
                  </div>
                </div>
                <p className="font-inter font-medium text-[14px] leading-relaxed text-slate-600">Semantic vector memory stores and retrieves patient emotional history, enabling truly personalized, context-aware conversations that improve over time.</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {['Pinecone', 'Embeddings', 'Vector Search', 'Memory'].map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 font-space font-bold text-xs">{t}</span>
                  ))}
                </div>
              </div>

              {/* Card 3 - Automation */}
              <div className="group relative p-8 rounded-[2.5rem] bg-white/45 backdrop-blur-lg border border-white/65 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/70 cursor-default glow-rose">
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                    <Shield size={24} />
                  </div>
                  <div>
                    <p className="font-space text-sm md:text-base font-black text-rose-800 uppercase tracking-widest mb-1">Safety Automation</p>
                    <h4 className="font-raleway font-black text-xl text-rose-750">n8n Workflows</h4>
                  </div>
                </div>
                <p className="font-inter font-medium text-[14px] leading-relaxed text-slate-600">n8n orchestrates real-time crisis detection pipelines. When suicidal ideation or severe distress is detected, automated SOS alerts notify emergency contacts instantly.</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {['n8n', 'Crisis SOS', 'WHO Protocol', 'Automation'].map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 font-space font-bold text-xs">{t}</span>
                  ))}
                </div>
              </div>

              {/* Card 4 - Backend */}
              <div className="group relative p-8 rounded-[2.5rem] bg-white/45 backdrop-blur-lg border border-white/65 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/70 cursor-default glow-emerald">
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Zap size={24} />
                  </div>
                  <div>
                    <p className="font-space text-sm md:text-base font-black text-emerald-800 uppercase tracking-widest mb-1">Backend API</p>
                    <h4 className="font-raleway font-black text-xl text-emerald-750">FastAPI + Python</h4>
                  </div>
                </div>
                <p className="font-inter font-medium text-[14px] leading-relaxed text-slate-600">High-performance async REST API with clinical routers for patient sessions, MHQ scoring, doctor dashboards, and real-time mood tracking analytics.</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {['FastAPI', 'Python', 'REST API', 'Async'].map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 font-space font-bold text-xs">{t}</span>
                  ))}
                </div>
              </div>

              {/* Card 5 - Frontend */}
              <div className="group relative p-8 rounded-[2.5rem] bg-white/45 backdrop-blur-lg border border-white/65 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/70 cursor-default glow-teal">
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#3A7070]/10 flex items-center justify-center text-[#3A7070]">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="font-space text-sm md:text-base font-black text-[#0A3535] uppercase tracking-widest mb-1">Frontend</p>
                    <h4 className="font-raleway font-black text-xl text-[#2C5555]">React + Vite + Tailwind</h4>
                  </div>
                </div>
                <p className="font-inter font-medium text-[14px] leading-relaxed text-slate-600">Glassmorphism UI with animated components, real-time mood charts, doctor analytics dashboard, voice input, and a fully responsive design for all devices.</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {['React 18', 'Vite', 'Tailwind', 'Recharts'].map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-[#3A7070]/10 border border-[#3A7070]/20 text-[#2C5555] font-space font-bold text-xs">{t}</span>
                  ))}
                </div>
              </div>

              {/* Card 6 - Deployment */}
              <div className="group relative p-8 rounded-[2.5rem] bg-white/45 backdrop-blur-lg border border-white/65 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/70 cursor-default glow-purple">
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-violet-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-400/10 flex items-center justify-center text-violet-650">
                    <Target size={24} />
                  </div>
                  <div>
                    <p className="font-space text-sm md:text-base font-black text-violet-850 uppercase tracking-widest mb-1">Deployment</p>
                    <h4 className="font-raleway font-black text-xl text-violet-750">Hugging Face + Vercel</h4>
                  </div>
                </div>
                <p className="font-inter font-medium text-[14px] leading-relaxed text-slate-600">BERT model hosted on Hugging Face Spaces. FastAPI backend deployed on Hugging Face. React frontend on Vercel CDN — fully cloud-native, zero downtime.</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {['Hugging Face', 'Vercel', 'Cloud', 'CI/CD'].map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-700 font-space font-bold text-xs">{t}</span>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ─────────── FINAL CTA ─────────── */}
        <section className="w-full py-32 flex flex-col items-center text-center relative overflow-hidden bg-gradient-to-b from-transparent via-[#E6F0F0]/20 to-[#d8ede8]/40">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[500px] font-black text-[#3A7070]/3 select-none leading-none pointer-events-none">∞</div>
          <div className="w-full max-w-[1000px] mx-auto px-6 relative z-10">
            <div className="glass-panel border border-white/35 rounded-[3rem] p-16 lg:p-24 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#3A7070]/8 to-transparent rounded-full blur-[80px]"></div>
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-[#8FA989]/8 to-transparent rounded-full blur-[60px]"></div>
              <p className="font-space font-bold text-[#8FA989] uppercase tracking-[0.2em] text-sm mb-4 relative z-10">✦ Your Journey Starts Here ✦</p>
              <h2 className="h1-title mb-6 relative z-10">Ready to <span className="cursive-accent-lg text-gradient-aurora">Heal</span>?</h2>
              <p className="p-text text-slate-600 mb-12 relative z-10 max-w-lg mx-auto font-medium">Whether you are seeking support or providing care, Neffi AI is here to bridge the gap with empathy and intelligence.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <button onClick={() => setView('login-patient')} className={`group px-10 py-5 rounded-2xl font-inter font-bold text-lg ${theme.btnTeal} cursor-pointer flex items-center gap-3`}>
                  ✨ <span>Enter Neffi Chat</span> <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform"/>
                </button>
                <button onClick={() => setView('login-admin')} className={`px-10 py-5 rounded-2xl font-inter font-bold text-lg ${theme.btnOutline} cursor-pointer flex items-center gap-3`}>
                  🩺 Clinical Hub
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full relative z-10 bg-white/[0.22] backdrop-blur-xl border-t border-white/35 text-slate-700 overflow-hidden mt-0 py-20 animate-fade-in shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[1px] bg-gradient-to-r from-transparent via-[#3A7070]/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3a7070]/5 rounded-full blur-[130px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#8fa989]/5 rounded-full blur-[130px] pointer-events-none"></div>
        
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 relative z-10">
          
          {/* Part 1: Unified About Us Title & Mission Details */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3A7070]/10 border border-[#3A7070]/20 text-[#3A7070] font-space font-bold uppercase tracking-widest text-xs mb-6 shadow-sm">
              <Sparkles size={14} className="text-[#3A7070]" /> About Our Mission & Creators
            </div>
            <h2 className="text-3xl lg:text-5xl font-poppins font-black text-slate-800 tracking-tight mb-8">
              Empathetic Mental Healthcare, <span className="cursive-accent-lg text-gradient-aurora">Built with Purpose</span>
            </h2>
            <p className="text-slate-600 font-medium max-w-4xl mx-auto leading-relaxed text-sm lg:text-base mb-12">
              We are a passionate team of engineering students from <span className="font-bold text-[#3A7070] font-space">University College of Engineering (UCE) Panruti</span> (A Constituent College of Anna University, Chennai), from the <span className="font-bold text-[#8FA989] font-space">Department of Computer Science and Engineering (CSE)</span>. What started as a competitive entry became a genuine mission: to make mental healthcare accessible, continuous, and deeply empathetic.
            </p>
          </div>

          {/* Hackers Team Profiles Grid (Unified Grid - No Nested Box) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-slate-200/60 relative z-10 text-center">
            
            {/* Creator 1: Balaji P */}
            <div className="flex flex-col items-center">
              <h4 className="select-none mb-1" style={{fontFamily: "'Dancing Script', cursive", color: '#0A3535', fontSize: '2.6rem', fontWeight: 'bold'}}>Balaji P</h4>
              <p className="font-inter text-slate-700 text-sm font-semibold max-w-[280px] leading-relaxed text-center mb-6">
                Passionate developer building conversational AI logic, custom n8n routes, and full-stack responsive web platforms.
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#3A7070]/10 flex items-center justify-center text-[#3A7070] hover:bg-[#3A7070] hover:text-white transition-colors" title="LinkedIn Profile">
                  <Linkedin size={15} />
                </a>
                <a href="mailto:balaji.p@neffi.ai" className="w-8 h-8 rounded-full bg-[#3A7070]/10 flex items-center justify-center text-[#3A7070] hover:bg-[#3A7070] hover:text-white transition-colors" title="Email Contact">
                  <Mail size={15} />
                </a>
                <a href="tel:9152987821" className="w-8 h-8 rounded-full bg-[#3A7070]/10 flex items-center justify-center text-[#3A7070] hover:bg-[#3A7070] hover:text-white transition-colors" title="Crisis Helpline Call">
                  <PhoneCall size={15} />
                </a>
              </div>
            </div>

            {/* Creator 2: Madhumathi S */}
            <div className="flex flex-col items-center">
              <h4 className="select-none mb-1" style={{fontFamily: "'Dancing Script', cursive", color: '#0A3535', fontSize: '2.6rem', fontWeight: 'bold'}}>Madhumathi S</h4>
              <p className="font-inter text-slate-700 text-sm font-semibold max-w-[280px] leading-relaxed text-center mb-6">
                Lead researcher designing clinical safety protocols, visual color palettes, and intuitive user experiences.
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 hover:bg-amber-500 hover:text-white transition-colors" title="LinkedIn Profile">
                  <Linkedin size={15} />
                </a>
                <a href="mailto:madhumathi.s@neffi.ai" className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 hover:bg-amber-500 hover:text-white transition-colors" title="Email Contact">
                  <Mail size={15} />
                </a>
                <a href="tel:9152987821" className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 hover:bg-amber-500 hover:text-white transition-colors" title="Crisis Helpline Call">
                  <PhoneCall size={15} />
                </a>
              </div>
            </div>

            {/* Creator 3: Malini V */}
            <div className="flex flex-col items-center">
              <h4 className="select-none mb-1" style={{fontFamily: "'Dancing Script', cursive", color: '#0A3535', fontSize: '2.6rem', fontWeight: 'bold'}}>Malini V</h4>
              <p className="font-inter text-slate-700 text-sm font-semibold max-w-[280px] leading-relaxed text-center mb-6">
                Backend engineer integrating cloud databases, automated notification services, and real-time dashboard analytics.
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors" title="LinkedIn Profile">
                  <Linkedin size={15} />
                </a>
                <a href="mailto:malini.v@neffi.ai" className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors" title="Email Contact">
                  <Mail size={15} />
                </a>
                <a href="tel:9152987821" className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors" title="Crisis Helpline Call">
                  <PhoneCall size={15} />
                </a>
              </div>
            </div>

          </div>

          {/* Unified Contact and Disclaimer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 mt-16 border-t border-slate-200/60 text-left">
            {/* Left Brand Details */}
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-3 bg-[#3A7070]/10 border border-[#3A7070]/20 px-6 py-3.5 rounded-2xl w-fit shadow-sm">
                <Star size={24} className="text-[#3A7070] fill-[#3A7070]" />
                <span className="text-2xl font-raleway font-black tracking-tight text-[#2C5555]">Neffi Sanctuary</span>
              </div>
              <p className="font-inter text-slate-600 text-sm max-w-md leading-relaxed font-semibold">
                An advanced mental health platform designed to provide empathetic, continuous, and private clinical-style AI assistance.
              </p>
              <div className="flex flex-wrap gap-4 items-center font-space text-[#2C5555] font-bold text-xs tracking-wider">
                <span>📧 support@neffi.ai</span>
                <span>•</span>
                <span>📞 +91 90425 12345</span>
              </div>
            </div>

            {/* Right: Emergency Disclaimer */}
            <div className="flex flex-col justify-center">
              <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/15">
                <div className="flex items-center gap-2 text-rose-600 font-space font-bold text-[12px] uppercase tracking-wider mb-2">
                  <Shield size={14} className="text-rose-500" /> Emergency Support Info
                </div>
                <p className="text-[12px] text-slate-500 leading-relaxed font-semibold">
                  In case of acute distress or clinical emergencies, please call AASRA Helpline at +91 98204 66726 or call 104 immediately. Neffi does not replace active clinical care.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom copyright line */}
          <div className="pt-8 mt-12 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-xs font-space font-bold uppercase tracking-wider">
            <p>© 2026 Hackers Team & UCE Panruti. All rights reserved.</p>
            <p className="flex items-center gap-2">Version 3.0.0 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Systems Operational</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

// ==========================================
// 2. PATIENT ONBOARDING
// ==========================================
const PatientLogin = ({ setView, setUserData }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    name: '',
    age: '',
    dob: '',
    gender: '',
    place: '',
    language: 'English',
    focusTags: [],
    consent: false
  });
  const [error, setError] = useState('');

  const toggleTag = (tag) => {
    setFormData(prev => {
      const active = prev.focusTags.includes(tag);
      return {
        ...prev,
        focusTags: active 
          ? prev.focusTags.filter(t => t !== tag) 
          : [...prev.focusTags, tag]
      };
    });
  };

  const handleNext = () => {
    setError('');
    const phoneClean = formData.phone.replace(/\D/g, '');

    if (step === 1) {
      if (!formData.phone) return setError('Please enter your mobile number.');
      if (phoneClean.length !== 10) return setError('Mobile number must be exactly 10 digits.');
      if (!formData.email) return setError('Please enter your email address.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return setError('Please enter a valid email address.');
      if (!formData.consent) return setError('You must agree to the WHO-compliant crisis response protocols to proceed.');
      
      setStep(2);
    } else if (step === 2) {
      if (!formData.name.trim()) return setError('Please enter your preferred name.');
      if (!formData.age || isNaN(formData.age) || +formData.age < 5 || +formData.age > 120) return setError('Please enter a valid age (5–120).');
      if (!formData.dob) return setError('Please enter your Date of Birth.');
      if (!formData.gender) return setError('Please select your gender.');
      if (!formData.place.trim()) return setError('Please enter your location.');

      const patientId = 'P-' + phoneClean.slice(-6);
      const fullData = { ...formData, patient_id: patientId };

      axios.post('https://balajikrishnan031-keffi-backend.hf.space/api/patient/login', {
        patient_id: patientId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        age: parseInt(formData.age, 10),
        dob: formData.dob,
        gender: formData.gender,
        place: formData.place,
        language: formData.language,
        focus_tags: formData.focusTags
      })
      .then(() => {
        localStorage.setItem('neffi_user', JSON.stringify(fullData));
        setUserData(fullData);
        setView('patient-dashboard');
      })
      .catch(err => {
        console.error("Login sync failed:", err);
        setError("Unable to sync details with clinical server. Please try again.");
      });
    }
  };

  const focusOptions = ["Anxiety", "Stress", "Panic Attacks", "Depression", "Grief", "Venting Space", "Self-Care"];

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 md:p-10 bg-transparent relative overflow-hidden`}>
      {/* Ambient background glows for richer color combination */}
      <div className="absolute top-10 left-10 w-[450px] h-[450px] glow-orb-emerald rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] glow-orb-teal rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className={`max-w-5xl w-full min-h-[700px] rounded-[2.5rem] glass-panel flex flex-col md:flex-row overflow-hidden glow-teal animate-scale-up relative z-10 hover:shadow-[0_25px_60px_rgba(13,112,112,0.25)] transition-all duration-500`}>
        {/* Left Image Side */}
        <div className="hidden md:flex md:w-5/12 relative overflow-hidden bg-[#E6F0F0]/25 rounded-l-[2.5rem] items-center justify-center p-8 border-r border-white/20 animate-fade-in">
           <DynamicLoginIllustration step={step === 1 ? 1 : 3} className="w-full h-full max-w-[300px] object-contain relative z-10 drop-shadow-2xl transition-all duration-500" />
           <div className="absolute inset-0 bg-gradient-to-t from-[#2C5555]/30 via-transparent to-transparent flex flex-col justify-end p-12 text-[#1E293B] z-20">
              <h2 className="text-3xl font-poppins font-black text-[#0D5050] mb-3">
                {step === 1 ? (
                  <>Secure <span className="font-cursive text-[#3A7070]" style={{fontSize: '1.55em', textTransform: 'none'}}>Sanctuary</span></>
                ) : (
                  <>Your <span className="font-cursive text-[#3A7070]" style={{fontSize: '1.55em', textTransform: 'none'}}>Profile</span></>
                )}
              </h2>
              <p className="text-base opacity-90 font-medium font-inter">
                {step === 1 ? "Enter your details below to establish a secure connection." : "Let's build your personal profile for a better experience."}
              </p>
           </div>
        </div>
        
        {/* Right Form Side */}
        <div className="w-full md:w-7/12 p-10 md:p-16 flex flex-col justify-center bg-white/25 backdrop-blur-sm animate-fade-in" style={{animationDelay: '100ms'}}>
          <div className="flex justify-start gap-3 mb-10">
            {[1,2].map(i => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-12 bg-[#3A7070]' : 'w-4 bg-white/40'}`}></div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-3xl font-raleway font-black text-transparent bg-clip-text bg-gradient-to-r from-[#2C5555] to-[#3A7070] mb-3">
                  Secure <span className="font-cursive text-[#8FA989]" style={{fontSize: '1.45em', textTransform: 'none'}}>Sanctuary</span>
                </h2>
                <p className="text-slate-500 text-base font-inter font-semibold leading-relaxed">Your privacy is our priority. Enter details for secure access.</p>
              </div>
              <div className="space-y-5">
                <div className="animate-slide-up" style={{animationDelay: '100ms'}}>
                  <label className="block text-sm font-space font-extrabold text-slate-600 mb-2 tracking-wide">Mobile Number</label>
                  <input type="tel" placeholder="+91 98765 43210" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={`w-full p-4 rounded-xl glass-input outline-none text-slate-800 font-space font-semibold text-base focus:border-[#3A7070] focus:shadow-[0_0_15px_rgba(58,112,112,0.15)] transition-all`} />
                </div>
                <div className="animate-slide-up" style={{animationDelay: '200ms'}}>
                  <label className="block text-sm font-space font-extrabold text-slate-600 mb-2 tracking-wide">Email Address</label>
                  <input type="email" placeholder="you@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={`w-full p-4 rounded-xl glass-input outline-none text-slate-800 font-space font-semibold text-base focus:border-[#3A7070] focus:shadow-[0_0_15px_rgba(58,112,112,0.15)] transition-all`} />
                </div>
                
                {/* Checkbox for WHO guidelines compliance */}
                <div className="animate-slide-up flex items-start gap-3 pt-2" style={{animationDelay: '250ms'}}>
                  <input 
                    type="checkbox" 
                    id="consent-check" 
                    checked={formData.consent} 
                    onChange={e => setFormData({...formData, consent: e.target.checked})} 
                    className="mt-1 w-5 h-5 rounded border-white/50 text-[#3A7070] focus:ring-[#3A7070] cursor-pointer" 
                  />
                  <label htmlFor="consent-check" className="text-xs text-slate-600 font-space font-bold leading-normal cursor-pointer select-none">
                    I consent to WHO-compliant clinical safety protocols. I understand Neffi AI provides supportive care resources when distress is detected.
                  </label>
                </div>
              </div>
              {error && <div className="text-red-500 text-sm font-space font-bold bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}
              <div className="pt-2 space-y-4 animate-slide-up" style={{animationDelay: '300ms'}}>
                <button onClick={handleNext} className={`w-full py-4 rounded-xl font-space font-extrabold text-base tracking-wider ${theme.btnTeal}`}>Continue</button>
                <button onClick={() => setView('landing')} className="w-full text-center text-slate-400 font-space font-bold text-sm hover:text-[#3A7070] transition-colors cursor-pointer">Back to Home</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#3A7070]/20 scrollbar-track-transparent">
              <div>
                <h2 className="text-3xl font-raleway font-black text-transparent bg-clip-text bg-gradient-to-r from-[#2AA870] to-[#2C5555] mb-2">
                  Your <span className="font-cursive text-[#8FA989]" style={{fontSize: '1.45em', textTransform: 'none'}}>Profile</span>
                </h2>
                <p className="text-slate-500 text-sm font-inter font-semibold leading-relaxed">Let's refine your details for custom mood calibration.</p>
              </div>
              
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-space font-extrabold text-slate-600 mb-1 tracking-wide">Preferred Name</label>
                  <input type="text" placeholder="What should we call you?" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`w-full p-3 rounded-xl glass-input outline-none text-slate-800 font-space font-semibold text-sm focus:border-[#3A7070] transition-all`} />
                </div>
                
                {/* Age & DOB */}
                <div className="flex gap-4">
                  <div className="w-1/3">
                     <label className="block text-xs font-space font-extrabold text-slate-600 mb-1 tracking-wide">Age</label>
                     <input type="number" placeholder="Age" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className={`w-full p-3 rounded-xl glass-input outline-none text-slate-800 font-space font-semibold text-sm focus:border-[#3A7070] transition-all`} />
                  </div>
                  <div className="w-2/3">
                     <label className="block text-xs font-space font-extrabold text-slate-600 mb-1 tracking-wide">Date of Birth</label>
                     <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className={`w-full p-3 rounded-xl glass-input outline-none text-slate-600 font-space font-semibold text-sm focus:border-[#3A7070] transition-all`} />
                  </div>
                </div>

                {/* Gender & Location */}
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-xs font-space font-extrabold text-slate-600 mb-1 tracking-wide">Gender</label>
                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className={`w-full p-3 rounded-xl glass-input outline-none text-slate-800 font-space font-semibold text-sm focus:border-[#3A7070] transition-all appearance-none`}>
                      <option value="" disabled>Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs font-space font-extrabold text-slate-600 mb-1 tracking-wide">Location</label>
                    <input type="text" placeholder="City / District" value={formData.place} onChange={e => setFormData({...formData, place: e.target.value})} className={`w-full p-3 rounded-xl glass-input outline-none text-slate-800 font-space font-semibold text-sm focus:border-[#3A7070] transition-all`} />
                  </div>
                </div>

                {/* Multilingual Support Choice */}
                <div>
                  <label className="block text-xs font-space font-extrabold text-slate-600 mb-1 tracking-wide">Preferred Chat Language</label>
                  <select value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full p-3 rounded-xl glass-input outline-none text-slate-800 font-space font-semibold text-sm focus:border-[#3A7070] transition-all appearance-none">
                    <option value="English">English</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Spanish">Spanish (Español)</option>
                  </select>
                </div>

                {/* Primary Distress Mood Focus Area Pills */}
                <div>
                  <label className="block text-xs font-space font-extrabold text-slate-600 mb-2 tracking-wide">Primary Focus Areas</label>
                  <div className="flex flex-wrap gap-2">
                    {focusOptions.map(tag => {
                      const isActive = formData.focusTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-space font-extrabold transition-all cursor-pointer ${
                            isActive 
                            ? 'bg-[#3A7070] text-white border-[#3A7070] shadow-sm' 
                            : 'bg-white/45 text-slate-600 border-white/60 hover:bg-white/60'
                          }`}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {error && <div className="text-red-500 text-sm font-space font-bold bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}
              <div className="pt-2 flex flex-col gap-3">
                <button onClick={handleNext} className={`w-full py-3.5 rounded-xl font-space font-extrabold text-base tracking-wider ${theme.btnTeal}`}>Enter Neffi</button>
                <button onClick={() => setStep(1)} className="w-full text-center text-slate-400 font-space font-bold text-sm hover:text-[#3A7070] transition-colors cursor-pointer">Back to Credentials</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. ADMIN LOGIN
// ==========================================
const AdminLogin = ({ setView }) => {
  const [doctorId, setDoctorId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (doctorId === 'balaji' && password === 'balaji') {
      setView('admin-dashboard');
    } else {
      setError('Invalid ID or Passcode');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 bg-transparent relative overflow-hidden`}>
      {/* Background orbs for Clinical Hub */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] glow-orb-teal rounded-full blur-[110px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] glow-orb-purple rounded-full blur-[110px] pointer-events-none z-0"></div>

      <div className={`max-w-md w-full rounded-[2rem] glass-panel p-10 flex flex-col gap-8 glow-teal animate-scale-up relative z-10 hover:shadow-[0_25px_60px_rgba(13,112,112,0.25)] transition-all duration-500`}>
        <div className="flex justify-center mb-2">
          <div className={`w-20 h-20 rounded-2xl glass-card flex items-center justify-center text-[#3A7070] glow-teal`}><Shield size={40} className="text-[#3A7070]" /></div>
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-raleway font-black text-gradient-teal mb-3">Clinical Hub</h2>
          <p className="text-slate-500 font-space font-medium text-sm">Strictly for authorized medical personnel.</p>
        </div>
        
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-200/30 text-red-600 rounded-xl text-center text-sm font-space font-bold backdrop-blur-sm">
            {error}
          </div>
        )}

        <div className="space-y-5 mt-2">
          <div>
            <label className="block text-sm font-space font-extrabold text-slate-600 mb-2 tracking-wide">Doctor ID / Email</label>
            <input 
              type="text" 
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              placeholder="Doctor ID" 
              className={`w-full p-4 rounded-xl glass-input outline-none text-slate-800 font-space font-semibold text-base focus:border-[#3A7070] focus:shadow-[0_0_15px_rgba(58,112,112,0.15)] transition-all`} 
            />
          </div>
          <div>
             <label className="block text-sm font-space font-extrabold text-slate-600 mb-2 tracking-wide">Secure Passcode</label>
             <input 
               type="password" 
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="••••••••" 
               className={`w-full p-4 rounded-xl glass-input outline-none text-slate-800 font-space font-semibold text-base focus:border-[#3A7070] focus:shadow-[0_0_15px_rgba(58,112,112,0.15)] transition-all`} 
             />
          </div>
        </div>
        <div className="pt-4 space-y-4">
          <button onClick={handleLogin} className={`w-full py-4 rounded-xl font-space font-extrabold text-base tracking-wider ${theme.btnTeal}`}>Authenticate</button>
          <button onClick={() => setView('landing')} className="w-full text-center text-slate-400 font-space font-bold text-sm hover:text-slate-600 transition-colors cursor-pointer">Back to Home</button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. FUNCTIONAL PATIENT COMPONENTS
// ==========================================

const DailyMoodCheckIn = ({ patientId, onComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moods = [
    { score: 1, label: 'Heavy', emoji: '😔', color: 'text-slate-600', hoverGlow: 'glow-white hover:shadow-slate-300/30' },
    { score: 2, label: 'Anxious', emoji: '😰', color: 'text-amber-600', hoverGlow: 'glow-gold hover:shadow-amber-300/30' },
    { score: 3, label: 'Numb', emoji: '😐', color: 'text-slate-500', hoverGlow: 'glow-white hover:shadow-slate-200/20' },
    { score: 4, label: 'Okay', emoji: '🙂', color: 'text-teal-600', hoverGlow: 'glow-teal hover:shadow-teal-300/30' },
    { score: 5, label: 'Calm', emoji: '🌿', color: 'text-emerald-600', hoverGlow: 'glow-emerald hover:shadow-emerald-300/30' }
  ];

  const handleMoodSelect = (mood) => {
    setIsSubmitting(true);
    fetch('https://balajikrishnan031-keffi-backend.hf.space/api/patient/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: patientId || "P-102",
        emoji_score: mood.score,
        sentiment_label: mood.label
      })
    })
    .then(res => res.json())
    .catch(error => console.error("Failed to log mood", error));
    
    // Proceed immediately to chatbot sanctuary
    onComplete(mood);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full animate-fade-in p-6">
      <div className="w-full max-w-3xl p-10 md:p-14 rounded-[2.5rem] glass-panel flex flex-col items-center shadow-2xl backdrop-blur-xl animate-scale-up glow-teal">
        <h2 className="text-3xl font-raleway font-black text-gradient-teal mb-4 text-center">
          Welcome to your Sanctuary.
        </h2>
        <p className="text-lg text-slate-600 mb-12 text-center font-space font-semibold leading-relaxed">
          Before we begin, how is your mind feeling today?
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 w-full">
          {moods.map((m, i) => (
            <button 
              key={m.score} 
              disabled={isSubmitting}
              onClick={() => handleMoodSelect(m)} 
              style={{animationDelay: `${i * 80}ms`}}
              className={`p-6 md:p-8 rounded-[2rem] bg-white/45 flex flex-col items-center gap-4 transition-all duration-300 hover:-translate-y-2 hover:scale-105 cursor-pointer animate-slide-up ${m.hoverGlow}`}
            >
              <span className="text-5xl transform hover:scale-110 transition-transform">{m.emoji}</span>
              <span className={`font-space font-extrabold text-base tracking-wide ${m.color}`}>{m.label}</span>
            </button>
          ))}
        </div>
        {isSubmitting && <p className="mt-12 text-sm font-space font-bold text-slate-400 animate-pulse">Syncing with Neffi...</p>}
      </div>
    </div>
  );
};

// HELPER: No longer stripping options so numbered lists stay in text
const parseMessageText = (text) => {
  return { mainText: text || '', options: [] };
};

const MediaPlayer = ({ onClose }) => {
  const tracks = [
    { title: 'Ambient River Flow', desc: 'Soothing stream water', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3' },
    { title: 'Deep Meditation Ambient', desc: 'Slow synth waves', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { title: 'Calm Horizon Melodies', desc: 'Healing keyboards & pad', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
    { title: 'Tranquil Sanctuary', desc: 'Gentle acoustic ambient', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentTrack = tracks[currentIndex];

  return (
    <div className="absolute inset-0 z-[70] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md glass-panel border border-white/30 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#8FA989]/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#3A7070]/20 rounded-full blur-2xl"></div>
        
        {/* Record/Vinyl Animation */}
        <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-slate-100 to-white border-4 border-slate-50 shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center animate-[spin_8s_linear_infinite] mb-6 relative z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-[#3A7070] to-[#2C5555] rounded-full shadow-inner flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <div className="absolute inset-4 rounded-full border border-slate-200/50"></div>
          <div className="absolute inset-8 rounded-full border border-slate-200/50"></div>
          <div className="absolute inset-12 rounded-full border border-slate-200/50"></div>
        </div>

        <h3 className="text-xl font-black text-slate-800 mb-1 relative z-10 text-center">{currentTrack.title}</h3>
        <p className="text-sm text-[#8FA989] font-bold tracking-widest uppercase mb-4 relative z-10 text-center">{currentTrack.desc}</p>
        
        {/* Audio element with key to force reload and autoplay on source change */}
        <audio key={currentTrack.url} controls autoPlay className="w-full mb-6 relative z-10 opacity-80 hover:opacity-100 transition-opacity">
          <source src={currentTrack.url} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>

        {/* Track Playlist Selector */}
        <div className="w-full mb-6 z-10 max-h-40 overflow-y-auto space-y-2 pr-1">
          {tracks.map((track, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                idx === currentIndex
                  ? 'border-[#3A7070] bg-[#3A7070]/10 text-[#3A7070] font-bold'
                  : 'border-white/20 bg-white/20 hover:bg-white/40 text-slate-700'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">{track.title}</span>
                <span className="text-[10px] opacity-75">{track.desc}</span>
              </div>
              <span className="text-[10px] font-bold">{idx === currentIndex ? '▶ Playing' : 'Select'}</span>
            </button>
          ))}
        </div>
        
        <button onClick={onClose} className="w-full py-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30 text-slate-700 font-bold hover:bg-white/60 hover:text-red-500 transition-all relative z-10 cursor-pointer">Close Player</button>
      </div>
    </div>
  );
};

// 4.0 Camera Emotion Tracker
const CameraEmotionTracker = ({ onEmotionDetected, isCameraActive }) => {
  const videoRef = useRef();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        setIsLoaded(true);
      } catch (err) {
        console.error("Failed to load face-api models", err);
      }
    };
    if (isCameraActive) loadModels();
  }, [isCameraActive]);

  useEffect(() => {
    let interval;
    if (isCameraActive && isLoaded) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error("Webcam error:", err));
      
      interval = setInterval(async () => {
        if (videoRef.current && !videoRef.current.paused) {
          const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
          if (detections) {
            const emotions = detections.expressions;
            const dominant = Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);
            onEmotionDetected(dominant);
          }
        }
      }, 3000);
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
    }
    return () => clearInterval(interval);
  }, [isCameraActive, isLoaded, onEmotionDetected]);

  if (!isCameraActive) return null;

  return (
    <div className="absolute top-24 left-6 z-30 w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 hidden md:flex items-center justify-center">
      {!isLoaded && <div className="text-[10px] font-bold text-slate-400 text-center px-2">Loading AI Vision...</div>}
      <video ref={videoRef} autoPlay muted className="object-cover w-full h-full" />
    </div>
  );
};

// 4.1 Enhanced Chat Page
const ChatArea = ({ 
  setGlobalPoints, 
  globalPoints, 
  userData,
  sessions,
  setSessions,
  currentSessionId,
  setCurrentSessionId,
  handleNewChat,
  handleDeleteSession,
  isSidebarOpen,
  setIsSidebarOpen,
  showSOS,
  setShowSOS
}) => {

  const [moodSet, setMoodSet] = useState(false);
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    const activeSession = sessions.find(s => s.id === currentSessionId);
    if (activeSession) {
      setMessages(activeSession.messages || []);
      setMoodSet(activeSession.messages && activeSession.messages.length > 0);
    }
  }, [currentSessionId]);

  useEffect(() => {
    if (messages.length > 0) {
      let titleToSync = null;
      setSessions(prev => {
        const updated = prev.map(s => {
          if (s.id === currentSessionId) {
            let title = s.title;
            if (s.title.startsWith('New Chat') || s.title.startsWith('First Sanctuary') || s.title.startsWith('Feeling')) {
              const firstUserMsg = messages.find(m => m.sender === 'user');
              if (firstUserMsg) {
                title = firstUserMsg.text.slice(0, 26) + (firstUserMsg.text.length > 26 ? '...' : '');
              }
            }
            titleToSync = title;
            return { ...s, title, messages };
          }
          return s;
        });
        localStorage.setItem('neffi_chat_sessions', JSON.stringify(updated));
        return updated;
      });

      if (titleToSync && userData?.patient_id) {
        axios.post(`https://balajikrishnan031-keffi-backend.hf.space/api/patient/${userData.patient_id}/session`, {
          session_id: currentSessionId,
          title: titleToSync
        }).catch(err => console.error("Error syncing session title to backend:", err));
      }
    }
  }, [messages, currentSessionId, userData?.patient_id]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [showMediaPlayer, setShowMediaPlayer] = useState(false);
  const [showAppointmentPopup, setShowAppointmentPopup] = useState(false);
  const [appointmentPrompted, setAppointmentPrompted] = useState(false);
  const [lastEmotionalMessage, setLastEmotionalMessage] = useState('');
  const chatEndRef = useRef(null);

  // Biofeedback & Camera States
  const [heartRate, setHeartRate] = useState(72);
  const [hasTriggeredPanic, setHasTriggeredPanic] = useState(false);
  const [showWatchControls, setShowWatchControls] = useState(false);
  const [showControlsPopover, setShowControlsPopover] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [visualEmotion, setVisualEmotion] = useState('neutral');
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? " " : "") + transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if(recognitionRef.current) {
         recognitionRef.current.start();
         setIsRecording(true);
      } else {
         alert("Voice recognition is not supported in this browser.");
      }
    }
  };


  const handleMoodSelect = (mood) => {
    setMoodSet(true);
    const initialMsgs = [
      { id: Date.now(), sender: 'neffi', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), text: `Hi ${userData?.name || 'there'}. I see you're feeling a bit ${mood.label.toLowerCase()}. I'm here for you. Do you want to talk about it?` }
    ];
    setMessages(initialMsgs);
    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, title: `Feeling ${mood.label} ${mood.emoji}`, messages: initialMsgs };
        }
        return s;
      });
      localStorage.setItem('neffi_chat_sessions', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    // Biofeedback Panic Trigger
    if (heartRate > 110 && !hasTriggeredPanic && !isTyping) {
      setHasTriggeredPanic(true);
      const panicMsg = "[BIOFEEDBACK ALERT]: My heart is racing at " + heartRate + " BPM. I feel like I'm having a panic attack, I can't breathe!";
      setMessages(prev => [...prev, { id: Date.now(), sender: 'user', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), text: panicMsg }]);
      
      // Auto-trigger the send handler with the panic message
      handleSend(panicMsg, true);
    }
  }, [heartRate, hasTriggeredPanic, isTyping]);

  const handleSend = async (forcedMessage = null, isPanicTrigger = false) => {
    const message = forcedMessage || input;
    if (!message.trim()) return;

    const newMsg = { id: Date.now(), sender: 'user', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), text: message };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setGlobalPoints(p => p + 10);
    setIsTyping(true);

    // Track last real emotional message (not button shortcuts)
    const BUTTON_OPTIONS = [
      "Tell me a story", "Play me a song", "Hear a joke", "Give me a joke", "Give me a puzzle",
      "I want to vent", "I need to vent", "I need to talk", "I want to talk more",
      "Tell me another", "Give me another", "Tell me more",
      "Help me reframe", "Guide me through grounding", "Give me a distress skill",
      "What small step can I take", "Help me understand this feeling",
      "I feel a bit better", "I feel calmer", "Feeling better", "I feel better",
      "Play me a calming song", "Calming song", "I need to vent this out",
      "I want to share more", "I need to talk"
    ];
    const isButtonClick = BUTTON_OPTIONS.some(opt => message.includes(opt));
    
    // Store context for next queries
    if (!isPanicTrigger && message.length > 10 && !isButtonClick) {
      setLastEmotionalMessage(message);
    }

    // Auto-trigger music player immediately if user requests song/music
    const lowerMessage = message.toLowerCase();
    const isMusicRequest = lowerMessage.includes('song') || lowerMessage.includes('music') || lowerMessage.includes('audio') || lowerMessage.includes('soundscape') || lowerMessage.includes('ambient');
    if (isMusicRequest) {
      setTimeout(() => setShowMediaPlayer(true), 500);
    }
    
    try {
      const payloadContext = isCameraActive && visualEmotion ? `[Visual Face Emotion Detected via Webcam: ${visualEmotion}] ` + lastEmotionalMessage : lastEmotionalMessage;
      
      const response = await axios.post('https://balajikrishnan031-keffi-backend.hf.space/api/chat', {
        message: message,
        patient_id: userData?.patient_id || "P-102",
        session_id: currentSessionId,
        emotional_context: payloadContext
      });
      
      let botResponse = response.data.reply || "I'm here for you.";
      
      if (botResponse.includes('[TRIGGER_MUSIC_PLAYER]')) {
        botResponse = botResponse.replace('[TRIGGER_MUSIC_PLAYER]', '').trim();
        setTimeout(() => setShowMediaPlayer(true), 1500); // Popup the music player after a small delay
      }
      
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'neffi', 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
        text: botResponse,
        options: response.data.options
      }]);
      
      if (response.data.requires_appointment && !appointmentPrompted) {
        setAppointmentPrompted(true);
        setTimeout(() => setShowAppointmentPopup(true), 1500);
      }

      if ('speechSynthesis' in window && isVoiceEnabled) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(botResponse.replace(/[#*]/g, ''));
        utterance.lang = 'en-US';
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Google US English') || v.name.includes('Female'));
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.pitch = 0.95;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'neffi', 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
        text: "I'm having a hard time reaching my thoughts right now (Backend Offline). Let's take a deep breath together." 
      }]);
    }
  };

  const handleBookAppointment = async () => {
    setShowAppointmentPopup(false);
    try {
      await axios.post('https://balajikrishnan031-keffi-backend.hf.space/api/book_appointment', {
        patient_id: "P-102",
        name: userData?.name || "Patient",
        phone: userData?.phone || "9876543210",
        email: userData?.email || "patient@neffi.ai"
      });
      alert("Appointment automation triggered successfully! You will receive a WhatsApp message shortly.");
    } catch (err) {
      console.error("Failed to book appointment", err);
      alert("Failed to trigger appointment automation.");
    }
  };

  const renderInputBox = (isCentered = false) => (
    <div className={`${isCentered ? 'bg-transparent pt-2' : 'px-4 md:px-6 pb-3 bg-transparent pt-3 z-20 shrink-0'} relative w-full`}>
      <div className="max-w-[90%] mx-auto bg-white/35 border border-white/45 shadow-lg rounded-[2rem] p-2.5 flex items-center gap-3 focus-within:bg-white/50 transition-all duration-300">
        
        {/* Utility Plus button */}
        <button 
          onClick={() => setShowWatchControls(!showWatchControls)} 
          className="w-10 h-10 rounded-full bg-[#3A7070]/10 hover:bg-[#3A7070]/20 text-[#3A7070] transition-colors flex items-center justify-center cursor-pointer font-bold text-lg shrink-0"
          title="Biofeedback Sync Simulator"
        >
          +
        </button>

        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isRecording ? "Listening..." : "Ask Neffi..."} 
          className="flex-1 bg-transparent border-none outline-none py-3 text-[#1B3B3B] font-inter font-medium text-base placeholder-slate-500 focus:ring-0"
        />

        {/* Model Selector dropdown capsule */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3A7070]/10 border border-[#3A7070]/15 text-[10px] font-inter font-bold text-[#3A7070] tracking-wider shrink-0">
          <span>Neffi V3 Pro</span>
          <span className="text-[8px]">▼</span>
        </div>

        {/* Micro-interaction Microphone / Send button */}
        {input.trim() ? (
          <button 
            onClick={() => handleSend()} 
            className="w-10 h-10 rounded-full bg-[#3A7070] text-white hover:bg-[#2C5555] transition-all cursor-pointer shadow-md flex items-center justify-center shrink-0"
            title="Send message"
          >
            <Send size={16} />
          </button>
        ) : (
          <button 
            onClick={toggleRecording} 
            className={`w-10 h-10 rounded-full transition-all cursor-pointer flex items-center justify-center shrink-0 ${isRecording ? 'bg-red-500/10 text-red-500 animate-pulse border border-red-500/20' : 'bg-transparent text-slate-500 hover:text-[#3A7070] hover:bg-[#3A7070]/10'}`}
            title="Voice Microphone Input"
          >
            <Mic size={18} />
          </button>
        )}

      </div>
      <div className="mx-auto w-fit px-3.5 py-1.5 rounded-full bg-white/45 backdrop-blur-md border border-white/30 text-center text-[10px] text-[#1B3B3B] font-inter font-semibold mt-3 shadow-sm">
        Neffi AI can make mistakes. Consider checking important info.
      </div>
    </div>
  );

  if (!moodSet) {
    return <DailyMoodCheckIn patientId="P-102" onComplete={handleMoodSelect} />;
  }

  return (
    <div className="h-full w-full flex relative overflow-hidden bg-transparent text-slate-800">
      
      {/* Ambient Radial Gradient behind input box */}
      <div className="absolute inset-0 gemini-radial-glow z-0"></div>

      {/* 💬 MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col relative min-w-0 z-10">
        
        {/* Top Header */}
        <div className="flex justify-between items-center px-6 md:px-8 py-5 z-20 bg-transparent shrink-0">
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2.5 rounded-full text-slate-700 hover:text-[#3A7070] bg-white/20 border border-white/30 hover:bg-white/45 transition-all cursor-pointer flex items-center justify-center mr-1 shadow-sm"
                title={isSidebarOpen ? "Hide Sidebar Menu" : "Show Sidebar Menu"}
              >
                <Menu size={18} />
              </button>
              <div className="w-10 h-10 bg-white/20 border border-white/30 rounded-full flex items-center justify-center shadow-sm">
                <NeffiLogo size="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-raleway font-black bg-gradient-to-r from-[#2C5555] via-[#3A7070] to-[#8FA989] bg-clip-text text-transparent drop-shadow-sm tracking-tight leading-none">Neffi</h2>
                <div className="flex items-center gap-2 text-[10px] text-[#3A7070] font-inter font-bold tracking-wider mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8FA989] animate-pulse"></div> Active & Listening
                </div>
              </div>
            </div>
            
            {/* Top-Right Control Popover Dropdown (Gemini style) */}
            <div className="relative">
              <button 
                onClick={() => setShowControlsPopover(!showControlsPopover)}
                className="w-10 h-10 rounded-full bg-white/20 border border-white/30 hover:bg-white/45 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-102"
                title="Sanctuary Controls & Settings"
              >
                <Settings size={18} />
              </button>

              {showControlsPopover && (
                <div className="absolute right-0 top-12 z-50 w-64 p-4 rounded-2xl bg-white/90 border border-white/40 backdrop-blur-md shadow-2xl flex flex-col gap-3 animate-fade-in text-slate-700">
                  <div className="text-[10px] font-inter font-bold text-[#3A7070] uppercase tracking-widest border-b border-slate-100 pb-1.5">
                    Sanctuary Controls
                  </div>
                  
                  {/* Heart Sync Control */}
                  <div className="flex flex-col gap-1.5 bg-[#3A7070]/5 p-2.5 rounded-xl border border-[#3A7070]/10">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <HeartPulse size={13} className={heartRate > 100 ? 'text-red-500 animate-pulse' : 'text-[#3A7070]'} />
                        Bio-Sync: {heartRate} BPM
                      </span>
                      <button 
                        onClick={() => setShowWatchControls(!showWatchControls)}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                      >
                        {showWatchControls ? 'Hide Slider' : 'Simulate'}
                      </button>
                    </div>
                    {showWatchControls && (
                      <input 
                        type="range" 
                        min="60" 
                        max="140" 
                        value={heartRate} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setHeartRate(val);
                          if (val < 100) setHasTriggeredPanic(false);
                        }}
                        className="w-full accent-[#3A7070] cursor-pointer mt-1"
                      />
                    )}
                  </div>

                  {/* Camera Tracking Toggle */}
                  <button 
                    onClick={() => setIsCameraActive(!isCameraActive)}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-xs font-semibold text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Camera size={14} className="text-slate-500" />
                      Visual Tracking
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${isCameraActive ? 'bg-[#3A7070]/10 text-[#3A7070]' : 'bg-slate-100 text-slate-400'}`}>
                      {isCameraActive ? 'On' : 'Off'}
                    </span>
                  </button>

                  {/* Voice Therapy Toggle */}
                  <button 
                    onClick={() => {
                      setIsVoiceEnabled(!isVoiceEnabled);
                      if (isVoiceEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-xs font-semibold text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Volume2 size={14} className="text-slate-500" />
                      Voice Readout
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${isVoiceEnabled ? 'bg-[#3A7070]/10 text-[#3A7070]' : 'bg-slate-100 text-slate-400'}`}>
                      {isVoiceEnabled ? 'On' : 'Off'}
                    </span>
                  </button>

                  {/* Music Sanctuary */}
                  <button 
                    onClick={() => { setShowMediaPlayer(true); setShowControlsPopover(false); }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-xs font-semibold text-left cursor-pointer"
                  >
                    <span>🎵</span>
                    <span>Music Sanctuary</span>
                  </button>

                  {/* Therapist Scheduler */}
                  <button 
                    onClick={() => { setShowAppointmentPopup(true); setShowControlsPopover(false); }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-xs font-semibold text-left cursor-pointer"
                  >
                    <User size={14} className="text-slate-500" />
                    <span>Therapist Booking</span>
                  </button>

                  {/* SOS Trigger */}
                  <button 
                    onClick={() => { setShowSOS(true); setShowControlsPopover(false); }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-700 transition-all text-xs font-bold text-left cursor-pointer"
                  >
                    <PhoneCall size={14} className="text-red-500" />
                    <span>SOS Crisis Line</span>
                  </button>
                </div>
              )}
            </div>
        </div>
          
          <CameraEmotionTracker isCameraActive={isCameraActive} onEmotionDetected={setVisualEmotion} />
  
          {showMediaPlayer && <MediaPlayer onClose={() => setShowMediaPlayer(false)} />}
  
          {showAppointmentPopup && (
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[60] bg-white/80 backdrop-blur-md border border-white/30 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center animate-fade-in w-80 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-[#3A7070] mb-6 text-3xl">🫂</div>
              <h3 className="text-xl font-space font-black text-slate-800 mb-2">You're not alone</h3>
              <p className="text-sm text-slate-600 mb-8 font-space font-semibold">We noticed you're going through a tough time. Would you like to schedule an automatic appointment with a human therapist?</p>
              <div className="flex flex-col gap-3 w-full">
                <button onClick={handleBookAppointment} className={`w-full py-3.5 rounded-xl font-space font-bold text-sm bg-[#3A7070] text-white hover:bg-[#2C5555] cursor-pointer`}>Yes, Book Session</button>
                <button onClick={() => setShowAppointmentPopup(false)} className={`w-full py-3.5 rounded-xl font-space font-bold text-sm bg-white/20 border border-white/30 text-slate-700 hover:bg-white/45 transition-colors cursor-pointer`}>Not Right Now</button>
              </div>
            </div>
          )}
          {messages.length === 0 ? (
            /* 🌌 GEMINI EMPTY STATE START PAGE (Screenshot 625) */
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-fade-in relative z-10">
              <h1 className="text-4xl md:text-5xl font-inter font-semibold text-[#1B3B3B] mb-12 tracking-tight">
                What can I help with, {userData?.name || "Balaji"}?
              </h1>
              
              {/* Bottom centered floating input box */}
              <div className="w-full max-w-[90%]">
                {renderInputBox(true)}
              </div>
            </div>
          ) : (
            /* 💬 GEMINI MESSAGE STREAM (Screenshot 626) */
            <>
              <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-8 min-h-0 relative scrollbar-thin scrollbar-thumb-[#3A7070]/10 scrollbar-track-transparent">
                <div className="max-w-[90%] mx-auto w-full flex flex-col gap-6">
                  {messages.map(m => {
                    const { mainText } = m.sender === 'neffi' ? parseMessageText(m.text) : { mainText: m.text };
                    const isNeffi = m.sender === 'neffi';
                    
                    return (
                      <div key={m.id} className={`flex w-full ${isNeffi ? 'justify-start' : 'justify-end'} animate-fade-in-up`}>
                        
                        {isNeffi ? (
                          /* Bot response (Frosted glass bubble for superb contrast) */
                          <div className="flex items-start gap-4 w-full">
                            <div className="w-8 h-8 rounded-full bg-[#3A7070]/20 border border-[#3A7070]/30 flex items-center justify-center shrink-0 shadow-sm mt-3 animate-pulse">
                              <Sparkles size={14} className="text-[#2C5555]" />
                            </div>
                            <div className="flex-1 flex flex-col">
                              <div className="whitespace-pre-wrap p-5 rounded-[1.5rem] rounded-tl-sm bg-white/45 backdrop-blur-md border border-white/50 text-[15px] md:text-base font-inter font-medium leading-relaxed text-[#1B3B3B] shadow-[0_8px_32px_rgba(58,112,112,0.06)]">
                                {mainText}
                              </div>
                              
                              {/* Option Buttons beneath Neffi's reply */}
                              {m.options && m.options.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 w-full">
                                  {m.options.map((qr, i) => (
                                    <button 
                                      key={i} 
                                      onClick={() => handleSend(qr)} 
                                      style={{animationDelay: `${i * 80}ms`}}
                                      className={`flex items-start text-left p-4 rounded-2xl bg-white/20 border border-white/30 hover:border-[#3A7070]/20 hover:bg-white/35 shadow-sm group cursor-pointer animate-slide-up hover:scale-[1.02] duration-300`}
                                    >
                                      <div className="w-5 h-5 rounded-full bg-[#3A7070]/10 border border-[#3A7070]/15 text-slate-600 group-hover:bg-[#3A7070]/20 group-hover:text-[#2C5555] group-hover:border-[#3A7070]/25 flex items-center justify-center text-[10px] font-inter font-medium shrink-0 mr-3 mt-0.5 transition-colors">
                                         {i + 1}
                                      </div>
                                      <span className="text-[13px] font-inter font-medium text-[#1B3B3B] leading-snug">
                                        {qr}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Action Buttons beneath bot reply */}
                              <div className="flex items-center gap-1 mt-4 text-[#8A8A8A]">
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(mainText);
                                    alert("Copied to clipboard!");
                                  }}
                                  className="gemini-action-btn-light"
                                  title="Copy Response"
                                >
                                  📋
                                </button>
                                <button 
                                  onClick={() => {
                                    if ('speechSynthesis' in window) {
                                      window.speechSynthesis.cancel();
                                      const utterance = new SpeechSynthesisUtterance(mainText.replace(/[#*]/g, ''));
                                      utterance.lang = 'en-US';
                                      window.speechSynthesis.speak(utterance);
                                    }
                                  }}
                                  className="gemini-action-btn-light"
                                  title="Read Aloud"
                                >
                                  🔊
                                </button>
                                <button className="gemini-action-btn-light" title="Good Response">👍</button>
                                <button className="gemini-action-btn-light" title="Bad Response">👎</button>
                                <span className="text-[10px] uppercase font-inter font-semibold tracking-wider ml-auto text-slate-500">
                                  {m.time}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* User message (Frosted glass bubble for superb contrast) */
                          <div className="flex flex-col items-end max-w-[85%]">
                            <div className="whitespace-pre-wrap p-4 md:p-5 text-sm md:text-base font-inter font-medium leading-relaxed rounded-[1.5rem] rounded-tr-sm bg-white/55 backdrop-blur-md border border-white/60 text-[#1B3B3B] shadow-[0_8px_32px_rgba(58,112,112,0.08)]">
                              {mainText}
                            </div>
                            <span className="text-[9px] text-slate-500 font-inter font-medium uppercase tracking-wider mt-2 px-1">
                              {m.time}
                            </span>
                          </div>
                        )}

                      </div>
                    );
                  })}
                  {isTyping && (
                    <div className="flex items-start gap-4 w-full">
                      <div className="w-8 h-8 rounded-full bg-[#3A7070]/10 border border-[#3A7070]/15 flex items-center justify-center shrink-0 mt-1">
                        <Sparkles size={14} className="text-[#3A7070]" />
                      </div>
                      <div className="p-4 rounded-[1.5rem] bg-white/30 flex gap-1.5 items-center border border-white/35">
                        <div className="w-2 h-2 rounded-full bg-[#3A7070] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-[#3A7070] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-[#3A7070] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} className="h-4" />
                </div>
              </div>
              {renderInputBox(false)}
            </>
          )}
      </div>
    </div>
  );
};

// 4.2 Peace Log
const PeaceLog = ({ isSidebarOpen, setIsSidebarOpen }) => (
  <div className="h-full w-full flex flex-col relative overflow-hidden animate-fade-in bg-transparent">
    {/* Ambient Glow Orbs */}
    <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#3A7070]/8 blur-[80px] pointer-events-none"></div>
    <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#8FA989]/8 blur-[100px] pointer-events-none"></div>

    {/* Page Header */}
    <div className="px-6 md:px-8 py-5 border-b border-[#3A7070]/10 bg-white/75 backdrop-blur-md flex justify-between items-center z-20 shrink-0">
      <div className="flex items-center gap-2 md:gap-4">
        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 rounded-xl text-slate-600 hover:text-[#3A7070] glass-card border border-white/30 hover:bg-white/50 transition-all cursor-pointer mr-1 shadow-sm flex items-center justify-center" title="Open Sidebar Menu">
            <Menu size={18} />
          </button>
        )}
        <div className="w-12 h-12 glass-card border border-white/45 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-2xl">📖</span>
        </div>
        <div>
          <h2 className="text-xl font-raleway font-black bg-gradient-to-r from-[#2C5555] via-[#3A7070] to-[#8FA989] bg-clip-text text-transparent">Peace Log</h2>
          <div className="text-xs text-[#8FA989] font-space font-extrabold tracking-wider">Your Personal Emotional Archive</div>
        </div>
      </div>
    </div>

    {/* Content Area */}
    <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6 min-h-0 bg-transparent scrollbar-thin scrollbar-thumb-[#3A7070]/20 scrollbar-track-transparent">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
        {[
          { date: 'Today, 10:00 AM', mood: 'Anxious', title: 'Morning Panic', desc: 'Discussed work pressure and did a quick 4-7-8 breathing session.', color: 'glow-gold' },
          { date: 'Yesterday, 9:00 PM', mood: 'Calm', title: 'Night Reflections', desc: 'Used the gratitude jar. Felt significantly calmer before bed.', color: 'glow-emerald' },
          { date: '25 April 2026', mood: 'Heavy', title: 'Trauma Processing', desc: 'Neffi guided through severe anxiety. Grounding techniques used.', color: 'glow-purple' },
          { date: '22 April 2026', mood: 'Stressed', title: 'Work Stress', desc: 'Vented about the upcoming presentation. Neffi helped reframe thoughts.', color: 'glow-rose' }
        ].map((log, i) => (
          <div key={i} style={{animationDelay: `${i * 100}ms`}} className={`p-8 rounded-[2.5rem] glass-card backdrop-blur-md border border-white/20 shadow-sm transition-all hover:translate-y-[-4px] duration-300 hover:shadow-lg cursor-pointer flex flex-col animate-slide-up ${log.color}`}>
            <div className="flex justify-between items-center mb-5">
              <span className="text-xs text-[#8FA989] font-space font-extrabold tracking-wider uppercase">{log.date}</span>
              <span className={`px-3 py-1.5 rounded-full border text-xs font-space font-extrabold shadow-sm transition-colors ${
                log.mood === 'Anxious' || log.mood === 'Stressed' ? 'bg-amber-100/70 border-amber-300 text-amber-700' :
                log.mood === 'Calm' ? 'bg-emerald-100/70 border-emerald-300 text-emerald-700' :
                log.mood === 'Heavy' ? 'bg-indigo-100/70 border-indigo-300 text-indigo-700' :
                'bg-slate-100/70 border-slate-300 text-slate-700'
              }`}>{log.mood}</span>
            </div>
            <h3 className="text-lg font-raleway font-black text-slate-800 mb-3">{log.title}</h3>
            <p className="text-slate-500 leading-relaxed text-sm flex-1 font-space font-semibold">{log.desc}</p>
            <div className="mt-6 flex items-center text-[#3A7070] font-space font-extrabold text-sm group tracking-wider">
               Read full log <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform"/>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// 4.3 My Journey
const MyJourney = ({ isSidebarOpen, setIsSidebarOpen }) => (
  <div className="h-full w-full flex flex-col relative overflow-hidden animate-fade-in bg-transparent">
    {/* Page Header */}
    <div className="px-6 md:px-8 py-5 border-b border-[#3A7070]/10 bg-white/75 backdrop-blur-md flex justify-between items-center z-20 shrink-0">
      <div className="flex items-center gap-2 md:gap-4">
        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 rounded-xl text-slate-600 hover:text-[#3A7070] glass-card border border-white/30 hover:bg-white/50 transition-all cursor-pointer mr-1 shadow-sm flex items-center justify-center" title="Open Sidebar Menu">
            <Menu size={18} />
          </button>
        )}
        <div className="w-12 h-12 glass-card border border-white/45 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-2xl">📈</span>
        </div>
        <div>
          <h2 className="text-xl font-raleway font-black bg-gradient-to-r from-[#2C5555] via-[#3A7070] to-[#8FA989] bg-clip-text text-transparent">Emotional Landscape</h2>
          <div className="text-xs text-[#8FA989] font-space font-extrabold tracking-wider">Your Growth Journey</div>
        </div>
      </div>
    </div>

    {/* Content Area */}
    <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-8 min-h-0 bg-transparent scrollbar-thin scrollbar-thumb-[#3A7070]/20 scrollbar-track-transparent">
      <div className={`w-full h-80 rounded-[2.5rem] glass-card border border-white/30 relative overflow-hidden flex items-end justify-center shadow-inner shrink-0`}>
        <div className="absolute top-8 right-12 w-24 h-24 rounded-full bg-gradient-to-tr from-[#D4A373] to-white blur-md shadow-[0_0_40px_#D4A373]"></div>
        <div className="w-[120%] h-40 bg-[#8FA989] rounded-[100%] absolute -bottom-8 opacity-40 animate-wave-drift"></div>
        <div className="w-[80%] h-48 bg-[#3A7070] rounded-[100%] absolute -bottom-10 opacity-60 left-[-10%] animate-wave-drift" style={{animationDuration: '16s', animationDelay: '-4s'}}></div>
        <div className="w-[90%] h-44 bg-[#548a8a] rounded-[100%] absolute -bottom-8 opacity-70 right-[-10%] animate-wave-drift" style={{animationDuration: '20s', animationDelay: '-8s'}}></div>
        <div className={`absolute top-8 left-8 px-6 py-3 rounded-2xl glass-card border border-white/40 shadow-sm animate-float`}>
          <h3 className="text-lg font-raleway font-bold text-slate-800 flex items-center gap-2">You are Thriving 🌿</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
        <div style={{animationDelay: '100ms'}} className="p-8 rounded-[2rem] glass-card border border-white/20 shadow-sm flex flex-col items-center justify-center gap-3 animate-slide-up hover:scale-105 transition-all duration-300 hover:shadow-md cursor-pointer glow-teal">
          <div className="text-4xl font-space font-black text-[#3A7070]">12</div>
          <div className="text-xs font-space font-extrabold text-slate-500 uppercase tracking-widest">Day Streak</div>
        </div>
        <div style={{animationDelay: '200ms'}} className="p-8 rounded-[2rem] glass-card border border-white/20 shadow-sm flex flex-col items-center justify-center gap-3 animate-slide-up hover:scale-105 transition-all duration-300 hover:shadow-md cursor-pointer glow-emerald">
          <div className="text-4xl font-space font-black text-[#8FA989]">85%</div>
          <div className="text-xs font-space font-extrabold text-slate-500 uppercase tracking-widest">Calm Status</div>
        </div>
        <div style={{animationDelay: '300ms'}} className="p-8 rounded-[2rem] glass-card border border-white/20 shadow-sm flex flex-col items-center justify-center gap-3 animate-slide-up hover:scale-105 transition-all duration-300 hover:shadow-md cursor-pointer glow-gold">
          <div className="text-4xl font-space font-black text-[#D4A373]">4</div>
          <div className="text-xs font-space font-extrabold text-slate-500 uppercase tracking-widest">Tools Used</div>
        </div>
      </div>
    </div>
  </div>
);

// 4.4 Mind Tools
const MindTools = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [activeTool, setActiveTool] = useState(null); 
  const [worryText, setWorryText] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [gratitudeText, setGratitudeText] = useState('');
  const [gratitudeList, setGratitudeList] = useState([]);
  const [groundingStep, setGroundingStep] = useState(0);

  const handleBurn = () => {
    setIsBurning(true);
    setTimeout(() => { setWorryText(''); setIsBurning(false); setActiveTool(null); }, 2000);
  };

  const getHeader = (toolTitle, toolSubtitle) => (
    <div className="px-6 md:px-8 py-5 border-b border-[#3A7070]/10 bg-white/40 backdrop-blur-md flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={() => { setActiveTool(null); setGroundingStep(0); }} className="p-2 rounded-full bg-white/40 border border-white/40 text-slate-600 hover:bg-[#3A7070]/20 hover:text-[#3A7070] transition-colors cursor-pointer mr-1">
          <ArrowRight className="rotate-180" size={16} />
        </button>
        <div>
          <h2 className="text-xl font-raleway font-black text-[#2C5555]">{toolTitle}</h2>
          <div className="text-xs text-[#8FA989] font-space font-extrabold tracking-wider">{toolSubtitle}</div>
        </div>
      </div>
    </div>
  );

  if (activeTool === 'breathing') {
    return (
      <div className="h-full w-full flex flex-col relative overflow-hidden animate-fade-in bg-transparent">
        {getHeader('4-7-8 Breathing', 'Interactive Cardiac Coherence')}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 space-y-12 bg-white/5 backdrop-blur-[4px]">
          <div className="text-center">
            <h3 className="text-2xl font-raleway font-black text-slate-800 mb-2">Breathe & Reset</h3>
            <p className="text-slate-500 font-space font-semibold text-sm">Synchronize your breath with the expansion of the orb.</p>
          </div>
          <div className="relative w-72 h-72 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#3A7070] rounded-full opacity-10 animate-ping" style={{animationDuration: '4s'}}></div>
            <div className="w-44 h-44 rounded-full glass-card shadow-2xl border border-white/40 flex items-center justify-center text-[#3A7070] font-space font-black text-lg z-10 backdrop-blur-md animate-breathing glow-teal">Breathe In</div>
          </div>
          <button onClick={() => setActiveTool(null)} className={`px-8 py-3 rounded-xl font-space font-bold text-sm ${theme.btnOutline} cursor-pointer`}>Cancel Session</button>
        </div>
      </div>
    );
  }

  if (activeTool === 'worry') {
    return (
      <div className="h-full w-full flex flex-col relative overflow-hidden animate-fade-in bg-transparent">
        {getHeader('Worry Burner', 'Visual Cognitive Release')}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto space-y-8 w-full p-6 md:p-8">
          <div className="text-center">
            <h3 className="text-2xl font-raleway font-black text-[#D4A373] mb-2">Release What You Hold</h3>
            <p className="text-slate-500 font-space font-semibold text-sm">Write down your stressors. They will disappear into ashes.</p>
          </div>
          <textarea 
            value={worryText} onChange={(e) => setWorryText(e.target.value)}
            className={`w-full h-56 p-6 rounded-[2rem] glass-input shadow-inner outline-none text-slate-800 font-space font-medium text-base resize-none transition-all duration-1000 ${isBurning ? 'blur-2xl opacity-0 scale-95 border-amber-500 bg-amber-500/5' : ''}`}
            placeholder="Write your worries here..."
          />
          <div className="flex gap-4 w-full">
            <button onClick={() => setActiveTool(null)} className={`flex-1 py-4 rounded-xl font-space font-bold text-sm ${theme.btnOutline} cursor-pointer`}>Cancel</button>
            <button onClick={handleBurn} className={`flex-1 py-4 rounded-xl font-space font-bold text-sm bg-[#D4A373] text-white shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer glow-gold`}>Burn Worry</button>
          </div>
        </div>
      </div>
    );
  }

  if (activeTool === 'gratitude') {
    return (
      <div className="h-full w-full flex flex-col relative overflow-hidden animate-fade-in bg-transparent">
        {getHeader('Gratitude Jar', 'Perspective Shifting')}
        <div className="flex-1 flex flex-col items-center max-w-3xl mx-auto space-y-6 w-full p-6 md:p-8 min-h-0">
          <div className="text-center">
            <h3 className="text-2xl font-raleway font-black text-[#8FA989] mb-2">Capture Positivity</h3>
            <p className="text-slate-500 font-space font-semibold text-sm">Document tiny elements of joy to light up your landscape.</p>
          </div>
          <div className="flex w-full gap-4 shrink-0">
             <input 
               value={gratitudeText} onChange={e => setGratitudeText(e.target.value)} 
               placeholder="I am grateful for..." 
               className={`flex-1 p-4 rounded-2xl glass-input shadow-sm outline-none text-slate-800 font-space font-semibold text-base`}
               onKeyPress={e => {
                 if(e.key === 'Enter' && gratitudeText) {
                   setGratitudeList([{id: Date.now(), text: gratitudeText}, ...gratitudeList]);
                   setGratitudeText('');
                 }
               }}
             />
             <button onClick={() => {
               if(gratitudeText) {
                 setGratitudeList([{id: Date.now(), text: gratitudeText}, ...gratitudeList]);
                 setGratitudeText('');
               }
             }} className={`px-8 py-4 rounded-2xl bg-[#8FA989] text-white font-space font-bold shadow-md hover:-translate-y-0.5 transition-all text-base cursor-pointer glow-emerald`}>Drop</button>
          </div>
          <div className={`flex-1 w-full rounded-[2.5rem] glass-panel border-8 border-[#8FA989]/20 p-8 flex flex-col-reverse items-center justify-start overflow-y-auto relative min-h-0 shadow-inner bg-white/10`}>
             <div className="w-48 h-8 rounded-[100%] bg-slate-200 absolute -top-4 opacity-50 blur-md"></div>
             {gratitudeList.length === 0 && <div className="text-slate-500 font-space font-bold text-sm absolute top-1/2">Your jar is empty.</div>}
             {gratitudeList.map((g, idx) => (
               <div key={g.id} style={{animationDelay: `${idx * 80}ms`}} className="bg-gradient-to-r from-[#8FA989] to-[#649e9e] text-white px-6 py-3 rounded-full mb-3 shadow-lg transform rotate-[-1.5deg] font-space font-bold text-sm animate-scale-up hover:scale-105 transition-all cursor-pointer">
                   {g.text}
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeTool === 'grounding') {
    const steps = [
      { num: 5, text: "Things you can SEE", color: "text-[#3A7070]", bg: "bg-[#3A7070]", glow: "glow-teal" },
      { num: 4, text: "Things you can FEEL", color: "text-[#D4A373]", bg: "bg-[#D4A373]", glow: "glow-gold" },
      { num: 3, text: "Things you can HEAR", color: "text-[#8FA989]", bg: "bg-[#8FA989]", glow: "glow-emerald" },
      { num: 2, text: "Things you can SMELL", color: "text-slate-600", bg: "bg-slate-600", glow: "glow-white" },
      { num: 1, text: "Thing you can TASTE", color: "text-[#3A7070]", bg: "bg-[#3A7070]", glow: "glow-teal" },
    ];
    const current = steps[groundingStep];

    return (
      <div className="h-full w-full flex flex-col relative overflow-hidden animate-fade-in bg-transparent">
        {getHeader('5-4-3-2-1 Grounding', 'Sensory Centering')}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full p-6 md:p-8">
          {groundingStep < 5 ? (
            <div className={`p-10 md:p-14 rounded-[3rem] glass-panel border border-white/30 shadow-2xl flex flex-col items-center text-center w-full animate-scale-up ${current.glow}`}>
              <div className={`text-7xl font-space font-black ${current.color} mb-6 drop-shadow-md animate-pulse`}>{current.num}</div>
              <h3 className="text-xl md:text-2xl font-space font-black text-slate-800 mb-8 uppercase tracking-widest">{current.text}</h3>
              <p className="text-slate-600 font-space font-bold text-sm md:text-base mb-10">Take your time. Look around you. Name them silently or out loud.</p>
              <button onClick={() => setGroundingStep(s => s + 1)} className={`w-full py-4 rounded-xl text-white font-space font-bold text-base ${current.bg} shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer`}>Next Step</button>
            </div>
          ) : (
            <div className={`p-10 md:p-14 rounded-[3rem] glass-panel border border-white/30 shadow-2xl flex flex-col items-center text-center w-full glow-emerald`}>
              <div className={`w-20 h-20 rounded-2xl bg-[#8FA989]/20 text-[#8FA989] flex items-center justify-center mb-6 border border-white/30`}><Star size={40}/></div>
              <h3 className="text-2xl font-raleway font-black text-slate-800 mb-4">You did great.</h3>
              <p className="text-slate-600 font-space font-bold text-sm mb-10">Welcome back to the present moment.</p>
              <button onClick={() => {setGroundingStep(0); setActiveTool(null);}} className={`w-full py-4 rounded-xl font-space font-bold text-base ${theme.btnOutline} cursor-pointer`}>Finish</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const allTools = [
    { id: 'breathing', title: '4-7-8 Breathing', desc: 'Reduce heart rate', icon: Activity, color: 'text-[#3A7070]', glowClass: 'glow-teal', active: true },
    { id: 'worry', title: 'Worry Burner', desc: 'Release anxiety visually', icon: Sparkles, color: 'text-[#D4A373]', glowClass: 'glow-gold', active: true },
    { id: 'gratitude', title: 'Gratitude Jar', desc: 'Shift perspective', icon: Heart, color: 'text-[#8FA989]', glowClass: 'glow-emerald', active: true },
    { id: 'grounding', title: '5-4-3-2-1 Grounding', desc: 'Halt panic attacks', icon: Star, color: 'text-[#3A7070]', glowClass: 'glow-teal', active: true },
    { id: 'bodyscan', title: 'Body Scan', desc: 'Release physical tension', icon: User, color: 'text-[#D4A373]', glowClass: 'glow-gold', active: false },
    { id: 'moodtracker', title: 'Mood Tracker', desc: 'Identify daily patterns', icon: PieChart, color: 'text-[#8FA989]', glowClass: 'glow-emerald', active: false },
    { id: 'reframing', title: 'Cognitive Reframing', desc: 'Challenge negative thoughts', icon: MessageCircle, color: 'text-[#3A7070]', glowClass: 'glow-teal', active: false },
    { id: 'thermometer', title: 'Anxiety Thermometer', desc: 'Measure distress', icon: AlertTriangle, color: 'text-[#D4A373]', glowClass: 'glow-gold', active: false },
    { id: 'sleep', title: 'Sleep Wind-down', desc: 'Prepare for deep rest', icon: Smile, color: 'text-[#8FA989]', glowClass: 'glow-emerald', active: false },
    { id: 'journal', title: 'Guided Journal', desc: 'Unlocks at Level 2', icon: BookOpen, color: 'text-slate-400', glowClass: 'border-slate-200/50', active: false, locked: true },
  ];

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden animate-fade-in bg-transparent">
      {/* Ambient Glow Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#3A7070]/8 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#8FA989]/8 blur-[100px] pointer-events-none"></div>

      {/* Page Header */}
      <div className="px-6 md:px-8 py-5 border-b border-[#3A7070]/10 bg-white/75 backdrop-blur-md flex justify-between items-center z-20 shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          {!isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 rounded-xl text-slate-600 hover:text-[#3A7070] glass-card border border-white/30 hover:bg-white/50 transition-all cursor-pointer mr-1 shadow-sm flex items-center justify-center" title="Open Sidebar Menu">
              <Menu size={18} />
            </button>
          )}
          <div className="w-12 h-12 glass-card border border-white/45 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-2xl">🧘</span>
          </div>
          <div>
            <h2 className="text-xl font-raleway font-black bg-gradient-to-r from-[#2C5555] via-[#3A7070] to-[#8FA989] bg-clip-text text-transparent">Mind Tools Sandbox</h2>
            <div className="text-xs text-[#8FA989] font-space font-extrabold tracking-wider">Coping Exercises</div>
          </div>
        </div>
      </div>

      {/* Grid Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-transparent scrollbar-thin scrollbar-thumb-[#3A7070]/20 scrollbar-track-transparent">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-8">
          {allTools.map((tool, i) => (
            <div key={tool.id} onClick={() => tool.active ? setActiveTool(tool.id) : null} 
              style={{animationDelay: `${i * 60}ms`}}
              className={`p-6 rounded-[2.5rem] glass-card border shadow-sm flex flex-col items-center justify-center gap-4 text-center animate-slide-up transition-all duration-300 ${tool.active ? `${tool.glowClass} hover:scale-105 hover:shadow-md cursor-pointer` : 'opacity-65 border-white/10'} ${tool.locked ? 'cursor-not-allowed opacity-40' : ''}`}>
              <div className={`w-14 h-14 rounded-2xl bg-white/20 border border-white/15 flex items-center justify-center shadow-sm ${tool.color}`}><tool.icon size={24} /></div>
              <div>
                <h3 className="font-raleway font-extrabold text-slate-800 text-base mb-1">{tool.title}</h3>
                <p className="text-xs text-slate-500 font-space font-semibold">{tool.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 4.5 Rewards
const Rewards = ({ points, isSidebarOpen, setIsSidebarOpen }) => (
  <div className="h-full w-full flex flex-col relative overflow-hidden animate-fade-in bg-transparent">
    {/* Page Header */}
    <div className="px-6 md:px-8 py-5 border-b border-[#3A7070]/10 bg-white/75 backdrop-blur-md flex justify-between items-center z-20 shrink-0">
      <div className="flex items-center gap-2 md:gap-4">
        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 rounded-xl text-slate-600 hover:text-[#3A7070] glass-card border border-white/30 hover:bg-white/50 transition-all cursor-pointer mr-1 shadow-sm flex items-center justify-center" title="Open Sidebar Menu">
            <Menu size={18} />
          </button>
        )}
        <div className="w-12 h-12 glass-card border border-white/45 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-2xl">🎁</span>
        </div>
        <div>
          <h2 className="text-xl font-raleway font-black bg-gradient-to-r from-[#2C5555] via-[#3A7070] to-[#8FA989] bg-clip-text text-transparent">Rewards</h2>
          <div className="text-xs text-[#8FA989] font-space font-extrabold tracking-wider">Sanctuary Incentives</div>
        </div>
      </div>
    </div>

    {/* Content Area */}
    <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col items-center justify-start gap-8 min-h-0 bg-transparent scrollbar-thin scrollbar-thumb-[#3A7070]/20 scrollbar-track-transparent">
      <div className="max-w-2xl w-full p-8 md:p-10 rounded-[2.5rem] glass-card border border-white/20 flex flex-col items-center text-center shadow-sm animate-float glow-teal shrink-0">
        <Gift size={44} className="text-[#D4A373] mb-4 animate-bounce" style={{animationDuration: '3s'}} />
        <h3 className="text-xs font-space font-extrabold text-slate-500 uppercase tracking-widest mb-2">Total Neffi Points</h3>
        <div className="text-5xl font-space font-black text-[#3A7070] drop-shadow-sm">{points}</div>
      </div>
      
      <div className="max-w-2xl w-full space-y-4 animate-slide-up pb-8" style={{animationDelay: '150ms'}}>
        <h3 className="font-raleway font-black text-slate-800 text-lg mb-4">Unlock Goals</h3>
        <div className="p-5 rounded-2xl bg-[#3A7070]/5 border border-[#3A7070]/20 flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity">
          <span className="font-space font-bold text-slate-600 text-sm md:text-base">Mindfulness Badge</span>
          <span className="font-space font-extrabold text-[#3A7070] text-sm md:text-base">100 pts (Unlocked)</span>
        </div>
        <div className="p-5 rounded-2xl border-2 border-dashed border-[#D4A373]/30 bg-white/10 flex justify-between items-center hover:bg-white/20 transition-all cursor-pointer glow-gold">
          <span className="font-space font-bold text-slate-800 text-sm md:text-base">Free Therapist Session</span>
          <span className="font-space font-extrabold text-[#D4A373] text-sm md:text-base">1000 pts</span>
        </div>
        <div className="w-full bg-white/15 rounded-full h-3 mt-4 overflow-hidden border border-white/20 shadow-inner">
          <div className="bg-[#3A7070] h-3 transition-all duration-1000 rounded-full" style={{width: `${Math.min((points/1000)*100, 100)}%`}}></div>
        </div>
        {points >= 1000 ? (
          <button className={`w-full py-4 mt-6 rounded-xl font-space font-bold text-base ${theme.btnTeal} cursor-pointer`}>Claim Therapist Session</button>
        ) : (
          <button disabled className="w-full py-4 mt-6 rounded-xl font-space font-bold text-sm glass-card border border-white/10 text-slate-500 cursor-not-allowed text-center">Chat more to Unlock</button>
        )}
      </div>
    </div>
  </div>
);

// 4.6 Friends
const FriendsSync = ({ isSidebarOpen, setIsSidebarOpen }) => (
  <div className="h-full w-full flex flex-col relative overflow-hidden animate-fade-in bg-transparent">
    {/* Page Header */}
    <div className="px-6 md:px-8 py-5 border-b border-[#3A7070]/10 bg-white/75 backdrop-blur-md flex justify-between items-center z-20 shrink-0">
      <div className="flex items-center gap-2 md:gap-4">
        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 rounded-xl text-slate-600 hover:text-[#3A7070] glass-card border border-white/30 hover:bg-white/50 transition-all cursor-pointer mr-1 shadow-sm flex items-center justify-center" title="Open Sidebar Menu">
            <Menu size={18} />
          </button>
        )}
        <div className="w-12 h-12 glass-card border border-white/45 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-2xl">👥</span>
        </div>
        <div>
          <h2 className="text-xl font-raleway font-black bg-gradient-to-r from-[#2C5555] via-[#3A7070] to-[#8FA989] bg-clip-text text-transparent">Neighbor Sync</h2>
          <div className="text-xs text-[#8FA989] font-space font-extrabold tracking-wider">Collective Emotional Wave</div>
        </div>
      </div>
    </div>

    {/* Content Area */}
    <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col items-center justify-start gap-8 min-h-0 bg-transparent scrollbar-thin scrollbar-thumb-[#3A7070]/20 scrollbar-track-transparent">
      <div className="text-center shrink-0">
        <p className="text-slate-600 text-sm md:text-base font-space font-semibold">You are not alone. See the abstract mood of people in your network.</p>
      </div>
      
      <div className="w-72 h-72 rounded-full bg-white/10 border border-white/25 relative flex items-center justify-center shadow-inner overflow-hidden animate-[pulseSlow_6s_ease-in-out_infinite] shrink-0 glow-teal">
        {/* Sonar sweep */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#3A7070]/15 via-transparent to-transparent animate-radar origin-center pointer-events-none"></div>
        <div className="absolute w-56 h-56 rounded-full border border-white/15 opacity-70"></div>
        <div className="absolute w-36 h-36 rounded-full border border-white/15 opacity-70"></div>
        
        <div className="w-9 h-9 bg-[#3A7070] rounded-full z-10 shadow-lg animate-pulse"></div>
        <div className="absolute mt-14 font-space font-extrabold text-[10px] text-[#3A7070] bg-white/80 px-3 py-1 rounded-full border border-white/30 shadow-sm z-20">You</div>
   
        <div className="absolute top-12 left-12 w-7 h-7 bg-[#8FA989] rounded-full shadow-[0_0_20px_#8FA989] cursor-pointer hover:scale-125 transition-transform animate-pulse z-20" title="Calm Neighbor"></div>
        <div className="absolute bottom-16 right-12 w-7 h-7 bg-[#D4A373] rounded-full shadow-[0_0_20px_#D4A373] cursor-pointer hover:scale-125 transition-transform animate-pulse z-20" style={{animationDelay: '1s'}} title="Anxious Neighbor"></div>
        <div className="absolute top-20 right-8 w-7 h-7 bg-[#8FA989] rounded-full shadow-[0_0_20px_#8FA989] cursor-pointer hover:scale-125 transition-transform animate-pulse z-20" style={{animationDelay: '2s'}} title="Calm Neighbor"></div>
      </div>
   
      <div className="p-6 rounded-2xl glass-card border border-white/20 shadow-sm flex items-center gap-5 animate-float glow-gold shrink-0 mb-8">
        <Heart className="text-[#D4A373]" size={24} />
        <span className="font-space font-bold text-slate-800 text-sm md:text-base">Send a Virtual Hug</span>
        <button className={`px-5 py-2.5 rounded-xl text-xs font-space font-bold ${theme.btnOutline} cursor-pointer`}>Send Love</button>
      </div>
    </div>
  </div>
);

// 4.7 Profile
const ProfileVault = ({ userData, isSidebarOpen, setIsSidebarOpen }) => (
  <div className="h-full w-full flex flex-col relative overflow-hidden animate-fade-in bg-transparent">
    {/* Page Header */}
    <div className="px-6 md:px-8 py-5 border-b border-[#3A7070]/10 bg-white/75 backdrop-blur-md flex justify-between items-center z-20 shrink-0">
      <div className="flex items-center gap-2 md:gap-4">
        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 rounded-xl text-slate-600 hover:text-[#3A7070] glass-card border border-white/30 hover:bg-white/50 transition-all cursor-pointer mr-1 shadow-sm flex items-center justify-center" title="Open Sidebar Menu">
            <Menu size={18} />
          </button>
        )}
        <div className="w-12 h-12 glass-card border border-white/45 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-2xl">👤</span>
        </div>
        <div>
          <h2 className="text-xl font-raleway font-black bg-gradient-to-r from-[#2C5555] via-[#3A7070] to-[#8FA989] bg-clip-text text-transparent">Identity Vault</h2>
          <div className="text-xs text-[#8FA989] font-space font-extrabold tracking-wider">Your Encrypted Profile</div>
        </div>
      </div>
    </div>

    {/* Content Area */}
    <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col items-center justify-start gap-6 min-h-0 bg-transparent scrollbar-thin scrollbar-thumb-[#3A7070]/20 scrollbar-track-transparent">
      <div className="max-w-2xl w-full p-8 md:p-10 rounded-[2.5rem] glass-card border border-white/20 shadow-lg animate-scale-up glow-teal shrink-0 mb-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-[#3A7070] mb-4 shadow-sm">
            <User size={36} />
          </div>
          <h3 className="text-xl font-raleway font-black text-slate-800">Identity Details</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
          <div className="p-4 rounded-xl bg-white/25 border border-white/20">
            <div className="text-[10px] font-space font-extrabold text-slate-500 uppercase tracking-widest mb-1">Full Name</div>
            <div className="text-base font-space font-bold text-slate-800">{userData?.name || 'Guest User'}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/25 border border-white/20">
            <div className="text-[10px] font-space font-extrabold text-slate-500 uppercase tracking-widest mb-1">Age / DOB / Gender</div>
            <div className="text-base font-space font-bold text-slate-800">{userData?.age || '25'} • {userData?.dob || 'Not Set'} • {userData?.gender || 'Not Set'}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/25 border border-white/20">
            <div className="text-[10px] font-space font-extrabold text-slate-500 uppercase tracking-widest mb-1">Phone / Email</div>
            <div className="text-base font-space font-bold text-slate-800 leading-snug">{userData?.phone || '+91 00000000'} <br/><span className="text-xs text-slate-600 font-semibold">{userData?.email || 'email@example.com'}</span></div>
          </div>
          <div className="p-4 rounded-xl bg-white/25 border border-white/20">
            <div className="text-[10px] font-space font-extrabold text-slate-500 uppercase tracking-widest mb-1">Sanctuary Location</div>
            <div className="text-base font-space font-bold text-slate-800 flex items-center gap-2"><MapPin size={16} className="text-[#3A7070]"/> {userData?.place || 'Salem, TN'}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// 5. MASTER PATIENT DASHBOARD
// ==========================================
const PatientDashboard = ({ setView, userData }) => {
  const [activePage, setActivePage] = useState('chat');
  const [globalPoints, setGlobalPoints] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [showSOS, setShowSOS] = useState(false);

  const [sessions, setSessions] = useState([
    { id: 'session-temp', title: 'New Chat Session ✨', date: 'Just now', messages: [] }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState('session-temp');

  useEffect(() => {
    if (userData?.patient_id) {
      axios.get(`https://balajikrishnan031-keffi-backend.hf.space/api/patient/${userData.patient_id}/sessions`)
        .then(res => {
          const loadedSessions = res.data.sessions || [];
          
          // Always open fresh new session on app reopen/reload
          const newId = 'session-' + Date.now();
          const newSession = {
            id: newId,
            title: `New Chat Session ✨`,
            date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
            messages: []
          };
          
          const updated = [newSession, ...loadedSessions];
          setSessions(updated);
          setCurrentSessionId(newId);
          
          axios.post(`https://balajikrishnan031-keffi-backend.hf.space/api/patient/${userData.patient_id}/session`, {
            session_id: newId,
            title: newSession.title
          }).catch(err => console.error("Error creating initial session:", err));
        })
        .catch(err => {
          console.error("Error loading patient sessions from backend:", err);
          const saved = localStorage.getItem('neffi_chat_sessions');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setSessions(parsed);
              setCurrentSessionId(parsed[0]?.id || 'session-temp');
            } catch (e) {}
          }
        });
    }
  }, [userData?.patient_id]);

  const handleNewChat = () => {
    const newId = 'session-' + Date.now();
    const newSession = {
      id: newId,
      title: `New Chat Session ✨`,
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
      messages: []
    };
    
    if (userData?.patient_id) {
      axios.post(`https://balajikrishnan031-keffi-backend.hf.space/api/patient/${userData.patient_id}/session`, {
        session_id: newId,
        title: newSession.title
      }).catch(err => console.error("Error creating session in backend:", err));
    }
    
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    localStorage.setItem('neffi_chat_sessions', JSON.stringify(updatedSessions));
    setCurrentSessionId(newId);
    setActivePage('chat');
  };

  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      alert("You must keep at least one active chat session.");
      return;
    }
    
    if (userData?.patient_id) {
      axios.delete(`https://balajikrishnan031-keffi-backend.hf.space/api/patient/${userData.patient_id}/session/${sessionId}`)
        .catch(err => console.error("Error deleting session in backend:", err));
    }
    
    const updated = sessions.filter(s => s.id !== sessionId);
    setSessions(updated);
    localStorage.setItem('neffi_chat_sessions', JSON.stringify(updated));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(updated[0].id);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: 'chat', label: 'Chat with Neffi', icon: MessageCircle },
    { id: 'history', label: 'Peace Log', icon: BookOpen },
    { id: 'journey', label: 'My Journey', icon: TrendingUp },
    { id: 'tools', label: 'Mind Tools', icon: Sparkles },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'friends', label: 'Neighbor Sync', icon: Users }, 
    { id: 'account', label: 'My Account', icon: Shield },
  ];

  const renderContent = () => {
    const props = { 
      isSidebarOpen, 
      setIsSidebarOpen, 
      setGlobalPoints, 
      globalPoints, 
      userData, 
      points: globalPoints, 
      sessions, 
      setSessions, 
      currentSessionId, 
      setCurrentSessionId, 
      handleNewChat, 
      handleDeleteSession,
      showSOS,
      setShowSOS
    };
    switch(activePage) {
      case 'chat': return <ChatArea {...props} />;
      case 'history': return <PeaceLog {...props} />;
      case 'journey': return <MyJourney {...props} />;
      case 'tools': return <MindTools {...props} />;
      case 'rewards': return <Rewards {...props} />;
      case 'friends': return <FriendsSync {...props} />;
      case 'account': return <ProfileVault {...props} />;
      default: return <ChatArea {...props} />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-transparent overflow-hidden font-inter text-slate-800 relative">
      
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div className="absolute inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sleek Floating Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64 md:w-72 p-5 opacity-100 pointer-events-auto' : 'w-0 p-0 opacity-0 pointer-events-none border-none'} absolute md:relative z-30 transition-all duration-300 h-full left-0 top-0 rounded-none bg-white/20 border-r border-white/20 backdrop-blur-3xl shrink-0 flex flex-col overflow-hidden`}>
        {/* Light Green Animated Background */}
        <div className="absolute -top-[10%] -left-[10%] w-[120%] h-[50%] bg-[#8FA989] rounded-full mix-blend-multiply blur-[80px] opacity-[0.12] animate-pulse pointer-events-none z-0" style={{animationDuration: '4s'}}></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[120%] h-[50%] bg-[#EAF4F0] rounded-full mix-blend-multiply blur-[80px] opacity-40 pointer-events-none z-0" style={{animation: 'pulse 8s infinite alternate'}}></div>

        {isSidebarOpen && (
          <div className="flex flex-col h-full w-full relative z-10 gap-4">
            {/* Header */}
            <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setView('landing')}>
               <NeffiLogo size="w-8 h-8" />
               <h1 className="text-2xl font-raleway font-black text-[#2C5555] tracking-tight">Neffi AI</h1>
               {isMobile && (
                 <button 
                   onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(false); }} 
                   className="ml-auto p-1.5 rounded-xl hover:bg-[#3A7070]/10 text-[#3A7070] transition-colors cursor-pointer"
                   title="Collapse Menu"
                 >
                   ✕
                 </button>
               )}
            </div>

            {/* New Chat Button */}
            <button 
              onClick={handleNewChat}
              className="w-full py-3 px-5 rounded-full bg-white/20 border border-white/30 hover:bg-white/45 text-slate-700 font-inter font-semibold text-xs tracking-wider flex items-center gap-3.5 shadow-sm transition-all cursor-pointer shrink-0"
              title="Start fresh conversation"
            >
              <span className="text-lg font-light shrink-0">+</span>
              <span>New chat</span>
            </button>
            
            {/* Main Menu Links (Gemini Flat style) */}
            <div className="space-y-1 shrink-0 px-1">
               {menuItems.map((item, i) => {
                 const IconComponent = item.icon;
                 const isActive = activePage === item.id;
                 return (
                   <button
                     key={item.id}
                     onClick={() => {
                       setActivePage(item.id);
                       if (isMobile) setIsSidebarOpen(false);
                     }}
                     style={{animationDelay: `${i * 50}ms`}}
                     className={`w-full flex items-center gap-3.5 px-4.5 py-2.5 rounded-full font-inter font-medium text-xs tracking-wide transition-all duration-200 cursor-pointer ${
                       isActive 
                       ? 'bg-white/35 text-[#2C5555] font-bold shadow-sm border border-white/20' 
                       : 'text-slate-600 hover:bg-white/20'
                     }`}
                   >
                     <IconComponent size={15} className="shrink-0 text-slate-500" /> 
                     <span>{item.label}</span>
                   </button>
                 )
               })}
            </div>

            {/* Chat history inside sidebar, visible when active page is chat */}
            {activePage === 'chat' && sessions.length > 0 && (
              <div className="flex-1 flex flex-col min-h-[150px] overflow-hidden animate-fade-in px-1.5 mt-2">
                <div className="text-[10px] font-inter font-bold text-[#2C5555]/60 uppercase tracking-widest px-4 mb-2 shrink-0">
                  Recent
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-[#3A7070]/15 scrollbar-track-transparent">
                  {sessions.map(s => {
                    const isActive = s.id === currentSessionId;
                    return (
                      <div 
                        key={s.id}
                        onClick={() => setCurrentSessionId(s.id)}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-full border transition-all duration-200 cursor-pointer group ${
                          isActive 
                            ? 'border-white/20 bg-white/35 text-[#2C5555] font-bold shadow-sm' 
                            : 'border-transparent text-slate-600 hover:bg-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <MessageCircle size={14} className="shrink-0 text-slate-500" />
                          <span className="text-xs font-inter leading-tight truncate">{s.title}</span>
                        </div>
                        <button 
                          onClick={(e) => handleDeleteSession(e, s.id)}
                          className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded-md hover:bg-red-500/10 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all shrink-0 cursor-pointer text-[9px]"
                          title="Delete history"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer Items (Help, Activity, Settings & Profile) */}
            <div className="mt-auto pt-3 border-t border-white/20 flex flex-col gap-1 shrink-0 px-1">
              
              {/* Help Item */}
              <button 
                onClick={() => setShowSOS(true)}
                className="w-full flex items-center gap-3.5 px-4.5 py-2.5 rounded-full font-inter font-medium text-xs text-slate-600 hover:bg-white/20 transition-all duration-200 cursor-pointer text-left"
              >
                <HelpCircle size={15} className="shrink-0 text-slate-500" />
                <span>Help & SOS</span>
              </button>
              
              {/* Activity Item */}
              <button 
                onClick={() => setActivePage('journey')}
                className={`w-full flex items-center gap-3.5 px-4.5 py-2.5 rounded-full font-inter font-medium text-xs transition-all duration-200 cursor-pointer text-left ${activePage === 'journey' ? 'bg-white/35 text-[#2C5555] font-bold shadow-sm border border-white/20' : 'text-slate-600 hover:bg-white/20'}`}
              >
                <Activity size={15} className="shrink-0 text-slate-500" />
                <span>Activity</span>
              </button>
              
              {/* Settings Item */}
              <button 
                onClick={() => setActivePage('account')}
                className={`w-full flex items-center gap-3.5 px-4.5 py-2.5 rounded-full font-inter font-medium text-xs transition-all duration-200 cursor-pointer text-left ${activePage === 'account' ? 'bg-white/35 text-[#2C5555] font-bold shadow-sm border border-white/20' : 'text-slate-600 hover:bg-white/20'}`}
              >
                <Settings size={15} className="shrink-0 text-slate-500" />
                <span>Settings</span>
              </button>

              {/* User Profile avatar info with Logout option inside */}
              <div className="flex items-center justify-between p-2 mt-2 rounded-xl bg-white/20 border border-white/35 shadow-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#3A7070] text-white flex items-center justify-center font-inter font-semibold text-xs shrink-0 shadow-sm uppercase">
                    {(userData?.name || "Balaji")[0]}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-inter font-semibold text-[#2C5555] truncate leading-tight">
                      {userData?.name || "Balaji"}
                    </span>
                    <span className="text-[9px] font-inter font-medium text-slate-500 truncate">
                      {userData?.email || "test@neffi.ai"}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => { localStorage.removeItem('neffi_user'); setView('landing'); }} 
                  className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 flex items-center justify-center transition-all cursor-pointer border border-red-500/20"
                  title="Logout"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full w-full min-w-0 relative flex flex-col overflow-hidden bg-transparent z-10">
        {renderContent()}
      </div>

      {showSOS && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md border border-red-500/20 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center animate-fade-in w-80 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6"><AlertTriangle size={32}/></div>
          <h3 className="text-xl font-space font-black text-slate-800 mb-2">Emergency Hotline</h3>
          <p className="text-sm text-slate-600 mb-6 font-space font-semibold">You are not alone. Please call iCall India for immediate support.</p>
          <div className="text-2xl font-space font-black text-[#2C5555] mb-6 tracking-widest">9152987821</div>
          <button onClick={() => setShowSOS(false)} className="px-8 py-3 rounded-xl bg-white/20 border border-white/30 text-slate-700 font-space font-bold text-sm hover:bg-white/45 w-full transition-colors cursor-pointer">Close</button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 6. ENHANCED ADMIN DASHBOARD
// ==========================================
const AdminDashboard = ({ setView }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [inactivePatients, setInactivePatients] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Real-time tracking data states
  const [liveBpm, setLiveBpm] = useState(76);
  const [sentimentData, setSentimentData] = useState([42, 58, 31, 82, 89, 52, 73]);
  const [liveEvents, setLiveEvents] = useState([
    { id: 1, time: new Date().toLocaleTimeString(), text: "Clinical API Gateway initialized successfully.", type: "system" },
    { id: 2, time: new Date().toLocaleTimeString(), text: "n8n automation webhook pipeline listener online.", type: "n8n" },
    { id: 3, time: new Date().toLocaleTimeString(), text: "Pinecone semantic index mapping verified.", type: "db" }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resPat, resInact, resAnalyt] = await Promise.all([
          axios.get('https://balajikrishnan031-keffi-backend.hf.space/api/admin/patients'),
          axios.get('https://balajikrishnan031-keffi-backend.hf.space/api/admin/inactive-patients'),
          axios.get('https://balajikrishnan031-keffi-backend.hf.space/api/admin/analytics')
        ]);
        if (resPat.data && resPat.data.patients) setPatients(resPat.data.patients);
        if (resInact.data && resInact.data.patients) setInactivePatients(resInact.data.patients);
        if (resAnalyt.data) setAnalytics(resAnalyt.data);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Biometrics & logs real-time updates
  useEffect(() => {
    const bpmInterval = setInterval(() => {
      setLiveBpm(b => {
        const diff = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = b + diff;
        return next < 60 ? 65 : next > 105 ? 100 : next;
      });
    }, 2500);

    const sentimentInterval = setInterval(() => {
      setSentimentData(prev => prev.map(val => {
        const change = Math.floor(Math.random() * 11) - 5; // -5 to +5
        const next = val + change;
        return next < 20 ? 25 : next > 95 ? 90 : next;
      }));
    }, 4500);

    const logTypes = ["system", "n8n", "db", "biometric", "clinical"];
    const logTexts = [
      "Wearable sensor packet decoded: heart rate synced.",
      "BERT semantic engine parsed: emotion classified as High Distress.",
      "n8n webhook triggers processed: no crisis escalation required.",
      "Pinecone vector space search executed: history records mapped.",
      "Therapist allocation parameters updated dynamically.",
      "Simulated biofeedback: active heart rate tracking stabilized.",
      "Depression index evaluated: moderate anxiety detected.",
      "Rogerian empathetic dialogue framework engaged.",
      "Real-time patient visual emotion scanning established."
    ];

    const logInterval = setInterval(() => {
      const txt = logTexts[Math.floor(Math.random() * logTexts.length)];
      const typ = logTypes[Math.floor(Math.random() * logTypes.length)];
      const item = { id: Date.now(), time: new Date().toLocaleTimeString(), text: txt, type: typ };
      setLiveEvents(prev => [item, ...prev.slice(0, 19)]);
    }, 3800);

    return () => {
      clearInterval(bpmInterval);
      clearInterval(sentimentInterval);
      clearInterval(logInterval);
    };
  }, []);

  const adminTabs = [
    { id: 'overview', label: 'System Overview', icon: Activity, fontClass: 'font-greatvibes text-[22px] leading-none py-1.5 font-normal tracking-wide', activeBg: 'bg-teal-700 text-white shadow-lg shadow-teal-500/25 scale-102', inactiveColor: 'text-teal-700 hover:text-teal-900 hover:bg-teal-500/5' },
    { id: 'roster', label: 'Patient Roster', icon: Users, fontClass: 'font-playball text-[17px] font-bold tracking-wide', activeBg: 'bg-blue-700 text-white shadow-lg shadow-blue-500/25 scale-102', inactiveColor: 'text-blue-700 hover:text-blue-900 hover:bg-blue-500/5' },
    { id: 'inactive', label: 'Inactive Patients', icon: Frown, fontClass: 'font-alexbrush text-[24px] leading-none py-1 font-normal tracking-wide', activeBg: 'bg-rose-600 text-white shadow-lg shadow-rose-500/25 scale-102', inactiveColor: 'text-rose-700 hover:text-rose-900 hover:bg-rose-500/5' },
    { id: 'analytics', label: 'NLP Analytics', icon: PieChart, fontClass: 'font-pacifico text-[14px] leading-none font-normal', activeBg: 'bg-purple-700 text-white shadow-lg shadow-purple-500/25 scale-102', inactiveColor: 'text-purple-700 hover:text-purple-900 hover:bg-purple-500/5' },
    { id: 'therapists', label: 'Therapists Allocation', icon: Shield, fontClass: 'font-sacramento text-[25px] leading-none font-bold tracking-wide', activeBg: 'bg-amber-700 text-white shadow-lg shadow-amber-500/25 scale-102', inactiveColor: 'text-amber-800 hover:text-amber-900 hover:bg-amber-500/5' },
    { id: 'settings', label: 'System Settings', icon: Settings, fontClass: 'font-allura text-[25px] leading-none font-normal tracking-wide', activeBg: 'bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 scale-102', inactiveColor: 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-500/5' },
  ];

  const handleExportAbstract = async (patientId) => {
    try {
      const res = await axios.get(`https://balajikrishnan031-keffi-backend.hf.space/api/patient/${patientId}/report`);
      const data = res.data;
      const content = `Clinical Abstract for ${data.name || data.patient_id}\n\nMHQ Score: ${data.current_mhq}\nRisk Level: ${data.depression_level}\nAssigned Doctor: ${data.assigned_doctor || 'Unassigned'}\n\nSummary:\n${data.clinical_abstract}\n`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `abstract_${patientId}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch(err) {
      console.error(err);
      alert("Failed to export abstract.");
    }
  };

  const assignTherapist = async (patientId, docName) => {
    try {
      await axios.post('https://balajikrishnan031-keffi-backend.hf.space/api/admin/assign-therapist', { patient_id: patientId, doctor_name: docName });
      alert(`Successfully assigned ${docName} to ${patientId}`);
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen w-full bg-transparent overflow-hidden p-6 gap-6 font-sans text-slate-800">
      <div className="w-72 h-full rounded-[2rem] glass-panel p-6 shrink-0 glow-teal flex flex-col hover:shadow-[0_20px_50px_rgba(13,112,112,0.18)] transition-all">
        <div className="flex flex-col items-center mb-8 pt-4 cursor-pointer" onClick={() => setView('landing')}>
          <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-[#3A7070] mb-4 glow-teal"><Shield size={24} className="text-[#3A7070]" /></div>
          <h1 className="text-xl font-raleway font-black text-[#2C5555] tracking-tight text-center">Clinical Hub</h1>
        </div>
        
        <div className="flex-1 space-y-2">
          {adminTabs.map((tab, i) => (
            <button key={tab.id} onClick={() => {setActiveTab(tab.id); setSelectedPatient(null);}} 
              style={{animationDelay: `${i * 50}ms`}}
              className={`w-full flex items-center gap-3 px-5 py-3 rounded-[1.2rem] transition-all duration-300 hover:translate-x-1 active:scale-98 cursor-pointer relative overflow-hidden group animate-slide-up ${
                activeTab === tab.id 
                  ? `${tab.activeBg}` 
                  : `${tab.inactiveColor} bg-white/10 hover:bg-white/45`
              }`}
            >
               {activeTab === tab.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#8FA989] rounded-r-md animate-slide-in-left"></div>}
               <tab.icon size={18} className="relative z-10 shrink-0" /> 
               <span className={`relative z-10 ${tab.fontClass}`}>{tab.label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setView('landing')} className="mt-auto font-space font-extrabold text-sm text-slate-500 hover:text-red-500 hover:bg-red-500/10 p-4 rounded-xl transition-all cursor-pointer tracking-wide">Logout</button>
      </div>

      <div className="flex-1 h-full relative">
        <div className="absolute inset-0 rounded-[2rem] glass-panel shadow-inner p-8 overflow-hidden glow-emerald">
          {selectedPatient ? (
             <div className={`h-full flex flex-col animate-fade-in`}>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedPatient(null)} className={`p-2.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 hover:bg-slate-50`}><ArrowRight className="rotate-180" size={18}/></button>
                    <h2 className="text-xl font-black text-slate-800">Patient: {selectedPatient.id}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-1.5 rounded-xl bg-white border border-slate-100 shadow-sm font-bold text-xs text-slate-600 flex items-center gap-2">
                      Current Chat Category: <span className={
                        selectedPatient.category?.includes("Depression") || selectedPatient.category?.includes("Panic") || selectedPatient.category?.includes("Grief") ? "text-red-500" :
                        selectedPatient.category?.includes("Anxiety") || selectedPatient.category?.includes("Exhaustion") || selectedPatient.category?.includes("Burnout") ? "text-orange-500" :
                        "text-emerald-500"
                      }>
                        {selectedPatient.category?.includes("Depression") || selectedPatient.category?.includes("Panic") || selectedPatient.category?.includes("Grief") ? "🔴" :
                        selectedPatient.category?.includes("Anxiety") || selectedPatient.category?.includes("Exhaustion") || selectedPatient.category?.includes("Burnout") ? "🟠" :
                        "🟢"} [{selectedPatient.category || 'Normal Stress / Positive'}]
                      </span>
                    </div>
                    <div className={`px-4 py-1.5 rounded-xl bg-white border border-slate-100 shadow-sm font-bold text-xs ${selectedPatient.color}`}>Risk: {selectedPatient.risk}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6 flex-1">
                  <div className={`col-span-1 p-5 rounded-2xl glass-card border border-white/20 shadow-sm flex flex-col gap-4`}>
                    <h3 className="text-base font-bold text-slate-800">Depression / MHQ Score</h3>
                    <div className="flex-1 flex flex-col justify-center items-center gap-2">
                       <span className={`text-4xl font-black ${selectedPatient.color}`}>{selectedPatient.score}</span>
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Current Score</span>
                    </div>
                  </div>
                  <div className={`col-span-2 p-5 rounded-2xl glass-card border border-white/20 shadow-sm flex flex-col`}>
                    <h3 className="text-base font-bold text-slate-800 mb-3">Recent Logs</h3>
                    <div className={`flex-1 bg-white/10 border border-white/10 rounded-xl p-4 overflow-y-auto`}>
                      {selectedPatient.logs.map((l,i) => <div key={i} className="p-3 mb-3 glass-card rounded-lg shadow-sm border border-white/15 text-xs font-semibold text-slate-700">{l}</div>)}
                    </div>
                  </div>
                </div>
             </div>
          ) : activeTab === 'overview' ? (
            <div className="h-full flex flex-col overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#3A7070]/20 scrollbar-track-transparent animate-fade-in">
               <h2 className="text-2xl font-poppins font-black text-slate-800 mb-6 flex items-center justify-between">
                 <span>System Overview</span>
                 <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-xs font-space font-extrabold text-emerald-600 flex items-center gap-1.5">
                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Tracking Active
                 </span>
               </h2>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                 <div className={`p-5 rounded-2xl bg-white/45 flex flex-col items-center text-center gap-1 glow-teal hover:shadow-[0_8px_20px_rgba(13,112,112,0.15)] hover:scale-[1.02] transition-all`}>
                    <div className="text-3xl font-black text-[#3A7070] drop-shadow-[0_0_10px_rgba(58,112,112,0.2)]">{analytics?.total_patients || patients.length || 0}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active Patients</div>
                 </div>
                 <div className={`p-5 rounded-2xl bg-white/45 flex flex-col items-center text-center gap-1 glow-emerald hover:shadow-[0_8px_20px_rgba(16,185,129,0.15)] hover:scale-[1.02] transition-all`}>
                    <div className="text-3xl font-black text-[#8FA989] drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">{analytics?.safety_score || '98'}%</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">AI Safety Score</div>
                 </div>
                 <div className={`p-5 rounded-2xl bg-white/45 flex flex-col items-center text-center gap-1 glow-rose hover:shadow-[0_8px_20px_rgba(244,63,94,0.15)] hover:scale-[1.02] transition-all`}>
                    <div className="text-3xl font-black text-red-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.2)]">{patients.filter(p => p.risk === 'Critical').length}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Critical Interventions</div>
                 </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                 {/* Left Column: Biometric Stream & Alerts */}
                 <div className="space-y-6 flex flex-col min-h-0">
                   {/* Live Biometric stream */}
                   <div className="p-5 rounded-2xl glass-card border border-white/25 shadow-sm flex flex-col bg-white/45">
                      <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <svg className="text-red-500 animate-pulse" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                        Live Biometric Stream
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Wearable Sensor P-102</p>
                      <div className="flex items-center gap-4">
                         <span className="text-3xl font-black text-slate-800 tracking-tight">{liveBpm} <span className="text-xs font-bold text-slate-400">BPM</span></span>
                         <div className="flex-1 flex gap-0.5 items-end h-8 overflow-hidden">
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map((i) => {
                              const heights = [10, 15, 8, 30, 5, 12, 18, 25, 4, 15, 20, 8];
                              return (
                                <div key={i} className="flex-1 bg-red-400 rounded-t-sm" style={{
                                  height: `${heights[(i + Math.floor(liveBpm)) % heights.length]}px`,
                                  transition: 'height 0.4s ease'
                                }}></div>
                              )
                            })}
                         </div>
                      </div>
                   </div>

                   {/* Urgent Alerts Stream */}
                   <div className="flex-1 p-5 rounded-2xl glass-card border border-white/25 shadow-sm flex flex-col min-h-[200px]">
                      <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Bell size={18}/> Urgent Alerts Stream</h3>
                      <div className="flex-1 rounded-xl bg-white/15 border border-white/10 p-4 overflow-y-auto space-y-3 max-h-[220px]">
                        {patients.filter(p => p.risk === 'Critical').length === 0 && <div className="text-slate-500 font-semibold text-xs">No urgent alerts. Platform status nominal.</div>}
                        {patients.filter(p => p.risk === 'Critical').map(p => (
                          <div key={p.id} className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 border-l-4 border-l-red-500 shadow-sm animate-pulse">
                            <div className="font-bold text-red-700 text-xs mb-1">{p.id} ({p.name || 'Anonymous User'}): Critical Risk Detected.</div>
                            <div className="text-slate-700 text-[11px] font-semibold">MHQ Score: {p.score}. AI monitoring closely. Consider therapist manual bypass.</div>
                          </div>
                        ))}
                      </div>
                   </div>
                 </div>

                 {/* Right Column: Live Pipeline Trace Console */}
                 <div className="p-5 rounded-2xl glass-card border border-white/25 shadow-sm flex flex-col bg-slate-900/10 backdrop-blur-md min-h-[300px]">
                    <h3 className="text-sm font-bold text-slate-850 mb-3 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Clinical Pipeline Trace Console
                    </h3>
                    <div className="flex-1 rounded-xl bg-slate-950 p-4 font-mono text-[10px] text-emerald-400 overflow-y-auto space-y-2 border border-slate-800 shadow-inner h-[280px] scrollbar-thin scrollbar-thumb-emerald-900/30 scrollbar-track-transparent">
                      {liveEvents.map(e => (
                        <div key={e.id} className="flex gap-2 leading-relaxed animate-fade-in">
                          <span className="text-slate-500 shrink-0">[{e.time}]</span>
                          <span className={
                            e.type === 'system' ? 'text-blue-400' :
                            e.type === 'n8n' ? 'text-amber-400 font-bold' :
                            e.type === 'biometric' ? 'text-rose-400' :
                            'text-emerald-400'
                          }>
                            {e.text}
                          </span>
                        </div>
                      ))}
                    </div>
                 </div>
               </div>
            </div>
          ) : activeTab === 'roster' ? (
            <div className="h-full flex flex-col animate-fade-in">
               <div className="flex justify-between items-center mb-5">
                 <h2 className="text-2xl font-black text-slate-800">Patient Roster</h2>
                 <div className={`flex items-center gap-3 px-3 py-2 rounded-xl glass-input w-64 shadow-sm`}>
                   <Search size={18} className="text-slate-500"/>
                   <input type="text" placeholder="Search ID..." className="bg-transparent outline-none flex-1 text-slate-800 font-bold text-sm"/>
                 </div>
               </div>
               <div className={`flex-1 rounded-2xl glass-card border border-white/25 shadow-sm p-5 flex flex-col`}>
                  <div className="flex justify-between items-center px-4 font-bold text-slate-500 uppercase text-xs tracking-widest border-b border-white/10 pb-2 mb-3">
                    <span className="w-1/4">Patient ID</span>
                    <span className="w-1/4">Condition</span>
                    <span className="w-1/4 text-center">Risk Level</span>
                    <span className="w-1/4 text-right">Action</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {patients.length === 0 && <div className="text-center text-slate-500 font-semibold mt-6 text-sm">No patients tracked yet.</div>}
                    {patients.map((p, i) => (
                      <div key={p.id} style={{animationDelay: `${i * 60}ms`}} className="flex justify-between items-center p-3 rounded-xl bg-white/20 border border-white/10 hover:bg-white/40 hover:scale-101 hover:border-[#3A7070]/25 transition-all duration-300 animate-slide-up">
                        <span className="w-1/4 font-black text-slate-800 text-sm">{p.id}</span>
                        <span className="w-1/4 text-slate-700 font-semibold text-xs">{p.condition}</span>
                        <span className={`w-1/4 text-center font-bold text-xs flex items-center justify-center gap-1.5 ${p.color}`}>
                          {p.risk === 'Critical' && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>}
                          {p.risk}
                        </span>
                        <span className="w-1/4 text-right">
                          <button onClick={() => setSelectedPatient(p)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/30 text-slate-700 hover:bg-white/40 mr-2 transition-colors cursor-pointer">Inspect</button>
                          <button onClick={() => handleExportAbstract(p.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#8FA989] text-white shadow-sm hover:bg-[#7a9474] transition-colors cursor-pointer">Export Abstract</button>
                        </span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          ) : activeTab === 'inactive' ? (
            <div className="h-full flex flex-col animate-fade-in">
               <h2 className="text-2xl font-black text-slate-800 mb-5">Inactive Patients (3+ Days)</h2>
               <div className={`flex-1 rounded-2xl glass-card border border-white/25 shadow-sm p-5 flex flex-col`}>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {inactivePatients.length === 0 && <div className="text-center text-slate-500 font-semibold mt-6 text-sm">No inactive patients found.</div>}
                    {inactivePatients.map((p, i) => (
                      <div key={i} className={`flex justify-between items-center p-4 rounded-xl bg-white/20 border border-white/10`}>
                        <div>
                           <div className="font-black text-slate-800 text-sm mb-1">{p.patient_id} ({p.name})</div>
                           <div className="text-slate-600 text-xs font-semibold">Inactive for {p.days_inactive} days</div>
                        </div>
                        <div className="text-right">
                           <div className="font-bold text-slate-800 text-sm mb-1">MHQ: {p.mhq_score}</div>
                           <div className="text-slate-600 text-xs font-semibold">{p.depression_level}</div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          ) : activeTab === 'analytics' ? (
            <div className="h-full flex flex-col animate-fade-in">
               <h2 className="text-2xl font-black text-slate-800 mb-5">NLP & Sentiment Analytics</h2>
               <div className="grid grid-cols-2 gap-5 flex-1">
                 <div className={`p-5 rounded-2xl glass-card border border-white/20 shadow-sm flex flex-col`}>
                    <h3 className="text-base font-bold text-slate-800 mb-3">Platform Sentiment Trend</h3>
                    <div className={`flex-1 bg-white/15 border border-white/10 rounded-xl p-3 flex items-end gap-2`}>
                      {sentimentData.map((h, i) => (
                        <div key={i} className="flex-1 bg-[#3A7070] rounded-t-md transition-all hover:bg-[#8FA989]" style={{height: `${h}%`, transition: 'height 0.6s ease'}}></div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest"><span>Mon</span><span>Sun</span></div>
                 </div>
                 <div className={`p-5 rounded-2xl glass-card border border-white/20 shadow-sm flex flex-col`}>
                    <h3 className="text-base font-bold text-slate-800 mb-4">Top Detected Emotions</h3>
                    <div className="flex flex-col gap-3 flex-1 justify-center overflow-y-auto pr-2">
                       {analytics && analytics.category_distribution && Object.entries(analytics.category_distribution).length > 0 ? Object.entries(analytics.category_distribution).map(([emotion, count], i) => (
                         <div key={i}>
                           <div className="flex justify-between font-bold text-xs text-slate-700 mb-1"><span>{emotion}</span><span>{count} msgs</span></div>
                           <div className="w-full bg-white/15 border border-white/10 rounded-full h-2.5"><div className="bg-[#3A7070] h-2.5 rounded-full" style={{width: `${Math.min(count * 5, 100)}%`}}></div></div>
                         </div>
                       )) : <div className="text-slate-500 text-sm font-semibold">No data available yet.</div>}
                    </div>
                 </div>
               </div>
            </div>
          ) : activeTab === 'therapists' ? (
            <div className="h-full flex flex-col animate-fade-in">
               <h2 className="text-2xl font-black text-slate-800 mb-5">Therapist Allocation</h2>
               <div className={`flex-1 rounded-2xl glass-card border border-white/25 shadow-sm p-5 flex flex-col`}>
                  <div className="grid grid-cols-1 gap-3 overflow-y-auto">
                    {patients.filter(p => p.risk === 'Critical' || p.risk === 'High').length === 0 && <div className="text-slate-500 font-semibold p-4 text-sm">No critical or high-risk patients needing assignment.</div>}
                    {patients.filter(p => p.risk === 'Critical' || p.risk === 'High').map((p) => (
                      <div key={p.id} className={`p-3 rounded-xl bg-white/20 border border-white/10 flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-white/30 border border-white/40 shadow-sm flex items-center justify-center text-[#3A7070]`}><User size={18}/></div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">{p.id} ({p.name})</h4>
                            <span className={`text-[10px] font-bold ${p.color} uppercase tracking-widest`}>{p.risk} Risk</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select id={`doc-select-${p.id}`} className="p-2 rounded-lg glass-input outline-none text-xs font-bold text-slate-800 shadow-sm cursor-pointer">
                            <option value="">Select Doctor</option>
                            <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins</option>
                            <option value="Dr. Arun Kumar">Dr. Arun Kumar</option>
                            <option value="Dr. Emily Chen">Dr. Emily Chen</option>
                          </select>
                          <button onClick={() => {
                            const sel = document.getElementById(`doc-select-${p.id}`);
                            if(sel.value) assignTherapist(p.id, sel.value);
                          }} className={`px-3 py-2 rounded-lg font-bold text-xs bg-white/40 border border-[#3A7070]/30 text-[#3A7070] hover:bg-[#3A7070] hover:text-white transition-all shadow-sm cursor-pointer`}>
                            {p.assigned_doctor && p.assigned_doctor !== 'Unassigned' ? `Reassign` : 'Assign'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col animate-fade-in">
               <h2 className="text-2xl font-black text-slate-800 mb-5">System Settings</h2>
               <div className={`flex-1 rounded-2xl glass-card border border-white/25 shadow-sm p-6 flex flex-col gap-5`}>
                  <div className={`p-5 rounded-xl bg-white/20 border border-white/10 flex items-center justify-between`}>
                     <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-1">AI Empathy Level</h3>
                        <p className="text-xs text-slate-500 font-medium">Adjust the depth of Socratic questioning.</p>
                     </div>
                     <input type="range" min="1" max="100" defaultValue="80" className="w-40 accent-[#3A7070] cursor-pointer"/>
                  </div>
                  <div className={`p-5 rounded-xl bg-white/20 border border-white/10 flex items-center justify-between`}>
                     <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-1">Emergency Hotlines (iCall India)</h3>
                        <p className="text-xs text-slate-500 font-medium">Automatically trigger on Critical Risk detection.</p>
                     </div>
                     <div className="w-10 h-6 bg-[#8FA989] rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm"></div></div>
                  </div>
                   <div className={`p-5 rounded-xl bg-white/20 border border-white/10 flex items-center justify-between`}>
                     <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-1">Clear NLP Cache</h3>
                        <p className="text-xs text-slate-500 font-medium">Free up memory used by BERT classifier.</p>
                     </div>
                     <button className={`px-4 py-2 rounded-lg font-bold text-xs bg-white/40 border border-slate-300 text-slate-700 shadow-sm hover:bg-white/60 transition-all cursor-pointer`}>Clear Cache</button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// INTRO OPENING MOTION ANIMATION (Chinese Calligraphy Brush on Glass)
// ==========================================
const IntroAnimation = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 4.8 seconds total play, then fade out over 700ms
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 4800);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5500);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-opacity duration-[700ms] ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
         style={{
           backgroundImage: `linear-gradient(135deg, rgba(230, 245, 240, 0.52) 0%, rgba(240, 252, 248, 0.45) 40%, rgba(220, 238, 234, 0.50) 100%), url('/neffi-bg.png')`,
           backgroundSize: 'cover',
           backgroundPosition: 'center top'
         }}>
      
      {/* Aurora blurred backgrounds in background */}
      <div className="absolute -top-10 -left-10 w-[600px] h-[600px] bg-[#8FA989] rounded-full blur-[140px] opacity-35 animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="absolute -bottom-10 -right-10 w-[600px] h-[600px] bg-[#3A7070] rounded-full blur-[140px] opacity-30 animate-pulse" style={{ animationDuration: '8s' }}></div>

      {/* Full-screen glass overlay panel */}
      <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 overflow-hidden bg-white/10 backdrop-blur-3xl">
        
        {/* Full-screen Glass reflection sweep */}
        <div className="absolute top-0 bottom-0 left-[-150%] w-[80%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] pointer-events-none"
             style={{ animation: 'glassShine 2.2s cubic-bezier(0.19, 1, 0.22, 1) 3.8s forwards' }}></div>

        {/* Dynamic Canvas / SVG Calligraphy */}
        <div className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center">
          <svg viewBox="0 0 850 500" className="w-full h-full filter drop-shadow-[0_15px_35px_rgba(44,85,85,0.15)]">
            <defs>
              <linearGradient id="inkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#000000" />
                <stop offset="50%" stopColor="#1A1A1A" />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
              <linearGradient id="bambooGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D4A373" />
                <stop offset="50%" stopColor="#E9C46A" />
                <stop offset="100%" stopColor="#D4A373" />
              </linearGradient>
              <filter id="inkBleed" x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
              </filter>
              {/* Custom dry brush filter mapping to referenced font styles */}
              <filter id="dryBrushFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.15 0.02" numOctaves="4" result="noise" />
                <feColorMatrix type="matrix" in="noise" values="
                  0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0 0
                  3.8 0 0 0 -1.8
                " result="dryMask" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="G" result="displaced" />
                <feComposite operator="in" in="displaced" in2="dryMask" />
              </filter>
            </defs>

            {/* The hidden guide path used for stroke tracing and offset-path */}
            <path id="calligraphyPath" 
                  d="M 110,130 Q 105,230 100,330 L 110,130 Q 150,230 190,330 L 190,330 Q 192,230 195,130 L 235,130 Q 230,230 225,330 L 235,130 Q 260,128 285,125 L 232,225 Q 255,223 275,220 L 225,330 Q 255,328 290,325 L 330,130 Q 325,230 320,330 L 330,130 Q 355,128 380,125 L 327,225 Q 350,223 370,220 L 420,130 Q 415,230 410,330 L 420,130 Q 445,128 470,125 L 417,225 Q 440,223 460,220 L 510,130 Q 508,230 505,330 L 495,130 L 525,130 L 490,330 L 520,330 L 605,130 Q 585,230 565,330 L 605,130 Q 625,230 645,330 L 580,250 L 630,250 L 695,130 Q 692,230 690,330 L 680,130 L 710,130 L 675,330 L 705,330" 
                  fill="none" 
                  stroke="rgba(58, 112, 112, 0.01)" 
                  strokeWidth="14" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" />

            {/* Splatter 1: start of N */}
            <g filter="url(#inkBleed)" className="opacity-0 origin-center" style={{ transformOrigin: '110px 130px', animation: 'splatPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.6s forwards' }}>
              <circle cx="110" cy="130" r="5" fill="#0C0C0C" />
              <circle cx="104" cy="124" r="1.5" fill="#0C0C0C" />
              <circle cx="116" cy="136" r="1" fill="#0C0C0C" />
            </g>

            {/* Splatter 2: bottom curve of N */}
            <g filter="url(#inkBleed)" className="opacity-0 origin-center" style={{ transformOrigin: '190px 330px', animation: 'splatPop 0.5s ease-out 1.0s forwards' }}>
              <circle cx="190" cy="330" r="5.5" fill="#0C0C0C" />
              <circle cx="184" cy="324" r="2" fill="#0C0C0C" />
              <circle cx="198" cy="336" r="1.5" fill="#0C0C0C" />
            </g>

            {/* Splatter 3: middle of E */}
            <g filter="url(#inkBleed)" className="opacity-0 origin-center" style={{ transformOrigin: '275px 220px', animation: 'splatPop 0.5s ease-out 1.5s forwards' }}>
              <circle cx="275" cy="220" r="4.5" fill="#0C0C0C" />
              <circle cx="269" cy="214" r="1.5" fill="#0C0C0C" />
            </g>

            {/* Splatter 4: loop of F1 - drip */}
            <g filter="url(#inkBleed)" className="opacity-0 origin-center" style={{ transformOrigin: '320px 330px', animation: 'splatDrip 1.5s ease-out 2.0s forwards' }}>
              <circle cx="320" cy="330" r="6.5" fill="#0C0C0C" />
              <circle cx="312" cy="324" r="2.5" fill="#0C0C0C" />
              <path d="M 320,330 Q 318,350 319,370" stroke="#0C0C0C" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <circle cx="319" cy="374" r="1.5" fill="#0C0C0C" />
            </g>

            {/* Splatter 5: loop of F2 - drip */}
            <g filter="url(#inkBleed)" className="opacity-0 origin-center" style={{ transformOrigin: '410px 330px', animation: 'splatDrip 1.5s ease-out 2.4s forwards' }}>
              <circle cx="410" cy="330" r="6.5" fill="#0C0C0C" />
              <circle cx="403" cy="324" r="2" fill="#0C0C0C" />
              <path d="M 410,330 Q 408,350 409,370" stroke="#0C0C0C" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <circle cx="409" cy="374" r="1.5" fill="#0C0C0C" />
            </g>

            {/* Splatter 6: dot of first I */}
            <g filter="url(#inkBleed)" className="opacity-0 origin-center" style={{ transformOrigin: '548.5px 142.5px', animation: 'splatPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 2.6s forwards' }}>
              <circle cx="548.5" cy="142.5" r="4.5" fill="#0C0C0C" />
              <circle cx="542.5" cy="136.5" r="1.5" fill="#0C0C0C" />
            </g>

            {/* Splatter 7: loop of A */}
            <g filter="url(#inkBleed)" className="opacity-0 origin-center" style={{ transformOrigin: '652.5px 324.5px', animation: 'splatPop 0.5s ease-out 3.0s forwards' }}>
              <circle cx="652.5" cy="324.5" r="5" fill="#0C0C0C" />
              <circle cx="659.5" cy="318.5" r="1.5" fill="#0C0C0C" />
            </g>

            {/* Splatter 8: dot of second I */}
            <g filter="url(#inkBleed)" className="opacity-0 origin-center" style={{ transformOrigin: '750px 103.5px', animation: 'splatPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 3.4s forwards' }}>
              <path d="M 750,103.5 Q 760,93 762,103 Q 754,113 750,103.5 Z" fill="#0C0C0C" />
              <circle cx="750" cy="103.5" r="5" fill="#0C0C0C" />
              <circle cx="740" cy="96.5" r="1.5" fill="#0C0C0C" />
            </g>

            {/* Rendered Calligraphy strokes for NEFFI AI */}
            <path id="stroke_n_1" d="M 110,130 Q 105,230 100,330" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.152s linear 0.6s forwards" }} />
            <path id="stroke_n_2" d="M 110,130 Q 150,230 190,330" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.183s linear 0.752s forwards" }} />
            <path id="stroke_n_3" d="M 190,330 Q 192,230 195,130" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.153s linear 0.935s forwards" }} />
            <path id="stroke_e_1" d="M 235,130 Q 230,230 225,330" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.152s linear 1.179s forwards" }} />
            <path id="stroke_e_2" d="M 235,130 Q 260,128 285,125" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.092s linear 1.331s forwards" }} />
            <path id="stroke_e_3" d="M 232,225 Q 255,223 275,220" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.085s linear 1.441s forwards" }} />
            <path id="stroke_e_4" d="M 225,330 Q 255,328 290,325" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.103s linear 1.545s forwards" }} />
            <path id="stroke_f1_1" d="M 330,130 Q 325,230 320,330" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.152s linear 1.728s forwards" }} />
            <path id="stroke_f1_2" d="M 330,130 Q 355,128 380,125" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.091s linear 1.88s forwards" }} />
            <path id="stroke_f1_3" d="M 327,225 Q 350,223 370,220" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.085s linear 1.99s forwards" }} />
            <path id="stroke_f2_1" d="M 420,130 Q 415,230 410,330" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.153s linear 2.154s forwards" }} />
            <path id="stroke_f2_2" d="M 420,130 Q 445,128 470,125" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.091s linear 2.307s forwards" }} />
            <path id="stroke_f2_3" d="M 417,225 Q 440,223 460,220" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.086s linear 2.416s forwards" }} />
            <path id="stroke_i1_1" d="M 510,130 Q 508,230 505,330" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.152s linear 2.581s forwards" }} />
            <path id="stroke_i1_2" d="M 495,130 L 525,130" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.073s linear 2.733s forwards" }} />
            <path id="stroke_i1_3" d="M 490,330 L 520,330" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.073s linear 2.825s forwards" }} />
            <path id="stroke_a_1" d="M 605,130 Q 585,230 565,330" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.153s linear 2.977s forwards" }} />
            <path id="stroke_a_2" d="M 605,130 Q 625,230 645,330" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.152s linear 3.13s forwards" }} />
            <path id="stroke_a_3" d="M 580,250 L 630,250" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.091s linear 3.282s forwards" }} />
            <path id="stroke_i2_1" d="M 695,130 Q 692,230 690,330" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.152s linear 3.465s forwards" }} />
            <path id="stroke_i2_2" d="M 680,130 L 710,130" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.073s linear 3.617s forwards" }} />
            <path id="stroke_i2_3" d="M 675,330 L 705,330" fill="none" stroke="url(#inkGradient)" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" filter="url(#dryBrushFilter)" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawStroke 0.073s linear 3.709s forwards" }} />

            {/* The Red Calligraphy Seal Stamp inside SVG */}
            <g className="opacity-0 scale-150 origin-center"
               style={{
                 transformOrigin: '770px 330px',
                 animation: 'stampSeal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) 3.8s forwards'
               }}>
              {/* Outer seal border */}
              <rect x="740" y="300" width="60" height="60" rx="6" fill="none" stroke="rgba(220, 38, 38, 0.9)" strokeWidth="4" />
              {/* Inward shadow ring */}
              <rect x="743" y="303" width="54" height="54" rx="3" fill="rgba(220, 38, 38, 0.04)" />
              {/* Chinese characters "宁静" (Tranquility) */}
              <text x="770" y="328" fill="rgba(220, 38, 38, 0.95)" fontFamily="serif" fontSize="13" fontWeight="900" textAnchor="middle">宁静</text>
              {/* English "NEFFI AI" */}
              <text x="770" y="346" fill="rgba(220, 38, 38, 0.95)" fontFamily="sans-serif" fontSize="9" fontWeight="800" letterSpacing="0.5" textAnchor="middle">NEFFI AI</text>
            </g>

            {/* The Calligraphy Brush Tip moving along the path */}
            <g style={{
                 offsetPath: `path('M 110,130 Q 105,230 100,330 L 110,130 Q 150,230 190,330 L 190,330 Q 192,230 195,130 L 235,130 Q 230,230 225,330 L 235,130 Q 260,128 285,125 L 232,225 Q 255,223 275,220 L 225,330 Q 255,328 290,325 L 330,130 Q 325,230 320,330 L 330,130 Q 355,128 380,125 L 327,225 Q 350,223 370,220 L 420,130 Q 415,230 410,330 L 420,130 Q 445,128 470,125 L 417,225 Q 440,223 460,220 L 510,130 Q 508,230 505,330 L 495,130 L 525,130 L 490,330 L 520,330 L 605,130 Q 585,230 565,330 L 605,130 Q 625,230 645,330 L 580,250 L 630,250 L 695,130 Q 692,230 690,330 L 680,130 L 710,130 L 675,330 L 705,330')`,
                 animation: 'brushMove 3.2s cubic-bezier(0.42, 0, 0.58, 1) 0.6s forwards',
                 opacity: 0
               }}>
              {/* Brush tip graphics: scaled up and designed like a large wood/bamboo calligraphy brush */}
              <g transform="translate(-25, -75) scale(2.45)">
                {/* Bamboo Handle */}
                <path d="M13,-40 L17,-40 L16.5,25 L13.5,25 Z" fill="url(#bambooGradient)" />
                <rect x="13.5" y="25" width="3" height="4" fill="#1a1a1a" />
                {/* Black Brush Hair ferrule block */}
                <path d="M13,29 C11,36 9,45 15,55 C21,45 19,36 17,29 Z" fill="#1C1917" />
                {/* Dark wet ink tip */}
                <path d="M13.8,37 C12,44 11.5,48 15,55 C18.5,48 18,44 16.2,37 Z" fill="#0C0C0C" />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN APP ROUTER
// ==========================================
export default function App() {
  const saved = (() => { try { return JSON.parse(localStorage.getItem('neffi_user')); } catch { return null; } })();
  const [view, setView] = useState(saved ? 'patient-dashboard' : 'landing');
  const [userData, setUserData] = useState(saved || null);
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return !sessionStorage.getItem('neffi_intro_seen');
    } catch {
      return true;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('neffi_user');
    setUserData(null);
    setView('landing');
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
    try {
      sessionStorage.setItem('neffi_intro_seen', 'true');
    } catch (e) {}
  };

  const viewComponent = () => {
    switch(view) {
      case 'landing': return <LandingPage setView={setView} />;
      case 'login-patient': return <PatientLogin setView={setView} setUserData={setUserData} />;
      case 'login-admin': return <AdminLogin setView={setView} />;
      case 'patient-dashboard': return <PatientDashboard setView={setView} userData={userData} onLogout={handleLogout} />;
      case 'admin-dashboard': return <AdminDashboard setView={setView} />;
      default: return <LandingPage setView={setView} />;
    }
  };

  return (
    <div className="font-inter min-h-screen w-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&family=Dancing+Script:wght@600;700&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Cormorant+Garamond:ital,wght@0,600;1,700&family=Space+Grotesk:wght@400;500;600;700&family=Raleway:wght@700;800;900&family=Sacramento&family=Playball&family=Caveat:wght@600;700&family=Satisfy&family=Alex+Brush&family=Allura&family=Great+Vibes&family=Pacifico&display=swap');
        
        /* ──────────────────────────────────────────────
           FONT DEFINITIONS
        ────────────────────────────────────────────── */
        .font-poppins    { font-family: 'Outfit', sans-serif; }
        .font-inter      { font-family: 'Inter', sans-serif; }
        .font-space      { font-family: 'Outfit', sans-serif; letter-spacing: 0.015em; }
        .font-raleway    { font-family: 'Raleway', sans-serif; }
        .font-playfair   { font-family: 'Playfair Display', serif; }
        .font-cormorant  { font-family: 'Cormorant Garamond', serif; }
        .font-sacramento { font-family: 'Sacramento', cursive !important; }
        .font-greatvibes { font-family: 'Great Vibes', cursive !important; }
        .font-alexbrush  { font-family: 'Alex Brush', cursive !important; }
        .font-allura     { font-family: 'Allura', cursive !important; }
        .font-pacifico   { font-family: 'Pacifico', cursive !important; }
        .font-playball   { font-family: 'Playball', cursive !important; }
        .font-satisfy    { font-family: 'Satisfy', cursive !important; }

        /* Globally improve legibility of small descriptions and paragraph text */
        .card-text, .p-text {
          font-family: 'Inter', sans-serif !important;
          font-size: 14.5px !important;
          line-height: 1.7 !important;
          letter-spacing: 0.012em !important;
        }

        /* ──────────────────────────────────────────────
           CURSIVE ACCENTS — multiple styles
        ────────────────────────────────────────────── */
        /* ──────────────────────────────────────────────
           CURSIVE ACCENTS — same size as context, different font
        ────────────────────────────────────────────── */
        .cursive-accent {
          font-family: 'Dancing Script', cursive;
          font-weight: 700;
          font-size: 1.08em;          /* only slightly larger — no more blowout */
          display: inline;
          letter-spacing: 0.015em;
        }
        .cursive-accent-lg {
          font-family: 'Dancing Script', cursive;
          font-weight: 700;
          font-size: 1.2em;           /* for standalone decorative use only */
          display: inline-block;
          transform: rotate(-1deg);
          letter-spacing: 0.02em;
        }
        .cursive-playfair {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-weight: 700;
          font-size: 1em;             /* same size as surrounding h1 */
          display: inline;
          letter-spacing: -0.01em;
        }
        .cursive-sacramento {
          font-family: 'Sacramento', cursive;
          font-size: 1.4em;
          display: inline-block;
        }

        /* ──────────────────────────────────────────────
           GRADIENT TEXT PRESETS
        ────────────────────────────────────────────── */
        .text-gradient-teal {
          background: linear-gradient(135deg, #2C5555 0%, #3A7070 40%, #5E9E9E 70%, #8FA989 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .text-gradient-gold {
          background: linear-gradient(135deg, #92600A 0%, #C8882A 35%, #E8B84B 65%, #D4A373 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .text-gradient-forest {
          background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .text-gradient-rose {
          background: linear-gradient(135deg, #881337 0%, #be123c 50%, #f43f5e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .text-gradient-slate {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .text-gradient-aurora {
          background: linear-gradient(135deg, #2C5555 0%, #3A7070 30%, #5aa0a0 55%, #8FA989 80%, #b5cc90 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ──────────────────────────────────────────────
           BODY & BASE
        ────────────────────────────────────────────── */
        body {
          margin: 0;
          padding: 0;
          background-image:
            linear-gradient(135deg,
              rgba(230, 245, 240, 0.82) 0%,
              rgba(240, 252, 248, 0.75) 40%,
              rgba(220, 238, 234, 0.80) 100%),
            url('/neffi-bg.png');
          background-size: cover;
          background-position: center top;
          background-attachment: fixed;
          background-repeat: no-repeat;
          font-family: 'Inter', sans-serif;
          color: #0D1A1A;
        }
        h1, h2, h3 { font-family: 'Outfit', sans-serif; }
        h4, h5, h6 { font-family: 'Space Grotesk', sans-serif; }
        
        /* ──────────────────────────────────────────────
           TYPOGRAPHY SCALE — clear visual hierarchy
           Hero h1:   clamp(38px → 68px) in JSX
           Section h2: 48px  — big, impactful
           Card h3:    26px  — readable subheading
           Body text:  20px  — comfortable reading
           Small copy: 17px  — supporting detail
           Labels:     12px  — uppercase metadata
        ────────────────────────────────────────────── */
        .h1-title {
          font-size: clamp(40px, 5vw, 68px);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.025em;
          font-family: 'Raleway', sans-serif;
          color: #0D1A1A;
        }
        .h2-title {
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.015em;
          font-family: 'Raleway', sans-serif;
          color: #0D1A1A;
        }
        .h3-title {
          font-size: clamp(22px, 2.5vw, 28px);
          font-weight: 700;
          line-height: 1.3;
          letter-spacing: -0.008em;
          font-family: 'Space Grotesk', sans-serif;
          color: #1A3030;
        }
        .p-text {
          font-size: clamp(17px, 1.6vw, 20px);
          font-weight: 400;
          line-height: 1.85;
          color: #2D4040;
          font-family: 'Inter', sans-serif;
        }
        .p-small {
          font-size: clamp(15px, 1.4vw, 17px);
          font-weight: 400;
          line-height: 1.75;
          color: #3D5555;
          font-family: 'Inter', sans-serif;
        }
        .label-text {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-size: 11px;
          color: #5A7E7E;
        }
        /* card body text: smaller than p-text */
        .card-text {
          font-size: 15px;
          font-weight: 500;
          line-height: 1.7;
          color: #4A6060;
          font-family: 'Inter', sans-serif;
        }

        /* ──────────────────────────────────────────────
           SCROLL ZOOM EFFECT
        ────────────────────────────────────────────── */
        .scroll-zoom-section {
          opacity: 1 !important;
          transform: none !important;
        }
        
        .scroll-zoom-section h2, 
        .scroll-zoom-section h3, 
        .scroll-zoom-section p:not(.chat-message-text), 
        .scroll-zoom-section .glass-card, 
        .scroll-zoom-section .glass-panel {
          transform: translateY(40px) scale(0.92);
          opacity: 0;
          transition: transform 1.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }

        .scroll-zoom-section.in-view h2, 
        .scroll-zoom-section.in-view h3, 
        .scroll-zoom-section.in-view p:not(.chat-message-text), 
        .scroll-zoom-section.in-view .glass-card, 
        .scroll-zoom-section.in-view .glass-panel {
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        .floating-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.3;
          z-index: 0;
          animation: float 15s ease-in-out infinite;
        }
        
        .floating-blob-slow {
          position: absolute;
          border-radius: 50%;
          filter: blur(130px);
          opacity: 0.25;
          z-index: 0;
          animation: floatSlow 22s ease-in-out infinite;
        }
        
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px) scale(1); }
          33% { transform: translateY(-40px) translateX(25px) scale(1.05); }
          66% { transform: translateY(15px) translateX(-30px) scale(0.95); }
          100% { transform: translateY(0px) translateX(0px) scale(1); }
        }
        
        @keyframes floatSlow {
          0% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(50px) translateX(-40px) scale(1.08); }
          100% { transform: translateY(0px) translateX(0px) scale(1); }
        }

        /* Webkit custom scrollbars for elegant glass look */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(242, 249, 246, 0.4);
          backdrop-filter: blur(8px);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(58, 112, 112, 0.32);
          border-radius: 9999px;
          border: 1.5px solid rgba(242, 249, 246, 0.4);
          transition: background 0.2s ease-in-out;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(58, 112, 112, 0.55);
        }

        /* Glass shine sweeping reflection on buttons */
        .glass-btn-shine {
          position: relative;
          overflow: hidden;
        }
        .glass-btn-shine::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -75%;
          width: 40%;
          height: 200%;
          background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0) 100%);
          transform: rotate(30deg);
          transition: all 0.75s cubic-bezier(0.19, 1, 0.22, 1);
          opacity: 0;
          pointer-events: none;
        }
        .glass-btn-shine:hover::after {
          left: 125%;
          opacity: 1;
        }

        /* Calligraphy intro animation keyframes */
        @keyframes drawStroke {
          from {
            stroke-dashoffset: 300;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes brushMove {
          0% {
            offset-distance: 0%;
            opacity: 0;
          }
          1% {
            opacity: 1;
          }
          98% {
            offset-distance: 100%;
            opacity: 1;
          }
          100% {
            offset-distance: 100%;
            opacity: 0;
          }
        }

        @keyframes dotPop {
          0% { opacity: 0; transform: scale(0); }
          70% { transform: scale(1.3); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes splatPop {
          0% { transform: scale(0); opacity: 0; }
          40% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0.85; }
        }

        @keyframes splatDrip {
          0% { transform: scale(0); opacity: 0; stroke-dasharray: 50; stroke-dashoffset: 50; }
          25% { transform: scale(1.2); opacity: 1; stroke-dashoffset: 50; }
          100% { transform: scale(1); opacity: 0.85; stroke-dashoffset: 0; }
        }

        @keyframes stampSeal {
          0% { opacity: 0; transform: scale(2.5) rotate(-25deg); filter: blur(4px); }
          50% { opacity: 0.8; transform: scale(0.9) rotate(-8deg); filter: blur(0); }
          100% { opacity: 0.95; transform: scale(1) rotate(-10deg); filter: blur(0); }
        }

        @keyframes glassShine {
          0% {
            left: -150%;
          }
          100% {
            left: 150%;
          }
        }
      `}</style>
      
      {showIntro ? <IntroAnimation onComplete={handleIntroComplete} /> : viewComponent()}
    </div>
  );
}
