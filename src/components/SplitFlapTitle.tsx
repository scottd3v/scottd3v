'use client';

import { useState, useEffect } from 'react';
import { SplitFlap, Presets } from 'react-split-flap';

// Default titles - can be overridden via localStorage from dad portal
const DEFAULT_TITLES = [
  'Product Engineer',
  'Full Stack Creator',
  'Zero-to-One Builder',
  'Software Futurist',
  'Pizza Chef',
  'Dad',
  'Software Seuss',
];

const STORAGE_KEY = 'scottd3v-titles';

// Helper to load titles from localStorage (aliased for dad portal compatibility)
export function getTitles(): string[] {
  if (typeof window === 'undefined') return DEFAULT_TITLES;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Invalid JSON, use defaults
    }
  }
  return DEFAULT_TITLES;
}

// Alias for dad portal
export const getStoredTitles = getTitles;

// Helper to get default titles
export function getDefaultTitles(): string[] {
  return [...DEFAULT_TITLES];
}

// Helper to save titles to localStorage
export function saveTitles(titles: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(titles));
}

// Helper to reset to defaults
export function resetTitles(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export { DEFAULT_TITLES };

export default function SplitFlapTitle() {
  const [titles, setTitles] = useState<string[]>(DEFAULT_TITLES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadedTitles = getTitles();
    setTitles(loadedTitles);
    // Start with a random title
    setCurrentIndex(Math.floor(Math.random() * loadedTitles.length));
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % titles.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [mounted, titles.length]);

  const currentTitle = titles[currentIndex]?.toUpperCase() || '';
  const displayLength = currentTitle.length;

  if (!mounted) {
    // SSR placeholder
    return (
      <div className="h-10 flex items-center justify-center">
        <span className="text-zinc-500 text-lg tracking-wider uppercase">
          {DEFAULT_TITLES[0]}
        </span>
      </div>
    );
  }

  return (
    <div className="split-flap-wrapper flex justify-center items-center min-h-[56px]">
      <div className="split-flap-inner">
        <SplitFlap
          value={currentTitle}
          chars={Presets.ALPHANUM}
          length={displayLength}
          timing={30}
          hinge
          theme="dark"
          size="medium"
          background="#2a2a2a"
          fontColor="#e8e4de"
        />
      </div>
      <style jsx global>{`
        .split-flap-wrapper {
          perspective: 1000px;
        }

        .split-flap-inner {
          display: flex;
          justify-content: center;
          padding: 10px 20px;
          background: linear-gradient(180deg, #1f1f1f 0%, #181818 100%);
          border-radius: 12px;
          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        /* Override library styles */
        .split-flap-inner .split-flap {
          gap: 2px;
        }

        /* Flap cards - warm off-white on dark */
        .split-flap-inner [class*="flap"],
        .split-flap-inner [class*="Flap"] {
          background: linear-gradient(180deg, #2d2d2d 0%, #2d2d2d 49.5%, #252525 50.5%, #252525 100%) !important;
          color: #e8e4de !important;
          border-radius: 4px !important;
          font-family: 'SF Mono', 'Roboto Mono', 'JetBrains Mono', monospace !important;
          font-weight: 500 !important;
          letter-spacing: 0.02em;
        }

        .split-flap-inner .flap-digit {
          font-size: 1.1rem !important;
          min-width: 0.9em !important;
        }

        @media (min-width: 640px) {
          .split-flap-inner {
            padding: 14px 28px;
            border-radius: 14px;
          }

          .split-flap-inner .split-flap {
            gap: 3px;
          }

          .split-flap-inner .flap-digit {
            font-size: 1.35rem !important;
            min-width: 0.95em !important;
          }
        }
      `}</style>
    </div>
  );
}
