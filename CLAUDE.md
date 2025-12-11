# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal developer site for Scott Reed, hosted on Cloudflare Pages at scottd3v.com.

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript
- **Hosting:** Cloudflare Pages (via @cloudflare/next-on-pages)

## Project Structure

```
src/app/
├── page.tsx                      # Homepage - links to projects (Easter egg: click "Scott Reed" 5x)
├── dad/page.tsx                  # Parent dashboard (WebAuthn/Touch ID auth)
├── danny/                        # Danny's portal (age-based password)
│   ├── page.tsx                  # Portal with password entry (password: his age)
│   └── dino/page.tsx             # Danny's Dino Jump game
├── hank/                         # Hank's portal (age-based password)
│   ├── page.tsx                  # Portal with password entry (password: his age)
│   └── dino/page.tsx             # Hank's Dino Jump game
├── dino-game/page.tsx            # Redirect page - sends to /hank or /danny
└── support/page.tsx              # Support page (links to app-specific support)

src/components/
├── DinoGame.tsx                  # Reusable dino game component with player props
└── ...
```

## Pages

### Homepage (`/`)
Simple landing page with links to projects and contact info.
**Easter Egg:** Click "Scott Reed" in the footer 5 times to access `/dad`.

### Dad Dashboard (`/dad`)
Parent control center with WebAuthn (Touch ID) authentication.
- View Danny and Hank's game stats
- Quick settings for daily limits and difficulty
- Reference guide for Easter eggs and features
- Passphrase fallback if WebAuthn unavailable

### Kid Portals (`/danny`, `/hank`)
Age-protected portals for each kid.
- **Password:** Their current age (Danny: 6, Hank: 4)
- Passwords update automatically on birthdays
- Session persists in sessionStorage until tab closes
- Mobile: Full-screen touch-friendly interface with number pad
- Desktop: MacBook Air bezel-wrapped "virtual computer" aesthetic
- Links to their personalized Dino Jump game

### Dino Jump (`/danny/dino`, `/hank/dino`)
Chrome Dino-style jumping game with per-player settings.

**Features:**
- Dark mode Chrome Dino visual style (moon, stars, pixelated sprites)
- Per-player profiles with localStorage persistence
- Parent controls (PIN protected, accessed by clicking timer 7x)
  - Daily play limits ("energy" system)
  - Difficulty settings (Easy/Medium/Hard)
  - Reset attempts
  - Change PIN (stored per-player)
- "Scare screen" if kids guess wrong PIN 3 times
- Streak tracking and welcome back messages
- Session timer with color changes
- Bonus play system when energy depleted

**Default Settings:**
| Player | Difficulty | Daily Limit | Birthday         |
|--------|------------|-------------|------------------|
| Danny  | Medium     | 10          | Jan 15, 2019     |
| Hank   | Easy       | 10          | Nov 30, 2020     |

**Difficulty Settings:**
| Level  | Speed | Obstacle Interval |
|--------|-------|-------------------|
| Easy   | 6     | 1200ms            |
| Medium | 8     | 900ms             |
| Hard   | 10    | 700ms             |

**Parent Controls Access:**
Click the timer in the top-right corner 7 times quickly. Default PIN: `1234` (per player).

### Support (`/support`)
General support page with email contact and links to app-specific support pages (e.g., hanghabit.com/support).

## Related Projects

- **Hang Habit** (hanghabit.com) - Dead hang tracker app landing page, privacy policy, and support. Separate repo at `~/Projects/hanghabit`.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint

# Cloudflare Pages deployment (auto-deploys on push to main)
npx @cloudflare/next-on-pages  # Build for Cloudflare
```

## Architecture Notes

**Components:** Barrel exported from `src/components/index.ts`. Import shared components via `@/components`:
```typescript
import { GlassCard, GlassPill } from "@/components";
```

**Client Components:** Pages using React hooks (useState, useEffect) or browser APIs (localStorage, sessionStorage) must have `'use client'` directive.

**Special Dependencies:**
- `react-split-flap` - Animated split-flap display on homepage

## Design System

Dark theme with glass morphism effects:
- CSS variables defined in `globals.css` (`--text-primary`, `--accent-coral`, `--accent-teal`, etc.)
- Glass card components with blur and specular highlights
- Animated gradient background with floating orbs

## Deployment

Auto-deploys to Cloudflare Pages on push to main. The `wrangler` dev dependency is included for Cloudflare tooling.

## Easter Eggs Reference

| Location | Trigger | Action |
|----------|---------|--------|
| Homepage footer | Click "Scott Reed" 5x | Navigate to `/dad` |
| Dino game timer | Click timer 7x | Open parent controls |

## LocalStorage Keys

```
dino-danny                  # Danny's game settings and stats
dino-hank                   # Hank's game settings and stats
dino-danny-parent-pin       # Danny's parent PIN
dino-hank-parent-pin        # Hank's parent PIN
dino-lockout                # Lockout timestamp after failed PIN attempts
webauthn-credential-id      # Dad's WebAuthn credential
```
