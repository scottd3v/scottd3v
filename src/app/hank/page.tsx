'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Hank's birthday - November 30, 2020
const HANK_BIRTHDAY = new Date('2020-11-30');

const calculateAge = (birthday: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age--;
  }
  return age;
};

const SESSION_KEY = 'hank-authenticated';

export default function HankPortal() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const currentAge = calculateAge(HANK_BIRTHDAY);
  const correctPassword = currentAge.toString();

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check session on mount
  useEffect(() => {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === 'true') {
      setIsAuthenticated(true);
      setShowDesktop(true);
    }
  }, []);

  const handleNumberPress = (num: number) => {
    if (password.length >= 1) return; // Single digit only

    const newPassword = num.toString();
    setPassword(newPassword);

    if (newPassword === correctPassword) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      localStorage.setItem('hank-last-login', new Date().toISOString());
      setIsAuthenticated(true);
      setTimeout(() => setShowDesktop(true), 800);
    } else {
      setError(true);
      setTimeout(() => {
        setPassword('');
        setError(false);
      }, 1000);
    }
  };

  // Shared content component for both mobile and desktop bezel views
  const ScreenContent = () => (
    <>
      {/* Login Screen */}
      {!showDesktop && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${isAuthenticated ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}
          style={{
            background: 'linear-gradient(135deg, #854d0e 0%, #a16207 25%, #ca8a04 50%, #eab308 75%, #facc15 100%)',
          }}
        >
          {/* Floating particles - reduced on mobile */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/10 animate-float"
                style={{
                  width: Math.random() * 20 + 10 + 'px',
                  height: Math.random() * 20 + 10 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  animationDelay: Math.random() * 5 + 's',
                  animationDuration: Math.random() * 10 + 10 + 's',
                }}
              />
            ))}
          </div>

          {/* Name watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span
              className="text-[25vw] md:text-[180px] font-black text-white/[0.07] tracking-tight"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Hank
            </span>
          </div>

          {/* Login content - BIGGER for Hank */}
          <div className="relative z-10 flex flex-col items-center px-4">
            {/* Avatar - Larger */}
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg border-4 border-white/30">
              <span className="text-6xl md:text-7xl">🦖</span>
            </div>

            {/* Name - Larger */}
            <h1
              className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Hank
            </h1>

            {/* Big Number Pad - Visual only, no text */}
            <div className={`mt-6 ${error ? 'animate-shake' : ''}`}>
              {/* Password display - just a big circle */}
              <div className="flex justify-center mb-4">
                <div className={`w-20 h-20 rounded-full border-4 ${password ? 'bg-white border-white' : 'bg-white/20 border-white/40'} transition-all duration-200 flex items-center justify-center`}>
                  {password && <span className="text-4xl">⭐</span>}
                </div>
              </div>

              {/* Number grid - EXTRA BIG for Hank */}
              <div className="grid grid-cols-5 gap-2 md:gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumberPress(num)}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-sm border-2 border-white/30 text-white text-2xl md:text-3xl font-bold transition-all active:scale-95 shadow-lg"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual hint - birthday cake emoji */}
            <div className="mt-6 text-4xl animate-bounce">
              🎂
            </div>
          </div>
        </div>
      )}

      {/* Desktop */}
      {showDesktop && (
        <div
          className="absolute inset-0 animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, #854d0e 0%, #a16207 25%, #ca8a04 50%, #eab308 75%, #facc15 100%)',
          }}
        >
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/10 animate-float"
                style={{
                  width: Math.random() * 15 + 8 + 'px',
                  height: Math.random() * 15 + 8 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  animationDelay: Math.random() * 5 + 's',
                  animationDuration: Math.random() * 10 + 10 + 's',
                }}
              />
            ))}
          </div>

          {/* Name watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span
              className="text-[30vw] md:text-[220px] font-black text-white/[0.05] tracking-tight"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Hank
            </span>
          </div>

          {/* Menu bar */}
          <div className="absolute top-0 left-0 right-0 h-10 md:h-7 bg-black/20 backdrop-blur-md flex items-center justify-between px-4 text-white/90 text-xs font-medium safe-area-inset">
            <div className="flex items-center gap-4">
              <span className="text-sm"></span>
              <span style={{ fontFamily: "'Nunito', sans-serif" }}>🦖</span>
            </div>
            <div className="flex items-center gap-4">
              <span>🔋</span>
              <span style={{ fontFamily: "'Nunito', sans-serif" }}>{currentTime}</span>
            </div>
          </div>

          {/* Desktop - Single HUGE icon for Hank */}
          <div className="absolute inset-0 pt-16 md:pt-12 pb-24 flex items-center justify-center">
            <button
              onClick={() => router.push('/hank/dino')}
              className="group flex flex-col items-center gap-4"
            >
              <div className="w-36 h-36 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 flex items-center justify-center shadow-2xl active:scale-95 transition-all duration-200 border-4 border-white/20">
                <span className="text-7xl md:text-8xl">🦖</span>
              </div>
              <span
                className="text-white text-2xl md:text-2xl font-bold drop-shadow-lg"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Play!
              </span>
            </button>
          </div>

          {/* Dock - simpler for Hank */}
          <div className="absolute bottom-4 md:bottom-3 left-1/2 -translate-x-1/2 safe-area-bottom">
            <div className="flex items-end gap-2 px-5 py-4 md:py-3 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg">
              <button
                onClick={() => router.push('/hank/dino')}
                className="w-16 h-16 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 flex items-center justify-center shadow-md active:scale-95 transition-all duration-200"
              >
                <span className="text-4xl">🦖</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center md:p-8">
      {/* Desk surface gradient - desktop only */}
      <div className="hidden md:block absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-slate-700/20 via-transparent to-transparent" />

      {/* Mobile: Full screen content */}
      <div className="md:hidden fixed inset-0">
        <ScreenContent />
      </div>

      {/* Desktop: MacBook Air bezel */}
      <div className="hidden md:block relative w-full max-w-4xl animate-fade-in">
        {/* Screen bezel */}
        <div className="relative bg-gradient-to-b from-[#e2e2e7] via-[#c8c8cc] to-[#a8a8ac] rounded-t-[20px] p-[12px] shadow-[0_-2px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.5)]">
          {/* Camera notch area */}
          <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gradient-to-b from-slate-600 to-slate-800 shadow-inner" />

          {/* Screen */}
          <div className="relative bg-black rounded-[8px] overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]" style={{ aspectRatio: '16/10' }}>
            <ScreenContent />
          </div>
        </div>

        {/* MacBook bottom / keyboard area */}
        <div className="relative bg-gradient-to-b from-[#a8a8ac] via-[#c8c8cc] to-[#d8d8dc] rounded-b-[20px] h-4 md:h-5 shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_-1px_0_rgba(0,0,0,0.1)]">
          {/* Notch/indent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 md:w-24 h-1 bg-gradient-to-b from-[#888] to-[#999] rounded-b-full" />
        </div>

        {/* Shadow underneath */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-black/20 blur-xl rounded-full" />
      </div>

      {/* Nunito font */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-10px);
          }
          75% {
            transform: translateY(-30px) translateX(5px);
          }
        }

        .animate-float {
          animation: float 15s ease-in-out infinite;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        .safe-area-inset {
          padding-top: env(safe-area-inset-top);
        }

        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}
