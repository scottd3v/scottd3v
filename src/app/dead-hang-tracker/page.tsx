import Link from "next/link";
import Image from "next/image";
import { GlassCard } from "@/components";

export const metadata = {
  title: "Dead Hang Tracker - iOS & watchOS App",
  description:
    "Track your dead hang progress with your Apple Watch. Build grip strength and improve your climbing performance.",
};

export default function DeadHangTracker() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Back Navigation */}
      <header className="px-6 pt-8 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="px-6 pb-12">
        <div className="max-w-2xl">
          {/* App Icon & Title */}
          <div className="flex items-center gap-4 mb-6">
            <Image
              src="/dead-hang-icon-180.png"
              alt="Dead Hang Tracker app icon"
              width={80}
              height={80}
              className="rounded-2xl shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">Dead Hang Tracker</h1>
              <p className="text-zinc-400">iOS & watchOS</p>
            </div>
          </div>

          {/* App Store Badge Placeholder */}
          <div className="mb-8">
            <div className="glass inline-flex items-center gap-3 px-5 py-3">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div>
                <p className="text-xs text-zinc-400">Coming Soon on the</p>
                <p className="text-lg font-semibold text-white">App Store</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-6 mb-10">
            <p className="text-lg text-zinc-300 leading-relaxed">
              Build grip strength and track your progress with Dead Hang Tracker.
              Use your Apple Watch to time your hangs, monitor improvements over time,
              and reach your climbing goals.
            </p>
          </div>

          {/* Features Grid */}
          <h2 className="text-lg font-semibold text-white mb-4">Features</h2>
          <div className="grid grid-cols-2 gap-4 mb-10">
            <GlassCard
              icon={<span className="text-2xl">⌚</span>}
              title="Apple Watch"
              subtitle="Start hangs from your wrist"
            />
            <GlassCard
              icon={<span className="text-2xl">📊</span>}
              title="Progress Tracking"
              subtitle="See your improvements"
            />
            <GlassCard
              icon={<span className="text-2xl">🎯</span>}
              title="Goals"
              subtitle="Set and achieve targets"
            />
            <GlassCard
              icon={<span className="text-2xl">📱</span>}
              title="iPhone Companion"
              subtitle="Full history & stats"
            />
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/dead-hang-tracker/privacy"
              className="glass-pill px-5 py-3 text-white hover:bg-white/10 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/support"
              className="glass-pill px-5 py-3 text-white hover:bg-white/10 transition-colors"
            >
              Support
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
