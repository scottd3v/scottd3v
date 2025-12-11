'use client';

import Image from "next/image";
import { GlassCard } from "@/components";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import SplitFlapTitle from "@/components/SplitFlapTitle";

// Typewriter component for poem lines
function TypewriterLine({
  text,
  delay = 0,
  speed = 30,
  className = "",
  onComplete
}: {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    if (displayedText.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [started, displayedText, text, speed, onComplete]);

  return (
    <p className={className} style={{ minHeight: '1.6em' }}>
      {displayedText}
      {started && displayedText.length < text.length && (
        <span className="typewriter-cursor">|</span>
      )}
    </p>
  );
}

export default function Home() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);
  const [showPoem, setShowPoem] = useState(false);
  const [poemAnimating, setPoemAnimating] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);
  const [swipeY, setSwipeY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [poemComplete, setPoemComplete] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartY = useRef(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when poem is shown
  useEffect(() => {
    if (showPoem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPoem]);

  // Create particle burst
  const createParticleBurst = useCallback(() => {
    const colors = ['var(--accent-coral)', 'var(--accent-teal)', '#f5f3e7'];
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: 50 + (Math.random() - 0.5) * 30,
      y: 50 + (Math.random() - 0.5) * 30,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1500);
  }, []);

  const handlePoemOpen = () => {
    setShowPoem(true);
    setPoemAnimating(true);
    setPoemComplete(false);
    createParticleBurst();
  };

  const handlePoemComplete = useCallback(() => {
    setPoemComplete(true);
  }, []);

  const handlePoemClose = useCallback(() => {
    setPoemAnimating(false);
    setSwipeY(0);
    setIsSwiping(false);
    setTimeout(() => setShowPoem(false), 300);
  }, []);

  // Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0) {
      setSwipeY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (swipeY > 100) {
      handlePoemClose();
    } else {
      setSwipeY(0);
    }
    setIsSwiping(false);
  };

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
          {/* Hang Habit - Featured App */}
          <div className="animate-slide-in delay-200">
            <div className="featured-glow">
              <GlassCard
                href="https://hanghabit.com"
                icon={
                  <Image
                    src="/hang-habit-icon-180.png"
                    alt="Hang Habit"
                    width={56}
                    height={56}
                    className="rounded-xl"
                  />
                }
                title="Hang Habit"
                subtitle="Dead hang tracker for iOS & Apple Watch"
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
        {/* Quote */}
        <p
          className="text-lg italic mb-6"
          style={{ color: 'var(--accent-teal)' }}
        >
          Oh the places we&apos;re going
        </p>

        {/* Software Seuss signature - Easter egg! */}
        <button
          onClick={handlePoemOpen}
          className="software-seuss-wrapper cursor-pointer bg-transparent border-none mb-6"
          aria-label="Reveal poem"
          type="button"
        >
          <div className="sparkles">
            <div className="sparkle" />
            <div className="sparkle" />
            <div className="sparkle" />
            <div className="sparkle" />
            <div className="sparkle" />
            <div className="sparkle" />
            <div className="sparkle" />
          </div>
          <Image
            src="/softwareseus.svg"
            alt="Software Seuss"
            width={120}
            height={92}
            className="software-seuss mx-auto"
          />
        </button>

        {/* Copyright */}
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

      {/* Poem Easter Egg Modal */}
      {showPoem && (
        <div
          className={`poem-overlay ${poemAnimating ? 'poem-overlay-visible' : ''}`}
          onClick={handlePoemClose}
          style={{ opacity: Math.max(0.3, 1 - swipeY / 300) }}
        >
          {/* Particle burst on open */}
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="burst-particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                backgroundColor: particle.color,
              }}
            />
          ))}

          <div
            ref={modalRef}
            className={`poem-container ${poemAnimating ? 'poem-container-visible' : ''} ${poemComplete ? 'poem-complete' : ''}`}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: `translateY(${swipeY}px) scale(${1 - swipeY / 1000})`,
              transition: isSwiping ? 'none' : undefined
            }}
          >
            {/* Swipe indicator */}
            <div className="swipe-indicator" />

            {/* Close button */}
            <button
              onClick={handlePoemClose}
              className="poem-close"
              aria-label="Close poem"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Poem content with typewriter effect */}
            <div className="poem-content">
              <div className="poem-stanza poem-stanza-1">
                <TypewriterLine
                  text="A five and a four and a baby makes three."
                  delay={300}
                  speed={25}
                  className="poem-line"
                />
                <TypewriterLine
                  text="They climb and they pull and they hang onto me."
                  delay={1800}
                  speed={25}
                  className="poem-line"
                />
                <TypewriterLine
                  text="So I hang every day, decompress head to toe,"
                  delay={3400}
                  speed={25}
                  className="poem-line"
                />
                <TypewriterLine
                  text="So I'm ready to play wherever they go."
                  delay={4900}
                  speed={25}
                  className="poem-line"
                />
              </div>

              <div className="poem-stanza poem-stanza-2">
                <TypewriterLine
                  text="A bar, a branch, a doorframe will do."
                  delay={6500}
                  speed={25}
                  className="poem-line"
                />
                <TypewriterLine
                  text="A playground, a beam, there's always a view."
                  delay={7800}
                  speed={25}
                  className="poem-line"
                />
                <TypewriterLine
                  text="You can hang in the morning, you can hang in the night."
                  delay={9300}
                  speed={25}
                  className="poem-line"
                />
                <TypewriterLine
                  text="You can hang for a minute and you'll feel just right."
                  delay={11200}
                  speed={25}
                  className="poem-line"
                  onComplete={handlePoemComplete}
                />
              </div>
            </div>

            {/* Swipe to close hint */}
            <p className="poem-hint">swipe down or tap outside to close</p>
          </div>
        </div>
      )}
    </div>
  );
}
