'use client';

import { useState, useEffect, useCallback } from 'react';
import { saveTitles, getStoredTitles, getDefaultTitles } from '@/components/SplitFlapTitle';

// Types
interface KidStats {
  attemptsToday: number;
  highScore: number;
  dailyLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  streakDays: number;
  totalSessions: number;
  lastPlayDate: string;
}

interface EasterEgg {
  name: string;
  location: string;
  howTo: string;
}

// WebAuthn helpers
const isWebAuthnSupported = () => {
  return typeof window !== 'undefined' &&
         window.PublicKeyCredential !== undefined &&
         typeof window.PublicKeyCredential === 'function';
};

// Generate a random challenge
const generateChallenge = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return array;
};

// Convert ArrayBuffer to base64
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Convert base64 to ArrayBuffer
const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Storage keys
const WEBAUTHN_CREDENTIAL_KEY = 'dad-webauthn-credential';

// The magic words (case-insensitive)
const MAGIC_PHRASE = 'hop on pop';
// The special date - when Danny first read the book
const MAGIC_DATE = '2025-12-05';

// Load kid stats from localStorage
const loadKidStats = (kid: 'danny' | 'hank'): KidStats | null => {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(`dino-${kid}`);
  if (!saved) return null;
  return JSON.parse(saved);
};

// Save kid settings
const saveKidSettings = (kid: 'danny' | 'hank', settings: Partial<KidStats>) => {
  if (typeof window === 'undefined') return;
  const current = loadKidStats(kid) || {
    attemptsToday: 0,
    highScore: 0,
    dailyLimit: kid === 'danny' ? 15 : 10,
    difficulty: kid === 'danny' ? 'medium' : 'easy',
    streakDays: 0,
    totalSessions: 0,
    lastPlayDate: '',
  };
  localStorage.setItem(`dino-${kid}`, JSON.stringify({ ...current, ...settings }));
};

// Easter eggs reference
const EASTER_EGGS: EasterEgg[] = [
  {
    name: 'Dad Portal',
    location: 'Homepage',
    howTo: 'Click "Scott Reed" 5 times',
  },
  {
    name: 'Danny Parent Controls',
    location: '/danny/dino',
    howTo: 'Click timer (top-right) 7 times',
  },
  {
    name: 'Hank Parent Controls',
    location: '/hank/dino',
    howTo: 'Click timer (top-right) 7 times',
  },
];

export default function DadPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [webAuthnSupported, setWebAuthnSupported] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Seussian auth state
  const [magicWords, setMagicWords] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [authStep, setAuthStep] = useState<'words' | 'date'>('words');
  const [showSparkles, setShowSparkles] = useState(false);

  // Kid stats
  const [dannyStats, setDannyStats] = useState<KidStats | null>(null);
  const [hankStats, setHankStats] = useState<KidStats | null>(null);

  // Homepage titles
  const [titles, setTitles] = useState<string[]>([]);
  const [newTitle, setNewTitle] = useState('');

  // Check authentication status on mount
  useEffect(() => {
    setWebAuthnSupported(isWebAuthnSupported());
    const credential = localStorage.getItem(WEBAUTHN_CREDENTIAL_KEY);
    setIsRegistered(!!credential);
  }, []);

  // Load kid stats and titles when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setDannyStats(loadKidStats('danny'));
      setHankStats(loadKidStats('hank'));
      setTitles(getStoredTitles());
    }
  }, [isAuthenticated]);

  // Register WebAuthn credential
  const registerWebAuthn = useCallback(async () => {
    if (!isWebAuthnSupported()) {
      setAuthError('WebAuthn is not supported on this device');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      const challenge = generateChallenge();

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'scottd3v Dad Portal',
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode('dad-scottd3v'),
            name: 'dad@scottd3v.com',
            displayName: 'Dad',
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },   // ES256
            { alg: -257, type: 'public-key' }, // RS256
          ],
          authenticatorSelection: {
            // No authenticatorAttachment - allows passkeys to sync via iCloud Keychain
            residentKey: 'required',        // Makes it a discoverable credential (passkey)
            userVerification: 'required',
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      if (credential) {
        // Store credential ID for later authentication
        const credentialId = bufferToBase64(credential.rawId);
        localStorage.setItem(WEBAUTHN_CREDENTIAL_KEY, credentialId);
        setIsRegistered(true);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('WebAuthn registration failed:', error);
      setAuthError('Registration failed. Try using a passphrase instead.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Authenticate with WebAuthn
  const authenticateWebAuthn = useCallback(async () => {
    setIsLoading(true);
    setAuthError('');

    try {
      const challenge = generateChallenge();
      const storedCredentialId = localStorage.getItem(WEBAUTHN_CREDENTIAL_KEY);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          // If we have a stored credential ID, suggest it; otherwise allow any passkey for this site
          allowCredentials: storedCredentialId ? [{
            id: base64ToBuffer(storedCredentialId),
            type: 'public-key',
          }] : [],
          userVerification: 'required',
          timeout: 60000,
        },
      });

      if (assertion) {
        // Store the credential ID for future use (in case it was a discoverable credential)
        const credentialId = bufferToBase64((assertion as PublicKeyCredential).rawId);
        localStorage.setItem(WEBAUTHN_CREDENTIAL_KEY, credentialId);
        setIsRegistered(true);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('WebAuthn authentication failed:', error);
      setAuthError('Authentication failed. Try again or use passphrase.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify the magic words
  const verifyMagicWords = () => {
    if (magicWords.toLowerCase().trim() === MAGIC_PHRASE) {
      setShowSparkles(true);
      setTimeout(() => {
        setShowSparkles(false);
        setAuthStep('date');
      }, 800);
    } else {
      setAuthError('The Seuss does not recognize these words...');
      setTimeout(() => setAuthError(''), 2000);
    }
  };

  // Verify the magic date
  const verifyMagicDate = () => {
    if (selectedDate === MAGIC_DATE) {
      setShowSparkles(true);
      setTimeout(() => {
        setIsAuthenticated(true);
      }, 600);
    } else {
      setAuthError('This is not the day...');
      setTimeout(() => setAuthError(''), 2000);
    }
  };

  // Update kid settings
  const updateDannySettings = (settings: Partial<KidStats>) => {
    saveKidSettings('danny', settings);
    setDannyStats(loadKidStats('danny'));
  };

  const updateHankSettings = (settings: Partial<KidStats>) => {
    saveKidSettings('hank', settings);
    setHankStats(loadKidStats('hank'));
  };

  // Reset kid's daily attempts
  const resetAttempts = (kid: 'danny' | 'hank') => {
    const setter = kid === 'danny' ? updateDannySettings : updateHankSettings;
    setter({ attemptsToday: 0 });
  };

  // Title management functions
  const addTitle = () => {
    if (newTitle.trim() && !titles.includes(newTitle.trim())) {
      const updated = [...titles, newTitle.trim()];
      setTitles(updated);
      saveTitles(updated);
      setNewTitle('');
    }
  };

  const removeTitle = (index: number) => {
    if (titles.length > 1) {
      const updated = titles.filter((_, i) => i !== index);
      setTitles(updated);
      saveTitles(updated);
    }
  };

  const moveTitle = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= titles.length) return;
    const updated = [...titles];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setTitles(updated);
    saveTitles(updated);
  };

  const resetTitlesToDefault = () => {
    const defaults = getDefaultTitles();
    setTitles(defaults);
    saveTitles(defaults);
  };

  // Not authenticated - show the magical Seussian login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
        {/* Subtle floating sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[var(--accent-coral)] rounded-full opacity-30 animate-pulse"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Success sparkles burst */}
        {showSparkles && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-ping"
                style={{
                  backgroundColor: i % 2 === 0 ? 'var(--accent-coral)' : 'var(--accent-teal)',
                  left: `calc(50% + ${Math.cos(i * 30 * Math.PI / 180) * 80}px)`,
                  top: `calc(50% + ${Math.sin(i * 30 * Math.PI / 180) * 80}px)`,
                  animationDuration: '0.6s',
                }}
              />
            ))}
          </div>
        )}

        <main className="relative z-10 flex flex-col items-center max-w-sm w-full">
          {/* Software Seuss signature as the mystical icon */}
          <div className={`mb-8 transition-transform duration-500 ${showSparkles ? 'scale-110' : ''}`}>
            <img
              src="/softwareseus.svg"
              alt="Software Seuss"
              className="w-24 h-auto opacity-60 hover:opacity-80 transition-opacity"
            />
          </div>

          {authStep === 'words' ? (
            // Step 1: The Magic Words
            <div className="text-center animate-fade-in w-full">
              <p className="text-[var(--accent-teal)] text-sm italic mb-6">
                Whisper your words to the Seuss...
              </p>

              <input
                type="text"
                value={magicWords}
                onChange={(e) => { setMagicWords(e.target.value); setAuthError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && verifyMagicWords()}
                placeholder=""
                autoComplete="off"
                autoCapitalize="off"
                className="w-full bg-transparent border-b-2 border-[var(--accent-coral)]/30 focus:border-[var(--accent-coral)] px-4 py-3 text-center text-[var(--text-primary)] text-lg placeholder-transparent outline-none transition-colors"
                autoFocus
              />

              {authError && (
                <p className="text-[var(--accent-coral)] text-sm mt-4 italic animate-pulse">
                  {authError}
                </p>
              )}

              <button
                onClick={verifyMagicWords}
                disabled={!magicWords.trim()}
                className="mt-8 px-8 py-3 rounded-full bg-[var(--accent-coral)]/10 border border-[var(--accent-coral)]/30 text-[var(--accent-coral)] hover:bg-[var(--accent-coral)]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Speak
              </button>
            </div>
          ) : (
            // Step 2: The Magic Date
            <div className="text-center animate-fade-in w-full">
              <p className="text-[var(--accent-teal)] text-sm italic mb-2">
                The words are true...
              </p>
              <p className="text-[var(--accent-coral)] text-sm italic mb-6">
                Now choose the day it all began.
              </p>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setAuthError(''); }}
                className="w-full bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg px-4 py-3 text-center text-[var(--text-primary)] outline-none focus:border-[var(--accent-teal)] transition-colors cursor-pointer"
                style={{ colorScheme: 'dark' }}
              />

              {authError && (
                <p className="text-[var(--accent-coral)] text-sm mt-4 italic animate-pulse">
                  {authError}
                </p>
              )}

              <button
                onClick={verifyMagicDate}
                disabled={!selectedDate}
                className="mt-8 px-8 py-3 rounded-full bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)]/30 text-[var(--accent-teal)] hover:bg-[var(--accent-teal)]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Remember
              </button>

              <button
                onClick={() => { setAuthStep('words'); setMagicWords(''); }}
                className="block mx-auto mt-4 text-[var(--text-muted)] text-xs hover:text-[var(--text-secondary)] transition-colors"
              >
                Start over
              </button>
            </div>
          )}

          {/* Passkey option - subtle at bottom */}
          {webAuthnSupported && isRegistered && authStep === 'words' && (
            <button
              onClick={authenticateWebAuthn}
              disabled={isLoading}
              className="mt-12 text-[var(--text-muted)] text-xs hover:text-[var(--text-secondary)] transition-colors flex items-center gap-2"
            >
              <span>🔑</span>
              {isLoading ? 'Verifying...' : 'Use passkey instead'}
            </button>
          )}
        </main>

        <a
          href="/"
          className="absolute bottom-8 text-[var(--text-muted)] text-sm hover:text-[var(--text-secondary)] transition-colors"
        >
          ← Back to home
        </a>
      </div>
    );
  }

  // Authenticated - show dashboard
  return (
    <div className="bg-gradient-rich noise-overlay min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gradient mb-2">Dad Portal</h1>
          <p className="text-[var(--text-secondary)]">Family Platform Control Center</p>
        </div>

        {/* Kid Stats Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Danny's Stats */}
          <div className="glass p-6 animate-fade-in delay-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🦕</span>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Danny</h2>
                <p className="text-sm text-[var(--text-secondary)]">Age 5 (Jan 15, 2020) • /danny</p>
              </div>
            </div>

            {dannyStats ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Plays Today</span>
                  <span className="text-[var(--text-primary)]">{dannyStats.attemptsToday} / {dannyStats.dailyLimit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">High Score</span>
                  <span className="text-[var(--accent-gold)]">{dannyStats.highScore}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Streak</span>
                  <span className="text-orange-400">{dannyStats.streakDays} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Difficulty</span>
                  <span className="text-[var(--text-primary)] capitalize">{dannyStats.difficulty}</span>
                </div>

                <div className="pt-3 border-t border-[var(--glass-border)] space-y-2">
                  <div className="flex gap-2">
                    <label className="text-sm text-[var(--text-secondary)]">Daily Limit:</label>
                    <input
                      type="number"
                      value={dannyStats.dailyLimit}
                      onChange={(e) => updateDannySettings({ dailyLimit: parseInt(e.target.value) || 0 })}
                      className="w-16 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded px-2 py-1 text-sm text-[var(--text-primary)]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <label className="text-sm text-[var(--text-secondary)]">Difficulty:</label>
                    <select
                      value={dannyStats.difficulty}
                      onChange={(e) => updateDannySettings({ difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                      className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded px-2 py-1 text-sm text-[var(--text-primary)]"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <button
                    onClick={() => resetAttempts('danny')}
                    className="text-sm text-[var(--accent-blue)] hover:underline"
                  >
                    Reset today&apos;s plays
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[var(--text-secondary)] text-sm">No play data yet</p>
            )}
          </div>

          {/* Hank's Stats */}
          <div className="glass p-6 animate-fade-in delay-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🦖</span>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Hank</h2>
                <p className="text-sm text-[var(--text-secondary)]">Age 4 (Nov 30, 2020) • /hank</p>
              </div>
            </div>

            {hankStats ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Plays Today</span>
                  <span className="text-[var(--text-primary)]">{hankStats.attemptsToday} / {hankStats.dailyLimit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">High Score</span>
                  <span className="text-[var(--accent-gold)]">{hankStats.highScore}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Streak</span>
                  <span className="text-orange-400">{hankStats.streakDays} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Difficulty</span>
                  <span className="text-[var(--text-primary)] capitalize">{hankStats.difficulty}</span>
                </div>

                <div className="pt-3 border-t border-[var(--glass-border)] space-y-2">
                  <div className="flex gap-2">
                    <label className="text-sm text-[var(--text-secondary)]">Daily Limit:</label>
                    <input
                      type="number"
                      value={hankStats.dailyLimit}
                      onChange={(e) => updateHankSettings({ dailyLimit: parseInt(e.target.value) || 0 })}
                      className="w-16 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded px-2 py-1 text-sm text-[var(--text-primary)]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <label className="text-sm text-[var(--text-secondary)]">Difficulty:</label>
                    <select
                      value={hankStats.difficulty}
                      onChange={(e) => updateHankSettings({ difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                      className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded px-2 py-1 text-sm text-[var(--text-primary)]"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <button
                    onClick={() => resetAttempts('hank')}
                    className="text-sm text-[var(--accent-blue)] hover:underline"
                  >
                    Reset today&apos;s plays
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[var(--text-secondary)] text-sm">No play data yet</p>
            )}
          </div>
        </div>

        {/* Homepage Titles Manager */}
        <div className="glass p-6 mb-8 animate-fade-in delay-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Homepage Titles</h2>
            <button
              onClick={resetTitlesToDefault}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors"
            >
              Reset to defaults
            </button>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            These rotate on the split-flap display under your name
          </p>

          {/* Add new title */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTitle()}
              placeholder="Add a new title..."
              className="flex-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
            />
            <button
              onClick={addTitle}
              className="px-4 py-2 rounded-lg bg-[var(--accent-green)] text-white text-sm font-medium hover:opacity-90 transition-all"
            >
              Add
            </button>
          </div>

          {/* Titles list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {titles.map((title, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-[var(--glass-bg)] rounded-lg px-3 py-2 group"
              >
                <span className="flex-1 text-sm text-[var(--text-primary)]">{title}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => moveTitle(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveTitle(index, 'down')}
                    disabled={index === titles.length - 1}
                    className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeTitle(index)}
                    disabled={titles.length <= 1}
                    className="p-1 text-red-400 hover:text-red-300 disabled:opacity-30"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="glass p-6 mb-8 animate-fade-in delay-400">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a href="/danny" className="glass-pill px-4 py-2 text-center hover:bg-[var(--glass-hover)] transition-all">
              Danny&apos;s Portal
            </a>
            <a href="/danny/dino" className="glass-pill px-4 py-2 text-center hover:bg-[var(--glass-hover)] transition-all">
              Danny&apos;s Dino
            </a>
            <a href="/hank" className="glass-pill px-4 py-2 text-center hover:bg-[var(--glass-hover)] transition-all">
              Hank&apos;s Portal
            </a>
            <a href="/hank/dino" className="glass-pill px-4 py-2 text-center hover:bg-[var(--glass-hover)] transition-all">
              Hank&apos;s Dino
            </a>
          </div>
        </div>

        {/* Easter Eggs Reference */}
        <div className="glass p-6 animate-fade-in delay-500">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Easter Eggs Reference</h2>
          <div className="space-y-3">
            {EASTER_EGGS.map((egg, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-[var(--accent-gold)]">•</span>
                <div>
                  <span className="text-[var(--text-primary)] font-medium">{egg.name}</span>
                  <span className="text-[var(--text-secondary)]"> — {egg.location}</span>
                  <p className="text-[var(--text-secondary)]">{egg.howTo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-[var(--text-secondary)] text-sm">
          <button
            onClick={() => setIsAuthenticated(false)}
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            Lock Portal
          </button>
          <span className="mx-3">•</span>
          <a href="/" className="hover:text-[var(--text-primary)] transition-colors">
            Back to Home
          </a>
        </div>
      </main>
    </div>
  );
}
