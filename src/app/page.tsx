'use client';

import Image from "next/image";
import { GlassCard } from "@/components";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SplitFlapTitle from "@/components/SplitFlapTitle";

export default function Home() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNameClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Reset click count after 2 seconds of no clicks
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 2000);

    // Navigate to /dad after 5 clicks
    if (newCount >= 5) {
      setClickCount(0);
      router.push('/dad');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-rich noise-overlay flex flex-col">
      {/* Floating orbs for atmosphere */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Centered content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative z-10">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-2" style={{ color: 'var(--accent-coral)' }}>
            ScottD3v
          </h1>
          <p className="text-base italic mb-6" style={{ color: 'var(--accent-teal)' }}>
            Software Seuss +
          </p>
          <SplitFlapTitle />
        </header>

        {/* Cards */}
        <div className="w-full max-w-md space-y-4">
          {/* Dead Hang Tracker - Featured App */}
          <div className="animate-slide-in delay-200">
            <div className="featured-glow">
              <GlassCard
                href="/dead-hang-tracker"
                icon={
                  <Image
                    src="/dead-hang-icon-180.png"
                    alt="Dead Hang Tracker"
                    width={56}
                    height={56}
                    className="rounded-xl"
                  />
                }
                title="Dead Hang Tracker"
                subtitle="Track your grip strength progress on iOS & Apple Watch"
                isActive
              />
            </div>
          </div>

          {/* Dad Hang */}
          <div className="animate-slide-in delay-300">
            <GlassCard
              href="https://dadhang.scottd3v.com"
              icon={
                <span className="text-5xl">🍻</span>
              }
              title="Dad Hang"
              subtitle="Get the dads together in 30 seconds"
            />
          </div>

          {/* Hank's Computer */}
          <div className="animate-slide-in delay-400">
            <GlassCard
              href="/hank"
              icon={
                <span className="text-5xl">🦖</span>
              }
              title="Hank's Computer"
              subtitle="Hank's virtual desktop"
            />
          </div>

          {/* Danny's Computer */}
          <div className="animate-slide-in delay-500">
            <GlassCard
              href="/danny"
              icon={
                <span className="text-5xl">🦕</span>
              }
              title="Danny's Computer"
              subtitle="Danny's virtual desktop"
            />
          </div>

          {/* Contact */}
          <div className="animate-slide-in delay-700">
            <div className="glass specular p-5 min-h-[100px]">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl icon-glow">
                  <svg
                    className="w-10 h-10"
                    style={{ color: 'var(--accent-coral)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                    Contact
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    scottd3v@gmail.com
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <a
                  href="mailto:scottd3v@gmail.com"
                  className="flex-1 py-2 px-4 rounded-lg text-center text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--accent-coral)',
                    color: 'var(--background)'
                  }}
                >
                  Open Mail Client
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('scottd3v@gmail.com');
                  }}
                  className="flex-1 py-2 px-4 rounded-lg text-center text-sm font-medium transition-colors border"
                  style={{
                    borderColor: 'var(--accent-teal)',
                    color: 'var(--accent-teal)'
                  }}
                >
                  Copy Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center relative z-10 animate-fade-in delay-800">
        <p
          className="text-lg italic mb-3"
          style={{ color: 'var(--accent-teal)' }}
        >
          Oh the places we&apos;re going
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          © 2025{' '}
          <span
            onClick={handleNameClick}
            className="cursor-default select-none"
          >
            Scott Reed
          </span>
        </p>
      </footer>
    </div>
  );
}
