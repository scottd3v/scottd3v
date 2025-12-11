'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Game constants
const GAME_WIDTH = 600;
const GAME_HEIGHT = 200;
const GROUND_Y = 150;
const DINO_SIZE = 40;
const GRAVITY = 1.2;
const JUMP_VELOCITY = -18;
const DEFAULT_PIN = '1234';

const DIFFICULTY_SETTINGS = {
  easy: { speed: 8, spawnRate: 1500 },
  medium: { speed: 12, spawnRate: 1000 },
  hard: { speed: 16, spawnRate: 700 },
};

// Helper to get today's date string
const getTodayString = () => new Date().toISOString().split('T')[0];

interface PlayerSettings {
  dailyLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  attemptsToday: number;
  lastPlayDate: string;
  highScore: number;
}

interface DinoGameProps {
  player: 'danny' | 'hank';
  playerEmoji: string;
  playerName: string;
  defaultDifficulty: 'easy' | 'medium' | 'hard';
  defaultDailyLimit: number;
  portalUrl: string;
}

export default function DinoGame({
  player,
  playerEmoji,
  playerName,
  defaultDifficulty,
  defaultDailyLimit,
  portalUrl
}: DinoGameProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'dead'>('ready');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Player settings (parental controls)
  const [settings, setSettings] = useState<PlayerSettings>({
    dailyLimit: defaultDailyLimit,
    difficulty: defaultDifficulty,
    attemptsToday: 0,
    lastPlayDate: '',
    highScore: 0,
  });

  // Parent mode state
  const [showParentMode, setShowParentMode] = useState(false);
  const [parentClickCount, setParentClickCount] = useState(0);
  const [parentPin, setParentPin] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [pinError, setPinError] = useState(false);
  const parentClickTimeout = useRef<NodeJS.Timeout | null>(null);

  // Game state refs (for animation loop)
  const dinoY = useRef(GROUND_Y);
  const dinoVelocity = useRef(0);
  const obstacles = useRef<{x: number, width: number, height: number}[]>([]);
  const lastSpawn = useRef(0);
  const scoreRef = useRef(0);
  const isPlaying = useRef(false);

  // Load settings on mount
  useEffect(() => {
    const saved = localStorage.getItem(`dino-${player}-settings`);
    if (saved) {
      const parsed = JSON.parse(saved) as PlayerSettings;
      // Reset attempts if new day
      if (parsed.lastPlayDate !== getTodayString()) {
        parsed.attemptsToday = 0;
        parsed.lastPlayDate = getTodayString();
      }
      setSettings(parsed);
      setHighScore(parsed.highScore || 0);
    }
  }, [player]);

  const jump = useCallback(() => {
    // Only jump if on the ground
    if (dinoY.current >= GROUND_Y - 5) {
      dinoVelocity.current = JUMP_VELOCITY;
    }
  }, []);

  // Calculate remaining plays
  const remainingPlays = settings.dailyLimit - settings.attemptsToday;
  const canPlay = remainingPlays > 0;

  // Save settings helper
  const saveSettings = useCallback((newSettings: PlayerSettings) => {
    setSettings(newSettings);
    localStorage.setItem(`dino-${player}-settings`, JSON.stringify(newSettings));
  }, [player]);

  const startGame = useCallback(() => {
    if (!canPlay) return;

    // Increment attempts
    const newSettings = {
      ...settings,
      attemptsToday: settings.attemptsToday + 1,
      lastPlayDate: getTodayString(),
    };
    saveSettings(newSettings);

    // Reset game state
    dinoY.current = GROUND_Y;
    dinoVelocity.current = 0;
    obstacles.current = [];
    lastSpawn.current = Date.now();
    scoreRef.current = 0;
    isPlaying.current = true;
    setScore(0);
    setGameState('playing');
  }, [canPlay, settings, saveSettings]);

  const endGame = useCallback(() => {
    isPlaying.current = false;
    setGameState('dead');
    const finalScore = Math.floor(scoreRef.current);
    setScore(finalScore);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      const newSettings = { ...settings, highScore: finalScore };
      saveSettings(newSettings);
    }
  }, [highScore, settings, saveSettings]);

  // Parent mode trigger (tap 7 times on plays remaining)
  const handleParentTrigger = () => {
    setParentClickCount(prev => prev + 1);
    if (parentClickTimeout.current) clearTimeout(parentClickTimeout.current);
    parentClickTimeout.current = setTimeout(() => setParentClickCount(0), 2000);
    if (parentClickCount >= 6) {
      setShowParentMode(true);
      setParentClickCount(0);
    }
  };

  // Verify PIN
  const verifyPin = () => {
    const storedPin = localStorage.getItem(`dino-${player}-pin`) || DEFAULT_PIN;
    if (parentPin === storedPin) {
      setPinVerified(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // Close parent mode
  const closeParentMode = () => {
    setShowParentMode(false);
    setParentPin('');
    setPinVerified(false);
    setPinError(false);
  };

  // Handle input
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState === 'playing') {
          jump();
        } else {
          startGame();
        }
      }
    };

    const handleClick = () => {
      if (gameState === 'playing') {
        jump();
      } else {
        startGame();
      }
    };

    window.addEventListener('keydown', handleKey);
    const canvas = canvasRef.current;
    canvas?.addEventListener('click', handleClick);
    canvas?.addEventListener('touchstart', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKey);
      canvas?.removeEventListener('click', handleClick);
      canvas?.removeEventListener('touchstart', handleClick);
    };
  }, [gameState, jump, startGame]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const difficultyConfig = DIFFICULTY_SETTINGS[settings.difficulty];

    const gameLoop = () => {
      // Clear
      ctx.fillStyle = '#535353';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Draw ground
      ctx.fillStyle = '#8a8a8a';
      ctx.fillRect(0, GROUND_Y + DINO_SIZE/2 + 5, GAME_WIDTH, 2);

      if (isPlaying.current) {
        // Update dino physics
        dinoVelocity.current += GRAVITY;
        dinoY.current += dinoVelocity.current;

        // Ground collision
        if (dinoY.current > GROUND_Y) {
          dinoY.current = GROUND_Y;
          dinoVelocity.current = 0;
        }

        // Spawn obstacles
        const now = Date.now();
        if (now - lastSpawn.current > difficultyConfig.spawnRate) {
          obstacles.current.push({
            x: GAME_WIDTH,
            width: 20 + Math.random() * 15,
            height: 30 + Math.random() * 25,
          });
          lastSpawn.current = now;
        }

        // Move obstacles
        obstacles.current = obstacles.current
          .map(o => ({ ...o, x: o.x - difficultyConfig.speed }))
          .filter(o => o.x > -50);

        // Check collision
        const dinoLeft = 50;
        const dinoRight = dinoLeft + DINO_SIZE - 10;
        const dinoTop = dinoY.current;
        const dinoBottom = dinoY.current + DINO_SIZE;

        for (const obs of obstacles.current) {
          const obsLeft = obs.x;
          const obsRight = obs.x + obs.width;
          const obsTop = GROUND_Y + DINO_SIZE/2 - obs.height + 5;
          const obsBottom = GROUND_Y + DINO_SIZE/2 + 5;

          if (dinoRight > obsLeft && dinoLeft < obsRight &&
              dinoBottom > obsTop && dinoTop < obsBottom) {
            endGame();
            break;
          }
        }

        // Update score
        scoreRef.current += 0.1;
        setScore(Math.floor(scoreRef.current));
      }

      // Draw T-Rex dino
      ctx.fillStyle = '#c8c8c8';
      const dinoX = 50;
      const dY = dinoY.current;

      // Head
      ctx.fillRect(dinoX + 20, dY, 24, 18);
      // Snout
      ctx.fillRect(dinoX + 38, dY + 4, 10, 10);
      // Eye (dark)
      ctx.fillStyle = '#535353';
      ctx.fillRect(dinoX + 36, dY + 6, 4, 4);
      ctx.fillStyle = '#c8c8c8';
      // Neck
      ctx.fillRect(dinoX + 14, dY + 12, 12, 12);
      // Body
      ctx.fillRect(dinoX + 2, dY + 16, 26, 20);
      // Tail
      ctx.fillRect(dinoX - 14, dY + 20, 18, 8);
      ctx.fillRect(dinoX - 22, dY + 24, 10, 4);
      // Arm
      ctx.fillRect(dinoX + 22, dY + 28, 6, 4);
      ctx.fillRect(dinoX + 26, dY + 30, 4, 4);
      // Legs (animated when playing)
      if (isPlaying.current) {
        const legFrame = Math.floor(Date.now() / 100) % 2;
        if (legFrame === 0) {
          ctx.fillRect(dinoX + 6, dY + 34, 6, 10);
          ctx.fillRect(dinoX + 18, dY + 34, 6, 6);
        } else {
          ctx.fillRect(dinoX + 6, dY + 34, 6, 6);
          ctx.fillRect(dinoX + 18, dY + 34, 6, 10);
        }
      } else {
        ctx.fillRect(dinoX + 6, dY + 34, 6, 10);
        ctx.fillRect(dinoX + 18, dY + 34, 6, 10);
      }

      // Draw obstacles (cacti)
      ctx.fillStyle = '#c8c8c8';
      for (const obs of obstacles.current) {
        const obsY = GROUND_Y + DINO_SIZE/2 - obs.height + 5;
        // Main stem
        ctx.fillRect(obs.x, obsY, obs.width, obs.height);
        // Left arm
        ctx.fillRect(obs.x - 6, obsY + 10, 6, 4);
        ctx.fillRect(obs.x - 6, obsY + 10, 4, 16);
        // Right arm
        ctx.fillRect(obs.x + obs.width, obsY + 18, 6, 4);
        ctx.fillRect(obs.x + obs.width + 2, obsY + 18, 4, 14);
      }

      // Draw score
      ctx.fillStyle = '#c8c8c8';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`HI ${highScore.toString().padStart(5, '0')}  ${Math.floor(scoreRef.current).toString().padStart(5, '0')}`, GAME_WIDTH - 10, 25);

      // Draw messages
      ctx.textAlign = 'center';
      if (gameState === 'ready') {
        ctx.font = 'bold 20px monospace';
        ctx.fillText('TAP OR PRESS SPACE TO START', GAME_WIDTH / 2, GAME_HEIGHT / 2);
      } else if (gameState === 'dead') {
        ctx.font = 'bold 24px monospace';
        ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
        ctx.font = '16px monospace';
        ctx.fillText('Tap or press space to retry', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10);
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [settings.difficulty, gameState, highScore, endGame]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-4 pt-safe">
      {/* Header */}
      <div className="text-center mb-4 md:mb-6">
        <button
          onClick={() => router.push(portalUrl)}
          className="text-[#8a8a8a] text-sm active:text-[#e8e4de] hover:text-[#e8e4de] mb-2 transition-colors px-4 py-2 -mx-4 -my-2"
        >
          ← Back to {playerName}&apos;s Computer
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-[#e8e4de]">
          {playerEmoji} {playerName}&apos;s Dino Jump
        </h1>
      </div>

      {/* Stats - 2x2 grid on mobile, row on desktop */}
      <div className="grid grid-cols-2 md:flex gap-4 md:gap-6 mb-4 text-[#e8e4de] w-full max-w-md md:max-w-none md:w-auto">
        <div className="text-center bg-[#1a1a1a] md:bg-transparent rounded-lg p-2 md:p-0">
          <div className="text-xs text-[#8a8a8a]">Score</div>
          <div className="text-lg md:text-xl font-bold">{score}</div>
        </div>
        <div className="text-center bg-[#1a1a1a] md:bg-transparent rounded-lg p-2 md:p-0">
          <div className="text-xs text-[#8a8a8a]">High Score</div>
          <div className="text-lg md:text-xl font-bold text-[#c9a66b]">{highScore}</div>
        </div>
        <div
          className="text-center cursor-pointer select-none bg-[#1a1a1a] md:bg-transparent rounded-lg p-2 md:p-0 active:bg-[#252525]"
          onClick={handleParentTrigger}
        >
          <div className="text-xs text-[#8a8a8a]">Plays Left</div>
          <div className={`text-lg md:text-xl font-bold ${remainingPlays <= 2 ? 'text-[#c96b6b]' : 'text-[#6bc98a]'}`}>
            {remainingPlays}
          </div>
        </div>
        <div className="text-center bg-[#1a1a1a] md:bg-transparent rounded-lg p-2 md:p-0">
          <div className="text-xs text-[#8a8a8a]">Difficulty</div>
          <div className="text-lg md:text-xl font-bold capitalize">{settings.difficulty}</div>
        </div>
      </div>

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="rounded-lg border border-[#333] cursor-pointer touch-manipulation"
        style={{ maxWidth: '100%', height: 'auto' }}
      />

      {/* No plays remaining message */}
      {!canPlay && gameState !== 'playing' && (
        <div className="mt-4 p-4 bg-[#1f1f1f] rounded-lg text-center border border-[#333] mx-4">
          <div className="text-2xl mb-2">😴</div>
          <div className="text-[#e8e4de] font-bold">All done for today!</div>
          <div className="text-[#8a8a8a] text-sm">Come back tomorrow for more plays.</div>
        </div>
      )}

      {/* Instructions */}
      {canPlay && (
        <p className="text-[#8a8a8a] text-sm mt-4 text-center">
          Tap or press SPACE to jump!
        </p>
      )}

      {/* Parent Controls Modal */}
      {showParentMode && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#171717] border border-[#333] rounded-xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#e8e4de] mb-4 text-center">
              🔐 Parent Controls
            </h2>

            {!pinVerified ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm text-[#8a8a8a] mb-2 text-center">Enter PIN</label>
                  {/* PIN display dots */}
                  <div className="flex justify-center gap-3 mb-4">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all ${
                          parentPin.length > i ? 'bg-[#6b8fc9]' : 'bg-[#333]'
                        } ${pinError ? 'bg-red-500' : ''}`}
                      />
                    ))}
                  </div>
                  {pinError && <p className="text-red-500 text-sm mb-3 text-center">Wrong PIN - try again</p>}
                  {/* Number pad */}
                  <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        onClick={() => {
                          if (parentPin.length < 4) {
                            const newPin = parentPin + num;
                            setParentPin(newPin);
                            setPinError(false);
                            if (newPin.length === 4) {
                              const storedPin = localStorage.getItem(`dino-${player}-pin`) || DEFAULT_PIN;
                              if (newPin === storedPin) {
                                setPinVerified(true);
                              } else {
                                setPinError(true);
                                setTimeout(() => setParentPin(''), 500);
                              }
                            }
                          }
                        }}
                        className="w-14 h-14 rounded-xl bg-[#252525] text-[#e8e4de] text-xl font-bold active:bg-[#333] active:scale-95 transition-all"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      onClick={closeParentMode}
                      className="w-14 h-14 rounded-xl bg-[#1a1a1a] text-[#8a8a8a] text-sm font-medium active:bg-[#252525]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (parentPin.length < 4) {
                          const newPin = parentPin + '0';
                          setParentPin(newPin);
                          setPinError(false);
                          if (newPin.length === 4) {
                            const storedPin = localStorage.getItem(`dino-${player}-pin`) || DEFAULT_PIN;
                            if (newPin === storedPin) {
                              setPinVerified(true);
                            } else {
                              setPinError(true);
                              setTimeout(() => setParentPin(''), 500);
                            }
                          }
                        }
                      }}
                      className="w-14 h-14 rounded-xl bg-[#252525] text-[#e8e4de] text-xl font-bold active:bg-[#333] active:scale-95 transition-all"
                    >
                      0
                    </button>
                    <button
                      onClick={() => setParentPin(parentPin.slice(0, -1))}
                      className="w-14 h-14 rounded-xl bg-[#1a1a1a] text-[#8a8a8a] text-xl active:bg-[#252525]"
                    >
                      ⌫
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Daily Limit */}
                <div className="mb-4">
                  <label className="block text-sm text-[#8a8a8a] mb-2">
                    Daily Limit: <span className="text-[#c9a66b]">{settings.dailyLimit}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={settings.dailyLimit}
                    onChange={(e) => setSettings({ ...settings, dailyLimit: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Difficulty */}
                <div className="mb-4">
                  <label className="block text-sm text-[#8a8a8a] mb-2">Difficulty</label>
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setSettings({ ...settings, difficulty: diff })}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                          settings.difficulty === diff
                            ? 'bg-[#6b8fc9] text-white'
                            : 'bg-[#0f0f0f] text-[#8a8a8a] hover:bg-[#1f1f1f]'
                        }`}
                      >
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Today's attempts */}
                <div className="mb-4 p-3 bg-[#0f0f0f] rounded-lg">
                  <div className="text-sm text-[#8a8a8a]">
                    Today&apos;s plays: <span className="text-[#e8e4de] font-bold">{settings.attemptsToday}</span>
                  </div>
                  <button
                    onClick={() => {
                      const newSettings = { ...settings, attemptsToday: 0 };
                      saveSettings(newSettings);
                    }}
                    className="text-sm text-[#6b8fc9] hover:underline mt-1"
                  >
                    Reset count
                  </button>
                </div>

                {/* Save/Close buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={closeParentMode}
                    className="flex-1 py-2 px-4 rounded-lg bg-[#0f0f0f] text-[#8a8a8a] hover:bg-[#1f1f1f]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      saveSettings(settings);
                      closeParentMode();
                    }}
                    className="flex-1 py-2 px-4 rounded-lg bg-[#6bc98a] text-white font-medium"
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
