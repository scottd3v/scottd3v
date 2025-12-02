'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Types
interface PlayerSettings {
  dailyLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  attemptsToday: number;
  lastPlayDate: string;
  highScore: number;
}

interface GameState {
  isRunning: boolean;
  isGameOver: boolean;
  score: number;
  dinoY: number;
  dinoVelocity: number;
  obstacles: { x: number; width: number; height: number; type: 'cactus' | 'bird' }[];
  groundOffset: number;
  clouds: { x: number; y: number }[];
}

// Constants
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const GROUND_Y = 200;
const DINO_WIDTH = 44;
const DINO_HEIGHT = 47;
const GAME_WIDTH = 600;
const GAME_HEIGHT = 250;

const DIFFICULTY_SETTINGS = {
  easy: { speed: 4, obstacleInterval: 2000, label: 'Easy (for Hank!)' },
  medium: { speed: 6, obstacleInterval: 1500, label: 'Medium' },
  hard: { speed: 8, obstacleInterval: 1000, label: 'Hard (for Danny!)' },
};

const DEFAULT_SETTINGS: PlayerSettings = {
  dailyLimit: 10,
  difficulty: 'easy',
  attemptsToday: 0,
  lastPlayDate: '',
  highScore: 0,
};

const DEFAULT_PIN = '1234';

// Helper to get/set parent PIN
const getParentPin = (): string => {
  if (typeof window === 'undefined') return DEFAULT_PIN;
  return localStorage.getItem('dino-parent-pin') || DEFAULT_PIN;
};

const setParentPinStorage = (pin: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('dino-parent-pin', pin);
};

// Helper to get/set lockout time
const getLockoutTime = (): number => {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem('dino-lockout') || '0', 10);
};

const setLockoutTime = (time: number) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('dino-lockout', time.toString());
};

// Scary messages for when kids try to hack
const SCARY_MESSAGES = [
  "ALERT: Suspicious activity detected...",
  "Sending notification to Mom and Dad...",
  "Recording screen activity...",
  "Saving evidence...",
  "Parents will be notified in:",
];

// Helper to get today's date string
const getTodayString = () => new Date().toISOString().split('T')[0];

// Helper to load player settings from localStorage
const loadPlayerSettings = (player: string): PlayerSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const saved = localStorage.getItem(`dino-${player}`);
  if (!saved) return DEFAULT_SETTINGS;
  const settings = JSON.parse(saved) as PlayerSettings;
  // Reset attempts if it's a new day
  if (settings.lastPlayDate !== getTodayString()) {
    settings.attemptsToday = 0;
    settings.lastPlayDate = getTodayString();
  }
  return settings;
};

// Helper to save player settings
const savePlayerSettings = (player: string, settings: PlayerSettings) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`dino-${player}`, JSON.stringify(settings));
};

export default function DinoGamePage() {
  // State
  const [currentPlayer, setCurrentPlayer] = useState<'hank' | 'danny' | null>(null);
  const [settings, setSettings] = useState<PlayerSettings>(DEFAULT_SETTINGS);
  const [showParentMode, setShowParentMode] = useState(false);
  const [parentClickCount, setParentClickCount] = useState(0);
  const [parentPin, setParentPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showScareScreen, setShowScareScreen] = useState(false);
  const [scareCountdown, setScareCountdown] = useState(10);
  const [scareMessageIndex, setScareMessageIndex] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [pinVerified, setPinVerified] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [gameState, setGameState] = useState<GameState>({
    isRunning: false,
    isGameOver: false,
    score: 0,
    dinoY: GROUND_Y,
    dinoVelocity: 0,
    obstacles: [],
    groundOffset: 0,
    clouds: [
      { x: 100, y: 50 },
      { x: 300, y: 80 },
      { x: 500, y: 40 },
    ],
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastObstacleRef = useRef<number>(0);
  const parentClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for lockout on mount and when opening parent mode
  useEffect(() => {
    const checkLockout = () => {
      const lockoutUntil = getLockoutTime();
      const now = Date.now();
      if (lockoutUntil > now) {
        setIsLockedOut(true);
        setLockoutRemaining(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setIsLockedOut(false);
        setLockoutRemaining(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle scare screen countdown
  useEffect(() => {
    if (!showScareScreen) return;

    // Progress through scary messages
    const messageInterval = setInterval(() => {
      setScareMessageIndex((prev) => Math.min(prev + 1, SCARY_MESSAGES.length - 1));
    }, 1500);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setScareCountdown((prev) => {
        if (prev <= 1) {
          // Lock out for 2 minutes
          const lockoutUntil = Date.now() + 2 * 60 * 1000;
          setLockoutTime(lockoutUntil);
          setIsLockedOut(true);
          setLockoutRemaining(120);
          setShowScareScreen(false);
          setShowParentMode(false);
          setScareCountdown(10);
          setScareMessageIndex(0);
          setFailedAttempts(0);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(countdownInterval);
    };
  }, [showScareScreen]);

  // Select player and load their settings
  const selectPlayer = useCallback((player: 'hank' | 'danny') => {
    const loaded = loadPlayerSettings(player);
    setSettings(loaded);
    setCurrentPlayer(player);
  }, []);

  // Check remaining attempts
  const remainingAttempts = settings.dailyLimit - settings.attemptsToday;
  const canPlay = remainingAttempts > 0;

  // Get difficulty settings
  const difficultyConfig = DIFFICULTY_SETTINGS[settings.difficulty];

  // Handle parent mode Easter egg (click score 7 times quickly)
  const handleScoreClick = () => {
    setParentClickCount((prev) => prev + 1);

    if (parentClickTimeoutRef.current) {
      clearTimeout(parentClickTimeoutRef.current);
    }

    parentClickTimeoutRef.current = setTimeout(() => {
      setParentClickCount(0);
    }, 2000);

    if (parentClickCount >= 6) {
      setShowParentMode(true);
      setParentClickCount(0);
    }
  };

  // Verify parent PIN
  const verifyPin = () => {
    const correctPin = getParentPin();
    if (parentPin === correctPin) {
      setPinError(false);
      setPinVerified(true);
      setFailedAttempts(0);
      return true;
    }

    // Wrong PIN!
    setPinError(true);
    const newFailedAttempts = failedAttempts + 1;
    setFailedAttempts(newFailedAttempts);

    // After 3 failed attempts, trigger scare screen
    if (newFailedAttempts >= 3) {
      setShowScareScreen(true);
      setScareCountdown(10);
      setScareMessageIndex(0);
    }

    return false;
  };

  // Change PIN
  const changePin = () => {
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      return; // PIN must be 4 digits
    }
    if (newPin !== confirmPin) {
      return; // PINs must match
    }
    setParentPinStorage(newPin);
    setShowChangePinModal(false);
    setNewPin('');
    setConfirmPin('');
  };

  // Reset attempts (parent only)
  const resetAttempts = () => {
    if (!verifyPin() || !currentPlayer) return;

    const newSettings = {
      ...settings,
      attemptsToday: 0,
      lastPlayDate: getTodayString(),
    };
    setSettings(newSettings);
    savePlayerSettings(currentPlayer, newSettings);
    setParentPin('');
  };

  // Start game
  const startGame = useCallback(() => {
    if (!canPlay || !currentPlayer) return;

    // Increment attempts
    const newSettings = {
      ...settings,
      attemptsToday: settings.attemptsToday + 1,
      lastPlayDate: getTodayString(),
    };
    setSettings(newSettings);
    savePlayerSettings(currentPlayer, newSettings);

    setGameState({
      isRunning: true,
      isGameOver: false,
      score: 0,
      dinoY: GROUND_Y,
      dinoVelocity: 0,
      obstacles: [],
      groundOffset: 0,
      clouds: [
        { x: 100, y: 50 },
        { x: 300, y: 80 },
        { x: 500, y: 40 },
      ],
    });
    lastObstacleRef.current = Date.now();
  }, [canPlay, currentPlayer, settings]);

  // Jump
  const jump = useCallback(() => {
    if (!gameState.isRunning || gameState.isGameOver) {
      if (gameState.isGameOver || !gameState.isRunning) {
        startGame();
      }
      return;
    }

    // Only jump if on ground
    if (gameState.dinoY >= GROUND_Y - 1) {
      setGameState((prev) => ({
        ...prev,
        dinoVelocity: JUMP_FORCE,
      }));
    }
  }, [gameState.isRunning, gameState.isGameOver, gameState.dinoY, startGame]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  // Save high score - called from game loop on collision
  const handleGameOver = useCallback((finalScore: number) => {
    if (!currentPlayer) return;

    const roundedScore = Math.floor(finalScore);
    if (roundedScore > settings.highScore) {
      const newSettings = {
        ...settings,
        highScore: roundedScore,
      };
      // Save to localStorage immediately
      savePlayerSettings(currentPlayer, newSettings);
      // Schedule state update
      setTimeout(() => setSettings(newSettings), 0);
    }
  }, [currentPlayer, settings]);

  // Game loop
  useEffect(() => {
    if (!gameState.isRunning || gameState.isGameOver) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    const gameLoop = () => {
      setGameState((prev) => {
        // Update dino position
        let newDinoY = prev.dinoY + prev.dinoVelocity;
        let newVelocity = prev.dinoVelocity + GRAVITY;

        // Ground collision
        if (newDinoY >= GROUND_Y) {
          newDinoY = GROUND_Y;
          newVelocity = 0;
        }

        // Move obstacles
        const speed = difficultyConfig.speed;
        const newObstacles = prev.obstacles
          .map((obs) => ({ ...obs, x: obs.x - speed }))
          .filter((obs) => obs.x > -50);

        // Add new obstacles
        const now = Date.now();
        if (now - lastObstacleRef.current > difficultyConfig.obstacleInterval) {
          const isBird = Math.random() > 0.7 && prev.score > 5;
          newObstacles.push({
            x: GAME_WIDTH,
            width: isBird ? 40 : 20 + Math.random() * 20,
            height: isBird ? 30 : 35 + Math.random() * 20,
            type: isBird ? 'bird' : 'cactus',
          });
          lastObstacleRef.current = now;
        }

        // Move ground
        const newGroundOffset = (prev.groundOffset + speed) % 20;

        // Move clouds
        const newClouds = prev.clouds.map((cloud) => ({
          x: cloud.x - speed * 0.3 < -50 ? GAME_WIDTH + 50 : cloud.x - speed * 0.3,
          y: cloud.y,
        }));

        // Check collision
        const dinoLeft = 50;
        const dinoRight = dinoLeft + DINO_WIDTH - 10;
        const dinoTop = newDinoY - DINO_HEIGHT + 10;
        const dinoBottom = newDinoY;

        let collision = false;
        for (const obs of newObstacles) {
          const obsTop = obs.type === 'bird' ? GROUND_Y - 60 : GROUND_Y - obs.height;
          const obsBottom = obs.type === 'bird' ? GROUND_Y - 30 : GROUND_Y;
          const obsLeft = obs.x;
          const obsRight = obs.x + obs.width;

          if (
            dinoRight > obsLeft &&
            dinoLeft < obsRight &&
            dinoBottom > obsTop &&
            dinoTop < obsBottom
          ) {
            collision = true;
            break;
          }
        }

        if (collision) {
          // Save high score on collision (called outside setState)
          setTimeout(() => handleGameOver(prev.score), 0);
          return {
            ...prev,
            isGameOver: true,
            isRunning: false,
          };
        }

        return {
          ...prev,
          dinoY: newDinoY,
          dinoVelocity: newVelocity,
          obstacles: newObstacles,
          groundOffset: newGroundOffset,
          clouds: newClouds,
          score: prev.score + 0.1,
        };
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isRunning, gameState.isGameOver, difficultyConfig, handleGameOver]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw clouds
    ctx.fillStyle = '#e0e0e0';
    gameState.clouds.forEach((cloud) => {
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
      ctx.arc(cloud.x + 25, cloud.y - 5, 15, 0, Math.PI * 2);
      ctx.arc(cloud.x + 25, cloud.y + 10, 12, 0, Math.PI * 2);
      ctx.arc(cloud.x + 45, cloud.y, 18, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw ground
    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + 5);
    ctx.lineTo(GAME_WIDTH, GROUND_Y + 5);
    ctx.stroke();

    // Draw ground texture
    for (let i = 0; i < GAME_WIDTH; i += 20) {
      const x = (i - gameState.groundOffset + GAME_WIDTH) % GAME_WIDTH;
      ctx.fillStyle = '#535353';
      ctx.fillRect(x, GROUND_Y + 8, 3, 2);
      ctx.fillRect(x + 10, GROUND_Y + 12, 2, 2);
    }

    // Draw dinosaur
    const dinoX = 50;
    const dinoY = gameState.dinoY;

    ctx.fillStyle = '#535353';

    // Body
    ctx.fillRect(dinoX, dinoY - 40, 30, 35);

    // Head
    ctx.fillRect(dinoX + 20, dinoY - 47, 24, 22);

    // Eye
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(dinoX + 36, dinoY - 43, 4, 4);

    // Legs (animated when running)
    ctx.fillStyle = '#535353';
    if (gameState.isRunning && !gameState.isGameOver) {
      const legOffset = Math.floor(Date.now() / 100) % 2;
      if (legOffset === 0) {
        ctx.fillRect(dinoX + 5, dinoY - 5, 6, 10);
        ctx.fillRect(dinoX + 18, dinoY - 5, 6, 5);
      } else {
        ctx.fillRect(dinoX + 5, dinoY - 5, 6, 5);
        ctx.fillRect(dinoX + 18, dinoY - 5, 6, 10);
      }
    } else {
      ctx.fillRect(dinoX + 5, dinoY - 5, 6, 8);
      ctx.fillRect(dinoX + 18, dinoY - 5, 6, 8);
    }

    // Tail
    ctx.fillRect(dinoX - 10, dinoY - 30, 15, 8);
    ctx.fillRect(dinoX - 15, dinoY - 25, 8, 6);

    // Arm
    ctx.fillRect(dinoX + 25, dinoY - 25, 8, 4);

    // Draw obstacles
    gameState.obstacles.forEach((obs) => {
      ctx.fillStyle = '#535353';
      if (obs.type === 'cactus') {
        // Main stem
        ctx.fillRect(obs.x, GROUND_Y - obs.height, obs.width, obs.height);
        // Arms
        ctx.fillRect(obs.x - 8, GROUND_Y - obs.height + 10, 8, 4);
        ctx.fillRect(obs.x - 8, GROUND_Y - obs.height + 10, 4, 15);
        ctx.fillRect(obs.x + obs.width, GROUND_Y - obs.height + 15, 8, 4);
        ctx.fillRect(obs.x + obs.width + 4, GROUND_Y - obs.height + 15, 4, 12);
      } else {
        // Bird
        const birdY = GROUND_Y - 50;
        ctx.fillRect(obs.x, birdY, 35, 15);
        ctx.fillRect(obs.x + 25, birdY - 5, 15, 10);
        // Wings (animated)
        const wingOffset = Math.floor(Date.now() / 150) % 2;
        if (wingOffset === 0) {
          ctx.fillRect(obs.x + 5, birdY - 10, 20, 5);
        } else {
          ctx.fillRect(obs.x + 5, birdY + 15, 20, 5);
        }
      }
    });

    // Draw game over or start message
    if (!gameState.isRunning) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.fillStyle = '#535353';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';

      if (gameState.isGameOver) {
        ctx.fillText('GAME OVER!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
        ctx.font = '16px Arial';
        ctx.fillText(`Score: ${Math.floor(gameState.score)}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10);
        if (canPlay) {
          ctx.fillText('Tap or press SPACE to play again', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
        }
      } else if (canPlay) {
        ctx.fillText('Tap or press SPACE to start!', GAME_WIDTH / 2, GAME_HEIGHT / 2);
      }
    }
  }, [gameState, canPlay]);

  // Player Selection Screen
  if (!currentPlayer) {
    return (
      <div className="bg-gradient-rich noise-overlay min-h-screen">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl font-bold text-gradient mb-4">Dino Jump!</h1>
            <p className="text-[var(--text-secondary)] text-lg">Who&apos;s playing today?</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 animate-fade-in delay-200">
            <button
              onClick={() => selectPlayer('hank')}
              className="glass specular featured-glow px-12 py-8 text-center group"
            >
              <div className="text-6xl mb-4">🦖</div>
              <div className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-green)]">
                Hank
              </div>
              <div className="text-sm text-[var(--text-secondary)] mt-2">4 years old</div>
            </button>

            <button
              onClick={() => selectPlayer('danny')}
              className="glass specular featured-glow px-12 py-8 text-center group"
            >
              <div className="text-6xl mb-4">🦕</div>
              <div className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)]">
                Danny
              </div>
              <div className="text-sm text-[var(--text-secondary)] mt-2">5 years old</div>
            </button>
          </div>

          <p className="text-[var(--text-secondary)] text-xs mt-12 animate-fade-in delay-400">
            Made with love by Dad
          </p>
        </main>
      </div>
    );
  }

  // Game Screen
  return (
    <div className="bg-gradient-rich noise-overlay min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in">
          <button
            onClick={() => setCurrentPlayer(null)}
            className="text-[var(--text-secondary)] text-sm hover:text-[var(--text-primary)] mb-2 transition-colors"
          >
            ← Switch Player
          </button>
          <h1 className="text-3xl font-bold text-gradient">
            {currentPlayer === 'hank' ? '🦖 Hank' : '🦕 Danny'}&apos;s Dino Jump
          </h1>
        </div>

        {/* Score and Stats */}
        <div
          className="glass-pill px-6 py-3 mb-6 flex items-center gap-6 cursor-pointer select-none animate-fade-in delay-100"
          onClick={handleScoreClick}
          title="Click here 7 times for parent mode"
        >
          <div className="text-center">
            <div className="text-xs text-[var(--text-secondary)]">Score</div>
            <div className="text-xl font-bold text-[var(--accent-gold)]">{Math.floor(gameState.score)}</div>
          </div>
          <div className="w-px h-8 bg-[var(--glass-border)]" />
          <div className="text-center">
            <div className="text-xs text-[var(--text-secondary)]">High Score</div>
            <div className="text-xl font-bold text-[var(--accent-purple)]">{settings.highScore}</div>
          </div>
          <div className="w-px h-8 bg-[var(--glass-border)]" />
          <div className="text-center">
            <div className="text-xs text-[var(--text-secondary)]">Plays Left</div>
            <div className={`text-xl font-bold ${remainingAttempts <= 3 ? 'text-red-500' : 'text-[var(--accent-green)]'}`}>
              {remainingAttempts}
            </div>
          </div>
        </div>

        {/* Difficulty Badge */}
        <div className="glass-pill px-4 py-1 mb-4 text-sm text-[var(--text-secondary)] animate-fade-in delay-200">
          {difficultyConfig.label}
        </div>

        {/* Game Canvas */}
        <div
          className="glass p-4 animate-fade-in delay-300"
          onClick={jump}
          onTouchStart={(e) => { e.preventDefault(); jump(); }}
        >
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="rounded-lg cursor-pointer"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        {/* No plays remaining message */}
        {!canPlay && (
          <div className="glass px-6 py-4 mt-6 text-center animate-fade-in">
            <div className="text-2xl mb-2">😴</div>
            <div className="text-[var(--text-primary)] font-bold">All done for today!</div>
            <div className="text-sm text-[var(--text-secondary)]">
              Come back tomorrow for more fun!
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-6 text-sm text-[var(--text-secondary)] animate-fade-in delay-400">
          <p>Press SPACE, tap, or click to jump!</p>
          <p className="mt-1">Jump over the cacti and birds!</p>
        </div>

        {/* Scare Screen - shown when kids try wrong PIN too many times */}
        {showScareScreen && (
          <div className="fixed inset-0 bg-red-900/95 flex items-center justify-center z-[100] p-4 animate-pulse">
            <div className="text-center max-w-md">
              <div className="text-8xl mb-6 animate-bounce">
                {scareMessageIndex < 3 ? '🚨' : '👀'}
              </div>
              <div className="text-red-200 text-xl font-bold mb-4 min-h-[60px]">
                {SCARY_MESSAGES[scareMessageIndex]}
              </div>
              {scareMessageIndex >= SCARY_MESSAGES.length - 1 && (
                <div className="text-6xl font-bold text-white animate-pulse">
                  {scareCountdown}
                </div>
              )}
              <div className="mt-8 text-red-300 text-sm">
                Nice try! But this is for parents only.
              </div>
            </div>
          </div>
        )}

        {/* Parent Mode Modal */}
        {showParentMode && !showScareScreen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="glass p-8 max-w-md w-full animate-fade-in-scale max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 text-center">
                Parent Controls
              </h2>

              {/* Lockout message */}
              {isLockedOut && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-center">
                  <div className="text-4xl mb-2">🔒</div>
                  <div className="text-red-400 font-bold">Access Locked</div>
                  <div className="text-red-300 text-sm mt-1">
                    Too many wrong attempts. Try again in {Math.floor(lockoutRemaining / 60)}:{(lockoutRemaining % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              )}

              {/* PIN Entry - only show if not verified and not locked out */}
              {!pinVerified && !isLockedOut && (
                <div className="mb-6">
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">
                    Enter PIN {failedAttempts > 0 && <span className="text-red-400">({3 - failedAttempts} attempts left)</span>}
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={parentPin}
                    onChange={(e) => { setParentPin(e.target.value.replace(/\D/g, '')); setPinError(false); }}
                    className={`w-full bg-[var(--glass-bg)] border ${pinError ? 'border-red-500' : 'border-[var(--glass-border)]'} rounded-lg px-4 py-3 text-[var(--text-primary)] text-center text-2xl tracking-widest focus:outline-none focus:border-[var(--accent-blue)]`}
                    placeholder="••••"
                    maxLength={4}
                  />
                  {pinError && (
                    <p className="text-red-500 text-sm mt-1 text-center">
                      Wrong PIN! {failedAttempts >= 2 ? '⚠️ Last chance!' : 'Try again.'}
                    </p>
                  )}
                  <button
                    onClick={() => verifyPin()}
                    disabled={parentPin.length !== 4}
                    className="w-full mt-3 py-3 px-4 rounded-lg bg-[var(--accent-blue)] text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Unlock
                  </button>
                </div>
              )}

              {/* Settings - only show if PIN verified */}
              {pinVerified && (
                <>
                  <div className="mb-6">
                    <label className="block text-sm text-[var(--text-secondary)] mb-2">
                      Daily Play Limit: <span className="text-[var(--accent-gold)]">{settings.dailyLimit}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={settings.dailyLimit}
                      onChange={(e) => setSettings({ ...settings, dailyLimit: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                      <span>0 (No plays)</span>
                      <span>50</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm text-[var(--text-secondary)] mb-2">
                      Difficulty
                    </label>
                    <div className="flex gap-2">
                      {(['easy', 'medium', 'hard'] as const).map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setSettings({ ...settings, difficulty: diff })}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            settings.difficulty === diff
                              ? 'bg-[var(--accent-blue)] text-white'
                              : 'bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:bg-[var(--glass-hover)]'
                          }`}
                        >
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6 p-4 bg-[var(--glass-bg)] rounded-lg">
                    <div className="text-sm text-[var(--text-secondary)]">
                      Today&apos;s attempts: <span className="text-[var(--text-primary)] font-bold">{settings.attemptsToday}</span>
                    </div>
                    <button
                      onClick={resetAttempts}
                      className="text-sm text-[var(--accent-blue)] hover:underline mt-2"
                    >
                      Reset today&apos;s count
                    </button>
                  </div>

                  <div className="mb-6">
                    <button
                      onClick={() => setShowChangePinModal(true)}
                      className="w-full py-2 px-4 rounded-lg bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:bg-[var(--glass-hover)] transition-all text-sm"
                    >
                      🔐 Change Parent PIN
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowParentMode(false);
                        setParentPin('');
                        setPinError(false);
                        setPinVerified(false);
                        setFailedAttempts(0);
                      }}
                      className="flex-1 py-3 px-4 rounded-lg bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:bg-[var(--glass-hover)] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (currentPlayer) {
                          savePlayerSettings(currentPlayer, settings);
                          setShowParentMode(false);
                          setParentPin('');
                          setPinVerified(false);
                          setFailedAttempts(0);
                        }
                      }}
                      className="flex-1 py-3 px-4 rounded-lg bg-[var(--accent-green)] text-white font-medium hover:opacity-90 transition-all"
                    >
                      Save Settings
                    </button>
                  </div>
                </>
              )}

              {/* Close button for locked out state */}
              {(isLockedOut || (!pinVerified && !isLockedOut)) && (
                <button
                  onClick={() => {
                    setShowParentMode(false);
                    setParentPin('');
                    setPinError(false);
                  }}
                  className="w-full mt-4 py-3 px-4 rounded-lg bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:bg-[var(--glass-hover)] transition-all"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        )}

        {/* Change PIN Modal */}
        {showChangePinModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
            <div className="glass p-6 max-w-sm w-full animate-fade-in-scale">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 text-center">
                Change PIN
              </h3>

              <div className="mb-4">
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  New PIN (4 digits)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg px-4 py-3 text-[var(--text-primary)] text-center text-2xl tracking-widest focus:outline-none focus:border-[var(--accent-blue)]"
                  placeholder="••••"
                  maxLength={4}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className={`w-full bg-[var(--glass-bg)] border ${confirmPin.length === 4 && newPin !== confirmPin ? 'border-red-500' : 'border-[var(--glass-border)]'} rounded-lg px-4 py-3 text-[var(--text-primary)] text-center text-2xl tracking-widest focus:outline-none focus:border-[var(--accent-blue)]`}
                  placeholder="••••"
                  maxLength={4}
                />
                {confirmPin.length === 4 && newPin !== confirmPin && (
                  <p className="text-red-500 text-sm mt-1 text-center">PINs don&apos;t match</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowChangePinModal(false); setNewPin(''); setConfirmPin(''); }}
                  className="flex-1 py-3 px-4 rounded-lg bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:bg-[var(--glass-hover)] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={changePin}
                  disabled={newPin.length !== 4 || newPin !== confirmPin}
                  className="flex-1 py-3 px-4 rounded-lg bg-[var(--accent-green)] text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save PIN
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
