import Image from "next/image";
import { GlassCard, GlassPill } from "@/components";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-rich noise-overlay">
      {/* Floating orbs for atmosphere */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Header with dramatic entrance */}
      <header className="px-6 pt-16 pb-8 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gradient animate-fade-in tracking-tight">
          scottd3v
        </h1>
        <p className="text-zinc-500 mt-2 text-lg animate-fade-in delay-100">
          Apps, Games & Experiments
        </p>
      </header>

      {/* Category Pills with staggered entrance */}
      <nav className="px-6 pb-8 relative z-10">
        <div className="flex gap-3 flex-wrap">
          <div className="animate-fade-in-scale delay-200">
            <GlassPill label="All" isActive />
          </div>
          <div className="animate-fade-in-scale delay-300">
            <GlassPill
              icon={<span className="text-amber-400">🎮</span>}
              label="Games"
            />
          </div>
          <div className="animate-fade-in-scale delay-400">
            <GlassPill
              icon={<span className="text-blue-400">📱</span>}
              label="Apps"
            />
          </div>
          <div className="animate-fade-in-scale delay-500">
            <GlassPill
              icon={<span className="text-purple-400">👤</span>}
              label="About"
            />
          </div>
        </div>
      </nav>

      {/* Main Grid with staggered cards */}
      <main className="px-6 pb-32 relative z-10">
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          {/* Dead Hang Tracker - Featured App with glow */}
          <div className="animate-slide-in delay-300 col-span-2">
            <div className="featured-glow">
              <GlassCard
                href="/dead-hang-tracker"
                icon={
                  <Image
                    src="/dead-hang-icon-180.png"
                    alt="Dead Hang Tracker"
                    width={48}
                    height={48}
                    className="rounded-xl"
                  />
                }
                title="Dead Hang Tracker"
                subtitle="iOS & watchOS"
                isActive
                size="wide"
              />
            </div>
          </div>

          {/* Games Section */}
          <div className="animate-slide-in delay-400">
            <GlassCard
              href="/games"
              icon={<span className="text-amber-400 text-3xl icon-glow">🎮</span>}
              title="Games"
              subtitle="Coming Soon"
            />
          </div>

          {/* About */}
          <div className="animate-slide-in delay-500">
            <GlassCard
              href="/about"
              icon={<span className="text-purple-400 text-3xl icon-glow">👤</span>}
              title="About"
              subtitle="Scott Reed"
            />
          </div>

          {/* Contact */}
          <div className="animate-slide-in delay-600">
            <GlassCard
              href="/contact"
              icon={<span className="text-blue-400 text-3xl icon-glow">✉️</span>}
              title="Contact"
              subtitle="Get in touch"
            />
          </div>

          {/* Support */}
          <div className="animate-slide-in delay-700">
            <GlassCard
              href="/support"
              icon={<span className="text-green-400 text-3xl icon-glow">🛟</span>}
              title="Support"
              subtitle="Help & FAQ"
            />
          </div>
        </div>
      </main>

      {/* Floating Tab Bar */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 z-20">
        <nav className="animate-slide-in delay-700">
          <div className="glass-pill mx-auto max-w-xs flex justify-center gap-8 py-4 px-8">
            <a
              href="/"
              className="text-white hover:text-white/80 transition-all hover:scale-110"
              aria-label="Home"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </a>
            <a
              href="/about"
              className="text-white/40 hover:text-white transition-all hover:scale-110"
              aria-label="About"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </a>
            <a
              href="/contact"
              className="text-white/40 hover:text-white transition-all hover:scale-110"
              aria-label="Contact"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </a>
          </div>
        </nav>
      </footer>
    </div>
  );
}
