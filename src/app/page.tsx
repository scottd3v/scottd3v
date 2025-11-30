import Image from "next/image";
import { GlassCard, GlassPill } from "@/components";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-bold text-white">scottd3v</h1>
        <p className="text-zinc-400 mt-1">Apps & Projects</p>
      </header>

      {/* Category Pills */}
      <nav className="px-6 pb-6">
        <div className="flex gap-3 flex-wrap">
          <GlassPill label="All" isActive />
          <GlassPill
            icon={<span className="text-amber-400">🎮</span>}
            label="Games"
          />
          <GlassPill
            icon={<span className="text-blue-400">📱</span>}
            label="Apps"
          />
          <GlassPill
            icon={<span className="text-purple-400">👤</span>}
            label="About"
          />
        </div>
      </nav>

      {/* Main Grid */}
      <main className="px-6 pb-12">
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          {/* Dead Hang Tracker - Featured App */}
          <GlassCard
            href="/dead-hang-tracker"
            icon={
              <Image
                src="/dead-hang-icon-180.png"
                alt="Dead Hang Tracker"
                width={40}
                height={40}
                className="rounded-lg"
              />
            }
            title="Dead Hang Tracker"
            subtitle="iOS & watchOS"
            isActive
            size="wide"
          />

          {/* Games Section */}
          <GlassCard
            href="/games"
            icon={<span className="text-amber-400 text-3xl">🎮</span>}
            title="Games"
            subtitle="Coming Soon"
          />

          {/* About */}
          <GlassCard
            href="/about"
            icon={<span className="text-purple-400 text-3xl">👤</span>}
            title="About"
            subtitle="Scott Reed"
          />

          {/* Contact */}
          <GlassCard
            href="/contact"
            icon={<span className="text-blue-400 text-3xl">✉️</span>}
            title="Contact"
            subtitle="Get in touch"
          />

          {/* Support */}
          <GlassCard
            href="/support"
            icon={<span className="text-green-400 text-3xl">🛟</span>}
            title="Support"
            subtitle="Help & FAQ"
          />
        </div>
      </main>

      {/* Footer Tab Bar */}
      <footer className="fixed bottom-0 left-0 right-0 p-4">
        <div className="glass-pill mx-auto max-w-xs flex justify-center gap-6 py-3 px-6">
          <a
            href="/"
            className="text-white/90 hover:text-white transition-colors"
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
            className="text-white/50 hover:text-white transition-colors"
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
            className="text-white/50 hover:text-white transition-colors"
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
      </footer>
    </div>
  );
}
