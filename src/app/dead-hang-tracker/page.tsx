import Link from "next/link";
import Image from "next/image";

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://scottd3v.com"),
  title: "Dead Hang Tracker - iOS & watchOS App",
  description:
    "Decompress your spine. Decompress your life. One minute a day keeps the back pain away.",
  openGraph: {
    title: "Dead Hang Tracker",
    description: "Decompress your spine. Decompress your life.",
    images: [
      {
        url: "/dead-hang-icon.png",
        width: 512,
        height: 512,
        alt: "Dead Hang Tracker app icon",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Dead Hang Tracker",
    description: "Decompress your spine. Decompress your life.",
    images: ["/dead-hang-icon.png"],
  },
};

// Feature card component
function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
    </div>
  );
}

export default function DeadHangTracker() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <main className="px-6 pb-8 max-w-3xl mx-auto">

        {/* ===== 1) HERO SECTION ===== */}
        <section className="text-center pt-8 pb-16">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 transition-colors mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back</span>
          </Link>

          {/* App Icon */}
          <div className="flex justify-center mb-4">
            <Image
              src="/dead-hang-icon-180.png"
              alt="Dead Hang Tracker app icon"
              width={100}
              height={100}
              className="rounded-2xl shadow-lg"
            />
          </div>

          {/* Title */}
          <h1
            className="text-lg font-medium mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            Dead Hang Tracker for iOS & Apple Watch
          </h1>

          {/* Hook */}
          <p
            className="text-lg italic"
            style={{ color: 'var(--accent-coral)' }}
          >
            One minute a day keeps the back pain away.
          </p>
        </section>

        {/* ===== 2) BACKSTORY SECTION ===== */}
        <section className="mb-12">
          <h2
            className="text-sm font-semibold uppercase tracking-wide mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Why this app exists
          </h2>
          <p
            className="text-base leading-relaxed mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            In college, I was hit by a car on my Honda Spree. My back took damage I wouldn&apos;t
            feel for years. Not until I had three kids who wanted to climb all over me. The days
            I hang for a minute or more, I feel better. I move better. I can be there for them.
          </p>
          <p
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Decompress your spine.{' '}
            <span style={{ color: 'var(--accent-teal)' }}>Decompress your life.</span>
          </p>
        </section>

        {/* ===== MAXIMIZE YOUR MINUTE ===== */}
        <section className="mb-12">
          <p
            className="text-base leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            If you only have a minute to work out, make it count. Dead hangs are one of the
            best exercises for spinal decompression. No gym. No equipment. Just you and
            something to hang from.
          </p>
        </section>

        {/* ===== 3) FEATURES GRID ===== */}
        <section className="mb-12">
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Built for busy parents (and everyone else)
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <FeatureCard
              icon={<span>⌚</span>}
              title="Just Grab and Hang"
              description="Watch detects hanging and starts automatically. No buttons needed."
            />
            <FeatureCard
              icon={<span>🫀</span>}
              title="Haptic Coaching"
              description="Four modes: Gentle, Heartbeat, Coach, and Drummer."
            />
            <FeatureCard
              icon={<span>🧱</span>}
              title="Build Your Wall"
              description="Every minute is a brick. Watch your progress stack up."
            />
            <FeatureCard
              icon={<span>🏆</span>}
              title="PR Celebration"
              description="Tension builds as you approach your record. Beat it and celebrate."
            />
            <FeatureCard
              icon={<span>📱</span>}
              title="No Watch? No Problem"
              description="Manual timer on iPhone. Dynamic Island support."
            />
            <FeatureCard
              icon={<span>🤲</span>}
              title="Track Your Grip"
              description="Log grip types: dead hang, half crimp, full crimp, open hand."
            />
          </div>
        </section>

        {/* ===== 4) APP STORE CTA ===== */}
        <section className="text-center py-10 mb-12">
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Coming soon on the App Store
          </h2>
          <div className="glass inline-flex items-center gap-3 px-5 py-3">
            <svg className="w-8 h-8" style={{ color: 'var(--text-primary)' }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>App Store</span>
          </div>
        </section>

        {/* ===== 5) POEM SECTION ===== */}
        <section className="text-center mb-12">
          {/* Family Illustration */}
          <Image
            src="/family.svg"
            alt="Illustration of a dad hanging from a bar with three kids below"
            width={300}
            height={225}
            className="w-full max-w-[200px] mx-auto mb-6 opacity-90"
          />

          <h2
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: 'var(--text-muted)' }}
          >
            For my kids
          </h2>

          <div
            className="text-base md:text-lg leading-snug italic space-y-1"
            style={{ color: 'var(--accent-teal)' }}
          >
            <p>A five and a four and a baby makes three.</p>
            <p>They climb and they pull and they hang onto me.</p>
            <p>So I hang every day, decompress head to toe,</p>
            <p>So I&apos;m ready to play wherever they go.</p>
          </div>

          <div
            className="text-base md:text-lg leading-snug italic space-y-1 mt-6"
            style={{ color: 'var(--accent-coral)' }}
          >
            <p>A bar, a branch, a doorframe will do.</p>
            <p>A playground, a beam, there&apos;s always a view.</p>
            <p>You can hang in the morning, you can hang in the night.</p>
            <p>You can hang for a minute and you&apos;ll feel just right.</p>
          </div>

          <p
            className="text-lg font-semibold mt-8"
            style={{ color: 'var(--text-primary)' }}
          >
            I hang for them so I can hang with them.
          </p>
        </section>

        {/* ===== 6) FOOTER LINKS ===== */}
        <footer className="text-center pt-8 pb-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex justify-center gap-6">
            <Link
              href="/dead-hang-tracker/privacy"
              className="text-xs transition-colors hover:underline"
              style={{ color: 'var(--text-muted)' }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/support"
              className="text-xs transition-colors hover:underline"
              style={{ color: 'var(--text-muted)' }}
            >
              Support
            </Link>
          </div>
        </footer>

      </main>
    </div>
  );
}
