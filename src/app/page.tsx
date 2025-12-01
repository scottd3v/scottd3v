import Image from "next/image";
import { GlassCard } from "@/components";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-rich noise-overlay flex flex-col">
      {/* Floating orbs for atmosphere */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Centered content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative z-10">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-gradient tracking-tight">
            scottd3v
          </h1>
          <p className="text-zinc-500 mt-3 text-lg">
            Independent App Developer
          </p>
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

          {/* Contact - Direct email link */}
          <div className="animate-slide-in delay-400">
            <a
              href="mailto:scottd3v@gmail.com"
              className="block"
            >
              <div className="glass specular p-5 min-h-[100px] flex items-center gap-4 hover:bg-white/[0.08] transition-colors">
                <div className="text-3xl icon-glow">
                  <svg
                    className="w-10 h-10 text-blue-400"
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
                  <h3 className="font-semibold text-base text-white">
                    Contact
                  </h3>
                  <p className="text-sm text-zinc-400">
                    scottd3v@gmail.com
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-zinc-600 text-sm relative z-10 animate-fade-in delay-600">
        <p>© 2025 Scott Reed</p>
      </footer>
    </div>
  );
}
